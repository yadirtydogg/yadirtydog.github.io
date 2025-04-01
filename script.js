const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");
const grid = document.getElementById("resultGrid");
const scratchAudio = new Audio("scratch.mp3");
const winJingle = new Audio("winning.mp3");
scratchAudio.loop = true;

const ticket = document.getElementById("ticket");
const winMessage = document.getElementById("winMessage");

const images = [
  "images/yadirtydog-logo.png",
  "images/bone.png",
  "images/collar.png",
  "images/dog-bowl.png",
  "images/doghouse.png",
  "images/paws.png"
];

const isWinner = Math.random() <= 0.05;

function generateGrid() {
  const chosen = [];
  if (isWinner) {
    const winRow = Math.floor(Math.random() * 3);
    for (let i = 0; i < 3; i++) {
      const row = [];
      for (let j = 0; j < 3; j++) {
        if (i === winRow) {
          row.push("images/yadirtydog-logo.png");
        } else {
          const rand = images[Math.floor(Math.random() * (images.length - 1)) + 1];
          row.push(rand);
        }
      }
      chosen.push(...row);
    }
  } else {
    for (let i = 0; i < 9; i++) {
      const rand = images[Math.floor(Math.random() * (images.length - 1)) + 1];
      chosen.push(rand);
    }
  }

  chosen.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    grid.appendChild(img);
  });

  if (isWinner) {
    winJingle.currentTime = 0;
    winJingle.play().catch(() => {});
    if (window.confetti) {
    }
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
}
}

function alignOverlay() {
  const rect = ticket.getBoundingClientRect();
  const scaleX = rect.width / 800;
  const scaleY = rect.height / 1000;

  const x = 200 * scaleX;
  const y = 522 * scaleY;
  const w = 440 * scaleX;
  const h = 340 * scaleY;

  [canvas, grid].forEach(el => {
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
  });

  canvas.width = w;
  canvas.height = h;

  // Draw silver overlay
  ctx.fillStyle = "#c0c0c0";
  ctx.globalCompositeOperation = "source-over";
  ctx.fillRect(0, 0, w, h);

  // Punch out text
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.textAlign = "center";
  ctx.font = `${Math.floor(h * 0.14)}px sans-serif`;
  ctx.fillText("MATCH", w / 2, h * 0.3);
  ctx.fillText("3", w / 2, h * 0.5);
  ctx.fillText("AND WIN", w / 2, h * 0.7);
}

function setupScratchArea() {
  canvas.addEventListener("mousedown", startScratching);
  canvas.addEventListener("touchstart", startScratching);
}

function startScratching(e) {
  e.preventDefault();
  try {
    scratchAudio.currentTime = 0;
    scratchAudio.play();
  } catch (err) {
    console.warn("Audio play blocked:", err);
  }

  e.preventDefault();
  canvas.addEventListener("mousemove", scratch);
  canvas.addEventListener("touchmove", scratch);
  canvas.addEventListener("mouseup", stopScratching);
  canvas.addEventListener("mouseleave", stopScratching);
  canvas.addEventListener("touchend", stopScratching);
}

function scratch(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, 2 * Math.PI);
  ctx.fill();
  checkScratchProgress();
  if (navigator.vibrate) navigator.vibrate(10);
}

function stopScratching() {
  scratchAudio.pause();
  scratchAudio.currentTime = 0;
  canvas.removeEventListener("mousemove", scratch);
  canvas.removeEventListener("touchmove", scratch);
}

window.onload = () => {
  generateGrid();
  alignOverlay();
  setupScratchArea();
};

window.onresize = () => {
  alignOverlay();
};

let scratched = false;
let winTriggered = false;

function checkScratchProgress() {
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let cleared = 0;
  for (let i = 0; i < pixels.data.length; i += 4) {
    if (pixels.data[i + 3] === 0) cleared++;
  }
  const percent = cleared / (canvas.width * canvas.height) * 100;
  if (percent > 60 && !scratched) {
    scratched = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    checkWinMatch();
  }
}

function checkWinMatch() {
  const imgs = [...grid.querySelectorAll("img")];
  for (let i = 0; i < 3; i++) {
    const row = imgs.slice(i * 3, i * 3 + 3);
    if (row.every(img => img.src.includes("images/yadirtydog-logo.png"))) {
      if (!winTriggered) {
        winTriggered = true;
        if (window.confetti) {
        }
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
        winJingle.currentTime = 0;
        winJingle.play().catch(() => {});
      }
    }
  }
}


// Track scratch completion
function checkScratchCompletion() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let cleared = 0;

    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] < 128) { // Check alpha channel
            cleared++;
        }
    }

    const percentCleared = cleared / (canvas.width * canvas.height) * 100;
    if (percentCleared > 70 && !window.__scratchWinTriggered) {
        window.__scratchWinTriggered = true;

        if (isWinner) {
            winJingle.currentTime = 0;
            winJingle.play().catch(() => {});
            document.getElementById("winMessage").style.display = "block";
            if (typeof confetti === "function") {
        if (typeof confetti === "function") {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
            }
        }
    }
}

// Hook into existing mousemove handler
canvas.addEventListener("mousemove", () => {
    checkScratchCompletion();
});
