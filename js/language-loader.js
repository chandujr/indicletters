var currLang = "";
const loadLanguage = async () => {
  currLang = new URLSearchParams(location.search).get("lang") || "kannada";

  try {
    const data = await fetch(`languages/${currLang}.json`).then((r) => r.json());

    document.title = `${data.language} Letters`;
    document.getElementById("native-name").textContent = data.nativeName;

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
      `
        )
        .join("")}
    </tr>
  `
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
  `
    )
    .join("");

  hideLoader();
  assignClickFunction();
};

const hideLoader = () => {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.add("hidden");
};

function assignClickFunction() {
  const comboLetters = document.querySelectorAll(".script-char");

  comboLetters.forEach((button) => {
    button.addEventListener("click", (event) => {
      let letter = event.currentTarget.dataset.letter;
      let translit = event.currentTarget.dataset.translit;
      if (letter) showWritingPad(letter, translit, currLang);
    });
  });
}

document.addEventListener("DOMContentLoaded", loadLanguage);
