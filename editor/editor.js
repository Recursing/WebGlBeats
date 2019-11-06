"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
function isCanvas(obj) {
    if (!obj)
        return false;
    return obj.tagName === 'CANVAS';
}
// Copied from https://stackoverflow.com/a/18197341
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
var maybeCanvas = document.getElementById("canvas2d");
if (!isCanvas(maybeCanvas)) {
    alert("canvas2d not foud!");
    throw Error("Canvas not found!");
}
var canvas2d = maybeCanvas;
canvas2d.oncontextmenu = function () { return false; };
canvas2d.width = window.innerWidth;
canvas2d.height = window.innerHeight;
var ctx = canvas2d.getContext("2d");
if (!ctx) {
    throw Error("Error getting canvas 2d context!");
}
ctx.font = "30px Arial";
var level = null;
var images = __spreadArrays(new Array(20)).map(function () { return new Image(); });
var pad = function (n) {
    var s = String(n);
    if (s.length === 1) {
        s = "0" + s;
    }
    return s;
};
// song.play();
// TODO theory
function HuetoRGB(hue) {
    var hue2rgb = function hue2rgb(p, q, t) {
        if (t < 0)
            t += 1;
        if (t > 1)
            t -= 1;
        if (t < 1 / 6)
            return p + (q - p) * 6 * t;
        if (t < 1 / 2)
            return q;
        if (t < 2 / 3)
            return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    var p = 0;
    var q = 1;
    var r = hue2rgb(p, q, hue + 1 / 3);
    var g = hue2rgb(p, q, hue);
    var b = hue2rgb(p, q, hue - 1 / 3);
    return [r, g, b];
}
var imgWidth = images[0].width;
var fromSide = true;
var noteSide = 20;
function draw(_t) {
    if (!ctx) {
        console.warn("null context");
        return;
    }
    imgWidth = images[0].width;
    var dx = song.currentTime * imgWidth / 10;
    ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas2d.width, canvas2d.height);
    if (!level)
        return;
    ctx.fillStyle = "rgba(1.0,0.0,0.0,0.5)";
    for (var i = Math.floor(dx / imgWidth); i < (dx / imgWidth) + 2 && i < images.length; i++) {
        ctx.drawImage(images[i], i * imgWidth - dx, 0);
        ctx.fillRect(i * imgWidth - dx, 0, 10, canvas2d.height);
    }
    for (var _i = 0, notes_1 = notes; _i < notes_1.length; _i++) {
        var note = notes_1[_i];
        var nx = note[0] * imgWidth / 10000 - dx;
        var yIndex = fromSide ? 2 : 1;
        var ny = note[yIndex] * -20 + canvas2d.height / 2;
        var nh = note[3];
        var _a = HuetoRGB(nh), r = _a[0], g = _a[1], b = _a[2];
        ctx.fillStyle = "rgb(" + r * 255 + ", " + g * 255 + ", " + b * 255 + ")";
        ctx.fillRect(nx - noteSide / 2, ny + noteSide / 2, noteSide, noteSide);
    }
    var perc = (song.currentTime * 100 / song.duration).toFixed(2);
    var text1 = level.title;
    var sec = Math.floor(song.currentTime % 60) + '';
    var min = Math.floor(song.currentTime / 60) + '';
    if (sec.length === 1)
        sec = '0' + sec;
    if (min.length === 1)
        min = '0' + min;
    var text2 = min + ":" + sec + "    " + perc + "%  " + (fromSide ? "Side view" : "Top view");
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.fillStyle = "#000";
    var textMetrics = ctx.measureText(text1);
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
        var container = document.getElementById("selection-container");
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
    }
    else if (e.key === "ArrowRight") {
        song.currentTime += 0.1;
    }
    else if (e.key.toLowerCase() === "r") {
        fromSide = !fromSide;
    }
    else if (e.key.toLowerCase() === "s") {
        if (!level) {
            return;
        }
        download(level.fname + ".json", JSON.stringify(notes, function (_key, val) {
            return val.toFixed ? Number(val.toFixed(3)) : val;
        }));
    }
    console.log(e.key, e.keyCode);
});
var lastX = null;
var lastY = null;
var isMouseDown = false;
var selectedNote = -1;
canvas2d.addEventListener('mousedown', function (e) {
    var dx = song.currentTime * imgWidth / 10;
    var ey = e.y - 25;
    var ex = e.x;
    for (var index = 0; index < notes.length; index++) {
        var note = notes[index];
        var nYindex = fromSide ? 2 : 1;
        var ny = note[nYindex] * -20 + canvas2d.height / 2;
        //console.log(ny, ey);
        if (Math.abs(ny - ey) <= noteSide) {
            var nx = note[0] * imgWidth / 10000 - dx;
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
        var nx = (ex + dx) * 10000 / imgWidth;
        var ny = (ey - canvas2d.height / 2) / -20;
        var newNote = fromSide ? [nx, 0.0, ny, 0.7] : [nx, ny, 0.0, 0.7];
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
    notes.sort(function (a, b) { return a[0] - b[0]; });
});
window.addEventListener('mousemove', function (e) {
    if (lastX === null || lastY === null || !isMouseDown) {
        lastX = e.pageX;
        lastY = e.pageY;
        return;
    }
    if (selectedNote >= 0) {
        notes[selectedNote][0] += (e.pageX - lastX) * 10000 / images[0].width;
        var nYindex = fromSide ? 2 : 1;
        notes[selectedNote][nYindex] += (e.pageY - lastY) / -20;
    }
    else {
        song.currentTime -= (e.pageX - lastX) * 10 / images[0].width;
    }
    lastX = e.pageX;
    lastY = e.pageY;
});
// time, x, y, hue;
var notes = [];
window.onresize = function () {
    canvas2d.width = window.innerWidth;
    canvas2d.height = window.innerHeight;
    ctx.font = "30px Arial";
};
var Level = /** @class */ (function () {
    function Level() {
        this.title = "";
        this.fname = "";
        this.song = "";
        this.notes = "";
    }
    return Level;
}());
var levels = [];
fetch("../levels/list.json")
    .then(function (r) { return r.json(); })
    .then(function (j) {
    levels = j;
    createButtons();
});
function createButtons() {
    var container = document.getElementById("selection-container");
    if (!container) {
        throw new Error("Can't find container!");
    }
    var _loop_1 = function (lev) {
        var b = document.createElement("button");
        b.type = "button";
        if (!lev.title) {
            throw new Error("level has no title");
        }
        b.textContent = lev.title;
        b.onclick = function () { container.style.display = "none"; loadLevel(lev); };
        container.appendChild(b);
    };
    for (var _i = 0, levels_1 = levels; _i < levels_1.length; _i++) {
        var lev = levels_1[_i];
        _loop_1(lev);
    }
}
var song = new Audio();
function loadLevel(selectedLevel) {
    level = selectedLevel;
    if (!level) {
        throw new Error("null level loaded!");
    }
    fetch(level.notes)
        .then(function (r) { return r.json(); })
        .then(function (j) {
        notes = j;
        notes.sort(function (a, b) { return a[0] - b[0]; });
    });
    var fname = level.fname;
    images = __spreadArrays(new Array(20)).map(function () { return new Image(); });
    images.map(function (img, i) { return img.src = "../audio/" + fname + pad(i) + "0.png"; });
    setTimeout(function () { return images = images.filter(function (img) { return img.width; }); }, 1000);
    song = new Audio(level.song);
    requestAnimationFrame(draw);
}
