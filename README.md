# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
## Архитектура

Архитектура построена по принципу MVP с применением событийно-ориентированного подхода и паттерна «Наблюдатель» через класс EventEmitter.

Структура слоёв:
- Model — отвечает за хранение и управление состоянием приложения. Хранит данные товаров, корзины, состояния заказов и выбранного товара
- View — отображает данные на странице. Не взаимодействует с другими представлениями напрямую. Все взаимодействия через события
- Presenter — реализован в index.ts и управляет связью между Model и View с помощью событий и колбэков

### Базовые классы

EventEmitter – класс для генерации и обработки событий приложения. 

Функции:
- on(event, callback) — подписка на событие
- emit(event, data) — генерация события
- trigger(event) — возвращает функцию-генератор событий

### Модели данных

#### CatalogModel

Хранит массив товаров, полученных с сервера. Предоставляет методы:
- setItems(items) — установка массива товаров
- getItemById(id) — поиск товара по ID

BasketModel

Хранит список товаров, добавленных в корзину. Методы:
- addItem(item) — добавляет товар в корзину
- removeItem(id) — удаляет товар
- clear() — очищает корзину

#### AppState

Универсальная модель, которая координирует работу с каталогом, корзиной, выбранным товаром и текущими формами заказа.

Методы:
- setPreview(item) — установка выбранного товара для детального просмотра
- setOrderDetails(order) — сохранение формы заказа
- reset() — очистка состояния после успешной покупки

### Компоненты представления (View)

#### Modal

Универсальный контейнер для отображения модального окна. Отвечает за:
- отображение любых вложенных компонентов
- закрытие по клику или кнопке

#### Card

Представление товара. В зависимости от шаблона может использоваться:
- в каталоге
- в корзине
- в модальном окне с подробностями

#### Catalog

Главная галерея товаров. Получает массив Card и отображает их на странице.

#### Basket

Модальное окно корзины с товарами. Показывает список товаров и сумму.

#### OrderForm

Модальное окно с формой оформления заказа (адрес, email, телефон). Проверяет валидность введённых данных.

#### Success

Компонент отображения успешного оформления заказа.

### События

Используются генерируемые события, управляющиеся через EventEmitter.

## События

| Название события         | Источник           | Обработчик (где)       | Действие |
|--------------------------|--------------------|-------------------------|----------|
| `card:select`            | `Card`             | `AppState.setPreview`   | Устанавливает выбранную карточку |
| `preview:change`         | `AppState`         | `Modal.render`          | Показывает карточку в модалке |
| `basket:changed`         | `AppState`         | `Basket.render`         | Обновляет содержимое корзины |
| `form:submit`            | `OrderForm`        | `AppState.setOrder`     | Устанавливает заказ |
| `order:ready`            | `AppState`         | `ContactsForm.render`   | Показывает второй шаг формы |
| `contacts:submit`        | `ContactsForm`     | `AppState.setContacts`  | Устанавливает контакты |
| `order:complete`         | `AppState`         | `Success.render`        | Показывает сообщение об успехе |


### Взаимодействие между слоями

Пример: пользователь кликает на карточку товара
	1.	Card (View) вызывает событие card:select с данными товара.
	2.	index.ts (Presenter) подписан на это событие, вызывает AppState.setPreview(item).
	3.	AppState (Model) вызывает emit('preview:change', item).
	4.	index.ts (Presenter) обрабатывает событие preview:change и вызывает Modal.render(cardView) с карточкой товара.

### Типы данных

#### Интерфейсы API

export interface IProduct {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: number;
}

#### Интерфейсы модели

export interface IAppState {
  catalog: IProduct[];
  basket: IProduct[];
  preview: IProduct | null;
  order: IOrder | null;
}

#### Интерфейсы формы заказа

export interface IOrderForm {
  payment: 'online' | 'offline';
  address: string;
}

export interface IContactsForm {
  email: string;
  phone: string;
}

export interface IOrder extends IOrderForm, IContactsForm {}

#### Интерфейсы отображения

export interface IView<T> {
  render(data: T): HTMLElement;
  clear?(): void;
}