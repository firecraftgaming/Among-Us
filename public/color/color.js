var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
                    setRGB(i, { r: rgb.r, g: rgb.g, b: rgb.g });
            }
            ctx.putImageData(imgData, 0, 0);
            res(canvas.toDataURL());
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
let img = new Image();
img.onload = _ => {
    dim.y = Math.max(dim.y, image.height);
    canvas.width = dim.x;
    canvas.height = dim.y;
};
img.src = './sprite.png';
let assets = [];
let groups = {};
let gk = ['main', 'chair', 'ghost', 'corps'];
gk.forEach(v => groups[v] = []);
let g = 0;
function load(group) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i of groups[group]) {
            let o = assets[i];
            let url = yield createCharacter({ x: o.x, y: o.y }, { x: o.w, y: o.h }, { r: 255, g: 0, b: 255 });
            let img = document.createElement('img');
            img.src = url;
            document.body.appendChild(img);
        }
    });
}
function loadCharacter(o) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = yield createCharacter({ x: o.x, y: o.y }, { x: o.w, y: o.h }, { r: 255, g: 0, b: 255 });
        let img = document.createElement('img');
        img.src = url;
        document.body.appendChild(img);
    });
}
function clear() {
    return __awaiter(this, void 0, void 0, function* () {
        document.body.innerHTML = '';
    });
}
function loadAll() {
    return __awaiter(this, void 0, void 0, function* () {
        yield clear();
        let keys = Object.keys(groups);
        for (let k of keys) {
            yield load(k);
        }
    });
}
let canvas = document.body.appendChild(document.createElement('canvas'));
let ctx = canvas.getContext('2d');
let dim = { x: window.innerWidth, y: window.innerHeight };
let mouse = { x: 0, y: 0 };
canvas.width = dim.x;
canvas.height = dim.y;
let c = false;
let p1;
let p2;
window.onmousemove = e => {
    mouse = { x: e.pageX, y: e.pageY };
};
window.onclick = e => {
    c = !c;
    let v = { x: e.pageX, y: e.pageY };
    if (c)
        p1 = v;
    else
        p2 = v;
};
window.onkeydown = e => {
    if (e.keyCode == 13) {
        if (!p1 || !p2)
            return;
        let v1 = snapVector({ x: Math.min(p1.x, p2.x), y: Math.min(p1.y, p2.y) }, 5);
        let v2 = snapVector({ x: Math.max(p1.x, p2.x), y: Math.max(p1.y, p2.y) }, 5);
        assets.push({ x: v1.x, y: v1.y, w: v2.x - v1.x, h: v2.y - v1.y });
        groups[gk[g]].push(assets.length - 1);
        p1 = p2 = undefined;
    }
    if (e.keyCode == 8) {
        p1 = p2 = undefined;
    }
    if (e.keyCode == 69) {
        showJSON({ assets, groups });
    }
    if (e.keyCode == 71) {
        g++;
        g = g % gk.length;
    }
};
let image = new Image();
image.src = './sprite.png';
function clearCtx() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, dim.x, dim.y);
}
function textCtx(text, pos) {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(text, pos.x, pos.y);
}
function axisCtx(pos, color = 'white') {
    pos = snapVector(pos, 5);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, pos.y);
    ctx.lineTo(dim.x, pos.y);
    ctx.moveTo(pos.x, 0);
    ctx.lineTo(pos.x, dim.y);
    ctx.stroke();
    ctx.closePath();
}
function snapNumber(v, s) {
    return Math.round(v / s) * s;
}
function snapVector(v, s) {
    return { x: snapNumber(v.x, s), y: snapNumber(v.y, s) };
}
function render() {
    clearCtx();
    ctx.drawImage(image, 0, 0);
    ctx.strokeStyle = 'green';
    assets.forEach(v => ctx.strokeRect(v.x, v.y, v.w, v.h));
    if (p1)
        axisCtx(p1, 'red');
    if (p2)
        axisCtx(p2, 'red');
    axisCtx(mouse);
    let group = gk[g];
    textCtx(group, { x: dim.x - ctx.measureText(group).width - 30, y: 30 });
    requestAnimationFrame(render);
}
function showJSON(json) {
    window.open(URL.createObjectURL(new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })));
}
render();
//# sourceMappingURL=color.js.map