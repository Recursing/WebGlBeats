(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
        this.viewMatrix = geometry_1.makeTranslationMatrix(0, 0, -6);
    }
    Camera.prototype.setAspectRatio = function (aspectRatio) {
        this.perspectiveMatrix = geometry_1.makePerspectiveMatrix(this.fieldOfView, aspectRatio, this.zNear, this.zFar);
    };
    return Camera;
}());
exports.Camera = Camera;
var Solid = /** @class */ (function () {
    function Solid(model, transformation) {
        if (transformation === void 0) { transformation = geometry_1.identityMatrix; }
        this.model = model;
        this.transformation = transformation;
    }
    Solid.prototype.translate = function (x, y, z) {
        geometry_1.translate(this.transformation, x, y, z);
    };
    Solid.prototype.rotate = function (x, y, z) {
        if (z === void 0) { z = 0; }
        geometry_1.rotateX(this.transformation, x);
        geometry_1.rotateY(this.transformation, y);
        if (z)
            throw Error("rotate Z not yet implemented");
    };
    Solid.prototype.scale = function (x, y, z) {
        geometry_1.scale(this.transformation, x, y, z);
    };
    return Solid;
}());
exports.Solid = Solid;
var Game = /** @class */ (function () {
    function Game(gameWindow) {
        var aspectRatio = gameWindow.canvas2d.width / gameWindow.canvas2d.height;
        this.camera = new Camera(aspectRatio);
        this.cubes = [new geometry_1.Cube(1)];
        this.gameWindow = gameWindow;
        this.shaderManager = new shaders_1.ShaderManager(gameWindow.gl);
        this.shaderManager.setCamera(this.camera);
        this.shaderManager.setVertices(this.cubes[0].getVertices());
        this.shaderManager.setTriangles(this.cubes[0].getTriangleIndices());
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
    Game.prototype.update = function (dt) {
        geometry_1.rotateX(this.camera.viewMatrix, 0.0000001);
        this.shaderManager.setCamera(this.camera);
        var cubeModel = new geometry_1.Cube((Math.sin(performance.now() / 1000) + 1) / 8);
        this.shaderManager.setVertices(cubeModel.getVertices());
    };
    Game.prototype.tick = function (dt) {
        var _this = this;
        var t0 = performance.now();
        for (var i = 0; i < 100000; i++) {
            this.update(dt);
            this.draw();
        }
        console.log(performance.now() - t0);
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
var Cube = /** @class */ (function () {
    function Cube(bevel) {
        if (bevel === void 0) { bevel = 0; }
        this.bevel = bevel;
    }
    Cube.prototype.getVertices = function () {
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
        ];
        return vertices;
    };
    Cube.prototype.getTriangleIndices = function () {
        // Indices related to getVertices, face triangles
        var indices = [
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            0, 1, 2, 0, 2, 3,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23,
        ];
        return indices;
    };
    return Cube;
}());
exports.Cube = Cube;

},{}],3:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var vertexShaderSource = "\n\n// an attribute is an input (in) to a vertex shader.\n// It will receive data from a buffer\nattribute vec4 aVertexPosition;\n\n// Uniforms are passed by js\nuniform mat4 uModelViewMatrix;\nuniform mat4 uProjectionMatrix;\nuniform vec4 uVertexColor;\n\n// varying will go to fragmentShader\nvarying lowp vec4 vColor;\n\n// all shaders have a main function\nvoid main() {\n\n  // gl_Position is a special variable a vertex shader\n  // is responsible for setting\n  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;\n  vColor = uVertexColor;\n}\n";
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
        this.uVertexColor = this.tryGetLocation("uVertexColor", program, gl);
        this.aVertexPosition = this.tryGetLocation("aVertexPosition", program, gl);
    }
    Locations.prototype.tryGetLocation = function (name, program, gl) {
        console.log("name " + name);
        var maybeLoc = name[0] === 'a' ? gl.getAttribLocation(program, name) : gl.getUniformLocation(program, name);
        if (maybeLoc !== null)
            return maybeLoc;
        throw Error("Cannot get " + name + " location!");
    };
    return Locations;
}());
var ShaderManager = /** @class */ (function () {
    function ShaderManager(gl) {
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
        this.locations = new Locations(this.program, this.gl);
        this.positionBuffer = gl.createBuffer();
    }
    ShaderManager.prototype.setCamera = function (camera) {
        // Set the shader uniforms
        this.gl.uniformMatrix4fv(this.locations.uProjectionMatrix, false, camera.perspectiveMatrix);
        this.gl.uniformMatrix4fv(this.locations.uModelViewMatrix, false, camera.viewMatrix);
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
    ShaderManager.prototype.setTriangles = function (indices) {
        var gl = this.gl;
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    };
    ShaderManager.prototype.setColor = function (color) {
        this.gl.uniform4fv(this.locations.uVertexColor, color);
    };
    ShaderManager.prototype.clear = function () {
        var gl = this.gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0, 0.5, 0.2, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    };
    ShaderManager.prototype.draw = function () {
        var gl = this.gl;
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 36;
        gl.drawElements(primitiveType, count, gl.UNSIGNED_SHORT, offset);
    };
    return ShaderManager;
}());
exports.ShaderManager = ShaderManager;

},{}],4:[function(require,module,exports){
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

},{"./gameState":1,"./geometry":2,"./windowManager":5}],5:[function(require,module,exports){
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
        var maybeGl = this.canvasgl.getContext("webgl");
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
