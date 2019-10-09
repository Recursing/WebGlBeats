import { BeveledCube, makePerspectiveMatrix, makeTranslationMatrix, mat4, Model, identityMatrix, translate, multiply, scale, rotateX, rotateY } from './geometry';
import { GameWindow } from './windowManager';
import { ShaderManager } from './shaders';


export class Camera {
    fieldOfView = 45 * Math.PI / 180;
    zNear = 1.0;
    zFar = 100.0;
    aspectRatio = 1.0;
    perspectiveMatrix: mat4;
    viewMatrix: mat4; // Translation + rotation
    constructor(aspectRatio: number) {
        this.perspectiveMatrix = makePerspectiveMatrix(this.fieldOfView, aspectRatio, this.zNear, this.zFar);
        this.viewMatrix = makeTranslationMatrix(0, 0, -12);
    }

    public setAspectRatio(aspectRatio: number) {
        this.perspectiveMatrix = makePerspectiveMatrix(this.fieldOfView, aspectRatio, this.zNear, this.zFar);
    }
}


export class Game {
    camera: Camera;
    geometry: Model;
    transformations: mat4[];
    colors: [number, number, number, number][];
    gameWindow: GameWindow;
    shaderManager: ShaderManager;
    lastUpdate: number | null = null;

    constructor(gameWindow: GameWindow) {
        const aspectRatio = gameWindow.canvas2d.width / gameWindow.canvas2d.height;
        this.camera = new Camera(aspectRatio);
        this.geometry = new BeveledCube(1);
        this.transformations = [identityMatrix];
        this.colors = [[1, 0, 0, 1]];
        for (let x = -10; x <= 10; x++) {
            for (let y = -10; y <= 10; y++) {
                for (let z = -20; z <= -5.0; z++) {
                    this.transformations.push(makeTranslationMatrix(x + Math.random() / 40, y + 2 - Math.random() / 40, z));
                    this.colors.push([Math.random(), Math.random(), Math.random(), 1.0]);
                }
            }
        }
        console.log(this.transformations.length);
        for (let t of this.transformations) {
            scale(t, 0.25, 0.25, 0.25);
        }
        this.gameWindow = gameWindow;
        this.shaderManager = new ShaderManager(gameWindow.gl);
        this.shaderManager.setCamera(this.camera);
        this.shaderManager.setVertices(this.geometry.getVertices());
        this.shaderManager.setNormals(this.geometry.getNormals());
        this.shaderManager.setTriangles(this.geometry.getTriangleIndices());
        this.shaderManager.setColor([1.0, 0, 0, 1.0]);
        this.draw();
        console.log("hmmm");
        this.tick(0);
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
        this.shaderManager.draw();
    }

    public update(currentMillis: number) {
        let speed = 0.01;
        if (!this.lastUpdate)
            this.lastUpdate = currentMillis;
        let dt = (currentMillis - this.lastUpdate);
        for (let modelMatrix of this.transformations) {
            rotateX(modelMatrix, 0.001 * dt);
            rotateY(modelMatrix, 0.0003 * dt);
            translate(modelMatrix, 0, 0, speed * dt);
        }
        translate(this.camera.viewMatrix, 0, 0, speed / 20 * dt);
        this.shaderManager.setCamera(this.camera);
        let bpm = 125;
        let phase = (currentMillis * bpm / 60000) % 1;
        phase = phase * 2 - 1;
        let cubeModel = new BeveledCube(Math.exp(-10 * phase * phase) / 4 + 0.05);
        this.shaderManager.setVertices(cubeModel.getVertices());
        this.lastUpdate = currentMillis;
    }

    public tick(dt: number) {
        // Stress testing browsers for fun
        this.update(dt);
        this.shaderManager.clear();
        for (let i in this.transformations) {
            this.shaderManager.setColor(this.colors[i]);
            let modelViewMatrix = this.camera.viewMatrix.slice() as mat4;
            multiply(modelViewMatrix, this.transformations[i]);
            this.shaderManager.setModelViewMatrix(modelViewMatrix);
            this.draw();
        }
        requestAnimationFrame((dt: number) => { this.tick(dt); });
    }
}
