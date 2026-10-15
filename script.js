const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');
const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const taskCount = document.querySelector('#task-count');
const allCount = document.querySelector('#all-count');
const progressLabel = document.querySelector('#progress-label');
const progressBar = document.querySelector('#progress-bar');
const filterButtons = document.querySelectorAll('.filter-button');
const clearCompletedButton = document.querySelector('#clear-completed');
const todayDate = document.querySelector('#today-date');

let tasks = [];
let currentFilter = 'all';

try {
  tasks = JSON.parse(localStorage.getItem('daymark-tasks')) || [];
} catch (error) {
  tasks = [];
}

function saveTasks() {
  localStorage.setItem('daymark-tasks', JSON.stringify(tasks));
}

function showTodayDate() {
  const date = new Date();
  todayDate.textContent = date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });
}

function updateProgress() {
  const completedTasks = tasks.filter(function (task) {
    return task.completed;
  }).length;
  const percent = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  taskCount.textContent = tasks.length;
  allCount.textContent = tasks.length;
  progressLabel.textContent = percent + '%';
  progressBar.style.width = percent + '%';
}

function renderTasks() {
  taskList.innerHTML = '';

  const visibleTasks = tasks.filter(function (task) {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  visibleTasks.forEach(function (task) {
    const item = document.createElement('li');
    item.className = 'task-item' + (task.completed ? ' completed' : '');

    const toggleButton = document.createElement('button');
    toggleButton.className = 'task-toggle';
    toggleButton.type = 'button';
    toggleButton.setAttribute('aria-label', task.completed ? 'Mark task as not completed' : 'Complete task');
    if (task.completed) {
      const checkIcon = document.createElement('i');
      checkIcon.className = 'fa-solid fa-check';
      toggleButton.appendChild(checkIcon);
    }
    toggleButton.addEventListener('click', function () {
      tasks = tasks.map(function (item) {
        if (item.id === task.id) item.completed = !item.completed;
        return item;
      });
      saveTasks();
      renderTasks();
    });

    const name = document.createElement('span');
    name.className = 'task-name';
    name.textContent = task.name;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-task';
    deleteButton.type = 'button';
    deleteButton.setAttribute('aria-label', 'Delete ' + task.name);
    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fa-regular fa-trash-can';
    deleteButton.appendChild(deleteIcon);
    deleteButton.addEventListener('click', function () {
      tasks = tasks.filter(function (item) { return item.id !== task.id; });
      saveTasks();
      renderTasks();
    });

    item.append(toggleButton, name, deleteButton);
    taskList.appendChild(item);
  });

  emptyState.hidden = visibleTasks.length > 0;
  if (tasks.length > 0 && visibleTasks.length === 0) {
    emptyState.querySelector('strong').textContent = currentFilter === 'completed' ? 'Nothing completed just yet' : 'You are all caught up';
    emptyState.querySelector('p').textContent = currentFilter === 'completed' ? 'Complete a task and it will show up here.' : 'Enjoy the space, or add another task above.';
  } else {
    emptyState.querySelector('strong').textContent = 'A little space for a fresh start';
    emptyState.querySelector('p').textContent = 'Add your first task above and take it from there.';
  }

  updateProgress();
}

taskForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const name = taskInput.value.trim();
  if (!name) {
    taskInput.focus();
    return;
  }

  tasks.unshift({ id: Date.now(), name: name, completed: false });
  currentFilter = 'all';
  filterButtons.forEach(function (button) {
    button.classList.toggle('active', button.dataset.filter === 'all');
  });
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
});

filterButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(function (item) {
      item.classList.toggle('active', item === button);
    });
    renderTasks();
  });
});

clearCompletedButton.addEventListener('click', function () {
  tasks = tasks.filter(function (task) { return !task.completed; });
  saveTasks();
  renderTasks();
});

menuButton.addEventListener('click', function () {
  const isOpen = navLinks.classList.toggle('show');
  menuButton.setAttribute('aria-expanded', isOpen);
  menuButton.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
});

navLinks.querySelectorAll('a').forEach(function (link) {
  link.addEventListener('click', function () {
    navLinks.classList.remove('show');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.innerHTML = '<i class="fa-solid fa-bars"></i>';
  });
});

showTodayDate();
renderTasks();


// Personalization: color themes, live clock, focus timer, daily thought and saved focus.
const themeSelect = document.querySelector('#theme-select');
const savedTheme = localStorage.getItem('daymark-theme') || 'lavender';
document.documentElement.dataset.theme = savedTheme;
if (themeSelect) themeSelect.value = savedTheme;
themeSelect?.addEventListener('change', function () {
  document.documentElement.dataset.theme = this.value;
  localStorage.setItem('daymark-theme', this.value);
});

const liveClock = document.querySelector('#live-clock');
const clockDate = document.querySelector('#clock-date');
function updateClock() {
  const now = new Date();
  if (liveClock) liveClock.textContent = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true});
  if (clockDate) clockDate.textContent = now.toLocaleDateString([], {weekday:'long', month:'short', day:'numeric', year:'numeric'});
}
updateClock();
setInterval(updateClock, 1000);

