interface Color {
    r: number;
    g: number;
    b: number;
}
interface HSVColor {
    h: number;
    s: number;
    v: number;
}
interface Vector {
    x: number;
    y: number;
}
function createCharacter(pos: Vector, dim: Vector, color: Color): Promise<string> {
    return new Promise(res => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let dark = { r: color.r / 2, g: color.g / 2, b: color.b / 2 } as Color;
        function getData() {
            let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            function getRGB(i: number): Color {
                return {
                    r: imgData.data[i * 4 + 0],
                    g: imgData.data[i * 4 + 1],
                    b: imgData.data[i * 4 + 2]
                } as Util.Color;
            }
            function RGBtoHSV(c: Color) {
                let cn = { r: c.r / 255, g: c.g / 255, b: c.b / 255 } as Color;

                let cmin = Math.min(c.r, c.g, c.b);
                let cmax = Math.max(c.r, c.g, c.b);

                let cminn = Math.min(cn.r, cn.g, cn.b);
                let cmaxn = Math.max(cn.r, cn.g, cn.b);

                let t = cmax - cmin;
                let tn = cmaxn - cminn;

                function calculateH(): number {
                    if (tn == 0) return 0;
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
                function calculateS(): number {
                    if (cmaxn == 0) return 0;
                    return Math.round(t / cmaxn);
                }
                function calculateV(): number {
                    return cmax;
                }

                return { h: calculateH(), s: calculateS(), v: calculateV() } as HSVColor;
            }
            function setRGB(i: number, c: Util.Color) {
                imgData.data[i * 4 + 0] = c.r;
                imgData.data[i * 4 + 1] = c.g;
                imgData.data[i * 4 + 2] = c.b;
            }
            function compare(a: Color, b: Color): boolean {
                return (a.r == b.r) && (a.g == b.g) && (a.b == b.b);
            }
            function distance(a: HSVColor, b: HSVColor): HSVColor {
                return { h: Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h)), s: Math.abs(a.s - b.s), v: Math.abs(a.v - b.v) } as HSVColor;
            }
            function compareHSV(a: HSVColor, b: HSVColor): boolean {
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
                if (rd.h < 90 && rd.s < 120 && rd.v < 180) setRGB(i, color);
                if (bd.h < 60 && bd.s < 120 && bd.v < 180) setRGB(i, dark);
                if (gd.h < 60 && gd.s < 120 && gd.v < 180) setRGB(i, { r: rgb.r, g: rgb.g, b: rgb.g } as Color);
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

interface Asset {
    x: number;
    y: number;
    w: number;
    h: number;
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


async function load(group: string) {
    for (let i of groups[group]) {
        let o = assets[i];
        let url = await createCharacter({ x: o.x, y: o.y } as Vector, { x: o.w, y: o.h } as Vector, { r: 255, g: 0, b: 255 });
        let img = document.createElement('img');
        img.src = url;
        document.body.appendChild(img);
    }
}
async function loadCharacter(o: Asset) {
    let url = await createCharacter({ x: o.x, y: o.y } as Vector, { x: o.w, y: o.h } as Vector, { r: 255, g: 0, b: 255 });
    let img = document.createElement('img');
    img.src = url;
    document.body.appendChild(img);
}
async function clear() {
    document.body.innerHTML = '';
}
async function loadAll() {
    await clear();
    let keys = Object.keys(groups);
    for (let k of keys) {
        await load(k);
    }
}

let canvas = document.body.appendChild(document.createElement('canvas'));
let ctx = canvas.getContext('2d');
let dim = { x: window.innerWidth, y: window.innerHeight } as Vector;
let mouse = { x: 0, y: 0 } as Vector;

canvas.width = dim.x;
canvas.height = dim.y;

let c = false;
let p1: Vector;
let p2: Vector;

window.onmousemove = e => {
    mouse = { x: e.pageX, y: e.pageY } as Vector;
}
window.onclick = e => {
    c = !c;
    let v = { x: e.pageX, y: e.pageY } as Vector;
    if (c) p1 = v; else p2 = v;
}
window.onkeydown = e => {
    if (e.keyCode == 13) {
        if (!p1 || !p2) return;
        let v1 = snapVector({ x: Math.min(p1.x, p2.x), y: Math.min(p1.y, p2.y) } as Vector, 5);
        let v2 = snapVector({ x: Math.max(p1.x, p2.x), y: Math.max(p1.y, p2.y) } as Vector, 5);
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
function textCtx(text: string, pos: Vector) {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(text, pos.x, pos.y);
}
function axisCtx(pos: Vector, color: string = 'white') {
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
function snapNumber(v: number, s: number): number {
    return Math.round(v / s) * s;
}
function snapVector(v: Vector, s: number): Vector {
    return { x: snapNumber(v.x, s), y: snapNumber(v.y, s) } as Vector;
}
function render() {
    clearCtx();
    ctx.drawImage(image, 0, 0);
    ctx.strokeStyle = 'green';
    assets.forEach(v => ctx.strokeRect(v.x, v.y, v.w, v.h));
    if (p1) axisCtx(p1, 'red');
    if (p2) axisCtx(p2, 'red');
    axisCtx(mouse);
    let group = gk[g];
    textCtx(group, { x: dim.x - ctx.measureText(group).width - 30, y: 30 } as Vector);
    //textCtx(`${mouse.x}, ${mouse.y}`, {x: 150, y: 150} as Vector);
    requestAnimationFrame(render);
}
function showJSON(json: any) {
    window.open(URL.createObjectURL(new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })));
}
render();