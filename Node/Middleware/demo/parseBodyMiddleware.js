function parseBody(req, res, next) {
    console.log(req.headers['Content-Type']);
    if (
        req.headers['Content-Type'] &&
      req.headers['Content-Type'] !== 'application/json'
    ) {
        throw new Error('Body is not json.');
    }

    let data = '';

    req.setEncoding('utf8');

    req.on('data', chunk => {
        data += chunk;
    });

    req.on('end', () => {
        req.body = JSON.parse(data);
        next(req, res);
    });
}

module.exports = parseBody;
