// ============================================
//   SWATI PORTFOLIO — script.js
// ============================================

// ============================================
//   CINEMATIC PAGE INTRO
//   Sequence:
//   0ms   — body becomes visible (opacity 1)
//   0ms   — letters stagger in one by one
//   700ms — gold line extends
//   1100ms— curtain panels slide apart
//   1850ms— overlay fades & is removed
//   1900ms— hero content animates in (via CSS delays)
// ============================================
(function runIntro() {
  const intro = document.getElementById("page-intro");
  const letters = intro.querySelectorAll(".intro-letter");

  // Show body immediately so background colour is visible
  document.body.classList.add("ready");

  // Stagger letters in
  letters.forEach((el, i) => {
    setTimeout(() => el.classList.add("show"), 80 + i * 90);
  });

  // Extend gold line
  setTimeout(() => intro.classList.add("open"), 680);

  // Slide curtains apart
  setTimeout(() => {
    intro.classList.add("done");
    setTimeout(() => intro.remove(), 450);
  }, 1200);
})();

// ============================================
//   STAR FIELD — fixed canvas, full viewport
// ============================================
(function initStars() {
  const canvas = document.createElement("canvas");
  canvas.id = "star-canvas";
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");

  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // ── Nebula clouds ────────────────────────────────────
  // Positioned once, painted every frame at low opacity
  const NEBULAE = [
    // { cx, cy as fractions, rx, ry, hue, sat }
    { cx: 0.72, cy: 0.18, rx: 0.28, ry: 0.22, type: "pink" },
    { cx: 0.15, cy: 0.55, rx: 0.22, ry: 0.18, type: "purple" },
    { cx: 0.88, cy: 0.72, rx: 0.2, ry: 0.24, type: "pink" },
    { cx: 0.42, cy: 0.88, rx: 0.3, ry: 0.16, type: "purple" },
    { cx: 0.55, cy: 0.35, rx: 0.18, ry: 0.2, type: "pink" },
  ];

  function drawNebulae() {
    for (const n of NEBULAE) {
      const cx = n.cx * W;
      const cy = n.cy * H;
      const rx = n.rx * Math.min(W, H);
      const ry = n.ry * Math.min(W, H);

      ctx.save();
      ctx.scale(1, ry / rx);

      const g = ctx.createRadialGradient(
        cx,
        cy * (rx / ry),
        0,
        cx,
        cy * (rx / ry),
        rx,
      );

      if (n.type === "pink") {
        g.addColorStop(0, "rgba(220, 80, 155, 0.18)");
        g.addColorStop(0.35, "rgba(195, 55, 135, 0.11)");
        g.addColorStop(0.65, "rgba(165, 45, 120, 0.055)");
        g.addColorStop(1, "rgba(0,0,0,0)");
      } else {
        g.addColorStop(0, "rgba(140, 65, 210, 0.13)");
        g.addColorStop(0.4, "rgba(110, 45, 175, 0.07)");
        g.addColorStop(0.7, "rgba(85, 35, 155, 0.035)");
        g.addColorStop(1, "rgba(0,0,0,0)");
      }

      ctx.beginPath();
      ctx.arc(cx, cy * (rx / ry), rx, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
    }
  }

  // ── Stars ─────────────────────────────────────────────
  const TOTAL = 310;
  const stars = [];

  function pickR() {
    const r = Math.random();
    if (r < 0.62) return 0.28 + Math.random() * 0.38;
    if (r < 0.88) return 0.68 + Math.random() * 0.48;
    return 1.22 + Math.random() * 0.75;
  }

  for (let i = 0; i < TOTAL; i++) {
    const rnd = Math.random();
    stars.push({
      x: Math.random(),
      y: Math.random(),
      r: pickR(),
      baseA: 0.18 + Math.random() * 0.68,
      gold: rnd < 0.1,
      blue: rnd >= 0.1 && rnd < 0.18,
      pink: rnd >= 0.18 && rnd < 0.26,
      phase: Math.random() * Math.PI * 2,
      speed: 0.22 + Math.random() * 0.8,
    });
  }

  function col(s, a) {
    if (s.gold) return `rgba(232,196,110,${a})`;
    if (s.blue) return `rgba(190,215,255,${a})`;
    if (s.pink) return `rgba(240,160,200,${a})`;
    return `rgba(240,235,216,${a})`;
  }

  function glow(s, px, py, a) {
    const g = ctx.createRadialGradient(px, py, 0, px, py, s.r * 4);
    g.addColorStop(0, col(s, a * 0.22));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.arc(px, py, s.r * 4, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  function spike(s, px, py, a) {
    const arm = s.r * 4.4;
    ctx.save();
    ctx.strokeStyle = col(s, a * 0.38);
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.moveTo(px - arm, py);
    ctx.lineTo(px + arm, py);
    ctx.moveTo(px, py - arm);
    ctx.lineTo(px, py + arm);
    ctx.stroke();
    ctx.restore();
  }

  // ── Loop ─────────────────────────────────────────────
  let prev = performance.now();

  function draw(now) {
    const dt = Math.min((now - prev) / 1000, 0.05);
    prev = now;
    ctx.clearRect(0, 0, W, H);

    // Nebulae first (background layer)
    drawNebulae();

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.phase += s.speed * dt;
      const tw = 0.5 + 0.5 * Math.sin(s.phase);
      const a = s.baseA * (0.42 + 0.58 * tw * tw);

      const px = s.x * W;
      const py = s.y * H;

      if (s.r >= 0.68) glow(s, px, py, a);

      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = col(s, a);
      ctx.fill();

      if (s.r >= 1.22) spike(s, px, py, a);
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

// ============================================
//   FOOTER YEAR
// ============================================
document.getElementById("year").textContent = new Date().getFullYear();

// ============================================
//   TERMINAL PANEL — LIVE CLOCK (IST)
// ============================================
(function liveClock() {
  const el = document.getElementById("tp-time");
  if (!el) return;

  function tick() {
    const now = new Date();
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    let h = ist.getUTCHours();
    const m = String(ist.getUTCMinutes()).padStart(2, "0");
    const s = String(ist.getUTCSeconds()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    el.textContent = `IST ${String(h).padStart(2, "0")}:${m}:${s} ${ampm}`;
  }

  tick();
  setInterval(tick, 1000);
})();

// ============================================
//   CUSTOM CURSOR
// ============================================
const cursor = document.getElementById("cursor");
const cursorDot = document.getElementById("cursor-dot");
let mouseX = 0,
  mouseY = 0;
let curX = 0,
  curY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + "px";
  cursorDot.style.top = mouseY + "px";
});

(function loopCursor() {
  curX += (mouseX - curX) * 0.1;
  curY += (mouseY - curY) * 0.1;
  cursor.style.left = curX + "px";
  cursor.style.top = curY + "px";
  requestAnimationFrame(loopCursor);
})();

document.querySelectorAll("a, button").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cursor.style.transform = "translate(-50%,-50%) scale(1.8)";
    cursor.style.borderColor = "rgba(201,168,76,0.5)";
    cursor.style.background = "rgba(201,168,76,0.06)";
  });
  el.addEventListener("mouseleave", () => {
    cursor.style.transform = "translate(-50%,-50%) scale(1)";
    cursor.style.borderColor = "var(--gold)";
    cursor.style.background = "transparent";
  });
});

// ============================================
//   NAV — scrolled class + active link
// ============================================
const nav = document.querySelector("nav");
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll("nav ul a");

window.addEventListener(
  "scroll",
  () => {
    nav.classList.toggle("scrolled", window.scrollY > 50);

    let current = "";
    sections.forEach((s) => {
      if (window.scrollY >= s.offsetTop - 150) current = s.id;
    });

    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === "#" + current;
      link.classList.toggle("active", active);
    });
  },
  { passive: true },
);

