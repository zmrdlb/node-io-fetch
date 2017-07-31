const http = require('http');
const url = require('url');
const querystring = require('querystring');
const multiparty  = require('multiparty');

var requestCount = 0;

function writeHead(res,req){
    res.setHeader('Charset','utf-8');
    res.setHeader('Access-Control-Allow-Origin',req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials',true);
}

function writeempty(res,req) {
    writeHead(res,req);
    res.setHeader('Content-Type','text/plain');
    res.writeHead(404,'not found');
    res.end('');
}

function writeres(res,req){
    var dataBlob = [], rowIndex = 0;
    for(var i = 0; i < 10; i++){
        dataBlob.push({
           txt: 'row data '+ rowIndex,
           imgsrc: 'https://facebook.github.io/react/img/logo_og.png'
        });
        rowIndex++;
    }
    writeHead(res,req);
    res.setHeader('Content-Type','application/json');
    res.writeHead(200, 'ok');
    res.end(JSON.stringify({
        code: 'A0001',
        data: dataBlob,
        errmsg: '接口返回的错误信息'
    }),'utf8');
}

http.createServer((req,res) => {
    var urlobj = url.parse(req.url);
    var pathname = urlobj.pathname;
    //
    // console.log(urlobj.query);

    switch(pathname){
        case '/listdata':
            if(req.method.toUpperCase() == 'POST'){
                requestCount++;
                console.log(`第${requestCount}次请求`);

                var contentType = req.headers['content-type'];
                console.log(req.headers);
                if(/multipart\/form-data/.test(contentType)){ //说明是FormData
                    console.log('multipart/form-data');
                    var form = new multiparty.Form();
                    form.parse(req, (err,fields,files) => {
                        console.log(fields);
                    });
                    writeres(res,req);
                }else if(/application\/x-www-form-urlencoded/.test(contentType)){ //application/x-www-form-urlencoded
                    console.log('application/x-www-form-urlencoded');
                    var postdata = '';
                    req.on('data',(data) => {
                        postdata += data;
                    });
                    req.on('end',() => {
                        var argsobj = querystring.parse(postdata);
                        console.log(argsobj);
                        writeres(res,req);
                    });
                }else{
                    writeempty(res,req);
                }

            }else{
                writeempty(res,req);
            }
            break;
        default:
            writeempty(res,req);
            break;

    }
}).listen(8000);
