// Типы данных от API

export interface IProductAPI {
    id: string;
    title: string;
    description: string;
    category: string;
    image: string;
    price: number;
  }
  
  // Интерфейс товара внутри приложения
  
  export interface IProduct extends IProductAPI {
    
  }
  
  // Интерфейс корзины
  
  export interface IBasketItem {
    id: string;            // id продукта
    title: string;         // название
    price: number;         // цена
  }
  
  // Модель корзины
  
  export interface IBasketModel {
    items: IBasketItem[];
    addItem(item: IBasketItem): void;
    removeItem(id: string): void;
    clear(): void;
    getTotal(): number;
  }
  
  // Модель товаров
  
  export interface IProductModel {
    products: IProduct[];
    setProducts(items: IProduct[]): void;
    getProductById(id: string): IProduct | undefined;
  }
  
  // Модель заказа
  
  export type PaymentMethod = 'card' | 'cash';
  
  export interface IOrderForm {
    payment: PaymentMethod;
    address: string;
  }
  
  export interface IContactForm {
    email: string;
    phone: string;
  }
  
  export interface IOrder {
    items: string[]; // список id товаров
    address: string;
    email: string;
    phone: string;
    payment: PaymentMethod;
    total: number;
  }
  
  // Модель оформления заказа
  
  export interface IOrderModel {
    form: Partial<IOrderForm & IContactForm>;
    updateForm(data: Partial<IOrderForm & IContactForm>): void;
    getOrder(): IOrder;
    clear(): void;
  }
  
  // Интерфейсы отображений
  
  export interface ICardView {
    render(data: IProduct, templateId: string): HTMLElement;
  }
  
  export interface IBasketView {
    render(items: IBasketItem[], total: number): void;
    setDeleteHandler(handler: (id: string) => void): void;
  }
  
  export interface IOrderFormView {
    render(data: Partial<IOrderForm>): void;
    setSubmitHandler(handler: (data: IOrderForm) => void): void;
  }
  
  export interface IContactFormView {
    render(data: Partial<IContactForm>): void;
    setSubmitHandler(handler: (data: IContactForm) => void): void;
  }
  
  // Интерфейс API-клиента
  
  export interface IApi {
    get<T>(uri: string): Promise<T>;
    post<T>(uri: string, data: object, method?: 'POST' | 'PUT' | 'DELETE'): Promise<T>;
  }
  
  // Интерфейсы базовых классов отображения
  
  export interface IComponent {
    render(data?: unknown): HTMLElement;
  }
  
  export interface IModal {
    open(content: HTMLElement): void;
    close(): void;
  }
  
  // Типы событий и их интерфейсы
  
  export type AppEvent =
    | 'products:changed'
    | 'product:selected'
    | 'basket:changed'
    | 'order:created'
    | 'modal:open'
    | 'modal:close'
    | 'form:submit'
    | 'order:success';
  
  export interface IEventPayloadMap {
    'products:changed': IProduct[];
    'product:selected': IProduct;
    'basket:changed': IBasketItem[];
    'order:created': IOrder;
    'modal:open': HTMLElement;
    'modal:close': void;
    'form:submit': Partial<IOrderForm & IContactForm>;
    'order:success': { total: number };
  }