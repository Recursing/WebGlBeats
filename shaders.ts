import { Camera } from './gameState';

const vertexShaderSource = `

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
attribute vec4 aVertexPosition;

// Uniforms are passed by js
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec4 uVertexColor;

// varying will go to fragmentShader
varying lowp vec4 vColor;

// all shaders have a main function
void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vColor = uVertexColor;
}
`;

const fragmentShaderSource = `

// fragment shaders don't have a default precision so we need
// to pick one. "only using highp in both vertex and fragment shaders is safer"
precision highp float;

// varying are passed from the vertex shader
varying lowp vec4 vColor;
void main(void) {
  gl_FragColor = vColor;
}
`;

// Compile vertex or fragment shader
function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (shader) {
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
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
function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const program = gl.createProgram();
    if (program) {
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }
    }
    console.warn("Error creating program:");
    console.log(program == null ? "null" : gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error("Error creating program!");
}

class Locations {
    uProjectionMatrix: WebGLUniformLocation;
    uModelViewMatrix: WebGLUniformLocation;
    uVertexColor: WebGLUniformLocation;
    aVertexPosition: number;

    tryGetLocation(name: string, program: WebGLProgram, gl: WebGLRenderingContext): number | WebGLUniformLocation {
        console.log("name " + name);
        let maybeLoc = name[0] === 'a' ? gl.getAttribLocation(program, name) : gl.getUniformLocation(program, name);
        if (maybeLoc !== null)
            return maybeLoc
        throw Error("Cannot get " + name + " location!");
    }

    constructor(program: WebGLProgram, gl: WebGLRenderingContext) {
        this.uProjectionMatrix = this.tryGetLocation("uProjectionMatrix", program, gl);
        this.uModelViewMatrix = this.tryGetLocation("uModelViewMatrix", program, gl);
        this.uVertexColor = this.tryGetLocation("uVertexColor", program, gl);
        this.aVertexPosition = this.tryGetLocation("aVertexPosition", program, gl) as number;
    }
}

export class ShaderManager {

    program: WebGLProgram;
    gl: WebGLRenderingContext;
    locations: Locations;
    positionBuffer: WebGLBuffer;


    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (!vertexShader || !fragmentShader) {
            alert("Failed to create shaders!");
            throw new Error("Failed to create shaders!");
        }
        let maybeProgram = createProgram(gl, vertexShader, fragmentShader);
        if (!maybeProgram) {
            alert("Failed to create program!");
            throw new Error("Failed to create program!");
        }
        this.program = maybeProgram;

        gl.useProgram(this.program);

        this.locations = new Locations(this.program, this.gl);
        this.positionBuffer = gl.createBuffer() as WebGLBuffer;
    }

    public setCamera(camera: Camera) {
        // Set the shader uniforms
        this.gl.uniformMatrix4fv(
            this.locations.uProjectionMatrix,
            false,
            camera.perspectiveMatrix);
        this.gl.uniformMatrix4fv(
            this.locations.uModelViewMatrix,
            false,
            camera.viewMatrix);
    }

    public setVertices(positions: number[]) {
        // Create a buffer for the cube's vertex positions.
        const gl = this.gl;
        const positionBuffer = this.positionBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        let numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        const vertexPosition = this.locations.aVertexPosition;
        gl.vertexAttribPointer(vertexPosition, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(vertexPosition);
    }

    public setTriangles(indices: number[]) {
        const gl = this.gl;
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), gl.STATIC_DRAW);
    }
    public setColor(color: [number, number, number, number]) {
        this.gl.uniform4fv(
            this.locations.uVertexColor,
            color);
    }

    public clear() {
        const gl = this.gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0, 0.5, 0.2, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    public draw() {
        const gl = this.gl;
        let primitiveType = gl.TRIANGLES;
        let offset = 0;
        let count = 36;
        gl.drawElements(primitiveType, count, gl.UNSIGNED_SHORT, offset);
    }
}