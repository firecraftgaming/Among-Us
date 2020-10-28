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
let lines = [];
let pos = Vector.zero;
let phb;
onmessage = e => {
    lines = Line.bigLineToLineArray(e.data.lines);
    pos = new Vector(e.data.pos.x, e.data.pos.y);
    phb = e.data.phb;
};
function raycast(pos, dir, l) {
    const [v1, v2, v3, v4] = [pos, pos.clone().add(dir), l.a, l.b];
    let den = (v1.x - v2.x) * (v3.y - v4.y) - (v1.y - v2.y) * (v3.x - v4.x);
    if (den == 0)
        return;
    let t = ((v1.x - v3.x) * (v3.y - v4.y) - (v1.y - v3.y) * (v3.x - v4.x)) / den;
    let u = -((v1.x - v2.x) * (v1.y - v3.y) - (v1.y - v2.y) * (v1.x - v3.x)) / den;
    if (u < 0 || u > 1)
        return;
    if (t < 0)
        return;
    return new Vector((v1.x + t * (v2.x - v1.x)), (v1.y + t * (v2.y - v1.y)));
}
function raycastAgainstWalls(pos, dir, walls) {
    let r;
    for (let o of walls) {
        let h = raycast(pos, dir, o);
        if (!h)
            continue;
        if (!r)
            r = h;
        if (r.distance(pos) > h.distance(pos))
            r = h;
    }
    return r;
}
setInterval(_ => {
    let r = [];
    for (let i = 0; i < Math.PI * 2; i += Math.PI / 360) {
        let p = raycastAgainstWalls(pos.clone().add(new Vector(phb.w / 2, phb.h / 2)), new Vector(Math.cos(i), Math.sin(i)), lines);
        r.push(p);
    }
    postMessage(r, undefined);
}, 25);
//# sourceMappingURL=worker.js.map