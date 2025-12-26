// DOM element references
const writingCanvas = document.getElementById("writing-canvas");
const glyphCanvas = document.getElementById("glyph-canvas");
const writingPad = document.getElementById("writing-pad");
const writingBg = document.getElementById("writing-bg");
const writingPadHeader = document.getElementById("writing-pad-header");
const writingTranslit = document.getElementById("writing-translit");
const navPrevButton = document.querySelector(".nav-prev-button");
const navNextButton = document.querySelector(".nav-next-button");

// Global variables
let currentGlyph = "";
let currFont = "";
let isEraserMode = false; // Track if eraser is active
let originalPenColor = ""; // Store original pen color for restoration

// Font mapping for different languages
const fontNames = {
  tamil: "Noto Sans Tamil",
  malayalam: "Noto Sans Malayalam",
  kannada: "Noto Sans Kannada",
  telugu: "Noto Sans Telugu",
  marathi: "Noto Sans Devanagari",
  odia: "Noto Sans Oriya",
};

// Get computed styles for theme colors
const computedStyles = getComputedStyle(document.body);

// perfect-freehand drawing variables
let isDrawing = false;
let currentPath = [];
let allPaths = [];
let ctx;

// perfect-freehand options for drawing
const freehandOptions = {
  size: 13,
  smoothing: 0.5,
  thinning: 0.5,
  streamline: 0.5,
  easing: (t) => t, // linear
  start: {
    taper: 0,
    cap: true,
  },
  end: {
    taper: 0,
    cap: true,
  },
};

// perfect-freehand options for erasing
const eraserOptions = {
  size: 20,
  smoothing: 0.5,
  thinning: 0.5,
  streamline: 0.5,
  easing: (t) => t, // linear
  start: {
    taper: 0,
    cap: true,
  },
  end: {
    taper: 0,
    cap: true,
  },
};

// Check if PerfectFreehand is loaded and get the getStroke function
let getStroke;
let isPerfectFreehandLoaded = false;

function initializePerfectFreehand() {
  // Try different ways PerfectFreehand might be available
  const pf = window.PerfectFreehand || window["perfect-freehand"] || window.default;

  if (pf && pf.getStroke) {
    getStroke = pf.getStroke;
    isPerfectFreehandLoaded = true;
    return true;
  }
  return false;
}

// Initialize canvas and context
function initializeCanvas() {
  if (!writingCanvas) return;
  ctx = writingCanvas.getContext("2d");
  resizeWritingCanvas();
  setWritingColors();
  renderGlyphCanvas();
}

// Set drawing colors for the canvas
function setWritingColors() {
  if (!ctx || !writingCanvas) return;

  const linearGradient = ctx.createLinearGradient(0, 0, writingCanvas.offsetWidth, 0);
  linearGradient.addColorStop(0.3, computedStyles.getPropertyValue("--primary"));
  linearGradient.addColorStop(0.7, computedStyles.getPropertyValue("--secondary"));
  originalPenColor = linearGradient; // Store the original pen color
  clearCanvas();
}

// Clear the canvas and redraw all paths
function clearCanvas() {
  if (!ctx || !writingCanvas) return;

  ctx.fillStyle = computedStyles.getPropertyValue("--card");
  ctx.fillRect(0, 0, writingCanvas.width, writingCanvas.height);

  // Redraw all paths
  allPaths.forEach((path) => {
    drawPath(path.points, path.color);
  });
}

// Draw a single path using perfect-freehand
function drawPath(points, color, useEraser = false) {
  if (!points || points.length === 0 || !ctx) return;

  // Handle single point (dot) case
  if (points.length === 1) {
    const [x, y] = points[0];
    const size = useEraser ? eraserOptions.size : freehandOptions.size;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
    ctx.fill();
    return;
  }

  const stroke = getStroke(points, useEraser ? eraserOptions : freehandOptions);

  // If we have an empty stroke, don't draw anything
  if (!stroke || stroke.length === 0) return;

  // Create a path from the stroke
  const pathData = getSvgPathFromStroke(stroke);

  // Create a temporary path element
  const path = new Path2D(pathData);

  // Set the fill style
  ctx.fillStyle = color;

  // Draw the path
  ctx.fill(path);
}

// Convert perfect-freehand stroke to SVG path (based on CodePen demo)
function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"],
  );

  d.push("Z");
  return d.join(" ");
}

