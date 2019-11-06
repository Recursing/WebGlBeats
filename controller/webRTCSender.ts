let token = window.location.search.substr(1)
debug(token);
let senderSocket = io();
const server = { urls: "stun:stun.l.google.com:19302" };
const sender = new RTCPeerConnection({ iceServers: [server] });
sender.ondatachannel = _e => (debug("ondatachannel!"));
sender.oniceconnectionstatechange = e => debug(sender.iceConnectionState);

const sendChannel = sender.createDataChannel("sendChannel");

sendChannel.onopen = (_e) => debug("Opened channel!");
sendChannel.onclose = (_e) => debug("Closed channel!");
sendChannel.binaryType = "arraybuffer";

senderSocket.on("recDesc", (msg: string) => {
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
    const rDesc = new RTCSessionDescription({ type: "answer", sdp: msg });
    sender.setRemoteDescription(rDesc).catch(debug);
    debug("Is this unreachable?");
});

sender.createOffer()
    .then(offer => sender.setLocalDescription(offer))
    .catch(debug);

sender.onicecandidate = e => {
    debug("ice  candidate " + JSON.stringify(e));
    if (e.candidate) return;
    if (!sender.localDescription) {
        alert("Empty local description!");
        return;
    }
    senderSocket.emit("sendDesc", token + "|-|" + sender.localDescription.sdp);
}

let zAngle = 0;
let xAngle = 0;
let yAngle = 0;

// See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained
window.addEventListener('deviceorientation', (event) => {

    // 0 is north, 180 is south
    let z = event.alpha || 0; // In degree in the range [0, 360]

    // 0 horizontal, 90 top up, (-)180 flipped horizontal, -90 bottom up
    let x = event.beta || 0;  // In degree in the range [-180,180]

    // 0 straight, 90 right up, -90 left up
    let y = event.gamma || 0; // In degree in the range [-90,90]

    zAngle = z;
    yAngle = y;
    xAngle = x;

    if (sendChannel.readyState === 'open') {
        sendChannel.send(JSON.stringify([zAngle, xAngle, yAngle]));
    }
});

let touches = 0;
let multiTouched = false;
window.addEventListener('touchstart', (event) => {
    // debug('touchstart: ' + touches);
    let touchEvents = event.changedTouches;
    if (touches > 0 || touchEvents.length > 1) {
        if (sendChannel.readyState === 'open') {
            debug("MULTI PRESS");
            window.navigator.vibrate(160);
            sendChannel.send(JSON.stringify([zAngle + 360, xAngle, yAngle]));
        }
        multiTouched = true;
    }
    touches += touchEvents.length;
});
window.addEventListener('touchend', (event) => {
    // debug('touchend: ' + touches);
    let touchEvents = event.changedTouches;
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

function debug(txt: string) {
    let p = document.createElement("p");
    p.innerText = txt;
    document.body.appendChild(p);
}

sendChannel.onmessage = (event) => {
    // debug("got message!");
    let data = new Uint16Array(event.data);
    if (data.length !== 1) {
        debug("Recieved wrong data " + data[0]);
    }
    // debug(event.toString());
    // debug(event.data.toString());
    let success = window.navigator.vibrate(data[0] || 100);
    if (!success) {
        debug("cannot vibrate! :(");
    } else {
        debug("vibrated " + (data[0] || 100));
    }
};
