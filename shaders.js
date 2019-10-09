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
        var count = 36;
        gl.drawElements(primitiveType, count, gl.UNSIGNED_SHORT, offset);
    };
    return ShaderManager;
}());
exports.ShaderManager = ShaderManager;
