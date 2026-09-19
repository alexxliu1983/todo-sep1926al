const STORAGE_KEY = 'todo-tasks';
const THEME_KEY = 'todo-theme';
const PRIORITIES = ['high', 'medium', 'low'];
const UNDO_MS = 6000;

const form = document.getElementById('add-form');
const input = document.getElementById('new-task');
const dueDateInput = document.getElementById('new-due-date');
const prioritySelect = document.getElementById('new-priority');
const searchInput = document.getElementById('search');
const list = document.getElementById('task-list');
const counter = document.getElementById('counter');
const filterButtons = document.querySelectorAll('#filters button');
const clearDoneButton = document.getElementById('clear-done');
const undoBar = document.getElementById('undo-bar');
const undoMessage = document.getElementById('undo-message');
const undoButton = document.getElementById('undo-button');
const themeToggle = document.getElementById('theme-toggle');

let tasks = load();
let filter = 'all';
let query = '';
let editingId = null;
let removed = []; // [{ task, index }] from the last delete, for undo
let undoTimer = null;

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(data)) return [];
    // tasks saved before priorities existed default to medium; tasks without due dates stay null
    return data.map(t => ({
      ...t,
      priority: PRIORITIES.includes(t.priority) ? t.priority : 'medium',
      dueDate: t.dueDate || null
    }));
  } catch {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // storage unavailable; tasks stay in memory for this session
  }
}

function getDueDateStatus(dueDate) {
  if (!dueDate) return 'none';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffMs = due - today;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays <= 7) return 'upcoming';
  return 'later';
}

function visibleTasks() {
  const q = query.trim().toLowerCase();
  return tasks
    .filter(t => filter === 'all' || (filter === 'done') === t.done)
    .filter(t => t.text.toLowerCase().includes(q))
    .sort((a, b) => {
      const aStatus = getDueDateStatus(a.dueDate);
      const bStatus = getDueDateStatus(b.dueDate);
      const dueDateOrder = { 'overdue': 0, 'today': 1, 'upcoming': 2, 'later': 3, 'none': 4 };
      const statusDiff = dueDateOrder[aStatus] - dueDateOrder[bStatus];
      if (statusDiff !== 0) return statusDiff;
      const priorityDiff = PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return 0;
    });
}

