var fs = require('fs');
var express = require('express');
var app = express();
app.use(express.static('.'));


var privateKey = fs.readFileSync('/etc/letsencrypt/live/buonanno.tech/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/buonanno.tech/fullchain.pem', 'utf8');
var credentials = { key: privateKey, cert: certificate };
var https = require('https').createServer(credentials, app);
var io = require('socket.io')(https);

io.on('connection', function (socket) {
    console.log('a user connected: ' + socket.handshake.address);
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


https.listen(3000, function () {
    console.log('Open https://buonanno.tech:3000 ');
});
