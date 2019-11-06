function isCanvas(obj: HTMLElement | null | undefined): obj is HTMLCanvasElement {
    if (!obj)
        return false;
    return obj.tagName === 'CANVAS';
}


// Copied from https://stackoverflow.com/a/18197341
function download(filename: string, text: string) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

const maybeCanvas = document.getElementById("canvas2d");
if (!isCanvas(maybeCanvas)) {
    alert("canvas2d not foud!");
    throw Error("Canvas not found!");
}
const canvas2d = maybeCanvas;
canvas2d.oncontextmenu = () => false;
canvas2d.width = window.innerWidth;
canvas2d.height = window.innerHeight;
const ctx = canvas2d.getContext("2d");

if (!ctx) {
    throw Error("Error getting canvas 2d context!");
}

ctx.font = "30px Arial";

let level: Level | null = null;

let images = [...new Array(20)].map(() => new Image());
const pad = function (n: number) {
    let s = String(n);
    if (s.length === 1) { s = "0" + s; }
    return s;
}

// song.play();


// TODO theory
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

let imgWidth = images[0].width;
let fromSide = true;
const noteSide = 20;

function draw(_t: number) {
    if (!ctx) {
        console.warn("null context");
        return;
    }
    imgWidth = images[0].width;
    const dx = song.currentTime * imgWidth / 10;

    ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas2d.width, canvas2d.height);
    if (!level)
        return;
    ctx.fillStyle = "rgba(1.0,0.0,0.0,0.5)";
    for (let i = Math.floor(dx / imgWidth); i < (dx / imgWidth) + 2 && i < images.length; i++) {
        ctx.drawImage(images[i], i * imgWidth - dx, 0);
        ctx.fillRect(i * imgWidth - dx, 0, 10, canvas2d.height);
    }


    for (let note of notes) {
        const nx = note[0] * imgWidth / 10000 - dx;
        const yIndex = fromSide ? 2 : 1;
        const ny = note[yIndex] * -20 + canvas2d.height / 2;
        const nh = note[3];
        const [r, g, b] = HuetoRGB(nh);
        ctx.fillStyle = `rgb(${r * 255}, ${g * 255}, ${b * 255})`;
        ctx.fillRect(nx - noteSide / 2, ny + noteSide / 2, noteSide, noteSide);
    }

    const perc = (song.currentTime * 100 / song.duration).toFixed(2);
    const text1 = level.title;
    let sec = Math.floor(song.currentTime % 60) + '';
    let min = Math.floor(song.currentTime / 60) + '';
    if (sec.length === 1) sec = '0' + sec;
    if (min.length === 1) min = '0' + min;
    const text2 = min + ":" + sec + "    " + perc + "%  " + (fromSide ? "Side view" : "Top view");

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.fillStyle = `#000`;
    let textMetrics = ctx.measureText(text1);
    ctx.strokeText(text1, canvas2d.width / 2 - textMetrics.width / 2, 60);
    ctx.fillText(text1, canvas2d.width / 2 - textMetrics.width / 2, 60);
    textMetrics = ctx.measureText(text2);
    ctx.strokeText(text2, canvas2d.width / 2 - textMetrics.width / 2, 100);
    ctx.fillText(text2, canvas2d.width / 2 - textMetrics.width / 2, 100);
    requestAnimationFrame(draw);
}

window.addEventListener('keydown', function (e) {
    if (e.keyCode == 27) {
        if (!song.paused)
            song.pause();
        level = null;
        const container = document.getElementById("selection-container");
        if (!container) {
            throw new Error("Can't find container!");
        }
        container.style.display = "";
    }

    if (e.key === ' ') {
        if (!song.paused)
            song.pause();
        else
            song.play();
    }
    else if (e.key === "ArrowLeft") {
        song.currentTime -= 0.1;
    } else if (e.key === "ArrowRight") {
        song.currentTime += 0.1;
    } else if (e.key.toLowerCase() === "r") {
        fromSide = !fromSide;
    } else if (e.key.toLowerCase() === "s") {
        if (!level) { return }
        download(level.fname + ".json", JSON.stringify(notes, function (_key, val) {
            return val.toFixed ? Number(val.toFixed(3)) : val;
        }));
    }
    console.log(e.key, e.keyCode);
});

