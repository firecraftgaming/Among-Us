var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Animation } from './animation.js';
let gs = {};
let a = [];
let c = document.querySelector('canvas');
c.width = 1080;
c.height = 720;
let ctx = c.getContext('2d');
let can;
let anim;
let cache = [];
function createCharacter(pos, dim, color) {
    return new Promise(res => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let dark = { r: color.r / 2, g: color.g / 2, b: color.b / 2 };
        function getData() {
            let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            function getRGB(i) {
                return {
                    r: imgData.data[i * 4 + 0],
                    g: imgData.data[i * 4 + 1],
                    b: imgData.data[i * 4 + 2]
                };
            }
            function RGBtoHSV(c) {
                let cn = { r: c.r / 255, g: c.g / 255, b: c.b / 255 };
                let cmin = Math.min(c.r, c.g, c.b);
                let cmax = Math.max(c.r, c.g, c.b);
                let cminn = Math.min(cn.r, cn.g, cn.b);
                let cmaxn = Math.max(cn.r, cn.g, cn.b);
                let t = cmax - cmin;
                let tn = cmaxn - cminn;
                function calculateH() {
                    if (tn == 0)
                        return 0;
                    let h = 0;
                    switch (cmax) {
                        case c.r:
                            h = ((cn.g - cn.b) / tn) % 6;
                            break;
                        case c.g:
                            h = ((cn.b - cn.r) / tn) + 2;
                            break;
                        case c.b:
                            h = ((cn.r - cn.g) / tn) + 4;
                            break;
                    }
                    return (360 + (60 * h)) % 360;
                }
                function calculateS() {
                    if (cmaxn == 0)
                        return 0;
                    return Math.round(t / cmaxn);
                }
                function calculateV() {
                    return cmax;
                }
                return { h: calculateH(), s: calculateS(), v: calculateV() };
            }
            function setRGB(i, c) {
                imgData.data[i * 4 + 0] = c.r;
                imgData.data[i * 4 + 1] = c.g;
                imgData.data[i * 4 + 2] = c.b;
            }
            function compare(a, b) {
                return (a.r == b.r) && (a.g == b.g) && (a.b == b.b);
            }
            function distance(a, b) {
                return { h: Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h)), s: Math.abs(a.s - b.s), v: Math.abs(a.v - b.v) };
            }
            function compareHSV(a, b) {
                return (a.h == b.h) && (a.s == b.s) && (a.v == b.v);
            }
            let rtarget = { h: 0, s: 255, v: 255 };
            let btarget = { h: 240, s: 255, v: 128 };
            let gtarget = { h: 120, s: 255, v: 128 };
            for (let i = 0; i < (imgData.data.length / 4); i++) {
                let rgb = getRGB(i);
                let c = RGBtoHSV(rgb);
                let rd = distance(c, rtarget);
                let bd = distance(c, btarget);
                let gd = distance(c, gtarget);
                if (rd.h < 90 && rd.s < 120 && rd.v < 180)
                    setRGB(i, color);
                if (bd.h < 60 && bd.s < 120 && bd.v < 180)
                    setRGB(i, dark);
                if (gd.h < 60 && gd.s < 120 && gd.v < 180)
                    setRGB(i, { r: rgb.r, g: rgb.g, b: rgb.g * 2 });
            }
            ctx.putImageData(imgData, 0, 0);
            res(canvas);
        }
        let image = new Image();
        image.onload = _ => {
            canvas.width = dim.x;
            canvas.height = dim.y;
            ctx.drawImage(image, -pos.x, -pos.y);
            getData();
        };
        image.src = './sprite.png';
    });
}
function load(group) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i of gs[group]) {
            yield paintCharacter(i);
        }
    });
}
function paintCharacter(i) {
    return __awaiter(this, void 0, void 0, function* () {
        clear();
        let r = yield loadCharacter(i);
        ctx.drawImage(r, 0, 0);
    });
}
function loadCharacter(i) {
    return __awaiter(this, void 0, void 0, function* () {
        if (cache[i] != null)
            return cache[i];
        let o = a[i];
        let r = yield createCharacter({ x: o.x, y: o.y }, { x: o.w, y: o.h }, { r: 0, g: 0, b: 255 });
        cache[i] = r;
        return r;
    });
}
function clear() {
    return __awaiter(this, void 0, void 0, function* () {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, c.width, c.height);
    });
}
function loadAll() {
    return __awaiter(this, void 0, void 0, function* () {
        yield clear();
        let keys = Object.keys(gs);
        for (let k of keys) {
            yield load(k);
        }
    });
}
function loadCharMap() {
    return __awaiter(this, void 0, void 0, function* () {
        let map = yield (yield fetch('/characterMap.json')).json();
        gs = map.groups;
        a = map.assets;
        cache = new Array(a.length).fill(null);
        for (let i = 0; i < a.length; i++) {
            yield loadCharacter(i);
        }
        can = prompt('Group?');
        if (!gs[can])
            return;
        clear();
        anim = new Animation(gs[can], 5);
        anim.onrender = frame => paintCharacter(frame);
    });
}
loadCharMap();
window.onkeydown = e => {
    if (e.keyCode == 32)
        anim.start();
};
//# sourceMappingURL=cs.js.map