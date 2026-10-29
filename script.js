/* ============================================================
   PROJECT CUPID — script.js
   All interactive functionality for the birthday website
   ============================================================ */

'use strict';

/* ── Gallery Data ────────────────────────────────────────────── */
// Edit captions here to match your polaroids in index.html
const GALLERY = [
  { src: 'photos/photo-1.jpg', alt: 'A cherished memory — the day we met',       caption: 'the day we met ♡',          icon: '✿' },
  { src: 'photos/photo-2.jpg', alt: 'Our first adventure together',               caption: 'our first adventure ✈',    icon: '🌸' },
  { src: 'photos/photo-3.jpg', alt: 'The moment we laughed until we cried',       caption: 'laughing until we cried 😂', icon: '♡' },
  { src: 'photos/photo-4.jpg', alt: 'A quiet Sunday morning together',            caption: 'quiet Sunday mornings ☕',  icon: '☀' },
  { src: 'photos/photo-5.jpg', alt: 'You, always beautiful',                      caption: 'you, always beautiful 🌷', icon: '🌷' },
  { src: 'photos/photo-6.jpg', alt: 'My favourite person in the world',           caption: 'my favourite person ✦',    icon: '✦' },
];

/* ── Helper: prefer reduced motion ──────────────────────────── */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Scroll-triggered entrance animations ───────────────────── */
function initScrollObserver() {
  const sections = document.querySelectorAll('.section');
  if (!('IntersectionObserver' in window)) {
    sections.forEach(s => s.style.opacity = '1');
    return;
  }

  const opts = { threshold: 0.12, rootMargin: '0px 0px -60px 0px' };
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section--visible');
        obs.unobserve(entry.target);
      }
    });
  }, opts);

  sections.forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(28px)';
    s.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    obs.observe(s);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollObserver();
});

// Polyfill for section visible
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `.section--visible { opacity: 1 !important; transform: translateY(0) !important; }`;
  document.head.appendChild(style);
});


/* ============================================================
   INTRO → MAIN TRANSITION
   ============================================================ */
function openSurprise() {
  const intro = document.getElementById('intro-screen');
  const main  = document.getElementById('main-site');

  if (!intro || !main) return;

  intro.classList.add('hidden');

  // Wait for fade-out, then reveal main
  setTimeout(() => {
    intro.setAttribute('aria-hidden', 'true');
    intro.setAttribute('inert', '');
    main.classList.add('visible');
    // Remove hidden from intro so screen readers skip it
    intro.style.display = 'none';
    // Focus the hero heading for accessibility
    const heroHeading = document.getElementById('hero-heading');
    if (heroHeading) heroHeading.focus({ preventScroll: true });
  }, 800);
}


/* ============================================================
   ENVELOPE + LETTER
   ============================================================ */
let envelopeOpen = false;

function toggleEnvelope() {
  const env    = document.getElementById('envelope');
  const letter = document.getElementById('letter');
  if (!env || !letter) return;

  envelopeOpen = !envelopeOpen;

  env.classList.toggle('open', envelopeOpen);
  env.setAttribute('aria-expanded', String(envelopeOpen));
  letter.setAttribute('aria-hidden', String(!envelopeOpen));

  if (envelopeOpen) {
    letter.classList.add('open');
    // Smooth scroll to letter after it opens
    setTimeout(() => {
      letter.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 400);
  } else {
    letter.classList.remove('open');
  }
}

function handleEnvelopeKey(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleEnvelope();
  }
}


/* ============================================================
   GALLERY LIGHTBOX
   ============================================================ */
let currentLightboxIndex = 0;
let touchStartX = 0;
let touchStartY = 0;

function openLightbox(index) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  currentLightboxIndex = index;
  updateLightboxSlide();

  lightbox.removeAttribute('hidden');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Focus the close button
  setTimeout(() => {
    const closeBtn = lightbox.querySelector('.lightbox__close');
    if (closeBtn) closeBtn.focus();
  }, 100);
}

function updateLightboxSlide() {
  const lightbox   = document.getElementById('lightbox');
  const img        = document.getElementById('lightbox-img');
  const caption    = document.getElementById('lightbox-caption');
  const placeholder = document.getElementById('lightbox-placeholder');
  const prevBtn    = document.getElementById('lb-prev');
  const nextBtn    = document.getElementById('lb-next');

  if (!lightbox || !img || !caption) return;

  const item = GALLERY[currentLightboxIndex];
  if (!item) return;

  // Animate slide change
  const polaroid = lightbox.querySelector('.lightbox__polaroid');
  if (polaroid) {
    polaroid.style.opacity = '0';
    polaroid.style.transform = 'scale(0.95)';
    setTimeout(() => {
      polaroid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      polaroid.style.opacity = '1';
      polaroid.style.transform = 'scale(1)';
    }, 50);
  }

  // Reset image state
  const imgWrap = lightbox.querySelector('.lightbox__img-wrap');
  if (imgWrap) imgWrap.classList.remove('has-error');

  img.src = item.src;
  img.alt = item.alt;
  caption.textContent = item.caption;

  if (placeholder) placeholder.textContent = item.icon;

  // Show/hide placeholder based on image load
  img.style.display = '';
  if (placeholder) placeholder.style.display = 'none';

  img.onerror = () => {
    img.style.display = 'none';
    if (placeholder) placeholder.style.display = '';
  };
  img.onload = () => {
    img.style.display = '';
    if (placeholder) placeholder.style.display = 'none';
  };

  // Disable prev/next at boundaries
  if (prevBtn) prevBtn.disabled = currentLightboxIndex === 0;
  if (nextBtn) nextBtn.disabled = currentLightboxIndex === GALLERY.length - 1;
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lightbox.setAttribute('hidden', '');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // Return focus to the triggering polaroid
  const polaroid = document.querySelector(`.polaroid[data-index="${currentLightboxIndex}"]`);
  if (polaroid) polaroid.focus();
}