let lastX: number | null = null;
let lastY: number | null = null;
let isMouseDown = false;
let selectedNote = -1;
canvas2d.addEventListener('mousedown', function (e) {

    const dx = song.currentTime * imgWidth / 10;
    const ey = e.y - 25;
    const ex = e.x;
    for (let index = 0; index < notes.length; index++) {
        const note = notes[index];
        const nYindex = fromSide ? 2 : 1;
        const ny = note[nYindex] * -20 + canvas2d.height / 2;
        //console.log(ny, ey);
        if (Math.abs(ny - ey) <= noteSide) {
            const nx = note[0] * imgWidth / 10000 - dx;
            if (Math.abs(nx - ex) < noteSide) {
                selectedNote = index;
                note[3] += 0.2;
                console.log(note);
                break;
            }
        }
    }
    if (e.shiftKey && selectedNote < 0) {
        console.log("shift");
        const nx = (ex + dx) * 10000 / imgWidth;
        const ny = (ey - canvas2d.height / 2) / -20;
        const newNote: [number, number, number, number] = fromSide ? [nx, 0.0, ny, 0.7] : [nx, ny, 0.0, 0.7];
        console.log(e.button);
        if (e.button === 2) { // right click
            newNote[3] = 0;
        }
        newNote[3] += 0.2;
        selectedNote = notes.length;
        notes.push(newNote);
    }
    isMouseDown = true;
    lastX = e.pageX;
    lastY = e.pageY;
});

window.addEventListener('mouseup', function (e) {
    isMouseDown = false;
    if (selectedNote >= 0) {
        notes[selectedNote][3] -= 0.2;
        if (e.y > canvas2d.height / 2 + 300) {
            notes.splice(selectedNote, 1);
        }
    }
    selectedNote = -1;
    notes.sort((a, b) => a[0] - b[0]);
});

window.addEventListener('mousemove', function (e) {
    if (lastX === null || lastY === null || !isMouseDown) {
        lastX = e.pageX;
        lastY = e.pageY;
        return;
    }
    if (selectedNote >= 0) {
        notes[selectedNote][0] += (e.pageX - lastX) * 10000 / images[0].width;
        const nYindex = fromSide ? 2 : 1;
        notes[selectedNote][nYindex] += (e.pageY - lastY) / -20;
    } else {
        song.currentTime -= (e.pageX - lastX) * 10 / images[0].width;
    }
    lastX = e.pageX;
    lastY = e.pageY;
});


// time, x, y, hue;
let notes: [number, number, number, number][] = [];

window.onresize = function () {
    canvas2d.width = window.innerWidth;
    canvas2d.height = window.innerHeight;
    ctx.font = "30px Arial";
};

class Level {
    title = "";
    fname = "";
    song = "";
    notes = "";
}

let levels: Level[] = [];
fetch("../levels/list.json")
    .then((r) => r.json())
    .then((j) => {
        levels = j;
        createButtons();
    });

function createButtons() {
    const container = document.getElementById("selection-container");
    if (!container) {
        throw new Error("Can't find container!");
    }
    for (let lev of levels) {
        const b = document.createElement("button");
        b.type = "button";
        if (!lev.title) {
            throw new Error("level has no title");
        }
        b.textContent = lev.title;
        b.onclick = () => { container.style.display = "none"; loadLevel(lev); };
        container.appendChild(b);
    }
}

let song = new Audio();
function loadLevel(selectedLevel: Level) {
    level = selectedLevel;
    if (!level) {
        throw new Error("null level loaded!");
    }
    fetch(level.notes)
        .then((r) => r.json())
        .then((j) => {
            notes = j;
            notes.sort((a, b) => a[0] - b[0]);
        });
    const fname = level.fname;
    images = [...new Array(20)].map(() => new Image());
    images.map((img, i) => img.src = `../audio/${fname}${pad(i)}0.png`);
    setTimeout(() => images = images.filter((img) => img.width), 1000);
    song = new Audio(level.song);
    requestAnimationFrame(draw);
}