const timerDisplay = document.querySelector('#timer-display');
const timerStart = document.querySelector('#timer-start');
const timerReset = document.querySelector('#timer-reset');
const timerMode = document.querySelector('#timer-mode');
const timerModeButtons = document.querySelectorAll('.timer-mode-button');
const customTimerForm = document.querySelector('#custom-timer-form');
const customMinutesInput = document.querySelector('#custom-minutes');
const timerHint = document.querySelector('#timer-hint');
let timerDuration = 25 * 60;
let timerRemaining = timerDuration;
let timerInterval = null;
let timerRunning = false;
let timerFinished = false;
let timerEndAt = 0;

function renderTimer() {
  const mins = Math.floor(timerRemaining / 60).toString().padStart(2, '0');
  const secs = (timerRemaining % 60).toString().padStart(2, '0');
  if (timerDisplay) timerDisplay.textContent = mins + ':' + secs;
  if (timerStart) {
    timerStart.innerHTML = timerRunning
      ? '<i class="fa-solid fa-pause"></i> Pause timer'
      : timerFinished
        ? '<i class="fa-solid fa-check"></i> Session complete'
        : '<i class="fa-solid fa-play"></i> Start timer';
    timerStart.disabled = timerFinished;
  }
  document.title = timerRunning ? mins + ':' + secs + ' · Daymark' : 'Daymark — Your day, with clarity';
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  renderTimer();
}

function finishTimer() {
  stopTimer();
  timerRemaining = 0;
  timerFinished = true;
  renderTimer();
  if ('Notification' in window && Notification.permission === 'granted') {
    try { new Notification('Daymark', { body: 'Your timer is complete. Take a breath.' }); } catch (error) {}
  }
}

function tickTimer() {
  // Derive the remaining time from the end timestamp so background tabs do not slow the timer.
  timerRemaining = Math.max(0, Math.ceil((timerEndAt - Date.now()) / 1000));
  if (timerRemaining <= 0) {
    finishTimer();
    return;
  }
  renderTimer();
}

function startTimer() {
  if (timerFinished || timerRemaining <= 0) return;
  if (timerRunning) {
    stopTimer();
    return;
  }
  timerRunning = true;
  timerEndAt = Date.now() + timerRemaining * 1000;
  renderTimer();
  timerInterval = setInterval(tickTimer, 250);
}

function setTimer(minutes, mode) {
  stopTimer();
  timerDuration = minutes * 60;
  timerRemaining = timerDuration;
  timerFinished = false;
  if (timerMode) timerMode.textContent = mode;
  timerModeButtons.forEach(function (button) {
    button.classList.toggle('active', Number(button.dataset.minutes) === minutes);
  });
  if (customMinutesInput) customMinutesInput.value = String(minutes);
  if (timerHint) {
    timerHint.textContent = 'Choose from 1 to 180 minutes.';
    timerHint.classList.remove('error');
  }
  renderTimer();
}

timerStart?.addEventListener('click', startTimer);
timerReset?.addEventListener('click', function () {
  stopTimer();
  timerRemaining = timerDuration;
  timerFinished = false;
  renderTimer();
});
timerModeButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    setTimer(Number(button.dataset.minutes), button.dataset.mode);
  });
});
customTimerForm?.addEventListener('submit', function (event) {
  event.preventDefault();
  const minutes = Number(customMinutesInput.value);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) {
    timerHint.textContent = 'Enter a whole number from 1 to 180.';
    timerHint.classList.add('error');
    customMinutesInput.focus();
    return;
  }
  setTimer(minutes, 'CUSTOM');
  if (timerHint) timerHint.textContent = 'Your custom timer is ready.';
});
renderTimer();

const quotes = [
  'You don\'t have to do everything. Just the next right thing.',
  'Progress is still progress, even when it is quiet.',
  'Make the plan simple enough to actually live it.',
  'A little focus can change the shape of your whole day.',
  'Start where you are. Use what you have. Do what you can.',
  'Rest is part of the process, not a reward for finishing.',
  'Done with care beats perfect in your imagination.'
];
const quoteText = document.querySelector('#daily-quote');
document.querySelector('#new-quote')?.addEventListener('click', function () {
  let next = quotes[Math.floor(Math.random() * quotes.length)];
  if (quoteText && quotes.length > 1) while (next === quoteText.textContent) next = quotes[Math.floor(Math.random() * quotes.length)];
  if (quoteText) { quoteText.animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}], {duration:260}); quoteText.textContent = next; }
});
const focusInput = document.querySelector('#focus-input');
if (focusInput) {
  focusInput.value = localStorage.getItem('daymark-focus') || '';
  focusInput.addEventListener('input', function () { localStorage.setItem('daymark-focus', focusInput.value); });
}

// Reveal sections gently as they enter view; keeps the page usable without animation support.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealItems = document.querySelectorAll('.section-heading, .planner-copy, .planner-app, .steps article');
  revealItems.forEach(function (item) { item.classList.add('reveal-ready'); });
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
    });
  }, {threshold:0.12});
  revealItems.forEach(function (item) { revealObserver.observe(item); });
}