function lightboxPrev() {
  if (currentLightboxIndex > 0) {
    currentLightboxIndex--;
    updateLightboxSlide();
  }
}

function lightboxNext() {
  if (currentLightboxIndex < GALLERY.length - 1) {
    currentLightboxIndex++;
    updateLightboxSlide();
  }
}

function handlePolaroidKey(event, index) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openLightbox(index);
  }
}

/* Keyboard navigation for lightbox */
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || lightbox.hasAttribute('hidden')) return;

  switch (e.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      lightboxPrev();
      break;
    case 'ArrowRight':
      e.preventDefault();
      lightboxNext();
      break;
  }
});

/* Touch / swipe support for lightbox */
document.addEventListener('touchstart', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || lightbox.hasAttribute('hidden')) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || lightbox.hasAttribute('hidden')) return;

  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  // Only treat as horizontal swipe if clearly more horizontal than vertical
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    if (dx < 0) lightboxNext();
    else        lightboxPrev();
  }
}, { passive: true });

/* Trap focus inside lightbox */
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || lightbox.hasAttribute('hidden')) return;
  if (e.key !== 'Tab') return;

  const focusable = [...lightbox.querySelectorAll(
    'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )];
  if (!focusable.length) return;

  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});


/* ============================================================
   FLIP CARDS
   ============================================================ */
function flipCard(cardEl) {
  const isFlipped = cardEl.classList.toggle('flipped');
  cardEl.setAttribute('aria-pressed', String(isFlipped));

  // Announce to screen readers
  const back = cardEl.querySelector('.flip-card__back');
  if (back) {
    back.setAttribute('aria-hidden', String(!isFlipped));
  }
  const front = cardEl.querySelector('.flip-card__front');
  if (front) {
    front.setAttribute('aria-hidden', String(isFlipped));
  }
}

function handleCardKey(event, cardEl) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    flipCard(cardEl);
  }
}


/* ============================================================
   FINALE — HEART SHOWER + REVEAL
   ============================================================ */
const HEART_SYMBOLS = ['♡', '♥', '❤', '🌸', '✿', '✦'];
let finaleActive = false;

function triggerFinale() {
  if (finaleActive) return;
  finaleActive = true;

  const teaser  = document.getElementById('finale-teaser');
  const reveal  = document.getElementById('finale-reveal');
  const heartsEl = document.getElementById('finale-hearts');

  if (!teaser || !reveal) return;

  // Hide teaser
  teaser.classList.add('hidden');

  // Show reveal
  reveal.setAttribute('aria-hidden', 'false');
  reveal.classList.add('visible');

  // Start heart shower
  if (!prefersReducedMotion() && heartsEl) {
    launchHearts(heartsEl);
  }

  // Scroll into view
  setTimeout(() => {
    reveal.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 200);
}

function launchHearts(container) {
  const total = 60;
  let launched = 0;

  function spawnHeart() {
    if (launched >= total) return;
    launched++;

    const heart = document.createElement('span');
    heart.className = 'finale-heart';
    heart.setAttribute('aria-hidden', 'true');
    heart.textContent = HEART_SYMBOLS[Math.floor(Math.random() * HEART_SYMBOLS.length)];

    // Random position and timing
    const leftPct = Math.random() * 100;
    const duration = 3.5 + Math.random() * 3;
    const delay = Math.random() * 3;
    const size  = 0.8 + Math.random() * 1.4;
    const opacity = 0.5 + Math.random() * 0.5;

    heart.style.cssText = `
      left: ${leftPct}%;
      font-size: ${size}rem;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      color: hsl(${340 + Math.random() * 30}, ${60 + Math.random() * 20}%, ${60 + Math.random() * 15}%);
    `;

    container.appendChild(heart);

    // Remove after animation completes
    const totalMs = (duration + delay) * 1000 + 200;
    setTimeout(() => {
      heart.remove();
    }, totalMs);

    // Stagger next heart
    const nextDelay = 80 + Math.random() * 120;
    setTimeout(spawnHeart, nextDelay);
  }

  spawnHeart();
}


/* ============================================================
   POLYFILL: HTMLElement.inert (simple fallback)
   ============================================================ */
if (!('inert' in HTMLElement.prototype)) {
  Object.defineProperty(HTMLElement.prototype, 'inert', {
    get() { return this.hasAttribute('inert'); },
    set(val) {
      if (val) this.setAttribute('inert', '');
      else this.removeAttribute('inert');
    },
  });
}
