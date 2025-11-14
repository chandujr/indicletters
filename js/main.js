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

const isDark = () => document.body.classList.contains("dark");
const getSystemTheme = () => (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");

// Theme functionality
function initTheme() {
  const sysTheme = getSystemTheme();
  const savedTheme = localStorage.prefTheme === sysTheme ? localStorage.theme || sysTheme : sysTheme;
  localStorage.prefTheme = sysTheme;
  applyTheme(savedTheme);
  document.documentElement.classList.remove("dark");

  const themeButton = document.getElementById("theme-toggle");
  if (themeButton) {
    themeButton.addEventListener("click", () => {
      addButtonAnimation(themeButton);
      // Short delay to show animation before navigation
      setTimeout(() => {
        toggleTheme();
      }, 150);
    });
  }
}

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  const themeButton = document.getElementById("theme-toggle");
  if (themeButton) {
    themeButton.textContent = theme === "dark" ? "☀️" : "🌙";
  }
  localStorage.theme = theme;
}

function toggleTheme() {
  const newTheme = isDark() ? "light" : "dark";
  applyTheme(newTheme);
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
      }, 150);
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
      }, 150);
    });
  }

  // GitHub button
  const githubButton = document.getElementById("github-button");
  if (githubButton) {
    githubButton.addEventListener("click", () => {
      addButtonAnimation(githubButton);
      // Short delay to show animation before opening link
      setTimeout(() => {
        window.open("https://github.com/chandujr/indicletters", "_blank");
      }, 150);
    });
  }

  // brand click returns home too
  const brand = document.querySelector(".site-brand");
  if (brand) {
    brand.addEventListener("click", () => {
      location.href = "./";
    });
  }
}

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavigation();
});

// Watch for color scheme change
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (e.matches !== isDark()) toggleTheme();
});
