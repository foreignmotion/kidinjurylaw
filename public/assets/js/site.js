// Mobile menu disclosure (header menu button below 1200px).
(function () {
  var button = document.querySelector('.icon-btn--menu');
  var menu = document.getElementById('mobile-menu');
  if (!button || !menu) return;

  function setOpen(open) {
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
  }

  button.addEventListener('click', function () {
    var open = button.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
    if (open) menu.querySelector('a').focus();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      button.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (!menu.hidden && !menu.contains(e.target) && !button.contains(e.target)) setOpen(false);
  });
})();

// Mobile sticky action bar: hidden on load, slides in once the visitor scrolls.
(function () {
  var bar = document.querySelector('.action-bar');
  if (!bar) return;
  var SHOW_AFTER = 24; // px scrolled

  function update() {
    bar.classList.toggle('is-visible', window.scrollY > SHOW_AFTER);
  }

  window.addEventListener('scroll', update, { passive: true });
  update(); // covers reloads mid-page and #anchor links
})();

// Table of contents (posts with headings): highlight the section being read.
(function () {
  var links = [].slice.call(document.querySelectorAll('.toc a'));
  if (!links.length) return;
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var ticking = false;
  function update() {
    ticking = false;
    var line = window.innerHeight * 0.35, current = -1;
    targets.forEach(function (el, i) { if (el && el.getBoundingClientRect().top <= line) current = i; });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === current); });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();
