import { Model } from '../base/model';
import { ICartItem } from '../../types';

export interface IBasketState {
    items: ICartItem[];
    total: number;
}

export class BasketModel extends Model<IBasketState> {
    constructor() {
        super({
            items: [],
            total: 0
        });
    }

    // Добавить товар в корзину
    add(item: ICartItem): void {
        if (!this.data.items.find(({ id }) => id === item.id)) {
            this.data.items.push(item);
            this.updateTotal();
            this.emitChanges('basket:changed', this.data);
        }
    }

    // Удалить товар из корзины
    remove(id: string): void {
        this.data.items = this.data.items.filter(item => item.id !== id);
        this.updateTotal();
        this.emitChanges('basket:changed', this.data);
    }

    // Очистить корзину
    clear(): void {
        this.data.items = [];
        this.updateTotal();
        this.emitChanges('basket:changed', this.data);
    }

    // Получить список id товаров в корзине
    getIds(): string[] {
        return this.data.items.map(item => item.id);
    }

    // Обновить общую сумму
    private updateTotal(): void {
        this.data.total = this.data.items.reduce(
            (sum, item) => sum + item.price,
            0
        );
    }
} 