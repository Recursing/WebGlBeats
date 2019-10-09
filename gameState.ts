import { Cube, makePerspectiveMatrix, makeTranslationMatrix, mat4, Model, identityMatrix, translate, scale, rotateX, rotateY } from './geometry';
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
        this.viewMatrix = makeTranslationMatrix(0, 0, -6);
    }

    public setAspectRatio(aspectRatio: number) {
        this.perspectiveMatrix = makePerspectiveMatrix(this.fieldOfView, aspectRatio, this.zNear, this.zFar);
    }
}

export class Solid {
    model: Model;
    transformation: mat4;
    constructor(model: Model, transformation = identityMatrix) {
        this.model = model;
        this.transformation = transformation;
    }
    translate(x: number, y: number, z: number) {
        translate(this.transformation, x, y, z);
    }
    rotate(x: number, y: number, z = 0) {
        rotateX(this.transformation, x);
        rotateY(this.transformation, y);
        if (z)
            throw Error("rotate Z not yet implemented")
    }
    scale(x: number, y: number, z: number) {
        scale(this.transformation, x, y, z);
    }
}

export class Game {
    camera: Camera;
    cubes: Cube[];
    gameWindow: GameWindow;
    shaderManager: ShaderManager;
    lastUpdate: number | null = null;

    constructor(gameWindow: GameWindow) {
        const aspectRatio = gameWindow.canvas2d.width / gameWindow.canvas2d.height;
        this.camera = new Camera(aspectRatio);
        this.cubes = [new Cube(1)];
        this.gameWindow = gameWindow;
        this.shaderManager = new ShaderManager(gameWindow.gl);
        this.shaderManager.setCamera(this.camera);
        this.shaderManager.setVertices(this.cubes[0].getVertices());
        this.shaderManager.setTriangles(this.cubes[0].getTriangleIndices());
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
        if (this.lastUpdate)
            rotateX(this.camera.viewMatrix, 0.001 * (currentMillis - this.lastUpdate));
        this.shaderManager.setCamera(this.camera);
        let cubeModel = new Cube((Math.sin(performance.now() / 1000) + 1) / 8);
        this.shaderManager.setVertices(cubeModel.getVertices());
        this.lastUpdate = currentMillis;
    }

    public tick(dt: number) {
        let t0 = performance.now();
        for (let i = 0; i < 1; i++) {
            this.update(dt);
            this.draw();
        }
        console.log(performance.now() - t0);
        requestAnimationFrame((dt: number) => { this.tick(dt); });
    }
}
