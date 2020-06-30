const fetchResource = require('node-io-fetch'),
      extend = require('extend');

/**
 * 设置自己的配置
 */

/**
 * 根据服务器返回的数据，判断接口成功或失败
 */
fetchResource.defaults.ioparams.responseTap = function(data,response){
    if(data && !data.status){
        return false; //说明发生了业务错误
    }else{
        return true;
    }
}

/**
 * 统一错误处理
 */
fetchResource.defaults.ioparams.error = function({errorType,error,response}) {
    if(errorType == 'tap'){
        console.log(error);
    }else if(errorType == 'parse-fail' || errorType == 'status-code'){
        console.log(error.message, response.status);
    }else if(errorType == 'error'){
        console.log(error.message);
    }
}


module.exports = {
    fetch(params){
        return fetchResource.fetch(params);
    },
    get(params){
        extend(true,params,{
            request: {
                method: 'GET'
            }
        });
        return this.fetch(params);
    },
    post(params){
        extend(true,params,{
            request: {
                method: 'POST'
            }
        });
        return this.fetch(params);
    }
};
