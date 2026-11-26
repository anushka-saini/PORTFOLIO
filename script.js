document.documentElement.classList.add('js');

// fade in on scroll
const io = new IntersectionObserver(es => {
  es.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.rev').forEach(el => io.observe(el));

// top progress bar
const bar = document.getElementById('bar');
addEventListener('scroll', () => {
  const max = document.body.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${scrollY / max})`;
});

// glow follows the mouse
const hd = document.querySelector('header');
hd.addEventListener('mousemove', e => {
  const r = hd.getBoundingClientRect();
  hd.style.setProperty('--x', e.clientX - r.left + 'px');
  hd.style.setProperty('--y', e.clientY - r.top + 'px');
});

// count up the numbers
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('[data-n]').forEach(el => {
  if (calm) return;
  const n = Number(el.dataset.n);
  const d = (el.dataset.n.split('.')[1] || '').length;
  let t0;
  function step(t) {
    t0 = t0 || t;
    const p = Math.min((t - t0) / 1200, 1);
    el.textContent = (n * p).toFixed(d) + (el.dataset.s || '');
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
});
