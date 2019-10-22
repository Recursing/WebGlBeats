import { BeveledCube, makePerspectiveMatrix, makeTranslationMatrix, mat4, Model, identityMatrix, translate, multiply, scale, rotateX, rotateY, rotateZ, interpolate } from './geometry';
import { GameWindow } from './windowManager';
import { ShaderManager } from './shaders';


export class Camera {
    fieldOfView = 40 * Math.PI / 180;
    zNear = 1.0;
    zFar = 1000.0;
    aspectRatio = 1.0;
    perspectiveMatrix: mat4;
    viewMatrix: mat4; // Translation + rotation
    constructor(aspectRatio: number) {
        this.perspectiveMatrix = makePerspectiveMatrix(this.fieldOfView, aspectRatio, this.zNear, this.zFar);
        this.viewMatrix = makeTranslationMatrix(0, -3, -12);
    }

    public setAspectRatio(aspectRatio: number) {
        this.perspectiveMatrix = makePerspectiveMatrix(this.fieldOfView, aspectRatio, this.zNear, this.zFar);
    }
}

let points: number[][] = [[5264, 1.93, 0.065], [6193, -0.18, -0.015], [7126, 1.79, -0.285], [7771, -1.36, -0.255], [8250, 3.92, -0.245], [9283, -0.11, 2.665], [10103, 0.17, -3.165], [11119, -0.45, 2.185], [11600, -0.4, -2.255], [12115, -0.66, 3.225], [13187, -0.32, -1.895], [14045, -0.33, 3.415], [14914, -0.41, -1.775], [15445, -0.65, 2.015], [15924, -0.56, -2.555], [16934, 2.78, 0.035], [17829, -1.57, -0.145], [18813, 1.9, -0.275], [19279, -2.21, -0.225], [19735, 0.43, -0.265], [20716, -0.59, 3.165], [21636, -0.51, -2.325], [22653, -0.4, 1.455], [23169, -0.42, -2.045], [23648, -0.51, 1.135], [24518, 3.43, -0.315], [25452, -2.08, -0.475], [26410, 0.04, 2.285], [26941, 0.28, -3.455], [27472, -0.05, 2.215], [28571, -0.1, -3.625], [29353, -0.36, 2.105], [30287, 2.23, -1.185], [30892, -1.88, -0.905], [31335, 1.12, -0.565], [32357, -1.43, 1.625], [33239, 2.38, 2.535], [34070, 0.1, 3.165], [34651, 0.47, -2.175], [35158, -2.22, 0.445], [36167, 1.77, 0.185], [37075, -1.84, 2.825], [37982, 0.7, -3.165], [38512, 1.78, 2.485], [39005, 1.39, -3.775], [39989, -2.53, 2.915], [40856, -2.5, -1.115], [41839, -2.12, 2.185], [42330, -2.15, -1.605], [42835, -1.9, 2.305], [43870, 1.93, -0.045], [44715, -2.9, 0.045], [45674, 2.33, 0.145], [46142, -2.44, 0.305], [46571, 2.04, -0.105], [47605, -0.08, 2.115], [48587, -0.13, -2.185], [49482, -2.77, 0.505], [49986, 2.49, 0.005], [50441, -2.54, 0.355], [51448, 0.61, -2.905], [52343, -0.03, 2.655], [53316, 2.62, 0.345], [53874, -2.06, 0.085], [54352, 1.59, 0.035], [55248, -0.83, 3.355], [56281, -0.5, -3.265], [57127, -2.93, 0.385], [57633, 2.39, 0.295], [58137, -2.52, 0.385], [59146, 1.99, 2.885], [60105, 1.8, -3.035], [61064, 1.44, 3.255], [61607, 1.41, -1.615], [62149, 1.39, 2.645], [62945, -2.87, 3.385], [63954, -2.52, -2.455], [64861, 1.79, 2.465], [65355, 1.89, -1.715], [65870, 1.44, 1.655], [66892, -0.64, 0.135], [67723, 2.64, 0.285], [68595, -1.48, 0.415], [69211, 1.03, 2.715], [69694, 0.35, -1.815], [70687, -1.27, 0.935], [71544, 2.02, 0.475], [72376, -1.33, 0.085], [73084, 2.22, -0.045], [73450, -1.49, 0.535], [73941, 1.23, 2.595], [74447, 0.48, -2.025], [75354, -1.85, 0.635], [76073, 1.41, 0.355], [76816, -1.47, 0.395], [77219, 1.35, 0.305], [78328, -1.19, 1.305], [79298, 2.13, -0.175], [80168, -0.18, 2.115], [81264, 0.08, -1.795], [81732, 0.16, 0.915], [82223, 0.65, -2.225], [83194, 3.34, -0.105], [83885, -0.05, 0.025], [85095, 2.59, 0.375], [86029, 0.22, 0.425], [86923, -0.46, 1.985], [87845, -0.76, -2.865], [88838, -0.75, 3.345], [89846, -0.07, -0.005], [90813, -0.11, 2.455], [91835, -0.01, -0.355], [92742, -0.05, 1.965], [97577, 0.02, 0.275], [98243, 2.35, -0.035], [98585, -0.63, -0.065], [99089, -1.31, -0.025], [99391, 1.75, 0.155], [99908, -1.22, 0.155], [100161, 2.74, 0.365], [100554, -1.79, 0.785], [100994, 0.59, 0.755], [101286, 0.77, -3.005], [101752, -0.23, -1.325], [101968, 0.54, -2.635], [102435, 1.54, -0.075], [102825, -2.13, 2.645], [103104, 1.59, -2.275], [103570, 2.32, 1.145], [104024, -0.89, 1.435], [104517, -0.6, -2.065], [104796, 1.39, 0.185], [105287, -1.33, 1.595], [105744, 0.17, -1.895], [106183, 1.82, 0.555], [106701, -1.38, 1.485], [106943, 1.76, 1.945], [107548, 1.43, -2.275], [108117, 0.67, 1.735], [108585, -0.1, 0.395], [108912, 2.21, -0.515], [109457, -0.3, -0.505], [109748, -0.36, 0.655], [110177, 2.35, -2.155], [110556, -2.41, -0.425], [110860, 0.95, 1.935], [111339, 0.07, -2.425], [111794, -1.52, 1.785], [112235, 1.35, 0.975], [112487, -1.27, -1.415], [113019, -1.07, 2.345], [113472, 1.71, -1.765], [113941, 0.66, 1.625], [114421, -2.28, -0.085], [114661, 2.46, -0.405], [115268, 0.28, -2.255], [115646, 0.44, -0.165], [116013, 3.42, -2.905], [116442, -3.19, 1.855], [116696, 1.35, 0.815], [117176, 0.47, -1.285], [117440, -1.74, 2.905], [117833, 2.82, 0.515], [118288, -1.01, 0.655], [118528, 2.79, 2.095], [119037, 1.54, -1.665], [119477, 0.61, 1.765], [119955, -2.66, 1.515], [120184, -0.32, -1.485], [120677, 2.16, 2.845], [121094, -1.75, 3.335], [121567, -0.91, -1.515], [122077, 1.36, 0.855], [122317, -2.28, 2.155], [122822, -0.68, -0.395], [123440, 0.08, 3.225], [123913, 4, 0.315], [124178, -3.52, 0.375], [124667, -0.89, -1.395], [124944, -1.3, 1.995], [125440, 1.32, -1.385], [125933, 0.26, 1.065], [126249, -3.56, 0.695], [126707, 1.3, 0.065], [127198, 0.56, -3.365], [127638, -0.46, 1.405], [127892, -0.35, -0.025], [128398, 1.78, 0.585], [128827, -4.62, 1.295], [129270, 0.94, -0.215], [129726, -0.15, -2.495], [130003, -1.14, 1.885], [130510, 1.11, 0.185], [130851, -2.33, -0.225], [131255, 1.89, 1.625], [131786, -1.84, -0.795], [132064, -0.93, 2.035], [132520, 1.58, -2.045], [132711, 0.31, -1.205], [133182, 2.5, 2.745], [133631, -1.37, 1.595], [133860, -0.07, -1.075], [134366, 2.58, 2.555], [134769, -0.55, 2.985], [135326, -0.35, -0.305], [135607, 1.52, 2.885], [136041, -2.19, 3.685], [136509, 0.75, 0.415], [136939, -0.49, 3.585], [137432, -1.72, -0.795], [137723, 3.75, 0.315], [138190, -1.47, 2.445], [138434, 0.57, -2.825], [138885, 1.34, 2.525], [139318, -1.74, 2.025], [139584, 1.43, -2.975], [140084, 0.8, 1.045], [140324, -1.59, 1.405], [140753, -1.1, -2.105], [141232, 2.06, 0.085], [141512, -1.71, 2.005], [141978, -0.21, -1.045], [142396, 0.91, 1.345], [142872, -1.61, 2.265], [143150, 1.63, -2.555], [143693, -0.2, 0.305]];
let song = new Audio('crab_rave.mp3');
song.play();
song.volume = 0.1;
let woosh = new Audio('woosh.mp3');
let woosh2 = new Audio('woosh.mp3');
let woosh3 = new Audio('woosh.mp3');
let played = true;

