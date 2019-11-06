"use strict";

import { GameWindow } from './windowManager';
import { Game } from './gameState';
import { messageHandler } from './webRTCReceiver';
import { Menu } from './menu';

let calibrateContainer = document.getElementById('calibrate-container');
if (!calibrateContainer) {
  throw Error("Cannot find calibrate-container");
}
calibrateContainer.style.display = 'none';


enum states {
  QRCode,
  Calibrating,
  LevelSelect,
  Playing,
  ShowScore
}

let state = states.QRCode;

function isImage(obj: HTMLElement | null | undefined): obj is HTMLImageElement {
  if (!obj)
    return false;
  return obj.tagName === "IMG";
}



const imgElement = document.getElementById("qrcode");
if (!isImage(imgElement)) {
  throw new Error("imgElement not found or not image");
}
let address = "buonanno.tech";
let token = Math.random().toString(36).slice(2, 10)
imgElement.src = `https://api.qrserver.com/v1/create-qr-code/?data=https%3A%2F%2F${address}:3000%2Fcontroller%3F${token}&amp;size=300x300`;
messageHandler.token = token;
console.log(token);

const gameWindow = new GameWindow();

const gameState = new Game(gameWindow);
const menu = new Menu(gameWindow.ctx);

window.onresize = function () {
  gameState.onResize();
  menu.onResize();
};


/*gameWindow.canvasgl.addEventListener('mousemove', function (event) {
  let x = event.pageX - gameWindow.canvas2d.width / 2;
  let y = event.pageY - gameWindow.canvas2d.height / 2;
  // console.log(y, x);
  //gameState.addPoint(x / 100, -y / 100, 0.0);
  //gameState.moveCursor(x, y);
});*/

/*window.addEventListener('mousedown', function (_event) {
  messageHandler.sendVibrate(100);
});*/



menu.onButtonSelect = () => { messageHandler.sendVibrate(40); gameState.currentLevel.song.pause() };
menu.onButtonDeselect = () => { messageHandler.sendVibrate(20); gameState.currentLevel.song.play() };
gameState.onHit = () => { messageHandler.sendVibrate(100) };

let center_y = 0;

function subMod2Pi(source: number, delta: number) {
  let mod = 2 * Math.PI;
  return (source + mod - delta) % mod;
}

messageHandler.onRotate = function (x: number, y: number, z: number) {
  //console.log(x.toFixed(2), y.toFixed(2), z.toFixed(2));
  if (state === states.QRCode && x && y && z) {
    console.log("Scanned QR, moving to calibration!");

    // TODO
    let helloContainer = document.getElementById('hello-container');
    if (!helloContainer) {
      throw Error("Cannot find hello-container");
    }
    helloContainer.style.display = 'none';
    if (!calibrateContainer) {
      throw Error("Cannot find calibrate-container");
    }
    calibrateContainer.style.display = '';
    state = states.Calibrating;
  }
  y = subMod2Pi(y, center_y);
  if (state === states.LevelSelect) {
    menu.draw();
    menu.drawCursor(z, y);
  }
  gameState.cursor.rotate(x, y, z);
}

messageHandler.onCalibrate = function (x: number, y: number, z: number) {
  console.log("Calibrating!");
  if (state === states.Calibrating) {
    setTimeout(() => state = states.LevelSelect, 200);
    console.log("Calibrated! Moving to level select");
    if (!calibrateContainer) {
      throw Error("Cannot find calibrate-container");
    }
    calibrateContainer.style.display = 'none';
  }
  if (Math.abs(z - Math.PI) > 0.1 || Math.abs(x - Math.PI / 2) > 0.1) {
    console.warn("Phone is calibrating without being horizontal!");
  }
  let wy = Math.PI / 2;
  center_y = subMod2Pi(y, wy);
}

messageHandler.onClick = function (x: number, y: number, z: number) {
  if (state === states.Calibrating) {
    messageHandler.onCalibrate(x, y, z);
    return;
  }
  if (state === states.LevelSelect) {
    y = subMod2Pi(y, center_y);
    menu.draw();
    menu.drawCursor(z, y);
    gameState.cursor.rotate(x, y, z);
    menu.buttons.map((btn, i) => {
      if (btn.selected) {
        btn.selected = false;
        console.log(menu.levels[i], "selected! moving to Playing!");
        gameState.setLevel(menu.levels[i]);
        menu.hide();
        state = states.Playing;
      }
    });
  }
}



function backToMenu() {
  if (state !== states.Playing)
    return;
  gameState.reset();
  state = states.LevelSelect;
  menu.draw();
}

window.addEventListener('keydown', function (event) {
  if (event.keyCode == 27) // ESC
    backToMenu();
  else if (event.key == ' ') {
    if (gameState.paused)
      gameState.start()
    else
      gameState.pause();
  }
});

gameState.onLevelEnd = backToMenu;
