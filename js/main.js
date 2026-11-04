'use strict';

// Константы разметки
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

// Состояние
const STORAGE_KEY = 'todo.tasks.v1';
let tasks = loadTasks();
let editingId = null;
let currentFilter = 'all';
let searchQuery = '';
let sortMode = 'default';

// Хранилище
function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(data)
      ? data.filter((task) => task && typeof task.title === 'string')
      : [];
  } catch (error) {
    console.warn('Не удалось прочитать задачи:', error);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.warn('Не удалось сохранить задачи:', error);
  }
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

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

// Панель управления
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

// Список
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

const announcer = document.createElement('p');
announcer.className = 'visually-hidden';
announcer.setAttribute('role', 'status');
announcer.setAttribute('aria-live', 'polite');
announcer.setAttribute('aria-atomic', 'true');

const main = document.createElement('main');
main.className = 'app__main';
main.append(formPanel, toolbarPanel, listPanel);

app.append(header, main, announcer);

// Отрисовка
function formatDate(isoDate) {
  const parts = isoDate.split('-');
  return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : isoDate;
}

function getVisibleTasks() {
  const query = searchQuery.trim().toLowerCase();

  const visible = tasks.filter((task) => {
    const byStatus =
      currentFilter === 'all' ||
      (currentFilter === 'active' && !task.completed) ||
      (currentFilter === 'completed' && task.completed);
    return byStatus && task.title.toLowerCase().includes(query);
  });

  if (sortMode !== 'default') {
    visible.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return sortMode === 'date-asc'
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date);
    });
  }

  return visible;
}

function render() {
  const visibleTasks = getVisibleTasks();

  list.replaceChildren();
  visibleTasks.forEach((task) => {
    list.append(task.id === editingId ? createEditItem(task) : createTaskItem(task));
  });

  const completedCount = tasks.filter((task) => task.completed).length;
  counter.textContent = tasks.length
    ? `Задач: ${tasks.length} · выполнено: ${completedCount}`
    : 'Задач нет';
  emptyState.hidden = visibleTasks.length > 0;
  emptyTitle.textContent = tasks.length === 0 ? 'Пока задач нет' : 'Ничего не найдено';
  emptyText.textContent =
    tasks.length === 0
      ? 'Добавьте первую задачу — она появится в этом списке.'
      : 'Измените запрос или фильтр.';
}

function createTaskItem(task) {
  const item = document.createElement('li');
  item.className = task.completed ? 'task task--completed' : 'task';
  item.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.className = 'task__checkbox';
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute(
    'aria-label',
    task.completed
      ? `Вернуть задачу «${task.title}» в работу`
      : `Отметить задачу «${task.title}» выполненной`,
  );
  checkbox.addEventListener('change', () => toggleTask(task.id));

  const content = document.createElement('div');
  content.className = 'task__content';

  const taskTitle = document.createElement('span');
  taskTitle.className = 'task__title';
  taskTitle.textContent = task.title;
  content.append(taskTitle);

  if (task.date) {
    const taskDate = document.createElement('time');
    taskDate.className = 'task__date';
    taskDate.dateTime = task.date;
    taskDate.textContent = formatDate(task.date);
    content.append(taskDate);
  }

  const actions = document.createElement('div');
  actions.className = 'task__actions';

  const editButton = document.createElement('button');
  editButton.className = 'btn btn--ghost';
  editButton.type = 'button';
  editButton.textContent = 'Изменить';
  editButton.addEventListener('click', () => startEdit(task.id));

  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn btn--ghost task__delete';
  deleteButton.type = 'button';
  deleteButton.textContent = 'Удалить';
  deleteButton.addEventListener('click', () => deleteTask(task.id));

  actions.append(editButton, deleteButton);
  item.append(checkbox, content, actions);
  return item;
}

