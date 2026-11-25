
/* =========================
   STUDYSPACE LITE
   Browser-based prototype
========================= */

"use strict";

/* ---------- STORAGE ---------- */

const STORAGE = {
  accounts: "studyspace_accounts",
  session: "studyspace_session",
  theme: "studyspace_theme"
};

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function accounts() {
  return read(STORAGE.accounts, []);
}

function saveAccounts(list) {
  write(STORAGE.accounts, list);
}

function currentSession() {
  return read(STORAGE.session, null);
}

function currentAccount() {
  const session = currentSession();
  if (!session) return null;
  return accounts().find(a => a.id === session.accountId) || null;
}

function saveAccount(account) {
  const list = accounts();
  const index = list.findIndex(a => a.id === account.id);
  if (index === -1) list.push(account);
  else list[index] = account;
  saveAccounts(list);
}

function createId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* ---------- DOM HELPERS ---------- */

const $ = id => document.getElementById(id);

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

let toastTimer;

function toast(message) {
  const element = $("toast");
  element.textContent = message;
  element.classList.remove("hidden");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    element.classList.add("hidden");
  }, 3000);
}

/* ---------- THEMES ---------- */

function applyTheme(theme) {
  theme = theme === "day" ? "day" : "night";

  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE.theme, theme);

  const icon = theme === "day" ? "☀" : "☾";
  const label = theme === "day" ? "Day mode" : "Night mode";

  $("themeIcon").textContent = icon;
  $("themeLabel").textContent = label;
  $("sidebarTheme").title = label;
  $("homeTheme").textContent = icon;
  $("authTheme").textContent = icon;

  document.querySelectorAll("[data-theme-choice]").forEach(button => {
    button.classList.toggle("active", button.dataset.themeChoice === theme);
  });
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  applyTheme(current === "night" ? "day" : "night");
}

$("homeTheme").addEventListener("click", toggleTheme);
$("authTheme").addEventListener("click", toggleTheme);
$("sidebarTheme").addEventListener("click", toggleTheme);

document.querySelectorAll("[data-theme-choice]").forEach(button => {
  button.addEventListener("click", () => {
    applyTheme(button.dataset.themeChoice);
  });
});

/* ---------- VIEW NAVIGATION ---------- */

const views = {
  home: $("homeView"),
  auth: $("authView"),
  app: $("appView")
};

function showView(name) {
  Object.values(views).forEach(view => view.classList.add("hidden"));

  if (name === "home") {
    views.home.classList.remove("hidden");
  } else if (name === "login" || name === "register") {
    views.auth.classList.remove("hidden");
    $("loginFormWrap").classList.toggle("hidden", name !== "login");
    $("registerFormWrap").classList.toggle("hidden", name !== "register");
    clearAuthErrors();
  } else {
    views.app.classList.remove("hidden");
    showPage(name === "app" ? "dashboard" : name);
  }

  $("sidebar").classList.remove("open");
  window.scrollTo(0, 0);
}

function clearAuthErrors() {
  $("loginError").textContent = "";
  $("registerError").textContent = "";
}

document.querySelectorAll("[data-view]").forEach(button => {
  button.addEventListener("click", event => {
    event.preventDefault();
    const target = button.dataset.view;

    if (target === "dashboard") {
      if (currentAccount()) showView("app");
      else showView("login");
    } else {
      showView(target);
    }
  });
});

/* ---------- AUTHENTICATION ---------- */

/* Hash demo passwords with a random salt.
   This is NOT equivalent to server-side password security. */

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(salt + password);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

