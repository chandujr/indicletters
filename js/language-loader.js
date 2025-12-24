var currLang = "";
var languageData = null;
var currentTab = "vowels-basic";
var currentLetterInfo = null;

const loadLanguage = async () => {
  currLang = new URLSearchParams(location.search).get("lang") || "kannada";

  try {
    const data = await fetch(`languages/${currLang}.json`).then((r) => r.json());
    languageData = data;

    document.title = `${data.language} Letters`;
    document.getElementById("lang-name").textContent = `${data.nativeName} • ${data.language}`;

    renderTables(data);
  } catch {
    document.body.innerHTML = `
      <div style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);text-align: center;width: 100%;">
      <h1>Language Not Found</h1>
      <p class="subtitle">The requested language is not available yet.</p><br/><br/>
      <a href="./">← Back to Languages</a></div>`;
    hideLoader();
  }
};

const renderTables = (data) => {
  const halant = data.halant;

  const header = document.getElementById("alphabet-header");
  const body = document.getElementById("alphabet-body");

  header.innerHTML =
    `<tr><th>${halant.symbol}<br><span>(${halant.name})</span></th>` +
    data.vowels.map((v) => `<th>${v.symbol}<br><span>(${v.transliteration})</span></th>`).join("") +
    "</tr>";

  body.innerHTML = data.consonants
    .map(
      (c) => `
    <tr ${c.hl == 1 ? 'class="row-highlight"' : ""}>
      <td>
        <div class="script-char" data-letter="${c.symbol}${halant.symbol}">${c.symbol}${halant.symbol}</div>
        <div class="latin-sub">${c.base}</div>
      </td>
      ${data.vowels
        .map(
          (v) => `
        <td>
          <div class="script-char" data-letter="${c.symbol}${v.diacritic}" data-translit=${c.base}${v.transliteration}>${c.symbol}${v.diacritic}</div>
          <div class="latin-sub">${c.base}${v.transliteration}</div>
        </td>
      `,
        )
        .join("")}
    </tr>
  `,
    )
    .join("");

  document.getElementById("vowels-basic-body").innerHTML = data.vowels
    .map(
      (v) => `
    <tr>
      <td>
        <div class="script-char" data-letter="${v.symbol}" data-translit="${v.transliteration}">${v.symbol}</div>
      </td>
      <td class="latin-sub">${v.transliteration}</td>
    </tr>
  `,
    )
    .join("");

  document.getElementById("conjunct-body").innerHTML = data.conjuncts
    .map(
      (c) => `
    <tr ${c.hl == 1 ? 'class="row-highlight"' : ""}>
      <td>${c.first} + ${c.second}</td>
      <td class="script-char" data-letter="${c.first + c.second}" data-translit=${c.transliteration}>${
        c.first + c.second
      }</td>
      <td class="latin-sub">${c.transliteration}</td>
    </tr>
  `,
    )
    .join("");

  hideLoader();
  assignClickFunction();
  setupTabs();
  showHintToast();
};

const showHintToast = () => {
  // Check if this is the first visit
  const hasVisitedBefore = localStorage.getItem("indicletters-visited");
  if (!hasVisitedBefore) {
    setTimeout(() => {
      showToast("Tap on any letter to practice writing it!", "☝️");
      localStorage.setItem("indicletters-visited", "true");
    }, 3000);
  }
};

const hideLoader = () => {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.add("hidden");
};

const setupTabs = () => {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tab;

      // Remove active class from all buttons and panes
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabPanes.forEach((pane) => pane.classList.remove("active"));

      // Add active class to clicked button and corresponding pane
      button.classList.add("active");
      document.getElementById(`${targetTab}-tab`).classList.add("active");

      // Update current tab
      currentTab = targetTab;
    });
  });
};

function assignClickFunction() {
  const comboLetters = document.querySelectorAll(".script-char");

  comboLetters.forEach((button) => {
    button.addEventListener("click", (event) => {
      let letter = event.currentTarget.dataset.letter;
      let translit = event.currentTarget.dataset.translit;
      if (letter) {
        // Find which table this letter belongs to and its position
        const tableRow = event.currentTarget.closest("tr");
        const tableBody = tableRow.closest("tbody");
        const tableId = tableBody.id;

        // Determine the section and position
        if (tableId === "vowels-basic-body") {
          const rowIndex = Array.from(tableBody.children).indexOf(tableRow);
          currentLetterInfo = {
            section: "vowels-basic",
            index: rowIndex,
          };
        } else if (tableId === "alphabet-body") {
          const rowIndex = Array.from(tableBody.children).indexOf(tableRow);
          const cellIndex = Array.from(tableRow.children).indexOf(event.currentTarget.closest("td"));
          currentLetterInfo = {
            section: "vowels",
            rowIndex: rowIndex,
            cellIndex: cellIndex,
          };
        } else if (tableId === "conjunct-body") {
          const rowIndex = Array.from(tableBody.children).indexOf(tableRow);
          currentLetterInfo = {
            section: "conjuncts",
            index: rowIndex,
          };
        }

        showWritingPad(letter, translit, currLang);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", loadLanguage);