points.sort((a, b) => b[0] - a[0]);
let speed = 0.1;

function HuetoRGB(hue: number): [number, number, number] {
    let hue2rgb = function hue2rgb(p: number, q: number, t: number): number {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }
    let p = 0;
    let q = 1;
    let r = hue2rgb(p, q, hue + 1 / 3);
    let g = hue2rgb(p, q, hue);
    let b = hue2rgb(p, q, hue - 1 / 3);
    return [r, g, b];
}

export class Game {
    camera: Camera;
    geometry: Model;
    transformations: mat4[];
    colors: [number, number, number, number][];
    gameWindow: GameWindow;
    shaderManager: ShaderManager;
    lastUpdate: number | null = null;
    cursorProjection: mat4[];
    paused = true;

    constructor(gameWindow: GameWindow) {
        const aspectRatio = gameWindow.canvas2d.width / gameWindow.canvas2d.height;
        this.camera = new Camera(aspectRatio);
        this.geometry = new BeveledCube(1);
        this.transformations = [];
        this.colors = [];
        for (let point of points) {
            this.addPoint(point[1], point[2], -point[0] * speed / 2);
        }

        this.cursorProjection = [identityMatrix()];
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
        this.shaderManager = new ShaderManager(gameWindow.gl);
        this.shaderManager.setCamera(this.camera);
        this.shaderManager.setVertices(this.geometry.getVertices());
        this.shaderManager.setNormals(this.geometry.getNormals());
        this.shaderManager.setTriangles(this.geometry.getTriangleIndices());
        this.shaderManager.setColor([1.0, 0, 0, 1.0]);
        //this.draw();
        this.tick(0);
    }

