const canvas = document.getElementById("canvas");
const writingPad = document.querySelector(".writing-pad");
const writingBg = document.getElementById("writing-bg");

const signaturePad = new SignaturePad(canvas, {
  // dotSize: 8,
  minWidth: 1,
  maxWidth: 5,
  // minDistance: 1,
  // velocityFilterWeight: 0.5,
  penColor: "#4285f4ff",
  backgroundColor: "#262626ff",
});

function showCanvas() {
  writingPad.style.display = "flex";
  writingBg.classList.add("active");
  scheduleResize();
}

function closeCanvas() {
  clearCanvas();
  writingPad.style.display = "none";
  writingBg.classList.remove("active");
}

function clearCanvas() {
  signaturePad.clear();
}

// Debounce helper (simple)
let resizeTimer = null;
function scheduleResize() {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeTimer = null;
    resizeCanvas();
  }, 500);
}

function resizeCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext("2d").scale(ratio, ratio);
  signaturePad.clear();
}

window.addEventListener("resize", scheduleResize);