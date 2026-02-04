import { multiply, BeveledCube, makePerspectiveMatrix, makeTranslationMatrix, mat4, Model, identityMatrix, translate, scale, rotateX, rotateY, rotateZ, interpolate, hypot } from './geometry';
import { GameWindow } from './windowManager';
import { ShaderManager } from './shaders';
import { LevelDescription } from './menu';


export class Camera {
    fieldOfView = 90 * Math.PI / 180;
    zNear = 5.0;
    zFar = 500.0;
    aspectRatio = 1.0;
    perspectiveMatrix: mat4;
    viewMatrix: mat4; // Translation + rotation
    constructor(aspectRatio: number) {
        this.perspectiveMatrix = makePerspectiveMatrix(this.fieldOfView, aspectRatio, this.zNear, this.zFar);
        this.viewMatrix = makeTranslationMatrix(0, -0.5, -12);
    }

    public setAspectRatio(aspectRatio: number) {
        this.perspectiveMatrix = makePerspectiveMatrix(this.fieldOfView, aspectRatio, this.zNear, this.zFar);
    }
}

export class Level {
    song: HTMLAudioElement;
    notes: Note[];
    bpm: number;
    speed: number;
    title: string;

    constructor(songPath: string, bpm: number, points: Note[], speed = 0.1, title = "") {
        this.song = new Audio(songPath);
        this.song.volume = 0.2;
        this.startSong();
        this.bpm = bpm;
        this.notes = points;
        this.speed = speed;
        this.title = title;
    }
    public startSong() {
        console.log(this.song);
        this.song.play();
    }
}

