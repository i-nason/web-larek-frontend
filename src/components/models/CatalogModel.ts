import { Model } from '../base/model';
import { Api } from '../base/api';
import { IProduct } from '../../types';

export interface ICatalogState {
    items: IProduct[];
    selected: IProduct | null;
}

export class CatalogModel extends Model<ICatalogState> {
    constructor(private api: Api) {
        super({ items: [], selected: null });
    }

    // Загрузить товары с сервера
    async loadProducts(): Promise<void> {
        console.log('Loading products...');
        try {
            const response = await this.api.get('/api/weblarek/product');
            console.log('Products response:', response);
            
            // Проверяем формат ответа
            if (response && typeof response === 'object' && 'items' in response) {
                const { items } = response as { items: IProduct[], total: number };
                console.log('Setting items:', items.length);
                this.setItems(items);
            } else {
                throw new Error('Invalid response format: expected object with items array');
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            throw error;
        }
    }

    // Установить список товаров
    setItems(items: IProduct[]): void {
        console.log('Setting catalog items:', items.length);
        this.data.items = items;
        this.emitChanges('items:changed', this.data.items);
    }

    // Получить товар по id
    getItem(id: string): IProduct | undefined {
        return this.data.items.find(item => item.id === id);
    }

    // Установить выбранный товар
    setSelected(item: IProduct | null): void {
        this.data.selected = item;
        this.emitChanges('preview:changed', this.data.selected);
    }
} 