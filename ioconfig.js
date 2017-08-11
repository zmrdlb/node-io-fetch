/**
 * @fileoverview io请求的一些公共配置
 */
 const that = {
    /**
     * 对于接口返回的业务错误进行统一处理
     * @type {Object}
     */
    fail: {
        funname: 'fail', //当发生业务错误的时候，调用的方法名
        filter: function(result) {
            // if(result.code != 'A0001'){
            //     return true; //说明发生了业务错误
            // }else{
            //     return false;
            // }
            return false;
        }
    },

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
     * 请求的数据类型，默认为json. 数据类型和reponse对象返回获取结果的方法对应关系如下
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
     * io请求前，统一的处理
     * @return {[type]} [description]
     */
    beforeSend: function(){

    },
    /**
     * 获取fetch返回的response对象。接口请求成功（业务成功和失败都算）时可以获取到
     * @param {Response} response 返回的response对象
     * @return {[type]}          [description]
     */
    getResponse: function(response){

    },
    /**
     * 对于接口返回错误或超时，一般因为网络原因，进行的统一处理
     */
    error: function(error){
        //error或有或无 error.message
        //Alert.alert('系统消息',error.message || '亲，忙不过来了');
    },
    /**
     * 如果fail配置了funname为fail,则调用此方法. 此时fail.filter返回true
     * 在此可进行统一业务错误处理
     * @param {Object|Other} result 接口返回数据
     * @return {[type]} [description]
     */
    fail: function(result){
        //Alert.alert('系统消息',result.errmsg || '亲，忙不过来了');
    },
    /**
     * 接口请求完毕调用。无论success,fail,error
     * @return {[type]} [description]
     */
    complete: function(){},
    /**
     * 如果dealdata为true, 则success的result为此方法返回的数据
     * @param {Object|Other} result 接口返回数据
     * @return {[type]}        [description]
     */
    dealdatafun: function(result){return result.data},
    /**
     * 是否统一处理业务错误
     * @type {Boolean}
     */
    dealfail: true, //是否统一处理业务错误
    /**
     * 当业务成功时，调用success前，是否统一格式化数据
     * 如果dealfail为true,并且fail.filter返回为false时，如果此项设置为true,则调用dealdatafun方法，返回处理后的数据
     * @type {Boolean}
     */
    dealdata: true
};

/**
 * 本来下面这两项配置是放在that.ioparams里面的，但是后面改版，采用promise方式传递以下这两项。
 * 也就是说，that.iocallback其实是个介绍，并无实际意义
 * @type {Object}
 */
that.iocallback = {
    /**
     * 业务错误处理。
     * 如果fail配置了funname为fail，并且fail.filter返回true，则默认调用that.ioparams.fail处理方法
     * 配置了catch，也会调用catch
     * 如果配置了io请求参数fail为null，则不会调用that.ioparams.fail
     * @param {Object|Other} result 接口返回数据
     * @return {[type]} [description]
     */
    catch: function(result){
        //Alert.alert('系统消息',result.errmsg || '亲，忙不过来了');
    },
    /**
     * 成功调用方法。调用的情况有如下几种：
     * 1. dealfail为true, 则fail.filter返回false时，调用success
     *          此时如果dealdata为true, 则result为dealdatafun返回的数据
     * 2. dealfail为false时，则接口返回后直接调用此方法（不发生error的情况下）
     *
     * @param {Object|Other} result 接口返回数据
     */
    then: function(result){}
};

module.exports = that;
