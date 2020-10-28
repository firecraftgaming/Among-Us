class Event {
    constructor() {
        this.callbacks = [];
    }
    on(event, callback) {
        this.callbacks.push({ event, callback });
    }
    fireEvent(event, args) {
        for (let i = 0; i < this.callbacks.length; i++) {
            let c = this.callbacks[i];
            if (c.event == event)
                c.callback.apply(null, args);
        }
    }
}
export { Event };
//# sourceMappingURL=event.js.map