const writingCanvas = document.getElementById("writing-canvas");
const glyphCanvas = document.getElementById("glyph-canvas");
const writingPad = document.querySelector(".writing-pad");
const writingBg = document.getElementById("writing-bg");
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

function setWritingColors() {
  const ctx = writingCanvas.getContext("2d");
  const linearGradient = ctx.createLinearGradient(0, 0, writingCanvas.offsetWidth, 0);
  linearGradient.addColorStop(0.3, computedStyles.getPropertyValue("--primary"));
  linearGradient.addColorStop(0.7, computedStyles.getPropertyValue("--secondary"));
  signaturePad.penColor = linearGradient;
  signaturePad.backgroundColor = computedStyles.getPropertyValue("--card");
  signaturePad.clear();
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

function closeWritingPad() {
  clearWritingCanvas();
  writingPad.style.display = "none";
  writingBg.classList.remove("active");
  document.body.style.overflow = "auto";
  flushGlyphCanvas(glyphCanvas);
  window.removeEventListener("resize", scheduleResize);
}

function clearWritingCanvas() {
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
  const soundButton = document.querySelector(".writing-sound-button");

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

  if (soundButton) {
    soundButton.addEventListener("click", () => {
      addButtonAnimation(soundButton);
      setTimeout(() => {
        playPronunciation(currentGlyph, "ta-IN");
      }, 150);
    });
  }
}

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  initListeners();
});
