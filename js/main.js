if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => console.log("Service Worker registered:", reg))
      .catch((err) => console.log("Service Worker registration failed:", err));
  });
}

// Simple scale animation function
function addButtonAnimation(button) {
  button.classList.add("scale-down");
  setTimeout(() => {
    button.classList.remove("scale-down");
  }, 150);
}

// Theme functionality
function initTheme() {
  const savedTheme = localStorage.theme || "light";
  applyTheme(savedTheme);
  document.documentElement.classList.remove("dark");

  const themeButton = document.getElementById("theme-toggle");
  if (themeButton) {
    themeButton.addEventListener("click", () => {
      addButtonAnimation(themeButton);
      // Short delay to show animation before navigation
      setTimeout(() => {
        toggleTheme();
      }, 100);
    });
  }
}

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  const themeButton = document.getElementById("theme-toggle");
  if (themeButton) {
    themeButton.textContent = theme === "dark" ? "☀️" : "🌙";
  }
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";
  applyTheme(newTheme);
  localStorage.theme = newTheme;
}

// Navigation functionality
function initNavigation() {
  // Language cards
  document.querySelectorAll(".language-card[data-lang]").forEach((card) => {
    card.addEventListener("click", () => {
      setTimeout(() => {
        const lang = card.dataset.lang;
        if (["kannada", "tamil", "malayalam"].includes(lang)) {
          location.href = `./language.html?lang=${lang}`;
        }
      }, 100);
    });
  });

  // Home button
  const homeButton = document.getElementById("home-button");
  if (homeButton) {
    homeButton.addEventListener("click", () => {
      addButtonAnimation(homeButton);
      // Short delay to show animation before navigation
      setTimeout(() => {
        location.href = "./";
      }, 100);
    });
  }
}

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavigation();
});
