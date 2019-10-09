(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var geometry_1 = require("./geometry");
var shaders_1 = require("./shaders");
var Camera = /** @class */ (function () {
    function Camera(aspectRatio) {
        this.fieldOfView = 40 * Math.PI / 180;
        this.zNear = 1.0;
        this.zFar = 1000.0;
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
var points = [[5264, 1.93, 0.065], [6193, -0.18, -0.015], [7126, 1.79, -0.285], [7771, -1.36, -0.255], [8250, 3.92, -0.245], [9283, -0.11, 2.665], [10103, 0.17, -3.165], [11119, -0.45, 2.185], [11600, -0.4, -2.255], [12115, -0.66, 3.225], [13187, -0.32, -1.895], [14045, -0.33, 3.415], [14914, -0.41, -1.775], [15445, -0.65, 2.015], [15924, -0.56, -2.555], [16934, 2.78, 0.035], [17829, -1.57, -0.145], [18813, 1.9, -0.275], [19279, -2.21, -0.225], [19735, 0.43, -0.265], [20716, -0.59, 3.165], [21636, -0.51, -2.325], [22653, -0.4, 1.455], [23169, -0.42, -2.045], [23648, -0.51, 1.135], [24518, 3.43, -0.315], [25452, -2.08, -0.475], [26410, 0.04, 2.285], [26941, 0.28, -3.455], [27472, -0.05, 2.215], [28571, -0.1, -3.625], [29353, -0.36, 2.105], [30287, 2.23, -1.185], [30892, -1.88, -0.905], [31335, 1.12, -0.565], [32357, -1.43, 1.625], [33239, 2.38, 2.535], [34070, 0.1, 3.165], [34651, 0.47, -2.175], [35158, -2.22, 0.445], [36167, 1.77, 0.185], [37075, -1.84, 2.825], [37982, 0.7, -3.165], [38512, 1.78, 2.485], [39005, 1.39, -3.775], [39989, -2.53, 2.915], [40856, -2.5, -1.115], [41839, -2.12, 2.185], [42330, -2.15, -1.605], [42835, -1.9, 2.305], [43870, 1.93, -0.045], [44715, -2.9, 0.045], [45674, 2.33, 0.145], [46142, -2.44, 0.305], [46571, 2.04, -0.105], [47605, -0.08, 2.115], [48587, -0.13, -2.185], [49482, -2.77, 0.505], [49986, 2.49, 0.005], [50441, -2.54, 0.355], [51448, 0.61, -2.905], [52343, -0.03, 2.655], [53316, 2.62, 0.345], [53874, -2.06, 0.085], [54352, 1.59, 0.035], [55248, -0.83, 3.355], [56281, -0.5, -3.265], [57127, -2.93, 0.385], [57633, 2.39, 0.295], [58137, -2.52, 0.385], [59146, 1.99, 2.885], [60105, 1.8, -3.035], [61064, 1.44, 3.255], [61607, 1.41, -1.615], [62149, 1.39, 2.645], [62945, -2.87, 3.385], [63954, -2.52, -2.455], [64861, 1.79, 2.465], [65355, 1.89, -1.715], [65870, 1.44, 1.655], [66892, -0.64, 0.135], [67723, 2.64, 0.285], [68595, -1.48, 0.415], [69211, 1.03, 2.715], [69694, 0.35, -1.815], [70687, -1.27, 0.935], [71544, 2.02, 0.475], [72376, -1.33, 0.085], [73084, 2.22, -0.045], [73450, -1.49, 0.535], [73941, 1.23, 2.595], [74447, 0.48, -2.025], [75354, -1.85, 0.635], [76073, 1.41, 0.355], [76816, -1.47, 0.395], [77219, 1.35, 0.305], [78328, -1.19, 1.305], [79298, 2.13, -0.175], [80168, -0.18, 2.115], [81264, 0.08, -1.795], [81732, 0.16, 0.915], [82223, 0.65, -2.225], [83194, 3.34, -0.105], [83885, -0.05, 0.025], [85095, 2.59, 0.375], [86029, 0.22, 0.425], [86923, -0.46, 1.985], [87845, -0.76, -2.865], [88838, -0.75, 3.345], [89846, -0.07, -0.005], [90813, -0.11, 2.455], [91835, -0.01, -0.355], [92742, -0.05, 1.965], [97577, 0.02, 0.275], [98243, 2.35, -0.035], [98585, -0.63, -0.065], [99089, -1.31, -0.025], [99391, 1.75, 0.155], [99908, -1.22, 0.155], [100161, 2.74, 0.365], [100554, -1.79, 0.785], [100994, 0.59, 0.755], [101286, 0.77, -3.005], [101752, -0.23, -1.325], [101968, 0.54, -2.635], [102435, 1.54, -0.075], [102825, -2.13, 2.645], [103104, 1.59, -2.275], [103570, 2.32, 1.145], [104024, -0.89, 1.435], [104517, -0.6, -2.065], [104796, 1.39, 0.185], [105287, -1.33, 1.595], [105744, 0.17, -1.895], [106183, 1.82, 0.555], [106701, -1.38, 1.485], [106943, 1.76, 1.945], [107548, 1.43, -2.275], [108117, 0.67, 1.735], [108585, -0.1, 0.395], [108912, 2.21, -0.515], [109457, -0.3, -0.505], [109748, -0.36, 0.655], [110177, 2.35, -2.155], [110556, -2.41, -0.425], [110860, 0.95, 1.935], [111339, 0.07, -2.425], [111794, -1.52, 1.785], [112235, 1.35, 0.975], [112487, -1.27, -1.415], [113019, -1.07, 2.345], [113472, 1.71, -1.765], [113941, 0.66, 1.625], [114421, -2.28, -0.085], [114661, 2.46, -0.405], [115268, 0.28, -2.255], [115646, 0.44, -0.165], [116013, 3.42, -2.905], [116442, -3.19, 1.855], [116696, 1.35, 0.815], [117176, 0.47, -1.285], [117440, -1.74, 2.905], [117833, 2.82, 0.515], [118288, -1.01, 0.655], [118528, 2.79, 2.095], [119037, 1.54, -1.665], [119477, 0.61, 1.765], [119955, -2.66, 1.515], [120184, -0.32, -1.485], [120677, 2.16, 2.845], [121094, -1.75, 3.335], [121567, -0.91, -1.515], [122077, 1.36, 0.855], [122317, -2.28, 2.155], [122822, -0.68, -0.395], [123440, 0.08, 3.225], [123913, 4, 0.315], [124178, -3.52, 0.375], [124667, -0.89, -1.395], [124944, -1.3, 1.995], [125440, 1.32, -1.385], [125933, 0.26, 1.065], [126249, -3.56, 0.695], [126707, 1.3, 0.065], [127198, 0.56, -3.365], [127638, -0.46, 1.405], [127892, -0.35, -0.025], [128398, 1.78, 0.585], [128827, -4.62, 1.295], [129270, 0.94, -0.215], [129726, -0.15, -2.495], [130003, -1.14, 1.885], [130510, 1.11, 0.185], [130851, -2.33, -0.225], [131255, 1.89, 1.625], [131786, -1.84, -0.795], [132064, -0.93, 2.035], [132520, 1.58, -2.045], [132711, 0.31, -1.205], [133182, 2.5, 2.745], [133631, -1.37, 1.595], [133860, -0.07, -1.075], [134366, 2.58, 2.555], [134769, -0.55, 2.985], [135326, -0.35, -0.305], [135607, 1.52, 2.885], [136041, -2.19, 3.685], [136509, 0.75, 0.415], [136939, -0.49, 3.585], [137432, -1.72, -0.795], [137723, 3.75, 0.315], [138190, -1.47, 2.445], [138434, 0.57, -2.825], [138885, 1.34, 2.525], [139318, -1.74, 2.025], [139584, 1.43, -2.975], [140084, 0.8, 1.045], [140324, -1.59, 1.405], [140753, -1.1, -2.105], [141232, 2.06, 0.085], [141512, -1.71, 2.005], [141978, -0.21, -1.045], [142396, 0.91, 1.345], [142872, -1.61, 2.265], [143150, 1.63, -2.555], [143693, -0.2, 0.305]];
var song = new Audio('crab_rave.mp3');
song.play();
song.volume = 0.1;
var woosh = new Audio('woosh.mp3');
var woosh2 = new Audio('woosh.mp3');
var woosh3 = new Audio('woosh.mp3');
var played = true;
points.sort(function (a, b) { return b[0] - a[0]; });
console.log(points[0], points[2]);
var speed = 0.1;
function HuetoRGB(hue) {
    var hue2rgb = function hue2rgb(p, q, t) {
        if (t < 0)
            t += 1;
        if (t > 1)
            t -= 1;
        if (t < 1 / 6)
            return p + (q - p) * 6 * t;
        if (t < 1 / 2)
            return q;
        if (t < 2 / 3)
            return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    var p = 0;
    var q = 1;
    var r = hue2rgb(p, q, hue + 1 / 3);
    var g = hue2rgb(p, q, hue);
    var b = hue2rgb(p, q, hue - 1 / 3);
    return [r, g, b];
}
var Game = /** @class */ (function () {
    function Game(gameWindow) {
        this.lastUpdate = null;
        var aspectRatio = gameWindow.canvas2d.width / gameWindow.canvas2d.height;
        this.camera = new Camera(aspectRatio);
        this.geometry = new geometry_1.BeveledCube(1);
        this.transformations = [];
        this.colors = [];
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            var point = points_1[_i];
            this.addPoint(point[1], point[2], -point[0] * speed / 2);
        }
        this.transformations.push(geometry_1.identityMatrix.slice());
        this.colors.push([1, 0, 0, 1]);
        /*for (let x = -12; x <= 10; x += 3) {
            for (let y = -12; y <= 10; y += 3) {
                let t = identityMatrix.slice() as mat4;
                translate(t, x, y, 0.0);
                this.transformations.push(t);
                this.colors.push([Math.random(), Math.random(), Math.random(), 1.0]);
            }
        }*/
        console.log(this.transformations.length);
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
    Game.prototype.addPoint = function (x, y, z) {
        var t = geometry_1.identityMatrix.slice();
        if (Math.abs(x) < 2 && Math.abs(y) < 2)
            x *= 2 / Math.abs(x);
        geometry_1.translate(t, x, y, z);
        this.transformations.push(t);
        var rgb = HuetoRGB(Math.random());
        this.colors.push([rgb[0], rgb[1], rgb[2], 1.0]);
        var ti = Math.round(performance.now());
        // points.push([ti, x, y]);
        // console.log(JSON.stringify(points));
    };
    Game.prototype.deleteFirstPoint = function () {
        if (this.transformations.length == 0)
            return;
        this.colors.pop();
        this.transformations.pop();
        var lastColor = this.colors[this.colors.length - 1];
        for (var i in lastColor)
            lastColor[i] = (1 + lastColor[i]);
    };
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
        if (!this.lastUpdate)
            this.lastUpdate = currentMillis;
        var dt = (currentMillis - this.lastUpdate);
        for (var _i = 0, _a = this.transformations; _i < _a.length; _i++) {
            var modelMatrix = _a[_i];
            geometry_1.translate(modelMatrix, 0, 0, speed * dt);
        }
        if (!played && this.transformations.length > 0 && this.transformations[this.transformations.length - 1][14] > -20.0) {
            if (woosh.paused)
                woosh.play();
            else if (woosh2.paused)
                woosh2.play();
            else if (woosh3.paused)
                woosh3.play();
            played = true;
        }
        while (this.transformations.length > 0 && this.transformations[this.transformations.length - 1][14] > 1.0) {
            this.deleteFirstPoint();
            played = false;
        }
        // translate(this.camera.viewMatrix, 0, 0, speed / 20 * dt);
        // this.shaderManager.setCamera(this.camera);
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

},{"./geometry":2,"./shaders":3}],2:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.identityMatrix = [1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1];
/**
* Transpose the values of a mat4
*
* @param {mat4} a the source matrix
*/
function transpose(a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    var a01 = a[1], a02 = a[2], a03 = a[3];
    var a12 = a[6], a13 = a[7];
    var a23 = a[11];
    a[1] = a[4];
    a[2] = a[8];
    a[3] = a[12];
    a[4] = a01;
    a[6] = a[9];
    a[7] = a[13];
    a[8] = a02;
    a[9] = a12;
    a[11] = a[14];
    a[12] = a03;
    a[13] = a13;
    a[14] = a23;
}
exports.transpose = transpose;
// Efficient matrix math function from https://github.com/toji/gl-matrix/blob/master/src/mat4.js
/**
 * Multiplies two mat4s
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
function multiply(a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    var out = a;
    // Cache only the current line of the second matrix
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
}
exports.multiply = multiply;
/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function invert(a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32;
    // Calculate the determinant
    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) {
        throw new Error("Cannot invert singular matrix!");
    }
    det = 1.0 / det;
    var out = a;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
}
exports.invert = invert;
/**
* [TODO] understand
 * see https://www.songho.ca/opengl/gl_projectionmatrix.html
 * see https://stackoverflow.com/questions/28286057/trying-to-understand-the-math-behind-the-perspective-matrix-in-webgl/28301213#28301213
 * see http://ogldev.atspace.co.uk/www/tutorial12/tutorial12.html
 * see https://github.com/toji/gl-matrix
 * Generates a perspective projection matrix with the given bounds
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */
function makePerspectiveMatrix(fovy, aspect, near, far) {
    var out = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var f = 1.0 / Math.tan(fovy / 2);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;
    if (far != null && far !== Infinity) {
        var nf = 1 / (near - far);
        out[10] = (far + near) * nf;
        out[14] = (2 * far * near) * nf;
    }
    else {
        out[10] = -1;
        out[14] = -2 * near;
    }
    return out;
}
exports.makePerspectiveMatrix = makePerspectiveMatrix;
function makeTranslationMatrix(x, y, z) {
    // Row major form
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    ];
}
exports.makeTranslationMatrix = makeTranslationMatrix;
// [TODO] see wikipedia
// https://github.com/toji/gl-matrix/blob/master/src/mat4.js
function translate(m, x, y, z) {
    m[12] = m[0] * x + m[4] * y + m[8] * z + m[12];
    m[13] = m[1] * x + m[5] * y + m[9] * z + m[13];
    m[14] = m[2] * x + m[6] * y + m[10] * z + m[14];
    m[15] = m[3] * x + m[7] * y + m[11] * z + m[15];
}
exports.translate = translate;
function scale(m, x, y, z) {
    m[0] *= x;
    m[1] *= x;
    m[2] *= x;
    m[3] *= x;
    m[4] *= y;
    m[5] *= y;
    m[6] *= y;
    m[7] *= y;
    m[8] *= z;
    m[9] *= z;
    m[10] *= z;
    m[11] *= z;
}
exports.scale = scale;
function rotateX(m, rad) {
    var sin = Math.sin(rad);
    var cos = Math.cos(rad);
    var a10 = m[4];
    var a11 = m[5];
    var a12 = m[6];
    var a13 = m[7];
    var a20 = m[8];
    var a21 = m[9];
    var a22 = m[10];
    var a23 = m[11];
    m[4] = a10 * cos + a20 * sin;
    m[5] = a11 * cos + a21 * sin;
    m[6] = a12 * cos + a22 * sin;
    m[7] = a13 * cos + a23 * sin;
    m[8] = a20 * cos - a10 * sin;
    m[9] = a21 * cos - a11 * sin;
    m[10] = a22 * cos - a12 * sin;
    m[11] = a23 * cos - a13 * sin;
}
exports.rotateX = rotateX;
// [TODO] see wikipedia
// https://github.com/toji/gl-matrix/blob/master/src/mat4.js
function rotateY(m, rad) {
    var sin = Math.sin(rad);
    var cos = Math.cos(rad);
    var a00 = m[0];
    var a01 = m[1];
    var a02 = m[2];
    var a03 = m[3];
    var a20 = m[8];
    var a21 = m[9];
    var a22 = m[10];
    var a23 = m[11];
    m[0] = a00 * cos - a20 * sin;
    m[1] = a01 * cos - a21 * sin;
    m[2] = a02 * cos - a22 * sin;
    m[3] = a03 * cos - a23 * sin;
    m[8] = a00 * sin + a20 * cos;
    m[9] = a01 * sin + a21 * cos;
    m[10] = a02 * sin + a22 * cos;
    m[11] = a03 * sin + a23 * cos;
}
exports.rotateY = rotateY;
var BeveledCube = /** @class */ (function () {
    function BeveledCube(bevel) {
        if (bevel === void 0) { bevel = 0; }
        this.bevel = bevel;
    }
    BeveledCube.prototype.getVertices = function () {
        var e = this.bevel;
        var vertices = [
            // Front face
            -1.0, -1.0, 1.0 + e,
            1.0, -1.0, 1.0 + e,
            1.0, 1.0, 1.0 + e,
            -1.0, 1.0, 1.0 + e,
            // Back face
            -1.0, -1.0, -1.0 - e,
            -1.0, 1.0, -1.0 - e,
            1.0, 1.0, -1.0 - e,
            1.0, -1.0, -1.0 - e,
            // Top face
            -1.0, 1.0 + e, -1.0,
            -1.0, 1.0 + e, 1.0,
            1.0, 1.0 + e, 1.0,
            1.0, 1.0 + e, -1.0,
            // Bottom face
            -1.0, -1.0 - e, -1.0,
            1.0, -1.0 - e, -1.0,
            1.0, -1.0 - e, 1.0,
            -1.0, -1.0 - e, 1.0,
            // Right face
            1.0 + e, -1.0, -1.0,
            1.0 + e, 1.0, -1.0,
            1.0 + e, 1.0, 1.0,
            1.0 + e, -1.0, 1.0,
            // Left face
            -1.0 - e, -1.0, -1.0,
            -1.0 - e, -1.0, 1.0,
            -1.0 - e, 1.0, 1.0,
            -1.0 - e, 1.0, -1.0,
            // Bevel
            // Left-bottom
            -1 - e, -1, 1.0,
            -1 - e, -1, -1.0,
            -1, -1 - e, 1.0,
            -1, -1 - e, -1.0,
            // Left-top
            -1 - e, 1, 1.0,
            -1 - e, 1, -1.0,
            -1, 1 + e, 1.0,
            -1, 1 + e, -1.0,
            // Left-back
            -1 - e, 1.0, -1,
            -1 - e, -1.0, -1,
            -1, 1.0, -1 - e,
            -1, -1.0, -1 - e,
            // Left-Forward
            -1 - e, 1.0, 1,
            -1 - e, -1.0, 1,
            -1, 1.0, 1 + e,
            -1, -1.0, 1 + e,
            // Right-bottom
            1 + e, -1, 1.0,
            1 + e, -1, -1.0,
            1, -1 - e, 1.0,
            1, -1 - e, -1.0,
            1 + e, 1, 1.0,
            1 + e, 1, -1.0,
            1, 1 + e, 1.0,
            1, 1 + e, -1.0,
            1 + e, 1.0, -1,
            1 + e, -1.0, -1,
            1, 1.0, -1 - e,
            1, -1.0, -1 - e,
            1 + e, 1.0, 1,
            1 + e, -1.0, 1,
            1, 1.0, 1 + e,
            1, -1.0, 1 + e,
            1.0, -1 - e, -1,
            -1.0, -1 - e, -1,
            1.0, -1, -1 - e,
            -1.0, -1, -1 - e,
            1.0, -1 - e, 1,
            -1.0, -1 - e, 1,
            1.0, -1, 1 + e,
            -1.0, -1, 1 + e,
            1.0, 1 + e, -1,
            -1.0, 1 + e, -1,
            1.0, 1, -1 - e,
            -1.0, 1, -1 - e,
            1.0, 1 + e, 1,
            -1.0, 1 + e, 1,
            1.0, 1, 1 + e,
            -1.0, 1, 1 + e,
            // corner triangles
            1 + e, 1, 1,
            1, 1 + e, 1,
            1, 1, 1 + e,
            1 + e, 1, -1,
            1, 1 + e, -1,
            1, 1, -1 - e,
            1 + e, -1, 1,
            1, -1 - e, 1,
            1, -1, 1 + e,
            1 + e, -1, -1,
            1, -1 - e, -1,
            1, -1, -1 - e,
            -1 - e, 1, 1,
            -1, 1 + e, 1,
            -1, 1, 1 + e,
            -1 - e, 1, -1,
            -1, 1 + e, -1,
            -1, 1, -1 - e,
            -1 - e, -1, 1,
            -1, -1 - e, 1,
            -1, -1, 1 + e,
            -1 - e, -1, -1,
            -1, -1 - e, -1,
            -1, -1, -1 - e
        ];
        return vertices;
    };
    BeveledCube.prototype.getNormals = function () {
        var normals = [
            // Front face
            0, 0, 1.0,
            0, 0, 1.0,
            0, 0, 1.0,
            0, 0, 1.0,
            // Back face
            0, 0, -1.0,
            0, 0, -1.0,
            0, 0, -1.0,
            0, 0, -1.0,
            // Top face
            0, 1.0, 0,
            0, 1.0, 0,
            0, 1.0, 0,
            0, 1.0, 0,
            // Bottom face
            0, -1.0, 0,
            0, -1.0, 0,
            0, -1.0, 0,
            0, -1.0, 0,
            // Right face
            1.0, 0, 0,
            1.0, 0, 0,
            1.0, 0, 0,
            1.0, 0, 0,
            // Left face
            -1.0, 0, 0,
            -1.0, 0, 0,
            -1.0, 0, 0,
            -1.0, 0, 0,
            // Bevel
            // Left-Bottom
            -0.7071067811865476, -0.7071067811865476, 0,
            -0.7071067811865476, -0.7071067811865476, 0,
            -0.7071067811865476, -0.7071067811865476, 0,
            -0.7071067811865476, -0.7071067811865476, 0,
            // Left-Top
            -0.7071067811865476, 0.7071067811865476, 0,
            -0.7071067811865476, 0.7071067811865476, 0,
            -0.7071067811865476, 0.7071067811865476, 0,
            -0.7071067811865476, 0.7071067811865476, 0,
            // ...
            -0.7071067811865476, 0, -0.7071067811865476,
            -0.7071067811865476, 0, -0.7071067811865476,
            -0.7071067811865476, 0, -0.7071067811865476,
            -0.7071067811865476, 0, -0.7071067811865476,
            -0.7071067811865476, 0, 0.7071067811865476,
            -0.7071067811865476, 0, 0.7071067811865476,
            -0.7071067811865476, 0, 0.7071067811865476,
            -0.7071067811865476, 0, 0.7071067811865476,
            0.7071067811865476, -0.7071067811865476, 0,
            0.7071067811865476, -0.7071067811865476, 0,
            0.7071067811865476, -0.7071067811865476, 0,
            0.7071067811865476, -0.7071067811865476, 0,
            0.7071067811865476, 0.7071067811865476, 0,
            0.7071067811865476, 0.7071067811865476, 0,
            0.7071067811865476, 0.7071067811865476, 0,
            0.7071067811865476, 0.7071067811865476, 0,
            0.7071067811865476, 0, -0.7071067811865476,
            0.7071067811865476, 0, -0.7071067811865476,
            0.7071067811865476, 0, -0.7071067811865476,
            0.7071067811865476, 0, -0.7071067811865476,
            0.7071067811865476, 0, 0.7071067811865476,
            0.7071067811865476, 0, 0.7071067811865476,
            0.7071067811865476, 0, 0.7071067811865476,
            0.7071067811865476, 0, 0.7071067811865476,
            0, -0.7071067811865476, -0.7071067811865476,
            0, -0.7071067811865476, -0.7071067811865476,
            0, -0.7071067811865476, -0.7071067811865476,
            0, -0.7071067811865476, -0.7071067811865476,
            0, -0.7071067811865476, 0.7071067811865476,
            0, -0.7071067811865476, 0.7071067811865476,
            0, -0.7071067811865476, 0.7071067811865476,
            0, -0.7071067811865476, 0.7071067811865476,
            0, 0.7071067811865476, -0.7071067811865476,
            0, 0.7071067811865476, -0.7071067811865476,
            0, 0.7071067811865476, -0.7071067811865476,
            0, 0.7071067811865476, -0.7071067811865476,
            0, 0.7071067811865476, 0.7071067811865476,
            0, 0.7071067811865476, 0.7071067811865476,
            0, 0.7071067811865476, 0.7071067811865476,
            0, 0.7071067811865476, 0.7071067811865476,
            // Triangles
            0.5773502691896257, 0.5773502691896257, 0.5773502691896257,
            0.5773502691896257, 0.5773502691896257, 0.5773502691896257,
            0.5773502691896257, 0.5773502691896257, 0.5773502691896257,
            0.5773502691896257, 0.5773502691896257, -0.5773502691896257,
            0.5773502691896257, 0.5773502691896257, -0.5773502691896257,
            0.5773502691896257, 0.5773502691896257, -0.5773502691896257,
            0.5773502691896257, -0.5773502691896257, 0.5773502691896257,
            0.5773502691896257, -0.5773502691896257, 0.5773502691896257,
            0.5773502691896257, -0.5773502691896257, 0.5773502691896257,
            0.5773502691896257, -0.5773502691896257, -0.5773502691896257,
            0.5773502691896257, -0.5773502691896257, -0.5773502691896257,
            0.5773502691896257, -0.5773502691896257, -0.5773502691896257,
            -0.5773502691896257, 0.5773502691896257, 0.5773502691896257,
            -0.5773502691896257, 0.5773502691896257, 0.5773502691896257,
            -0.5773502691896257, 0.5773502691896257, 0.5773502691896257,
            -0.5773502691896257, 0.5773502691896257, -0.5773502691896257,
            -0.5773502691896257, 0.5773502691896257, -0.5773502691896257,
            -0.5773502691896257, 0.5773502691896257, -0.5773502691896257,
            -0.5773502691896257, -0.5773502691896257, 0.5773502691896257,
            -0.5773502691896257, -0.5773502691896257, 0.5773502691896257,
            -0.5773502691896257, -0.5773502691896257, 0.5773502691896257,
            -0.5773502691896257, -0.5773502691896257, -0.5773502691896257,
            -0.5773502691896257, -0.5773502691896257, -0.5773502691896257,
            -0.5773502691896257, -0.5773502691896257, -0.5773502691896257
        ];
        return normals;
    };
    BeveledCube.prototype.getTriangleIndices = function () {
        // Indices related to getVertices, face triangles
        var indices = [
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            0, 1, 2, 0, 2, 3,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23,
            // Bevel
            24, 25, 26, 25, 26, 27,
            28, 29, 30, 29, 30, 31,
            32, 33, 34, 33, 34, 35,
            36, 37, 38, 37, 38, 39,
            40, 41, 42, 41, 42, 43,
            44, 45, 46, 45, 46, 47,
            48, 49, 50, 49, 50, 51,
            52, 53, 54, 53, 54, 55,
            56, 57, 58, 57, 58, 59,
            60, 61, 62, 61, 62, 63,
            64, 65, 66, 65, 66, 67,
            68, 69, 70, 69, 70, 71,
            72, 73, 74, 75, 76, 77,
            78, 79, 80, 81, 82, 83,
            84, 85, 86, 87, 88, 89,
            90, 91, 92, 93, 94, 95
        ];
        return indices;
    };
    return BeveledCube;
}());
exports.BeveledCube = BeveledCube;

},{}],3:[function(require,module,exports){
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var geometry_1 = require("./geometry");
var vertexShaderSource = "\n\n// an attribute is an input (in) to a vertex shader.\n// It will receive data from a buffer\nattribute vec4 aVertexPosition;\nattribute vec4 aVertexNormal;\n\n// Uniforms are passed by js\nuniform mat4 uModelViewMatrix;\nuniform mat4 uNormalMatrix;\nuniform mat4 uProjectionMatrix;\nuniform vec4 uVertexColor;\n\n// varying will go to fragmentShader\nvarying lowp vec4 vColor;\n\n// all shaders have a main function\nvoid main() {\n\n  // gl_Position is a special variable a vertex shader\n  // is responsible for setting\n  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;\n  highp vec3 directionalVector = normalize(vec3(-0.5, 0.6, 1.0));\n  vec3 v = (uNormalMatrix * aVertexNormal).xyz;\n  highp float directional = max(dot(normalize(v), directionalVector), 0.0) * 0.8;\n  vColor = vec4((directional+0.2) * uVertexColor.xyz, 1.0);\n}\n";
var fragmentShaderSource = "\n\n// fragment shaders don't have a default precision so we need\n// to pick one. \"only using highp in both vertex and fragment shaders is safer\"\nprecision highp float;\n\n// varying are passed from the vertex shader\nvarying lowp vec4 vColor;\nvoid main(void) {\n  gl_FragColor = vColor;\n}\n";
// Compile vertex or fragment shader
function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    if (shader) {
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
    }
    console.warn("Error creating shader:");
    console.log(shader == null ? "null" : gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error("Error creating shader!");
}
// Link vertex and fragment shaders
function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    if (program) {
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }
    }
    console.warn("Error creating program:");
    console.log(program == null ? "null" : gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error("Error creating program!");
}
var Locations = /** @class */ (function () {
    function Locations(program, gl) {
        this.uProjectionMatrix = this.tryGetLocation("uProjectionMatrix", program, gl);
        this.uModelViewMatrix = this.tryGetLocation("uModelViewMatrix", program, gl);
        this.uNormalMatrix = this.tryGetLocation("uNormalMatrix", program, gl);
        this.uVertexColor = this.tryGetLocation("uVertexColor", program, gl);
        this.aVertexPosition = this.tryGetLocation("aVertexPosition", program, gl);
        this.aVertexNormal = this.tryGetLocation("aVertexNormal", program, gl);
    }
    Locations.prototype.tryGetLocation = function (name, program, gl) {
        console.log("name " + name);
        var maybeLoc = name[0] === 'a' ? gl.getAttribLocation(program, name) : gl.getUniformLocation(program, name);
        if (maybeLoc !== null) {
            console.log(maybeLoc);
            return maybeLoc;
        }
        throw Error("Cannot get " + name + " location!");
    };
    return Locations;
}());
var ShaderManager = /** @class */ (function () {
    function ShaderManager(gl) {
        this.triangleNumber = 0;
        this.gl = gl;
        var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (!vertexShader || !fragmentShader) {
            alert("Failed to create shaders!");
            throw new Error("Failed to create shaders!");
        }
        var maybeProgram = createProgram(gl, vertexShader, fragmentShader);
        if (!maybeProgram) {
            alert("Failed to create program!");
            throw new Error("Failed to create program!");
        }
        this.program = maybeProgram;
        gl.useProgram(this.program);
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things
        this.locations = new Locations(this.program, this.gl);
        this.positionBuffer = gl.createBuffer();
        this.normalsBuffer = gl.createBuffer();
    }
    ShaderManager.prototype.setCamera = function (camera) {
        // Set the shader uniforms
        this.gl.uniformMatrix4fv(this.locations.uProjectionMatrix, false, camera.perspectiveMatrix);
        this.gl.uniformMatrix4fv(this.locations.uModelViewMatrix, false, camera.viewMatrix);
        var normalMatrix = __spreadArrays(camera.viewMatrix);
        geometry_1.transpose(geometry_1.invert(normalMatrix));
        this.gl.uniformMatrix4fv(this.locations.uNormalMatrix, false, normalMatrix);
    };
    ShaderManager.prototype.setModelViewMatrix = function (modelViewMatrix) {
        this.gl.uniformMatrix4fv(this.locations.uModelViewMatrix, false, modelViewMatrix);
        var normalMatrix = __spreadArrays(modelViewMatrix);
        geometry_1.transpose(geometry_1.invert(normalMatrix));
        this.gl.uniformMatrix4fv(this.locations.uNormalMatrix, false, normalMatrix);
    };
    ShaderManager.prototype.setVertices = function (positions) {
        // Create a buffer for the cube's vertex positions.
        var gl = this.gl;
        var positionBuffer = this.positionBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        var numComponents = 3;
        var type = gl.FLOAT;
        var normalize = false;
        var stride = 0;
        var offset = 0;
        var vertexPosition = this.locations.aVertexPosition;
        gl.vertexAttribPointer(vertexPosition, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(vertexPosition);
    };
    ShaderManager.prototype.setNormals = function (normals) {
        var gl = this.gl;
        var normalsBuffer = this.normalsBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        var numComponents = 3;
        var type = gl.FLOAT;
        var normalize = false;
        var stride = 0;
        var offset = 0;
        var normalsPosition = this.locations.aVertexNormal;
        gl.vertexAttribPointer(normalsPosition, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(normalsPosition);
    };
    ShaderManager.prototype.setTriangles = function (indices) {
        var gl = this.gl;
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        this.triangleNumber = indices.length;
    };
    ShaderManager.prototype.setColor = function (color) {
        this.gl.uniform4fv(this.locations.uVertexColor, color);
    };
    ShaderManager.prototype.clear = function () {
        var gl = this.gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0, 0.1, 0.2, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    };
    ShaderManager.prototype.draw = function () {
        // this.clear();
        var gl = this.gl;
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        gl.drawElements(primitiveType, this.triangleNumber, gl.UNSIGNED_SHORT, offset);
    };
    return ShaderManager;
}());
exports.ShaderManager = ShaderManager;

},{"./geometry":2}],4:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var windowManager_1 = require("./windowManager");
var gameState_1 = require("./gameState");
var gameWindow = new windowManager_1.GameWindow();
var gameState = new gameState_1.Game(gameWindow);
window.onresize = function () {
    gameState.onResize();
};
gameWindow.canvas2d.addEventListener('mousedown', function (event) {
    console.log("mouseDown");
    var x = event.pageX - gameWindow.canvas2d.width / 2;
    var y = event.pageY - gameWindow.canvas2d.height / 2;
    console.log(y, x);
    //gameState.addPoint(x / 100, -y / 100, 0.0);
    gameState.deleteFirstPoint();
});
setTimeout(function () { gameState.draw(); }, 1000);

},{"./gameState":1,"./windowManager":5}],5:[function(require,module,exports){
"use strict";
exports.__esModule = true;
function isCanvas(obj) {
    if (!obj)
        return false;
    return obj.tagName === 'CANVAS';
}
var oldX = -1, oldY = -1;
var GameWindow = /** @class */ (function () {
    function GameWindow() {
        var _this = this;
        var maybeCanvas = document.getElementById("webglcanvas");
        if (!isCanvas(maybeCanvas)) {
            alert("Webgl canvas not foud!");
            throw Error("Canvas not found!");
        }
        this.canvasgl = maybeCanvas;
        this.canvasgl.oncontextmenu = function () { return false; };
        var maybeGl = this.canvasgl.getContext("webgl", {
            antialias: true,
            depth: true
        });
        console.log("hey!");
        if (!maybeGl) {
            alert("webgl not foud!");
            throw Error("webgl not found!");
        }
        this.gl = maybeGl;
        maybeCanvas = document.getElementById("canvas2d");
        if (!isCanvas(maybeCanvas)) {
            alert("2d canvas not foud!");
            throw Error("Canvas not found!");
        }
        this.canvas2d = maybeCanvas;
        this.canvas2d.oncontextmenu = function () { return false; };
        this.fillWindow();
        this.canvas2d.addEventListener('mousemove', function (event) { return _this.onMouseMove(event); });
    }
    GameWindow.prototype.onMouseMove = function (event) {
        if (oldX < 0 || oldY < 0) {
            oldX = event.pageX;
            oldY = event.pageY;
            return;
        }
        var ctx = this.canvas2d.getContext("2d");
        if (!ctx) {
            alert("Can't create canvas context!");
            throw new Error("Can't create canvas context!");
        }
        ctx.clearRect(0, 0, this.canvas2d.width, this.canvas2d.height);
        ctx.beginPath();
        ctx.moveTo(oldX, oldY);
        ctx.lineTo(event.pageX, event.pageY);
        ctx.stroke();
        oldX = event.pageX;
        oldY = event.pageY;
    };
    GameWindow.prototype.fillWindow = function () {
        this.canvasgl.width = this.canvas2d.width = window.innerWidth;
        this.canvasgl.height = this.canvas2d.height = window.innerHeight;
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    };
    return GameWindow;
}());
exports.GameWindow = GameWindow;

},{}]},{},[4]);
