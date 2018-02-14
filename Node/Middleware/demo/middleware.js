const middlewareArray = [];

app.use = (middleware) => {
    middlewareArray.push(middleware);
};


function executeMiddleware(req, res, index) {
    if (!middlewareArray[index]) {
        throw new Error('No such meddleware.');
    }
    middlewareArray[index](req, res, (request, response) => {
        executeMiddleware(request, response, index + 1);
    });
}

function app(req, res) {
    console.log('Inside middlware.');
    executeMiddleware(req, res, 0);
}

module.exports = app;