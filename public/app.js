// DOM Elements
const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const tasksList = document.getElementById("tasksList");
const taskCount = document.getElementById("taskCount");
const filterButtons = document.querySelectorAll(".filter-btn");

// Modal Elements
const editModal = document.getElementById("editModal");
const editTaskInput = document.getElementById("editTaskInput");
const saveEditButton = document.getElementById("saveEditButton");
const cancelEditButton = document.getElementById("cancelEditButton");

let currentEditTaskId = null;

// Current filter
let currentFilter = "all";

// Event Listeners
document.addEventListener("DOMContentLoaded", fetchTasks);

addButton.addEventListener("click", addTask);
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    setActiveFilter(filter);
    renderTasks();
  });
});

// Event Listeners for Modal
saveEditButton.addEventListener("click", () => {
  const newText = editTaskInput.value.trim();
  if (newText !== "") {
    editTask(currentEditTaskId, newText);
    closeModal();
  }
});

cancelEditButton.addEventListener("click", closeModal);

function openModal(task) {
  currentEditTaskId = task.id;
  editTaskInput.value = task.text;
  editModal.style.display = "block";
}

function closeModal() {
  editModal.style.display = "none";
  currentEditTaskId = null;
}

// API Functions
async function fetchTasks() {
  try {
    const response = await fetch("http://localhost:3000/api/tasks");
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    const tasks = await response.json();
    saveTasks(tasks);
    renderTasks();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    // If API is not available, try to load from localStorage
    renderTasks();
  }
}

async function addTask() {
  const text = taskInput.value.trim();
  if (text === "") return;

  const newTask = {
    id: Date.now().toString(),
    text: text,
    completed: false,
  };

  try {
    const response = await fetch("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });

    if (!response.ok) {
      throw new Error("Failed to add task");
    }

    const createdTask = await response.json();
    const tasks = getTasks();
    tasks.push(createdTask);
    saveTasks(tasks);

    taskInput.value = "";
    renderTasks();
  } catch (error) {
    console.error("Error adding task:", error);
    // Fallback to localStorage if API is not available
    const tasks = getTasks();
    tasks.push(newTask);
    saveTasks(tasks);

    taskInput.value = "";
    renderTasks();
  }
}

async function deleteTask(id) {
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete task");
    }

    const tasks = getTasks().filter((task) => task.id !== id);
    saveTasks(tasks);
    renderTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
    // Fallback to localStorage
    const tasks = getTasks().filter((task) => task.id !== id);
    saveTasks(tasks);
    renderTasks();
  }
}

async function toggleTaskStatus(id) {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex !== -1) {
    tasks[taskIndex].completed = !tasks[taskIndex].completed;

    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tasks[taskIndex]),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      saveTasks(tasks);
      renderTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      // Fallback to localStorage
      saveTasks(tasks);
      renderTasks();
    }
  }
}

async function editTask(id, newText) {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex !== -1) {
    tasks[taskIndex].text = newText;

    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tasks[taskIndex]),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      saveTasks(tasks);
      renderTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      // Fallback to localStorage
      saveTasks(tasks);
      renderTasks();
    }
  }
}

// Helper Functions
function getTasks() {
  const tasksJSON = localStorage.getItem("tasks");
  return tasksJSON ? JSON.parse(tasksJSON) : [];
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function setActiveFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach((button) => {
    if (button.dataset.filter === filter) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

function renderTasks() {
  const tasks = getTasks();

  // Filter tasks based on current filter
  let filteredTasks;
  if (currentFilter === "active") {
    filteredTasks = tasks.filter((task) => !task.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter((task) => task.completed);
  } else {
    filteredTasks = tasks;
  }

  // Clear current tasks
  tasksList.innerHTML = "";

  // Render filtered tasks
  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTaskStatus(task.id));

    const span = document.createElement("span");
    span.className = task.completed ? "task-text completed" : "task-text";
    span.textContent = task.text;

    const editButton = document.createElement("button");
    editButton.className = "material-icons task-edit";
    editButton.innerHTML = "edit";
    editButton.addEventListener("click", () => openModal(task));

    const deleteButton = document.createElement("button");
    deleteButton.className = "material-icons task-delete";
    deleteButton.innerHTML = "delete";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editButton);
    li.appendChild(deleteButton);

    tasksList.appendChild(li);
  });

  // Update task count
  const activeTasks = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = activeTasks;
}
