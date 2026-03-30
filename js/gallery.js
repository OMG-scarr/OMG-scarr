/* ============================================
   GALLERY & LIGHTBOX MANAGER
   ============================================ */

const Gallery = {
  currentLightboxIndex: 0,
  currentMediaList: [],

  // Render gallery grid
  renderGrid(containerId, mediaList) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (mediaList.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No Moments Yet</h3>
          <p>Upload your first photo or video in the admin dashboard</p>
        </div>
      `;
      return;
    }

    container.innerHTML = mediaList.map((item, index) => {
      const caption = item.caption || getCaptionByIndex(index);
      const isVideo = item.type === 'video';
      const delay = index * 0.08;

      return `
        <div class="media-card" data-index="${index}" style="animation-delay: ${delay}s">
          ${item.favorite ? '<div class="favorite-badge">&#10084;</div>' : ''}
          ${isVideo ? `
            <video class="card-media" src="${item.src}" muted preload="metadata"></video>
            <div class="video-indicator"></div>
          ` : `
            <img class="card-media" src="${item.src}" alt="${caption}" loading="lazy" />
          `}
          <div class="card-overlay">
            <p class="card-caption">"${caption}"</p>
            ${item.date ? `<p class="card-date">${new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners
    container.querySelectorAll('.media-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.index);
        this.openLightbox(mediaList, idx);
      });
    });
  },

  // Render timeline
  renderTimeline(mediaList) {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    const sorted = [...mediaList].sort((a, b) => {
      const dateA = a.date || a.createdAt;
      const dateB = b.date || b.createdAt;
      return new Date(dateA) - new Date(dateB);
    });

    if (sorted.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No Story to Tell Yet</h3>
          <p>Start adding moments to build your timeline</p>
        </div>
      `;
      return;
    }

    container.innerHTML = sorted.map((item, index) => {
      const caption = item.caption || getCaptionByIndex(index);
      const isVideo = item.type === 'video';
      const date = item.date
        ? new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'A beautiful moment';
      const delay = index * 0.1;

      return `
        <div class="timeline-item" style="animation-delay: ${delay}s" data-index="${index}">
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            ${isVideo ? `
              <video src="${item.src}" muted preload="metadata"></video>
            ` : `
              <img src="${item.src}" alt="${caption}" loading="lazy" />
            `}
            <div class="timeline-card-body">
              <p class="timeline-date">${date}</p>
              <p class="timeline-caption">"${caption}"</p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Click to open lightbox
    container.querySelectorAll('.timeline-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index);
        this.openLightbox(sorted, idx);
      });
    });
  },

  // Lightbox
  openLightbox(mediaList, index) {
    this.currentMediaList = mediaList;
    this.currentLightboxIndex = index;
    this.updateLightbox();

    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';

    // Pause any playing videos
    const video = lightbox.querySelector('video');
    if (video) video.pause();
  },

  updateLightbox() {
    const item = this.currentMediaList[this.currentLightboxIndex];
    if (!item) return;

    const mediaContainer = document.querySelector('.lightbox-media');
    const captionEl = document.querySelector('.lightbox-caption');
    const caption = item.caption || getCaptionByIndex(this.currentLightboxIndex);

    if (item.type === 'video') {
      mediaContainer.innerHTML = `<video src="${item.src}" controls autoplay></video>`;
    } else {
      mediaContainer.innerHTML = `<img src="${item.src}" alt="${caption}" />`;
    }

    captionEl.textContent = `"${caption}"`;
  },

  nextLightbox() {
    this.currentLightboxIndex = (this.currentLightboxIndex + 1) % this.currentMediaList.length;
    this.updateLightbox();
  },

  prevLightbox() {
    this.currentLightboxIndex = (this.currentLightboxIndex - 1 + this.currentMediaList.length) % this.currentMediaList.length;
    this.updateLightbox();
  },

  // Init lightbox controls
  initLightbox() {
    document.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
    document.querySelector('.lightbox-next').addEventListener('click', () => this.nextLightbox());
    document.querySelector('.lightbox-prev').addEventListener('click', () => this.prevLightbox());

    // Keyboard nav
    document.addEventListener('keydown', (e) => {
      if (document.getElementById('lightbox').classList.contains('hidden')) return;
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowRight') this.nextLightbox();
      if (e.key === 'ArrowLeft') this.prevLightbox();
    });

    // Click outside to close
    document.getElementById('lightbox').addEventListener('click', (e) => {
      if (e.target.id === 'lightbox') this.closeLightbox();
    });
  }
};
