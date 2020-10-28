import { Event } from './event.js'

interface AnimationEvents<T> {
    'done': [];
    'render': [T, number];
}
class Animation<T> extends Event<AnimationEvents<T>> {
    private frames: T[];
    private frame: number = 0;
    private step: number = 0;
    private running: boolean = false;
    private tpf: number;
    constructor(frames: T[], fps: number = 60) {
        super();
        this.tpf = 60 / fps;
        this.frames = frames;
        requestAnimationFrame(this.loop.bind(this));
    }

    public set ondone(callback: Function) {
        this.on('done', callback);
    }
    public set onrender(callback: Function) {
        this.on('render', callback);
    }

    public start() {
        this.step = 0;
        this.frame = 0;
        this.running = true;
    }
    public reset() {
        this.step = 0;
        this.frame = 0;
    }
    public stop() {
        this.running = false;
    }
    private render() {
        this.fireEvent('render', [this.frames[this.frame], this.frame]);

        this.frame++;
        if (this.frame >= this.frames.length) {
            this.stop();
            this.fireEvent('done', []);
        }
    }
    private loop() {
        if (this.running) {
            this.step++;
            if (this.step >= this.tpf) {
                this.render();
                this.step = 0;
            }
        }
        requestAnimationFrame(this.loop.bind(this));
    }
}

export {Animation, AnimationEvents};