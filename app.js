var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const http = require('http');
const { Server } = require("socket.io");
const messages = []

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const server = http.createServer(app);

app.use(cors())
app.options('*', cors())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const io = new Server(server, {
    cors: {
        origin: "*",
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('messages', (msg) => {
        messages.push(msg);
        console.log('message: ', messages);
    });
});

server.listen("3001", () => {
    console.log(`Example app listening on port`)
})

module.exports = app;