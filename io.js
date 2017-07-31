/**
 * @fileoverview io请求总a
 */
require('whatwg-fetch');
const IoConfig = require('./ioconfig');
const extend = require('extend');
const querystring = require('querystring');

/**
 * 将data格式化成FormData
 * @param  {JSON} data [description]
 * @return {FormData}      [description]
 */
function formatFormData(data){
    var _formdata = new FormData();
    for(var key in data){
        var val = data[key];
        if(val == undefined){
            continue;
        }else if(val.constructor == Array){
            val.forEach(function(v,i){
                _formdata.append(key,v);
            });
            continue;
        }else{
            _formdata.append(key,val);
        }
    }
    return _formdata;
}

module.exports = {
    /**
     * 发起io请求
     * @param  {JSON} ioparams 同ioconfig.ioparams
     * @return {[type]}          [description]
     */
    request: function(ioparams) {
        if(ioparams.url == ''){
            throw new Error('io参数url不能为空');
            return;
        }
        var conf = {};

        extend(true,conf,IoConfig.ioparams,ioparams);

        conf.request.method = conf.request.method.toUpperCase();

        //检测ioparams里的data
        var body = conf.data, _method = conf.request.method;

        if(body && body.constructor === Object){ //说明data是json
            if(_method != 'GET' && _method != 'HEAD' && conf.isformdata){
                body = formatFormData(body);
                delete conf.headers['Content-Type'];
            }else{
                body = querystring.stringify(body);
            }
        }

        if(conf.headers['Content-Type'] === false){
            delete conf.headers['Content-Type'];
        }

        //赋值request.body
        if(body){
            switch(_method){
                case 'GET':
                    if(typeof body == 'string'){
                        conf.url += '?'+body.toString();
                    }
                    break;
                case 'HEAD':
                    break;
                default:
                    conf.request.body = body;
                    break;
            }
        }

        //发起请求
        conf.request.headers = conf.headers;
        var myrequest = new Request(conf.url,conf.request);

        //请求发起前统一处理
        conf.beforeSend();

        var race = Promise.race([
            fetch(myrequest),
            new Promise(function(resolve,reject){
                setTimeout(reject,conf.timeout,new Error('请求超时'));
            })
        ]);

        return new Promise(function(resolve,reject){
            race.then(function(response){
                if(response.ok) { //response.status [200,299]
                    response[conf.type]().then(function(result){
                        if(conf.dealfail){ //处理业务错误
                            if(IoConfig.fail.filter(result)){ //有业务错误发生
                                if(typeof conf[IoConfig.fail.funname] == 'function'){ //判断默认fail是否是一个有效函数
                                    conf[IoConfig.fail.funname](result);
                                }
                                reject(result);
                            }else{ //无业务错误发生
                                if(conf.dealdata){
                                    resolve(conf.dealdatafun(result));
                                }else{
                                    resolve(result);
                                }
                            }
                        }else{
                            resolve(result);
                        }
                    },function(error){
                        throw error;
                    });
                }else{
                    var error = new Error(response.statusText || '网络错误')
                    throw error;
                }
                conf.complete();
                conf.getResponse(response);
            }).catch(function(error){
                //捕获任何错误，即发生语法错误也会捕获
                conf.error(error);
                conf.complete();
            });
        });
    }
};
