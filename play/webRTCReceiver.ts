const server = { urls: "stun:stun.l.google.com:19302" };

const receiver = new RTCPeerConnection({ iceServers: [server] });
let channel: RTCDataChannel | null = null;
export let messageHandler = {
    token: "",
    onRotate: function (_x: number, _y: number, _z: number) { },
    onCalibrate: function (_x: number, _y: number, _z: number) { },
    onClick: function (_x: number, _y: number, _z: number) { },
    sendVibrate: function (duration: number) {
        if (channel) {
            channel.send(new Uint16Array([duration]));
        }
    }
}

function handleMessage(this: RTCDataChannel, message: MessageEvent) {
    // console.log("Handling a message!");
    const data = JSON.parse(message.data);
    if (data.length == 0) {
        console.warn("Failed to parse data! AAAARGH!");
        console.log("data", message.data);
        console.log("md", JSON.stringify(message.data));
        return;
    }
    // 0 north, 180 south
    let x = data[0] % 360; // 0 - 360

    // 0 horizontal, 90 top up, (-)180 flipped horizontal, -90 bottom up
    let y = data[1]; // -180 - 180

    // 0 straight,  90 right up, -90 left up
    let z = data[2]; // -90 - 90

    x = x / 180 * Math.PI;
    y = (y + 180) / 180 * Math.PI;
    z = (z + 90) / 180 * Math.PI;
    if (data[0] < 360) {
        messageHandler.onRotate(z, x, y);
    } else if (data[0] < 720) {
        messageHandler.onCalibrate(z, x, y);
    } else {
        messageHandler.onClick(z, x, y);
    }
}

receiver.ondatachannel = (event) => {
    console.log("Wow a data channel!");
    event.channel.binaryType = "arraybuffer";
    event.channel.onmessage = handleMessage;
    event.channel.onopen = (_e) => console.log("Channel opened!");
    event.channel.onclose = (_e) => console.log("Channel closed!");
    channel = event.channel;
};

receiver.oniceconnectionstatechange = _e => console.log(receiver.iceConnectionState);


let socket = io();
socket.on('sendDesc', (msg: string) => {
    if (msg.split("|-|")[0] != messageHandler.token) {
        return;
    }
    msg = msg.split("|-|")[1];
    if (receiver.signalingState != "stable") {
        alert("Oh no! Receiver is not stable yet!");
        return;
    }
    console.log("Received sendDesc!");
    const sendDesc = new RTCSessionDescription({ type: "offer", sdp: msg });
    receiver.setRemoteDescription(sendDesc)
        .then(() => receiver.createAnswer())
        .then(ans => receiver.setLocalDescription(ans)).catch(console.log);

    receiver.onicecandidate = e => {
        if (e.candidate) {
            console.log("Received candidate!");
            return;
        }
        if (!receiver.localDescription) {
            alert("receiver.localDescription is null")
            return;
        }
        socket.emit('recDesc', messageHandler.token + "|-|" + receiver.localDescription.sdp);
    };
});