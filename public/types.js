"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = exports.AssetLoader = exports.Line = exports.Vector = exports.Dimension = exports.Player = void 0;
class AL {
    constructor() {
        this.callbacks = [];
        this.colored = {};
        this.load();
    }
    set onload(callback) {
        if (this.colors)
            callback();
        else
            this.callbacks.push(callback);
    }
    loadLines() {
        return __awaiter(this, void 0, void 0, function* () {
            let m = 30;
            let offset = new Vector(-2250, -550);
            let lines = yield fetch('/map.min.json').then(v => v.json());
            this.lines = [];
            for (let o of lines) {
                let r = [];
                for (let i = 0; i < o.length; i += 2) {
                    r.push(new Vector(o[i] * m + offset.x, o[i + 1] * m + offset.y));
                }
                this.lines.push(r);
            }
        });
    }
    loadColors() {
        return __awaiter(this, void 0, void 0, function* () {
            let chars = [];
            let colors = yield fetch('/colors.json').then(v => v.json());
            for (let i = 0; i < colors.light.length; i++) {
                chars.push({ light: colors.light[i], dark: colors.dark[i] });
            }
            this.colors = chars;
        });
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let o of Object.keys(this.colors)) {
                yield this.character(o);
            }
            yield this.loadLines();
            this.callbacks.forEach(v => v());
            this.callbacks = [];
        });
    }
    createCharacter(color) {
        return new Promise(res => {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            function getData() {
                let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                function getRGB(i) {
                    return {
                        r: imgData.data[i * 4 + 0],
                        g: imgData.data[i * 4 + 1],
                        b: imgData.data[i * 4 + 2]
                    };
                }
                function setRGB(i, c) {
                    imgData.data[i * 4 + 0] = c.r;
                    imgData.data[i * 4 + 1] = c.g;
                    imgData.data[i * 4 + 2] = c.b;
                }
                for (let i = 0; i < (imgData.data.length * 4); i++) {
                    let c = getRGB(i);
                    if (c.r > 70)
                        setRGB(i, color.light);
                    if (c.g > 70)
                        setRGB(i, color.dark);
                    if (c.b > 70)
                        setRGB(i, { r: c.g, g: c.g, b: 255 });
                }
                ctx.putImageData(imgData, 0, 0);
                return canvas.toDataURL();
            }
            let image = new Image();
            image.onload = _ => {
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);
                let img = getData();
                res(img);
            };
            image.src = '/sprite.png';
        });
    }
    preloadImage(src) {
        return new Promise(res => {
            let img = new Image();
            img.src = src;
            img.onload = e => {
                res(img);
            };
        });
    }
    character(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.colored[name])
                return this.colored[name];
            yield new Promise(res => {
                this.onload = res;
            });
            let v = yield this.createCharacter(this.colors[name]);
            let img = yield this.preloadImage(v);
            this.colored[name] = img;
            return img;
        });
    }
}
class G {
    constructor() {
        this.player = new Player(0, 0, 0);
        this.players = [];
        this.lines = [];
        this.alive = true;
    }
}
class Player {
    constructor(x, y, color) {
        this.pos = new Vector(x, y);
        this.color = color;
    }
}
exports.Player = Player;
class Dimension {
    constructor(w, h) {
        this.w = w;
        this.h = h;
    }
}
exports.Dimension = Dimension;
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static get zero() {
        return new Vector(0, 0);
    }
    center(v, dim) {
        return new Vector(this.x - v.x + (dim.w / 2), this.y - v.y + (dim.h / 2));
    }
    distance(v) {
        if (!v)
            v = new Vector(0, 0);
        return Math.sqrt(Math.pow((this.x - v.x), 2) + Math.pow((this.y - v.y), 2));
    }
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    clone() {
        return new Vector(this.x, this.y);
    }
    divide(v) {
        if (v == 0)
            return this;
        this.x /= v;
        this.y /= v;
        return this;
    }
    normalize() {
        return this.clone().divide(this.distance(Vector.zero));
    }
}
exports.Vector = Vector;
class Line {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
    static bigLineToLineArray(v) {
        let lines = [];
        for (let i = 0; i < v.length; i++) {
            for (let j = 1; j < v[i].length; j++) {
                lines.push(new Line(v[i][j - 1], v[i][j]));
            }
        }
        return lines;
    }
}
exports.Line = Line;
class Socket {
    constructor() {
        this.socket = io('https://among-us.eliyah.repl.co/');
        this.socket.on('join', e => {
        });
        this.socket.on('move', e => {
        });
        this.socket.on('color', e => {
        });
        this.socket.on('leave', e => {
        });
        this.socket.on('kill', e => {
        });
        this.socket.on('disconnect', function () {
            alert('Disconnect from server, reload site to reconnect.');
        });
    }
    join(username) {
        this.socket.emit('join', { name: username, room: 'testA1' });
    }
}
exports.AssetLoader = new AL();
exports.Game = new G();
//# sourceMappingURL=types.js.map