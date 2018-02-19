const { Writable } = require('stream');
const { Readable } = require('stream');

class FileReadable extends Readable {
    constructor(opt) {
        super(opt);
        debugger;
    }
  
    _read() {
        debugger;
    }
}

class Parser extends Writable {
    constructor(options) {
        debugger;
        super(options);
        this.headers = options.headers;
        this.file = new FileReadable(); 
    }

    _write(chunk, encoding, callback) {
        debugger;

        console.log('in _write method now. size:', chunk.length);
        // console.log(chunk);
        // console.log('chunk as string:');
        // console.log(chunk.toString());
        // console.log('end write.');

        
        this.file.push(chunk);

        let fieldname1 = 'fieldname1';
        let filename = 'filename';
        let contentType = 'contentType';
        this.emit('file', fieldname1, this.file, filename, contentType);

        // let fieldname2 = 'fieldname2';
        // let value = 'value';
        // this.emit('field', fieldname2, value);

        //this.emit('finish');

        callback();        
    }

    _final(callback) {
        debugger;
        
        //this.file.push(null);
        callback();
    }

}

module.exports = Parser;