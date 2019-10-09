"use strict";

import { GameWindow } from './windowManager';
import { Game } from './gameState';

const gameWindow = new GameWindow();

const gameState = new Game(gameWindow);

window.onresize = function () {
  gameState.onResize();
};


gameWindow.canvas2d.addEventListener('mousedown', function (event) {
  console.log("mouseDown");
  let x = event.pageX - gameWindow.canvas2d.width / 2;
  let y = event.pageY - gameWindow.canvas2d.height / 2;
  console.log(y, x);
  //gameState.addPoint(x / 100, -y / 100, 0.0);
  gameState.deleteFirstPoint();
});



setTimeout(function () { gameState.draw(); }, 1000);