/**
 * @fileoverview 为了便于业务开发，对 fetch 进行了封装
 */
const Config = require('./config');
const extend = require('extend');
const querystring = require('querystring');

function isFunction(data){
    return typeof data == 'function';
}

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
     * 发起请求
     * @param  {JSON} ioparams 同Config.ioparams
     * @return {[type]}          [description]
     */
    fetch: function(ioparams) {
        if(ioparams.url == ''){
            throw new Error('io参数url不能为空');
            return;
        }
        var conf = {};

        extend(true,conf,Config.ioparams,ioparams);

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

        // 创建 request 对象并预处理
        conf.request.headers = conf.headers;
        var myrequest = new Request(conf.url,conf.request);
        if(isFunction(conf.requestTap)){
            myrequest = conf.requestTap(myrequest);
        }

        //发起请求
        var race = Promise.race([
            fetch(myrequest),
            new Promise((resolve,reject) => {
                setTimeout(reject,conf.timeout,new Error('请求超时'));
            })
        ]);

        return new Promise((resolve,reject) => {
            race.then(response => {
                if(response.ok) { //response.status [200,299]
                    response[conf.type]().then(function(result){
                        var isSuccess = true;

                        if(isFunction(conf.reponseTap)){
                            isSuccess = conf.reponseTap(result);
                        }

                        if(isSuccess){ //无业务错误发生
                            resolve(result);
                        }else{ //有业务错误发生
                            reject({
                                errorType: 'tap',
                                error: result,
                                response: response
                            });
                        }
                    },function(error){
                        reject({
                            errorType: 'parse-fail',
                            error: new Error(`将返回数据解析成 ${conf.type} 失败`),
                            response: response
                        });
                    });
                }else{
                    reject({
                        errorType: 'status-code',
                        error: new Error(response.statusText || response.status),
                        response: response
                    });
                }

                conf.getResponse(response);
            }).catch(error => {
                //捕获任何错误，即发生语法错误也会捕获
                reject({
                    errorType: 'error',
                    error: error
                });
            });
        }).catch(errorInfor => {
            if(isFunction(conf.error)){
                conf.error(errorInfor);
            }
        });
    }
};
