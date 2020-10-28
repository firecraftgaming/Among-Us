var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var Util;
(function (Util) {
    class Dimension {
        constructor(w, h) {
            this.w = w;
            this.h = h;
        }
    }
    Util.Dimension = Dimension;
    class Vector {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        static get zero() {
            return new Vector(0, 0);
        }
        static from(v) {
            return new Vector(v.x, v.y);
        }
        static add(v1, v2) {
            return new Vector(v1.x + v2.x, v1.y + v2.y);
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
        multiply(v) {
            this.x *= v;
            this.y *= v;
            return this;
        }
        normalize() {
            return this.clone().divide(this.distance(Vector.zero));
        }
    }
    Util.Vector = Vector;
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
    Util.Line = Line;
})(Util || (Util = {}));
class AssetLoader {
    static set onload(callback) {
        if (this.colors)
            callback();
        else
            this.callbacks.push(callback);
    }
    static loadLines() {
        return __awaiter(this, void 0, void 0, function* () {
            let m = 30;
            let offset = new Util.Vector(-2250, -550);
            let lines = yield fetch('/map.min.json').then(v => v.json());
            this.lines = [];
            for (let o of lines) {
                let r = [];
                for (let i = 0; i < o.length; i += 2) {
                    r.push(new Util.Vector(o[i] * m + offset.x, o[i + 1] * m + offset.y));
                }
                this.lines.push(r);
            }
        });
    }
    static loadColors() {
        return __awaiter(this, void 0, void 0, function* () {
            let chars = [];
            let colors = yield fetch('/colors.json').then(v => v.json());
            for (let i = 0; i < colors.light.length; i++) {
                chars.push({
                    light: {
                        r: colors.light[i][0],
                        g: colors.light[i][1],
                        b: colors.light[i][2]
                    },
                    dark: {
                        r: colors.dark[i][0],
                        g: colors.dark[i][1],
                        b: colors.dark[i][2]
                    }
                });
            }
            this.colors = chars;
        });
    }
    static load() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadColors();
            for (let o of this.colors) {
                let v = yield this.createCharacter(o);
                let img = yield this.preloadImage(v);
                this.colored.push(img);
            }
            yield this.loadLines();
            this.callbacks.forEach(v => v());
            this.callbacks = [];
        });
    }
    static createCharacter(color) {
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
                    if (c.b > 70)
                        setRGB(i, color.dark);
                    if (c.g > 70)
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
    static preloadImage(src) {
        return new Promise(res => {
            let img = new Image();
            img.src = src;
            img.onload = e => {
                res(img);
            };
        });
    }
}
AssetLoader._staticConstructor = (function () {
    this.callbacks = [];
    this.colored = [];
    this.load();
}).bind(AssetLoader)();
class Socket {
    static emit(name, event) {
        this.socket.emit(name, event);
    }
    static join(username) {
        this.socket.emit('join', { name: username, room: 'testA1' });
    }
}
Socket._staticConstructor = (function () {
    this.socket = io('https://among-us.eliyah.repl.co/');
    this.socket.on('join', e => {
        Game.addPlayer(e.name, { pos: Util.Vector.from(e.position), color: e.color });
    });
    this.socket.on('move', e => {
        let p = Game.getPlayer(e.name);
        if (!p)
            return;
        p.pos = new Util.Vector(e.position.x, e.position.y);
    });
    this.socket.on('color', e => {
        let p = Game.getPlayer(e.name);
        if (!p)
            return;
        p.color = e.color;
    });
    this.socket.on('leave', e => {
        Game.removePlayer(e.name);
    });
    this.socket.on('kill', _ => {
        Game.alive = false;
    });
    this.socket.on('disconnect', function () {
        alert('Disconnect from server, reload site to reconnect.');
    });
}).bind(Socket)();
class UI {
    static renderPlayer(ctx, name, p) {
        let o = p.pos.center(Game.player.pos, this.dim);
        ctx.drawImage(AssetLoader.colored[Object.keys(AssetLoader.colors)[p.color]], o.x - Game.phb.x - Game.phb.w / 2, o.y - Game.phb.y - Game.phb.h / 2);
        ctx.fillStyle = 'white';
        ctx.font = "15px Arial";
        ctx.fillText(name, o.x - ctx.measureText(name).width / 2, o.y - Game.phb.h / 2 - 25);
    }
    static get renderLoop() {
        return (function () {
            let dir = new Util.Vector(Game.getKey(39) - Game.getKey(37), Game.getKey(40) - Game.getKey(38)).multiply(this.speed / 60);
            let ma = Game.move(Game.player.pos, new Util.Vector(dir.x, 0), AssetLoader.lines);
            let mb = Game.move(Game.player.pos, new Util.Vector(0, dir.y), AssetLoader.lines);
            Game.player.pos.add(Util.Vector.add(ma, mb).multiply(0.9));
            if (Game.worker)
                Game.worker.postMessage({ lines: AssetLoader.lines, pos: Game.player.pos, phb: Game.phb });
            Socket.emit('move', { position: Game.player.pos });
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.dim.w, this.dim.h);
            this.ctx.strokeStyle = 'white';
            this.ctx.fillStyle = 'blue';
            for (let i = 0; i < AssetLoader.lines.length; i++) {
                this.ctx.beginPath();
                let v = AssetLoader.lines[i].map(v => v.center(Game.player.pos, this.dim));
                this.ctx.moveTo(v[0].x, v[0].y);
                for (let i = 1; i < v.length; i++) {
                    this.ctx.lineTo(v[i].x, v[i].y);
                }
                this.ctx.fill();
                this.ctx.stroke();
                this.ctx.closePath();
                this.ctx.fillStyle = 'black';
            }
            if (Game.lightPoints.length) {
                this.ctx.fillStyle = "gray";
                this.ctx.beginPath();
                this.ctx.moveTo(Game.lightPoints[0].center(Game.player.pos, this.dim).x, Game.lightPoints[0].center(Game.player.pos, this.dim).y);
                for (let i = 1; i < Game.lightPoints.length; i++) {
                    let p = Game.lightPoints[i];
                    if (p)
                        this.ctx.lineTo(p.center(Game.player.pos, this.dim).x, p.center(Game.player.pos, this.dim).y);
                }
                this.ctx.fill();
                this.ctx.closePath();
            }
            if (Game.lightPoints.length) {
                let playerCanvas = document.createElement('canvas');
                playerCanvas.width = this.dim.w;
                playerCanvas.height = this.dim.h;
                let playerCtx = playerCanvas.getContext('2d');
                playerCtx.beginPath();
                playerCtx.moveTo(Game.lightPoints[0].center(Game.player.pos, this.dim).x, Game.lightPoints[0].center(Game.player.pos, this.dim).y);
                for (let i = 1; i < Game.lightPoints.length; i++) {
                    let p = Game.lightPoints[i];
                    if (p)
                        playerCtx.lineTo(p.center(Game.player.pos, this.dim).x, p.center(Game.player.pos, this.dim).y);
                }
                playerCtx.clip();
                playerCtx.closePath();
                if (Game.alive) {
                    playerCtx.fillStyle = 'red';
                    playerCtx.beginPath();
                    playerCtx.arc(this.dim.w / 2, this.dim.h / 2, 125, 0, 2 * Math.PI);
                    playerCtx.fill();
                    playerCtx.closePath();
                }
                Game.players.forEach(v => this.renderPlayer(playerCtx, v.name, v.player));
                this.renderPlayer(playerCtx, Game.playerName, Game.player);
                this.ctx.drawImage(playerCanvas, 0, 0);
            }
            requestAnimationFrame(this.renderLoop);
        }).bind(UI);
    }
}
UI._staticConstructor = (function () {
    this.speed = 500;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.dim = new Util.Dimension(window.innerWidth, window.innerHeight);
    this.canvas.width = this.dim.w;
    this.canvas.height = this.dim.h;
    document.body.appendChild(this.canvas);
}).bind(UI)();
class Game {
    static changeColor() {
        while (true) {
            this.player.color++;
            this.player.color = this.player.color % 12;
            let b = true;
            for (let o of this.players) {
                if (o.player.color != this.player.color)
                    continue;
                b = false;
                break;
            }
            if (b)
                break;
        }
        Socket.emit('color', { color: this.player.color });
    }
    static kill() {
        Socket.emit('kill');
    }
    static ressurect() {
        this.alive = true;
        Socket.emit('ressurect');
    }
    static removePlayer(name) {
        let i = this.players.findIndex(v => v.name == name);
        if (i < 0)
            return;
        this.players.splice(i, 1);
    }
    static addPlayer(name, player) {
        this.players.push({ name, player });
    }
    static getPlayer(name) {
        return this.players.find(v => v.name == name).player;
    }
    static getKey(key) {
        if (this.keys[key.toString()] == null)
            return 0;
        return this.keys[key.toString()] * 1;
    }
    static move(v, dir, w) {
        v = Util.Vector.add(v, new Util.Vector(-this.phb.w / 2, -this.phb.h / 2));
        let a = [
            new Util.Vector(v.x, v.y),
            new Util.Vector(v.x + this.phb.w, v.y),
            new Util.Vector(v.x + this.phb.w, v.y + this.phb.h),
            new Util.Vector(v.x, v.y + this.phb.h)
        ].map(v => v.add(dir));
        let intersection = false;
        for (let walls of w) {
            walls = [...walls, walls[0]];
            for (let i = 1; i < walls.length; i++) {
                let b = [
                    walls[i - 1],
                    walls[i]
                ];
                let c = this.doPolygonsIntersect(a, b);
                if (c)
                    intersection = true;
            }
        }
        return intersection ? Util.Vector.zero : dir;
    }
    static doPolygonsIntersect(a, b) {
        let polygons = [a, b];
        let minA, maxA, projected, i, i1, j, minB, maxB;
        for (i = 0; i < polygons.length; i++) {
            let polygon = polygons[i];
            for (i1 = 0; i1 < polygon.length; i1++) {
                let i2 = (i1 + 1) % polygon.length;
                let p1 = polygon[i1];
                let p2 = polygon[i2];
                let normal = new Util.Vector(p2.y - p1.y, p1.x - p2.x);
                minA = maxA = null;
                for (j = 0; j < a.length; j++) {
                    projected = normal.x * a[j].x + normal.y * a[j].y;
                    if (minA == null || projected < minA) {
                        minA = projected;
                    }
                    if (maxA == null || projected > maxA) {
                        maxA = projected;
                    }
                }
                minB = maxB = null;
                for (j = 0; j < b.length; j++) {
                    projected = normal.x * b[j].x + normal.y * b[j].y;
                    if (minB == null || projected < minB) {
                        minB = projected;
                    }
                    if (maxB == null || projected > maxB) {
                        maxB = projected;
                    }
                }
                if (maxA < minB || maxB < minA) {
                    return false;
                }
            }
        }
        return true;
    }
}
Game._staticConstructor = (function () {
    this.playerName = prompt('Name?');
    Socket.join(this.playerName);
    this.phb = { x: 45, y: 25, w: 60, h: 85 };
    this.player = { pos: Util.Vector.zero, color: 0 };
    this.players = [];
    this.lines = [];
    this.alive = true;
    this.lightPoints = [];
    this.keys = {};
    AssetLoader.onload = _ => {
        this.changeColor();
        this.worker = new Worker('worker.js');
        this.worker.onmessage = e => this.lightPoints = e.data.map(v => Util.Vector.from(v));
        UI.renderLoop();
    };
    window.onkeydown = e => {
        this.keys[e.keyCode.toString()] = true;
    };
    window.onkeyup = e => {
        this.keys[e.keyCode.toString()] = false;
    };
    window.onkeypress = e => {
        if (e.key == 'c')
            this.changeColor();
        if (e.key == 'q')
            this.kill();
        if (e.key == 'r')
            this.ressurect();
    };
}).bind(Game)();
//# sourceMappingURL=script.js.map