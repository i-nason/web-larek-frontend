import { ICartItem } from '../../types';
import { formatPrice } from '../../utils/format';

export class BasketView {
  private modal: HTMLElement;
  private content: HTMLElement;
  private onDelete?: (id: string) => void;
  private onOrderClick?: () => void;

  constructor(modalSelector = '#modal-container') {
    const modal = document.querySelector(modalSelector);
    if (!modal) throw new Error('Модальное окно не найдено');
    this.modal = modal as HTMLElement;

    const content = modal.querySelector('.modal__content');
    if (!content) throw new Error('Структура модального окна неверна');

    this.content = content as HTMLElement;

    this.content.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.basket__button')) {
        e.preventDefault();
        this.onOrderClick?.();
      }
    });

    this.content.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.basket__item-delete')) {
        e.preventDefault();
        const li = target.closest('.basket__item') as HTMLElement;
        if (li && li.dataset.id) {
          this.onDelete?.(li.dataset.id);
        }
      }
    });
  }

  setDeleteHandler(handler: (id: string) => void) {
    this.onDelete = handler;
  }

  setOrderHandler(handler: () => void) {
    this.onOrderClick = handler;
  }

  render(items: ICartItem[], totalPrice: number) {
    this.content.innerHTML = '';

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.style.padding = '2rem';
      empty.style.textAlign = 'center';
      empty.textContent = 'В корзине нет товаров';
      this.content.appendChild(empty);
      this.modal.classList.add('modal_active');
      return;
    }

    const template = document.getElementById('basket') as HTMLTemplateElement;
    if (!template) throw new Error('Шаблон корзины не найден');

    const node = template.content.firstElementChild!.cloneNode(true) as HTMLElement;

    const list = node.querySelector('.basket__list') as HTMLElement;
    list.innerHTML = '';

    items.forEach((item, idx) => {
      const itemTemplate = document.getElementById('card-basket') as HTMLTemplateElement;
      if (!itemTemplate) throw new Error('Шаблон карточки корзины не найден');
      const li = itemTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;

      li.dataset.id = item.id;
      li.querySelector('.basket__item-index')!.textContent = (idx + 1).toString();
      li.querySelector('.card__title')!.textContent = item.title;
      li.querySelector('.card__price')!.textContent = formatPrice(item.price);

      list.appendChild(li);
    });

    node.querySelector('.basket__price')!.textContent = formatPrice(totalPrice);
    this.content.appendChild(node);
    this.modal.classList.add('modal_active');
  }
}