// ============================================
//   SMOOTH ANCHOR SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ============================================
//   SCROLL REVEAL — staggered siblings
// ============================================
const revealTargets = document.querySelectorAll(
  ".project-card, .skill-group, .about-text, .about-facts, .contact-item",
);

const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      // Compute stagger index among siblings of same class
      const cls = entry.target.classList[0];
      const siblings = cls
        ? [...(entry.target.parentElement?.children || [])].filter((c) =>
            c.classList.contains(cls),
          )
        : [];
      const idx = siblings.indexOf(entry.target);
      const delay = Math.max(idx, 0) * 75;

      setTimeout(() => {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }, delay);

      revealObs.unobserve(entry.target);
    });
  },
  { threshold: 0.1 },
);

revealTargets.forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  el.style.transition = "opacity 0.72s ease, transform 0.72s ease";
  revealObs.observe(el);
});

// ============================================
//   SKILL BARS
// ============================================
const skillObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animated");
        skillObs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 },
);

document.querySelectorAll(".skill-bar").forEach((b) => skillObs.observe(b));

// ============================================
//   PROJECT CARD — subtle 3-D tilt on hover
// ============================================
document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    card.style.transform = `perspective(900px) rotateX(${dy * -2.5}deg) rotateY(${dx * 2.5}deg) translateZ(4px)`;
    card.style.transition = "transform 0.08s ease, background 0.35s";
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
    card.style.transition = "transform 0.55s ease, background 0.35s";
  });
});
