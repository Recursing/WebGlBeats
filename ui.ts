"use strict";

import { GameWindow } from './windowManager';
import { Game } from './gameState';
import { messageHandler } from './webRTCReceiver';
import { Menu } from './menu';
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
const menu = new Menu(gameWindow.ctx);

window.onresize = function () {
  gameState.onResize();
};


gameWindow.canvasgl.addEventListener('mousemove', function (event) {
  let x = event.pageX - gameWindow.canvas2d.width / 2;
  let y = event.pageY - gameWindow.canvas2d.height / 2;
  // console.log(y, x);
  //gameState.addPoint(x / 100, -y / 100, 0.0);
  gameState.moveCursor(x, y);
});

gameWindow.canvasgl.addEventListener('mousedown', function (_event) {
  messageHandler.sendVibrate(100);
});

menu.onButtonSelect = () => messageHandler.sendVibrate(100);
menu.onButtonDeselect = () => messageHandler.sendVibrate(50);

let firstRotation = true;
let cy = 0;

function subMod2Pi(source: number, delta: number, mod = 2 * Math.PI) {
  return (source + mod - delta) % mod;
}

messageHandler.onRotate = function (x: number, y: number, z: number) {
  //console.log(x.toFixed(2), y.toFixed(2), z.toFixed(2));
  if (firstRotation && x && y && z) {
    firstRotation = false;
    console.log(x, y, z);
    console.log(x.toFixed(2), y.toFixed(2), z.toFixed(2));
    cy = 0;
    gameState.start();
    let helloContainer = document.getElementById('hello-container');
    if (!helloContainer) {
      throw Error("Cannot find hello-container");
    }
    helloContainer.style.display = 'none';
  }
  y = subMod2Pi(y, cy);
  menu.draw();
  menu.drawCursor(z, y);
  gameState.rotateController(x, y, z);
}

messageHandler.onCalibrate = function (x: number, y: number, z: number) {
  console.log("Calibrating!");

  if (Math.abs(z - Math.PI) > 0.1 || Math.abs(x - Math.PI / 2) > 0.1) {
    console.warn("Phone is calibrating without being horizontal!");
  }
  let wy = Math.PI / 2;
  cy = (y - wy) % Math.PI;
}