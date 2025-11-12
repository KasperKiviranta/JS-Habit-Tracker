// === Habit Tracker App ===

// DOM elements
const form = document.getElementById("habit-form");
const habitNameInput = document.getElementById("habit-name");
const rowsContainer = document.getElementById("rows");
const weekRange = document.getElementById("week-range");
const exportBtn = document.getElementById("export-json");
const importInput = document.getElementById("import-json");
const resetBtn = document.getElementById("reset-all");

// Local storage key
const STORAGE_KEY = "habit-tracker-data";

// State
let habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// --- Helpers ---
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function getCurrentWeekDates() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  const format = d => d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  return `${format(start)} – ${format(today)}`;
}

function calculateStreak(days) {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i]) streak++;
    else break;
  }
  return streak;
}

// --- Rendering ---
function render() {
  rowsContainer.innerHTML = "";
  weekRange.textContent = getCurrentWeekDates();

  habits.forEach((habit, i) => {
    const row = document.createElement("div");
    row.style.display = "grid";
    row.style.gridTemplateColumns = "1.6fr repeat(7,.9fr) .8fr 1fr";
    row.style.alignItems = "center";
    row.style.borderBottom = "1px solid #eef2f6";

    // Habit name
    const nameCell = document.createElement("div");
    nameCell.textContent = habit.name;
    nameCell.style.padding = "10px";
    nameCell.style.fontWeight = "500";
    nameCell.style.color = "#0b3b58";
    row.appendChild(nameCell);

    // Day cells
    habit.days.forEach((done, dayIndex) => {
        const cell = document.createElement("button");
        cell.style.width = "40px";
        cell.style.height = "40px";
        cell.style.margin = "4px 0 4px 6px";
        cell.style.display = "flex";
        cell.style.alignItems = "center";
        cell.style.justifyContent = "center";
        cell.style.border = "1px solid #dbe7f0";
        cell.style.cursor = "pointer";
        cell.style.background = done ? "#00bfff" : "#fff";
        cell.style.borderRadius = "8px";
        cell.style.transition = "background .2s, transform .1s";
        cell.setAttribute("aria-label", `Toggle day ${dayIndex + 1}`);

        cell.addEventListener("click", () => toggleDay(i, dayIndex));
        row.appendChild(cell);
    });

    // Streak
    const streakCell = document.createElement("div");
    streakCell.textContent = calculateStreak(habit.days);
    streakCell.style.padding = "10px";
    streakCell.style.textAlign = "center";
    row.appendChild(streakCell);

    // Delete button
    const deleteCell = document.createElement("div");
    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.style.border = "none";
    delBtn.style.background = "transparent";
    delBtn.style.cursor = "pointer";
    delBtn.style.fontSize = "1.1rem";
    delBtn.addEventListener("click", () => deleteHabit(i));
    deleteCell.appendChild(delBtn);
    deleteCell.style.textAlign = "center";
    row.appendChild(deleteCell);

    rowsContainer.appendChild(row);
  });
}

// --- Logic ---
function addHabit(name) {
  habits.push({
    name,
    days: Array(7).fill(false)
  });
  saveData();
  render();
}

function toggleDay(habitIndex, dayIndex) {
  habits[habitIndex].days[dayIndex] = !habits[habitIndex].days[dayIndex];
  saveData();
  render();
}

function deleteHabit(index) {
  habits.splice(index, 1);
  saveData();
  render();
}

// --- Events ---
form.addEventListener("submit", e => {
  e.preventDefault();
  const name = habitNameInput.value.trim();
  if (!name) return;
  addHabit(name);
  habitNameInput.value = "";
});

exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(habits, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "habits.json";
  a.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = event => {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        habits = imported;
        saveData();
        render();
      }
    } catch {
      alert("Invalid JSON file");
    }
  };
  reader.readAsText(file);
});

resetBtn.addEventListener("click", () => {
  if (confirm("Reset all habits?")) {
    habits = [];
    saveData();
    render();
  }
});

// --- Init ---
render();