    public start() {
        this.paused = false;
        this.tick(0);
    }

    public addPoint(x: number, y: number, z: number) {
        let t = identityMatrix();
        if (Math.abs(x) < 2 && Math.abs(y) < 2)
            x *= 2 / Math.abs(x);
        translate(t, x, y, z);
        this.transformations.push(t);
        let rgb = HuetoRGB(Math.random());
        this.colors.push([rgb[0], rgb[1], rgb[2], 1.0]);
        // let ti = Math.round(performance.now());
        // points.push([ti, x, y]);
        // console.log(JSON.stringify(points));
    }

    public moveCursor(x: number, y: number) {
        let newCursor = identityMatrix();
        rotateX(newCursor, 0.1);
        rotateY(newCursor, 0.1);
        translate(newCursor, x / 100, -y / 100 + 4, -10);
        this.cursorProjection.push(newCursor);
        while (this.cursorProjection.length > 100) {
            this.cursorProjection.shift();
        }
    }

    public rotateController(x: number, y: number, z: number) {
        let newCursor = identityMatrix();
        translate(newCursor, 0, 2, -10);
        // console.log("x y z: ", Math.floor(x), Math.floor(y), Math.floor(z));
        rotateY(newCursor, y);
        rotateZ(newCursor, z);
        rotateX(newCursor, -x);
        translate(newCursor, -10, 0, 0);
        scale(newCursor, 2, 0.5, 0.1);
        this.cursorProjection.push(newCursor);
        while (this.cursorProjection.length > 100) {
            this.cursorProjection.shift();
        }
    }

