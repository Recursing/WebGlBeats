"use strict";
exports.__esModule = true;
var receiver = new RTCPeerConnection();
var channel = null;
exports.messageHandler = {
    onRotate: function (_x, _y, _z) { },
    onCalibrate: function (_x, _y, _z) { },
    sendVibrate: function (duration) {
        // console.log("called sendV");
        if (channel) {
            console.log("sending ", duration);
            channel.send(new Uint16Array([duration]));
        }
    }
};
function handleMessage(message) {
    var data = new Float32Array(message.data);
    if (data.length == 0) {
        console.log("recieved empty message, wtf?");
        console.log("data", message.data.arraybuffer);
        console.log("md", JSON.stringify(message.data));
        return;
    }
    // 0 north, 180 south
    var x = data[0] % 360; // 0 - 360
    // 0 horizontal, 90 top up, (-)180 flipped horizontal, -90 bottom up
    var y = data[1]; // -180 - 180
    // 0 straight,  90 right up, -90 left up
    var z = data[2]; // -90 - 90
    x = x / 180 * Math.PI;
    y = (y + 180) / 180 * Math.PI;
    z = (z + 90) / 180 * Math.PI;
    if (data[0] < 360) {
        exports.messageHandler.onRotate(z, x, y);
    }
    else {
        exports.messageHandler.onCalibrate(z, x, y);
    }
}
receiver.ondatachannel = function (event) {
    console.log("Wow a data channel!");
    event.channel.onmessage = handleMessage;
    event.channel.onopen = function (_e) { return console.log("Channel opened!"); };
    event.channel.onclose = function (_e) { return console.log("Channel closed!"); };
    channel = event.channel;
};
var socket = io();
socket.on('sendDesc', function (msg) {
    console.log("Received sendDesc!");
    var sendDesc = JSON.parse(msg);
    receiver.setRemoteDescription(sendDesc)
        .then(function () { return receiver.createAnswer(); })
        .then(function (ans) { return receiver.setLocalDescription(ans); })
        .then(function () {
        setTimeout(function () { return socket.emit('recDesc', JSON.stringify(receiver.localDescription)); }, 300);
    });
});
