document.addEventListener('DOMContentLoaded', function () {

  // fade the page in once it's ready (no spinner, just avoids a flash)
  requestAnimationFrame(function () {
    document.body.classList.add('loaded');
  });

  // mobile nav toggle
  var navToggle = document.getElementById('navToggle');
  var topnav = document.getElementById('topnav');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      topnav.classList.toggle('open');
    });
    topnav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { topnav.classList.remove('open'); });
    });
  }

  // avatar fallback wherever a photo slot exists but profile.jpg is missing
  document.querySelectorAll('[data-avatar-img]').forEach(function (img) {
    img.addEventListener('error', function () {
      img.style.display = 'none';
      var fallback = img.nextElementSibling;
      if (fallback) { fallback.style.display = 'flex'; }
    });
  });

  // staggered fade-in for elements as they're scrolled onto —
  // anything already in the initial viewport is left alone so nothing flashes on load
  var revealEls = document.querySelectorAll('.reveal');
  revealEls.forEach(function (el, i) {
    el.style.setProperty('--i', i % 6);
    var rect = el.getBoundingClientRect();
    if (rect.top >= window.innerHeight) {
      el.classList.add('prep');
    }
  });

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.remove('prep');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal.prep').forEach(function (el) { revealObserver.observe(el); });
  } else {
    document.querySelectorAll('.reveal.prep').forEach(function (el) { el.classList.remove('prep'); });
  }
});
