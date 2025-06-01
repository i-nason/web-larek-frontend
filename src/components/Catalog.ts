import { View } from './base/view';
import { Card } from './Card';
import { IProduct } from '../types';

interface ICatalogActions {
    onCardClick: (event: MouseEvent) => void;
}

export class Catalog extends View<IProduct[]> {
    protected _container: HTMLElement;
    protected _cards: Card[] = [];
    protected _actions: ICatalogActions;

    constructor(container: HTMLElement, actions: ICatalogActions) {
        super(container);

        this._container = container;
        this._actions = actions;
    }

    render(data: IProduct[]): HTMLElement {
        // Очищаем контейнер и массив карточек
        this.clear(this._container);
        this._cards = [];

        // Создаем карточки для каждого товара
        const template = document.querySelector('#card-catalog') as HTMLTemplateElement;
        
        data.forEach((item) => {
            // Клонируем содержимое шаблона
            const cardElement = template.content.firstElementChild?.cloneNode(true) as HTMLElement;
            if (!cardElement) return;
            
            this._container.appendChild(cardElement);

            const card = new Card(cardElement, {
                onClick: (evt: MouseEvent) => {
                    this._actions.onCardClick(evt);
                }
            });

            card.render(item);
            this._cards.push(card);
        });

        return this._container;
    }
} 