"use strict";
exports.__esModule = true;
var windowManager_1 = require("./windowManager");
var gameState_1 = require("./gameState");
var geometry_1 = require("./geometry");
var gameWindow = new windowManager_1.GameWindow();
var gameState = new gameState_1.Game(gameWindow);
window.onresize = function () {
    gameState.onResize();
};
window.addEventListener('wheel', function (_event) {
    console.log("hey!");
    geometry_1.rotateX(gameState.camera.viewMatrix, 0.1);
    gameState.shaderManager.setCamera(gameState.camera);
    gameState.draw();
});
setTimeout(function () { gameState.draw(); }, 1000);
