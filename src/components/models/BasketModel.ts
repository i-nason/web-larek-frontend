import { IProduct } from '../../types';

export class BasketModel {
	private items: IProduct[] = [];

	addItem(item: IProduct): void {
		if (item.price === null || item.price === undefined) {
			console.warn('Попытка добавить бесценный товар в корзину:', item);
			return;
		}
		this.items.push(item);
	}

	removeItem(id: string): void {
		this.items = this.items.filter(item => item.id !== id);
	}

	getItems(): IProduct[] {
		return this.items;
	}

	clear(): void {
		this.items = [];
	}
}