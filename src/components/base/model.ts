import { EventEmitter } from './events';

export abstract class Model<T extends object> extends EventEmitter {
    protected constructor(protected data: T) {
        super();
    }

    // Получить текущее состояние модели
    getData(): T {
        return this.data;
    }

    // Обновить состояние модели
    protected emitChanges(event: string, payload?: object): void {
        this.emit(event, payload ?? this.data);
    }
} 