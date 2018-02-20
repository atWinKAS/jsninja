var fs = require('fs');

var inspect = require('util').inspect,
    http = require('http');

var Dicer = require('dicer');

    // quick and dirty way to parse multipart boundary
var RE_BOUNDARY = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i,
    PORT = 8001;

http.createServer(function(req, res) {
  var m;
  if (req.method === 'POST'
      && req.headers['content-type']
      && (m = RE_BOUNDARY.exec(req.headers['content-type']))) {
    var d = new Dicer({ boundary: m[1] || m[2] });

    var w = fs.createWriteStream('c:\\temp\\debug.txt');
    d.on('part', function(p) {
      console.log('New part!');
      p.on('header', function(header) {
        for (var h in header) {
          console.log('Part header: k: ' + inspect(h)
                      + ', v: ' + inspect(header[h]));
        }
      });
      p.on('data', function(data) {
        debugger;
        console.log('PART!!!!');
        w.write(data);
        //console.log('Part data: ' + inspect(data.toString()));
      });
      p.on('end', function() {
        console.log('End of part\n');
      });
    });
    d.on('finish', function() {
      console.log('End of parts');
      w.end();
      res.writeHead(200);
      res.end('Form submission successful!');
    });
    req.pipe(d);
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(PORT, function() {
  console.log('Listening for requests on port ' + PORT);
});