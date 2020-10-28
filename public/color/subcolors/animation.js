import { Event } from './event.js';
class Animation extends Event {
    constructor(frames, fps = 60) {
        super();
        this.frame = 0;
        this.step = 0;
        this.running = false;
        this.tpf = 60 / fps;
        this.frames = frames;
        requestAnimationFrame(this.loop.bind(this));
    }
    set ondone(callback) {
        this.on('done', callback);
    }
    set onrender(callback) {
        this.on('render', callback);
    }
    start() {
        this.step = 0;
        this.frame = 0;
        this.running = true;
    }
    reset() {
        this.step = 0;
        this.frame = 0;
    }
    stop() {
        this.running = false;
    }
    render() {
        this.fireEvent('render', [this.frames[this.frame], this.frame]);
        this.frame++;
        if (this.frame >= this.frames.length) {
            this.stop();
            this.fireEvent('done', []);
        }
    }
    loop() {
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
export { Animation };
//# sourceMappingURL=animation.js.map