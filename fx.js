const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mouse = matchMedia('(pointer: fine)').matches;

// spinning globe of data points
const cv = document.getElementById('globe');
const cx = cv.getContext('2d');
const N = 220;
const pts = [];
for (let i = 0; i < N; i++) {
  const y = 1 - 2 * (i + 0.5) / N;
  const r = Math.sqrt(1 - y * y);
  const a = i * 2.39996;
  pts.push([r * Math.cos(a), y, r * Math.sin(a)]);
}
let ang = 0, seen = true;
new IntersectionObserver(e => seen = e[0].isIntersecting).observe(cv);

function draw() {
  const w = cv.width = cv.offsetWidth;
  const h = cv.height = cv.offsetHeight;
  const s = w * 0.42;
  const q = pts.map(([x, y, z]) => {
    const rx = x * Math.cos(ang) - z * Math.sin(ang);
    const rz = x * Math.sin(ang) + z * Math.cos(ang);
    return [w / 2 + rx * s, h / 2 + y * s, (rz + 1) / 2];
  });
  q.forEach((a, i) => {
    cx.fillStyle = `rgba(255,111,97,${0.15 + a[2] * 0.8})`;
    cx.beginPath();
    cx.arc(a[0], a[1], 1 + a[2] * 2, 0, 7);
    cx.fill();
    for (let j = i + 1; j < N; j++) {
      const b = q[j];
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < s * 0.2) {
        cx.strokeStyle = `rgba(255,111,97,${a[2] * b[2] * 0.25})`;
        cx.beginPath();
        cx.moveTo(a[0], a[1]);
        cx.lineTo(b[0], b[1]);
        cx.stroke();
      }
    }
  });
}
function loop() {
  if (seen) { ang += 0.003; draw(); }
  requestAnimationFrame(loop);
}
still ? draw() : loop();

// headings drawn out of dots, sized to always fit
const heads = document.querySelectorAll('.dots');
function dotty() {
  heads.forEach(el => {
    const t = el.getAttribute('aria-label').toUpperCase();
    const w = el.clientWidth;
    const k = devicePixelRatio || 1;
    const a = document.createElement('canvas');
    const g = a.getContext('2d');
    g.font = '700 100px sans-serif';
    const size = Math.min(100 * w * 0.96 / g.measureText(t).width, 92);
    const h = Math.ceil(size * 1.3);
    a.width = w;
    a.height = h;
    g.font = `700 ${size}px sans-serif`;
    g.textAlign = 'center';
    const base = Math.round(size);
    g.fillText(t, w / 2, base);
    const px = g.getImageData(0, 0, w, h).data;

    const c = document.createElement('canvas');
    c.width = w * k;
    c.height = h * k;
    const x = c.getContext('2d');
    x.scale(k, k);
    x.fillStyle = '#f4eeea';
    const gap = Math.max(3, Math.round(size / 18));
    // rows start just above the baseline so letters get no stray dots below
    for (let j = base - 2; j > 0; j -= gap) {
      for (let i = 0; i < w; i += gap) {
        if (px[(j * w + i) * 4 + 3] > 128) {
          x.beginPath();
          x.arc(i, j, gap * 0.38, 0, 7);
          x.fill();
        }
      }
    }
    el.replaceChildren(c);
  });
}
dotty();
addEventListener('resize', dotty);

// small cursor: a dot and a thin ring
if (mouse && !still) {
  document.documentElement.classList.add('fine');
  document.body.insertAdjacentHTML('beforeend', '<div id="dot"></div><div id="aim"></div>');
  const dot = document.getElementById('dot');
  const aim = document.getElementById('aim');
  let mx = -99, my = -99, ax = -99, ay = -99;
  addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.translate = `${mx}px ${my}px`;
    aim.classList.toggle('on', !!e.target.closest('a'));
  });
  (function follow() {
    ax += (mx - ax) * 0.3;
    ay += (my - ay) * 0.3;
    aim.style.translate = `${ax}px ${ay}px`;
    requestAnimationFrame(follow);
  })();
}
