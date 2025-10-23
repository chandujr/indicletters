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

const signaturePad = new SignaturePad(writingCanvas, {
  // dotSize: 8,
  minWidth: 1,
  maxWidth: 5,
  // minDistance: 1,
  // velocityFilterWeight: 0.5,
  penColor: "#4285f4ff",
  backgroundColor: "#262626ff",
});

function showWritingPad(letter, font) {
  currentGlyph = letter;
  currFont = fontNames[font];
  writingPad.style.display = "flex";
  writingBg.classList.add("active");
  scheduleResize();
  window.addEventListener("resize", scheduleResize);
}

function closeWritingPad() {
  clearWritingCanvas();
  writingPad.style.display = "none";
  writingBg.classList.remove("active");
  clearGlyphCanvas();
  window.removeEventListener("resize", scheduleResize);
}

function clearWritingCanvas() {
  signaturePad.clear();
}

function renderGlyphCanvas() {
  drawCenteredGlyph(
    writingCanvas.width,
    writingCanvas.height,
    currFont,
    currentGlyph
  );
}

function drawCenteredGlyph(width, height, font, char) {
  glyphCanvas.width = width;
  glyphCanvas.height = height;
  const ctx = glyphCanvas.getContext("2d");

  const targetFill = 0.7; // 70% of canvas

  // Start with an initial large font size
  let fontSize = Math.min(glyphCanvas.width, glyphCanvas.height);
  ctx.font = `${fontSize}px "${font}"`;

  // Measure the text
  let metrics = ctx.measureText(char);
  let textWidth = metrics.width;
  let textHeight =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

  // Calculate scale factors needed for both width and height
  const scaleX = (glyphCanvas.width * targetFill) / textWidth;
  const scaleY = (glyphCanvas.height * targetFill) / textHeight;

  // Use the smaller scale factor to ensure text fits in both dimensions
  const scale = Math.min(scaleX, scaleY);
  fontSize = fontSize * scale;

  // Apply the calculated font size
  ctx.font = `${fontSize}px "${font}"`;
  ctx.fillStyle = "#1f1f1fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Remeasure with final font size
  metrics = ctx.measureText(char);

  // Calculate centered position
  const centerX = glyphCanvas.width / 2;
  const centerY =
    glyphCanvas.height / 2 +
    metrics.actualBoundingBoxAscent / 2 -
    metrics.actualBoundingBoxDescent / 2;

  ctx.fillText(char, centerX, centerY);
}

function clearGlyphCanvas() {
  const ctx = glyphCanvas.getContext("2d");
  ctx.clearRect(0, 0, glyphCanvas.width, glyphCanvas.height);
}

let resizeTimer = null;
function scheduleResize() {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeTimer = null;
    resizeCanvas();
    renderGlyphCanvas();
  }, 500);
}

function resizeCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  writingCanvas.width = writingCanvas.offsetWidth * ratio;
  writingCanvas.height = writingCanvas.offsetHeight * ratio;
  writingCanvas.getContext("2d").scale(ratio, ratio);
  signaturePad.clear();
}