import { View } from './base/view';
import { IProduct } from '../types';
import { CDN_URL } from '../utils/constants';

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

// Маппинг категорий на CSS-классы
const CATEGORY_MAP: { [key: string]: string } = {
    'софт-скил': 'soft',
    'хард-скил': 'hard',
    'другое': 'other',
    'дополнительное': 'additional',
    'кнопка': 'button',
    'еда': 'food'
};

export class Card extends View<IProduct> {
    protected _template: HTMLTemplateElement;
    protected _container: HTMLElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container);

        // Выбираем шаблон в зависимости от наличия класса card_full
        const isFull = container.classList.contains('card_full');
        this._template = document.querySelector(isFull ? '#card-preview' : '#card-catalog') as HTMLTemplateElement;
        this._container = container;

        if (actions?.onClick) {
            this.addListener(this._container, 'click', actions.onClick);
        }
    }

    set id(value: string) {
        this._container.dataset.id = value;
    }

    get id(): string {
        return this._container.dataset.id || '';
    }

    render(data: IProduct): HTMLElement {
        console.log('Rendering card with data:', JSON.stringify(data, null, 2));
        
        // Находим все необходимые элементы в существующей карточке
        const title = this._container.querySelector('.card__title') as HTMLElement;
        const image = this._container.querySelector('.card__image') as HTMLImageElement;
        const category = this._container.querySelector('.card__category') as HTMLElement;
        const price = this._container.querySelector('.card__price') as HTMLElement;
        const description = this._container.querySelector('.card__text') as HTMLElement;

        // Заполняем элементы данными
        if (title) {
            this.setText(title, data.title);
        }
        if (image) {
            const imagePath = data.image.startsWith('/') ? data.image.slice(1) : data.image;
            this.setImage(image, `${CDN_URL}/${imagePath}`, data.title);
        }
        if (category) {
            this.setText(category, data.category);
            // Сначала удаляем все существующие классы категорий
            Object.values(CATEGORY_MAP).forEach(categoryClass => {
                category.classList.remove(`card__category_${categoryClass}`);
            });
            // Добавляем соответствующий класс категории
            const categoryKey = CATEGORY_MAP[data.category.toLowerCase()] || 'other';
            category.classList.add(`card__category_${categoryKey}`);
        }
        if (price) {
            console.log(`Setting price for ${data.title}:`, data.price);
            this.setText(price, data.price !== null ? `${data.price} синапсов` : 'Бесценно');
        }
        if (description && data.description) this.setText(description, data.description);

        this.id = data.id;
        return this._container;
    }
} 