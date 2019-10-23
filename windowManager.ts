
function isCanvas(obj: HTMLElement | null | undefined): obj is HTMLCanvasElement {
    if (!obj)
        return false;
    return obj.tagName === 'CANVAS';
}

export class GameWindow {
    canvasgl: HTMLCanvasElement;
    canvas2d: HTMLCanvasElement;
    gl: WebGLRenderingContext;
    ctx: CanvasRenderingContext2D;

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
        this.fillWindow();
        let maybeCtx = this.canvas2d.getContext("2d");
        if (!maybeCtx) {
            alert("Can't create canvas context!");
            throw new Error("Can't create canvas context!");
        }
        this.ctx = maybeCtx;
    }

    public fillWindow() {
        this.canvasgl.width = this.canvas2d.width = window.innerWidth;
        this.canvasgl.height = this.canvas2d.height = window.innerHeight;
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }
}