import { IProduct } from '../../types';

export class CatalogModel {
	private products: IProduct[] = [];

	setProducts(products: IProduct[]) {
		this.products = products;
	}

	getProducts(): IProduct[] {
		return this.products;
	}

	getProductById(id: string): IProduct | undefined {
		return this.products.find(p => p.id === id);
	}
}