function fromDescription(desc: LevelDescription): Level {
    let notes: Note[] = [];
    fetch(desc.notes)
        .then((r) => r.json())
        .then((j) => {
            j.map((point: number[]) => {
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

// TODO
let wooshes = [new Audio('../audio/woosh.wav?v=334'), new Audio('../audio/woosh.wav'), new Audio('../audio/woosh.wav'), new Audio('../audio/woosh.wav'), new Audio('../audio/woosh.mp3')];
wooshes.map((w) => {
    w.playbackRate = 3;
    w.volume = 0.01;
});

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

class Note {
    time: number;
    x: number;
    y: number;
    hue: number;
    hitAt: number | null = null;

    constructor(time: number, x: number, y: number, hue: number) {
        this.time = time;
        this.x = x;
        this.y = y;
        this.hue = hue;
    }

    public draw(shader: ShaderManager, viewMatrix: mat4, currentTime: number, speed: number) {
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


        let modelViewMatrix = viewMatrix.slice() as mat4;
        multiply(modelViewMatrix, t);
        shader.setModelViewMatrix(modelViewMatrix);
        shader.draw();
    }
}

export class Cursor {
    handleLength = 8;
    bladeLength = 5;
    trail: mat4[] = [];

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

    public rotate(x: number, y: number, z: number) {
        let newCursor = identityMatrix();
        // console.log("x y z: ", Math.floor(x), Math.floor(y), Math.floor(z));
        // translate(newCursor, 0, 0, 0);
        rotateY(newCursor, y);
        rotateZ(newCursor, z);
        rotateX(newCursor, -x);
        // translate(newCursor, -4, 0, 0);
        // scale(newCursor, 5, 0.5, 0.1);
        this.trail.push(newCursor);
        while (this.trail.length > 30) {
            this.trail.shift();
        }
    }

    public getRotation(): mat4 {
        return this.trail[this.trail.length - 1].slice() as mat4;
    }

    public draw(shader: ShaderManager, viewMatrix: mat4) {
        const xScale = this.bladeLength;
        const yScale = 0.1;
        const zScale = 0.025;
        const handleLength = this.handleLength;
        outer: for (let i = this.trail.length - 1; i > 0; i--) {
            for (let interp_number = 0; interp_number < 10; interp_number++) {
                let interp_factor = interp_number / 10;
                let reversed_index = this.trail.length - 1 - i;
                let scale_factor = 1 - (reversed_index - interp_factor) / 20;
                //scale_factor *= scale_factor;
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
                let tempModelMatrix = viewMatrix.slice() as mat4;
                let interpolatedMatrix = interpolate(this.trail[i], this.trail[i - 1], interp_factor);
                translate(interpolatedMatrix, -handleLength, 0, 0);
                multiply(tempModelMatrix, interpolatedMatrix);
                scale(tempModelMatrix, xs, ys, zs);
                shader.setModelViewMatrix(tempModelMatrix);
                shader.draw();


                shader.setColor([b, r, g]);
                tempModelMatrix = viewMatrix.slice() as mat4;
                translate(interpolatedMatrix, 2 * handleLength, 0, 0);
                multiply(tempModelMatrix, interpolatedMatrix);
                scale(tempModelMatrix, xs, ys, zs);
                shader.setModelViewMatrix(tempModelMatrix);
                shader.draw();
            }
        }
    }

}

const walls = [identityMatrix(), identityMatrix(), identityMatrix(), identityMatrix()];
walls.map((floor, index) => {
    rotateZ(floor, (index - 2) * (Math.PI / 2));
    translate(floor, 0, -15, -80);
    scale(floor, 15, 0.2, 100);
});

const drawWalls = (shader: ShaderManager, viewMatrix: mat4) => {
    for (let floor of walls) {
        shader.setColor([0.5, 0.3, 0.1]);
        const modelViewMatrix = viewMatrix.slice() as mat4;
        multiply(modelViewMatrix, floor);
        shader.setModelViewMatrix(modelViewMatrix);
        shader.draw();
    }
};

export class Game {
    camera: Camera;
    cursor: Cursor;
    geometry: Model;
    colors: [number, number, number, number][];
    gameWindow: GameWindow;
    shaderManager: ShaderManager;
    paused = true;
    currentLevel: Level;
    notesHit = 0;
    notesMissed = 0;
    score = 0;
    multiplier = 1;
    onLevelEnd = () => { };
    onHit = () => { };
    private lastFrameTime = 0;
    private readonly frameInterval = 20; // 50fps cap (1000ms / 50 = 20ms)

    constructor(gameWindow: GameWindow) {
        const aspectRatio = gameWindow.canvas2d.width / gameWindow.canvas2d.height;
        this.camera = new Camera(aspectRatio);
        this.cursor = new Cursor();
        this.geometry = new BeveledCube(1);
        this.colors = [];
        // TODO load default or get level in constructor
        this.currentLevel = new Level('../audio/dearly_beloved.mp3', 60, []);
        
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
        this.shaderManager.setColor([1.0, 0, 0]);
        //this.draw();
        this.tick(0);
    }

    public setLevel(desc: LevelDescription) {
        this.currentLevel.song.pause();
        this.currentLevel = fromDescription(desc);
        this.start();
    }

    public start() {
        this.paused = false;
        this.currentLevel.startSong();
    }

    public pause() {
        this.paused = true;
        this.currentLevel.song.pause();
        let ctx = this.gameWindow.gameCtx;
        let cw = this.gameWindow.canvas2d.width;
        let ch = this.gameWindow.canvas2d.height;
        ctx.clearRect(0, 0, cw, ch);
    }

    public reset() {
        this.paused = true;
        this.notesMissed = this.notesHit = this.score = 0;
        this.multiplier = 1;
        this.currentLevel.song.pause();
        this.currentLevel = new Level('../audio/dearly_beloved.mp3', 60, []);
            }

    public onResize() {
        this.gameWindow.fillWindow();
        const aspectRatio = this.gameWindow.canvas2d.width / this.gameWindow.canvas2d.height;
        this.camera.setAspectRatio(aspectRatio);
        this.shaderManager.setCamera(this.camera);
    }

    public draw() {
        const currentMillis = this.currentLevel.song.currentTime * 1000;

        // Bevel cubes to the beat
        let phase = (currentMillis * this.currentLevel.bpm / 60000) % 1;
        phase = phase * 2 - 1;
        const bevel = Math.exp(-10 * phase * phase) / 2 + 0.2;

        let cubeModel = new BeveledCube(bevel);
        this.shaderManager.setVertices(cubeModel.getVertices());

        // Draw notes first, then cursor
        //this.shaderManager.clear();
        for (let note of this.currentLevel.notes) {
            note.draw(this.shaderManager, this.camera.viewMatrix, currentMillis, this.currentLevel.speed);
            if (note.time > currentMillis + 8000)
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

    public update() {
        if (this.cursor.trail.length < 2) { return; }
        if (this.paused) { return; }

        if (this.currentLevel.song.ended) { this.onLevelEnd(); }

        const currentMillis = this.currentLevel.song.currentTime * 1000;
        for (let note of this.currentLevel.notes) {
            if (note.hitAt)
                continue;

            // Collision detection
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
            if (note.time > currentMillis + 1000) {
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

    public tick(t: number) {
        this.draw();
        this.update();

        const elapsed = t - this.lastFrameTime;
        this.lastFrameTime = t;
        const delay = Math.max(0, this.frameInterval - elapsed);

        setTimeout(() => {
            requestAnimationFrame((dt: number) => { this.tick(dt); });
        }, delay);
    }
}
