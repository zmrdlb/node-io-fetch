# node-io-fetch

为了便于业务开发，对 fetch 封装。考虑到兼容性，使用 [whatwg-fetch](https://github.com/github/fetch#readme)。此次封装提供了以下功能：

1. **对所有接口增加统一的“阀门”，统一预处理 request 和 response。** 开发者只需关心具体业务，无需关心其他细节处理。这点在后期项目迭代中可渐渐发挥优势。如：开发一段时间后，后端要求所有接口都增加 ajax=1 的参数，之前遇到过的情况。如果按照普通方式，开发者需要全局搜索使用了原生 Fetch API 的地方，然后给每个接口的 data 新增 ajax=1。这一操作修改多处地方。如果开发者使用了 node-io-fetch 提供的方法，则无需烦恼，因为只需在 response “阀门” 里，对待发送的 data 新增 ajax=1。这一操作只需修改一处地方。
2. 一般一个项目里，前后端会约定接口返回的格式，如：
``` javascript
{
   status: true|false, // 所处理业务的状态，成功或失败
   data: any, // 当 status 为 true 时，返回的数据
   message: '错误信息' // 当 status 为 false 时，返回的提示信息
}
```
**node-io-fetch 借用 “response 阀门”，根据“接口约定”统一判断业务的成功或失败。** 
3. **node-io-fetch 提供的 request method 返回 promise。** 结合 responseTap 和 promise，开发者无需自行判断，只需在成功和失败的回调里处理各自的逻辑。
**node-io-fetch 借用 “response 阀门”，根据“接口约定”统一判断业务的成功或失败。** 此外 node-io-fetch 提供的 request method 返回 promise。结合这两点，开发者无需自行判断返回的数据，只需在成功和失败的回调里处理各自的逻辑。
4. **新增统一的错误处理 error 入口。**。
5. **所有的默认配置都可在项目中自行修改。**

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
const {Config,AppFetch} = require('node-io-fetch');
const extend = require('extend');

/**
 * 设置自己的配置
 */

/**
 * io请求结束后
 */
Config.ioparams.complete = function(){
    console.log('请求结束')
}

/**
 * 根据服务器返回的数据，判断接口成功或失败
 */
Config.ioparams.responseTap = function(data,response){
    if(data && !data.status){
        return false; //说明发生了业务错误
    }else{
        return true;
    }
}

/**
 * 统一错误处理
 */
Config.ioparams.error = function(errorType,error,response) {
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
        return AppFetch.request(params);
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
```

- test.js

```
const Model = require('./model');

Model.post({
     url: 'http://127.0.0.1:8000/listdata',
     data: {
         username: 'zmr',
         sex: '女'
     },
     //获取response对象
     getResponse: function(response){
         console.log(response);
     }
}).then(function(list){ //成功
     console.log(list);
}).catch(function(errorType,error,response){ //失败
     console.log(errorType,error.message);
});

```

# 使用

- 将node-io-fetch中的model.js拷贝在具体项目里，此处举例存放路径为：common/model.js

- 切换到目录node-io-fetch下，运行npm run interstart, 开启node接口模拟

- 将node-io-fetch中的test.js拷贝到具体业务js，调用配置的接口

`ps`: 具体使用及运行结果请参见：https://github.com/zmrdlb/express-demo

# 设计思路

设计其实很简单，分为2部分：

- config.js: 请求参数默认配置声明

- app-fetch.js: 具体发送请求以及处理响应的逻辑

# API

## Config

请求配置，并声明了默认值：

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
getResponse | function(response){} | 获取fetch返回的response对象。接口请求成功（不管业务成功或失败）可以获取到此对象
error | function(errorType,error,response){} | 对 fetch 请求发生的各种错误进行的统一处理。主要包括：1. status code 不在 [200,299) 范围内，统一的处理。如，未登录，弹出登录弹窗等；2. 对于错误的信息提示等。参数说明同 [iocallback.catch](#fetch-error)
complete | function(){} | 接口请求完毕调用的方法，无论成功或失败 
requestTap | function(request){return request;} | request 阀门，返回处理后的 Request 对象。调用时机：将 request 传递给 fetch 之前。
responseTap | function(data,response){return true;} | response 阀门，返回 boolean 判断业务成功的与失败（true成功；false失败）。调用时机：收到了服务器返回的数据，且 status code 在 [200,299) 范围内，且根据设置的 type 参数指定的数据类型，将返回的数据成功解析。

- IoConfig.iocallback：接口结果获取说明

此项没有实际意义。由于AppFetch.request(...)返回的是一个Promise对象，then和catch的回调只能在此说明

<a id="fetch-error"></a>
- catch: function(errorType,error,response){...}

  业务错误回调方法。参数说明：
  
  1. errorType 错误类型
     - 'tap': 收到了服务器响应，且 status code 在 [200,299) 范围内，且根据设置的 type 参数指定的数据类型，将返回的数据成功解析，且经 “response 阀门” 判断，请求失败
     - 'parse-fail': 收到了服务器响应，且 status code 在 [200,299) 范围内，且根据设置的 type 参数指定的数据类型，解析返回的数据失败
     - 'status-code': 收到了服务器响应，且 status code 不在 [200,299) 范围内
     - 'error': fetch 请求发生了 network error，没有收到服务器响应；接口请求超时；其他语法错误等
  2. error，按照 errorType 来分类说明：
     - 'tap': error 是服务器返回数据
     - 'parse-fail || 'status-code' || 'error': error 是 Error 对象，一般读取 error.message 可获取具体错误说明
  3. response，Response 对象，只有以下 errorType 才有此参数：'tap','parse-fail','status-code'

- then: function(result){...}

  收到了服务器响应，且 status code 在 [200,299) 范围内，且根据设置的 type 参数指定的数据类型，将返回的数据成功解析。经 “response 阀门” 判断，请求成功。如果 “response 阀门” 为 null，则直接判断为请求成功。
  
  参数说明：
  
  1. data: 解析后的数据

## AppFetch

Fetch 封装

### AppFetch.request(ioparams)

发起接口请求。

- ioparams：格式同IoConfig.ioparams

- 返回Promise对象，then和catch处理方法说明，分别对应Config.iocallback的then和catch

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
