// DOM element references
const writingCanvas = document.getElementById("writing-canvas");
const glyphCanvas = document.getElementById("glyph-canvas");
const writingPad = document.getElementById("writing-pad");
const writingBg = document.getElementById("writing-bg");
const writingPadHeader = document.getElementById("writing-pad-header");
const writingTranslit = document.getElementById("writing-translit");

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
  size: 12,
  smoothing: 0.5,
  thinning: 0.3,
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
  if (!points || points.length < 2 || !ctx) return;

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
  resizeTimer = setTimeout(() => {
    resizeTimer = null;
    resizeWritingCanvas();
    setWritingColors();
    renderGlyphCanvas();
  }, 500);
}

function resizeWritingCanvas() {
  if (!writingCanvas || !ctx) return;

  const ratio = Math.max(window.devicePixelRatio || 1, 1);

  // Save the current paths
  const savedPaths = [...allPaths];

  // Resize the canvas
  writingCanvas.width = writingCanvas.offsetWidth * ratio;
  writingCanvas.height = writingCanvas.offsetHeight * ratio;
  ctx = writingCanvas.getContext("2d");
  ctx.scale(ratio, ratio);

  // Redraw the paths
  allPaths = savedPaths;
  clearCanvas();
}

function initListeners() {
  const closeButton = document.querySelector(".close-button");
  const clearButton = document.querySelector(".clear-button");
  const eraserButton = document.querySelector(".eraser-button");

  // Mouse events
  if (writingCanvas) {
    writingCanvas.addEventListener("mousedown", startDrawing);
    writingCanvas.addEventListener("mousemove", draw);
    writingCanvas.addEventListener("mouseup", stopDrawing);
    writingCanvas.addEventListener("mouseout", stopDrawing);

    // Touch events
    writingCanvas.addEventListener("touchstart", handleTouch);
    writingCanvas.addEventListener("touchmove", handleTouch);
    writingCanvas.addEventListener("touchend", stopDrawing);
  }

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

// Drawing functions for perfect-freehand
function getPoint(e) {
  const rect = writingCanvas.getBoundingClientRect();
  return [e.clientX - rect.left, e.clientY - rect.top];
}

function startDrawing(e) {
  isDrawing = true;
  currentPath = [getPoint(e)];
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
  }

  currentPath = [];
}

function handleTouch(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const eventType = e.type === "touchstart" ? "mousedown" : e.type === "touchmove" ? "mousemove" : "mouseup";

  const mouseEvent = new MouseEvent(eventType, {
    clientX: touch.clientX,
    clientY: touch.clientY,
  });

  if (e.type === "touchstart") {
    startDrawing(mouseEvent);
  } else if (e.type === "touchmove") {
    draw(mouseEvent);
  }
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
