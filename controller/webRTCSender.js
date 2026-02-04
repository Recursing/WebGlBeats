"use strict";
(() => {
  // config.ts
  var SIGNALING_SERVER = "https://huge-weasel-83.recursing.deno.net";
  var POLLING_INTERVAL_MS = 1e3;
  var SEND_INTERVAL_MS = 20;

  // controller/signaling.ts
  async function sendOffer(token2, offer) {
    await fetch(`${SIGNALING_SERVER}/offer/${token2}`, {
      method: "POST",
      body: offer
    });
  }
  async function pollForAnswer(token2) {
    while (true) {
      const res = await fetch(`${SIGNALING_SERVER}/answer/${token2}`);
      const data = await res.json();
      if (data.answer) {
        return data.answer;
      }
      await new Promise((r) => setTimeout(r, POLLING_INTERVAL_MS));
    }
  }

  // controller/webRTCSender.ts
  function debug(txt) {
    const p = document.createElement("p");
    p.innerText = txt;
    document.body.appendChild(p);
    const messages = document.body.getElementsByTagName("p");
    while (messages.length > 100) {
      messages[0].remove();
    }
    window.scrollTo(0, document.body.scrollHeight);
  }
  var token = window.location.search.slice(1);
  debug(token);
  var server = { urls: "stun:stun.l.google.com:19302" };
  var sender = new RTCPeerConnection({ iceServers: [server] });
  sender.ondatachannel = (_e) => debug("ondatachannel!");
  sender.oniceconnectionstatechange = (_e) => debug(sender.iceConnectionState);
  var sendChannel = sender.createDataChannel("sendChannel");
  window.sendChannel = sendChannel;
  sendChannel.onopen = (_e) => {
    debug("Opened channel!");
  };
  sendChannel.onclose = (_e) => debug("Closed channel!");
  sendChannel.binaryType = "arraybuffer";
  var offerSent = false;
  sender.createOffer().then((offer) => sender.setLocalDescription(offer)).catch(debug);
  sender.onicecandidate = (e) => {
    debug("ice candidate " + (e.candidate ? "found" : "gathering complete"));
    if (!offerSent && !e.candidate && sender.localDescription) {
      offerSent = true;
      debug("Sending offer via HTTP");
      sendOffer(token, sender.localDescription.sdp).then(() => {
        debug("Offer sent, polling for answer...");
        return pollForAnswer(token);
      }).then((answerSdp) => {
        debug("Received answer!");
        if (sender.signalingState !== "have-local-offer") {
          debug("Received answer without having an offer!");
          return;
        }
        const rDesc = new RTCSessionDescription({
          type: "answer",
          sdp: answerSdp
        });
        return sender.setRemoteDescription(rDesc);
      }).catch(debug);
    }
  };
  var zAngle = 0;
  var xAngle = 0;
  var yAngle = 0;
  var lastSendTime = 0;
  window.addEventListener("deviceorientation", (event) => {
    let z = event.alpha || 0;
    let x = event.beta || 0;
    let y = event.gamma || 0;
    zAngle = z;
    yAngle = y;
    xAngle = x;
    const now = Date.now();
    if (sendChannel.readyState === "open" && now - lastSendTime >= SEND_INTERVAL_MS) {
      lastSendTime = now;
      sendChannel.send(JSON.stringify([zAngle, xAngle, yAngle]));
    }
  });
  var touches = 0;
  var multiTouched = false;
  var dummyAudio = new Audio("../audio/dearly_beloved.mp3");
  dummyAudio.volume = 0.05;
  dummyAudio.loop = true;
  window.addEventListener("touchstart", (event) => {
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
    let data = new Uint16Array(event.data);
    if (data.length !== 1) {
      debug("Recieved wrong data " + data[0]);
    }
    let success = window.navigator?.vibrate(data[0] || 100);
    if (!success) {
      debug("cannot vibrate! :(");
    } else {
      debug("vibrated " + (data[0] || 100));
    }
  };
})();
//# sourceMappingURL=webRTCSender.js.map
