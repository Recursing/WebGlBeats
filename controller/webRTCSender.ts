import { sendOffer, pollForAnswer } from "./signaling";
import { SEND_INTERVAL_MS } from "../config";

function debug(txt: string) {
  const p = document.createElement("p");
  p.innerText = txt;
  document.body.appendChild(p);

  // Keep only last 100 messages
  const messages = document.body.getElementsByTagName("p");
  while (messages.length > 100) {
    messages[0].remove();
  }

  // Auto-scroll to bottom
  window.scrollTo(0, document.body.scrollHeight);
}

const token = window.location.search.slice(1);
debug(token);
const server = { urls: "stun:stun.l.google.com:19302" };
const sender = new RTCPeerConnection({ iceServers: [server] });
sender.ondatachannel = (_e) => debug("ondatachannel!");
sender.oniceconnectionstatechange = (_e) => debug(sender.iceConnectionState);

const sendChannel = sender.createDataChannel("sendChannel");
(window as any).sendChannel = sendChannel; // Expose for testing

sendChannel.onopen = (_e) => {
  debug("Opened channel!");
};
sendChannel.onclose = (_e) => debug("Closed channel!");
sendChannel.binaryType = "arraybuffer";

let offerSent = false;

sender
  .createOffer()
  .then((offer) => sender.setLocalDescription(offer))
  .catch(debug);

sender.onicecandidate = (e) => {
  debug("ice candidate " + (e.candidate ? "found" : "gathering complete"));
  // Send offer after gathering complete to include all candidates
  if (!offerSent && !e.candidate && sender.localDescription) {
    offerSent = true;
    debug("Sending offer via HTTP");
    sendOffer(token, sender.localDescription.sdp)
      .then(() => {
        debug("Offer sent, polling for answer...");
        return pollForAnswer(token);
      })
      .then((answerSdp) => {
        debug("Received answer!");
        if (sender.signalingState !== "have-local-offer") {
          debug("Received answer without having an offer!");
          return;
        }
        const rDesc = new RTCSessionDescription({
          type: "answer",
          sdp: answerSdp,
        });
        return sender.setRemoteDescription(rDesc);
      })
      .catch(debug);
  }
};

let zAngle = 0;
let xAngle = 0;
let yAngle = 0;
let lastSendTime = 0;

// See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained
window.addEventListener("deviceorientation", (event) => {
  // 0 is north, 180 is south
  let z = event.alpha || 0; // In degree in the range [0, 360]

  // 0 horizontal, 90 top up, (-)180 flipped horizontal, -90 bottom up
  let x = event.beta || 0; // In degree in the range [-180,180]

  // 0 straight, 90 right up, -90 left up
  let y = event.gamma || 0; // In degree in the range [-90,90]

  zAngle = z;
  yAngle = y;
  xAngle = x;

  const now = Date.now();
  if (
    sendChannel.readyState === "open" &&
    now - lastSendTime >= SEND_INTERVAL_MS
  ) {
    lastSendTime = now;
    sendChannel.send(JSON.stringify([zAngle, xAngle, yAngle]));
  }
});

let touches = 0;
let multiTouched = false;
const dummyAudio = new Audio("../audio/dearly_beloved.mp3");
dummyAudio.volume = 0.05;
dummyAudio.loop = true;

window.addEventListener("touchstart", (event) => {
  // debug('touchstart: ' + touches);
  let touchEvents = event.changedTouches;
  if (touches > 0 || touchEvents.length > 1) {
    if (sendChannel.readyState === "open") {
      debug("MULTI PRESS " + touchEvents.length);
      window.navigator.vibrate?.(160);
      sendChannel.send(JSON.stringify([zAngle + 360, xAngle, yAngle]));
    }
    multiTouched = true;
  }
  touches += touchEvents.length;
  if (dummyAudio.paused) dummyAudio.play();
});

window.addEventListener("touchend", (event) => {
  // debug('touchend: ' + touches);
  let touchEvents = event.changedTouches;
  if (!multiTouched && touches == 1 && sendChannel.readyState === "open") {
    debug("PRESS BUTTON" + JSON.stringify([zAngle + 720, xAngle, yAngle]));
    sendChannel.send(JSON.stringify([zAngle + 720, xAngle, yAngle]));
    window.navigator.vibrate?.(80);
  }
  touches -= touchEvents.length;
  if (touches == 0) {
    multiTouched = false;
  }
});

sendChannel.onmessage = (event) => {
  // debug("got message!");
  let data = new Uint16Array(event.data);
  if (data.length !== 1) {
    debug("Recieved wrong data " + data[0]);
  }
  // debug(event.toString());
  // debug(event.data.toString());
  let success = window.navigator?.vibrate(data[0] || 100);
  if (!success) {
    debug("cannot vibrate! :(");
  } else {
    debug("vibrated " + (data[0] || 100));
  }
};
