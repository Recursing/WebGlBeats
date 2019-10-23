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
        this.viewMatrix = makeTranslationMatrix(0, -0.5, -6);
    }

    public setAspectRatio(aspectRatio: number) {
        this.perspectiveMatrix = makePerspectiveMatrix(this.fieldOfView, aspectRatio, this.zNear, this.zFar);
    }
}

class Note {
    time: number;
    x: number;
    y: number;
    hue: number;
    constructor(time: number, x: number, y: number, hue: number) {
        this.time = time;
        this.x = x;
        this.y = y;
        this.hue = hue;
    }
}

export class Level {
    song: HTMLAudioElement;
    notes: Note[];
    bpm: number;
    speed: number;

    constructor(songPath: string, bpm: number, points: Note[], speed = 0.1) {
        this.song = new Audio(songPath);
        this.bpm = bpm;
        this.notes = points;
        this.speed = speed;
    }
    public startSong() {
        console.log(this.song);
        this.song.play();
    }
}

let woosh = new Audio('woosh.mp3');
let woosh2 = new Audio('woosh.mp3');
let woosh3 = new Audio('woosh.mp3');
let played = true;

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

export class Cursor {

}

export class Game {
    camera: Camera;
    geometry: Model;
    transformations: mat4[];
    colors: [number, number, number, number][];
    gameWindow: GameWindow;
    shaderManager: ShaderManager;
    lastUpdate: number | null = null;
    cursorProjectionTrail: mat4[];
    cursorProjectionHistory: [number, mat4][] = [];
    paused = true;
    currentLevel: Level;

    constructor(gameWindow: GameWindow) {
        const aspectRatio = gameWindow.canvas2d.width / gameWindow.canvas2d.height;
        this.camera = new Camera(aspectRatio);
        this.geometry = new BeveledCube(1);
        this.transformations = [];
        this.colors = [];
        // TODO load default or get level in constructor
        this.currentLevel = new Level('crab_rave.mp3', 125, []);
        for (let point of this.currentLevel.notes) {
            this.addPoint(point.x, point.y, -point.time * this.currentLevel.speed / 2);
        }

        this.cursorProjectionTrail = [identityMatrix()];
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
        this.currentLevel.startSong();
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
        this.cursorProjectionTrail.push(newCursor);
        // this.cursorProjectionHistory.push([this.currentLevel.song.currentTime, newCursor]);
        while (this.cursorProjectionTrail.length > 100) {
            this.cursorProjectionTrail.shift();
        }
        // console.log(JSON.stringify(this.cursorProjectionHistory));
    }

    public rotateController(x: number, y: number, z: number) {
        let newCursor = identityMatrix();
        translate(newCursor, 0, 0, 2);
        // console.log("x y z: ", Math.floor(x), Math.floor(y), Math.floor(z));
        rotateY(newCursor, y);
        rotateZ(newCursor, z);
        rotateX(newCursor, -x);
        translate(newCursor, -4, 0, 0);
        // scale(newCursor, 5, 0.5, 0.1);
        this.cursorProjectionTrail.push(newCursor);
        while (this.cursorProjectionTrail.length > 100) {
            this.cursorProjectionTrail.shift();
        }
        this.cursorProjectionHistory.push([this.currentLevel.song.currentTime, newCursor]);
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
        outer: for (let i = this.cursorProjectionTrail.length - 1; i > 0; i--) {
            for (let interp_number = 0; interp_number < 10; interp_number++) {
                let interp_factor = interp_number / 10;
                let reversed_index = this.cursorProjectionTrail.length - 1 - i;
                let scale_factor = 1 - (reversed_index - interp_factor) / 20;
                scale_factor *= scale_factor;
                if (scale_factor < 0.5) {
                    break outer;
                }

                const color_factor = scale_factor * 2 - 1;
                const r = (0.05 + color_factor * 0.05);
                const g = r;
                const b = 0.1 + color_factor * 0.9;

                this.shaderManager.setColor([r, g, b, 1]);
                let tempModelMatrix = this.camera.viewMatrix.slice() as mat4;
                let interpolatedMatrix = interpolate(this.cursorProjectionTrail[i], this.cursorProjectionTrail[i - 1], interp_factor);
                multiply(tempModelMatrix, interpolatedMatrix);
                scale(tempModelMatrix, scale_factor * 2, scale_factor * 0.1, scale_factor * scale_factor * 0.025);
                this.shaderManager.setModelViewMatrix(tempModelMatrix);
                this.shaderManager.draw();

                this.shaderManager.setColor([b, r, g, 1]);
                tempModelMatrix = this.camera.viewMatrix.slice() as mat4;
                let oppositeCursor = this.cursorProjectionTrail[i].slice() as mat4;
                translate(oppositeCursor, 8, 0, 0);
                let prevOppositeCursor = this.cursorProjectionTrail[i - 1].slice() as mat4;
                translate(prevOppositeCursor, 8, 0, 0);
                interpolatedMatrix = interpolate(oppositeCursor, prevOppositeCursor, interp_factor);
                multiply(tempModelMatrix, interpolatedMatrix);
                scale(tempModelMatrix, scale_factor * 2, scale_factor * 0.1, scale_factor * scale_factor * 0.025);
                this.shaderManager.setModelViewMatrix(tempModelMatrix);
                this.shaderManager.draw();
            }
        }
    }

    public update(currentMillis: number) {
        if (!this.lastUpdate)
            this.lastUpdate = currentMillis;
        let dt = (currentMillis - this.lastUpdate);
        for (let modelMatrix of this.transformations) {
            translate(modelMatrix, 0, 0, this.currentLevel.speed * dt);
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
        let phase = (currentMillis * this.currentLevel.bpm / 60000) % 1;
        phase = phase * 2 - 1;
        let cubeModel = new BeveledCube(Math.exp(-10 * phase * phase) / 3 + 0.1);
        this.shaderManager.setVertices(cubeModel.getVertices());
        this.lastUpdate = currentMillis;
    }

    public tick(dt: number) {
        // Stress testing browsers for fun
        if (!this.paused) {
            this.update(dt);
        }
        this.draw();
        requestAnimationFrame((dt: number) => { this.tick(dt); });
    }
}
