/* ============================================
   LOCAL STORAGE MANAGER
   Handles all media data persistence
   ============================================ */

const StorageManager = {
  KEYS: {
    MEDIA: 'collage_media',
    SETTINGS: 'collage_settings',
    PASSWORD: 'collage_admin_pw'
  },

  // Initialize default data
  init() {
    if (!localStorage.getItem(this.KEYS.PASSWORD)) {
      // Default password: "love" - user can change in settings
      localStorage.setItem(this.KEYS.PASSWORD, btoa('love'));
    }
    if (!localStorage.getItem(this.KEYS.MEDIA)) {
      localStorage.setItem(this.KEYS.MEDIA, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.KEYS.SETTINGS)) {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify({
        title: 'For You',
        theme: 'spiderverse'
      }));
    }
  },

  // --- MEDIA OPERATIONS ---

  getAllMedia() {
    const data = localStorage.getItem(this.KEYS.MEDIA);
    return data ? JSON.parse(data) : [];
  },

  addMedia(mediaItem) {
    const media = this.getAllMedia();
    mediaItem.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    mediaItem.createdAt = new Date().toISOString();
    media.unshift(mediaItem); // newest first
    localStorage.setItem(this.KEYS.MEDIA, JSON.stringify(media));
    return mediaItem;
  },

  updateMedia(id, updates) {
    const media = this.getAllMedia();
    const index = media.findIndex(m => m.id === id);
    if (index !== -1) {
      media[index] = { ...media[index], ...updates };
      localStorage.setItem(this.KEYS.MEDIA, JSON.stringify(media));
      return media[index];
    }
    return null;
  },

  deleteMedia(id) {
    const media = this.getAllMedia().filter(m => m.id !== id);
    localStorage.setItem(this.KEYS.MEDIA, JSON.stringify(media));
  },

  getFavorites() {
    return this.getAllMedia().filter(m => m.favorite);
  },

  getMediaSorted() {
    return this.getAllMedia().sort((a, b) => {
      const dateA = a.date || a.createdAt;
      const dateB = b.date || b.createdAt;
      return new Date(dateA) - new Date(dateB);
    });
  },

  toggleFavorite(id) {
    const media = this.getAllMedia();
    const item = media.find(m => m.id === id);
    if (item) {
      item.favorite = !item.favorite;
      localStorage.setItem(this.KEYS.MEDIA, JSON.stringify(media));
      return item;
    }
    return null;
  },

  // --- SETTINGS ---

  getSettings() {
    const data = localStorage.getItem(this.KEYS.SETTINGS);
    return data ? JSON.parse(data) : { title: 'For You' };
  },

  updateSettings(updates) {
    const settings = { ...this.getSettings(), ...updates };
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  },

  // --- AUTH ---

  checkPassword(input) {
    const stored = localStorage.getItem(this.KEYS.PASSWORD);
    return stored === btoa(input);
  },

  changePassword(newPassword) {
    localStorage.setItem(this.KEYS.PASSWORD, btoa(newPassword));
  },

  // --- IMPORT/EXPORT ---

  exportData() {
    return JSON.stringify({
      media: this.getAllMedia(),
      settings: this.getSettings()
    }, null, 2);
  },

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.media) {
        localStorage.setItem(this.KEYS.MEDIA, JSON.stringify(data.media));
      }
      if (data.settings) {
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      return true;
    } catch {
      return false;
    }
  }
};
