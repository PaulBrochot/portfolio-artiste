/* Navigation scroll effect */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* Mobile nav */
const toggle  = document.getElementById('navToggle');
const overlay = document.getElementById('navOverlay');
const close   = document.getElementById('navClose');

if (toggle && overlay) {
  toggle.addEventListener('click', () => {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });
}

if (close && overlay) {
  close.addEventListener('click', () => {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  });
}

/* Close overlay on link click */
if (overlay) {
  overlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });
}

/* Form submit feedback */
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.textContent = 'Message envoyé';
      btn.disabled = true;
      btn.style.opacity = '0.6';
    }
  });
});