$("registerForm").addEventListener("submit", async event => {
  event.preventDefault();
  $("registerError").textContent = "";

  const name = $("registerName").value.trim();
  const email = $("registerEmail").value.trim().toLowerCase();
  const password = $("registerPassword").value;
  const confirm = $("registerConfirm").value;

  if (!name) {
    $("registerError").textContent = "Please enter your name.";
    return;
  }

  if (password.length < 8) {
    $("registerError").textContent = "Password must be at least 8 characters.";
    return;
  }

  if (password !== confirm) {
    $("registerError").textContent = "Passwords do not match.";
    return;
  }

  if (!crypto.subtle) {
    $("registerError").textContent =
      "Password hashing is unavailable. Open StudySpace through GitHub Pages or a secure connection.";
    return;
  }

  const list = accounts();

  if (list.some(a => a.email === email)) {
    $("registerError").textContent = "An account with that email already exists.";
    return;
  }

  const salt = createId();
  const passwordHash = await hashPassword(password, salt);

  const account = {
    id: createId(),
    name,
    email,
    passwordHash,
    salt,
    course: "",
    bio: "",
    tasks: [],
    createdAt: new Date().toISOString()
  };

  list.push(account);
  saveAccounts(list);
  write(STORAGE.session, { accountId: account.id });

  $("registerForm").reset();
  toast("Account created.");
  showView("app");
  refreshApp();
});

$("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  $("loginError").textContent = "";

  const email = $("loginEmail").value.trim().toLowerCase();
  const password = $("loginPassword").value;

  const account = accounts().find(a => a.email === email);

  if (!account) {
    $("loginError").textContent = "Invalid email or password.";
    return;
  }

  if (!crypto.subtle) {
    $("loginError").textContent =
      "Password hashing is unavailable. Open StudySpace through GitHub Pages or a secure connection.";
    return;
  }

  const hash = await hashPassword(password, account.salt);

  if (hash !== account.passwordHash) {
    $("loginError").textContent = "Invalid email or password.";
    return;
  }

  write(STORAGE.session, { accountId: account.id });
  $("loginForm").reset();
  toast("Logged in.");
  showView("app");
  refreshApp();
});

$("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE.session);
  toast("Logged out.");
  showView("home");
});

/* ---------- APP NAVIGATION ---------- */

const pages = ["dashboard", "tasks", "profile", "settings"];

const pageLabels = {
  dashboard: "Overview",
  tasks: "My Tasks",
  profile: "My Profile",
  settings: "Settings"
};

function showPage(name) {
  if (!pages.includes(name)) name = "dashboard";

  pages.forEach(page => {
    $(`${page}Page`).classList.toggle("hidden", page !== name);
  });

  document.querySelectorAll(".side-link[data-page]").forEach(button => {
    button.classList.toggle("active", button.dataset.page === name);
  });

  $("pageBreadcrumb").textContent = pageLabels[name];
  $("sidebar").classList.remove("open");
}

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

$("mobileMenu").addEventListener("click", () => {
  $("sidebar").classList.toggle("open");
});

/* ---------- TASK MANAGEMENT ---------- */

function getTasks() {
  return currentAccount()?.tasks || [];
}

function saveTasks(tasks) {
  const account = currentAccount();
  if (!account) return;

  account.tasks = tasks;
  saveAccount(account);
}

function statusLabel(status) {
  return {
    pending: "Pending",
    progress: "In progress",
    completed: "Completed"
  }[status] || "Pending";
}

function statusClass(status) {
  return {
    pending: "status-pending",
    progress: "status-progress",
    completed: "status-completed"
  }[status] || "status-pending";
}

