const theme = {
  init() {
    const saved = localStorage.theme || "light";
    this.apply(saved);
    document
      .getElementById("theme-toggle")
      ?.addEventListener("click", () => this.toggle());
  },

  apply(theme) {
    document.body.classList.toggle("dark", theme === "dark");
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
  },

  toggle() {
    const isDark = document.body.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";
    this.apply(newTheme);
    localStorage.theme = newTheme;
  },
};

const nav = {
  init() {
    // Language card clicks
    document.querySelectorAll(".language-card[data-lang]").forEach((card) => {
      card.addEventListener("click", () => this.handleCard(card.dataset.lang));
    });

    // Home button
    document.getElementById("home-button")?.addEventListener("click", () => {
      location.href = "index.html";
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (
        e.altKey &&
        e.key === "h" &&
        !document.body.classList.contains("landing-page")
      ) {
        location.href = "index.html";
      }
    });
  },

  handleCard(lang) {
    if (["kannada", "tamil", "malayalam"].includes(lang)) {
      location.href = `language.html?lang=${lang}`;
    }
  },
};

document.addEventListener("DOMContentLoaded", () => {
  theme.init();
  nav.init();
});
