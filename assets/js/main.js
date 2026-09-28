// Adds a .js hook so CSS can safely style for "JS present" only —
// the .reveal styles in style.css are inert unless this runs.
document.documentElement.classList.add("js");

var REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- Scroll reveal -------------------------------------------------
// Elements start hidden only via CSS gated on .js; if this script fails
// to run or IntersectionObserver is unavailable, content stays visible.
(function () {
  var targets = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || targets.length === 0) {
    targets.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
  );
  targets.forEach(function (el) { io.observe(el); });
})();

// ---- Background node network ----------------------------------------
// A sparse, slow-drifting graph rather than a gradient; nodes gently
// yield away from the cursor. Skipped entirely under reduced motion.
// The canvas box is sized by CSS (100% of the viewport). JS only reads that
// box to set the drawing resolution, so it can never feed back into layout.
(function () {
  var canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  if (REDUCE_MOTION) { canvas.remove(); return; }

  var ctx = canvas.getContext("2d");
  var w = 0, h = 0, dpr = 1, points = [];
  var lastCssW = 0;
  var mouse = { x: null, y: null };
  var raf = 0;

  function seed(cssW, cssH) {
    var count = Math.max(18, Math.min(70, Math.floor((cssW * cssH) / 20000)));
    points = [];
    for (var i = 0; i < count; i++) {
      points.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18 * dpr,
        vy: (Math.random() - 0.5) * 0.18 * dpr
      });
    }
  }

  function resize() {
    var cssW = canvas.clientWidth;
    var cssH = canvas.clientHeight;
    if (!cssW || !cssH) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.floor(cssW * dpr);
    h = canvas.height = Math.floor(cssH * dpr);
    // Phones fire resize when the URL bar shows/hides (height only). Keep the
    // existing nodes in that case instead of re-randomising them mid-scroll.
    if (cssW !== lastCssW || !points.length) {
      seed(cssW, cssH);
    } else {
      points.forEach(function (p) {
        if (p.x > w) p.x = w;
        if (p.y > h) p.y = h;
      });
    }
    lastCssW = cssW;
  }

  function step() {
    raf = requestAnimationFrame(step);
    ctx.clearRect(0, 0, w, h);
    var linkDist = 130 * dpr;
    var pullDist = 150 * dpr;

    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      if (mouse.x !== null) {
        var dx = p.x - mouse.x * dpr;
        var dy = p.y - mouse.y * dpr;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < pullDist && d > 0.01) {
          var force = (1 - d / pullDist) * 1.1;
          p.x += (dx / d) * force;
          p.y += (dy / d) * force;
        }
      }
    }

    for (var a = 0; a < points.length; a++) {
      for (var b = a + 1; b < points.length; b++) {
        var pa = points[a], pb = points[b];
        var ddx = pa.x - pb.x, ddy = pa.y - pb.y;
        var dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < linkDist) {
          ctx.strokeStyle = "rgba(79, 209, 197, " + (0.16 * (1 - dist / linkDist)) + ")";
          ctx.lineWidth = dpr;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
      }
    }
    for (var k = 0; k < points.length; k++) {
      ctx.fillStyle = "rgba(138, 147, 160, 0.55)";
      ctx.beginPath();
      ctx.arc(points[k].x, points[k].y, 1.6 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function start() {
    cancelAnimationFrame(raf); // never run two loops at once
    raf = requestAnimationFrame(step);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener("mouseleave", function () {
    mouse.x = null;
    mouse.y = null;
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) cancelAnimationFrame(raf);
    else start();
  });

  resize();
  start();
})();

// ---- Page fade transition ---------------------------------------------
// Manual fade-out on internal-link click, then navigate; the fade-in on
// the arriving page is handled purely by CSS (the page-in keyframe).
// This works in every browser, unlike the experimental View Transitions API.
(function () {
  if (REDUCE_MOTION) return;
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    if (a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (a.protocol !== "http:" && a.protocol !== "https:") return; // mailto:, tel:
    if (a.origin !== window.location.origin) return; // external site
    if (a.pathname.indexOf("/assets/") !== -1) return; // downloads (résumé PDF, etc.)
    if (a.href === window.location.href) return; // link to the current page
    e.preventDefault();
    document.body.classList.add("is-leaving");
    setTimeout(function () {
      window.location.href = a.href;
    }, 180);
  });
})();

// ---- Accessible accordion -------------------------------------------
// Works for any number of .accordion-trigger / .accordion-panel pairs.
(function () {
  var triggers = document.querySelectorAll(".accordion-trigger");
  triggers.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!isOpen));
      if (!panel) return;
      if (isOpen) {
        panel.style.maxHeight = "0px";
        panel.classList.remove("is-open");
      } else {
        panel.classList.add("is-open");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
  // The open height is a fixed pixel value; re-measure if the layout reflows
  // (phone rotated, window resized) so nothing gets clipped.
  window.addEventListener("resize", function () {
    document.querySelectorAll(".accordion-panel.is-open").forEach(function (p) {
      p.style.maxHeight = p.scrollHeight + "px";
    });
  });
})();
