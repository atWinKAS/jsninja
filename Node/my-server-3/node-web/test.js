const fs = require('fs');

const port = process.env.PORT || 3000;

var app = function(req, res) {
    // console.log(req.method);
    // console.log(req.url);
    // console.log(req.headers);
    // console.log(req.body);

    // if (req.headers['content-type'] === 'application/json') { ... }
    // req.rawHeaders

    console.log(`Ready to serve... ${req.method} ${req.url.path}`);
    if (req.method === 'GET' && req.url.path === '/') {
        res(200, { 'Content-Type': 'text/plain' }, 'Hello :) \n');
    } else if (req.method === 'GET' && req.url.path !== '/') {
        var urlParts = req.url.path.split('/');
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

        /// by design here in file parameter should be writeble stream. Have no idea why... and it does not work with wribable.
        res(200, headers, file);
    } else {
        res(404, {}, '');
    }
};

/// with logger function example we can intercept request and performe actions before and after request.
function logger(app) {
    return function(req, res) {
        var start = new Date();
        console.log('\n\nGoing to process request...');

        app(req, function(code, headers, body) {
            console.log(req.method, req.url.path, code);

            res(code, headers, body);
            var end = new Date() - start;
            console.log('Response has been processed. %dms', end);
            console.log('\n\n');
        });
    };
}

var appWithLogger = logger(app);

var handler = require('./web').socketHandler(appWithLogger, {
    autoDate: true,
});
var server = require('net').createServer(handler);

server.listen(port, function() {
    var address = server.address();
    console.log('http://%s:%s/', address.address, address.port);
});
