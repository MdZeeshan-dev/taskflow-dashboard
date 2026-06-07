const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

const categorySelect = document.getElementById("categorySelect");
const prioritySelect = document.getElementById("prioritySelect");
const dueDateInput = document.getElementById("dueDate");

const searchInput = document.getElementById("searchInput");

const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const pendingTasksEl = document.getElementById("pendingTasks");

const clearAllBtn = document.getElementById("clearAllBtn");

const filterBtns = document.querySelectorAll(".filter-btn");

const emptyMessage = document.getElementById("emptyMessage");

const darkBtn = document.getElementById("darkModeToggle");

const toast = document.getElementById("toast");

let tasks = [];

let currentFilter = "all";

const loadTasks = () => {
  const data = localStorage.getItem("taskflowTasks");

  if (data) {
    tasks = JSON.parse(data);
  }
};

const saveTasks = () => {
  localStorage.setItem("taskflowTasks", JSON.stringify(tasks));
};

const showToast = (message) => {
  toast.textContent = message;

  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2000);
};

addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();

  if (!text) {
    showToast("Please enter a task");

    return;
  }

  const task = {
    id: Date.now(),

    text,

    category: categorySelect.value,

    priority: prioritySelect.value,

    dueDate: dueDateInput.value,

    completed: false,

    createdAt: new Date().toLocaleString(),
  };

  tasks.push(task);

  saveTasks();

  renderTasks();

  showToast("Task added");

  taskInput.value = "";

  dueDateInput.value = "";
});

const renderTasks = () => {
  taskList.innerHTML = "";

  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === "pending") return !task.completed;

    if (currentFilter === "completed") return task.completed;

    return true;
  });

  emptyMessage.style.display = filteredTasks.length ? "none" : "block";

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");

    let dueStyle = "";

    if (task.dueDate) {
      const today = new Date().toISOString().split("T")[0];

      if (task.dueDate < today) dueStyle = "color:red;";
      else if (task.dueDate === today) dueStyle = "color:orange;";
    }

    li.innerHTML = `

        <div>

            <input type="checkbox" class="complete-checkbox" data-id="${task.id}" ${task.completed ? "checked" : ""}>

            <strong style="${task.completed ? "text-decoration:line-through;opacity:0.6;" : ""}">

                ${task.text}

            </strong>

            <br>

            <small>Category: ${task.category}</small><br>

            <small>Priority: ${task.priority}</small><br>

            <small style="${dueStyle}">Due: ${task.dueDate || "None"}</small>

        </div>

        <div>

            <button class="edit-btn" data-id="${task.id}">Edit</button>

            <button class="delete-btn" data-id="${task.id}">Delete</button>

        </div>

        `;

    taskList.appendChild(li);
  });

  updateStats();
};

const updateStats = () => {
  const total = tasks.length;

  const completed = tasks.filter((task) => task.completed).length;

  const pending = total - completed;

  totalTasksEl.textContent = total;

  completedTasksEl.textContent = completed;

  pendingTasksEl.textContent = pending;
};

taskList.addEventListener("click", (e) => {
  const id = Number(e.target.dataset.id);

  if (e.target.classList.contains("delete-btn")) {
    if (!confirm("Delete this task?")) return;

    tasks = tasks.filter((task) => task.id !== id);

    saveTasks();

    renderTasks();

    showToast("Task deleted");
  }

  if (e.target.classList.contains("edit-btn")) {
    const newText = prompt("Edit task");

    if (!newText) return;

    const task = tasks.find((task) => task.id === id);

    if (task) {
      task.text = newText;

      saveTasks();

      renderTasks();

      showToast("Task updated");
    }
  }
});

taskList.addEventListener("change", (e) => {
  if (e.target.classList.contains("complete-checkbox")) {
    const id = Number(e.target.dataset.id);

    const task = tasks.find((task) => task.id === id);

    if (task) {
      task.completed = e.target.checked;

      saveTasks();

      renderTasks();
    }
  }
});

searchInput.addEventListener("keyup", () => {
  const value = searchInput.value.toLowerCase();

  const items = taskList.querySelectorAll("li");

  items.forEach((item) => {
    item.style.display = item.innerText.toLowerCase().includes(value)
      ? ""
      : "none";
  });
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;

    renderTasks();
  });
});

clearAllBtn.addEventListener("click", () => {
  if (!confirm("Clear all tasks?")) return;

  tasks = [];

  saveTasks();

  renderTasks();

  showToast("All tasks cleared");
});

const savedMode = localStorage.getItem("taskflowDarkMode");

if (savedMode === "on") {
  document.documentElement.classList.add("dark");

  darkBtn.textContent = "☀️";
}

darkBtn.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");

  const isDark = document.documentElement.classList.contains("dark");

  localStorage.setItem("taskflowDarkMode", isDark ? "on" : "off");

  darkBtn.textContent = isDark ? "☀️" : "🌙";
});

loadTasks();

renderTasks();
