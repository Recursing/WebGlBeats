"use strict";
exports.__esModule = true;
var server = { urls: "stun:stun.l.google.com:19302" };
var receiver = new RTCPeerConnection({ iceServers: [server] });
var channel = null;
exports.messageHandler = {
    token: "",
    onRotate: function (_x, _y, _z) { },
    onCalibrate: function (_x, _y, _z) { },
    onClick: function (_x, _y, _z) { },
    sendVibrate: function (duration) {
        if (channel) {
            channel.send(new Uint16Array([duration]));
        }
    }
};
function handleMessage(message) {
    // console.log("Handling a message!");
    var data = JSON.parse(message.data);
    if (data.length == 0) {
        console.warn("Failed to parse data! AAAARGH!");
        console.log("data", message.data);
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
    else if (data[0] < 720) {
        exports.messageHandler.onCalibrate(z, x, y);
    }
    else {
        exports.messageHandler.onClick(z, x, y);
    }
}
receiver.ondatachannel = function (event) {
    console.log("Wow a data channel!");
    event.channel.binaryType = "arraybuffer";
    event.channel.onmessage = handleMessage;
    event.channel.onopen = function (_e) { return console.log("Channel opened!"); };
    event.channel.onclose = function (_e) { return console.log("Channel closed!"); };
    channel = event.channel;
};
receiver.oniceconnectionstatechange = function (_e) { return console.log(receiver.iceConnectionState); };
var socket = io();
socket.on('sendDesc', function (msg) {
    if (msg.split("|-|")[0] != exports.messageHandler.token) {
        return;
    }
    msg = msg.split("|-|")[1];
    if (receiver.signalingState != "stable") {
        alert("Oh no! Receiver is not stable yet!");
        return;
    }
    console.log("Received sendDesc!");
    var sendDesc = new RTCSessionDescription({ type: "offer", sdp: msg });
    receiver.setRemoteDescription(sendDesc)
        .then(function () { return receiver.createAnswer(); })
        .then(function (ans) { return receiver.setLocalDescription(ans); })["catch"](console.log);
    receiver.onicecandidate = function (e) {
        if (e.candidate) {
            console.log("Received candidate!");
            return;
        }
        if (!receiver.localDescription) {
            alert("receiver.localDescription is null");
            return;
        }
        socket.emit('recDesc', exports.messageHandler.token + "|-|" + receiver.localDescription.sdp);
    };
});
