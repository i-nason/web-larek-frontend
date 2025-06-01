import './scss/styles.scss';
import { Api } from './components/base/api';
import { CatalogModel } from './components/models/CatalogModel';
import { BasketModel } from './components/models/BasketModel';
import { AppState } from './components/models/AppState';
import { Catalog } from './components/Catalog';
import { Modal } from './components/Modal';
import { Card } from './components/Card';
import { IProduct } from './types';

// Инициализация API
const API_ORIGIN = process.env.API_ORIGIN || 'https://larek-api.nomoreparties.co';
const api = new Api(API_ORIGIN, {
    headers: {
        'Content-Type': 'application/json',
    },
    mode: 'cors'
});

// Инициализация моделей
const catalogModel = new CatalogModel(api);
const basketModel = new BasketModel();
const appState = new AppState(api);

// Находим элементы
const galleryContainer = document.querySelector('.gallery') as HTMLElement;
const modalContainer = document.querySelector('#modal-container') as HTMLElement;
const basketCounter = document.querySelector('.header__basket-counter') as HTMLElement;
const basketButton = document.querySelector('.header__basket') as HTMLButtonElement;

if (!galleryContainer) throw new Error('Gallery container not found');
if (!modalContainer) throw new Error('Modal container not found');
if (!basketCounter) throw new Error('Basket counter not found');
if (!basketButton) throw new Error('Basket button not found');

// Инициализация модального окна
const modal = new Modal(modalContainer);

// Закрываем все модальные окна при старте
document.querySelectorAll('.modal').forEach(modalElement => {
    modalElement.classList.remove('modal_active');
});

// Инициализация каталога
const catalog = new Catalog(galleryContainer, {
    onCardClick: (evt: MouseEvent) => {
        const cardElement = evt.currentTarget as HTMLElement;
        const cardId = cardElement.dataset.id;
        if (cardId) {
            const product = catalogModel.getItem(cardId);
            if (product) {
                // Создаем карточку для модального окна из шаблона
                const template = document.querySelector('#card-preview') as HTMLTemplateElement;
                const modalCardContainer = template.content.firstElementChild?.cloneNode(true) as HTMLElement;
                if (!modalCardContainer) return;

                const modalCard = new Card(modalCardContainer);
                modalCard.render(product);
                
                // Добавляем кнопку действия
                const button = modalCardContainer.querySelector('.card__button') as HTMLButtonElement;
                const isInBasket = basketModel.getIds().includes(product.id);
                
                if (button) {
                    button.textContent = isInBasket ? 'Убрать' : 'В корзину';
                    button.onclick = () => {
                        if (isInBasket) {
                            basketModel.remove(product.id);
                        } else {
                            basketModel.add(product);
                        }
                        modal.close();
                    };
                }

                modal.setContent(modalCardContainer);
            }
        }
    }
});

// Подписываемся на события
catalogModel.on('items:changed', (items: IProduct[]) => {
    console.log('Rendering catalog items:', items.length);
    catalog.render(items);
    console.log('Catalog items rendered');
});

basketModel.on('basket:changed', (data: { items: IProduct[], total: number }) => {
    // Обновляем счетчик на кнопке корзины
    basketCounter.textContent = data.items.length.toString();
});

// Обработка клика по кнопке корзины
basketButton.addEventListener('click', () => {
    renderBasket();
});

