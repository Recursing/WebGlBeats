(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var geometry_1 = require("./geometry");
var shaders_1 = require("./shaders");
var Camera = /** @class */ (function () {
    function Camera(aspectRatio) {
        this.fieldOfView = 90 * Math.PI / 180;
        this.zNear = 5.0;
        this.zFar = 500.0;
        this.aspectRatio = 1.0;
        this.perspectiveMatrix = geometry_1.makePerspectiveMatrix(this.fieldOfView, aspectRatio, this.zNear, this.zFar);
        this.viewMatrix = geometry_1.makeTranslationMatrix(0, -0.5, -12);
    }
    Camera.prototype.setAspectRatio = function (aspectRatio) {
        this.perspectiveMatrix = geometry_1.makePerspectiveMatrix(this.fieldOfView, aspectRatio, this.zNear, this.zFar);
    };
    return Camera;
}());
exports.Camera = Camera;
var Level = /** @class */ (function () {
    function Level(songPath, bpm, points, speed, title) {
        if (speed === void 0) { speed = 0.1; }
        if (title === void 0) { title = ""; }
        this.song = new Audio(songPath);
        this.startSong();
        this.bpm = bpm;
        this.notes = points;
        this.speed = speed;
        this.title = title;
    }
    Level.prototype.startSong = function () {
        console.log(this.song);
        this.song.play();
    };
    return Level;
}());
exports.Level = Level;
function fromDescription(desc) {
    var notes = [];
    fetch(desc.notes)
        .then(function (r) { return r.json(); })
        .then(function (j) {
        j.map(function (point) {
            if (geometry_1.hypot(point[1], point[2]) > 12) {
                point[1] *= 12 / geometry_1.hypot(point[1], point[2]);
                point[2] *= 12 / geometry_1.hypot(point[1], point[2]);
            }
            notes.push(new Note(point[0], point[1], point[2], point[3]));
        });
        notes.sort(function (a, b) { return a.time - b.time; });
    });
    return new Level(desc.song, desc.bpm, notes, desc.speed, desc.title);
}
// TODO
var wooshes = [new Audio('../audio/woosh.wav?v=334'), new Audio('../audio/woosh.wav'), new Audio('../audio/woosh.wav'), new Audio('../audio/woosh.wav'), new Audio('../audio/woosh.mp3')];
wooshes.map(function (w) {
    w.playbackRate = 3;
    w.volume = 0.2;
});
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
var Note = /** @class */ (function () {
    function Note(time, x, y, hue) {
        this.hitAt = null;
        this.time = time;
        this.x = x;
        this.y = y;
        this.hue = hue;
    }
    Note.prototype.draw = function (shader, viewMatrix, currentTime, speed) {
        var _a = HuetoRGB(this.hue), r = _a[0], g = _a[1], b = _a[2];
        shader.setColor([r, g, b]);
        var z = (this.time - currentTime) * speed;
        var t = geometry_1.identityMatrix();
        geometry_1.translate(t, this.x, this.y, -z);
        if (this.hitAt) {
            var sf = 1 - (currentTime - this.hitAt) / 500;
            if (sf <= 0.01)
                return;
            var target = geometry_1.identityMatrix();
            geometry_1.scale(target, 0.01, 0.01, 0.01);
            geometry_1.translate(target, -280, 1250, -300);
            t = geometry_1.interpolate(t, target, sf);
        }
        var modelViewMatrix = viewMatrix.slice();
        geometry_1.multiply(modelViewMatrix, t);
        shader.setModelViewMatrix(modelViewMatrix);
        shader.draw();
    };
    return Note;
}());
var Cursor = /** @class */ (function () {
    function Cursor() {
        this.handleLength = 8;
        this.bladeLength = 5;
        this.trail = [];
    }
    /*public move(x: number, y: number) {
        let newCursor = identityMatrix();
        rotateX(newCursor, 0.1);
        rotateY(newCursor, 0.1);
        translate(newCursor, x / 100, -y / 100 + 4, -10);
        this.cursorProjectionTrail.push(newCursor);
        // this.cursorProjectionHistory.push([this.currentLevel.song.currentTime, newCursor]);
        while (this.cursorProjectionTrail.length > 100) {
            this.cursorProjectionTrail.shift();
        }
        // console.log(JSON.stringify(this.cursorProjectionHistory));
    }*/
    Cursor.prototype.rotate = function (x, y, z) {
        var newCursor = geometry_1.identityMatrix();
        // console.log("x y z: ", Math.floor(x), Math.floor(y), Math.floor(z));
        // translate(newCursor, 0, 0, 0);
        geometry_1.rotateY(newCursor, y);
        geometry_1.rotateZ(newCursor, z);
        geometry_1.rotateX(newCursor, -x);
        // translate(newCursor, -4, 0, 0);
        // scale(newCursor, 5, 0.5, 0.1);
        this.trail.push(newCursor);
        while (this.trail.length > 30) {
            this.trail.shift();
        }
    };
    Cursor.prototype.getRotation = function () {
        return this.trail[this.trail.length - 1].slice();
    };
    Cursor.prototype.draw = function (shader, viewMatrix) {
        var xScale = this.bladeLength;
        var yScale = 0.1;
        var zScale = 0.025;
        var handleLength = this.handleLength;
        outer: for (var i = this.trail.length - 1; i > 0; i--) {
            for (var interp_number = 0; interp_number < 10; interp_number++) {
                var interp_factor = interp_number / 10;
                var reversed_index = this.trail.length - 1 - i;
                var scale_factor = 1 - (reversed_index - interp_factor) / 20;
                //scale_factor *= scale_factor;
                if (scale_factor < 0.4) {
                    break outer;
                }
                var color_factor = scale_factor;
                var r = 0;
                var g = r;
                var b = 0.5 + color_factor * 0.5;
                var xs = xScale * scale_factor;
                var ys = yScale * scale_factor;
                var zs = zScale * scale_factor * scale_factor;
                shader.setColor([r, g, b]);
                var tempModelMatrix = viewMatrix.slice();
                var interpolatedMatrix = geometry_1.interpolate(this.trail[i], this.trail[i - 1], interp_factor);
                geometry_1.translate(interpolatedMatrix, -handleLength, 0, 0);
                geometry_1.multiply(tempModelMatrix, interpolatedMatrix);
                geometry_1.scale(tempModelMatrix, xs, ys, zs);
                shader.setModelViewMatrix(tempModelMatrix);
                shader.draw();
                shader.setColor([b, r, g]);
                tempModelMatrix = viewMatrix.slice();
                geometry_1.translate(interpolatedMatrix, 2 * handleLength, 0, 0);
                geometry_1.multiply(tempModelMatrix, interpolatedMatrix);
                geometry_1.scale(tempModelMatrix, xs, ys, zs);
                shader.setModelViewMatrix(tempModelMatrix);
                shader.draw();
            }
        }
    };
    return Cursor;
}());
exports.Cursor = Cursor;
var walls = [geometry_1.identityMatrix(), geometry_1.identityMatrix(), geometry_1.identityMatrix(), geometry_1.identityMatrix()];
walls.map(function (floor, index) {
    geometry_1.rotateZ(floor, (index - 2) * (Math.PI / 2));
    geometry_1.translate(floor, 0, -15, -80);
    geometry_1.scale(floor, 15, 0.2, 100);
});
var drawWalls = function (shader, viewMatrix) {
    for (var _i = 0, walls_1 = walls; _i < walls_1.length; _i++) {
        var floor = walls_1[_i];
        shader.setColor([0.5, 0.3, 0.1]);
        var modelViewMatrix = viewMatrix.slice();
        geometry_1.multiply(modelViewMatrix, floor);
        shader.setModelViewMatrix(modelViewMatrix);
        shader.draw();
    }
};
var Game = /** @class */ (function () {
    function Game(gameWindow) {
        this.paused = true;
        this.notesHit = 0;
        this.notesMissed = 0;
        this.score = 0;
        this.multiplier = 1;
        this.onLevelEnd = function () { };
        this.onHit = function () { };
        var aspectRatio = gameWindow.canvas2d.width / gameWindow.canvas2d.height;
        this.camera = new Camera(aspectRatio);
        this.cursor = new Cursor();
        this.geometry = new geometry_1.BeveledCube(1);
        this.colors = [];
        // TODO load default or get level in constructor
        this.currentLevel = new Level('../audio/dearly_beloved.mp3', 60, []);
        this.currentLevel.song.volume = 0.2;
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
        this.shaderManager.setColor([1.0, 0, 0]);
        //this.draw();
        this.tick(0);
    }
    Game.prototype.setLevel = function (desc) {
        this.currentLevel.song.pause();
        this.currentLevel = fromDescription(desc);
        this.start();
    };
    Game.prototype.start = function () {
        this.paused = false;
        this.currentLevel.startSong();
    };
    Game.prototype.pause = function () {
        this.paused = true;
        this.currentLevel.song.pause();
        var ctx = this.gameWindow.gameCtx;
        var cw = this.gameWindow.canvas2d.width;
        var ch = this.gameWindow.canvas2d.height;
        ctx.clearRect(0, 0, cw, ch);
    };
    Game.prototype.reset = function () {
        this.paused = true;
        this.notesMissed = this.notesHit = this.score = 0;
        this.multiplier = 1;
        this.currentLevel.song.pause();
        this.currentLevel = new Level('../audio/dearly_beloved.mp3', 60, []);
        this.currentLevel.song.volume = 0.2;
    };
    Game.prototype.onResize = function () {
        this.gameWindow.fillWindow();
        var aspectRatio = this.gameWindow.canvas2d.width / this.gameWindow.canvas2d.height;
        this.camera.setAspectRatio(aspectRatio);
        this.shaderManager.setCamera(this.camera);
    };
    Game.prototype.draw = function () {
        var currentMillis = this.currentLevel.song.currentTime * 1000;
        // Bevel cubes to the beat
        var phase = (currentMillis * this.currentLevel.bpm / 60000) % 1;
        phase = phase * 2 - 1;
        var bevel = Math.exp(-10 * phase * phase) / 2 + 0.2;
        var cubeModel = new geometry_1.BeveledCube(bevel);
        this.shaderManager.setVertices(cubeModel.getVertices());
        // Draw notes first, then cursor
        //this.shaderManager.clear();
        for (var _i = 0, _a = this.currentLevel.notes; _i < _a.length; _i++) {
            var note = _a[_i];
            note.draw(this.shaderManager, this.camera.viewMatrix, currentMillis, this.currentLevel.speed);
            if (note.time > currentMillis + 8000)
                break;
        }
        this.shaderManager.setVertices(new geometry_1.BeveledCube(bevel * 0.2).getVertices());
        this.cursor.draw(this.shaderManager, this.camera.viewMatrix);
        var ctx = this.gameWindow.gameCtx;
        var cw = this.gameWindow.canvas2d.width;
        var ch = this.gameWindow.canvas2d.height;
        ctx.clearRect(0, 0, cw, ch);
        if (this.paused)
            return;
        this.shaderManager.setVertices(new geometry_1.BeveledCube(0).getVertices());
        drawWalls(this.shaderManager, this.camera.viewMatrix);
        var perc = (this.currentLevel.song.currentTime * 100 / this.currentLevel.song.duration).toFixed(1);
        var text = this.currentLevel.title + " " + perc + "%";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.fillStyle = "rgba(255,255,255, 1)";
        var textMetrics = ctx.measureText(text);
        ctx.strokeText(text, this.gameWindow.canvas2d.width / 2 - textMetrics.width / 2, 60);
        ctx.fillText(text, this.gameWindow.canvas2d.width / 2 - textMetrics.width / 2, 60);
        var hitPerc = Math.floor(this.notesHit * 100 / (this.notesHit + this.notesMissed)) || 100;
        text = "Hit: " + this.notesHit + "  Missed: " + this.notesMissed + " Hitrate: " + hitPerc + "%";
        textMetrics = ctx.measureText(text);
        ctx.strokeText(text, this.gameWindow.canvas2d.width / 2 - textMetrics.width / 2, 100);
        ctx.fillText(text, this.gameWindow.canvas2d.width / 2 - textMetrics.width / 2, 100);
        text = "Score: " + this.score + "  Multiplier: " + Math.floor(this.multiplier) + "x";
        ctx.strokeText(text, this.gameWindow.canvas2d.width / 2 - textMetrics.width / 2, 140);
        ctx.fillText(text, this.gameWindow.canvas2d.width / 2 - textMetrics.width / 2, 140);
    };
    Game.prototype.update = function () {
        if (this.cursor.trail.length < 2) {
            return;
        }
        if (this.paused) {
            return;
        }
        if (this.currentLevel.song.ended) {
            this.onLevelEnd();
        }
        var currentMillis = this.currentLevel.song.currentTime * 1000;
        for (var _i = 0, _a = this.currentLevel.notes; _i < _a.length; _i++) {
            var note = _a[_i];
            if (note.hitAt)
                continue;
            // Collision detection
            var nz = -(note.time - currentMillis) * this.currentLevel.speed;
            var sf = Math.min(geometry_1.hypot(note.x, note.y, nz) / this.cursor.handleLength, 2);
            var cursorMatrix = this.cursor.getRotation();
            geometry_1.translate(cursorMatrix, -this.cursor.handleLength, 0, 0);
            var _b = cursorMatrix.slice(12, 15), x1 = _b[0], y1 = _b[1], z1 = _b[2];
            geometry_1.translate(cursorMatrix, 2 * this.cursor.handleLength, 0, 0);
            var _c = cursorMatrix.slice(12, 15), x2 = _c[0], y2 = _c[1], z2 = _c[2];
            var d2 = geometry_1.hypot(note.x - x2 * sf, note.y - y2 * sf, nz - z2 * sf);
            var d1 = geometry_1.hypot(note.x - x1 * sf, note.y - y1 * sf, nz - z1 * sf);
            if (d1 < 2 || d2 < 2) {
                console.log(Math.abs(currentMillis - note.time));
                var right_color = note.hue === 0.7 ? d1 < 2 : d2 < 2;
                note.hue = 0.3;
                note.hitAt = currentMillis;
                this.notesHit++;
                this.score += right_color ? Math.floor(this.multiplier) : 1;
                this.multiplier = right_color ? Math.min(this.multiplier * 1.2, 8) : this.multiplier;
                for (var _d = 0, wooshes_1 = wooshes; _d < wooshes_1.length; _d++) {
                    var woosh = wooshes_1[_d];
                    if (woosh.paused) {
                        woosh.play();
                        woosh.playbackRate = 2 + Math.random() * 2;
                        woosh.volume = 0.1 + Math.random() * 0.1;
                        break;
                    }
                }
                this.onHit();
            }
            if (note.time > currentMillis + 1000) {
                break;
            }
        }
        while (this.currentLevel.notes.length > 0 && this.currentLevel.notes[0].time < currentMillis - 200) {
            if (this.currentLevel.notes[0].hitAt === null) {
                this.notesMissed += 1;
                this.multiplier = 1;
            }
            else if (this.currentLevel.notes[0].hitAt + 500 > currentMillis) {
                break;
            }
            this.currentLevel.notes.shift();
        }
    };
    Game.prototype.tick = function (_t) {
        var _this = this;
        // Stress testing browsers for fun
        this.draw();
        this.update();
        requestAnimationFrame(function (dt) { _this.tick(dt); });
    };
    return Game;
}());
exports.Game = Game;

},{"./geometry":2,"./shaders":4}],2:[function(require,module,exports){
"use strict";
exports.__esModule = true;
function hypot(x, y, z) {
    if (z === void 0) { z = 0; }
    return Math.sqrt(x * x + y * y + z * z);
}
exports.hypot = hypot;
;
function identityMatrix() {
    return [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1];
}
exports.identityMatrix = identityMatrix;
function interpolate(m1, m2, t) {
    var m0 = identityMatrix();
    for (var i = 0; i < 16; i++) {
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
function apply(t, v) {
    var nw = t[3] * v[0] + t[7] * v[1] + t[11] * v[2] + t[15];
    var nx = (t[0] * v[0] + t[4] * v[1] + t[8] * v[2] + t[12]) / nw;
    var ny = (t[1] * v[0] + t[5] * v[1] + t[9] * v[2] + t[13]) / nw;
    var nz = (t[2] * v[0] + t[6] * v[1] + t[10] * v[2] + t[14]) / nw;
    return [nx, ny, nz];
}
exports.apply = apply;
// Efficient matrix math functions from https://github.com/toji/gl-matrix/blob/master/src/mat4.js
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
var LevelDescription = /** @class */ (function () {
    function LevelDescription(title, song, bpm, speed, notes) {
        this.title = title;
        this.song = song;
        this.bpm = bpm;
        this.speed = speed;
        this.notes = notes;
    }
    return LevelDescription;
}());
exports.LevelDescription = LevelDescription;
var Menu = /** @class */ (function () {
    function Menu(canvas) {
        var _this = this;
        this.audioPreview = null;
        this.levels = [];
        this.buttons = [];
        this.onButtonSelect = function () { };
        this.onButtonDeselect = function () { };
        this.canvas2d = canvas;
        var btnWidth = 600;
        var btnHeight = 120;
        var padTop = 60;
        var padLeft = (this.canvas2d.canvas.width - btnWidth) / 2;
        fetch("../levels/list.json").then(function (r) { return r.json(); })
            .then(function (j) {
            var i = 0;
            for (var _i = 0, j_1 = j; _i < j_1.length; _i++) {
                var level = j_1[_i];
                i++;
                _this.levels.push(level);
                _this.buttons.push(new Button(padLeft, (btnHeight + padTop) * i, btnWidth, btnHeight, level.title));
            }
        });
        this.canvas2d.font = "30px Arial";
    }
    Menu.prototype.onResize = function () {
        var btnWidth = 600;
        var padLeft = (this.canvas2d.canvas.width - btnWidth) / 2;
        this.buttons.map(function (btn) {
            btn.x = padLeft;
        });
        this.canvas2d.fillStyle = "rgba(0, 0, 0, 1.0)";
        this.canvas2d.clearRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
        this.canvas2d.fillRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
    };
    Menu.prototype.drawCursor = function (yAngle, xAngle) {
        var _this = this;
        var y0 = Math.PI;
        var x0 = Math.PI / 2;
        yAngle -= y0;
        xAngle -= x0;
        if ((Math.abs(xAngle) > Math.PI / 2) !== (Math.abs(yAngle) > Math.PI / 2)) { // Red end
            yAngle = -yAngle;
        }
        if (yAngle > Math.PI / 2) {
            yAngle = Math.PI - yAngle;
        }
        else if (yAngle < -Math.PI / 2) {
            yAngle = -Math.PI - yAngle;
        }
        var menuDistance = 400;
        var xCenter = this.canvas2d.canvas.width / 2;
        var yCenter = this.canvas2d.canvas.height / 2;
        var cx = xCenter + Math.tan(-xAngle) * menuDistance;
        var cy = yCenter - Math.tan(yAngle) * menuDistance;
        var ctx = this.canvas2d;
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(200,200,255,0.9)';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0,50,0,0.8)';
        ctx.stroke();
        this.buttons.map(function (btn, i) {
            if (btn.contains(cy, cx) && !btn.selected) {
                if (_this.audioPreview)
                    _this.audioPreview.pause();
                _this.audioPreview = null;
                _this.audioPreview = new Audio(_this.levels[i].song);
                _this.audioPreview.play();
                _this.onButtonSelect();
                btn.selected = true;
            }
            if (!btn.contains(cy, cx) && btn.selected) {
                if (_this.audioPreview) {
                    _this.audioPreview.pause();
                    _this.audioPreview = null;
                }
                _this.onButtonDeselect();
                btn.selected = false;
            }
        });
    };
    Menu.prototype.draw = function () {
        var _this = this;
        this.canvas2d.fillStyle = "rgba(92, 166, 209, 0.9)";
        this.canvas2d.fillRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
        var instructions = "Point at the screen and tap with two fingers to calibrate rotation";
        var textMetrics = this.canvas2d.measureText(instructions);
        this.canvas2d.fillStyle = "rgba(0, 0, 0, 1)";
        this.canvas2d.fillText(instructions, 10 + this.canvas2d.canvas.width / 2 - textMetrics.width / 2, 80);
        instructions = "Select a button and tap with one finger to press it";
        textMetrics = this.canvas2d.measureText(instructions);
        this.canvas2d.fillText(instructions, 10 + this.canvas2d.canvas.width / 2 - textMetrics.width / 2, 130);
        this.buttons.map(function (btn) { return btn.draw(_this.canvas2d); });
    };
    Menu.prototype.hide = function () {
        if (this.audioPreview)
            this.audioPreview.pause();
        this.audioPreview = null;
        this.canvas2d.fillStyle = "rgba(0, 0, 0, 1.0)";
        this.canvas2d.clearRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
        this.canvas2d.fillRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
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
var vertexShaderSource = "\n\n// an attribute is an input (in) to a vertex shader.\n// It will receive data from a buffer\nattribute vec4 aVertexPosition;\nattribute vec4 aVertexNormal;\n\n// Uniforms are passed by js\nuniform mat4 uModelViewMatrix;\nuniform mat4 uNormalMatrix;\nuniform mat4 uProjectionMatrix;\nuniform vec3 uVertexColor;\n\n// varying will go to fragmentShader\nvarying lowp vec3 vColor;\nvarying lowp vec3 vNormal;\nvarying lowp vec3 vVertex;\n\n// all shaders have a main function\nvoid main() {\n\n  // gl_Position is a special variable a vertex shader\n  // is responsible for setting\n  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;\n\n  // directional light\n  vNormal = (uNormalMatrix * aVertexNormal).xyz;\n\n  // point light\n  vec3 vertexWorldPosition = (uModelViewMatrix * aVertexPosition).xyz;\n  vVertex = vertexWorldPosition;\n  vColor = uVertexColor;\n}\n";
var fragmentShaderSource = "\n\n// fragment shaders don't have a default precision so we need\n// to pick one. \"only using highp in both vertex and fragment shaders is safer\"\nprecision lowp float;\n\n// varying are passed from the vertex shader\nvarying lowp vec3 vColor;\nvarying lowp vec3 vNormal;\nvarying lowp vec3 vVertex;\nvoid main(void) {\n    lowp vec3 normal = normalize(vNormal);\n    \n    vec3 color = vec3(0.0,0.0,0.0);\n\n    for (int z = 0; z < 5; z++){\n        vec3 vVertexToLight = vec3(0.0, 0.0, -float(z)*40.0-12.0) - vVertex;\n        lowp float point = max(dot(normal, normalize(vVertexToLight)), 0.0); \n        point = pow(point, 1.5);\n\n        lowp float distance_factor = 225.0 / dot(vVertexToLight, vVertexToLight);\n        lowp float point2 = pow(point, 20.0);\n        point = min(point*distance_factor, 1.0);\n        point2 = min(point2*distance_factor, 1.0);\n        color = color + (point2 * vec3(1.0,1.0,1.0)*0.2 + point * vColor);\n    }\n    lowp float depth_factor = 10.0/(vVertex.z*vVertex.z);\n    gl_FragColor = vec4(color + (0.1+depth_factor)*vColor, 1.0);\n}\n";
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
        this.gl.uniform3fv(this.locations.uVertexColor, color);
    };
    ShaderManager.prototype.clear = function () {
        console.log("clearing");
        var gl = this.gl;
        //gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        //gl.clearColor(0.0, 0.0, 0.0, 0.0);
        //gl.clear(gl.COLOR_BUFFER_BIT);
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
var calibrateContainer = document.getElementById('calibrate-container');
if (!calibrateContainer) {
    throw Error("Cannot find calibrate-container");
}
calibrateContainer.style.display = 'none';
var states;
(function (states) {
    states[states["QRCode"] = 0] = "QRCode";
    states[states["Calibrating"] = 1] = "Calibrating";
    states[states["LevelSelect"] = 2] = "LevelSelect";
    states[states["Playing"] = 3] = "Playing";
    states[states["ShowScore"] = 4] = "ShowScore";
})(states || (states = {}));
var state = states.QRCode;
function isImage(obj) {
    if (!obj)
        return false;
    return obj.tagName === "IMG";
}
var imgElement = document.getElementById("qrcode");
if (!isImage(imgElement)) {
    throw new Error("imgElement not found or not image");
}
var address = "buonanno.tech";
var token = Math.random().toString(36).slice(2, 10);
imgElement.src = "https://api.qrserver.com/v1/create-qr-code/?data=https%3A%2F%2F" + address + ":3000%2Fcontroller%3F" + token + "&amp;size=300x300";
webRTCReceiver_1.messageHandler.token = token;
console.log(token);
var gameWindow = new windowManager_1.GameWindow();
var gameState = new gameState_1.Game(gameWindow);
var menu = new menu_1.Menu(gameWindow.ctx);
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
menu.onButtonSelect = function () { webRTCReceiver_1.messageHandler.sendVibrate(40); gameState.currentLevel.song.pause(); };
menu.onButtonDeselect = function () { webRTCReceiver_1.messageHandler.sendVibrate(20); gameState.currentLevel.song.play(); };
gameState.onHit = function () { webRTCReceiver_1.messageHandler.sendVibrate(100); };
var center_y = 0;
function subMod2Pi(source, delta) {
    var mod = 2 * Math.PI;
    return (source + mod - delta) % mod;
}
webRTCReceiver_1.messageHandler.onRotate = function (x, y, z) {
    //console.log(x.toFixed(2), y.toFixed(2), z.toFixed(2));
    if (state === states.QRCode && x && y && z) {
        console.log("Scanned QR, moving to calibration!");
        // TODO
        var helloContainer = document.getElementById('hello-container');
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
};
webRTCReceiver_1.messageHandler.onCalibrate = function (x, y, z) {
    console.log("Calibrating!");
    if (state === states.Calibrating) {
        setTimeout(function () { return state = states.LevelSelect; }, 200);
        console.log("Calibrated! Moving to level select");
        if (!calibrateContainer) {
            throw Error("Cannot find calibrate-container");
        }
        calibrateContainer.style.display = 'none';
    }
    if (Math.abs(z - Math.PI) > 0.1 || Math.abs(x - Math.PI / 2) > 0.1) {
        console.warn("Phone is calibrating without being horizontal!");
    }
    var wy = Math.PI / 2;
    center_y = subMod2Pi(y, wy);
};
webRTCReceiver_1.messageHandler.onClick = function (x, y, z) {
    if (state === states.Calibrating) {
        webRTCReceiver_1.messageHandler.onCalibrate(x, y, z);
        return;
    }
    if (state === states.LevelSelect) {
        y = subMod2Pi(y, center_y);
        menu.draw();
        menu.drawCursor(z, y);
        gameState.cursor.rotate(x, y, z);
        menu.buttons.map(function (btn, i) {
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
            gameState.start();
        else
            gameState.pause();
    }
});
gameState.onLevelEnd = backToMenu;

},{"./gameState":1,"./menu":3,"./webRTCReceiver":6,"./windowManager":7}],6:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var server = { urls: "stun:stun.l.google.com:19302" };
var receiver = new RTCPeerConnection({ iceServers: [server] });
var channel = null;
exports.messageHandler = {
    token: "",
    onRotate: function (_x, _y, _z) { },
    onCalibrate: function (_x, _y, _z) { },
    onClick: function (_x, _y, _z) { },
    sendVibrate: function (duration) {
        if (channel) {
            channel.send(new Uint16Array([duration]));
        }
    }
};
function handleMessage(message) {
    // console.log("Handling a message!");
    var data = JSON.parse(message.data);
    if (data.length == 0) {
        console.warn("Failed to parse data! AAAARGH!");
        console.log("data", message.data);
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
    else if (data[0] < 720) {
        exports.messageHandler.onCalibrate(z, x, y);
    }
    else {
        exports.messageHandler.onClick(z, x, y);
    }
}
receiver.ondatachannel = function (event) {
    console.log("Wow a data channel!");
    event.channel.binaryType = "arraybuffer";
    event.channel.onmessage = handleMessage;
    event.channel.onopen = function (_e) { return console.log("Channel opened!"); };
    event.channel.onclose = function (_e) { return console.log("Channel closed!"); };
    channel = event.channel;
};
receiver.oniceconnectionstatechange = function (_e) { return console.log(receiver.iceConnectionState); };
var socket = io();
socket.on('sendDesc', function (msg) {
    if (msg.split("|-|")[0] != exports.messageHandler.token) {
        return;
    }
    msg = msg.split("|-|")[1];
    if (receiver.signalingState != "stable") {
        alert("Oh no! Receiver is not stable yet!");
        return;
    }
    console.log("Received sendDesc!");
    var sendDesc = new RTCSessionDescription({ type: "offer", sdp: msg });
    receiver.setRemoteDescription(sendDesc)
        .then(function () { return receiver.createAnswer(); })
        .then(function (ans) { return receiver.setLocalDescription(ans); })["catch"](console.log);
    receiver.onicecandidate = function (e) {
        if (e.candidate) {
            console.log("Received candidate!");
            return;
        }
        if (!receiver.localDescription) {
            alert("receiver.localDescription is null");
            return;
        }
        socket.emit('recDesc', exports.messageHandler.token + "|-|" + receiver.localDescription.sdp);
    };
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
        var maybeCtx = this.canvas2d.getContext("2d");
        if (!maybeCtx) {
            alert("Can't create canvas context!");
            throw new Error("Can't create canvas context!");
        }
        this.ctx = maybeCtx;
        maybeCanvas = document.getElementById("gameCanvas");
        if (!isCanvas(maybeCanvas)) {
            alert("Game canvas not foud!");
            throw Error("Canvas not found!");
        }
        this.gameCanvas = maybeCanvas;
        this.gameCanvas.oncontextmenu = function () { return false; };
        maybeCtx = this.gameCanvas.getContext("2d");
        if (!maybeCtx) {
            alert("Can't create canvas context!");
            throw new Error("Can't create game canvas context!");
        }
        this.gameCtx = maybeCtx;
        this.fillWindow();
    }
    GameWindow.prototype.fillWindow = function () {
        this.gameCanvas.width = this.canvasgl.width = this.canvas2d.width = window.innerWidth;
        this.gameCanvas.height = this.canvasgl.height = this.canvas2d.height = window.innerHeight;
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.ctx.font = "30px Arial";
        this.gameCtx.font = "30px Arial";
    };
    return GameWindow;
}());
exports.GameWindow = GameWindow;

},{}]},{},[5]);
