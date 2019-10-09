"use strict";
exports.__esModule = true;
var geometry_1 = require("./geometry");
var shaders_1 = require("./shaders");
var Camera = /** @class */ (function () {
    function Camera(aspectRatio) {
        this.fieldOfView = 45 * Math.PI / 180;
        this.zNear = 1.0;
        this.zFar = 100.0;
        this.aspectRatio = 1.0;
        this.perspectiveMatrix = geometry_1.makePerspectiveMatrix(this.fieldOfView, aspectRatio, this.zNear, this.zFar);
        this.viewMatrix = geometry_1.makeTranslationMatrix(0, 0, -12);
    }
    Camera.prototype.setAspectRatio = function (aspectRatio) {
        this.perspectiveMatrix = geometry_1.makePerspectiveMatrix(this.fieldOfView, aspectRatio, this.zNear, this.zFar);
    };
    return Camera;
}());
exports.Camera = Camera;
var Game = /** @class */ (function () {
    function Game(gameWindow) {
        this.lastUpdate = null;
        var aspectRatio = gameWindow.canvas2d.width / gameWindow.canvas2d.height;
        this.camera = new Camera(aspectRatio);
        this.geometry = new geometry_1.BeveledCube(1);
        this.transformations = [geometry_1.identityMatrix];
        this.colors = [[1, 0, 0, 1]];
        for (var x = -10; x <= 10; x++) {
            for (var y = -10; y <= 10; y++) {
                for (var z = -20; z <= -5.0; z++) {
                    this.transformations.push(geometry_1.makeTranslationMatrix(x + Math.random() / 40, y + 2 - Math.random() / 40, z));
                    this.colors.push([Math.random(), Math.random(), Math.random(), 1.0]);
                }
            }
        }
        console.log(this.transformations.length);
        for (var _i = 0, _a = this.transformations; _i < _a.length; _i++) {
            var t = _a[_i];
            geometry_1.scale(t, 0.25, 0.25, 0.25);
        }
        this.gameWindow = gameWindow;
        this.shaderManager = new shaders_1.ShaderManager(gameWindow.gl);
        this.shaderManager.setCamera(this.camera);
        this.shaderManager.setVertices(this.geometry.getVertices());
        this.shaderManager.setNormals(this.geometry.getNormals());
        this.shaderManager.setTriangles(this.geometry.getTriangleIndices());
        this.shaderManager.setColor([1.0, 0, 0, 1.0]);
        this.draw();
        console.log("hmmm");
        this.tick(0);
    }
    Game.prototype.onResize = function () {
        console.log("resize");
        this.gameWindow.fillWindow();
        var aspectRatio = this.gameWindow.canvas2d.width / this.gameWindow.canvas2d.height;
        this.camera.setAspectRatio(aspectRatio);
        this.shaderManager.setCamera(this.camera);
    };
    Game.prototype.draw = function () {
        // TODO
        this.shaderManager.draw();
    };
    Game.prototype.update = function (currentMillis) {
        var speed = 0.01;
        if (!this.lastUpdate)
            this.lastUpdate = currentMillis;
        var dt = (currentMillis - this.lastUpdate);
        for (var _i = 0, _a = this.transformations; _i < _a.length; _i++) {
            var modelMatrix = _a[_i];
            geometry_1.rotateX(modelMatrix, 0.001 * dt);
            geometry_1.rotateY(modelMatrix, 0.0003 * dt);
            geometry_1.translate(modelMatrix, 0, 0, speed * dt);
        }
        geometry_1.translate(this.camera.viewMatrix, 0, 0, speed / 20 * dt);
        this.shaderManager.setCamera(this.camera);
        var bpm = 125;
        var phase = (currentMillis * bpm / 60000) % 1;
        phase = phase * 2 - 1;
        var cubeModel = new geometry_1.BeveledCube(Math.exp(-10 * phase * phase) / 4 + 0.05);
        this.shaderManager.setVertices(cubeModel.getVertices());
        this.lastUpdate = currentMillis;
    };
    Game.prototype.tick = function (dt) {
        var _this = this;
        // Stress testing browsers for fun
        this.update(dt);
        this.shaderManager.clear();
        for (var i in this.transformations) {
            this.shaderManager.setColor(this.colors[i]);
            var modelViewMatrix = this.camera.viewMatrix.slice();
            geometry_1.multiply(modelViewMatrix, this.transformations[i]);
            this.shaderManager.setModelViewMatrix(modelViewMatrix);
            this.draw();
        }
        requestAnimationFrame(function (dt) { _this.tick(dt); });
    };
    return Game;
}());
exports.Game = Game;
