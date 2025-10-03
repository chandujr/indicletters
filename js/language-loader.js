const loadLanguage = async () => {
  const lang = new URLSearchParams(location.search).get("lang") || "kannada";
  const fontUrls = {
    kannada:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada&display=swap",
    tamil:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil&display=swap",
    malayalam:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam&display=swap",
  };

  try {
    const data = await fetch(`languages/${lang}.json`).then((r) => r.json());

    document.title = `${data.language} Varnamala`;
    document.getElementById("native-name").textContent = data.nativeName;
    document.getElementById(
      "language-name"
    ).textContent = `${data.language} Varnamala`;

    if (fontUrls[lang])
      document.getElementById("script-font").href = fontUrls[lang];

    renderTables(data);
  } catch {
    document.body.innerHTML = `
      <div style="text-align:center;padding:50px">
        <h1>Language Not Found</h1>
        <p>The requested language is not available yet.</p>
        <a href="index.html">← Back to Languages</a>
      </div>
    `;
  }
};

const renderTables = (data) => {
  const virama = data.virama || { symbol: "್", name: "virāma" };

  // Alphabet table
  const header = document.getElementById("alphabet-header");
  const body = document.getElementById("alphabet-body");

  header.innerHTML =
    `<tr><th>${virama.symbol}<br><span>(${virama.name})</span></th>` +
    data.vowels
      .map((v) => `<th>${v.symbol}<br><span>(${v.transliteration})</span></th>`)
      .join("") +
    "</tr>";

  body.innerHTML = data.consonants
    .map(
      (c, i) => `
    <tr>
      <td>
        <div class="script-char">${c.symbol}${virama.symbol}</div>
        <div class="latin-sub">${c.base}</div>
      </td>
      ${data.vowels
        .map(
          (v) => `
        <td>
          <div class="script-char">${c.symbol}${v.diacritic}</div>
          <div class="latin-sub">${c.base}${v.transliteration}</div>
        </td>
      `
        )
        .join("")}
    </tr>
  `
    )
    .join("");

  // Conjuncts table
  document.getElementById("conjunct-body").innerHTML = data.conjuncts
    .map(
      (c) => `
    <tr>
      <td>${c.first} + ${c.second}</td>
      <td class="script-char">${c.result || c.first + c.second}</td>
      <td>${c.transliteration}</td>
    </tr>
  `
    )
    .join("");
};

document.addEventListener("DOMContentLoaded", loadLanguage);
