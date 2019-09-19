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
}).catch(function(errorType,error){ //失败
     console.log(errorType,error.message);
});

Model.post({
     url: 'http://127.0.0.1:8000/listdata',
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
}).then(function(list){ //成功
     console.log(list);
}).catch(function(errorType,error){ //失败
     console.log(errorType,error.message);
});
