// ===== THEME MANAGEMENT =====
const themeManager = {
  init() {
    this.toggle = document.getElementById("theme-toggle");
    this.body = document.body;
    this.savedTheme = localStorage.getItem("theme") || "light";

    this.applyTheme(this.savedTheme);
    this.toggle?.addEventListener("click", () => this.toggleTheme());
  },

  applyTheme(theme) {
    if (theme === "dark") {
      this.body.classList.add("dark-theme");
      this.updateIcon("☀️");
    } else {
      this.body.classList.remove("dark-theme");
      this.updateIcon("🌙");
    }
  },

  toggleTheme() {
    const isDark = this.body.classList.contains("dark-theme");
    const newTheme = isDark ? "light" : "dark";

    this.applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  },

  updateIcon(icon) {
    if (this.toggle) this.toggle.textContent = icon;
  },
};

// ===== NAVIGATION =====
const navigation = {
  init() {
    // Language card clicks
    document.querySelectorAll(".language-card[data-lang]").forEach((card) => {
      card.addEventListener("click", (e) =>
        this.handleLanguageClick(e.currentTarget.dataset.lang)
      );
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => this.handleKeyboard(e));
  },

  handleLanguageClick(language) {
    if (["kannada", "tamil"].includes(language)) {
      window.location.href = `language.html?lang=${language}`;
    } else {
      this.showComingSoon(language);
    }
  },

  showComingSoon(language) {
    const langName = language.charAt(0).toUpperCase() + language.slice(1);
    alert(`${langName} script is coming soon!`);
  },

  handleKeyboard(e) {
    // Alt + H for home (only on language pages)
    if (
      e.altKey &&
      e.key === "h" &&
      !document.body.classList.contains("landing-page")
    ) {
      const homeButton = document.querySelector(".home-button");
      homeButton?.click();
    }
  },
};

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  themeManager.init();
  navigation.init();
});
