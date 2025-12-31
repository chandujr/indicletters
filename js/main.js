if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => console.log("Service Worker registered:", reg))
      .catch((err) => console.log("Service Worker registration failed:", err));
  });
}

// Toast message
function showToast(msg, icon) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  const msgToast = document.getElementById("toast-message");
  if (!msgToast || !msg) return;
  msgToast.textContent = msg;

  const iconToast = document.getElementById("toast-icon");
  if (!iconToast || !icon) return;
  iconToast.textContent = icon;

  // Remove the hidden class to show the toast
  toast.classList.remove("hidden");

  // Hide the toast after 5 seconds
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 5000);

  // Also hide if user clicks on it
  toast.addEventListener("click", () => {
    toast.classList.add("hidden");
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
        if (["tamil", "malayalam", "kannada", "telugu", "marathi", "odia"].includes(lang)) {
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

  // Blank board button (only on language page)
  const blankBoardButton = document.getElementById("blank-board-button");
  if (blankBoardButton) {
    blankBoardButton.addEventListener("click", () => {
      addButtonAnimation(blankBoardButton);
      // Short delay to show animation before opening blank pad
      setTimeout(() => {
        if (typeof showBlankWritingPad === "function") {
          showBlankWritingPad();
        }
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

// Cookie Consent Handler
function initCookieConsent() {
  const COOKIE_CONSENT_KEY = "cookie_consent";
  const cookieBanner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("cookie-accept");
  const declineBtn = document.getElementById("cookie-decline");
  const adsScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');

  if (!cookieBanner) return;

  // Check if user has already made a choice
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);

  if (consent === "accepted" && adsScript) {
    // If accepted, the ads script is already in head
  } else if (consent === "declined") {
    // Remove ads script if declined
    if (adsScript) {
      adsScript.remove();
    }
  } else {
    // Show banner if no choice made
    cookieBanner.classList.remove("hidden");

    // Remove ads script temporarily until user consents
    if (adsScript) {
      adsScript.remove();
    }
  }

  // Handle Accept
  if (acceptBtn) {
    acceptBtn.addEventListener("click", function () {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
      cookieBanner.classList.add("hidden");

      // Load Google Ads script
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1292852975196451";
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    });
  }

  // Handle Decline
  if (declineBtn) {
    declineBtn.addEventListener("click", function () {
      localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
      cookieBanner.classList.add("hidden");
    });
  }
}

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavigation();
  initCookieConsent();
});

// Watch for color scheme change
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (e.matches !== isDark()) toggleTheme();
});
