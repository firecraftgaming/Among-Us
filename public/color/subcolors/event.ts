class Event<T> {
    private callbacks: {event: keyof T, callback: Function}[] = [];

    public on(event: keyof T, callback: Function) {
        this.callbacks.push({event, callback});
    }
    public fireEvent<K extends keyof T>(event: K, args: T[K]) {
        for (let i = 0; i < this.callbacks.length; i++) {
            let c = this.callbacks[i];
            if (c.event == event) c.callback.apply(null, args);
        }
    }
}

export {Event};