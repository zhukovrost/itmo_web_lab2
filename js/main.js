'use strict';

// Константы

const FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
];
const SORT_OPTIONS = [
  { value: 'default', label: 'По умолчанию' },
  { value: 'date-asc', label: 'Сначала с ранней датой' },
  { value: 'date-desc', label: 'Сначала с поздней датой' },
];

// Шапка

const app = document.createElement('div');
app.className = 'app';

const header = document.createElement('header');
header.className = 'app__header';

const heading = document.createElement('div');
heading.className = 'app__heading';

const pageTitle = document.createElement('h1');
pageTitle.className = 'app__title';
pageTitle.textContent = 'Мои задачи';

const subtitle = document.createElement('p');
subtitle.className = 'app__subtitle';
subtitle.textContent = 'Планируйте день и отмечайте выполненное.';

heading.append(pageTitle, subtitle);

const counter = document.createElement('p');
counter.className = 'app__counter';
counter.textContent = 'Задач нет';

header.append(heading, counter);

// Форма

const formPanel = document.createElement('section');
formPanel.className = 'panel';

const form = document.createElement('form');
form.className = 'task-form';
form.noValidate = true;

const titleField = document.createElement('div');
titleField.className = 'field';

const titleLabel = document.createElement('label');
titleLabel.className = 'field__label';
titleLabel.htmlFor = 'task-title';
titleLabel.textContent = 'Название';

const titleInput = document.createElement('input');
titleInput.className = 'input';
titleInput.id = 'task-title';
titleInput.type = 'text';
titleInput.name = 'title';
titleInput.maxLength = 200;
titleInput.placeholder = 'Например, подготовить отчёт';
titleInput.autocomplete = 'off';
titleInput.setAttribute('aria-describedby', 'form-error');

titleField.append(titleLabel, titleInput);

const dateField = document.createElement('div');
dateField.className = 'field';

const dateLabel = document.createElement('label');
dateLabel.className = 'field__label';
dateLabel.htmlFor = 'task-date';
dateLabel.textContent = 'Дата';

const dateInput = document.createElement('input');
dateInput.className = 'input';
dateInput.id = 'task-date';
dateInput.type = 'date';
dateInput.name = 'date';

dateField.append(dateLabel, dateInput);

const submitButton = document.createElement('button');
submitButton.className = 'btn btn--primary';
submitButton.type = 'submit';
submitButton.textContent = 'Добавить';

const formError = document.createElement('p');
formError.className = 'form__error';
formError.id = 'form-error';
formError.setAttribute('role', 'alert');
formError.hidden = true;

form.append(titleField, dateField, submitButton, formError);
formPanel.append(form);

const toolbarPanel = document.createElement('section');
toolbarPanel.className = 'panel';

const toolbar = document.createElement('div');
toolbar.className = 'toolbar';

const searchField = document.createElement('div');
searchField.className = 'field';

const searchLabel = document.createElement('label');
searchLabel.className = 'field__label';
searchLabel.htmlFor = 'task-search';
searchLabel.textContent = 'Поиск';

const searchInput = document.createElement('input');
searchInput.className = 'input';
searchInput.id = 'task-search';
searchInput.type = 'search';
searchInput.placeholder = 'Поиск по названию';
searchInput.autocomplete = 'off';

searchField.append(searchLabel, searchInput);

const filterField = document.createElement('div');
filterField.className = 'field';

const filterLabel = document.createElement('span');
filterLabel.className = 'field__label';
filterLabel.textContent = 'Статус';

const filters = document.createElement('div');
filters.className = 'filters';
filters.setAttribute('role', 'group');
filters.setAttribute('aria-label', 'Фильтр по статусу');

const filterButtons = FILTERS.map((filter) => {
  const button = document.createElement('button');
  button.className = 'filters__btn';
  button.type = 'button';
  button.dataset.filter = filter.value;
  button.textContent = filter.label;
  button.setAttribute('aria-pressed', String(filter.value === 'all'));
  return button;
});

filters.append(...filterButtons);
filterField.append(filterLabel, filters);

const sortField = document.createElement('div');
sortField.className = 'field';

const sortLabel = document.createElement('label');
sortLabel.className = 'field__label';
sortLabel.htmlFor = 'task-sort';
sortLabel.textContent = 'Сортировка';

const sortSelect = document.createElement('select');
sortSelect.className = 'input';
sortSelect.id = 'task-sort';

SORT_OPTIONS.forEach((option) => {
  const item = document.createElement('option');
  item.value = option.value;
  item.textContent = option.label;
  sortSelect.append(item);
});

sortField.append(sortLabel, sortSelect);
toolbar.append(searchField, filterField, sortField);
toolbarPanel.append(toolbar);

// Список задач

const listPanel = document.createElement('section');
listPanel.className = 'panel';

const emptyState = document.createElement('p');
emptyState.className = 'empty-state';

const emptyTitle = document.createElement('span');
emptyTitle.className = 'empty-state__title';
emptyTitle.textContent = 'Пока задач нет';

const emptyText = document.createElement('span');
emptyText.className = 'empty-state__text';
emptyText.textContent = 'Добавьте первую задачу — она появится в этом списке.';

emptyState.append(emptyTitle, emptyText);

const list = document.createElement('ul');
list.className = 'task-list';
list.id = 'task-list';
list.setAttribute('aria-label', 'Список задач');

listPanel.append(emptyState, list);

// Сборка страницы

const announcer = document.createElement('p');
announcer.className = 'visually-hidden';
announcer.setAttribute('role', 'status');
announcer.setAttribute('aria-live', 'polite');
announcer.setAttribute('aria-atomic', 'true');

const main = document.createElement('main');
main.className = 'app__main';
main.append(formPanel, toolbarPanel, listPanel);

app.append(header, main, announcer);

document.body.append(app);
document.title = 'Мои задачи — ToDo-лист';

// Заглушка до следующего этапа: форма пока не должна перезагружать страницу.
form.addEventListener('submit', (event) => {
  event.preventDefault();
});