    public deleteFirstPoint() {
        if (this.transformations.length == 0)
            return;
        this.colors.pop();
        this.transformations.pop();
        let lastColor = this.colors[this.colors.length - 1];
        for (let i in lastColor)
            lastColor[i] = (1 + lastColor[i]);
    }

    public onResize() {
        console.log("resize");
        this.gameWindow.fillWindow();
        const aspectRatio = this.gameWindow.canvas2d.width / this.gameWindow.canvas2d.height;
        this.camera.setAspectRatio(aspectRatio);
        this.shaderManager.setCamera(this.camera);
    }

    public draw() {
        // TODO
        this.shaderManager.clear();

        for (let i in this.transformations) {
            this.shaderManager.setColor(this.colors[i]);
            let modelViewMatrix = this.camera.viewMatrix.slice() as mat4;
            multiply(modelViewMatrix, this.transformations[i]);
            this.shaderManager.setModelViewMatrix(modelViewMatrix);
            this.shaderManager.draw();
        }
        for (let i = this.cursorProjection.length - 1; i > 0; i--) {
            for (let interp_number = 0; interp_number < 5; interp_number++) {
                let interpolatedMatrix = this.camera.viewMatrix.slice() as mat4;
                let interp_factor = interp_number / 5;
                multiply(interpolatedMatrix, interpolate(this.cursorProjection[i], this.cursorProjection[i - 1], interp_factor));
                let reversed_index = this.cursorProjection.length - 1 - i;
                let scale_factor = 1 - (reversed_index - interp_factor) / 20;
                scale_factor *= scale_factor;
                if (scale_factor < 0.2) {
                    i = 0;
                    break;
                }
                scale(interpolatedMatrix, scale_factor, scale_factor, scale_factor);
                let r = 0.05 + scale_factor * 0.05;
                let g = r;
                let b = 0.1 + scale_factor * 0.9;
                this.shaderManager.setColor([r, g, b, 1]);
                this.shaderManager.setModelViewMatrix(interpolatedMatrix);
                this.shaderManager.draw();
            }
        }
    }

    public update(currentMillis: number) {
        if (!this.lastUpdate)
            this.lastUpdate = currentMillis;
        let dt = (currentMillis - this.lastUpdate);
        for (let modelMatrix of this.transformations) {
            translate(modelMatrix, 0, 0, speed * dt);
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
        let bpm = 125;
        let phase = (currentMillis * bpm / 60000) % 1;
        phase = phase * 2 - 1;
        let cubeModel = new BeveledCube(Math.exp(-10 * phase * phase) / 3 + 0.1);
        this.shaderManager.setVertices(cubeModel.getVertices());
        this.lastUpdate = currentMillis;
    }

    public tick(dt: number) {
        // Stress testing browsers for fun
        if (!this.paused) {
            this.update(dt);
            this.draw();
        }
        requestAnimationFrame((dt: number) => { this.tick(dt); });
    }
}
