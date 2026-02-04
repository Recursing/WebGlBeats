
function isCanvas(obj: HTMLElement | null | undefined): obj is HTMLCanvasElement {
    if (!obj)
        return false;
    return obj.tagName === 'CANVAS';
}

export class GameWindow {
    canvasgl: HTMLCanvasElement;
    canvas2d: HTMLCanvasElement;
    gameCanvas: HTMLCanvasElement;
    gl: WebGLRenderingContext;
    ctx: CanvasRenderingContext2D;
    gameCtx: CanvasRenderingContext2D;

    constructor() {
        let maybeCanvas = document.getElementById("webglcanvas");
        if (!isCanvas(maybeCanvas)) {
            alert("Webgl canvas not found!");
            throw Error("Canvas not found!");
        }
        this.canvasgl = maybeCanvas;
        this.canvasgl.oncontextmenu = () => false;
        let maybeGl = this.canvasgl.getContext("webgl", {
            antialias: true,
            depth: true
        });
        if (!maybeGl) {
            alert("webgl not found!");
            throw Error("webgl not found!");
        }
        this.gl = maybeGl;

        maybeCanvas = document.getElementById("canvas2d");
        if (!isCanvas(maybeCanvas)) {
            alert("2d canvas not found!");
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
            alert("Game canvas not found!");
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

    public fillWindow() {
        this.gameCanvas.width = this.canvasgl.width = this.canvas2d.width = window.innerWidth;
        this.gameCanvas.height = this.canvasgl.height = this.canvas2d.height = window.innerHeight;
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.ctx.font = "30px Arial";
        this.gameCtx.font = "30px Arial";
    }
}