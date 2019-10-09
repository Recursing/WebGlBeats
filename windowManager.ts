
function isCanvas(obj: HTMLElement | null | undefined): obj is HTMLCanvasElement {
    if (!obj)
        return false;
    return obj.tagName === 'CANVAS';
}

let oldX = -1, oldY = -1;

export class GameWindow {
    canvasgl: HTMLCanvasElement;
    canvas2d: HTMLCanvasElement;
    gl: WebGLRenderingContext;

    constructor() {
        let maybeCanvas = document.getElementById("webglcanvas");
        if (!isCanvas(maybeCanvas)) {
            alert("Webgl canvas not foud!");
            throw Error("Canvas not found!");
        }
        this.canvasgl = maybeCanvas;
        this.canvasgl.oncontextmenu = () => false;
        let maybeGl = this.canvasgl.getContext("webgl");
        console.log("hey!");
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
        this.canvas2d.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }

    private onMouseMove(event: MouseEvent) {
        if (oldX < 0 || oldY < 0) {
            oldX = event.pageX;
            oldY = event.pageY;
            return;
        }
        let ctx = this.canvas2d.getContext("2d");
        if (!ctx) {
            alert("Can't create canvas context!");
            throw new Error("Can't create canvas context!");
        }
        ctx.clearRect(0, 0, this.canvas2d.width, this.canvas2d.height);
        ctx.beginPath();
        ctx.moveTo(oldX, oldY);
        ctx.lineTo(event.pageX, event.pageY);
        ctx.stroke();
        oldX = event.pageX;
        oldY = event.pageY;
    }

    public fillWindow() {
        this.canvasgl.width = this.canvas2d.width = window.innerWidth;
        this.canvasgl.height = this.canvas2d.height = window.innerHeight;
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }
}