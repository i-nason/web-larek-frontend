import './scss/styles.scss';

import { API_URL, CDN_URL } from './utils/constants';
import { IProductAPI, IProduct } from './types';
import { formatPrice } from './utils/format';
import { CatalogModel } from './components/models/CatalogModel';
import { CatalogView } from './components/views/CatalogView';
import { ModalView } from './components/views/ModalView';
import { BasketModel } from './components/models/BasketModel';
import { BasketView } from './components/views/BasketView';
import { OrderView, PaymentType } from './components/views/OrderView';
import { AppState } from './components/models/AppState';
import { ContactView } from './components/views/ContactView';
import { SuccessModal } from './components/views/SuccessModal';

import { Api } from './components/common/api';

const api = new Api(API_URL);
const appState = new AppState(api);

const catalogModel = new CatalogModel();
const catalogView = new CatalogView('.gallery');
const modalView = new ModalView();
const basketModel = new BasketModel();
const basketView = new BasketView();
const successModal = new SuccessModal();

function getCategoryClass(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'софт-скил': 'soft',
    'хард-скил': 'hard',
    'другое': 'other',
    'дополнительное': 'additional',
    'кнопка': 'button'
  };
  return `card__category_${categoryMap[category.toLowerCase()] || 'other'}`;
}

function renderProductModal(product: IProduct): string {
  const template = document.getElementById('card-preview') as HTMLTemplateElement;
  if (!template) throw new Error('Шаблон предпросмотра товара не найден');

  const node = template.content.firstElementChild!.cloneNode(true) as HTMLElement;

  (node.querySelector('.card__image') as HTMLImageElement).src = `${CDN_URL}/${product.image}`;
  (node.querySelector('.card__image') as HTMLImageElement).alt = product.title;
  const categoryElement = node.querySelector('.card__category');
  if (categoryElement) {
    categoryElement.textContent = product.category;
    categoryElement.className = `card__category ${getCategoryClass(product.category)}`;
  }
  const titleElement = node.querySelector('.card__title');
  if (titleElement) {
    titleElement.textContent = product.title;
    (titleElement as HTMLElement).style.textAlign = 'left';
  }
  (node.querySelector('.card__text')).textContent = product.description;
  (node.querySelector('.card__price')).textContent = formatPrice(product.price);

  return node.outerHTML;
}

function onProductsLoaded(products: IProductAPI[]) {
  catalogModel.setProducts(products);
  catalogView.render(products);
}

function updateBasketCounter() {
  const counter = document.querySelector('.header__basket-counter');
  if (counter) {
    counter.textContent = basketModel.getItems().length.toString();
  }
}

catalogView.onProductClick((productId) => {
  const product = catalogModel.getProductById(productId);
  if (product) {
    const modalHTML = renderProductModal(product);
    modalView.open(modalHTML);

    const addButton = document.querySelector('.card__button');
    if (addButton) {
      if (product.price === null || product.price === undefined) {
        addButton.setAttribute('disabled', 'true');
        addButton.textContent = 'Бесценно';
      } else {
        addButton.addEventListener('click', () => {
          basketModel.addItem(product);
          modalView.close();
          updateBasketCounter();
        }, { once: true });
      }
    }
  }
});

document.querySelector('.header__basket')?.addEventListener('click', () => {
  const items = basketModel.getItems();
  const totalPrice = items.reduce((acc, item) => acc + item.price, 0);
  basketView.render(items, totalPrice);
});

basketView.setDeleteHandler((id: string) => {
  basketModel.removeItem(id);
  updateBasketCounter();
  const items = basketModel.getItems();
  const totalPrice = items.reduce((acc, item) => acc + item.price, 0);
  basketView.render(items, totalPrice);
});

basketView.setOrderHandler(() => {
  modalView.open(renderOrderForm());
  const orderView = new OrderView();

  orderView.onPaymentChange = (payment) => {
    appState.setPayment(payment);
  };

  orderView.onAddressInput = (address) => {
    appState.setAddress(address);
  };

  appState.on<{ payment: PaymentType }>('payment:changed', ({ payment }) => {
    orderView.setPaymentVisual(payment);
  });

  appState.on<Record<string, string>>('formErrors:changed', (errors) => {
    orderView.setErrors(errors);
  });

  appState.on('form:validate', () => {
    orderView.toggleSubmit(appState.isPaymentValid());
  });

  appState.on('address:changed', () => {
    orderView.toggleSubmit(appState.isPaymentValid());
  });

  orderView.onSubmit = () => {
    if (appState.isPaymentValid()) {
      modalView.open(renderContactForm());
      const contactView = new ContactView();

      contactView.onContactsInput = (contacts) => {
        appState.setContacts(contacts);
      };

      appState.on<Record<string, string>>('formErrors:changed', (errors) => {
        contactView.setErrors(errors);
      });

      appState.on('contacts:validate', () => {
        contactView.toggleSubmit(appState.isContactsValid());
      });

      contactView.onSubmit = () => {
        if (appState.isContactsValid()) {
          const items = basketModel.getItems().map(item => item.id);
          const totalPrice = basketModel.getItems().reduce((acc, item) => acc + item.price, 0);

          appState.sendOrder(items, totalPrice)
            .then(() => {
              basketModel.clear?.();
              appState.clearOrder();
              updateBasketCounter();
              successModal.show(totalPrice);
            })
            .catch(console.error);
        }
      };
    }
  };
});

function renderOrderForm(): string {
  const template = document.getElementById('order') as HTMLTemplateElement;
  if (!template) throw new Error('Шаблон формы заказа не найден');
  return template.content.firstElementChild!.outerHTML;
}

function renderContactForm(): string {
  const template = document.getElementById('contacts') as HTMLTemplateElement;
  if (!template) throw new Error('Шаблон формы контактов не найден');
  return template.content.firstElementChild!.outerHTML;
}

api.get('/product/')
  .then((res: { total: number, items: IProductAPI[] }) => {
    onProductsLoaded(res.items);
  })
  .catch((err) => {
    alert('Ошибка загрузки товаров: ' + err);
  });

document.querySelectorAll('.modal').forEach(modal => {
  modal.classList.remove('modal_active');
});