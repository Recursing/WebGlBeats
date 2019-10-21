import { rotateTo } from './ui';

const receiver = new RTCPeerConnection();

function handleMessage(message: MessageEvent) {

    const data = new Float32Array(message.data);
    // 0 north, 180 south
    let x = data[0]; // 0 - 360

    // 0 horizontal, 90 top up, (-)180 flipped horizontal, -90 bottom up
    let y = data[1]; // -180 - 180

    // 0 straight,  90 right up, -90 left up
    let z = data[2]; // -90 - 90

    x = x / 180 * Math.PI;
    y = (y + 180) / 180 * Math.PI;
    z = (z + 90) / 180 * Math.PI;
    rotateTo(z, x, y);
}

receiver.ondatachannel = (event) => {
    console.log("Wow a data channel!");
    event.channel.onmessage = handleMessage;
    event.channel.onopen = (_e) => console.log("Channel opened!");
    event.channel.onclose = (_e) => console.log("Channel closed!");
};

let socket = io();
socket.on('sendDesc', (msg: string) => {
    console.log("Received sendDesc!");
    const sendDesc = JSON.parse(msg);
    receiver.setRemoteDescription(sendDesc)
        .then(() => receiver.createAnswer())
        .then(ans => receiver.setLocalDescription(ans))
        .then(() => {
            setTimeout(() => socket.emit('recDesc', JSON.stringify(receiver.localDescription)), 300);
        });
});
