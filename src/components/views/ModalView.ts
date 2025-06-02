export class ModalView {
	private modal: HTMLElement;
	private content: HTMLElement;
	private closeBtn: HTMLElement;

	constructor(modalSelector = '#modal-container') {
		const modal = document.querySelector(modalSelector);
		if (!modal) throw new Error('Модальное окно не найдено');
		this.modal = modal as HTMLElement;

		const content = modal.querySelector('.modal__content');
		const closeBtn = modal.querySelector('.modal__close');
		if (!content || !closeBtn) throw new Error('Структура модального окна неверна');

		this.content = content as HTMLElement;
		this.closeBtn = closeBtn as HTMLElement;

		this.closeBtn.addEventListener('click', () => this.close());
		this.modal.addEventListener('mousedown', (e) => {
			if (e.target === this.modal) this.close();
		});
	}

	open(innerHTML: string) {
		this.content.innerHTML = innerHTML;
		this.modal.classList.add('modal_active');
	}

	close() {
		this.modal.classList.remove('modal_active');
		this.content.innerHTML = '';
	}
}