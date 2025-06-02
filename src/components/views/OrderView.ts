import { IOrderForm } from '../../types';

export type PaymentType = 'card' | 'cash';

export class OrderView {
    private form: HTMLFormElement;
    private addressInput: HTMLInputElement;
    private cardBtn: HTMLButtonElement;
    private cashBtn: HTMLButtonElement;
    private nextBtn: HTMLButtonElement;

    onPaymentChange?: (payment: PaymentType) => void;
    onAddressInput?: (address: string) => void;
    onSubmit?: () => void;

    constructor(formSelector: string = 'form[name="order"]') {
        const form = document.querySelector(formSelector) as HTMLFormElement;
        if (!form) throw new Error('Форма заказа не найдена');
        this.form = form;
        this.addressInput = form.querySelector('input[name="address"]') as HTMLInputElement;
        this.cardBtn = form.querySelector('button[name="card"]') as HTMLButtonElement;
        this.cashBtn = form.querySelector('button[name="cash"]') as HTMLButtonElement;
        this.nextBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;

        this.cardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.onPaymentChange?.('card');
        });
        this.cashBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.onPaymentChange?.('cash');
        });
        this.addressInput.addEventListener('input', () => {
            this.onAddressInput?.(this.addressInput.value);
        });
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.onSubmit?.();
        });
    }

    setPaymentVisual(type: PaymentType | null) {
        this.cardBtn.classList.remove('button_selected');
        this.cashBtn.classList.remove('button_selected');
        this.cardBtn.style.borderColor = '';
        this.cardBtn.style.boxShadow = '';
        this.cashBtn.style.borderColor = '';
        this.cashBtn.style.boxShadow = '';

        if (type === 'card') {
            this.cardBtn.classList.add('button_selected');
            this.cardBtn.style.borderColor = '#fff';
            this.cardBtn.style.boxShadow = '0 0 0 2px #fff';
        }
        if (type === 'cash') {
            this.cashBtn.classList.add('button_selected');
            this.cashBtn.style.borderColor = '#fff';
            this.cashBtn.style.boxShadow = '0 0 0 2px #fff';
        }
    }

    setErrors(errors: Record<string, string>) {
        const errorsSpan = this.form.querySelector('.form__errors') as HTMLElement;
        errorsSpan.textContent = Object.values(errors)
            .filter(Boolean)
            .join('. ') || '';
    }

    toggleSubmit(active: boolean) {
        this.nextBtn.disabled = !active;
    }
}
