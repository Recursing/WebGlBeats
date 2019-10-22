var express = require('express');
var app = express();
app.use(express.static('.'))
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let getLocalIP = function () {
    var os = require('os');
    var ifaces = os.networkInterfaces();
    let address = null;
    Object.keys(ifaces).forEach(function (ifname) {
        ifaces[ifname].forEach(function (iface) {
            // Skip non-ipv4 and internal (i.e. 127.0.0.1) addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                address = iface.address;
            }
        });
    });
    return address;
}

app.get('/localIP', function (req, res) {
    res.send(getLocalIP());
});

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
    console.log('Open http://127.0.0.1:3000 on chrome/chromium, scan the code, and open with Firefox');
});