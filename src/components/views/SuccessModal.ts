import { ModalView } from './ModalView';
import { formatPrice } from '../../utils/format';

export class SuccessModal extends ModalView {
    private template: HTMLTemplateElement;

    constructor() {
        super('#modal-container');
        
        const template = document.getElementById('success');
        if (!(template instanceof HTMLTemplateElement)) {
            throw new Error('Шаблон окна успеха не найден');
        }
        this.template = template;

        // Добавляем обработчик закрытия
        document.body.addEventListener('click', (e) => {
            const btn = (e.target as HTMLElement).closest('.order-success__close');
            if (btn) {
                this.close();
                document.querySelectorAll('.modal').forEach(modal => 
                    modal.classList.remove('modal_active')
                );
            }
        });
    }

    /**
     * Показывает окно успешного оформления заказа
     * @param total Общая сумма заказа
     */
    show(total: number): void {
        const content = this.template.content.firstElementChild!.cloneNode(true) as HTMLElement;
        const desc = content.querySelector('.order-success__description');
        if (desc) {
            desc.textContent = `Списано ${formatPrice(total)}`;
        }
        this.open(content.outerHTML);
    }
} 