/**
 * @fileoverview fetch factory.
 */

import extend from 'extend'
import querystring from 'querystring'
import buildFullPath from './build-fullpath'

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

export default {
    /**
     * 发起请求
     * @param  {JSON} config 同 config
     * @param  {JSON} defaultConfig 默认配置
     * @return {[type]}          [description]
     */
    fetch: function(config, defaultConfig) {
        if(config.url == ''){
            throw new Error('io参数url不能为空');
            return;
        }
        var conf = {};

        extend(true,conf,defaultConfig,config);

        conf.request.method = conf.request.method.toUpperCase();

        //检测 data
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
        var fullUrl = buildFullPath(conf.baseURL,conf.url);
        var myrequest = new Request(fullUrl,conf.request);
        if(isFunction(conf.requestTap)){
            conf.requestTap(myrequest);
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

                        if(isFunction(conf.responseTap)){
                            isSuccess = conf.responseTap(result);
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
            return Promise.reject(errorInfor);
        });
    }
};
