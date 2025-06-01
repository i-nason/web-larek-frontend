import { View } from './base/view';

interface IModalData {
    content: HTMLElement;
}

export class Modal extends View<IModalData> {
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement;

    constructor(protected _container: HTMLElement) {
        super(_container);

        this._closeButton = _container.querySelector('.modal__close') as HTMLButtonElement;
        this._content = _container.querySelector('.modal__content') as HTMLElement;

        this._closeButton.addEventListener('click', this.close.bind(this));
        
        // Добавляем обработчик клика вне модального окна
        this._container.addEventListener('click', (evt) => {
            if (evt.target === this._container) {
                this.close();
            }
        });
    }

    render(data: IModalData): HTMLElement {
        this.clear(this._content);
        this._content.appendChild(data.content);
        this.open();
        return this.container;
    }

    open(): void {
        this.container.classList.add('modal_active');
        this.emit('modal:open');
    }

    close(): void {
        this.container.classList.remove('modal_active');
        this.emit('modal:close');
    }

    setContent(content: HTMLElement): void {
        this.render({ content });
    }
} 