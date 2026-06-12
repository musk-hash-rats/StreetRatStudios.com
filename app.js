const canvas = document.querySelector("#system-map");
const ctx = canvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const nodes = [
  { x: 0.14, y: 0.26, r: 3, c: "#d51f2a", vx: 0.00025, vy: 0.00018 },
  { x: 0.26, y: 0.58, r: 2.4, c: "#f4f1ec", vx: -0.00018, vy: 0.00016 },
  { x: 0.38, y: 0.34, r: 2.8, c: "#8f1118", vx: 0.00016, vy: -0.00018 },
  { x: 0.53, y: 0.68, r: 3, c: "#d51f2a", vx: -0.0002, vy: -0.00012 },
  { x: 0.68, y: 0.3, r: 2.5, c: "#f4f1ec", vx: 0.00018, vy: 0.00013 },
  { x: 0.82, y: 0.55, r: 3.2, c: "#d51f2a", vx: -0.00016, vy: 0.00015 },
  { x: 0.9, y: 0.22, r: 2.2, c: "#f4f1ec", vx: 0.00012, vy: -0.00016 },
];

let width = 0;
let height = 0;
let deviceScale = 1;
let lastTime = 0;

function resizeCanvas() {
  deviceScale = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * deviceScale);
  canvas.height = Math.floor(height * deviceScale);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
}

function drawGrid() {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;

  for (let i = 0; i < 16; i += 1) {
    const x = (width / 15) * i;
    ctx.strokeStyle = `rgba(245, 241, 232, ${i % 3 === 0 ? 0.07 : 0.035})`;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let i = 0; i < 10; i += 1) {
    const y = (height / 9) * i;
    ctx.strokeStyle = `rgba(245, 241, 232, ${i % 3 === 0 ? 0.06 : 0.03})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawConnections() {
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const ax = a.x * width;
      const ay = a.y * height;
      const bx = b.x * width;
      const by = b.y * height;
      const distance = Math.hypot(ax - bx, ay - by);

      if (distance > 430) {
        continue;
      }

      ctx.strokeStyle = `rgba(213, 31, 42, ${Math.max(0.035, 0.18 - distance / 2600)})`;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
  }
}

function drawNodes(time) {
  for (const node of nodes) {
    const x = node.x * width;
    const y = node.y * height;
    const pulse = Math.sin(time / 620 + x * 0.01) * 0.4 + 1;

    ctx.fillStyle = "rgba(6, 8, 10, 0.75)";
    ctx.strokeStyle = node.c;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, node.r * 5.2 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = node.c;
    ctx.beginPath();
    ctx.arc(x, y, node.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateNodes(delta) {
  if (prefersReducedMotion.matches) {
    return;
  }

  for (const node of nodes) {
    node.x += node.vx * delta;
    node.y += node.vy * delta;

    if (node.x < 0.08 || node.x > 0.94) {
      node.vx *= -1;
    }

    if (node.y < 0.12 || node.y > 0.82) {
      node.vy *= -1;
    }
  }
}

function render(time = 0) {
  const delta = Math.min(time - lastTime, 32);
  lastTime = time;

  updateNodes(delta);
  drawGrid();
  drawConnections();
  drawNodes(time);

  if (!prefersReducedMotion.matches) {
    requestAnimationFrame(render);
  }
}

function revealOnScroll() {
  const targets = document.querySelectorAll(
    ".products-section, .programs-section, .security-band, .product-grid article, .program-grid article, .lane, .process-section, .proof-section, .coming-soon-section, .contact-section"
  );

  for (const target of targets) {
    target.classList.add("reveal");
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.16 }
  );

  for (const target of targets) {
    observer.observe(target);
  }
}

window.addEventListener("resize", resizeCanvas, { passive: true });
resizeCanvas();
render();
revealOnScroll();

if (prefersReducedMotion.matches) {
  drawGrid();
  drawConnections();
  drawNodes(0);
}
