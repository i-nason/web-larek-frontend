import { Api } from '../common/api';
import { IOrder, IOrderForm, IContactForm } from '../../types';
import { EventEmitter } from '../common/EventEmitter';

type EventName = string;
type Subscriber<T> = (data: T) => void;

export interface IAppState {
    order: Partial<IOrder>;
    formErrors: Partial<Record<keyof IOrderForm | keyof IContactForm, string>>;
}

export class AppState {
    public data: IAppState;
    private api: Api;
    private subscribers: Record<EventName, Subscriber<any>[]> = {};

    constructor(api: Api) {
        this.api = api;
        this.data = {
            order: {},
            formErrors: {}
        };
    }

    on<T>(event: EventName, subscriber: Subscriber<T>) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(subscriber);
    }

    emit<T>(event: EventName, data?: T) {
        this.subscribers[event]?.forEach(subscriber => subscriber(data));
    }

    setPayment(payment: IOrderForm['payment']): void {
        this.data.order.payment = payment;
        this.validate();
        this.emit('payment:changed', { payment });
    }

    setAddress(address: string): void {
        this.data.order.address = address;
        this.validate();
        this.emit('address:changed', { address });
    }

    setContacts(contacts: IContactForm): void {
        this.data.order = { ...this.data.order, ...contacts };
        this.validateContacts();
        this.emit('contacts:changed', contacts);
    }

    setFormErrors(errors: Partial<Record<keyof IOrderForm | keyof IContactForm, string>>) {
        this.data.formErrors = errors;
        this.emit('formErrors:changed', errors);
    }


    getOrder(): Partial<IOrder> {
        return this.data.order;
    }

    async sendOrder(items: string[], total: number): Promise<void> {
        const order = {
            ...this.data.order,
            items,
            total
        };
        
        try {
            await this.api.post('/order', order);
            this.emit('order:success');
        } catch (error) {
            this.emit('order:error', error);
            throw error;
        }
    }


    private validate() {
        const errors: Partial<Record<keyof IOrderForm, string>> = {};
        if (!this.data.order.payment) errors.payment = 'Выберите способ оплаты';
        if (!this.data.order.address?.length) errors.address = 'Заполните адрес доставки';
        this.setFormErrors(errors);
        this.emit('form:validate');
    }


    private validateContacts() {
        const errors: Partial<Record<keyof IContactForm, string>> = {};
        if (!this.data.order.email || !this.validateEmail(this.data.order.email)) {
            errors.email = 'Введите корректный email';
        }
        if (!this.data.order.phone || !this.validatePhone(this.data.order.phone)) {
            errors.phone = 'Введите телефон в правильном формате';
        }
        this.setFormErrors(errors);
        this.emit('contacts:validate');
    }


    isPaymentValid(): boolean {
        return !!(this.data.order.payment && this.data.order.address?.length);
    }


    isContactsValid(): boolean {
        return !!(
            this.data.order.email &&
            this.validateEmail(this.data.order.email) &&
            this.data.order.phone &&
            this.validatePhone(this.data.order.phone)
        );
    }


    private validateEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }


    private validatePhone(phone: string): boolean {
        const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
        return phoneRegex.test(phone);
    }


    clearOrder() {
        this.data.order = {};
        this.data.formErrors = {};
        this.emit('order:cleared');
    }
}