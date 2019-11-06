"use strict";
var token = window.location.search.substr(1);
debug(token);
var senderSocket = io();
var server = { urls: "stun:stun.l.google.com:19302" };
var sender = new RTCPeerConnection({ iceServers: [server] });
sender.ondatachannel = function (_e) { return (debug("ondatachannel!")); };
sender.oniceconnectionstatechange = function (e) { return debug(sender.iceConnectionState); };
var sendChannel = sender.createDataChannel("sendChannel");
sendChannel.onopen = function (_e) { return debug("Opened channel!"); };
sendChannel.onclose = function (_e) { return debug("Closed channel!"); };
sendChannel.binaryType = "arraybuffer";
senderSocket.on("recDesc", function (msg) {
    if (msg.split("|-|")[0] != token) {
        return;
    }
    msg = msg.split("|-|")[1];
    debug("recDesc Entry");
    if (sender.signalingState != "have-local-offer") {
        debug("Recieved answer without having an offer!");
        return;
    }
    debug("recDesc");
    var rDesc = new RTCSessionDescription({ type: "answer", sdp: msg });
    sender.setRemoteDescription(rDesc)["catch"](debug);
    debug("Is this unreachable?");
});
sender.createOffer()
    .then(function (offer) { return sender.setLocalDescription(offer); })["catch"](debug);
sender.onicecandidate = function (e) {
    debug("ice  candidate " + JSON.stringify(e));
    if (e.candidate)
        return;
    if (!sender.localDescription) {
        alert("Empty local description!");
        return;
    }
    senderSocket.emit("sendDesc", token + "|-|" + sender.localDescription.sdp);
};
var zAngle = 0;
var xAngle = 0;
var yAngle = 0;
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
    if (sendChannel.readyState === 'open') {
        sendChannel.send(JSON.stringify([zAngle, xAngle, yAngle]));
    }
});
var touches = 0;
var multiTouched = false;
var dummyAudio = new Audio("../audio/dearly_beloved.mp3");
dummyAudio.volume = 0.05;
dummyAudio.loop = true;
window.addEventListener('touchstart', function (event) {
    // debug('touchstart: ' + touches);
    var touchEvents = event.changedTouches;
    if (touches > 0 || touchEvents.length > 1) {
        if (sendChannel.readyState === 'open') {
            debug("MULTI PRESS");
            window.navigator.vibrate(160);
            sendChannel.send(JSON.stringify([zAngle + 360, xAngle, yAngle]));
        }
        multiTouched = true;
    }
    touches += touchEvents.length;
    if (dummyAudio.paused)
        dummyAudio.play();
});
window.addEventListener('touchend', function (event) {
    // debug('touchend: ' + touches);
    var touchEvents = event.changedTouches;
    if (!multiTouched && touches == 1 && sendChannel.readyState === 'open') {
        debug('PRESS BUTTON');
        window.navigator.vibrate(80);
        sendChannel.send(JSON.stringify([zAngle + 720, xAngle, yAngle]));
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
    else {
        debug("vibrated " + (data[0] || 100));
    }
};
