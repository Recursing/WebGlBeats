"use strict";

import { GameWindow } from './windowManager';
import { Game } from './gameState';
import { messageHandler } from './webRTCReceiver';
function isImage(obj: HTMLElement | null | undefined): obj is HTMLImageElement {
  if (!obj)
    return false;
  return obj.tagName === "IMG";
}


fetch("localIP")
  .then((response) => response.text())
  .then((address) => {
    const imgElement = document.getElementById("qrcode");
    if (!isImage(imgElement)) {
      throw new Error("imgElement not found or not image");
    }
    imgElement.src = `https://api.qrserver.com/v1/create-qr-code/?data=http%3A%2F%2F${address}:3000/w.html&amp;size=300x300`;
  });

const gameWindow = new GameWindow();

const gameState = new Game(gameWindow);

window.onresize = function () {
  gameState.onResize();
};


gameWindow.canvas2d.addEventListener('mousemove', function (event) {
  let x = event.pageX - gameWindow.canvas2d.width / 2;
  let y = event.pageY - gameWindow.canvas2d.height / 2;
  console.log(y, x);
  //gameState.addPoint(x / 100, -y / 100, 0.0);
  gameState.moveCursor(x, y);
});

let firstRotation = true;
messageHandler.onRotate = function (x: number, y: number, z: number) {
  if (firstRotation && x && y && z) {
    firstRotation = false;
    gameState.start();
  }
  gameState.rotateController(x, y, z);
}