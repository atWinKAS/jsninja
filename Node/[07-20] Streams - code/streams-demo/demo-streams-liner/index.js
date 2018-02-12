const fs = require('fs');
const { Transform } = require('stream');
const { EOL } = require('os');

class LineStream extends Transform {
  constructor(options) {
    super(options);
    this.lastChunk = '';
  }

  _transform(data) {
    const chunk = data.toString('utf8');
    const elements = chunk.split(EOL);
    if (!elements) {
      // ???
    }
    const lastChunk = elements.pop();
    if (elements.length === 0) {
      this.lastChunk += lastChunk;
      this.push();
      // this.push(null);
      return;
    }
    const firstChunk = elements.shift();
    this.push(this.lastChunk + firstChunk);
    this.lastChunk = lastChunk;

    elements.forEach(line => this.push(line));
  }
}

// const linestream = require('line-stream');

// не забудьте поменять путь
const stream = fs.createReadStream('./demo.csv');
const lines = new LineStream();
stream.pipe(lines); // <--
let count = 0;
lines.on('data', line => {
  try {
    console.log(line.toString());
  } catch (e) {}
});
