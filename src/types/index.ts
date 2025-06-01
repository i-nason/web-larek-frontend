// Типы данных от API
export interface IProductAPI {
	id: string;
	title: string;
	description: string;
	image: string;
	category: string;
	price: number | null;
}

// Внутренние типы приложения

// Товар, отображаемый в приложении
export interface IProduct {
	id: string;
	title: string;
	description: string;
	image: string;
	category: string;
	price: number | null;
}

// Товар в корзине
export interface ICartItem extends IProduct {}

// Данные формы оформления заказа (шаг 1)
export interface IOrderForm {
	payment: 'card' | 'cash';
	address: string;
}

// Данные формы контактов (шаг 2)
export interface IContactForm {
	email: string;
	phone: string;
}

// Объединённые данные заказа (шаг 1 + шаг 2)
export interface IOrder extends IOrderForm, IContactForm {
	items: string[]; // id товаров
}

// Перечисление пользовательских событий
export type AppEvent =
	| 'card:select'
	| 'card:add'
	| 'card:remove'
	| 'preview:change'
	| 'basket:open'
	| 'basket:change'
	| 'order:submit'
	| 'order:success'
	| 'order:cancel'
	| 'formErrors:change'
	| 'payment:change'
	| 'contacts:change';

// Типы данных, передаваемых в событиях EventEmitter
export interface IEventPayloads {
	'card:select': IProduct;
	'card:add': IProduct;
	'card:remove': string; // id товара
	'preview:change': IProduct | null;
	'basket:open': void;
	'basket:change': ICartItem[];
	'order:submit': IOrder;
	'order:success': void;
	'order:cancel': void;
	'formErrors:change': Partial<Record<keyof IOrderForm | keyof IContactForm, string>>;
	'payment:change': Pick<IOrderForm, 'payment'>;
	'contacts:change': IContactForm;
}