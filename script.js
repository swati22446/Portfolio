// ============================================
//   SWATI PORTFOLIO — script.js
// ============================================

// ===== PAGE LOADER =====
(function () {
  const loader = document.createElement("div");
  loader.className = "page-loader";
  loader.innerHTML = `<span class="page-loader-inner">sw.</span>`;
  document.body.prepend(loader);
  setTimeout(() => loader.remove(), 1500);
})();

// ===== CUSTOM CURSOR =====
const cursor = document.getElementById("cursor");
const cursorDot = document.getElementById("cursor-dot");

let mouseX = 0,
  mouseY = 0;
let cursorX = 0,
  cursorY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + "px";
  cursorDot.style.top = mouseY + "px";
});

(function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.1;
  cursorY += (mouseY - cursorY) * 0.1;
  cursor.style.left = cursorX + "px";
  cursor.style.top = cursorY + "px";
  requestAnimationFrame(animateCursor);
})();

document.querySelectorAll("a, button").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(1.8)";
    cursor.style.borderColor = "rgba(201,168,76,0.5)";
    cursor.style.background = "rgba(201,168,76,0.06)";
  });
  el.addEventListener("mouseleave", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(1)";
    cursor.style.borderColor = "var(--gold)";
    cursor.style.background = "transparent";
  });
});

// ===== FOOTER YEAR =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== NAV SCROLL CLASS =====
const nav = document.querySelector("nav");
window.addEventListener(
  "scroll",
  () => {
    nav.classList.toggle("scrolled", window.scrollY > 60);
  },
  { passive: true },
);

// ============================================
//   STAR FIELD — fixed canvas, full page
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

  // ── Star generation ──────────────────────────────────
  const TOTAL = 320;
  const stars = [];

  function pickRadius() {
    const r = Math.random();
    if (r < 0.62) return 0.28 + Math.random() * 0.42; // tiny   62%
    if (r < 0.88) return 0.72 + Math.random() * 0.52; // medium 26%
    return 1.28 + Math.random() * 0.88; // bright 12%
  }

  for (let i = 0; i < TOTAL; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      r: pickRadius(),
      baseA: 0.18 + Math.random() * 0.72,
      gold: Math.random() < 0.1, // 10% warm gold
      blue: Math.random() < 0.08, // 8%  cool blue-white
      phase: Math.random() * Math.PI * 2,
      speed: 0.25 + Math.random() * 0.9,
    });
  }

  // ── Draw helpers ─────────────────────────────────────
  function starColor(s, a) {
    if (s.gold) return `rgba(232,196,110,${a})`;
    if (s.blue) return `rgba(196,218,255,${a})`;
    return `rgba(240,234,214,${a})`;
  }

  // 4-point diffraction spike for brightest stars
  function drawSpike(s, px, py, a) {
    const arm = s.r * 4.2;
    ctx.save();
    ctx.strokeStyle = starColor(s, a * 0.45);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(px - arm, py);
    ctx.lineTo(px + arm, py);
    ctx.moveTo(px, py - arm);
    ctx.lineTo(px, py + arm);
    ctx.stroke();
    ctx.restore();
  }

  // Soft glow for medium+ stars
  function drawGlow(s, px, py, a) {
    const g = ctx.createRadialGradient(px, py, 0, px, py, s.r * 3.5);
    g.addColorStop(0, starColor(s, a * 0.28));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.arc(px, py, s.r * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  // ── Animation loop ───────────────────────────────────
  let prev = performance.now();

  function draw(now) {
    const dt = Math.min((now - prev) / 1000, 0.05); // cap dt at 50ms
    prev = now;

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.phase += s.speed * dt;

      // Smooth, non-linear twinkle
      const tw = 0.5 + 0.5 * Math.sin(s.phase);
      const tw2 = tw * tw; // squared → snappier bright peaks
      const a = s.baseA * (0.45 + 0.55 * tw2);

      const px = s.x * W;
      const py = s.y * H;

      // Glow halo for medium / bright stars
      if (s.r >= 0.72) drawGlow(s, px, py, a);

      // Core dot
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = starColor(s, a);
      ctx.fill();

      // Diffraction spike only on the brightest
      if (s.r >= 1.28) drawSpike(s, px, py, a);
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();

// ============================================
//   SCROLL REVEAL — staggered per group
// ============================================
const revealEls = document.querySelectorAll(
  ".project-card, .skill-group, .about-text, .about-facts, .contact-item, .section-label, h2",
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings within a grid
        const siblings = entry.target.parentElement
          ? [...entry.target.parentElement.children].filter((c) =>
              c.classList.contains(entry.target.classList[0]),
            )
          : [];
        const idx = siblings.indexOf(entry.target);
        const delay = idx >= 0 ? idx * 80 : 0;

        setTimeout(() => {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }, delay);

        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);

revealEls.forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(22px)";
  el.style.transition = "opacity 0.75s ease, transform 0.75s ease";
  revealObserver.observe(el);
});

// ============================================
//   SKILL BARS — animate width on scroll
// ============================================
const skillBars = document.querySelectorAll(".skill-bar");

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animated");
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 },
);

skillBars.forEach((bar) => skillObserver.observe(bar));

// ============================================
//   ACTIVE NAV HIGHLIGHT ON SCROLL
// ============================================
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll("nav ul a");

window.addEventListener(
  "scroll",
  () => {
    let current = "";
    sections.forEach((s) => {
      if (window.scrollY >= s.offsetTop - 140) current = s.id;
    });
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === "#" + current;
      link.style.color = isActive ? "var(--gold)" : "";
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
//   HERO TAG TYPEWRITER (subtle)
// ============================================
(function typewriter() {
  const tag = document.querySelector(".hero-tag");
  if (!tag) return;
  const full = tag.textContent.trim();
  tag.textContent = "";
  tag.style.opacity = "1";
  tag.style.animation = "none";

  let i = 0;
  const interval = setInterval(() => {
    tag.textContent = full.slice(0, i + 1);
    i++;
    if (i >= full.length) clearInterval(interval);
  }, 48);
})();

// ============================================
//   PROJECT CARD — magnetic tilt on hover
// ============================================
document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const tiltX = dy * -3;
    const tiltY = dx * 3;
    card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(4px)`;
    card.style.transition = "transform 0.1s ease, background 0.35s";
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
    card.style.transition = "transform 0.5s ease, background 0.35s";
  });
});
