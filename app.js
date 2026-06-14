const canvas = document.querySelector("#system-map");
const ctx = canvas ? canvas.getContext("2d") : null;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const nodes = [
  { x: 0.14, y: 0.26, r: 3, c: "#d51f2a", vx: 0.00005, vy: 0.000036 },
  { x: 0.26, y: 0.58, r: 2.4, c: "#f4f1ec", vx: -0.000036, vy: 0.000032 },
  { x: 0.38, y: 0.34, r: 2.8, c: "#8f1118", vx: 0.000032, vy: -0.000036 },
  { x: 0.53, y: 0.68, r: 3, c: "#d51f2a", vx: -0.00004, vy: -0.000024 },
  { x: 0.68, y: 0.3, r: 2.5, c: "#f4f1ec", vx: 0.000036, vy: 0.000026 },
  { x: 0.82, y: 0.55, r: 3.2, c: "#d51f2a", vx: -0.000032, vy: 0.00003 },
  { x: 0.9, y: 0.22, r: 2.2, c: "#f4f1ec", vx: 0.000024, vy: -0.000032 },
];

let width = 0;
let height = 0;
let deviceScale = 1;
let lastTime = 0;
let animationFrameId = 0;

function resizeCanvas() {
  if (!canvas || !ctx) {
    return;
  }

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
  if (!ctx) {
    return;
  }

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
  if (!ctx) {
    return;
  }

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

      ctx.strokeStyle = `rgba(213, 31, 42, ${Math.max(0.018, 0.095 - distance / 4200)})`;
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
    const pulse = Math.sin(time / 1800 + x * 0.006) * 0.16 + 1;

    ctx.fillStyle = "rgba(6, 8, 10, 0.75)";
    ctx.strokeStyle = node.c;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, node.r * 3.8 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = node.c;
    ctx.beginPath();
    ctx.arc(x, y, node.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateNodes(delta) {
  if (!shouldAnimateBackground()) {
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
  if (!ctx) {
    return;
  }

  const delta = Math.min(time - lastTime, 32);
  lastTime = time;

  updateNodes(delta);
  drawGrid();
  drawConnections();
  drawNodes(time);

  if (shouldAnimateBackground()) {
    animationFrameId = requestAnimationFrame(render);
  }
}

function shouldAnimateBackground() {
  const saveData = navigator.connection && navigator.connection.saveData;
  return (
    !prefersReducedMotion.matches &&
    !saveData &&
    window.innerWidth >= 700 &&
    document.visibilityState === "visible"
  );
}

function handleVisibilityChange() {
  if (!ctx) {
    return;
  }

  if (document.hidden) {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }

    return;
  }

  resizeCanvas();
  render();
}

function revealOnScroll() {
  const targets = document.querySelectorAll(
    ".products-section, .blackoutguard-showcase, .programs-section, .security-band, .product-grid article, .program-grid article, .lane, .proof-section, .contact-section"
  );

  for (const target of targets) {
    target.classList.add("reveal");
  }

  if (!("IntersectionObserver" in window)) {
    for (const target of targets) {
      target.classList.add("is-visible");
    }

    return;
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

function setupContactForm() {
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");

  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const project = String(data.get("project") || "").trim();

    if (!name || !email || !project) {
      form.reportValidity();
      return;
    }

    const subject = `Street Rat Studios project inquiry from ${name}`;
    const body = [
      `Name/company: ${name}`,
      `Email: ${email}`,
      "",
      "Project:",
      project,
    ].join("\n");

    window.location.href = `mailto:biz@streetratstudios.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    if (status) {
      status.textContent = "Opening your email client with the project details filled in.";
    }
  });
}

if (ctx) {
  window.addEventListener("resize", resizeCanvas, { passive: true });
  document.addEventListener("visibilitychange", handleVisibilityChange);
  resizeCanvas();
  render();
}

revealOnScroll();
setupContactForm();

if (ctx && !shouldAnimateBackground()) {
  drawGrid();
  drawConnections();
  drawNodes(0);
}
