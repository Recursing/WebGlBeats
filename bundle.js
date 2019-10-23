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
        this.viewMatrix = geometry_1.makeTranslationMatrix(0, -0.5, -6);
    }
    Camera.prototype.setAspectRatio = function (aspectRatio) {
        this.perspectiveMatrix = geometry_1.makePerspectiveMatrix(this.fieldOfView, aspectRatio, this.zNear, this.zFar);
    };
    return Camera;
}());
exports.Camera = Camera;
var Note = /** @class */ (function () {
    function Note(time, x, y, hue) {
        this.time = time;
        this.x = x;
        this.y = y;
        this.hue = hue;
    }
    return Note;
}());
var Level = /** @class */ (function () {
    function Level(songPath, bpm, points, speed) {
        if (speed === void 0) { speed = 0.1; }
        this.song = new Audio(songPath);
        this.bpm = bpm;
        this.notes = points;
        this.speed = speed;
    }
    Level.prototype.startSong = function () {
        console.log(this.song);
        this.song.play();
    };
    return Level;
}());
exports.Level = Level;
var woosh = new Audio('woosh.mp3');
var woosh2 = new Audio('woosh.mp3');
var woosh3 = new Audio('woosh.mp3');
var played = true;
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
var Cursor = /** @class */ (function () {
    function Cursor() {
    }
    return Cursor;
}());
exports.Cursor = Cursor;
var Game = /** @class */ (function () {
    function Game(gameWindow) {
        this.lastUpdate = null;
        this.cursorProjectionHistory = [];
        this.paused = true;
        var aspectRatio = gameWindow.canvas2d.width / gameWindow.canvas2d.height;
        this.camera = new Camera(aspectRatio);
        this.geometry = new geometry_1.BeveledCube(1);
        this.transformations = [];
        this.colors = [];
        // TODO load default or get level in constructor
        this.currentLevel = new Level('crab_rave.mp3', 125, []);
        for (var _i = 0, _a = this.currentLevel.notes; _i < _a.length; _i++) {
            var point = _a[_i];
            this.addPoint(point.x, point.y, -point.time * this.currentLevel.speed / 2);
        }
        this.cursorProjectionTrail = [geometry_1.identityMatrix()];
        this.colors.push([1, 0, 0, 1]);
        /*for (let x = -12; x <= 10; x += 3) {
            for (let y = -12; y <= 10; y += 3) {
                let t = identityMatrix.slice() as mat4;
                translate(t, x, y, 0.0);
                this.transformations.push(t);
                this.colors.push([Math.random(), Math.random(), Math.random(), 1.0]);
            }
        }
        console.log(this.transformations.length); */
        this.gameWindow = gameWindow;
        this.shaderManager = new shaders_1.ShaderManager(gameWindow.gl);
        this.shaderManager.setCamera(this.camera);
        this.shaderManager.setVertices(this.geometry.getVertices());
        this.shaderManager.setNormals(this.geometry.getNormals());
        this.shaderManager.setTriangles(this.geometry.getTriangleIndices());
        this.shaderManager.setColor([1.0, 0, 0, 1.0]);
        //this.draw();
        this.tick(0);
    }
    Game.prototype.start = function () {
        this.paused = false;
        this.currentLevel.startSong();
        this.tick(0);
    };
    Game.prototype.addPoint = function (x, y, z) {
        var t = geometry_1.identityMatrix();
        if (Math.abs(x) < 2 && Math.abs(y) < 2)
            x *= 2 / Math.abs(x);
        geometry_1.translate(t, x, y, z);
        this.transformations.push(t);
        var rgb = HuetoRGB(Math.random());
        this.colors.push([rgb[0], rgb[1], rgb[2], 1.0]);
        // let ti = Math.round(performance.now());
        // points.push([ti, x, y]);
        // console.log(JSON.stringify(points));
    };
    Game.prototype.moveCursor = function (x, y) {
        var newCursor = geometry_1.identityMatrix();
        geometry_1.rotateX(newCursor, 0.1);
        geometry_1.rotateY(newCursor, 0.1);
        geometry_1.translate(newCursor, x / 100, -y / 100 + 4, -10);
        this.cursorProjectionTrail.push(newCursor);
        // this.cursorProjectionHistory.push([this.currentLevel.song.currentTime, newCursor]);
        while (this.cursorProjectionTrail.length > 100) {
            this.cursorProjectionTrail.shift();
        }
        // console.log(JSON.stringify(this.cursorProjectionHistory));
    };
    Game.prototype.rotateController = function (x, y, z) {
        var newCursor = geometry_1.identityMatrix();
        geometry_1.translate(newCursor, 0, 0, 2);
        // console.log("x y z: ", Math.floor(x), Math.floor(y), Math.floor(z));
        geometry_1.rotateY(newCursor, y);
        geometry_1.rotateZ(newCursor, z);
        geometry_1.rotateX(newCursor, -x);
        geometry_1.translate(newCursor, -4, 0, 0);
        // scale(newCursor, 5, 0.5, 0.1);
        this.cursorProjectionTrail.push(newCursor);
        while (this.cursorProjectionTrail.length > 100) {
            this.cursorProjectionTrail.shift();
        }
        this.cursorProjectionHistory.push([this.currentLevel.song.currentTime, newCursor]);
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
        this.shaderManager.clear();
        for (var i in this.transformations) {
            this.shaderManager.setColor(this.colors[i]);
            var modelViewMatrix = this.camera.viewMatrix.slice();
            geometry_1.multiply(modelViewMatrix, this.transformations[i]);
            this.shaderManager.setModelViewMatrix(modelViewMatrix);
            this.shaderManager.draw();
        }
        outer: for (var i = this.cursorProjectionTrail.length - 1; i > 0; i--) {
            for (var interp_number = 0; interp_number < 10; interp_number++) {
                var interp_factor = interp_number / 10;
                var reversed_index = this.cursorProjectionTrail.length - 1 - i;
                var scale_factor = 1 - (reversed_index - interp_factor) / 20;
                scale_factor *= scale_factor;
                if (scale_factor < 0.5) {
                    break outer;
                }
                var color_factor = scale_factor * 2 - 1;
                var r = (0.05 + color_factor * 0.05);
                var g = r;
                var b = 0.1 + color_factor * 0.9;
                this.shaderManager.setColor([r, g, b, 1]);
                var tempModelMatrix = this.camera.viewMatrix.slice();
                var interpolatedMatrix = geometry_1.interpolate(this.cursorProjectionTrail[i], this.cursorProjectionTrail[i - 1], interp_factor);
                geometry_1.multiply(tempModelMatrix, interpolatedMatrix);
                geometry_1.scale(tempModelMatrix, scale_factor * 2, scale_factor * 0.1, scale_factor * scale_factor * 0.025);
                this.shaderManager.setModelViewMatrix(tempModelMatrix);
                this.shaderManager.draw();
                this.shaderManager.setColor([b, r, g, 1]);
                tempModelMatrix = this.camera.viewMatrix.slice();
                var oppositeCursor = this.cursorProjectionTrail[i].slice();
                geometry_1.translate(oppositeCursor, 8, 0, 0);
                var prevOppositeCursor = this.cursorProjectionTrail[i - 1].slice();
                geometry_1.translate(prevOppositeCursor, 8, 0, 0);
                interpolatedMatrix = geometry_1.interpolate(oppositeCursor, prevOppositeCursor, interp_factor);
                geometry_1.multiply(tempModelMatrix, interpolatedMatrix);
                geometry_1.scale(tempModelMatrix, scale_factor * 2, scale_factor * 0.1, scale_factor * scale_factor * 0.025);
                this.shaderManager.setModelViewMatrix(tempModelMatrix);
                this.shaderManager.draw();
            }
        }
    };
    Game.prototype.update = function (currentMillis) {
        if (!this.lastUpdate)
            this.lastUpdate = currentMillis;
        var dt = (currentMillis - this.lastUpdate);
        for (var _i = 0, _a = this.transformations; _i < _a.length; _i++) {
            var modelMatrix = _a[_i];
            geometry_1.translate(modelMatrix, 0, 0, this.currentLevel.speed * dt);
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
        var phase = (currentMillis * this.currentLevel.bpm / 60000) % 1;
        phase = phase * 2 - 1;
        var cubeModel = new geometry_1.BeveledCube(Math.exp(-10 * phase * phase) / 3 + 0.1);
        this.shaderManager.setVertices(cubeModel.getVertices());
        this.lastUpdate = currentMillis;
    };
    Game.prototype.tick = function (dt) {
        var _this = this;
        // Stress testing browsers for fun
        if (!this.paused) {
            this.update(dt);
        }
        this.draw();
        requestAnimationFrame(function (dt) { _this.tick(dt); });
    };
    return Game;
}());
exports.Game = Game;

},{"./geometry":2,"./shaders":4}],2:[function(require,module,exports){
"use strict";
exports.__esModule = true;
function identityMatrix() {
    return [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1];
}
exports.identityMatrix = identityMatrix;
function interpolate(m1, m2, t) {
    var m0 = identityMatrix();
    for (var i = 0; i < 15; i++) {
        m0[i] = (m1[i] * t + m2[i] * (1 - t));
    }
    return m0;
}
exports.interpolate = interpolate;
function multiInterpolate(mats, t) {
    // TODO
    var m0 = identityMatrix();
    var order = mats.length;
    for (var i = 0; i < 15; i++) {
        m0[i] = 0;
        for (var j = 0; j < order; j++) {
            m0[i] += mats[j][i] * t; // TODO
        }
    }
    return m0;
}
exports.multiInterpolate = multiInterpolate;
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
/**
 * Rotates a matrix by the given angle around the Z axis
 */
function rotateZ(m, rad) {
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    var a00 = m[0];
    var a01 = m[1];
    var a02 = m[2];
    var a03 = m[3];
    var a10 = m[4];
    var a11 = m[5];
    var a12 = m[6];
    var a13 = m[7];
    // Perform axis-specific matrix multiplication
    m[0] = a00 * c + a10 * s;
    m[1] = a01 * c + a11 * s;
    m[2] = a02 * c + a12 * s;
    m[3] = a03 * c + a13 * s;
    m[4] = a10 * c - a00 * s;
    m[5] = a11 * c - a01 * s;
    m[6] = a12 * c - a02 * s;
    m[7] = a13 * c - a03 * s;
}
exports.rotateZ = rotateZ;
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
exports.__esModule = true;
var Button = /** @class */ (function () {
    function Button(x, y, w, h, text) {
        this.selected = false;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
    }
    Button.prototype.draw = function (ctx) {
        var x = this.x;
        var y = this.y;
        var width = this.w;
        var height = this.h;
        var text = this.text;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 10;
        ctx.fillStyle = this.selected ? "rgba(169, 252, 3, 1)" : "rgba(252, 169, 3, 1)";
        ctx.beginPath();
        ctx.moveTo(x + 10, y);
        ctx.lineTo(x + width - 10, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + 10);
        ctx.lineTo(x + width, y + height - 10);
        ctx.quadraticCurveTo(x + width, y + height, x + width - 10, y + height);
        ctx.lineTo(x + 10, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - 10);
        ctx.lineTo(x, y + 10);
        ctx.quadraticCurveTo(x, y, x + 10, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.fillStyle = "rgba(255,255,255, 1)";
        var textMetrics = ctx.measureText(text);
        ctx.strokeText(text, x + width / 2 - textMetrics.width / 2, y + height / 2 + 10);
        ctx.fillText(text, x + width / 2 - textMetrics.width / 2, y + height / 2 + 10);
    };
    Button.prototype.contains = function (y, x) {
        return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
    };
    return Button;
}());
var Menu = /** @class */ (function () {
    function Menu(canvas) {
        this.options = ["Crab Rave", "Mountain King", "Help"];
        this.onButtonSelect = function () { };
        this.onButtonDeselect = function () { };
        this.canvas2d = canvas;
        var btnWidth = 600;
        var btnHeight = 120;
        var padTop = 30;
        var padLeft = (this.canvas2d.canvas.width - btnWidth) / 2;
        this.buttons = this.options.map(function (text, i) {
            return new Button(padLeft, (btnHeight + padTop) * (i + 1), btnWidth, btnHeight, text);
        });
    }
    Menu.prototype.drawButton = function (y, x, height, width, text) {
        var ctx = this.canvas2d;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 10;
        ctx.fillStyle = "rgba(252, 169, 3, 1)";
        ctx.beginPath();
        ctx.moveTo(x + 10, y);
        ctx.lineTo(x + width - 10, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + 10);
        ctx.lineTo(x + width, y + height - 10);
        ctx.quadraticCurveTo(x + width, y + height, x + width - 10, y + height);
        ctx.lineTo(x + 10, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - 10);
        ctx.lineTo(x, y + 10);
        ctx.quadraticCurveTo(x, y, x + 10, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.fillStyle = "rgba(255,255,255, 1)";
        var textMetrics = ctx.measureText(text);
        ctx.strokeText(text, x + width / 2 - textMetrics.width / 2, y + height / 2 + 10);
        ctx.fillText(text, x + width / 2 - textMetrics.width / 2, y + height / 2 + 10);
    };
    Menu.prototype.drawCursor = function (yAngle, xAngle) {
        var _this = this;
        var y0 = Math.PI;
        var x0 = Math.PI / 2;
        yAngle -= y0;
        xAngle -= x0;
        var menuDistance = 800;
        var xCenter = this.canvas2d.canvas.width / 2;
        var yCenter = this.canvas2d.canvas.height / 2;
        var cx = xCenter + Math.tan(-xAngle) * menuDistance;
        var cy = yCenter - Math.tan(yAngle) * menuDistance + 30;
        var ctx = this.canvas2d;
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(200,200,255,0.9)';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0,50,0,0.8)';
        ctx.stroke();
        this.buttons.map(function (btn) {
            if (btn.contains(cy, cx) && !btn.selected) {
                _this.onButtonSelect();
                btn.selected = true;
            }
            if (!btn.contains(cy, cx) && btn.selected) {
                _this.onButtonDeselect();
                btn.selected = false;
            }
        });
    };
    Menu.prototype.draw = function () {
        var _this = this;
        this.canvas2d.fillStyle = "rgba(92, 166, 209, 0.9)";
        this.canvas2d.fillRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
        this.canvas2d.font = "30px Arial";
        var instructions = "Point at the screen and tap with two fingers to calibrate rotation";
        var textMetrics = this.canvas2d.measureText(instructions);
        this.canvas2d.fillStyle = "rgba(0, 0, 0, 1)";
        this.canvas2d.fillText(instructions, 10 + this.canvas2d.canvas.width / 2 - textMetrics.width / 2, 50);
        instructions = "Select a button and tap with one finger to press it";
        textMetrics = this.canvas2d.measureText(instructions);
        this.canvas2d.fillText(instructions, 10 + this.canvas2d.canvas.width / 2 - textMetrics.width / 2, 100);
        this.buttons.map(function (btn) { return btn.draw(_this.canvas2d); });
    };
    return Menu;
}());
exports.Menu = Menu;

},{}],4:[function(require,module,exports){
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
        var maybeLoc = name[0] === 'a' ? gl.getAttribLocation(program, name) : gl.getUniformLocation(program, name);
        if (maybeLoc !== null) {
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
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
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

},{"./geometry":2}],5:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var windowManager_1 = require("./windowManager");
var gameState_1 = require("./gameState");
var webRTCReceiver_1 = require("./webRTCReceiver");
var menu_1 = require("./menu");
function isImage(obj) {
    if (!obj)
        return false;
    return obj.tagName === "IMG";
}
fetch("localIP")
    .then(function (response) { return response.text(); })
    .then(function (address) {
    var imgElement = document.getElementById("qrcode");
    if (!isImage(imgElement)) {
        throw new Error("imgElement not found or not image");
    }
    imgElement.src = "https://api.qrserver.com/v1/create-qr-code/?data=http%3A%2F%2F" + address + ":3000/w.html&amp;size=300x300";
});
var gameWindow = new windowManager_1.GameWindow();
var gameState = new gameState_1.Game(gameWindow);
var menu = new menu_1.Menu(gameWindow.ctx);
window.onresize = function () {
    gameState.onResize();
};
gameWindow.canvasgl.addEventListener('mousemove', function (event) {
    var x = event.pageX - gameWindow.canvas2d.width / 2;
    var y = event.pageY - gameWindow.canvas2d.height / 2;
    // console.log(y, x);
    //gameState.addPoint(x / 100, -y / 100, 0.0);
    gameState.moveCursor(x, y);
});
gameWindow.canvasgl.addEventListener('mousedown', function (_event) {
    webRTCReceiver_1.messageHandler.sendVibrate(100);
});
menu.onButtonSelect = function () { return webRTCReceiver_1.messageHandler.sendVibrate(100); };
menu.onButtonDeselect = function () { return webRTCReceiver_1.messageHandler.sendVibrate(50); };
var firstRotation = true;
var cy = 0;
function subMod2Pi(source, delta, mod) {
    if (mod === void 0) { mod = 2 * Math.PI; }
    return (source + mod - delta) % mod;
}
webRTCReceiver_1.messageHandler.onRotate = function (x, y, z) {
    //console.log(x.toFixed(2), y.toFixed(2), z.toFixed(2));
    if (firstRotation && x && y && z) {
        firstRotation = false;
        console.log(x, y, z);
        console.log(x.toFixed(2), y.toFixed(2), z.toFixed(2));
        cy = 0;
        gameState.start();
        var helloContainer = document.getElementById('hello-container');
        if (!helloContainer) {
            throw Error("Cannot find hello-container");
        }
        helloContainer.style.display = 'none';
    }
    y = subMod2Pi(y, cy);
    menu.draw();
    menu.drawCursor(z, y);
    gameState.rotateController(x, y, z);
};
webRTCReceiver_1.messageHandler.onCalibrate = function (x, y, z) {
    console.log("Calibrating!");
    if (Math.abs(z - Math.PI) > 0.1 || Math.abs(x - Math.PI / 2) > 0.1) {
        console.warn("Phone is calibrating without being horizontal!");
    }
    var wy = Math.PI / 2;
    cy = (y - wy) % Math.PI;
};

},{"./gameState":1,"./menu":3,"./webRTCReceiver":6,"./windowManager":7}],6:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var receiver = new RTCPeerConnection();
var channel = null;
exports.messageHandler = {
    onRotate: function (_x, _y, _z) { },
    onCalibrate: function (_x, _y, _z) { },
    sendVibrate: function (duration) {
        // console.log("called sendV");
        if (channel) {
            console.log("sending ", duration);
            channel.send(new Uint16Array([duration]));
        }
    }
};
function handleMessage(message) {
    var data = new Float32Array(message.data);
    if (data.length == 0) {
        console.log("recieved empty message, wtf?");
        console.log("data", message.data.arraybuffer);
        console.log("md", JSON.stringify(message.data));
        return;
    }
    // 0 north, 180 south
    var x = data[0] % 360; // 0 - 360
    // 0 horizontal, 90 top up, (-)180 flipped horizontal, -90 bottom up
    var y = data[1]; // -180 - 180
    // 0 straight,  90 right up, -90 left up
    var z = data[2]; // -90 - 90
    x = x / 180 * Math.PI;
    y = (y + 180) / 180 * Math.PI;
    z = (z + 90) / 180 * Math.PI;
    if (data[0] < 360) {
        exports.messageHandler.onRotate(z, x, y);
    }
    else {
        exports.messageHandler.onCalibrate(z, x, y);
    }
}
receiver.ondatachannel = function (event) {
    console.log("Wow a data channel!");
    event.channel.onmessage = handleMessage;
    event.channel.onopen = function (_e) { return console.log("Channel opened!"); };
    event.channel.onclose = function (_e) { return console.log("Channel closed!"); };
    channel = event.channel;
};
var socket = io();
socket.on('sendDesc', function (msg) {
    console.log("Received sendDesc!");
    var sendDesc = JSON.parse(msg);
    receiver.setRemoteDescription(sendDesc)
        .then(function () { return receiver.createAnswer(); })
        .then(function (ans) { return receiver.setLocalDescription(ans); })
        .then(function () {
        setTimeout(function () { return socket.emit('recDesc', JSON.stringify(receiver.localDescription)); }, 300);
    });
});

},{}],7:[function(require,module,exports){
"use strict";
exports.__esModule = true;
function isCanvas(obj) {
    if (!obj)
        return false;
    return obj.tagName === 'CANVAS';
}
var GameWindow = /** @class */ (function () {
    function GameWindow() {
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
        var maybeCtx = this.canvas2d.getContext("2d");
        if (!maybeCtx) {
            alert("Can't create canvas context!");
            throw new Error("Can't create canvas context!");
        }
        this.ctx = maybeCtx;
    }
    GameWindow.prototype.fillWindow = function () {
        this.canvasgl.width = this.canvas2d.width = window.innerWidth;
        this.canvasgl.height = this.canvas2d.height = window.innerHeight;
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    };
    return GameWindow;
}());
exports.GameWindow = GameWindow;

},{}]},{},[5]);
