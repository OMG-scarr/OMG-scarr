/* ============================================
   MAIN APP CONTROLLER
   ============================================ */

const App = {
  currentPage: 'gallery',

  init() {
    // Initialize storage
    StorageManager.init();

    // Set up navigation
    this.bindNav();

    // Set up splash screen
    this.bindSplash();

    // Initialize gallery lightbox
    Gallery.initLightbox();

    // Initialize audio
    AudioManager.init();

    // Initialize admin
    Admin.init();

    // Set rotating captions
    this.startCaptionRotation();

    // Load saved title
    const settings = StorageManager.getSettings();
    if (settings.title) {
      document.querySelector('.nav-logo').textContent = settings.title;
      document.querySelector('.splash-title').textContent = settings.title;
      document.title = `${settings.title} - A Cinematic Love Letter`;
    }
  },

  // --- SPLASH SCREEN ---
  bindSplash() {
    const splash = document.getElementById('splash-screen');
    const enterBtn = document.getElementById('enter-btn');
    const nav = document.getElementById('main-nav');
    const content = document.getElementById('main-content');
    const floating = document.querySelector('.floating-elements');

    enterBtn.addEventListener('click', () => {
      splash.classList.add('exit');

      setTimeout(() => {
        splash.style.display = 'none';
        nav.classList.remove('hidden');
        content.classList.remove('hidden');
        floating.classList.remove('hidden');

        // Init Spider-Verse effects after content visible
        SpiderVerse.init();

        // Load gallery content
        this.refreshGallery();

        // Auto-play music
        AudioManager.play();
      }, 800);
    });
  },

  // --- NAVIGATION ---
  bindNav() {
    document.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        this.navigateTo(page);
      });
    });
  },

  navigateTo(page) {
    this.currentPage = page;

    // Update nav
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`).classList.add('active');

    // Switch pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');

    // Refresh content
    this.refreshGallery();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // --- GALLERY REFRESH ---
  refreshGallery() {
    const allMedia = StorageManager.getAllMedia();
    const favorites = StorageManager.getFavorites();

    Gallery.renderGrid('gallery-grid', allMedia);
    Gallery.renderGrid('favorites-grid', favorites);
    Gallery.renderTimeline(allMedia);
  },

  // --- CAPTION ROTATION ---
  startCaptionRotation() {
    const captionEls = document.querySelectorAll('.romantic-caption');

    const updateCaptions = () => {
      captionEls.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';

        setTimeout(() => {
          el.textContent = `"${getRandomCaption()}"`;
          el.style.opacity = '0.9';
          el.style.transform = 'translateY(0)';
        }, 300);
      });
    };

    // Initial
    updateCaptions();

    // Rotate every 8 seconds
    setInterval(updateCaptions, 8000);

    // Add transition style
    captionEls.forEach(el => {
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    });
  }
};

// Boot up
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
