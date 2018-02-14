const http = require('http');

const app = require('./middleware');
const parseBody = require('./parseBodyMiddleware');

const server = http.createServer(app);

let counter = 0;

app.use((req, res, next) => {
    counter++;
    next(req, res);
});

app.use((req, res, next) => {
    console.log('In my first MW');
    req.test = 222;

    setTimeout(() => {
        next(req, res);
    }, 2000);
    
});

app.use(parseBody);

app.use((req, res, next) => {
    console.log('In my second MW');
    console.log(req.test);
    console.log(req.body);
    
    //next(req, res);
});

//app.use(auth);



server.listen(3000, () => {
    console.log('Server started on 3000');
});
