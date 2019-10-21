var express = require('express');
var app = express();
app.use(express.static('.'))
var http = require('http').createServer(app);
var io = require('socket.io')(http);

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
    socket.on("sendDesc", function (msg) {
        io.emit("sendDesc", msg);
    });
    socket.on("recDesc", function (msg) {
        io.emit("recDesc", msg);
    });
});


http.listen(3000, function () {
    console.log('listening on *:3000');
});