function showWritingPad(letter, translit, lang) {
  currentGlyph = letter;
  currFont = fontNames[lang];

  writingPadHeader.textContent = "PRACTICE";
  writingTranslit.textContent = translit;
  writingPad.classList.remove("blank-mode");

  // Reset eraser mode when showing regular practice pad
  resetEraserMode();

  // Hide eraser button in regular practice mode
  const eraserButton = document.querySelector(".eraser-button");
  if (eraserButton) {
    eraserButton.style.display = "none";
  }

  updateNavigationButtons();

  writingPad.style.display = "flex";
  writingBg.classList.add("active");
  document.body.style.overflow = "hidden";
  scheduleResize();
  window.addEventListener("resize", scheduleResize);
}

function showBlankWritingPad() {
  writingPadHeader.textContent = "FREE PRACTICE";
  writingTranslit.textContent = "";
  writingPad.classList.add("blank-mode");

  // Reset eraser mode when showing free practice board
  resetEraserMode();

  // Show eraser button in free practice mode
  const eraserButton = document.querySelector(".eraser-button");
  if (eraserButton) {
    eraserButton.style.display = "block";
  }

  hideNavigationButtons();

  writingPad.style.display = "flex";
  writingBg.classList.add("active");
  document.body.style.overflow = "hidden";
  scheduleResize();
  window.addEventListener("resize", scheduleResize);
}

function closeWritingPad() {
  clearWritingCanvas();
  writingPad.style.display = "none";
  writingBg.classList.remove("active");
  document.body.style.overflow = "auto";
  flushGlyphCanvas(glyphCanvas);
  window.removeEventListener("resize", scheduleResize);
  resetEraserMode();
}

function clearWritingCanvas() {
  // Reset to pen mode when clearing
  resetEraserMode();
  allPaths = [];
  clearCanvas();
}

function renderGlyphCanvas() {
  drawCenteredGlyph(writingCanvas.width, writingCanvas.height, currFont, currentGlyph);
}

function drawCenteredGlyph(width, height, font, char) {
  glyphCanvas.width = width;
  glyphCanvas.height = height;
  const ctx = flushGlyphCanvas(glyphCanvas);

  const targetFill = 0.7; // 70% of canvas

  // Start with an initial large font size
  let fontSize = Math.min(glyphCanvas.width, glyphCanvas.height);
  ctx.font = `${fontSize}px "${font}"`;

  // Measure the text
  let metrics = ctx.measureText(char);
  let textWidth = metrics.width;
  let textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

  // Calculate scale factors needed for both width and height
  const scaleX = (glyphCanvas.width * targetFill) / textWidth;
  const scaleY = (glyphCanvas.height * targetFill) / textHeight;

  // Use the smaller scale factor to ensure text fits in both dimensions
  const scale = Math.min(scaleX, scaleY);
  fontSize = fontSize * scale;

  // Apply the calculated font size
  ctx.font = `${fontSize}px "${font}"`;
  ctx.fillStyle = computedStyles.getPropertyValue("--text");
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Remeasure with final font size
  metrics = ctx.measureText(char);

  // Calculate centered position
  const centerX = glyphCanvas.width / 2;
  const centerY = glyphCanvas.height / 2 + metrics.actualBoundingBoxAscent / 2 - metrics.actualBoundingBoxDescent / 2;

  ctx.fillText(char, centerX, centerY);
}

function flushGlyphCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = computedStyles.getPropertyValue("--bg");
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return ctx;
}

let resizeTimer = null;
function scheduleResize() {
  if (resizeTimer) clearTimeout(resizeTimer);
  showLetterLoader();
  resizeTimer = setTimeout(() => {
    resizeTimer = null;
    resizeWritingCanvas();
    setWritingColors();
    renderGlyphCanvas();
    hideLetterLoader();
  }, 500);
}

function resizeWritingCanvas() {
  if (!writingCanvas || !ctx) return;

  const ratio = Math.max(window.devicePixelRatio || 1, 1);

  // Clear all paths
  allPaths = [];

  // Resize the canvas
  writingCanvas.width = writingCanvas.offsetWidth * ratio;
  writingCanvas.height = writingCanvas.offsetHeight * ratio;
  ctx = writingCanvas.getContext("2d");
  ctx.scale(ratio, ratio);

  // Clear the canvas completely
  clearCanvas();
}

