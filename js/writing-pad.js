const writingCanvas = document.getElementById("writing-canvas");
const glyphCanvas = document.getElementById("glyph-canvas");
const writingPad = document.querySelector(".writing-pad");
const writingBg = document.getElementById("writing-bg");

const blankWritingCanvas = document.getElementById("blank-writing-canvas");
const blankWritingPad = document.querySelector(".blank-pad");
const blankWritingBg = document.getElementById("blank-writing-bg");
var currentGlyph = "";
var currFont = "";
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

const blankSignaturePad = new SignaturePad(blankWritingCanvas, {
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
  signaturePad.backgroundColor = computedStyles.getPropertyValue("--card");
  signaturePad.clear();

  const blankCtx = blankWritingCanvas.getContext("2d");
  const blankLinearGradient = blankCtx.createLinearGradient(0, 0, blankWritingCanvas.offsetWidth, 0);
  blankLinearGradient.addColorStop(0.3, computedStyles.getPropertyValue("--primary"));
  blankLinearGradient.addColorStop(0.7, computedStyles.getPropertyValue("--secondary"));
  blankSignaturePad.penColor = blankLinearGradient;
  blankSignaturePad.backgroundColor = computedStyles.getPropertyValue("--card");
  blankSignaturePad.clear();
}

function showWritingPad(letter, translit, lang) {
  currentGlyph = letter;
  currFont = fontNames[lang];

  const glyphTranslit = document.querySelector(".writing-translit");
  glyphTranslit.textContent = translit;

  writingPad.style.display = "flex";
  writingBg.classList.add("active");
  document.body.style.overflow = "hidden";
  scheduleResize();
  window.addEventListener("resize", scheduleResize);
}

function showBlankWritingPad() {
  blankWritingPad.style.display = "flex";
  blankWritingBg.classList.add("active");
  document.body.style.overflow = "hidden";
  scheduleBlankResize();
  window.addEventListener("resize", scheduleBlankResize);
}

function closeWritingPad() {
  clearWritingCanvas();
  writingPad.style.display = "none";
  writingBg.classList.remove("active");
  document.body.style.overflow = "auto";
  flushGlyphCanvas(glyphCanvas);
  window.removeEventListener("resize", scheduleResize);
}

function closeBlankWritingPad() {
  clearBlankWritingCanvas();
  blankWritingPad.style.display = "none";
  blankWritingBg.classList.remove("active");
  document.body.style.overflow = "auto";
  window.removeEventListener("resize", scheduleBlankResize);
}

function clearWritingCanvas() {
  signaturePad.clear();
}

function clearBlankWritingCanvas() {
  blankSignaturePad.clear();
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

let blankResizeTimer = null;
function scheduleBlankResize() {
  if (blankResizeTimer) clearTimeout(blankResizeTimer);
  blankResizeTimer = setTimeout(() => {
    blankResizeTimer = null;
    resizeBlankWritingCanvas();
    setWritingColors();
  }, 500);
}

function resizeWritingCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  writingCanvas.width = writingCanvas.offsetWidth * ratio;
  writingCanvas.height = writingCanvas.offsetHeight * ratio;
  writingCanvas.getContext("2d").scale(ratio, ratio);
}

function resizeBlankWritingCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  blankWritingCanvas.width = blankWritingCanvas.offsetWidth * ratio;
  blankWritingCanvas.height = blankWritingCanvas.offsetHeight * ratio;
  blankWritingCanvas.getContext("2d").scale(ratio, ratio);
}

function initListeners() {
  // Original writing pad listeners
  const closeButton = document.querySelector(".writing-pad:not(.blank-pad) .close-button");
  const clearButton = document.querySelector(".writing-pad:not(.blank-pad) .clear-button");

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

  // Blank writing pad listeners
  const blankCloseButton = document.querySelector(".blank-pad .close-button");
  const blankClearButton = document.querySelector(".blank-pad .clear-button");

  if (blankCloseButton) {
    blankCloseButton.addEventListener("click", () => {
      addButtonAnimation(blankCloseButton);
      setTimeout(() => {
        closeBlankWritingPad();
      }, 150);
    });
  }

  if (blankClearButton) {
    blankClearButton.addEventListener("click", () => {
      addButtonAnimation(blankClearButton);
      setTimeout(() => {
        clearBlankWritingCanvas();
      }, 150);
    });
  }
}

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  initListeners();
});
