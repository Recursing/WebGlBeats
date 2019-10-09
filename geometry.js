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
        ];
        return indices;
    };
    return BeveledCube;
}());
exports.BeveledCube = BeveledCube;