// Функция рендеринга корзины
function renderBasket() {
    // Создаем корзину
    const basketContainer = document.createElement('div');
    const template = document.querySelector('#basket') as HTMLTemplateElement;
    basketContainer.appendChild(template.content.cloneNode(true));

    // Добавляем товары
    const list = basketContainer.querySelector('.basket__list') as HTMLElement;
    const total = basketContainer.querySelector('.basket__price') as HTMLElement;
    const orderButton = basketContainer.querySelector('.basket__button') as HTMLButtonElement;
    
    const items = basketModel.getData().items;
    
    if (items.length === 0) {
        // Показываем сообщение о пустой корзине
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('basket__empty');
        emptyMessage.textContent = 'А товаров пока нет.';
        list.appendChild(emptyMessage);
        
        // Скрываем кнопку оформления заказа и общую сумму
        if (orderButton) orderButton.style.display = 'none';
        if (total) total.style.display = 'none';
    } else {
        // Отображаем товары
        items.forEach((item, index) => {
            // Создаем элемент корзины из шаблона
            const template = document.querySelector('#card-basket') as HTMLTemplateElement;
            const itemElement = template.content.firstElementChild?.cloneNode(true) as HTMLElement;
            if (!itemElement) return;
            
            // Заполняем данные товара
            const title = itemElement.querySelector('.card__title');
            const price = itemElement.querySelector('.card__price');
            const index_el = itemElement.querySelector('.basket__item-index');
            const deleteBtn = itemElement.querySelector('.basket__item-delete');
            
            if (title) title.textContent = item.title;
            if (price) price.textContent = item.price !== null ? `${item.price} синапсов` : 'Бесценно';
            if (index_el) index_el.textContent = (index + 1).toString();
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    basketModel.remove(item.id);
                    renderBasket();
                });
            }
            
            list.appendChild(itemElement);
        });

        // Обновляем общую сумму
        if (total) {
            total.textContent = `${basketModel.getData().total} синапсов`;
            total.style.display = ''; // Показываем сумму
        }
        
        // Показываем кнопку оформления
        if (orderButton) {
            orderButton.style.display = '';
        }
    }

    // Добавляем обработчик оформления заказа
    if (orderButton) {
        orderButton.addEventListener('click', () => {
            // Сохраняем товары для заказа
            appState.setItems(basketModel.getIds());
            
            // Показываем форму оплаты
            const orderContainer = document.createElement('div');
            const orderTemplate = document.querySelector('#order') as HTMLTemplateElement;
            orderContainer.appendChild(orderTemplate.content.cloneNode(true));
            
            // Обработка формы оплаты
            const form = orderContainer.querySelector('form');
            if (form) {
                const cardButton = form.querySelector('button[name="card"]') as HTMLButtonElement;
                const cashButton = form.querySelector('button[name="cash"]') as HTMLButtonElement;
                const submitButton = form.querySelector('.order__button') as HTMLButtonElement;
                const addressInput = form.querySelector('input[name="address"]') as HTMLInputElement;
                
                let selectedPayment: string | null = null;

                // Функция обновления состояния кнопок оплаты
                const updatePaymentButtons = () => {
                    cardButton?.classList.toggle('button_alt-active', selectedPayment === 'card');
                    cashButton?.classList.toggle('button_alt-active', selectedPayment === 'cash');
                    
                    // Проверяем ошибки
                    const errors: string[] = [];
                    if (!selectedPayment) {
                        errors.push('Выберите способ оплаты');
                    }
                    if (!addressInput?.value.trim()) {
                        errors.push('Введите адрес доставки');
                    }

                    // Показываем ошибки
                    const errorsContainer = form.querySelector('.form__errors');
                    if (errorsContainer) {
                        errorsContainer.textContent = errors.join('. ');
                    }

                    // Активируем кнопку "Далее" только если нет ошибок
                    if (submitButton) {
                        submitButton.disabled = errors.length > 0;
                    }
                };

                // Обработчики для кнопок оплаты
                if (cardButton) {
                    cardButton.addEventListener('click', () => {
                        selectedPayment = 'card';
                        updatePaymentButtons();
                    });
                }

                if (cashButton) {
                    cashButton.addEventListener('click', () => {
                        selectedPayment = 'cash';
                        updatePaymentButtons();
                    });
                }

                // Обработчик ввода адреса
                if (addressInput) {
                    addressInput.addEventListener('input', () => {
                        updatePaymentButtons();
                    });
                }

                form.addEventListener('submit', (evt) => {
                    evt.preventDefault();
                    if (!selectedPayment || !addressInput?.value.trim()) return;
                    
                    // Сохраняем данные заказа
                    appState.setPayment(selectedPayment as 'card' | 'cash');
                    appState.setAddress(addressInput.value.trim());
                    
                    // Показываем форму контактов
                    const contactsContainer = document.createElement('div');
                    const contactsTemplate = document.querySelector('#contacts') as HTMLTemplateElement;
                    contactsContainer.appendChild(contactsTemplate.content.cloneNode(true));
                    
                    const contactsForm = contactsContainer.querySelector('form');
                    if (contactsForm) {
                        const emailInput = contactsForm.querySelector('input[name="email"]') as HTMLInputElement;
                        const phoneInput = contactsForm.querySelector('input[name="phone"]') as HTMLInputElement;
                        const submitButton = contactsForm.querySelector('button[type="submit"]') as HTMLButtonElement;
                        const errorsContainer = contactsForm.querySelector('.form__errors') as HTMLElement;

                        // Функция проверки валидности формы
                        const validateForm = () => {
                            const isValid = emailInput?.value && isEmailValid(emailInput.value) &&
                                          phoneInput?.value && isPhoneValid(phoneInput.value);
                            
                            if (submitButton) {
                                submitButton.disabled = !isValid;
                            }

                            // Показываем ошибки
                            if (errorsContainer) {
                                const errors: string[] = [];
                                
                                if (emailInput?.value && !isEmailValid(emailInput.value)) {
                                    errors.push('Неверный формат email');
                                }
                                
                                if (phoneInput?.value && !isPhoneValid(phoneInput.value)) {
                                    errors.push('Неверный формат телефона');
                                }

                                errorsContainer.textContent = errors.join('. ');
                            }
                        };

                        // Добавляем обработчики для полей
                        if (emailInput) {
                            emailInput.addEventListener('input', () => {
                                validateForm();
                            });
                        }

                        if (phoneInput) {
                            phoneInput.addEventListener('input', () => {
                                formatPhone(phoneInput);
                                validateForm();
                            });
                        }

                        contactsForm.addEventListener('submit', async (evt) => {
                            evt.preventDefault();
                            
                            if (!emailInput?.value || !phoneInput?.value || 
                                !isEmailValid(emailInput.value) || !isPhoneValid(phoneInput.value)) {
                                return;
                            }

                            // Сохраняем контактные данные
                            appState.setContacts({
                                email: emailInput.value,
                                phone: phoneInput.value
                            });
                            
                            // Отправляем заказ
                            try {
                                await appState.submitOrder();
                                
                                // Показываем сообщение об успехе
                                const successTemplate = document.querySelector('#success') as HTMLTemplateElement;
                                const successContainer = document.createElement('div');
                                successContainer.appendChild(successTemplate.content.cloneNode(true));
                                
                                // Обновляем сумму в сообщении
                                const description = successContainer.querySelector('.order-success__description');
                                if (description) {
                                    description.textContent = `Списано ${basketModel.getData().total} синапсов`;
                                }
                                
                                // Добавляем обработчик закрытия
                                const closeButton = successContainer.querySelector('.order-success__close');
                                if (closeButton) {
                                    closeButton.addEventListener('click', () => {
                                        modal.close();
                                        basketModel.clear();
                                    });
                                }
                                
                                modal.setContent(successContainer);
                            } catch (error) {
                                console.error('Failed to submit order:', error);
                            }
                        });
                    }
                    
                    modal.setContent(contactsContainer);
                });
            }
            
            modal.setContent(orderContainer);
        });
    }

    modal.setContent(basketContainer);
}

