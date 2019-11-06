"use strict";
exports.__esModule = true;
var Button = /** @class */ (function () {
    function Button(x, y, w, h, text) {
        this.selected = false;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
    }
    Button.prototype.draw = function (ctx) {
        var x = this.x;
        var y = this.y;
        var width = this.w;
        var height = this.h;
        var text = this.text;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 10;
        ctx.fillStyle = this.selected ? "rgba(169, 252, 3, 1)" : "rgba(252, 169, 3, 1)";
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
        ctx.fillStyle = "rgba(255,255,255, 1)";
        var textMetrics = ctx.measureText(text);
        ctx.strokeText(text, x + width / 2 - textMetrics.width / 2, y + height / 2 + 10);
        ctx.fillText(text, x + width / 2 - textMetrics.width / 2, y + height / 2 + 10);
    };
    Button.prototype.contains = function (y, x) {
        return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
    };
    return Button;
}());
var LevelDescription = /** @class */ (function () {
    function LevelDescription(title, song, bpm, speed, notes) {
        this.title = title;
        this.song = song;
        this.bpm = bpm;
        this.speed = speed;
        this.notes = notes;
    }
    return LevelDescription;
}());
exports.LevelDescription = LevelDescription;
var Menu = /** @class */ (function () {
    function Menu(canvas) {
        var _this = this;
        this.audioPreview = null;
        this.levels = [];
        this.buttons = [];
        this.onButtonSelect = function () { };
        this.onButtonDeselect = function () { };
        this.canvas2d = canvas;
        var btnWidth = 600;
        var btnHeight = 120;
        var padTop = 60;
        var padLeft = (this.canvas2d.canvas.width - btnWidth) / 2;
        fetch("../levels/list.json").then(function (r) { return r.json(); })
            .then(function (j) {
            var i = 0;
            for (var _i = 0, j_1 = j; _i < j_1.length; _i++) {
                var level = j_1[_i];
                i++;
                _this.levels.push(level);
                _this.buttons.push(new Button(padLeft, (btnHeight + padTop) * i, btnWidth, btnHeight, level.title));
            }
        });
        this.canvas2d.font = "30px Arial";
    }
    Menu.prototype.onResize = function () {
        var btnWidth = 600;
        var padLeft = (this.canvas2d.canvas.width - btnWidth) / 2;
        this.buttons.map(function (btn) {
            btn.x = padLeft;
        });
        this.canvas2d.fillStyle = "rgba(0, 0, 0, 1.0)";
        this.canvas2d.clearRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
        this.canvas2d.fillRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
    };
    Menu.prototype.drawCursor = function (yAngle, xAngle) {
        var _this = this;
        var y0 = Math.PI;
        var x0 = Math.PI / 2;
        yAngle -= y0;
        xAngle -= x0;
        if ((Math.abs(xAngle) > Math.PI / 2) !== (Math.abs(yAngle) > Math.PI / 2)) { // Red end
            yAngle = -yAngle;
        }
        if (yAngle > Math.PI / 2) {
            yAngle = Math.PI - yAngle;
        }
        else if (yAngle < -Math.PI / 2) {
            yAngle = -Math.PI - yAngle;
        }
        var menuDistance = 400;
        var xCenter = this.canvas2d.canvas.width / 2;
        var yCenter = this.canvas2d.canvas.height / 2;
        var cx = xCenter + Math.tan(-xAngle) * menuDistance;
        var cy = yCenter - Math.tan(yAngle) * menuDistance;
        var ctx = this.canvas2d;
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(200,200,255,0.9)';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0,50,0,0.8)';
        ctx.stroke();
        this.buttons.map(function (btn, i) {
            if (btn.contains(cy, cx) && !btn.selected) {
                if (_this.audioPreview)
                    _this.audioPreview.pause();
                _this.audioPreview = null;
                _this.audioPreview = new Audio(_this.levels[i].song);
                _this.audioPreview.play();
                _this.onButtonSelect();
                btn.selected = true;
            }
            if (!btn.contains(cy, cx) && btn.selected) {
                if (_this.audioPreview) {
                    _this.audioPreview.pause();
                    _this.audioPreview = null;
                }
                _this.onButtonDeselect();
                btn.selected = false;
            }
        });
    };
    Menu.prototype.draw = function () {
        var _this = this;
        this.canvas2d.fillStyle = "rgba(92, 166, 209, 0.9)";
        this.canvas2d.fillRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
        var instructions = "Point at the screen and tap with two fingers to calibrate rotation";
        var textMetrics = this.canvas2d.measureText(instructions);
        this.canvas2d.fillStyle = "rgba(0, 0, 0, 1)";
        this.canvas2d.fillText(instructions, 10 + this.canvas2d.canvas.width / 2 - textMetrics.width / 2, 80);
        instructions = "Select a button and tap with one finger to press it";
        textMetrics = this.canvas2d.measureText(instructions);
        this.canvas2d.fillText(instructions, 10 + this.canvas2d.canvas.width / 2 - textMetrics.width / 2, 130);
        this.buttons.map(function (btn) { return btn.draw(_this.canvas2d); });
    };
    Menu.prototype.hide = function () {
        if (this.audioPreview)
            this.audioPreview.pause();
        this.audioPreview = null;
        this.canvas2d.fillStyle = "rgba(0, 0, 0, 1.0)";
        this.canvas2d.clearRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
        this.canvas2d.fillRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
    };
    return Menu;
}());
exports.Menu = Menu;
