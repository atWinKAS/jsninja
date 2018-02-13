var extend = require('util')._extend;
var inherits = require('util').inherits;
var Transform = require('stream').Transform;

module.exports = Gateway;

inherits(Gateway, Transform);

var defaultOptions = {
    highWaterMark: 10,
    objectMode: true
};


function Gateway(options) {
    if (!(this instanceof Gateway)) {
        return new Gateway(options);
    }

    options = extend({}, options || {});
    options = extend(options, defaultOptions);

    Transform.call(this, options);
}

/// _transform
Gateway.prototype._transform = _transform;

function _transform(chunk, encoding, callback) {

    magicTransformFunction(chunk, pushed);

    function pushed(err) {
        if (err) {
            handleError(err);
        } else {

            reply = 'OK';

            callback(null, reply);
        }
    }

    function handleError(err) {
        var reply = err.message;

        callback(null, reply);
    }
};

/// Fake push to queue
function magicTransformFunction(object, callback) {
    console.log('inside magicTransformFunction');
    console.log(object);
    console.log('... end magicTransformFunction');
    setTimeout(callback, Math.floor(Math.random() * 1000));
}