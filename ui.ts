"use strict";

import { GameWindow } from './windowManager';
import { Game } from './gameState';
import { rotateX } from './geometry';

const gameWindow = new GameWindow();

const gameState = new Game(gameWindow);

window.onresize = function () {
  gameState.onResize();
};


window.addEventListener('wheel', function (_event) {
  console.log("hey!");
  rotateX(gameState.camera.viewMatrix, 0.1);
  gameState.shaderManager.setCamera(gameState.camera);
  gameState.draw();
});

setTimeout(function () { gameState.draw(); }, 1000);