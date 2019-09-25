/**
 * @fileoverview fetch 请求的一些公共配置
 */

 const that = {
    /**
     * 请求头部配置
     * @type {Object}
     */
    headers: {
        //如果Content-Type设置为false,则不传Content-Type
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    /**
     * 请求对象参数配置
     * @type {Object}
     */
    request: {
        method: 'GET', //GET|POST
        mode: 'cors', //cors|no-cors|same-origin|navigate
        //其他参数
        //body: credentials: cache: redirect: referrer: integrity
        /**
         * same-origin: 同ajax一样，同域发送cookie
         * include: 跨域发送cookie
         * @type {String}
         */
        credentials: 'include'
    }
};

/**
 * 调用io组件，传入的参数格式
 * @type {Object}
 */
that.ioparams = {
    headers: that.headers, //同headers
    request: that.request, //同request
    /**
     * 请求参数。可以是以下几种类型：
     * Bolb
     * BufferSource
     * FormData
     * URLSearchParams
     * USVString
     * String
     * JSON: 如果是json, 则做特殊处理，请见下面isformdata的说明
     */
    // data: {},
    /**
     * 如果data是json:
     *  1. request.method不是GET或HEAD, 且isformdata为true, 那么将data转换成FormData格式
     *  2. 如果不符合第1种，将data转换成querystring
     * @type {Boolean}
     */
    isformdata: false,
    url: '', //请求url地址
    /**
     * 请求的数据类型，默认为json. 数据类型和reponse对象获取返回数据的方法对应关系如下
     * arrayBuffer: response.arrayBuffer
     * blob: response.blob
     * formData: response.formData,
     * json: response.json,
     * text: response.text
     * @type {String}
     */
    type: 'json',
    timeout: 6000,

    /**
     * 获取fetch返回的response对象。接口请求成功（业务成功和失败都算）时可以获取到
     * @param {Response} response 返回的response对象
     * @return {[type]}          [description]
     */
    getResponse(response){

    },

    /**
     * 对 fetch 请求发生的各种错误进行的统一处理。主要包括：
     * 1. status code 不在 [200,299) 范围内，统一的处理。如，未登录，弹出登录弹窗等。
     * 2. 对于错误的信息提示等
     *
     * 参数说明同 that.iocallback.catch
     *
     * 如果某个接口不想让系统默认处理，则将此值设置为 null 即可。
     */
    error({errorType,error,response}){
        // if(errorType == 'tap'){
        //     console.log(error);
        // }else if(errorType == 'parse-fail' || errorType == 'status-code'){
        //     console.log(error.message, response.status);
        // }else if(errorType == 'error'){
        //     console.log(error.message);
        // }
    },

    /**
     * 接口请求完毕调用。无论success,fail,error
     * @return {[type]} [description]
     */
    complete(){},

    /**
    * 阀门
    * 如果给以下配置设置为 null，则表示禁用相关处理。
    *   requestTap
    *   reponseTap
    */

    /**
     * request 阀门
     * 调用时机：将 request 传递给 fetch 之前
     * @param {Request} request 根据 ioparams 创建的 Request 对象
     * @return {Request} 返回发送给 fetch Request 对象实例
     */
    requestTap(request) {
        // 暂时没有特殊处理需求
        return request;
    },

    /**
     * response 阀门
     * 调用时机：收到了服务器返回的数据，且 status code 在 [200,299) 范围内，且根据设置的 type 参数
     * 指定的数据类型，将返回的数据成功解析。
     * 返回的数据解析为指定类型
     * @param {Any} data 解析后的数据。data 的数据类型与 type 参数有关。
     * @param {Response} response Response 对象
     * @return {Boolean} 结合返回的 data 与 response 判断业务成功的与失败。
     *                   true: 成功；false: 失败；
     */
    responseTap(data,response) {
        // if(data && !data.status){
        //     return false; //说明发生了业务错误
        // }else{
        //     return true;
        // }
        return true;
    }
};

/**
 * 本来下面这两项配置是放在that.ioparams里面的，但是后面改版，采用promise方式传递以下这两项。
 * 也就是说，that.iocallback其实是个介绍，并无实际意义
 * @type {Object}
 */
that.iocallback = {
    /**
     * 失败处理
     *
     * @param {String} errorType 错误类型
     *    'tap': 收到了服务器响应，且 status code 在 [200,299) 范围内，且根据设置的 type 参数
     * 指定的数据类型，将返回的数据成功解析，且经 “response 阀门” 判断，请求失败
     *    'parse-fail': 收到了服务器响应，且 status code 在 [200,299) 范围内，且根据设置的 type 参数
     * 指定的数据类型，解析返回的数据失败
     *    'status-code': 收到了服务器响应，且 status code 不在 [200,299) 范围内
     *    'error': fetch 请求发生了 network error，没有收到服务器响应；接口请求超时；其他语法错误等
     * @param {Any} error
     *    按照 errorType 来分类说明：
     *      'tap': error 是服务器返回数据
     *      'parse-fail || 'status-code' || 'error': error 是 Error 对象，一般读取 error.message 可获取具体错误说明
     * @param {Response} 【response]
     *     Response 对象，只有以下 errorType 才有此参数
     *      'tap','parse-fail','status-code'
     * @return {[type]} [description]
     */
    catch: function({errorType,error,response}){
        //Alert.alert('系统消息', error.message || '亲，忙不过来了');
    },
    /**
     * 成功处理。
     *
     * 收到了服务器响应，且 status code 在 [200,299) 范围内，且根据设置的 type 参数
     * 指定的数据类型，将返回的数据成功解析。
     *
     * 经 “response 阀门” 判断，请求成功。如果 “response 阀门” 为 null，则直接判断为请求成功。
     *
     * @param {Any} data 解析后的数据
     */
    then: function(data){}
};

module.exports = that;
