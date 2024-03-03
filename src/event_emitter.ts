type Listener<T extends unknown[]> = (...args: T) => void;

export class EventEmitter<EventMap extends Record<string, unknown[]>> {

    private listeners: {
        [K in keyof EventMap]?: Set<Listener<EventMap[K]>>
    } = {}

    /**
     * Add a new listener to a specific event
     * Multiple listeners can be added to 1 specific event
     * @param name - the event name
     * @param listener - the listener that will be added to this event name
     */
    public on<K extends keyof EventMap>(name: K, ...listener: Listener<EventMap[K]>[]) {

        const listeners = this.listeners[name] ?? new Set();
        this.listeners[name] = new Set([...listeners, ...listener]);
    }

    /**
     * Add a listener to a specific event that will be triggered only once
     * @param name - the event name
     * @param listener - the listener that will be added to this event name
     */
    public once<K extends keyof EventMap>(name: K, listener: Listener<EventMap[K]>) {
        const onceListener: Listener<EventMap[K]> = (...args) => {
            listener(...args);
            this.off(name, onceListener);
        };
        this.on(name, onceListener);
    }

    /**
     * Remove a specific listener from the event
     * @param name - the event name
     * @param listener - the listener to be removed
     */
    public off<K extends keyof EventMap>(name: K, listener: Listener<EventMap[K]>) {
        const listeners = this.listeners[name];
        if (listeners) {
            listeners.delete(listener);
        }
    }

    /**
     * Emit an event with the given name and arguments
     * @param name - the event name
     * @param args - the arguments that will be passed to the listeners
     */
    public emit<K extends keyof EventMap>(name: K, ...args: EventMap[K]) {

        const listeners = this.listeners[name] ?? new Set();
        for(const listener of listeners) {
            listener(...args);
        }
    }
}