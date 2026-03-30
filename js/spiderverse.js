/* ============================================
   SPIDER-VERSE CINEMATIC EFFECTS
   Frame-rate drops, chromatic aberration,
   halftone patterns, glitch effects
   ============================================ */

const SpiderVerse = {
  // Chromatic aberration on scroll
  initChromaticScroll() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const offset = Math.sin(scrollY * 0.005) * 3;

          document.querySelectorAll('.comic-text').forEach(el => {
            el.style.textShadow = `
              ${offset}px ${offset}px 0 rgba(255,45,123,0.5),
              ${-offset}px ${-offset}px 0 rgba(0,212,255,0.5)
            `;
          });

          ticking = false;
        });
        ticking = true;
      }
    });
  },

  // Parallax floating dots
  initParallax() {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      document.querySelectorAll('.comic-dot').forEach((dot, i) => {
        const speed = (i + 1) * 0.5;
        dot.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    });
  },

  // Random glitch effect on cards
  initCardGlitch() {
    setInterval(() => {
      const cards = document.querySelectorAll('.media-card');
      if (cards.length === 0) return;

      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      randomCard.style.filter = 'hue-rotate(90deg) saturate(2)';
      randomCard.style.transform += ' skewX(2deg)';

      setTimeout(() => {
        randomCard.style.filter = '';
        randomCard.style.transform = '';
      }, 150);
    }, 5000);
  },

  // Comic-style frame rate simulation (CSS only, smooth)
  initFrameDropEffect() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes svFrameDrop {
        0%, 100% { opacity: 1; }
        49.9% { opacity: 1; }
        50% { opacity: 0.97; }
        50.1% { opacity: 1; }
      }

      .media-card {
        animation: cardEntrance 0.6s ease-out backwards,
                   svFrameDrop 0.1s steps(1) infinite;
      }
    `;
    document.head.appendChild(style);
  },

  // Scroll-triggered entrance animations
  initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.style.animation = 'cardEntrance 0.6s ease-out forwards';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all media cards and timeline items
    const observeElements = () => {
      document.querySelectorAll('.media-card, .timeline-item').forEach(el => {
        observer.observe(el);
      });
    };

    // Re-observe when content changes
    const contentObserver = new MutationObserver(observeElements);
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      contentObserver.observe(mainContent, { childList: true, subtree: true });
    }

    observeElements();
  },

  // Ben-Day dots cursor trail
  initDotTrail() {
    const canvas = document.createElement('canvas');
    canvas.id = 'dot-trail-canvas';
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:999;opacity:0.3;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let dots = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', (e) => {
      dots.push({
        x: e.clientX,
        y: e.clientY,
        life: 1,
        color: ['#ff2d7b', '#00d4ff', '#7b2dff'][Math.floor(Math.random() * 3)],
        size: Math.random() * 4 + 2
      });

      if (dots.length > 30) dots.shift();
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots = dots.filter(d => d.life > 0);
      dots.forEach(d => {
        ctx.globalAlpha = d.life * 0.5;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
        d.life -= 0.03;
      });

      requestAnimationFrame(animate);
    };
    animate();
  },

  // Initialize all effects
  init() {
    this.initChromaticScroll();
    this.initParallax();
    this.initCardGlitch();
    this.initScrollAnimations();
    // Dot trail only on desktop
    if (window.innerWidth > 768) {
      this.initDotTrail();
    }
  }
};
