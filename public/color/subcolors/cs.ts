import { Event } from './event.js';
import { Animation } from './animation.js';
import { type } from 'os';

interface Groups {
    main: [],
    sneak: [],
    chair: [],
    ghost: [],
    corps: []
}


let gs = {} as Groups;
let a = [];
let c = document.querySelector('canvas');
c.width = 1080;
c.height = 720;
let ctx = c.getContext('2d');
let can: keyof Groups;
let anim: Animation<number>;

let cache = [];

function createCharacter(pos: Vector, dim: Vector, color: Color): Promise<HTMLCanvasElement> {
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
                if (gd.h < 60 && gd.s < 120 && gd.v < 180) setRGB(i, { r: rgb.r, g: rgb.g, b: rgb.g*2} as Color);
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
async function load(group: string) {
    for (let i of gs[group]) {
        await paintCharacter(i);
    }
}
async function paintCharacter(i: number) {
    clear();
    let r = await loadCharacter(i);
    ctx.drawImage(r, 0, 0);
}
async function loadCharacter(i: number) : Promise<HTMLCanvasElement> {
    if (cache[i] != null) return cache[i];
    let o = a[i];
    let r = await createCharacter({ x: o.x, y: o.y } as Vector, { x: o.w, y: o.h } as Vector, { r: 0, g: 0, b: 255 });
    cache[i] = r;
    return r;
}
async function clear() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, c.width, c.height);
}
async function loadAll() {
    await clear();
    let keys = Object.keys(gs);
    for (let k of keys) {
        await load(k);
    }
}
async function loadCharMap() {
    let map = await (await fetch('/characterMap.json')).json();
    gs = map.groups as Groups;
    a = map.assets as Hitbox[];
    cache = new Array(a.length).fill(null) as HTMLCanvasElement[];

    for (let i = 0; i < a.length; i++) {
        await loadCharacter(i);
    }

    can = prompt('Group?') as keyof Groups;
    if (!gs[can]) return;
    clear();
    anim = new Animation<number>(gs[can], 5);
    anim.onrender = frame => paintCharacter(frame);
}
loadCharMap();

window.onkeydown = e => {
    if (e.keyCode == 32) anim.start();
}

export {};