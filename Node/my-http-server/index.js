const myHttp = require('./http');
// const fs = require('mz/fs');
const fs = require('fs');

// const server = myHttp.createServer();
const server = myHttp();
server.listen(3001);

server.on('request', (req, res) => {
    console.log('My server generated request event');
    console.log(req.headers, req.method, req.url);

    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200); //Вызов writeHead опционален
    //fs.createReadStream('somefile.txt').then(s => s.pipe(res));

    const rs = fs.createReadStream('somefile.txt');
    rs.pipe(res);
});