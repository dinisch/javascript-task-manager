const STORAGE_KEY = "taskflow.tasks";

const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const searchInput = document.querySelector("#search-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const clearCompletedBtn = document.querySelector("#clear-completed");
const filterButtons = [...document.querySelectorAll(".filter-btn")];

const totalCount = document.querySelector("#total-count");
const activeCount = document.querySelector("#active-count");
const completedCount = document.querySelector("#completed-count");

let tasks = loadTasks();
let currentFilter = "all";
let searchTerm = "";

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTask(title) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: title.trim(),
    completed: false,
    createdAt: Date.now()
  };
}

function addTask(title) {
  if (!title.trim()) return;
  tasks.unshift(createTask(title));
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
}

function getVisibleTasks() {
  return tasks.filter(task => {
    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "active" && !task.completed) ||
      (currentFilter === "completed" && task.completed);

    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });
}

function renderStats() {
  totalCount.textContent = tasks.length;
  activeCount.textContent = tasks.filter(task => !task.completed).length;
  completedCount.textContent = tasks.filter(task => task.completed).length;
}

function render() {
  const visibleTasks = getVisibleTasks();
  taskList.innerHTML = "";

  visibleTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-item${task.completed ? " completed" : ""}`;

    const check = document.createElement("button");
    check.type = "button";
    check.className = "check-btn";
    check.setAttribute("aria-label", task.completed ? "Mark as active" : "Mark as completed");
    check.textContent = task.completed ? "✓" : "";
    check.addEventListener("click", () => toggleTask(task.id));

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "icon-btn";
    remove.setAttribute("aria-label", `Delete ${task.title}`);
    remove.textContent = "Delete";
    remove.addEventListener("click", () => deleteTask(task.id));

    li.append(check, title, remove);
    taskList.appendChild(li);
  });

  emptyState.classList.toggle("visible", visibleTasks.length === 0);
  clearCompletedBtn.disabled = !tasks.some(task => task.completed);
  renderStats();
}

form.addEventListener("submit", event => {
  event.preventDefault();
  addTask(input.value);
  input.value = "";
  input.focus();
});

searchInput.addEventListener("input", event => {
  searchTerm = event.target.value;
  render();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(btn => btn.classList.toggle("active", btn === button));
    render();
  });
});

clearCompletedBtn.addEventListener("click", clearCompleted);

render();