function formatDate(dateString) {
  if (!dateString) return "No due date";

  // Parse as a local date to avoid UTC date shifts.
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function isOverdue(task) {
  if (!task.dueDate || task.status === "completed") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = task.dueDate.split("-").map(Number);
  const due = new Date(year, month - 1, day);

  return due < today;
}

function taskHTML(task, compact = false) {
  const overdue = isOverdue(task);

  return `
    <article class="task-item ${task.status === "completed" ? "completed" : ""}">
      <button
        class="task-check ${task.status === "completed" ? "checked" : ""}"
        data-task-toggle="${escapeHTML(task.id)}"
        aria-label="Toggle task completion"
        title="Toggle completion"
      >${task.status === "completed" ? "✓" : ""}</button>

      <div class="task-main">
        <div class="task-title">${escapeHTML(task.title)}</div>
        ${compact ? "" : task.description
          ? `<div class="task-description">${escapeHTML(task.description)}</div>`
          : ""}
        <div class="task-meta">
          <span class="status-badge ${statusClass(task.status)}">
            ${statusLabel(task.status)}
          </span>
          ${task.dueDate
            ? `<span class="task-date ${overdue ? "overdue" : ""}">
                ${overdue ? "Overdue · " : "Due · "}${formatDate(task.dueDate)}
              </span>`
            : ""}
        </div>
      </div>

      <div class="task-actions">
        <button class="icon-btn" data-task-edit="${escapeHTML(task.id)}" title="Edit task" aria-label="Edit task">✎</button>
        <button class="icon-btn delete" data-task-delete="${escapeHTML(task.id)}" title="Delete task" aria-label="Delete task">×</button>
      </div>
    </article>
  `;
}

function emptyHTML(title, message) {
  return `<div class="empty-state"><strong>${escapeHTML(title)}</strong><p>${escapeHTML(message)}</p></div>`;
}

function renderTasks() {
  const tasks = getTasks();

  const search = $("taskSearch").value.trim().toLowerCase();
  const filter = $("taskFilter").value;
  const sort = $("taskSort").value;

  let filtered = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(search) ||
      (task.description || "").toLowerCase().includes(search);

    const matchesFilter = filter === "all" || task.status === filter;

    return matchesSearch && matchesFilter;
  });

  if (sort === "newest") {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === "oldest") {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sort === "due") {
    filtered.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }

  $("allTasks").innerHTML = filtered.length
    ? filtered.map(task => taskHTML(task)).join("")
    : emptyHTML("No tasks found", search || filter !== "all"
      ? "Try changing your search or filter."
      : "Add a task to start organizing your work.");

  const newest = [...tasks].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  ).slice(0, 4);

  $("recentTasks").innerHTML = newest.length
    ? newest.map(task => taskHTML(task, true)).join("")
    : emptyHTML("Nothing here yet", "Your tasks will appear here.");

  const upcoming = [...tasks]
    .filter(task => task.dueDate && task.status !== "completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  $("upcomingTasks").innerHTML = upcoming.length
    ? upcoming.map(task => taskHTML(task, true)).join("")
    : emptyHTML("No upcoming deadlines", "Tasks with due dates will appear here.");

  renderStats(tasks);
}

function renderStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const progress = tasks.filter(t => t.status === "progress").length;
  const pending = tasks.filter(t => t.status === "pending").length;

  const percent = total ? Math.round(completed / total * 100) : 0;

  $("totalStat").textContent = total;
  $("completedStat").textContent = completed;
  $("progressStat").textContent = progress;
  $("pendingStat").textContent = pending;

  $("progressCompleted").textContent = completed;
  $("progressInProgress").textContent = progress;
  $("progressPending").textContent = pending;
  $("completionPercent").textContent = `${percent}%`;

  $("progressRing").style.background =
    `conic-gradient(var(--accent) ${percent}%, var(--surface-3) ${percent}%)`;
}

function openTaskModal(task = null) {
  $("taskForm").reset();
  $("taskError").textContent = "";
  $("taskId").value = task ? task.id : "";
  $("taskModalTitle").textContent = task ? "Edit task" : "Add a task";
  $("saveTaskBtn").textContent = task ? "Update task" : "Save task";

  if (task) {
    $("taskTitle").value = task.title;
    $("taskDescription").value = task.description || "";
    $("taskDueDate").value = task.dueDate || "";
    $("taskStatus").value = task.status;
  } else {
    $("taskStatus").value = "pending";
  }

  $("taskModal").classList.remove("hidden");
  $("taskTitle").focus();
}

function closeTaskModal() {
  $("taskModal").classList.add("hidden");
}

$("addTaskBtn").addEventListener("click", () => openTaskModal());
$("quickAddBtn").addEventListener("click", () => openTaskModal());
$("closeTaskModal").addEventListener("click", closeTaskModal);
$("cancelTask").addEventListener("click", closeTaskModal);

$("taskModal").addEventListener("click", event => {
  if (event.target === $("taskModal")) closeTaskModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeTaskModal();
});

