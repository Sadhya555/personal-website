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
// A sparse, slow-drifting graph rather than a gradient — nodes gently
// yield away from the cursor. Skipped entirely under reduced motion.
(function () {
  var canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  if (REDUCE_MOTION) { canvas.remove(); return; }

  var ctx = canvas.getContext("2d");
  var w, h, dpr, points;
  var mouse = { x: null, y: null };
  var visible = true;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    var count = Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / 24000));
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

  function step() {
    if (!visible) return;
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

    for (var i = 0; i < points.length; i++) {
      for (var j = i + 1; j < points.length; j++) {
        var a = points[i], b = points[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDist) {
          ctx.strokeStyle = "rgba(79, 209, 197, " + (0.16 * (1 - dist / linkDist)) + ")";
          ctx.lineWidth = dpr;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (var i = 0; i < points.length; i++) {
      ctx.fillStyle = "rgba(138, 147, 160, 0.55)";
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 1.6 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
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
    visible = !document.hidden;
    if (visible) requestAnimationFrame(step);
  });

  resize();
  requestAnimationFrame(step);
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
})();
