"use strict";

import { GameWindow } from "./windowManager";
import { Game } from "./gameState";
import { messageHandler, startSignaling } from "./webRTCReceiver";
import { Menu } from "./menu";

const calibrateContainer = document.getElementById("calibrate-container");
if (!calibrateContainer) {
  throw Error("Cannot find calibrate-container");
}
calibrateContainer.style.display = "none";

enum states {
  QRCode,
  Calibrating,
  LevelSelect,
  Playing,
  ShowScore,
}

let state = states.QRCode;

function isImage(obj: HTMLElement | null | undefined): obj is HTMLImageElement {
  if (!obj) return false;
  return obj.tagName === "IMG";
}

const imgElement = document.getElementById("qrcode");
if (!isImage(imgElement)) {
  throw new Error("imgElement not found or not image");
}
const urlToken = new URLSearchParams(window.location.search).get("token");
const token = urlToken || Math.random().toString(36).slice(2, 10);

// Update URL with token so refresh reconnects to same phone
if (!urlToken) {
  const url = new URL(window.location.href);
  url.searchParams.set("token", token);
  history.replaceState(null, "", url);
}

const controllerUrl = new URL(`../controller/?${token}`, window.location.href).href;
imgElement.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(controllerUrl)}&size=300x300`;
messageHandler.token = token;
console.log(token);
startSignaling(); // Start polling for phone's offer

// Initialize game after user interaction to unlock audio
const startOverlay = document.getElementById("start-overlay");
if (!startOverlay) {
  throw Error("Cannot find start-overlay");
}

startOverlay.addEventListener("click", () => {
  startOverlay.remove();
  initGame();
});

function initGame() {
  const gameWindow = new GameWindow();
  const gameState = new Game(gameWindow);
  const menu = new Menu(gameWindow.ctx);

  window.onresize = function () {
    gameState.onResize();
    menu.onResize();
  };

  menu.onButtonSelect = () => {
    messageHandler.sendVibrate(40);
    gameState.currentLevel.song.pause();
  };
  menu.onButtonDeselect = () => {
    messageHandler.sendVibrate(20);
    gameState.currentLevel.song.play();
  };
  gameState.onHit = () => {
    messageHandler.sendVibrate(100);
  };

  let center_y = 0;

  function subMod2Pi(source: number, delta: number) {
    const mod = 2 * Math.PI;
    return (source + mod - delta) % mod;
  }

  messageHandler.onRotate = function (x: number, y: number, z: number) {
    if (state === states.QRCode && x && y && z) {
      console.log("Scanned QR, moving to calibration!");

      const helloContainer = document.getElementById("hello-container");
      if (!helloContainer) {
        throw Error("Cannot find hello-container");
      }
      helloContainer.style.display = "none";
      if (!calibrateContainer) {
        throw Error("Cannot find calibrate-container");
      }
      calibrateContainer.style.display = "";
      state = states.Calibrating;
    }
    y = subMod2Pi(y, center_y);
    if (state === states.LevelSelect) {
      menu.draw();
      menu.drawCursor(z, y);
    }
    gameState.cursor.rotate(x, y, z);
  };

  messageHandler.onCalibrate = function (x: number, y: number, z: number) {
    console.log("Calibrating!", x.toFixed(2), y.toFixed(2), z.toFixed(2));
    if (state === states.Calibrating) {
      setTimeout(() => (state = states.LevelSelect), 200);
      console.log("Calibrated! Moving to level select");
      if (!calibrateContainer) {
        throw Error("Cannot find calibrate-container");
      }
      calibrateContainer.style.display = "none";
    }
    if (Math.abs(z - Math.PI) > 0.1 || Math.abs(x - Math.PI / 2) > 0.1) {
      console.warn("Phone is calibrating without being horizontal!");
    }
    const wy = Math.PI / 2;
    center_y = subMod2Pi(y, wy);
  };

  messageHandler.onClick = function (x: number, y: number, z: number) {
    console.log("Click!", x.toFixed(2), y.toFixed(2), z.toFixed(2));
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
  };

  function backToMenu() {
    if (state !== states.Playing) return;
    gameState.reset();
    state = states.LevelSelect;
    menu.draw();
  }

  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape") backToMenu();
    else if (event.key === " ") {
      if (gameState.paused) gameState.start();
      else gameState.pause();
    }
  });

  gameState.onLevelEnd = backToMenu;
}