function formatDueDate(dueDate) {
  if (!dueDate) return '';
  const date = new Date(dueDate);
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function makeDueDateBadge(task) {
  if (!task.dueDate) return null;
  const badge = document.createElement('span');
  badge.className = 'due-date';
  const status = getDueDateStatus(task.dueDate);
  badge.classList.add(status);
  badge.textContent = formatDueDate(task.dueDate);
  badge.title = status.charAt(0).toUpperCase() + status.slice(1);
  return badge;
}

function makeTextCell(task) {
  if (task.id !== editingId) {
    const text = document.createElement('span');
    text.textContent = task.text;
    text.title = 'Double-click to edit';
    text.addEventListener('dblclick', () => {
      editingId = task.id;
      render();
    });
    return text;
  }

  const edit = document.createElement('input');
  edit.type = 'text';
  edit.className = 'edit-input';
  edit.value = task.text;
  edit.setAttribute('aria-label', 'Edit task');
  let finished = false;
  const finish = commit => {
    if (finished) return;
    finished = true;
    const value = edit.value.trim();
    if (commit && value) {
      task.text = value;
      save();
    }
    editingId = null;
    render();
  };
  edit.addEventListener('keydown', e => {
    if (e.key === 'Enter') finish(true);
    else if (e.key === 'Escape') finish(false);
  });
  edit.addEventListener('blur', () => finish(true));
  return edit;
}

function render() {
  list.innerHTML = '';
  const shown = visibleTasks();

  for (const task of shown) {
    const li = document.createElement('li');
    li.classList.add('priority-' + task.priority);
    if (task.done) li.classList.add('done');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', 'Mark done');
    checkbox.addEventListener('change', () => {
      task.done = checkbox.checked;
      save();
      render();
    });

    const text = makeTextCell(task);
    const dueDateBadge = makeDueDateBadge(task);

    const priority = document.createElement('select');
    priority.setAttribute('aria-label', 'Priority');
    for (const p of PRIORITIES) {
      const option = document.createElement('option');
      option.value = p;
      option.textContent = p[0].toUpperCase() + p.slice(1);
      option.selected = p === task.priority;
      priority.appendChild(option);
    }
    priority.addEventListener('change', () => {
      if (PRIORITIES.includes(priority.value)) {
        task.priority = priority.value;
        save();
        render();
      }
    });

    const meta = document.createElement('div');
    meta.className = 'task-meta';
    if (dueDateBadge) meta.appendChild(dueDateBadge);
    meta.appendChild(priority);

    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.addEventListener('click', () => removeTasks([task], 'Task deleted'));

    li.append(checkbox, text, meta, del);
    list.appendChild(li);
  }

  if (shown.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = tasks.length === 0 ? 'No tasks yet. Add one above.' : 'No matching tasks.';
    list.appendChild(empty);
  }

  const left = tasks.filter(t => !t.done).length;
  counter.textContent = left + (left === 1 ? ' task left' : ' tasks left');
  clearDoneButton.disabled = !tasks.some(t => t.done);
  for (const b of filterButtons) {
    b.setAttribute('aria-pressed', String(b.dataset.filter === filter));
  }

  const editor = list.querySelector('.edit-input');
  if (editor) {
    editor.focus();
    editor.select();
  }
}

// Undo: remember what was removed and where, so it goes back in the same place
function removeTasks(toRemove, message) {
  removed = toRemove.map(task => ({ task, index: tasks.indexOf(task) }));
  tasks = tasks.filter(t => !toRemove.includes(t));
  save();
  render();
  showUndo(message);
}

function showUndo(message) {
  undoMessage.textContent = message;
  undoBar.hidden = false;
  clearTimeout(undoTimer);
  undoTimer = setTimeout(hideUndo, UNDO_MS);
}

function hideUndo() {
  undoBar.hidden = true;
  removed = [];
  clearTimeout(undoTimer);
}

undoButton.addEventListener('click', () => {
  // ascending order puts each task back at its original index
  for (const { task, index } of [...removed].sort((a, b) => a.index - b.index)) {
    tasks.splice(index, 0, task);
  }
  hideUndo();
  save();
  render();
});

clearDoneButton.addEventListener('click', () => {
  const done = tasks.filter(t => t.done);
  if (done.length) removeTasks(done, done.length === 1 ? '1 completed task cleared' : done.length + ' completed tasks cleared');
});

for (const b of filterButtons) {
  b.addEventListener('click', () => {
    filter = b.dataset.filter;
    render();
  });
}

searchInput.addEventListener('input', () => {
  query = searchInput.value;
  render();
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.push({
    id: Date.now(),
    text,
    done: false,
    priority: prioritySelect.value,
    dueDate: dueDateInput.value || null
  });
  input.value = '';
  dueDateInput.value = '';
  save();
  render();
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  // Cmd/Ctrl+K to focus search
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
    return;
  }

  // Only handle shortcuts if not editing
  if (editingId !== null) return;

  // 1, 2, 3 to change priority of focused/first task
  if (e.key === '1' || e.key === '2' || e.key === '3') {
    const priorities = ['high', 'medium', 'low'];
    const idx = parseInt(e.key) - 1;
    const shown = visibleTasks();
    if (shown.length > 0) {
      shown[0].priority = priorities[idx];
      save();
      render();
    }
    return;
  }

  // Cmd/Ctrl+Enter to add task
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (input === document.activeElement && input.value.trim()) {
      form.dispatchEvent(new Event('submit'));
    }
    return;
  }

  // Escape to focus task input
  if (e.key === 'Escape') {
    if (document.activeElement !== input) {
      input.focus();
    }
  }
});

// Dark mode: use the saved choice, otherwise follow the system setting
function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
  } catch {
    // ignore
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  // the icon shows the mode you will switch to
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label', label);
  themeToggle.title = label;
}

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // ignore
  }
});

applyTheme(loadTheme());
render();