function createEditItem(task) {
  const item = document.createElement('li');
  item.className = 'task task--editing';
  item.dataset.id = task.id;

  const editForm = document.createElement('form');
  editForm.className = 'task__edit';

  const editTitle = document.createElement('input');
  editTitle.className = 'input';
  editTitle.type = 'text';
  editTitle.value = task.title;
  editTitle.maxLength = 200;
  editTitle.setAttribute('aria-label', 'Название задачи');

  const editDate = document.createElement('input');
  editDate.className = 'input';
  editDate.type = 'date';
  editDate.value = task.date || '';
  editDate.setAttribute('aria-label', 'Дата задачи');

  const saveButton = document.createElement('button');
  saveButton.className = 'btn btn--primary';
  saveButton.type = 'submit';
  saveButton.textContent = 'Сохранить';

  const cancelButton = document.createElement('button');
  cancelButton.className = 'btn btn--ghost';
  cancelButton.type = 'button';
  cancelButton.textContent = 'Отмена';
  cancelButton.addEventListener('click', cancelEdit);

  const editError = document.createElement('p');
  editError.className = 'form__error';
  editError.hidden = true;
  editError.setAttribute('role', 'alert');

  editForm.append(editTitle, editDate, saveButton, cancelButton, editError);

  editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const newTitle = editTitle.value.trim();

    if (!newTitle) {
      editError.textContent = 'Название не может быть пустым.';
      editError.hidden = false;
      editTitle.focus();
      return;
    }

    updateTask(task.id, { title: newTitle, date: editDate.value });
    editingId = null;
    render();
    focusTask(task.id);
    announce('Задача сохранена.');
  });

  editForm.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit();
    }
  });

  item.append(editForm);
  return item;
}

function focusTask(id) {
  const item = [...list.children].find((node) => node.dataset.id === id);
  if (!item) return;

  const target = item.querySelector('.task__checkbox') || item.querySelector('button');
  if (target) target.focus();
}

// Действия
function addTask(event) {
  event.preventDefault();
  const value = titleInput.value.trim();

  if (!value) {
    formError.textContent = 'Введите название задачи.';
    formError.hidden = false;
    titleInput.setAttribute('aria-invalid', 'true');
    titleInput.focus();
    return;
  }

  formError.hidden = true;
  titleInput.removeAttribute('aria-invalid');

  tasks.push({
    id: createId(),
    title: value,
    date: dateInput.value,
    completed: false,
    createdAt: Date.now(),
  });

  saveTasks();
  form.reset();
  titleInput.focus();
  render();
  announce('Задача добавлена.');
}

function startEdit(id) {
  editingId = id;
  render();

  const item = [...list.children].find((node) => node.dataset.id === id);
  const input = item && item.querySelector('input[type="text"]');
  if (input) {
    input.focus();
    input.select();
  }
}

function cancelEdit() {
  editingId = null;
  render();
  announce('Редактирование отменено.');
}

function updateTask(id, changes) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;

  Object.assign(task, changes);
  saveTasks();
}

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;

  task.completed = !task.completed;
  saveTasks();
  render();
  focusTask(id);
  announce(task.completed ? 'Задача выполнена.' : 'Задача снова активна.');
}

function deleteTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;

  if (!window.confirm(`Удалить задачу «${task.title}»?`)) return;

  tasks = tasks.filter((item) => item.id !== id);
  if (editingId === id) editingId = null;

  saveTasks();
  render();
  announce('Задача удалена.');
}

function announce(message) {
  announcer.textContent = '';
  window.setTimeout(() => {
    announcer.textContent = message;
  }, 50);
}

// События
form.addEventListener('submit', addTask);

titleInput.addEventListener('input', () => {
  formError.hidden = true;
  titleInput.removeAttribute('aria-invalid');
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    render();
  });
});

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  render();
});

sortSelect.addEventListener('change', () => {
  sortMode = sortSelect.value;
  render();
});

// Запуск
document.body.append(app);
document.title = 'Мои задачи — ToDo-лист';
render();
