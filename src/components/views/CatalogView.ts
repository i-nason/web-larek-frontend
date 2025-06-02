import { IProduct } from '../../types';
import { CDN_URL } from '../../utils/constants';

function formatPrice(price: number | null | undefined): string {
	return (price === null || price === undefined) ? 'Бесценно' : `${price} синапсов`;
}

function getCategoryClass(category: string): string {
	const categoryMap: { [key: string]: string } = {
		'софт-скил': 'soft',
		'хард-скил': 'hard',
		'другое': 'other',
		'дополнительное': 'additional',
		'кнопка': 'button'
	};
	return `card__category_${categoryMap[category.toLowerCase()] || 'other'}`;
}

export class CatalogView {
	private root: HTMLElement;
	private cardTemplate: HTMLTemplateElement;

	constructor(rootSelector: string) {
		const root = document.querySelector(rootSelector);
		if (!root) throw new Error(`Root element "${rootSelector}" не найден`);
		this.root = root as HTMLElement;

		const template = document.getElementById('card-catalog');
		if (!(template instanceof HTMLTemplateElement)) {
			throw new Error('Шаблон карточки (card-catalog) не найден');
		}
		this.cardTemplate = template;
	}

	render(products: IProduct[]) {
		this.root.innerHTML = '';
		products.forEach(product => {
			const card = this.cardTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;

			card.dataset.id = product.id;
			const title = card.querySelector('.card__title');
			const image = card.querySelector('.card__image');
			const price = card.querySelector('.card__price');
			const category = card.querySelector('.card__category');

			if (image) image.remove();
			if (title) title.remove();
			if (price) price.remove();
			if (category) category.remove();

			if (category) {
				category.textContent = product.category;
				category.className = `card__category ${getCategoryClass(product.category)}`;
				card.appendChild(category);
			}
			if (title) {
				title.textContent = product.title;
				(title as HTMLElement).style.textAlign = 'left';
				card.appendChild(title);
			}
			if (image instanceof HTMLImageElement) {
				image.src = `${CDN_URL}/${product.image}`;
				image.alt = product.title;
				card.appendChild(image);
			}
			if (price) {
				price.textContent = formatPrice(product.price);
				card.appendChild(price);
			}

			this.root.appendChild(card);
		});
	}

	onProductClick(handler: (productId: string) => void) {
		this.root.addEventListener('click', (e) => {
			const card = (e.target as HTMLElement).closest('.card');
			if (card && card instanceof HTMLElement && card.dataset.id) {
				handler(card.dataset.id);
			}
		});
	}
}

