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

Model.listdata({
     data: JSON.stringify({
         username: 'zmr',
         sex: '女',
         arrdata: [{
           key1: 'aaa',
           key2: 'bbb'
         }]
     }),
     headers: {
       'Content-Type': 'application/json'
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
