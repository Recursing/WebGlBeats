"use strict";
var senderSocket = io();
var sender = new RTCPeerConnection();
var sendChannel = sender.createDataChannel("sendChannel");
sendChannel.onopen = function (_e) { return console.log("Opened channel!"); };
sendChannel.onclose = function (_e) { return console.log("Closed channel!"); };
sender.createOffer()
    .then(function (offer) { return sender.setLocalDescription(offer); })
    .then(function () {
    senderSocket.emit("sendDesc", JSON.stringify(sender.localDescription));
});
var zAngle = 0;
var xAngle = 0;
var yAngle = 0;
senderSocket.on("recDesc", function (msg) {
    var rDesc = JSON.parse(msg);
    sender.setRemoteDescription(rDesc);
    setInterval(function () {
        if (sendChannel.readyState === 'open') {
            sendChannel.send(new Float32Array([zAngle, xAngle, yAngle]));
        }
    }, 15);
});
// See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained
window.addEventListener('deviceorientation', function (event) {
    // 0 is north, 180 is south
    var z = event.alpha || 0; // In degree in the range [0, 360]
    // 0 horizontal, 90 top up, (-)180 flipped horizontal, -90 bottom up
    var x = event.beta || 0; // In degree in the range [-180,180]
    // 0 straight, 90 right up, -90 left up
    var y = event.gamma || 0; // In degree in the range [-90,90]
    zAngle = z;
    yAngle = y;
    xAngle = x;
});
var touches = 0;
var multiTouched = false;
window.addEventListener('touchstart', function (event) {
    // debug('touchstart: ' + touches);
    var touchEvents = event.changedTouches;
    if (touches > 0 || touchEvents.length > 1) {
        if (sendChannel.readyState === 'open') {
            debug("MULTI PRESS");
            window.navigator.vibrate(100);
            sendChannel.send(new Float32Array([zAngle + 360, xAngle, yAngle]));
        }
        multiTouched = true;
    }
    touches += touchEvents.length;
});
window.addEventListener('touchend', function (event) {
    // debug('touchend: ' + touches);
    var touchEvents = event.changedTouches;
    if (!multiTouched && touches == 1 && sendChannel.readyState === 'open') {
        debug('PRESS BUTTON');
        window.navigator.vibrate(50);
        sendChannel.send(new Float32Array([zAngle + 720, xAngle, yAngle]));
    }
    touches -= touchEvents.length;
    if (touches == 0) {
        multiTouched = false;
    }
});
function debug(txt) {
    var p = document.createElement("p");
    p.innerText = txt;
    document.body.appendChild(p);
}
sendChannel.onmessage = function (event) {
    // debug("got message!");
    var data = new Uint16Array(event.data);
    if (data.length !== 1) {
        debug("Recieved wrong data " + data[0]);
    }
    // debug(event.toString());
    // debug(event.data.toString());
    var success = window.navigator.vibrate(data[0] || 100);
    if (!success) {
        debug("cannot vibrate! :(");
    }
};
