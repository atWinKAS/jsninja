const myHttp = require('./http');
// const fs = require('mz/fs');
const fs = require('fs');

// const server = myHttp.createServer();
const server = myHttp();
server.listen(3001);

server.on('request', (req, res) => {
    console.log('My server generated request event');
    console.log(req.method, req.url);
    console.log('Headers:');
    console.log(req.headers);
    
    if (req.method === 'GET' && req.url === '/') {
        debugger;
        res.sendText(200, 'Hello');
    } if (req.method === 'GET' && req.url !== '/') {
        var urlParts = req.url.split('/');
        var fileName = urlParts[urlParts.length - 1].toLowerCase();
        var fileExt = '';
        if (fileName.indexOf('.') > 0) {
            var extParts = fileName.split('.');
            fileExt = extParts[extParts.length - 1].toLowerCase();
        }

        var headers = {};
        if (fileExt === 'html' || fileExt === 'htm') {
            headers = { 'Content-Type': 'text/html; charset=utf-8' };
        } else if (fileExt === 'png') {
            headers = { 'Content-Type': 'image/png' };
        } else if (fileExt === 'jpeg' || fileExt === 'jpg') {
            headers = { 'Content-Type': 'image/jpeg' };
        } else {
            headers = {};
        }
        const file = fs.createReadStream(`./static/${fileName}`);
        file.pipe(res);    
    } else {

    }
});