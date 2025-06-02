type EventHandler<T = any> = (payload?: T) => void;

export class EventEmitter<Events extends Record<string, any>> {
    private listeners: { [K in keyof Events]?: EventHandler<Events[K]>[] } = {};

    on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event]!.push(handler);
    }

    off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event]!.filter(h => h !== handler);
    }

    emit<K extends keyof Events>(event: K, payload?: Events[K]): void {
        this.listeners[event]?.forEach(handler => handler(payload));
    }

    trigger<K extends keyof Events>(event: K) {
        return (payload?: Events[K]) => this.emit(event, payload);
    }
}