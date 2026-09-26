// Adds a .js hook so CSS can safely style for "JS present" only —
// the .reveal styles in style.css are inert unless this runs.
document.documentElement.classList.add("js");

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