// Загрузка начальных данных
console.log('Starting to load products...');
catalogModel.loadProducts()
    .then(() => {
        console.log('Products loaded successfully');
    })
    .catch(err => {
        console.error('Failed to load products:', err);
        // Можно добавить уведомление пользователю о проблеме загрузки
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('error-message');
        errorMessage.textContent = 'Не удалось загрузить товары. Пожалуйста, обновите страницу.';
        galleryContainer.appendChild(errorMessage);
    });

// Функции валидации
function isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isPhoneValid(phone: string): boolean {
    // Формат: +7 (xxx) xxx-xx-xx
    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    return phoneRegex.test(phone);
}

function formatPhone(input: HTMLInputElement) {
    let value = input.value.replace(/\D/g, ''); // Оставляем только цифры
    
    if (value.length > 0 && value[0] !== '7') {
        value = '7' + value;
    }
    
    let formattedValue = '';
    if (value.length > 0) {
        formattedValue = '+7 ';
        if (value.length > 1) {
            formattedValue += '(' + value.substring(1, Math.min(4, value.length));
        }
        if (value.length > 4) {
            formattedValue += ') ' + value.substring(4, Math.min(7, value.length));
        }
        if (value.length > 7) {
            formattedValue += '-' + value.substring(7, Math.min(9, value.length));
        }
        if (value.length > 9) {
            formattedValue += '-' + value.substring(9, Math.min(11, value.length));
        }
    }
    
    input.value = formattedValue;
}
