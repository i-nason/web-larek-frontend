import { EventEmitter } from './events';

export abstract class View<T> extends EventEmitter {
    protected constructor(protected readonly container: HTMLElement) {
        super();
    }

    // Показать элемент
    show(): void {
        this.container.style.display = 'block';
    }

    // Скрыть элемент
    hide(): void {
        this.container.style.display = 'none';
    }

    // Установить новое состояние элемента
    protected setText(element: HTMLElement, value: unknown): void {
        if (element) {
            element.textContent = String(value);
        }
    }

    // Установить изображение с альтернативным текстом
    protected setImage(element: HTMLImageElement, src: string, alt?: string): void {
        if (element) {
            element.src = src;
            if (alt) {
                element.alt = alt;
            }
        }
    }

    // Очистить элемент
    protected clear(element: HTMLElement): void {
        element.innerHTML = '';
    }

    // Добавить обработчик события на элемент
    protected addListener<E extends Event>(
        element: HTMLElement,
        event: string,
        handler: (event: E) => void
    ): void {
        element.addEventListener(event, handler as EventListener);
    }

    // Удалить обработчик события с элемента
    protected removeListener<E extends Event>(
        element: HTMLElement,
        event: string,
        handler: (event: E) => void
    ): void {
        element.removeEventListener(event, handler as EventListener);
    }

    // Абстрактный метод для рендеринга, который должны реализовать наследники
    abstract render(data?: T): HTMLElement;
} 