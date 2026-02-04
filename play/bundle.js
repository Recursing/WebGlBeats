"use strict";
(() => {
  // play/windowManager.ts
  function isCanvas(obj) {
    if (!obj)
      return false;
    return obj.tagName === "CANVAS";
  }
  var GameWindow = class {
    constructor() {
      let maybeCanvas = document.getElementById("webglcanvas");
      if (!isCanvas(maybeCanvas)) {
        alert("Webgl canvas not foud!");
        throw Error("Canvas not found!");
      }
      this.canvasgl = maybeCanvas;
      this.canvasgl.oncontextmenu = () => false;
      let maybeGl = this.canvasgl.getContext("webgl", {
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
      this.canvas2d.oncontextmenu = () => false;
      let maybeCtx = this.canvas2d.getContext("2d");
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
      this.gameCanvas.oncontextmenu = () => false;
      maybeCtx = this.gameCanvas.getContext("2d");
      if (!maybeCtx) {
        alert("Can't create canvas context!");
        throw new Error("Can't create game canvas context!");
      }
      this.gameCtx = maybeCtx;
      this.fillWindow();
    }
    fillWindow() {
      this.gameCanvas.width = this.canvasgl.width = this.canvas2d.width = window.innerWidth;
      this.gameCanvas.height = this.canvasgl.height = this.canvas2d.height = window.innerHeight;
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
      this.ctx.font = "30px Arial";
      this.gameCtx.font = "30px Arial";
    }
  };

  // play/geometry.ts
  function hypot(x, y, z = 0) {
    return Math.sqrt(x * x + y * y + z * z);
  }
  function identityMatrix() {
    return [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ];
  }
  function interpolate(m1, m2, t) {
    let m0 = identityMatrix();
    for (let i = 0; i < 16; i++) {
      m0[i] = m1[i] * t + m2[i] * (1 - t);
    }
    return m0;
  }
  function transpose(a) {
    let a01 = a[1], a02 = a[2], a03 = a[3];
    let a12 = a[6], a13 = a[7];
    let a23 = a[11];
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
  function multiply(a, b) {
    let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    let out = a;
    let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
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
  function invert(a) {
    let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    let b00 = a00 * a11 - a01 * a10;
    let b01 = a00 * a12 - a02 * a10;
    let b02 = a00 * a13 - a03 * a10;
    let b03 = a01 * a12 - a02 * a11;
    let b04 = a01 * a13 - a03 * a11;
    let b05 = a02 * a13 - a03 * a12;
    let b06 = a20 * a31 - a21 * a30;
    let b07 = a20 * a32 - a22 * a30;
    let b08 = a20 * a33 - a23 * a30;
    let b09 = a21 * a32 - a22 * a31;
    let b10 = a21 * a33 - a23 * a31;
    let b11 = a22 * a33 - a23 * a32;
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) {
      throw new Error("Cannot invert singular matrix!");
    }
    det = 1 / det;
    let out = a;
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
  function makePerspectiveMatrix(fovy, aspect, near, far) {
    let out = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const f = 1 / Math.tan(fovy / 2);
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
      const nf = 1 / (near - far);
      out[10] = (far + near) * nf;
      out[14] = 2 * far * near * nf;
    } else {
      out[10] = -1;
      out[14] = -2 * near;
    }
    return out;
  }
  function makeTranslationMatrix(x, y, z) {
    return [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      x,
      y,
      z,
      1
    ];
  }
  function translate(m, x, y, z) {
    m[12] = m[0] * x + m[4] * y + m[8] * z + m[12];
    m[13] = m[1] * x + m[5] * y + m[9] * z + m[13];
    m[14] = m[2] * x + m[6] * y + m[10] * z + m[14];
    m[15] = m[3] * x + m[7] * y + m[11] * z + m[15];
  }
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
  function rotateX(m, rad) {
    let sin = Math.sin(rad);
    let cos = Math.cos(rad);
    let a10 = m[4];
    let a11 = m[5];
    let a12 = m[6];
    let a13 = m[7];
    let a20 = m[8];
    let a21 = m[9];
    let a22 = m[10];
    let a23 = m[11];
    m[4] = a10 * cos + a20 * sin;
    m[5] = a11 * cos + a21 * sin;
    m[6] = a12 * cos + a22 * sin;
    m[7] = a13 * cos + a23 * sin;
    m[8] = a20 * cos - a10 * sin;
    m[9] = a21 * cos - a11 * sin;
    m[10] = a22 * cos - a12 * sin;
    m[11] = a23 * cos - a13 * sin;
  }
  function rotateY(m, rad) {
    let sin = Math.sin(rad);
    let cos = Math.cos(rad);
    let a00 = m[0];
    let a01 = m[1];
    let a02 = m[2];
    let a03 = m[3];
    let a20 = m[8];
    let a21 = m[9];
    let a22 = m[10];
    let a23 = m[11];
    m[0] = a00 * cos - a20 * sin;
    m[1] = a01 * cos - a21 * sin;
    m[2] = a02 * cos - a22 * sin;
    m[3] = a03 * cos - a23 * sin;
    m[8] = a00 * sin + a20 * cos;
    m[9] = a01 * sin + a21 * cos;
    m[10] = a02 * sin + a22 * cos;
    m[11] = a03 * sin + a23 * cos;
  }
  function rotateZ(m, rad) {
    let s = Math.sin(rad);
    let c = Math.cos(rad);
    let a00 = m[0];
    let a01 = m[1];
    let a02 = m[2];
    let a03 = m[3];
    let a10 = m[4];
    let a11 = m[5];
    let a12 = m[6];
    let a13 = m[7];
    m[0] = a00 * c + a10 * s;
    m[1] = a01 * c + a11 * s;
    m[2] = a02 * c + a12 * s;
    m[3] = a03 * c + a13 * s;
    m[4] = a10 * c - a00 * s;
    m[5] = a11 * c - a01 * s;
    m[6] = a12 * c - a02 * s;
    m[7] = a13 * c - a03 * s;
  }
  var BeveledCube = class {
    constructor(bevel = 0) {
      this.bevel = bevel;
    }
    getVertices() {
      let e = this.bevel;
      let vertices = [
        // Front face
        -1,
        -1,
        1 + e,
        // 0
        1,
        -1,
        1 + e,
        1,
        1,
        1 + e,
        -1,
        1,
        1 + e,
        // Back face
        -1,
        -1,
        -1 - e,
        // 4
        -1,
        1,
        -1 - e,
        1,
        1,
        -1 - e,
        1,
        -1,
        -1 - e,
        // Top face
        -1,
        1 + e,
        -1,
        // 8
        -1,
        1 + e,
        1,
        1,
        1 + e,
        1,
        1,
        1 + e,
        -1,
        // Bottom face
        -1,
        -1 - e,
        -1,
        // 12
        1,
        -1 - e,
        -1,
        1,
        -1 - e,
        1,
        -1,
        -1 - e,
        1,
        // Right face
        1 + e,
        -1,
        -1,
        // 16
        1 + e,
        1,
        -1,
        1 + e,
        1,
        1,
        1 + e,
        -1,
        1,
        // Left face
        -1 - e,
        -1,
        -1,
        // 20
        -1 - e,
        -1,
        1,
        -1 - e,
        1,
        1,
        -1 - e,
        1,
        -1,
        // Bevel
        // Left-bottom
        -1 - e,
        -1,
        1,
        // 24
        -1 - e,
        -1,
        -1,
        -1,
        -1 - e,
        1,
        -1,
        -1 - e,
        -1,
        // Left-top
        -1 - e,
        1,
        1,
        // 28
        -1 - e,
        1,
        -1,
        -1,
        1 + e,
        1,
        -1,
        1 + e,
        -1,
        // Left-back
        -1 - e,
        1,
        -1,
        // 32
        -1 - e,
        -1,
        -1,
        -1,
        1,
        -1 - e,
        -1,
        -1,
        -1 - e,
        // Left-Forward
        -1 - e,
        1,
        1,
        -1 - e,
        -1,
        1,
        -1,
        1,
        1 + e,
        -1,
        -1,
        1 + e,
        // Right-bottom
        1 + e,
        -1,
        1,
        1 + e,
        -1,
        -1,
        1,
        -1 - e,
        1,
        1,
        -1 - e,
        -1,
        1 + e,
        1,
        1,
        1 + e,
        1,
        -1,
        1,
        1 + e,
        1,
        1,
        1 + e,
        -1,
        1 + e,
        1,
        -1,
        1 + e,
        -1,
        -1,
        1,
        1,
        -1 - e,
        1,
        -1,
        -1 - e,
        1 + e,
        1,
        1,
        1 + e,
        -1,
        1,
        1,
        1,
        1 + e,
        1,
        -1,
        1 + e,
        1,
        -1 - e,
        -1,
        -1,
        -1 - e,
        -1,
        1,
        -1,
        -1 - e,
        -1,
        -1,
        -1 - e,
        1,
        -1 - e,
        1,
        -1,
        -1 - e,
        1,
        1,
        -1,
        1 + e,
        -1,
        -1,
        1 + e,
        1,
        1 + e,
        -1,
        -1,
        1 + e,
        -1,
        1,
        1,
        -1 - e,
        -1,
        1,
        -1 - e,
        1,
        1 + e,
        1,
        -1,
        1 + e,
        1,
        1,
        1,
        1 + e,
        -1,
        1,
        1 + e,
        // corner triangles
        1 + e,
        1,
        1,
        1,
        1 + e,
        1,
        1,
        1,
        1 + e,
        1 + e,
        1,
        -1,
        1,
        1 + e,
        -1,
        1,
        1,
        -1 - e,
        1 + e,
        -1,
        1,
        1,
        -1 - e,
        1,
        1,
        -1,
        1 + e,
        1 + e,
        -1,
        -1,
        1,
        -1 - e,
        -1,
        1,
        -1,
        -1 - e,
        -1 - e,
        1,
        1,
        -1,
        1 + e,
        1,
        -1,
        1,
        1 + e,
        -1 - e,
        1,
        -1,
        -1,
        1 + e,
        -1,
        -1,
        1,
        -1 - e,
        -1 - e,
        -1,
        1,
        -1,
        -1 - e,
        1,
        -1,
        -1,
        1 + e,
        -1 - e,
        -1,
        -1,
        -1,
        -1 - e,
        -1,
        -1,
        -1,
        -1 - e
      ];
      return vertices;
    }
    getNormals() {
      let normals = [
        // Front face
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        1,
        // Back face
        0,
        0,
        -1,
        0,
        0,
        -1,
        0,
        0,
        -1,
        0,
        0,
        -1,
        // Top face
        0,
        1,
        0,
        // 8
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        // Bottom face
        0,
        -1,
        0,
        // 12
        0,
        -1,
        0,
        0,
        -1,
        0,
        0,
        -1,
        0,
        // Right face
        1,
        0,
        0,
        // 16
        1,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        // Left face
        -1,
        0,
        0,
        // 20
        -1,
        0,
        0,
        -1,
        0,
        0,
        -1,
        0,
        0,
        // Bevel
        // Left-Bottom
        -0.7071067811865476,
        -0.7071067811865476,
        0,
        // 24
        -0.7071067811865476,
        -0.7071067811865476,
        0,
        -0.7071067811865476,
        -0.7071067811865476,
        0,
        -0.7071067811865476,
        -0.7071067811865476,
        0,
        // Left-Top
        -0.7071067811865476,
        0.7071067811865476,
        0,
        // 28
        -0.7071067811865476,
        0.7071067811865476,
        0,
        -0.7071067811865476,
        0.7071067811865476,
        0,
        -0.7071067811865476,
        0.7071067811865476,
        0,
        // ...
        -0.7071067811865476,
        0,
        -0.7071067811865476,
        -0.7071067811865476,
        0,
        -0.7071067811865476,
        -0.7071067811865476,
        0,
        -0.7071067811865476,
        -0.7071067811865476,
        0,
        -0.7071067811865476,
        -0.7071067811865476,
        0,
        0.7071067811865476,
        -0.7071067811865476,
        0,
        0.7071067811865476,
        -0.7071067811865476,
        0,
        0.7071067811865476,
        -0.7071067811865476,
        0,
        0.7071067811865476,
        0.7071067811865476,
        -0.7071067811865476,
        0,
        0.7071067811865476,
        -0.7071067811865476,
        0,
        0.7071067811865476,
        -0.7071067811865476,
        0,
        0.7071067811865476,
        -0.7071067811865476,
        0,
        0.7071067811865476,
        0.7071067811865476,
        0,
        0.7071067811865476,
        0.7071067811865476,
        0,
        0.7071067811865476,
        0.7071067811865476,
        0,
        0.7071067811865476,
        0.7071067811865476,
        0,
        0.7071067811865476,
        0,
        -0.7071067811865476,
        0.7071067811865476,
        0,
        -0.7071067811865476,
        0.7071067811865476,
        0,
        -0.7071067811865476,
        0.7071067811865476,
        0,
        -0.7071067811865476,
        0.7071067811865476,
        0,
        0.7071067811865476,
        0.7071067811865476,
        0,
        0.7071067811865476,
        0.7071067811865476,
        0,
        0.7071067811865476,
        0.7071067811865476,
        0,
        0.7071067811865476,
        0,
        -0.7071067811865476,
        -0.7071067811865476,
        0,
        -0.7071067811865476,
        -0.7071067811865476,
        0,
        -0.7071067811865476,
        -0.7071067811865476,
        0,
        -0.7071067811865476,
        -0.7071067811865476,
        0,
        -0.7071067811865476,
        0.7071067811865476,
        0,
        -0.7071067811865476,
        0.7071067811865476,
        0,
        -0.7071067811865476,
        0.7071067811865476,
        0,
        -0.7071067811865476,
        0.7071067811865476,
        0,
        0.7071067811865476,
        -0.7071067811865476,
        0,
        0.7071067811865476,
        -0.7071067811865476,
        0,
        0.7071067811865476,
        -0.7071067811865476,
        0,
        0.7071067811865476,
        -0.7071067811865476,
        0,
        0.7071067811865476,
        0.7071067811865476,
        0,
        0.7071067811865476,
        0.7071067811865476,
        0,
        0.7071067811865476,
        0.7071067811865476,
        0,
        0.7071067811865476,
        0.7071067811865476,
        // Triangles
        0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257,
        -0.5773502691896257
      ];
      return normals;
    }
    getTriangleIndices() {
      const indices = [
        4,
        5,
        6,
        4,
        6,
        7,
        // back
        8,
        9,
        10,
        8,
        10,
        11,
        // top
        12,
        13,
        14,
        12,
        14,
        15,
        // bottom
        0,
        1,
        2,
        0,
        2,
        3,
        // front
        16,
        17,
        18,
        16,
        18,
        19,
        // right
        20,
        21,
        22,
        20,
        22,
        23,
        // left
        // Bevel
        24,
        25,
        26,
        25,
        26,
        27,
        28,
        29,
        30,
        29,
        30,
        31,
        32,
        33,
        34,
        33,
        34,
        35,
        36,
        37,
        38,
        37,
        38,
        39,
        40,
        41,
        42,
        41,
        42,
        43,
        44,
        45,
        46,
        45,
        46,
        47,
        48,
        49,
        50,
        49,
        50,
        51,
        52,
        53,
        54,
        53,
        54,
        55,
        56,
        57,
        58,
        57,
        58,
        59,
        60,
        61,
        62,
        61,
        62,
        63,
        64,
        65,
        66,
        65,
        66,
        67,
        68,
        69,
        70,
        69,
        70,
        71,
        72,
        73,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        82,
        83,
        84,
        85,
        86,
        87,
        88,
        89,
        90,
        91,
        92,
        93,
        94,
        95
      ];
      return indices;
    }
  };

  // play/shaders.ts
  var vertexShaderSource = `

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
attribute vec4 aVertexPosition;
attribute vec4 aVertexNormal;

// Uniforms are passed by js
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uVertexColor;

// varying will go to fragmentShader
varying lowp vec3 vColor;
varying lowp vec3 vNormal;
varying lowp vec3 vVertex;

// all shaders have a main function
void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

  // directional light
  vNormal = (uNormalMatrix * aVertexNormal).xyz;

  // point light
  vec3 vertexWorldPosition = (uModelViewMatrix * aVertexPosition).xyz;
  vVertex = vertexWorldPosition;
  vColor = uVertexColor;
}
`;
  var fragmentShaderSource = `

// fragment shaders don't have a default precision so we need
// to pick one. "only using highp in both vertex and fragment shaders is safer"
precision lowp float;

// varying are passed from the vertex shader
varying lowp vec3 vColor;
varying lowp vec3 vNormal;
varying lowp vec3 vVertex;
void main(void) {
    lowp vec3 normal = normalize(vNormal);
    
    vec3 color = vec3(0.0,0.0,0.0);

    for (int z = 0; z < 5; z++){
        vec3 vVertexToLight = vec3(0.0, 0.0, -float(z)*40.0-12.0) - vVertex;
        lowp float point = max(dot(normal, normalize(vVertexToLight)), 0.0); 
        point = pow(point, 1.5);

        lowp float distance_factor = 225.0 / dot(vVertexToLight, vVertexToLight);
        lowp float point2 = pow(point, 20.0);
        point = min(point*distance_factor, 1.0);
        point2 = min(point2*distance_factor, 1.0);
        color = color + (point2 * vec3(1.0,1.0,1.0)*0.2 + point * vColor);
    }
    lowp float depth_factor = 10.0/(vVertex.z*vVertex.z);
    gl_FragColor = vec4(color + (0.1+depth_factor)*vColor, 1.0);
}
`;
  function createShader(gl, type, source) {
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
  function createProgram(gl, vertexShader, fragmentShader) {
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
  var Locations = class {
    tryGetLocation(name, program, gl) {
      let maybeLoc = name[0] === "a" ? gl.getAttribLocation(program, name) : gl.getUniformLocation(program, name);
      if (maybeLoc !== null) {
        return maybeLoc;
      }
      throw Error("Cannot get " + name + " location!");
    }
    constructor(program, gl) {
      this.uProjectionMatrix = this.tryGetLocation("uProjectionMatrix", program, gl);
      this.uModelViewMatrix = this.tryGetLocation("uModelViewMatrix", program, gl);
      this.uNormalMatrix = this.tryGetLocation("uNormalMatrix", program, gl);
      this.uVertexColor = this.tryGetLocation("uVertexColor", program, gl);
      this.aVertexPosition = this.tryGetLocation("aVertexPosition", program, gl);
      this.aVertexNormal = this.tryGetLocation("aVertexNormal", program, gl);
    }
  };
  var ShaderManager = class {
    constructor(gl) {
      this.triangleNumber = 0;
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
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      this.locations = new Locations(this.program, this.gl);
      this.positionBuffer = gl.createBuffer();
      this.normalsBuffer = gl.createBuffer();
    }
    setCamera(camera) {
      this.gl.uniformMatrix4fv(
        this.locations.uProjectionMatrix,
        false,
        camera.perspectiveMatrix
      );
      this.gl.uniformMatrix4fv(
        this.locations.uModelViewMatrix,
        false,
        camera.viewMatrix
      );
      let normalMatrix = [...camera.viewMatrix];
      transpose(invert(normalMatrix));
      this.gl.uniformMatrix4fv(
        this.locations.uNormalMatrix,
        false,
        normalMatrix
      );
    }
    setModelViewMatrix(modelViewMatrix) {
      this.gl.uniformMatrix4fv(
        this.locations.uModelViewMatrix,
        false,
        modelViewMatrix
      );
      let normalMatrix = [...modelViewMatrix];
      transpose(invert(normalMatrix));
      this.gl.uniformMatrix4fv(
        this.locations.uNormalMatrix,
        false,
        normalMatrix
      );
    }
    setVertices(positions) {
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
    setNormals(normals) {
      const gl = this.gl;
      const normalsBuffer = this.normalsBuffer;
      gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
      let numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      const normalsPosition = this.locations.aVertexNormal;
      gl.vertexAttribPointer(normalsPosition, numComponents, type, normalize, stride, offset);
      gl.enableVertexAttribArray(normalsPosition);
    }
    setTriangles(indices) {
      const gl = this.gl;
      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      this.triangleNumber = indices.length;
    }
    setColor(color) {
      this.gl.uniform3fv(
        this.locations.uVertexColor,
        color
      );
    }
    clear() {
      console.log("clearing");
      const gl = this.gl;
    }
    draw() {
      const gl = this.gl;
      let primitiveType = gl.TRIANGLES;
      let offset = 0;
      gl.drawElements(primitiveType, this.triangleNumber, gl.UNSIGNED_SHORT, offset);
    }
  };

  // play/gameState.ts
  var Camera = class {
    // Translation + rotation
    constructor(aspectRatio) {
      this.fieldOfView = 90 * Math.PI / 180;
      this.zNear = 5;
      this.zFar = 500;
      this.aspectRatio = 1;
      this.perspectiveMatrix = makePerspectiveMatrix(this.fieldOfView, aspectRatio, this.zNear, this.zFar);
      this.viewMatrix = makeTranslationMatrix(0, -0.5, -12);
    }
    setAspectRatio(aspectRatio) {
      this.perspectiveMatrix = makePerspectiveMatrix(this.fieldOfView, aspectRatio, this.zNear, this.zFar);
    }
  };
  var Level = class {
    constructor(songPath, bpm, points, speed = 0.1, title = "") {
      this.song = new Audio(songPath);
      this.startSong();
      this.bpm = bpm;
      this.notes = points;
      this.speed = speed;
      this.title = title;
    }
    startSong() {
      console.log(this.song);
      this.song.play();
    }
  };
  function fromDescription(desc) {
    let notes = [];
    fetch(desc.notes).then((r) => r.json()).then((j) => {
      j.map((point) => {
        if (hypot(point[1], point[2]) > 12) {
          point[1] *= 12 / hypot(point[1], point[2]);
          point[2] *= 12 / hypot(point[1], point[2]);
        }
        notes.push(new Note(point[0], point[1], point[2], point[3]));
      });
      notes.sort((a, b) => a.time - b.time);
    });
    return new Level(desc.song, desc.bpm, notes, desc.speed, desc.title);
  }
  var wooshes = [new Audio("../audio/woosh.wav?v=334"), new Audio("../audio/woosh.wav"), new Audio("../audio/woosh.wav"), new Audio("../audio/woosh.wav"), new Audio("../audio/woosh.mp3")];
  wooshes.map((w) => {
    w.playbackRate = 3;
    w.volume = 0.2;
  });
  function HuetoRGB(hue) {
    let hue2rgb = function hue2rgb2(p2, q2, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t;
      if (t < 1 / 2) return q2;
      if (t < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t) * 6;
      return p2;
    };
    let p = 0;
    let q = 1;
    let r = hue2rgb(p, q, hue + 1 / 3);
    let g = hue2rgb(p, q, hue);
    let b = hue2rgb(p, q, hue - 1 / 3);
    return [r, g, b];
  }
  var Note = class {
    constructor(time, x, y, hue) {
      this.hitAt = null;
      this.time = time;
      this.x = x;
      this.y = y;
      this.hue = hue;
    }
    draw(shader, viewMatrix, currentTime, speed) {
      let [r, g, b] = HuetoRGB(this.hue);
      shader.setColor([r, g, b]);
      let z = (this.time - currentTime) * speed;
      let t = identityMatrix();
      translate(t, this.x, this.y, -z);
      if (this.hitAt) {
        let sf = 1 - (currentTime - this.hitAt) / 500;
        if (sf <= 0.01)
          return;
        const target = identityMatrix();
        scale(target, 0.01, 0.01, 0.01);
        translate(target, -280, 1250, -300);
        t = interpolate(t, target, sf);
      }
      let modelViewMatrix = viewMatrix.slice();
      multiply(modelViewMatrix, t);
      shader.setModelViewMatrix(modelViewMatrix);
      shader.draw();
    }
  };
  var Cursor = class {
    constructor() {
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
    rotate(x, y, z) {
      let newCursor = identityMatrix();
      rotateY(newCursor, y);
      rotateZ(newCursor, z);
      rotateX(newCursor, -x);
      this.trail.push(newCursor);
      while (this.trail.length > 30) {
        this.trail.shift();
      }
    }
    getRotation() {
      return this.trail[this.trail.length - 1].slice();
    }
    draw(shader, viewMatrix) {
      const xScale = this.bladeLength;
      const yScale = 0.1;
      const zScale = 0.025;
      const handleLength = this.handleLength;
      outer: for (let i = this.trail.length - 1; i > 0; i--) {
        for (let interp_number = 0; interp_number < 10; interp_number++) {
          let interp_factor = interp_number / 10;
          let reversed_index = this.trail.length - 1 - i;
          let scale_factor = 1 - (reversed_index - interp_factor) / 20;
          if (scale_factor < 0.4) {
            break outer;
          }
          const color_factor = scale_factor;
          const r = 0;
          const g = r;
          const b = 0.5 + color_factor * 0.5;
          const xs = xScale * scale_factor;
          const ys = yScale * scale_factor;
          const zs = zScale * scale_factor * scale_factor;
          shader.setColor([r, g, b]);
          let tempModelMatrix = viewMatrix.slice();
          let interpolatedMatrix = interpolate(this.trail[i], this.trail[i - 1], interp_factor);
          translate(interpolatedMatrix, -handleLength, 0, 0);
          multiply(tempModelMatrix, interpolatedMatrix);
          scale(tempModelMatrix, xs, ys, zs);
          shader.setModelViewMatrix(tempModelMatrix);
          shader.draw();
          shader.setColor([b, r, g]);
          tempModelMatrix = viewMatrix.slice();
          translate(interpolatedMatrix, 2 * handleLength, 0, 0);
          multiply(tempModelMatrix, interpolatedMatrix);
          scale(tempModelMatrix, xs, ys, zs);
          shader.setModelViewMatrix(tempModelMatrix);
          shader.draw();
        }
      }
    }
  };
  var walls = [identityMatrix(), identityMatrix(), identityMatrix(), identityMatrix()];
  walls.map((floor, index) => {
    rotateZ(floor, (index - 2) * (Math.PI / 2));
    translate(floor, 0, -15, -80);
    scale(floor, 15, 0.2, 100);
  });
  var drawWalls = (shader, viewMatrix) => {
    for (let floor of walls) {
      shader.setColor([0.5, 0.3, 0.1]);
      const modelViewMatrix = viewMatrix.slice();
      multiply(modelViewMatrix, floor);
      shader.setModelViewMatrix(modelViewMatrix);
      shader.draw();
    }
  };
  var Game = class {
    constructor(gameWindow) {
      this.paused = true;
      this.notesHit = 0;
      this.notesMissed = 0;
      this.score = 0;
      this.multiplier = 1;
      this.onLevelEnd = () => {
      };
      this.onHit = () => {
      };
      const aspectRatio = gameWindow.canvas2d.width / gameWindow.canvas2d.height;
      this.camera = new Camera(aspectRatio);
      this.cursor = new Cursor();
      this.geometry = new BeveledCube(1);
      this.colors = [];
      this.currentLevel = new Level("../audio/dearly_beloved.mp3", 60, []);
      this.currentLevel.song.volume = 0.2;
      this.gameWindow = gameWindow;
      this.shaderManager = new ShaderManager(gameWindow.gl);
      this.shaderManager.setCamera(this.camera);
      this.shaderManager.setVertices(this.geometry.getVertices());
      this.shaderManager.setNormals(this.geometry.getNormals());
      this.shaderManager.setTriangles(this.geometry.getTriangleIndices());
      this.shaderManager.setColor([1, 0, 0]);
      this.tick(0);
    }
    setLevel(desc) {
      this.currentLevel.song.pause();
      this.currentLevel = fromDescription(desc);
      this.start();
    }
    start() {
      this.paused = false;
      this.currentLevel.startSong();
    }
    pause() {
      this.paused = true;
      this.currentLevel.song.pause();
      let ctx = this.gameWindow.gameCtx;
      let cw = this.gameWindow.canvas2d.width;
      let ch = this.gameWindow.canvas2d.height;
      ctx.clearRect(0, 0, cw, ch);
    }
    reset() {
      this.paused = true;
      this.notesMissed = this.notesHit = this.score = 0;
      this.multiplier = 1;
      this.currentLevel.song.pause();
      this.currentLevel = new Level("../audio/dearly_beloved.mp3", 60, []);
      this.currentLevel.song.volume = 0.2;
    }
    onResize() {
      this.gameWindow.fillWindow();
      const aspectRatio = this.gameWindow.canvas2d.width / this.gameWindow.canvas2d.height;
      this.camera.setAspectRatio(aspectRatio);
      this.shaderManager.setCamera(this.camera);
    }
    draw() {
      const currentMillis = this.currentLevel.song.currentTime * 1e3;
      let phase = currentMillis * this.currentLevel.bpm / 6e4 % 1;
      phase = phase * 2 - 1;
      const bevel = Math.exp(-10 * phase * phase) / 2 + 0.2;
      let cubeModel = new BeveledCube(bevel);
      this.shaderManager.setVertices(cubeModel.getVertices());
      for (let note of this.currentLevel.notes) {
        note.draw(this.shaderManager, this.camera.viewMatrix, currentMillis, this.currentLevel.speed);
        if (note.time > currentMillis + 8e3)
          break;
      }
      this.shaderManager.setVertices(new BeveledCube(bevel * 0.2).getVertices());
      this.cursor.draw(this.shaderManager, this.camera.viewMatrix);
      let ctx = this.gameWindow.gameCtx;
      let cw = this.gameWindow.canvas2d.width;
      let ch = this.gameWindow.canvas2d.height;
      ctx.clearRect(0, 0, cw, ch);
      if (this.paused)
        return;
      this.shaderManager.setVertices(new BeveledCube(0).getVertices());
      drawWalls(this.shaderManager, this.camera.viewMatrix);
      let perc = (this.currentLevel.song.currentTime * 100 / this.currentLevel.song.duration).toFixed(1);
      let text = this.currentLevel.title + " " + perc + "%";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.fillStyle = `rgba(255,255,255, 1)`;
      let textMetrics = ctx.measureText(text);
      ctx.strokeText(text, this.gameWindow.canvas2d.width / 2 - textMetrics.width / 2, 60);
      ctx.fillText(text, this.gameWindow.canvas2d.width / 2 - textMetrics.width / 2, 60);
      let hitPerc = Math.floor(this.notesHit * 100 / (this.notesHit + this.notesMissed)) || 100;
      text = "Hit: " + this.notesHit + "  Missed: " + this.notesMissed + " Hitrate: " + hitPerc + "%";
      textMetrics = ctx.measureText(text);
      ctx.strokeText(text, this.gameWindow.canvas2d.width / 2 - textMetrics.width / 2, 100);
      ctx.fillText(text, this.gameWindow.canvas2d.width / 2 - textMetrics.width / 2, 100);
      text = "Score: " + this.score + "  Multiplier: " + Math.floor(this.multiplier) + "x";
      ctx.strokeText(text, this.gameWindow.canvas2d.width / 2 - textMetrics.width / 2, 140);
      ctx.fillText(text, this.gameWindow.canvas2d.width / 2 - textMetrics.width / 2, 140);
    }
    update() {
      if (this.cursor.trail.length < 2) {
        return;
      }
      if (this.paused) {
        return;
      }
      if (this.currentLevel.song.ended) {
        this.onLevelEnd();
      }
      const currentMillis = this.currentLevel.song.currentTime * 1e3;
      for (let note of this.currentLevel.notes) {
        if (note.hitAt)
          continue;
        const nz = -(note.time - currentMillis) * this.currentLevel.speed;
        const sf = Math.min(hypot(note.x, note.y, nz) / this.cursor.handleLength, 2);
        const cursorMatrix = this.cursor.getRotation();
        translate(cursorMatrix, -this.cursor.handleLength, 0, 0);
        const [x1, y1, z1] = cursorMatrix.slice(12, 15);
        translate(cursorMatrix, 2 * this.cursor.handleLength, 0, 0);
        const [x2, y2, z2] = cursorMatrix.slice(12, 15);
        const d2 = hypot(note.x - x2 * sf, note.y - y2 * sf, nz - z2 * sf);
        const d1 = hypot(note.x - x1 * sf, note.y - y1 * sf, nz - z1 * sf);
        if (d1 < 2 || d2 < 2) {
          console.log(Math.abs(currentMillis - note.time));
          let right_color = note.hue === 0.7 ? d1 < 2 : d2 < 2;
          note.hue = 0.3;
          note.hitAt = currentMillis;
          this.notesHit++;
          this.score += right_color ? Math.floor(this.multiplier) : 1;
          this.multiplier = right_color ? Math.min(this.multiplier * 1.2, 8) : this.multiplier;
          for (let woosh of wooshes) {
            if (woosh.paused) {
              woosh.play();
              woosh.playbackRate = 2 + Math.random() * 2;
              woosh.volume = 0.1 + Math.random() * 0.1;
              break;
            }
          }
          this.onHit();
        }
        if (note.time > currentMillis + 1e3) {
          break;
        }
      }
      while (this.currentLevel.notes.length > 0 && this.currentLevel.notes[0].time < currentMillis - 200) {
        if (this.currentLevel.notes[0].hitAt === null) {
          this.notesMissed += 1;
          this.multiplier = 1;
        } else if (this.currentLevel.notes[0].hitAt + 500 > currentMillis) {
          break;
        }
        this.currentLevel.notes.shift();
      }
    }
    tick(_t) {
      this.draw();
      this.update();
      requestAnimationFrame((dt) => {
        this.tick(dt);
      });
    }
  };

  // config.ts
  var SIGNALING_SERVER = "https://huge-weasel-83.recursing.deno.net";
  var POLLING_INTERVAL_MS = 1e3;

  // play/signaling.ts
  async function pollForOffer(token2) {
    while (true) {
      const res = await fetch(`${SIGNALING_SERVER}/offer/${token2}`);
      const data = await res.json();
      if (data.offer) {
        return data.offer;
      }
      await new Promise((r) => setTimeout(r, POLLING_INTERVAL_MS));
    }
  }
  async function sendAnswer(token2, answer) {
    await fetch(`${SIGNALING_SERVER}/answer/${token2}`, {
      method: "POST",
      body: answer
    });
  }

  // play/webRTCReceiver.ts
  var server = { urls: "stun:stun.l.google.com:19302" };
  var receiver = new RTCPeerConnection({ iceServers: [server] });
  var channel = null;
  var messageHandler = {
    token: "",
    onRotate: function(_x, _y, _z) {
    },
    onCalibrate: function(_x, _y, _z) {
    },
    onClick: function(_x, _y, _z) {
    },
    sendVibrate: function(duration) {
      if (channel) {
        channel.send(new Uint16Array([duration]));
      }
    }
  };
  function handleMessage(message) {
    const data = JSON.parse(message.data);
    if (data.length == 0) {
      console.warn("Failed to parse data! AAAARGH!");
      console.log("data", message.data);
      console.log("md", JSON.stringify(message.data));
      return;
    }
    let x = data[0] % 360;
    let y = data[1];
    let z = data[2];
    x = x / 180 * Math.PI;
    y = (y + 180) / 180 * Math.PI;
    z = (z + 90) / 180 * Math.PI;
    if (data[0] < 360) {
      messageHandler.onRotate(z, x, y);
    } else if (data[0] < 720) {
      messageHandler.onCalibrate(z, x, y);
    } else {
      messageHandler.onClick(z, x, y);
    }
  }
  receiver.ondatachannel = (event) => {
    console.log("Wow a data channel!");
    event.channel.binaryType = "arraybuffer";
    event.channel.onmessage = handleMessage;
    event.channel.onopen = (_e) => {
      console.log("Channel opened!");
    };
    event.channel.onclose = (_e) => console.log("Channel closed!");
    channel = event.channel;
  };
  receiver.oniceconnectionstatechange = (_e) => console.log(receiver.iceConnectionState);
  function startSignaling() {
    if (!messageHandler.token) {
      console.error("Token not set!");
      return;
    }
    console.log("Polling for offer...");
    pollForOffer(messageHandler.token).then((offerSdp) => {
      console.log("Received offer!");
      if (receiver.signalingState !== "stable") {
        console.error("Receiver is not stable yet!");
        return;
      }
      const offerDesc = new RTCSessionDescription({ type: "offer", sdp: offerSdp });
      let answerSent = false;
      receiver.setRemoteDescription(offerDesc).then(() => receiver.createAnswer()).then((ans) => receiver.setLocalDescription(ans)).catch(console.log);
      receiver.onicecandidate = (e) => {
        console.log("Receiver ICE candidate " + (e.candidate ? "found" : "gathering complete"));
        if (!answerSent && !e.candidate && receiver.localDescription) {
          answerSent = true;
          console.log("Sending answer via HTTP");
          sendAnswer(messageHandler.token, receiver.localDescription.sdp).catch(console.log);
        }
      };
    }).catch(console.log);
  }

  // play/menu.ts
  var Button = class {
    constructor(x, y, w, h, text) {
      this.selected = false;
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.text = text;
    }
    draw(ctx) {
      let x = this.x;
      let y = this.y;
      let width = this.w;
      let height = this.h;
      let text = this.text;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 10;
      ctx.fillStyle = this.selected ? `rgba(169, 252, 3, 1)` : `rgba(252, 169, 3, 1)`;
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
      ctx.fillStyle = `rgba(255,255,255, 1)`;
      let textMetrics = ctx.measureText(text);
      ctx.strokeText(text, x + width / 2 - textMetrics.width / 2, y + height / 2 + 10);
      ctx.fillText(text, x + width / 2 - textMetrics.width / 2, y + height / 2 + 10);
    }
    contains(y, x) {
      return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
    }
  };
  var Menu = class {
    constructor(canvas) {
      this.audioPreview = null;
      this.levels = [];
      this.buttons = [];
      this.onButtonSelect = () => {
      };
      this.onButtonDeselect = () => {
      };
      this.canvas2d = canvas;
      let btnWidth = 600;
      let btnHeight = 120;
      let padTop = 60;
      let padLeft = (this.canvas2d.canvas.width - btnWidth) / 2;
      fetch("../levels/list.json").then((r) => r.json()).then((j) => {
        let i = 0;
        for (let level of j) {
          i++;
          this.levels.push(level);
          this.buttons.push(new Button(padLeft, (btnHeight + padTop) * i, btnWidth, btnHeight, level.title));
        }
      });
      this.canvas2d.font = "30px Arial";
    }
    onResize() {
      let btnWidth = 600;
      let padLeft = (this.canvas2d.canvas.width - btnWidth) / 2;
      this.buttons.map((btn) => {
        btn.x = padLeft;
      });
      this.canvas2d.fillStyle = `rgba(0, 0, 0, 1.0)`;
      this.canvas2d.clearRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
      this.canvas2d.fillRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
    }
    drawCursor(yAngle, xAngle) {
      let y0 = Math.PI;
      let x0 = Math.PI / 2;
      yAngle -= y0;
      xAngle -= x0;
      if (Math.abs(xAngle) > Math.PI / 2 !== Math.abs(yAngle) > Math.PI / 2) {
        yAngle = -yAngle;
      }
      if (yAngle > Math.PI / 2) {
        yAngle = Math.PI - yAngle;
      } else if (yAngle < -Math.PI / 2) {
        yAngle = -Math.PI - yAngle;
      }
      let menuDistance = 400;
      let xCenter = this.canvas2d.canvas.width / 2;
      let yCenter = this.canvas2d.canvas.height / 2;
      let cx = xCenter + Math.tan(-xAngle) * menuDistance;
      let cy = yCenter - Math.tan(yAngle) * menuDistance;
      let ctx = this.canvas2d;
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, 2 * Math.PI, false);
      ctx.fillStyle = "rgba(200,200,255,0.9)";
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0,50,0,0.8)";
      ctx.stroke();
      this.buttons.map((btn, i) => {
        if (btn.contains(cy, cx) && !btn.selected) {
          if (this.audioPreview)
            this.audioPreview.pause();
          this.audioPreview = null;
          this.audioPreview = new Audio(this.levels[i].song);
          this.audioPreview.play();
          this.onButtonSelect();
          btn.selected = true;
        }
        if (!btn.contains(cy, cx) && btn.selected) {
          if (this.audioPreview) {
            this.audioPreview.pause();
            this.audioPreview = null;
          }
          this.onButtonDeselect();
          btn.selected = false;
        }
      });
    }
    draw() {
      this.canvas2d.fillStyle = `rgba(92, 166, 209, 0.9)`;
      this.canvas2d.fillRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
      let instructions = "Point at the screen and tap with two fingers to calibrate rotation";
      let textMetrics = this.canvas2d.measureText(instructions);
      this.canvas2d.fillStyle = `rgba(0, 0, 0, 1)`;
      this.canvas2d.fillText(instructions, 10 + this.canvas2d.canvas.width / 2 - textMetrics.width / 2, 80);
      instructions = "Select a button and tap with one finger to press it";
      textMetrics = this.canvas2d.measureText(instructions);
      this.canvas2d.fillText(instructions, 10 + this.canvas2d.canvas.width / 2 - textMetrics.width / 2, 130);
      this.buttons.map((btn) => btn.draw(this.canvas2d));
    }
    hide() {
      if (this.audioPreview)
        this.audioPreview.pause();
      this.audioPreview = null;
      this.canvas2d.fillStyle = `rgba(0, 0, 0, 1.0)`;
      this.canvas2d.clearRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
      this.canvas2d.fillRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
    }
  };

  // play/ui.ts
  var calibrateContainer = document.getElementById("calibrate-container");
  if (!calibrateContainer) {
    throw Error("Cannot find calibrate-container");
  }
  calibrateContainer.style.display = "none";
  var state = 0 /* QRCode */;
  function isImage(obj) {
    if (!obj) return false;
    return obj.tagName === "IMG";
  }
  var imgElement = document.getElementById("qrcode");
  if (!isImage(imgElement)) {
    throw new Error("imgElement not found or not image");
  }
  var urlToken = new URLSearchParams(window.location.search).get("token");
  var token = urlToken || Math.random().toString(36).slice(2, 10);
  if (!urlToken) {
    const url = new URL(window.location.href);
    url.searchParams.set("token", token);
    history.replaceState(null, "", url);
  }
  var controllerUrl = new URL(`../controller/?${token}`, window.location.href).href;
  imgElement.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(controllerUrl)}&size=300x300`;
  messageHandler.token = token;
  console.log(token);
  startSignaling();
  var startOverlay = document.getElementById("start-overlay");
  if (!startOverlay) {
    throw Error("Cannot find start-overlay");
  }
  startOverlay.addEventListener("click", () => {
    startOverlay.remove();
    initGame();
  });
  function initGame() {
    const gameWindow = new GameWindow();
    const gameState = new Game(gameWindow);
    const menu = new Menu(gameWindow.ctx);
    window.onresize = function() {
      gameState.onResize();
      menu.onResize();
    };
    menu.onButtonSelect = () => {
      messageHandler.sendVibrate(40);
      gameState.currentLevel.song.pause();
    };
    menu.onButtonDeselect = () => {
      messageHandler.sendVibrate(20);
      gameState.currentLevel.song.play();
    };
    gameState.onHit = () => {
      messageHandler.sendVibrate(100);
    };
    let center_y = 0;
    function subMod2Pi(source, delta) {
      const mod = 2 * Math.PI;
      return (source + mod - delta) % mod;
    }
    messageHandler.onRotate = function(x, y, z) {
      if (state === 0 /* QRCode */ && x && y && z) {
        console.log("Scanned QR, moving to calibration!");
        const helloContainer = document.getElementById("hello-container");
        if (!helloContainer) {
          throw Error("Cannot find hello-container");
        }
        helloContainer.style.display = "none";
        if (!calibrateContainer) {
          throw Error("Cannot find calibrate-container");
        }
        calibrateContainer.style.display = "";
        state = 1 /* Calibrating */;
      }
      y = subMod2Pi(y, center_y);
      if (state === 2 /* LevelSelect */) {
        menu.draw();
        menu.drawCursor(z, y);
      }
      gameState.cursor.rotate(x, y, z);
    };
    messageHandler.onCalibrate = function(x, y, z) {
      console.log("Calibrating!", x.toFixed(2), y.toFixed(2), z.toFixed(2));
      if (state === 1 /* Calibrating */) {
        setTimeout(() => state = 2 /* LevelSelect */, 200);
        console.log("Calibrated! Moving to level select");
        if (!calibrateContainer) {
          throw Error("Cannot find calibrate-container");
        }
        calibrateContainer.style.display = "none";
      }
      if (Math.abs(z - Math.PI) > 0.1 || Math.abs(x - Math.PI / 2) > 0.1) {
        console.warn("Phone is calibrating without being horizontal!");
      }
      const wy = Math.PI / 2;
      center_y = subMod2Pi(y, wy);
    };
    messageHandler.onClick = function(x, y, z) {
      console.log("Click!", x.toFixed(2), y.toFixed(2), z.toFixed(2));
      if (state === 1 /* Calibrating */) {
        messageHandler.onCalibrate(x, y, z);
        return;
      }
      if (state === 2 /* LevelSelect */) {
        y = subMod2Pi(y, center_y);
        menu.draw();
        menu.drawCursor(z, y);
        gameState.cursor.rotate(x, y, z);
        menu.buttons.map((btn, i) => {
          if (btn.selected) {
            btn.selected = false;
            console.log(menu.levels[i], "selected! moving to Playing!");
            gameState.setLevel(menu.levels[i]);
            menu.hide();
            state = 3 /* Playing */;
          }
        });
      }
    };
    function backToMenu() {
      if (state !== 3 /* Playing */) return;
      gameState.reset();
      state = 2 /* LevelSelect */;
      menu.draw();
    }
    window.addEventListener("keydown", function(event) {
      if (event.key === "Escape") backToMenu();
      else if (event.key === " ") {
        if (gameState.paused) gameState.start();
        else gameState.pause();
      }
    });
    gameState.onLevelEnd = backToMenu;
  }
})();
//# sourceMappingURL=bundle.js.map
