# node-io-fetch

可通过参数配置，针对业务，考虑到兼容性，使用 [whatwg-fetch](https://github.com/github/fetch#readme) 封装的 io接口请求npm包。

# 前言

学习react-native的时候，知道了[fetch api](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)，新的资源获取语法，比XmlHttpRequest具有更强大的功能：易读性、抽象性、简洁性、支持各种类型资源请求等。
现在对于fetch的使用，封装了一层，提取了便于开发者配置和使用的api.

[using fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)

引用whatwg-fetch，对io请求进行业务层的封装，便于统一处理io业务逻辑。

# 浏览器兼容性

- Chrome
- Firefox
- Safari 6.1+
- Internet Explorer 10+

# 安装

```
npm install node-io-fetch --save
```

# 简单使用

- model.js

```
const {IoConfig,Io} = require('node-io-fetch');
const extend = require('extend');

/**
 * 设置自己的配置
 */

 /**
  * 业务错误条件配置
  * @param  {[type]} result [description]
  * @return {[type]}        [description]
  */
IoConfig.fail.filter = function(result){
    if(result.code != 'A0001'){
        return true; //说明发生了业务错误
    }else{
        return false;
    }
}

/**
 * io请求发送前执行
 * @return {[type]} [description]
 */
IoConfig.ioparams.beforeSend = function(){
    console.log('请求开始');
}

/**
 * io请求结束后
 */
IoConfig.ioparams.complete = function(){
    console.log('请求结束')
}

/**
 * 网络错误或者系统错误
 * @param  {[type]} error [description]
 * @return {[type]}       [description]
 */
IoConfig.ioparams.error = function(error){
    //error或有或无 error.message
    console.log(error.message || '亲，忙不过来了');
}

/**
 * 业务错误处理
 * @param  {[type]} result   [description]
 * @return {[type]}          [description]
 */
IoConfig.ioparams.fail = function(result){
    if(result.code == 'A0002'){
        console.log('未登录');
    }else{
        console.log(result.errmsg || '亲，忙不过来了');
    }
}

/**
 * 调用以下方法的时候，opt如ioparams。但是一般只传以下参数就可以了：
 *   data success
 *   以下方法已经统一处理了，如果想覆盖自行传入
 *   beforeSend error fail complete
 */
module.exports = {
    //listdata接口
    listdata(opt){
        return Io.request(extend(true,{
            request: {
                method: 'POST'
            },
            url: 'http://127.0.0.1:8000/listdata'
        },opt));
    }
};
```

- test.js

```
const Model = require('./model');

Model.listdata({
     data: {
         username: 'zmr',
         sex: '女'
     },
     //获取response对象
     getResponse: function(response){
         console.log(response);
     }
     //不接受统一的业务错误处理IoConfig.ioparams.fail
     //  fail: null
}).then(function(list){ //业务返回正确
     console.log(list);
}).catch(function(result){ //业务错误
     console.log(result.errmsg);
});

```

# 使用

- 将node-io-fetch中的model.js拷贝在具体项目里，此处举例存放路径为：common/model.js

- 切换到目录react-native-io-fetch下，运行npm run interstart, 开启node接口模拟

- 将node-io-fetch中的test.js拷贝到具体业务js，调用配置的接口

`ps`: 具体使用及运行结果请参见：https://github.com/zmrdlb/express-demo

# 设计思路

设计其实很简单，分为2部分：

- ioconfig.js: 接口参数默认配置声明

- io.js: 具体发送接口请求方法

# API

## IoConfig

io接口请求配置，并声明了默认值：

### IoConfig.fail：对接口返回的业务数据，判断是否发送了业务错误

  Name  |  默认值  |  说明  
----    |----      |----
funname | 'fail' | 当发生业务错误时，调用的方法名
filter | function(result){return false} | 返回true,则说明发送了业务错误

### IoConfig.headers：请求头部配置

  Name  |  默认值  |  说明  
----    |----      |----
'Content-Type' | 'application/x-www-form-urlencoded' | 如果设置为false, 则不传Content-Type

headers可以扩展添加任意Http Headers设置，[MDN Headers官方说明](https://developer.mozilla.org/zh-CN/docs/Web/API/Headers/Headers)

### IoConfig.request：请求对象配置

  Name  |  默认值  |  说明  
----    |----      |----
method | 'GET' | 常用的,GET或POST 
mode | 'cors' | 跨域设置，可用值有 cors|no-cors|same-origin|navigate 
credentials| 'include' | include: 跨域发送cookie; same-origin: 同ajax一样，同域发送cookie

[MDN Request官方说明](https://developer.mozilla.org/zh-CN/docs/Web/API/Request)

### IoConfig.ioparams：调用Io.request方法，默认的参数设置

  Name  |  默认值  |  说明  
----    |----      |----
headers | IoConfig.headers | 请求headers
request | IoConfig.request | 请求request
data | 无 | 给接口发送的数据，一般是json格式。 
isformdata| false | 如果data是json，是否将data转换成FormData格式进行发送。1. request.method不是GET或HEAD, 且isformdata为true, 那么将data转换成FormData格式；2. 如果不符合第1种，将data转换成querystring 
url | '' | 接口url
type | 'json' | 请求的数据类型。[数据类型和response对象获取返回结果的方法对应关系说明](#response-tb)
timeout | 6000 | 超时时间，毫秒
beforeSend | function(){} | io请求前，统一的处理
getResponse | function(response){} | 获取fetch返回的response对象。接口请求成功（不管业务成功或失败）可以获取到此对象
error | function(error){} | 接口请求错误或超时调用此方法。error或有或无error.message 
fail | function(result){} | 统一业务错误处理方法。如果IoConfig.fail.funname为fail，则当IoConfig.fail.filter返回true时，调用此方法。result为接口返回的数据。如果此项配置为null，则不会调用此方法
dealfail | true | 是否进行统一业务错误处理
complete | function(){} | 接口请求完毕调用的方法，无论成功或失败 
dealdata | true | 当接口返回业务成功时，调用IoConfig.iocallback.then前，是否统一格式化数据
dealdatafun | function(result){return result.data} | 如果dealdata为true, 则IoConfig.iocallback.then的result为此方法返回的数据

- IoConfig.iocallback：接口结果获取说明

此项没有实际意义。由于Io.request(...)返回的是一个Promise对象，then和catch的回调只能在此说明

- catch: function(result){...}

  接口业务错误，则调用此方法。
  
  - 如果IoConfig.fail.filter返回为true, 说明发生了业务错误，则调用catch。如果dealfail为true，也会调用IoConfig.ioparams.fail方法。

  - result 为接口返回数据

- then: function(result){...}

  成功调用方法。调用的情况有如下几种：
  
  - 1. dealfail为true, 则IoConfig.fail.filter返回false时，调用then。此时如果dealdata为true, 则result为dealdatafun返回的数据；
  
  - 2. dealfail为false时，则接口返回后直接调用此方法（不发生error的情况下）

## Io

接口请求方法封装

### Io.request(ioparams)

发起接口请求。

- ioparams：格式同IoConfig.ioparams

- 返回Promise对象，then和catch处理方法说明，分别对应IoConfig.iocallback的then和catch

# 附录

<a id="response-tb"></a>
## 数据类型和response对象获取返回结果的方法对应关系说明

type | 对应response
----|------
arrayBuffer | response.arrayBuffer
blob | response.blob
formData | response.formData
json | response.json
text | response.text

[MSN Response官方说明](https://developer.mozilla.org/zh-CN/docs/Web/API/Response)
