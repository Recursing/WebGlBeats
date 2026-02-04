class Button {
    x: number;
    y: number;
    w: number;
    h: number;
    text: string;
    selected = false;

    constructor(x: number, y: number, w: number, h: number, text: string) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
    }

    public draw(ctx: CanvasRenderingContext2D) {
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

    public contains(y: number, x: number): boolean {
        return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h)
    }
}

export class LevelDescription {
    title: string;
    song: string;
    bpm: number;
    speed: number;
    notes: string;

    constructor(title: string, song: string, bpm: number, speed: number, notes: string) {
        this.title = title;
        this.song = song;
        this.bpm = bpm;
        this.speed = speed;
        this.notes = notes;
    }
}

export class Menu {
    audioPreview: HTMLAudioElement | null = null;
    canvas2d: CanvasRenderingContext2D;
    levels: LevelDescription[] = [];
    buttons: Button[] = [];
    onButtonSelect = () => { };
    onButtonDeselect = () => { };

    constructor(canvas: CanvasRenderingContext2D) {
        this.canvas2d = canvas;
        let btnWidth = 600;
        let btnHeight = 120;
        let padTop = 60;
        let padLeft = (this.canvas2d.canvas.width - btnWidth) / 2;
        fetch("../levels/list.json").then((r) => r.json())
            .then((j) => {
                let i = 0;
                for (let level of j) {
                    i++;
                    this.levels.push(level);
                    this.buttons.push(new Button(padLeft, (btnHeight + padTop) * i, btnWidth, btnHeight, level.title))
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

    drawCursor(yAngle: number, xAngle: number) {
        let y0 = Math.PI;
        let x0 = Math.PI / 2;
        yAngle -= y0;
        xAngle -= x0;

        if ((Math.abs(xAngle) > Math.PI / 2) !== (Math.abs(yAngle) > Math.PI / 2)) { // Red end
            yAngle = -yAngle;
        }

        if (yAngle > Math.PI / 2) {
            yAngle = Math.PI - yAngle;
        }
        else if (yAngle < - Math.PI / 2) {
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
        ctx.fillStyle = 'rgba(200,200,255,0.9)';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0,50,0,0.8)';
        ctx.stroke();

        this.buttons.map((btn, i) => {
            if (btn.contains(cy, cx) && !btn.selected) {
                if (this.audioPreview)
                    this.audioPreview.pause();
                this.audioPreview = null;
                this.audioPreview = new Audio(this.levels[i].song);
                this.audioPreview.volume = 0.1;
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

        let instructions = "Point at the screen and tap with two fingers to calibrate rotation"
        let textMetrics = this.canvas2d.measureText(instructions);
        this.canvas2d.fillStyle = `rgba(0, 0, 0, 1)`
        this.canvas2d.fillText(instructions, 10 + this.canvas2d.canvas.width / 2 - textMetrics.width / 2, 80);
        instructions = "Select a button and tap with one finger to press it"
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
}