$("taskForm").addEventListener("submit", event => {
  event.preventDefault();

  const title = $("taskTitle").value.trim();

  if (!title) {
    $("taskError").textContent = "Task title is required.";
    return;
  }

  const tasks = getTasks();
  const id = $("taskId").value;

  if (id) {
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1) return;

    tasks[index] = {
      ...tasks[index],
      title,
      description: $("taskDescription").value.trim(),
      dueDate: $("taskDueDate").value,
      status: $("taskStatus").value,
      updatedAt: new Date().toISOString()
    };
  } else {
    tasks.push({
      id: createId(),
      title,
      description: $("taskDescription").value.trim(),
      dueDate: $("taskDueDate").value,
      status: $("taskStatus").value,
      createdAt: new Date().toISOString()
    });
  }

  saveTasks(tasks);
  closeTaskModal();
  refreshApp();
  toast(id ? "Task updated." : "Task added.");
});

document.addEventListener("click", event => {
  const toggle = event.target.closest("[data-task-toggle]");
  const edit = event.target.closest("[data-task-edit]");
  const remove = event.target.closest("[data-task-delete]");

  if (toggle) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === toggle.dataset.taskToggle);
    if (!task) return;

    task.status = task.status === "completed" ? "pending" : "completed";
    task.updatedAt = new Date().toISOString();

    saveTasks(tasks);
    refreshApp();
    toast(task.status === "completed" ? "Task completed." : "Task reopened.");
  }

  if (edit) {
    const task = getTasks().find(t => t.id === edit.dataset.taskEdit);
    if (task) openTaskModal(task);
  }

  if (remove) {
    const id = remove.dataset.taskDelete;

    if (!confirm("Delete this task? This cannot be undone.")) return;

    saveTasks(getTasks().filter(task => task.id !== id));
    refreshApp();
    toast("Task deleted.");
  }
});

$("taskSearch").addEventListener("input", renderTasks);
$("taskFilter").addEventListener("change", renderTasks);
$("taskSort").addEventListener("change", renderTasks);

/* ---------- PROFILE ---------- */

$("profileForm").addEventListener("submit", event => {
  event.preventDefault();

  const account = currentAccount();
  if (!account) return;

  const name = $("profileName").value.trim();

  if (!name) {
    toast("Name cannot be empty.");
    return;
  }

  account.name = name;
  account.course = $("profileCourse").value.trim();
  account.bio = $("profileBio").value.trim();

  saveAccount(account);
  refreshApp();
  toast("Profile saved.");
});

/* ---------- ACCOUNT DELETION ---------- */

$("deleteAccountBtn").addEventListener("click", () => {
  const account = currentAccount();
  if (!account) return;

  const confirmed = confirm(
    "Delete your demo account and all its tasks from this browser? This cannot be undone."
  );

  if (!confirmed) return;

  saveAccounts(accounts().filter(a => a.id !== account.id));
  localStorage.removeItem(STORAGE.session);

  toast("Account deleted.");
  showView("home");
});

/* ---------- APP REFRESH ---------- */

function refreshApp() {
  const account = currentAccount();
  if (!account) {
    showView("home");
    return;
  }

  const name = account.name || "Student";
  const email = account.email || "";
  const initial = name.trim().charAt(0).toUpperCase() || "S";

  $("sidebarName").textContent = name;
  $("sidebarEmail").textContent = email;
  $("sidebarAvatar").textContent = initial;
  $("headerAvatar").textContent = initial;
  $("profileAvatar").textContent = initial;

  $("welcomeHeading").textContent = `Welcome back, ${name.split(" ")[0]}.`;

  $("profileDisplayName").textContent = name;
  $("profileDisplayEmail").textContent = email;
  $("profileName").value = name;
  $("profileEmail").value = email;
  $("profileCourse").value = account.course || "";
  $("profileBio").value = account.bio || "";

  $("headerDate").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });

  renderTasks();
}

/* ---------- STARTUP ---------- */

(function init() {
  applyTheme(localStorage.getItem(STORAGE.theme) || "night");

  const account = currentAccount();

  if (account) {
    showView("app");
    refreshApp();
  } else {
    showView("home");
  }
})();
