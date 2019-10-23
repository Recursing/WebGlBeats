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
var Menu = /** @class */ (function () {
    function Menu(canvas) {
        this.options = ["Crab Rave", "Mountain King", "Help"];
        this.onButtonSelect = function () { };
        this.onButtonDeselect = function () { };
        this.canvas2d = canvas;
        var btnWidth = 600;
        var btnHeight = 120;
        var padTop = 30;
        var padLeft = (this.canvas2d.canvas.width - btnWidth) / 2;
        this.buttons = this.options.map(function (text, i) {
            return new Button(padLeft, (btnHeight + padTop) * (i + 1), btnWidth, btnHeight, text);
        });
    }
    Menu.prototype.drawButton = function (y, x, height, width, text) {
        var ctx = this.canvas2d;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 10;
        ctx.fillStyle = "rgba(252, 169, 3, 1)";
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
    Menu.prototype.drawCursor = function (yAngle, xAngle) {
        var _this = this;
        var y0 = Math.PI;
        var x0 = Math.PI / 2;
        yAngle -= y0;
        xAngle -= x0;
        var menuDistance = 800;
        var xCenter = this.canvas2d.canvas.width / 2;
        var yCenter = this.canvas2d.canvas.height / 2;
        var cx = xCenter + Math.tan(-xAngle) * menuDistance;
        var cy = yCenter - Math.tan(yAngle) * menuDistance + 30;
        var ctx = this.canvas2d;
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(200,200,255,0.9)';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0,50,0,0.8)';
        ctx.stroke();
        this.buttons.map(function (btn) {
            if (btn.contains(cy, cx) && !btn.selected) {
                _this.onButtonSelect();
                btn.selected = true;
            }
            if (!btn.contains(cy, cx) && btn.selected) {
                _this.onButtonDeselect();
                btn.selected = false;
            }
        });
    };
    Menu.prototype.draw = function () {
        var _this = this;
        this.canvas2d.fillStyle = "rgba(92, 166, 209, 0.9)";
        this.canvas2d.fillRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height);
        this.canvas2d.font = "30px Arial";
        var instructions = "Point at the screen and tap with two fingers to calibrate rotation";
        var textMetrics = this.canvas2d.measureText(instructions);
        this.canvas2d.fillStyle = "rgba(0, 0, 0, 1)";
        this.canvas2d.fillText(instructions, 10 + this.canvas2d.canvas.width / 2 - textMetrics.width / 2, 50);
        instructions = "Select a button and tap with one finger to press it";
        textMetrics = this.canvas2d.measureText(instructions);
        this.canvas2d.fillText(instructions, 10 + this.canvas2d.canvas.width / 2 - textMetrics.width / 2, 100);
        this.buttons.map(function (btn) { return btn.draw(_this.canvas2d); });
    };
    return Menu;
}());
exports.Menu = Menu;