function initListeners() {
  const closeButton = document.querySelector(".close-button");
  const clearButton = document.querySelector(".clear-button");
  const eraserButton = document.querySelector(".eraser-button");

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      addButtonAnimation(closeButton);
      setTimeout(() => {
        closeWritingPad();
      }, 150);
    });
  }

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      addButtonAnimation(clearButton);
      setTimeout(() => {
        clearWritingCanvas();
      }, 150);
    });
  }

  if (eraserButton) {
    eraserButton.addEventListener("click", () => {
      addButtonAnimation(eraserButton);
      setTimeout(() => {
        toggleEraser();
      }, 150);
    });
  }

  // Navigation buttons
  if (navPrevButton) {
    navPrevButton.addEventListener("click", () => {
      addButtonAnimation(navPrevButton);
      setTimeout(() => {
        navigateToPrevious();
      }, 150);
    });
  }

  if (navNextButton) {
    navNextButton.addEventListener("click", () => {
      addButtonAnimation(navNextButton);
      setTimeout(() => {
        navigateToNext();
      }, 150);
    });
  }

  // pointer events
  if (writingCanvas) {
    writingCanvas.addEventListener("pointerdown", startDrawing);
    writingCanvas.addEventListener("pointermove", draw);
    writingCanvas.addEventListener("pointerup", stopDrawing);
    writingCanvas.addEventListener("pointerout", stopDrawing);
  }
}

function getPoint(e) {
  const rect = writingCanvas.getBoundingClientRect();
  return [e.clientX - rect.left, e.clientY - rect.top, e.pressure];
}

function startDrawing(e) {
  isDrawing = true;
  currentPath = [getPoint(e)];
  draw(e);
}

function draw(e) {
  if (!isDrawing || !ctx) return;

  const point = getPoint(e);
  currentPath.push(point);

  // Clear canvas and redraw all paths
  clearCanvas();

  // Draw current path
  if (isEraserMode) {
    // For eraser, just draw without adding to paths
    drawPath(currentPath, computedStyles.getPropertyValue("--card"), true);
  } else {
    // For drawing, draw normally
    drawPath(currentPath, originalPenColor, false);
  }
}

function stopDrawing() {
  if (!isDrawing) return;

  isDrawing = false;

  // Add the completed path to allPaths only if not in eraser mode
  if (currentPath.length > 0 && !isEraserMode) {
    allPaths.push({
      points: currentPath,
      color: originalPenColor,
    });
  }

  // If in eraser mode, remove any paths that intersect with the eraser stroke
  if (isEraserMode && currentPath.length > 0) {
    allPaths = filterErasedPaths(allPaths, currentPath);
    clearCanvas();
  } else {
    // Redraw all paths to ensure the final state is visible
    clearCanvas();
  }

  currentPath = [];
}

// Filter out paths that are erased by the eraser stroke
function filterErasedPaths(paths, eraserPoints) {
  const eraserStroke = getStroke(eraserPoints, eraserOptions);
  return paths.filter((path) => !path.points.some((point) => isPointInStroke(eraserStroke, point)));
}

// Check if a point is inside a stroke
function isPointInStroke(stroke, point) {
  if (stroke.length < 3) return false;

  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = stroke.length - 1; i < stroke.length; j = i++) {
    const [xi, yi] = stroke[i];
    const [xj, yj] = stroke[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

function toggleEraser() {
  // Only allow eraser in blank mode (Free Practice)
  if (!writingPad.classList.contains("blank-mode")) return;

  const eraserButton = document.querySelector(".eraser-button");
  isEraserMode = !isEraserMode;
  eraserButton.textContent = isEraserMode ? "✏️" : "🧼";
}

// Reset eraser mode when closing the pad
function resetEraserMode() {
  isEraserMode = false;
  const eraserButton = document.querySelector(".eraser-button");
  if (eraserButton) eraserButton.textContent = "🧼";
}

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  // Initialize canvas first
  initializeCanvas();

  // Try to initialize PerfectFreehand
  if (!initializePerfectFreehand()) {
    // Retry after 500ms
    setTimeout(() => {
      initializePerfectFreehand();
    }, 500);
  }

  // Set up event listeners
  initListeners();
});

// Navigation functions
function updateNavigationButtons() {
  if (!currentLetterInfo || !languageData) {
    if (navPrevButton) navPrevButton.style.display = "none";
    if (navNextButton) navNextButton.style.display = "none";
    return;
  }

  // Show both buttons in regular practice mode
  if (navPrevButton) navPrevButton.style.display = "block";
  if (navNextButton) navNextButton.style.display = "block";

  // Disable buttons at boundaries
  const { section, index, rowIndex, cellIndex } = currentLetterInfo;

  if (section === "vowels-basic") {
    // First vowel (index 0) has no previous
    if (navPrevButton) navPrevButton.disabled = index === 0;
    // Last vowel has no next
    if (navNextButton) navNextButton.disabled = index === languageData.vowels.length - 1;
  } else if (section === "vowels") {
    const totalCells = languageData.consonants.length * (languageData.vowels.length + 1);
    const currentIndex = rowIndex * (languageData.vowels.length + 1) + cellIndex;

    if (navPrevButton) navPrevButton.disabled = currentIndex === 0;
    if (navNextButton) navNextButton.disabled = currentIndex === totalCells - 1;
  } else if (section === "conjuncts") {
    if (navPrevButton) navPrevButton.disabled = index === 0;
    if (navNextButton) navNextButton.disabled = index === languageData.conjuncts.length - 1;
  }
}

