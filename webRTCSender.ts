let senderSocket = io();

const sender = new RTCPeerConnection();
const sendChannel = sender.createDataChannel("sendChannel");

sendChannel.onopen = (_e) => console.log("Opened channel!");
sendChannel.onclose = (_e) => console.log("Closed channel!");

sender.createOffer()
    .then(offer => sender.setLocalDescription(offer))
    .then(() => {
        senderSocket.emit("sendDesc", JSON.stringify(sender.localDescription));
    });

let zAngle = 0;
let xAngle = 0;
let yAngle = 0;

senderSocket.on("recDesc", (msg: string) => {
    const rDesc = JSON.parse(msg);
    sender.setRemoteDescription(rDesc);
    setInterval(() => {
        if (sendChannel.readyState === 'open') {
            sendChannel.send(new Float32Array([zAngle, xAngle, yAngle]));
        }
    }, 15);
});


// See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained
window.addEventListener('deviceorientation', (event) => {

    // 0 is north, 180 is south
    let z = event.alpha || 0; // In degree in the range [0, 360?]

    // 0 horizontal, 90 top up, (-)180 flipped horizontal, -90 bottom up
    let x = event.beta || 0;  // In degree in the range [-180,180]

    // 0 straight, 90 right up, -90 left up
    let y = event.gamma || 0; // In degree in the range [-90,90]

    zAngle = z;
    yAngle = y;
    xAngle = x;
});