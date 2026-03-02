// =====================
// Floating shapes — subtle interactive background
// Tiny geometric shapes (circles, triangles, squares)
// that drift slowly, rotate, and gently repel from cursor
// =====================
function initFloatingShapes() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h;
  let mouse = { x: -9999, y: -9999 };
  let shapes = [];

  const SHAPE_COUNT = 35;
  const MOUSE_RADIUS = 120;
  const PUSH = 0.4;

  const palette = [
    'rgba(199,75,42,',     // warm terracotta
    'rgba(138,132,120,',   // stone
    'rgba(181,175,166,',   // light stone
    'rgba(17,17,17,',      // ink
  ];

  const TYPES = ['circle', 'triangle', 'square', 'ring', 'cross', 'diamond'];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createShape() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      size: Math.random() * 6 + 3,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      type: TYPES[Math.floor(Math.random() * TYPES.length)],
      color: palette[Math.floor(Math.random() * palette.length)],
      opacity: Math.random() * 0.06 + 0.03,
      baseOpacity: 0,
    };
  }

  function init() {
    shapes = [];
    for (let i = 0; i < SHAPE_COUNT; i++) {
      const s = createShape();
      s.baseOpacity = s.opacity;
      shapes.push(s);
    }
  }

  function drawShape(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);
    ctx.fillStyle = s.color + s.opacity + ')';
    ctx.strokeStyle = s.color + s.opacity + ')';
    ctx.lineWidth = 0.8;

    switch (s.type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, s.size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'ring':
        ctx.beginPath();
        ctx.arc(0, 0, s.size, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'square':
        ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size);
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -s.size);
        ctx.lineTo(s.size * 0.866, s.size * 0.5);
        ctx.lineTo(-s.size * 0.866, s.size * 0.5);
        ctx.closePath();
        ctx.fill();
        break;

      case 'cross':
        const t = s.size * 0.2;
        ctx.fillRect(-s.size, -t, s.size * 2, t * 2);
        ctx.fillRect(-t, -s.size, t * 2, s.size * 2);
        break;

      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -s.size);
        ctx.lineTo(s.size * 0.6, 0);
        ctx.lineTo(0, s.size);
        ctx.lineTo(-s.size * 0.6, 0);
        ctx.closePath();
        ctx.stroke();
        break;
    }

    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);

    for (const s of shapes) {
      // Mouse interaction — gentle repulsion
      const dx = s.x - mouse.x;
      const dy = s.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * PUSH;
        s.vx += (dx / dist) * force;
        s.vy += (dy / dist) * force;
        // Brighten near cursor
        s.opacity = s.baseOpacity + (1 - dist / MOUSE_RADIUS) * 0.12;
        // Spin faster near cursor
        s.rotation += s.rotSpeed * 3;
      } else {
        s.opacity += (s.baseOpacity - s.opacity) * 0.05;
        s.rotation += s.rotSpeed;
      }

      // Damping
      s.vx *= 0.985;
      s.vy *= 0.985;

      s.x += s.vx;
      s.y += s.vy;

      // Wrap edges
      if (s.x < -30) s.x = w + 30;
      if (s.x > w + 30) s.x = -30;
      if (s.y < -30) s.y = h + 30;
      if (s.y > h + 30) s.y = -30;

      drawShape(s);
    }

    requestAnimationFrame(animate);
  }

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', () => {
    resize();
    init();
  });

  resize();
  init();
  animate();
}

// =====================
// Scroll reveals
// =====================
function initReveals() {
  const els = document.querySelectorAll('.reveal, .line-reveal');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
}

// =====================
// Section numbers warm on scroll
// =====================
function initNumbers() {
  const nums = document.querySelectorAll('.ed-num');
  nums.forEach(num => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          num.style.transition = 'color 1s ease';
          num.style.color = 'rgba(199, 75, 42, 0.12)';
          obs.unobserve(num);
        }
      });
    }, { threshold: 0.5 });
    obs.observe(num);
  });
}

// =====================
// Copy BibTeX
// =====================
function copyBibtex() {
  const code = document.getElementById('bibtex-code');
  if (!code) return;
  navigator.clipboard.writeText(code.textContent).then(() => {
    const btn = document.querySelector('.bibtex-copy');
    btn.innerHTML = '<i class="fas fa-check"></i> Copied';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
      btn.classList.remove('copied');
    }, 2000);
  });
}

// =====================
// Scroll to top
// =====================
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', () => {
  const btn = document.querySelector('.scroll-top');
  if (btn) btn.classList.toggle('visible', window.pageYOffset > 500);
}, { passive: true });

// =====================
// Grain texture generator
// =====================
function initGrain() {
  const canvas = document.getElementById('grain-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Small canvas, tiled via CSS
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 255;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 18; // very subtle
  }

  ctx.putImageData(imageData, 0, 0);
}

// =====================
// Init
// =====================
document.addEventListener('DOMContentLoaded', () => {
  initGrain();
  initFloatingShapes();
  initReveals();
  initNumbers();
});
