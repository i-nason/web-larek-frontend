import { IContactForm } from '../../types';

export interface IContacts {
    email: string;
    phone: string;
}

export class ContactView {
    private form: HTMLFormElement;
    private emailInput: HTMLInputElement;
    private phoneInput: HTMLInputElement;
    private submitBtn: HTMLButtonElement;

    onContactsInput?: (contacts: IContacts) => void;
    onSubmit?: () => void;

    constructor(formSelector: string = 'form[name="contacts"]') {
        const form = document.querySelector(formSelector) as HTMLFormElement;
        if (!form) throw new Error('Форма контактов не найдена');
        this.form = form;
        this.emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
        this.phoneInput = form.querySelector('input[name="phone"]') as HTMLInputElement;
        this.submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;

        this.phoneInput.addEventListener('input', () => {
            let value = this.phoneInput.value;
            if (!value.startsWith('+7')) value = '+7 (';
            this.phoneInput.value = this.formatPhone(value);
            this.emitContacts();
        });

        this.emailInput.addEventListener('input', () => {
            this.emitContacts();
        });

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.onSubmit?.();
        });
    }

    private emitContacts() {
        this.onContactsInput?.({
            email: this.emailInput.value,
            phone: this.phoneInput.value,
        });
    }

    private formatPhone(value: string): string {
        const digits = value.replace(/\D/g, '');
        let result = '+7 (';
        if (digits.length > 1) result += digits.slice(1, 4);
        if (digits.length >= 4) result += ') ' + digits.slice(4, 7);
        if (digits.length >= 7) result += '-' + digits.slice(7, 9);
        if (digits.length >= 9) result += '-' + digits.slice(9, 11);
        return result;
    }

    setErrors(errors: Record<string, string>) {
        const errorsSpan = this.form.querySelector('.form__errors') as HTMLElement;
        errorsSpan.textContent = Object.values(errors)
            .filter(Boolean)
            .join('. ') || '';
    }

    toggleSubmit(active: boolean) {
        this.submitBtn.disabled = !active;
    }
}