function hideNavigationButtons() {
  currentLetterInfo = null;
  updateNavigationButtons();
}

function navigateToPrevious() {
  if (!currentLetterInfo || !languageData) return;

  const { section, index, rowIndex, cellIndex } = currentLetterInfo;

  if (section === "vowels-basic") {
    if (index > 0) {
      const vowel = languageData.vowels[index - 1];
      currentLetterInfo.index = index - 1;
      showWritingPad(vowel.symbol, vowel.transliteration, currLang);
    }
  } else if (section === "vowels") {
    const vowelsCount = languageData.vowels.length + 1; // +1 for halant column
    let currentCellIndex = rowIndex * vowelsCount + cellIndex;

    if (currentCellIndex > 0) {
      currentCellIndex--;
      const newRowIndex = Math.floor(currentCellIndex / vowelsCount);
      const newCellIndex = currentCellIndex % vowelsCount;

      currentLetterInfo.rowIndex = newRowIndex;
      currentLetterInfo.cellIndex = newCellIndex;

      let letter, translit;
      const consonant = languageData.consonants[newRowIndex];

      if (newCellIndex === 0) {
        // First column: consonant + halant
        letter = consonant.symbol + languageData.halant.symbol;
        translit = consonant.base;
      } else {
        // Other columns: consonant + vowel
        const vowel = languageData.vowels[newCellIndex - 1];
        letter = consonant.symbol + vowel.diacritic;
        translit = consonant.base + vowel.transliteration;
      }

      showWritingPad(letter, translit, currLang);
    }
  } else if (section === "conjuncts") {
    if (index > 0) {
      const conjunct = languageData.conjuncts[index - 1];
      currentLetterInfo.index = index - 1;
      showWritingPad(conjunct.first + conjunct.second, conjunct.transliteration, currLang);
    }
  }
}

function navigateToNext() {
  if (!currentLetterInfo || !languageData) return;

  const { section, index, rowIndex, cellIndex } = currentLetterInfo;

  if (section === "vowels-basic") {
    if (index < languageData.vowels.length - 1) {
      const vowel = languageData.vowels[index + 1];
      currentLetterInfo.index = index + 1;
      showWritingPad(vowel.symbol, vowel.transliteration, currLang);
    }
  } else if (section === "vowels") {
    const vowelsCount = languageData.vowels.length + 1; // +1 for halant column
    const totalCells = languageData.consonants.length * vowelsCount;
    let currentCellIndex = rowIndex * vowelsCount + cellIndex;

    if (currentCellIndex < totalCells - 1) {
      currentCellIndex++;
      const newRowIndex = Math.floor(currentCellIndex / vowelsCount);
      const newCellIndex = currentCellIndex % vowelsCount;

      currentLetterInfo.rowIndex = newRowIndex;
      currentLetterInfo.cellIndex = newCellIndex;

      let letter, translit;
      const consonant = languageData.consonants[newRowIndex];

      if (newCellIndex === 0) {
        // First column: consonant + halant
        letter = consonant.symbol + languageData.halant.symbol;
        translit = consonant.base;
      } else {
        // Other columns: consonant + vowel
        const vowel = languageData.vowels[newCellIndex - 1];
        letter = consonant.symbol + vowel.diacritic;
        translit = consonant.base + vowel.transliteration;
      }

      showWritingPad(letter, translit, currLang);
    }
  } else if (section === "conjuncts") {
    if (index < languageData.conjuncts.length - 1) {
      const conjunct = languageData.conjuncts[index + 1];
      currentLetterInfo.index = index + 1;
      showWritingPad(conjunct.first + conjunct.second, conjunct.transliteration, currLang);
    }
  }
}

function showLetterLoader() {
  const loader = document.getElementById("letter-loader");
  loader.classList.add("visible");
}

function hideLetterLoader() {
  const loader = document.getElementById("letter-loader");
  loader.classList.remove("visible");
}
