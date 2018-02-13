var net = require('net');

var Gateway = require('./gateway');

var server = net.createServer();
server.on('connection', handleConnection);

server.listen(3000, function() {
    console.log('server has been started on port', server.address().port);
});

function handleConnection(conn) {
    var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
    console.log('server has accepted connection from', remoteAddress);

    var gateway = Gateway();
    conn.pipe(gateway).pipe(conn);

    //conn.on('data', onConnData);
    conn.on('close', onConnClose);
    conn.on('error', onConnError);

    // function onConnData(data) {
    //     console.log('data has arrived from', remoteAddress);
    //     console.log(data);
    //     console.log('\n');

    //     conn.write(data);
    // }

    function onConnClose() {
        console.log('connection from', remoteAddress, 'has been closed');
    }

    function onConnError(err) {
        console.log('Connection error!');
        console.log(err);
    }
}