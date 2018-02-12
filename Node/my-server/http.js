const EventEmitter = require("events");
const net = require("net");
const { EOL } = require("os");

const { Readable, Writable } = require("stream");

class MyHttpRequest extends Readable {
  constructor() {
    super();
    this.headers = {};
    this.method = "";
    this.url = "";
  }

  _read(size) {
    this.push("Hello");
  }
}

class MyHttpResponse extends Writable {
  constructor() {
    super();
  }

  setHeader(headerName, value) {
     console.log('from writable. setting header:', headerName, value);
  }

  writeHead(code) {
    console.log('from writable. writing head: ', code);
  }

  _write(chunk, encoding, callback) {
    console.log('from writable. ', chunk.toString());
    callback();
  }
}

class MyHttpServer extends EventEmitter {
  constructor() {
    super();
    this.port = process.env.PORT || 3000;
  }

  listen(port) {
    this.port = port;
    console.log("Going to start server on port: ", this.port);

    const server = net.createServer();

    server.on("connection", socket => {
      console.log("Client connected");

      let req = new MyHttpRequest();
      let res = new MyHttpResponse();

      socket.on("data", data => {
        console.log("data from socket:", data);
        //socket.write("data is: ");
        //socket.write(data);
        
        // i need parse data object here in order to get headers and body
        const chunk = data.toString("utf8");
        const lines = chunk.split(EOL);

        const firstLine = lines[0];

        req.method = firstLine.split(" ")[0];
        req.url = firstLine.split(" ")[1];

        lines.shift();
        req.headers = this.readHeaders(lines);
        console.log("headers are:");
        console.log(req.headers);

        socket.pipe(req);
        res.write(data);

        this.emit("request", req, res);
      });
    });

    server.on("end", () => {
      console.log("Client disconnected");
    });

    server.listen(this.port, () =>
      console.log("Server bound on port", this.port)
    );
  }

  readHeaders(reqArray) {
    let headers = [];
    for (let i = 0; i < reqArray.length; i++) {
      if (reqArray[i] === "") {
        return headers;
      }

      let item = reqArray[i];
      let firstColon = item.indexOf(":");
      if (firstColon > 0) {
        let h = {};
        h[item.substring(0, firstColon).trim()] = item
          .substring(firstColon + 1, item.length)
          .trim();
        headers.push(h);
      }
    }
    return headers;
  }
}

function createServer() {
  console.log("my http create server");
  return new MyHttpServer();
}

module.exports = createServer;
