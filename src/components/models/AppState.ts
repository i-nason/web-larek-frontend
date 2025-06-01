import { Model } from '../base/model';
import { Api } from '../base/api';
import { IOrder, IOrderForm, IContactForm } from '../../types';

export interface IAppState {
    order: Partial<IOrder>;
    formErrors: Partial<Record<keyof IOrderForm | keyof IContactForm, string>>;
}

export class AppState extends Model<IAppState> {
    constructor(private api: Api) {
        super({
            order: {},
            formErrors: {}
        });
    }

    // Установить способ оплаты
    setPayment(payment: IOrderForm['payment']): void {
        this.data.order.payment = payment;
        this.emitChanges('payment:changed', { payment });
    }

    // Установить адрес доставки
    setAddress(address: string): void {
        this.data.order.address = address;
    }

    // Установить контактные данные
    setContacts(contacts: IContactForm): void {
        this.data.order = { ...this.data.order, ...contacts };
        this.emitChanges('contacts:changed', contacts);
    }

    // Установить список товаров
    setItems(items: string[]): void {
        this.data.order.items = items;
    }

    // Очистить состояние
    clearOrder(): void {
        this.data.order = {};
        this.data.formErrors = {};
        this.emitChanges('order:cleared');
    }

    // Установить ошибки формы
    setFormErrors(errors: Partial<Record<keyof IOrderForm | keyof IContactForm, string>>): void {
        this.data.formErrors = errors;
        this.emitChanges('formErrors:changed', this.data.formErrors);
    }

    // Получить текущий заказ
    getOrder(): Partial<IOrder> {
        return this.data.order;
    }

    // Проверить валидность формы оплаты
    isPaymentValid(): boolean {
        return !!(
            this.data.order.payment &&
            this.data.order.address
        );
    }

    // Проверить валидность формы контактов
    isContactsValid(): boolean {
        return !!(
            this.data.order.email &&
            this.data.order.phone
        );
    }

    // Отправить заказ
    async submitOrder(): Promise<void> {
        if (this.isPaymentValid() && this.isContactsValid()) {
            const order = this.getOrder() as IOrder;
            try {
                await this.api.post('/order', order);
                this.clearOrder();
                this.emitChanges('order:success');
            } catch (error) {
                this.emitChanges('order:error', error);
            }
        } else {
            this.emitChanges('order:error', new Error('Форма заполнена неверно'));
        }
    }
} 