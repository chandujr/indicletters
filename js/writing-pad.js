const writingCanvas = document.getElementById("writing-canvas");
const glyphCanvas = document.getElementById("glyph-canvas");
const writingPad = document.getElementById("writing-pad");
const writingBg = document.getElementById("writing-bg");
const writingPadHeader = document.getElementById("writing-pad-header");
const writingTranslit = document.getElementById("writing-translit");
var currentGlyph = "";
var currFont = "";
var isEraserMode = false; // Track if eraser is active
var originalPenColor = ""; // Store original pen color for restoration
var originalMinWidth, originalMaxWidth; // Store original width settings for restoration
const fontNames = {
  tamil: "Noto Sans Tamil",
  malayalam: "Noto Sans Malayalam",
  kannada: "Noto Sans Kannada",
};
const computedStyles = getComputedStyle(document.body);

const signaturePad = new SignaturePad(writingCanvas, {
  // dotSize: 3,
  // throttle: 24,
  // minDistance: 2,
  minWidth: 2,
  maxWidth: 7,
  velocityFilterWeight: 0.4,
});

function setWritingColors() {
  const ctx = writingCanvas.getContext("2d");
  const linearGradient = ctx.createLinearGradient(0, 0, writingCanvas.offsetWidth, 0);
  linearGradient.addColorStop(0.3, computedStyles.getPropertyValue("--primary"));
  linearGradient.addColorStop(0.7, computedStyles.getPropertyValue("--secondary"));
  signaturePad.penColor = linearGradient;
  originalPenColor = linearGradient; // Store the original pen color
  // Store original width settings
  originalMinWidth = signaturePad.minWidth;
  originalMaxWidth = signaturePad.maxWidth;
  signaturePad.backgroundColor = computedStyles.getPropertyValue("--card");
  signaturePad.clear();
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
  signaturePad.clear();
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
  resizeTimer = setTimeout(() => {
    resizeTimer = null;
    resizeWritingCanvas();
    setWritingColors();
    renderGlyphCanvas();
  }, 500);
}

function resizeWritingCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  writingCanvas.width = writingCanvas.offsetWidth * ratio;
  writingCanvas.height = writingCanvas.offsetHeight * ratio;
  writingCanvas.getContext("2d").scale(ratio, ratio);
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
}

function toggleEraser() {
  // Only allow eraser in blank mode (Free Practice)
  if (!writingPad.classList.contains("blank-mode")) return;

  const eraserButton = document.querySelector(".eraser-button");

  isEraserMode = !isEraserMode;

  if (isEraserMode) {
    // Enable eraser mode by changing pen color to background color
    signaturePad.penColor = computedStyles.getPropertyValue("--card");
    // Set larger constant width for eraser
    signaturePad.minWidth = 10;
    signaturePad.maxWidth = 10;
    eraserButton.textContent = "✏️"; // Change to pen icon
  } else {
    // Disable eraser mode (back to pen) by restoring original pen color
    signaturePad.penColor = originalPenColor;
    // Restore original width settings
    signaturePad.minWidth = originalMinWidth;
    signaturePad.maxWidth = originalMaxWidth;
    eraserButton.textContent = "🧼"; // Change to eraser icon
  }
}

// Reset eraser mode when closing the pad
function resetEraserMode() {
  isEraserMode = false;
  const eraserButton = document.querySelector(".eraser-button");
  if (eraserButton) {
    eraserButton.textContent = "🧼"; // Reset to eraser icon
  }
  // Restore the original pen color, but ensure we have a valid color
  if (originalPenColor) {
    signaturePad.penColor = originalPenColor;
  }
  // Restore original width settings
  if (originalMinWidth && originalMaxWidth) {
    signaturePad.minWidth = originalMinWidth;
    signaturePad.maxWidth = originalMaxWidth;
  }
}

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  initListeners();
});
