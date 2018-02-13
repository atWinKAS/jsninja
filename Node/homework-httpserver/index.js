const Buffer = require('buffer').Buffer;

var net = require('net');

var host = '127.0.0.1';
var port = process.env.PORT || 3000;

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(socket) {

    socket.setEncoding('utf8');

    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);

    // Add a 'data' event handler to this instance of socket
    socket.on('data', function(data) {
        let rawRequest = data.toString('utf8');
        console.log('\n\nDATA ' + socket.remoteAddress + ': ' + data);
        console.log('\n\nLen', data.length);
        console.log('\n\ndata\n\n', rawRequest);

        // Write the data back to the socket, the client will receive it as data from the server
        //sock.write('You said "' + data + '"');

        let reqArray = rawRequest.split('\r\n');
        console.log('arr len: ', reqArray.length);

        let headers = [];
        reqArray.forEach((item) => {
            let firstColon = item.indexOf(':');
            if (firstColon > 0) {
                headers.push({
                    name: item.substring(0, firstColon).trim(),
                    value: item.substring(firstColon + 1, item.length).trim()
                });
            }
        });

        printHeaders(headers);

        let dataStr = `HTTP/1.1 200 OK
Content-Type: text/plain
Date: Tue, 06 Feb 2018 15:13:24 GMT
Connection: keep-alive
Transfer-Encoding: chunked

Hello world

        `;
        
        //socket.write(Buffer.from(dataStr, 'utf8'));
        socket.write(dataStr);
        socket.end();
         
        console.log('data sent');
    });

    // Add a 'close' event handler to this instance of socket
    socket.on('close', function(data) {
        console.log('CLOSED: ' + socket.remoteAddress + ' ' + socket.remotePort);
    });

}).listen(port, host);

console.log('Server listening on ' + host + ':' + port);

function printHeaders(data) {
    console.log('> headers:');
    data.forEach(element => {
        console.log(`${element.name}: ${element.value}`);
    });
    console.log('< end headers.');
}