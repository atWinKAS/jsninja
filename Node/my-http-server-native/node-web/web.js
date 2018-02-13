var consts = require('./consts');
const { EOL } = require('os');

var HTTPParser = process.binding('http_parser').HTTPParser;
var Stream = require('stream').Stream;
var urlParse = require('url').parse;

var defaults = {
    autoDate: true,
    autoServer: 'Small Stupid Web Server ' + process.version + ')',
    autoContentLength: true,
    autoChunked: true,
    autoConnection: true,
};

exports.socketHandler = function(app, options) {
    var config = Object.create(defaults);
    for (var key in options) {
        config[key] = options[key];
    }

    return function(client) {
        /// client here is orriginal socket from net.createserver function
        var parser = new HTTPParser(HTTPParser.REQUEST);
        var req;

        const kOnHeaders = HTTPParser.kOnHeaders | 0;
        const kOnHeadersComplete = HTTPParser.kOnHeadersComplete | 0;
        const kOnBody = HTTPParser.kOnBody | 0;
        const kOnMessageComplete = HTTPParser.kOnMessageComplete | 0;
        const kOnExecute = HTTPParser.kOnExecute | 0;

        parser[kOnHeaders] = function(headers, url) {};

        parser[kOnHeadersComplete] = function(
            versionMajor,
            versionMinor,
            headers,
            method,
            url,
            statusCode,
            statusMessage,
            upgrade,
            shouldKeepAlive
        ) {
            /// shouldKeepAlive does not work properly
            /// first request goes well but second tryes to write to closed writable stream

            var info = {
                versionMajor,
                versionMinor,
                headers,
                method: consts.METHODS[method],
                url,
                statusCode,
                statusMessage,
                upgrade,
                shouldKeepAlive: false,
            };
            parserOnHeadersComplete(info);
        };

        parser[kOnBody] = function(buffer, start, len) {
            parserOnBody(buffer, start, len);
        };

        parser[kOnMessageComplete] = function() {
            parserOnMessageComplete();
        };

        parser[kOnExecute] = function() {};

        function res(statusCode, headers, body) {
            var hasContentLength, hasTransferEncoding, hasDate, hasServer;
            for (var header in headers) {
                switch (header.toLowerCase()) {
                case 'date':
                    hasDate = true;
                    continue;
                case 'server':
                    hasServer = true;
                    continue;
                case 'content-length':
                    hasContentLength = true;
                    continue;
                case 'transfer-encoding':
                    hasTransferEncoding = true;
                    continue;
                }
            }
            if (!hasDate && config.autoDate) {
                headers['Date'] = new Date().toUTCString();
            }
            if (!hasServer && config.autoServer) {
                headers['Server'] = config.autoServer;
            }

            var isStreaming =
                body && typeof body === 'object' && typeof body.pipe === 'function';
            if (body && !hasContentLength && !hasTransferEncoding) {
                if (!isStreaming && config.autoContentLength) {
                    body += '';
                    headers['Content-Length'] = Buffer.byteLength(body);
                    hasContentLength = true;
                } else if (config.autoChunked) {
                    headers['Transfer-Encoding'] = 'chunked';
                    hasTransferEncoding = true;

                    var originalBody = body;
                    body = new Stream();
                    body.readable = true;

                    originalBody.on('data', function(chunk) {
                        if (Buffer.isBuffer(chunk)) {
                            body.emit('data', chunk.length.toString(16).toUpperCase() + EOL);
                            body.emit('data', chunk);
                            body.emit('data', EOL);
                            return;
                        }
                        var length = Buffer.byteLength(chunk);
                        body.emit(
                            'data',
                            length.toString(16).toUpperCase() + EOL + chunk + EOL
                        );
                    });

                    originalBody.on('end', function() {
                        body.emit('data', '0\r\n\r\n\r\n');
                        body.emit('end');
                    });
                }
            }

            if (config.autoConnection) {
                if (
                    req.shouldKeepAlive &&
                    (hasContentLength || hasTransferEncoding || statusCode === 304)
                ) {
                    headers['Connection'] = 'keep-alive';
                } else {
                    headers['Connection'] = 'close';
                    req.shouldKeepAlive = false;
                }
            }

            var reasonPhrase = consts.CODES[statusCode];
            if (!reasonPhrase) {
                throw new Error('Invalid response code ' + statusCode);
            }
            var head = 'HTTP/1.1 ' + statusCode + ' ' + reasonPhrase + EOL;
            for (var headerKey in headers) {
                head += headerKey + ': ' + headers[headerKey] + EOL;
            }
            head += EOL;

            if (body && !isStreaming) {
                head += body;
            }

            /// here we can write all headers and then pipe...
            client.write(head);

            if (!isStreaming) {
                return done();
            }

            /// stream with requested file is piping to socket stream
            body.pipe(client);
            body.on('end', done);
        }

        function done() {
            if (req.shouldKeepAlive) {
                parser.reinitialize(HTTPParser.REQUEST);
            } else {
                client.end();
            }
        }

        var parserOnHeadersComplete = function(info) {
            info.body = new Stream();
            info.body.readable = true;
            req = info;
            var rawHeaders = (req.rawHeaders = req.headers);
            var headers = (req.headers = {});

            for (var i = 0; i < rawHeaders.length; i += 2) {
                headers[rawHeaders[i].toLowerCase()] = rawHeaders[i + 1];
            }

            req.url = urlParse(req.url);
            app(req, res);
        };

        var parserOnBody = function(buffer, start, len) {
            req.body.emit('data', buffer.slice(start, len));
        };

        var parserOnMessageComplete = function() {
            req.body.emit('end');
        };

        client.on('data', function(chunk) {
            parser.execute(chunk, 0, chunk.length);
        });

        client.on('end', function() {
            parser.finish();
        });
    };
};
