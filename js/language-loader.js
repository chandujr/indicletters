class LanguageLoader {
  constructor() {
    this.data = null;
    this.language = this.getLanguageFromURL();
  }

  getLanguageFromURL() {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang");

    if (!lang) {
      // Default to kannada if no parameter
      window.location.search = "?lang=kannada";
      return "kannada";
    }

    return lang;
  }

  async load() {
    try {
      const response = await fetch(`languages/${this.language}.json`);
      if (!response.ok) throw new Error(`Language ${this.language} not found`);

      this.data = await response.json();
      this.render();
    } catch (error) {
      console.error(`Failed to load ${this.language}:`, error);
      this.showError();
    }
  }

  render() {
    // Update page metadata
    this.updatePageMetadata();

    // Load appropriate font
    this.loadScriptFont();

    // Render tables
    this.renderAlphabetTable();
    this.renderConjunctTable();
  }

  updatePageMetadata() {
    document.title = `${this.data.language} Varnamale - Learn ${this.data.language} Alphabets`;
    document.getElementById("native-name").textContent = this.data.nativeName;
    document.getElementById(
      "language-name"
    ).textContent = `${this.data.language} Varnamale`;
  }

  loadScriptFont() {
    const fontMap = {
      kannada:
        "https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada&display=swap",
      tamil:
        "https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil&display=swap",
      malayalam:
        "https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam&display=swap",
      telugu:
        "https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu&display=swap",
      devanagari:
        "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari&display=swap",
      gurmukhi:
        "https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi&display=swap",
    };

    const fontLink = document.getElementById("script-font");
    if (fontMap[this.language]) {
      fontLink.href = fontMap[this.language];
    }
  }

  renderAlphabetTable() {
    const header = document.getElementById("alphabet-header");
    const body = document.getElementById("alphabet-body");

    // Clear existing content
    header.innerHTML = "";
    body.innerHTML = "";

    // Use virama from JSON data
    const virama = this.data.virama || { symbol: "◌್", name: "virāma" }; // Fallback for older JSON files

    // Build header with vowels
    let headerHTML = `<tr><th>${virama.symbol}<br><span>(${virama.name})</span></th>`;

    this.data.vowels.forEach((vowel) => {
      headerHTML += `<th>${vowel.symbol}<br><span>(${vowel.transliteration})</span></th>`;
    });
    headerHTML += "</tr>";
    header.innerHTML = headerHTML;

    // Build body with consonant-vowel combinations
    this.data.consonants.forEach((consonant, index) => {
      const row = document.createElement("tr");
      if (index % 2 === 0) row.classList.add("even-row");

      // Base consonant with virama
      row.innerHTML = `
            <td>
                <div class="script-char">${consonant.symbol}${virama.symbol}</div>
                <div class="latin-sub">${consonant.base}</div>
            </td>
        `;

      // Combinations with vowels
      this.data.vowels.forEach((vowel) => {
        const combination = consonant.symbol + vowel.diacritic;
        row.innerHTML += `
                <td>
                    <div class="script-char">${combination}</div>
                    <div class="latin-sub">${consonant.base}${vowel.transliteration}</div>
                </td>
            `;
      });

      body.appendChild(row);
    });
  }

  renderConjunctTable() {
    const body = document.getElementById("conjunct-body");
    body.innerHTML = "";

    this.data.conjuncts.forEach((conjunct) => {
      const row = document.createElement("tr");

      // Auto-generate if no result provided
      const result = conjunct.result || conjunct.first + conjunct.second;

      row.innerHTML = `
            <td>${conjunct.first} + ${conjunct.second}</td>
            <td class="script-char">${result}</td>
            <td>${conjunct.transliteration}</td>
        `;
      body.appendChild(row);
    });
  }

  showError() {
    document.body.innerHTML = `
            <div class="error-container">
                <h1>Language Not Found</h1>
                <p>The requested language is not available yet.</p>
                <a href="index.html" class="back-link">← Back to Languages</a>
            </div>
        `;
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const loader = new LanguageLoader();
  loader.load();
});
