// mobile nav toggle
var navToggle = document.getElementById('navToggle');
var topnav = document.getElementById('topnav');
if(navToggle){
  navToggle.addEventListener('click', function(){
    topnav.classList.toggle('open');
  });
  topnav.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){ topnav.classList.remove('open'); });
  });
}

// avatar fallback wherever a photo slot exists but profile.jpg is missing
document.querySelectorAll('[data-avatar-img]').forEach(function(img){
  img.addEventListener('error', function(){
    img.style.display = 'none';
    var fallback = img.nextElementSibling;
    if(fallback){ fallback.style.display = 'flex'; }
  });
});

// fade-in reveal for elements below the fold
var revealEls = document.querySelectorAll('.reveal');
revealEls.forEach(function(el, i){
  if(i > 0){ el.classList.add('prep'); }
});

if('IntersectionObserver' in window){
  var revealObserver = new IntersectionObserver(function(entries, obs){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        entry.target.classList.remove('prep');
        obs.unobserve(entry.target);
      }
    });
  }, {threshold:0.15});
  document.querySelectorAll('.reveal.prep').forEach(function(el){ revealObserver.observe(el); });
} else {
  document.querySelectorAll('.reveal.prep').forEach(function(el){ el.classList.remove('prep'); });
}
