/* ============================================
   ADMIN DASHBOARD
   Upload, manage, and organize media
   ============================================ */

const Admin = {
  isAuthenticated: false,
  pendingFiles: [],

  init() {
    this.bindAuth();
    this.bindUpload();
    this.bindSettings();
  },

  // --- AUTHENTICATION ---
  bindAuth() {
    const loginBtn = document.getElementById('admin-login-btn');
    const passwordInput = document.getElementById('admin-password');

    loginBtn.addEventListener('click', () => this.login());
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.login();
    });
  },

  login() {
    const input = document.getElementById('admin-password').value;
    if (StorageManager.checkPassword(input)) {
      this.isAuthenticated = true;
      document.getElementById('admin-auth').classList.add('hidden');
      document.getElementById('admin-dashboard').classList.remove('hidden');
      this.renderMediaManager();
    } else {
      this.showStatus(document.getElementById('admin-auth'), 'Incorrect password', 'error');
    }
  },

  // --- FILE UPLOAD ---
  bindUpload() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');

    // Drag & drop
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      this.handleFiles(e.dataTransfer.files);
    });

    // File input
    fileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });

    // Upload button
    uploadBtn.addEventListener('click', () => this.uploadFiles());
  },

  handleFiles(fileList) {
    const files = Array.from(fileList);
    const preview = document.getElementById('upload-preview');

    files.forEach(file => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const isVideo = file.type.startsWith('video/');

        this.pendingFiles.push({
          src: dataUrl,
          type: isVideo ? 'video' : 'image',
          name: file.name
        });

        // Show preview
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
          ${isVideo
            ? `<video src="${dataUrl}" muted></video>`
            : `<img src="${dataUrl}" alt="preview" />`
          }
          <button class="preview-remove" data-index="${this.pendingFiles.length - 1}">&times;</button>
        `;

        previewItem.querySelector('.preview-remove').addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(e.target.dataset.index);
          this.pendingFiles[idx] = null;
          previewItem.remove();
        });

        preview.appendChild(previewItem);
      };

      reader.readAsDataURL(file);
    });
  },

  uploadFiles() {
    const caption = document.getElementById('media-caption').value;
    const date = document.getElementById('media-date').value;
    const favorite = document.getElementById('media-favorite').checked;

    const validFiles = this.pendingFiles.filter(f => f !== null);

    if (validFiles.length === 0) {
      this.showStatus(document.querySelector('.upload-panel'), 'Please select files to upload', 'error');
      return;
    }

    validFiles.forEach((file, index) => {
      StorageManager.addMedia({
        src: file.src,
        type: file.type,
        caption: caption || getCaptionByIndex(Date.now() + index),
        date: date || null,
        favorite: favorite,
        name: file.name
      });
    });

    // Reset form
    this.pendingFiles = [];
    document.getElementById('upload-preview').innerHTML = '';
    document.getElementById('media-caption').value = '';
    document.getElementById('media-date').value = '';
    document.getElementById('media-favorite').checked = false;
    document.getElementById('file-input').value = '';

    this.showStatus(
      document.querySelector('.upload-panel'),
      `${validFiles.length} file(s) added to gallery!`,
      'success'
    );

    // Refresh views
    this.renderMediaManager();
    App.refreshGallery();
  },

  // --- MEDIA MANAGER ---
  renderMediaManager() {
    const container = document.getElementById('media-manager');
    const media = StorageManager.getAllMedia();

    if (media.length === 0) {
      container.innerHTML = '<p style="color: var(--sv-blue); font-family: var(--handwrite-font); text-align: center; padding: 2rem;">No media uploaded yet</p>';
      return;
    }

    container.innerHTML = media.map(item => `
      <div class="manager-item" data-id="${item.id}">
        ${item.caption ? `<div class="manager-item-caption">${item.caption}</div>` : ''}
        ${item.type === 'video'
          ? `<video src="${item.src}" muted preload="metadata"></video>`
          : `<img src="${item.src}" alt="${item.caption || ''}" />`
        }
        <div class="manager-actions">
          <button class="manager-btn fav-btn" title="Toggle Favorite">
            ${item.favorite ? '&#10084;' : '&#9825;'}
          </button>
          <button class="manager-btn delete" title="Delete">Delete</button>
        </div>
      </div>
    `).join('');

    // Bind actions
    container.querySelectorAll('.manager-item').forEach(el => {
      const id = el.dataset.id;

      el.querySelector('.fav-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        StorageManager.toggleFavorite(id);
        this.renderMediaManager();
        App.refreshGallery();
      });

      el.querySelector('.delete').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Remove this from the gallery?')) {
          StorageManager.deleteMedia(id);
          this.renderMediaManager();
          App.refreshGallery();
        }
      });
    });
  },

  // --- SETTINGS ---
  bindSettings() {
    document.getElementById('change-password-btn').addEventListener('click', () => {
      const newPw = document.getElementById('new-password').value;
      if (newPw.length < 1) return;
      StorageManager.changePassword(newPw);
      document.getElementById('new-password').value = '';
      this.showStatus(document.querySelector('.settings-group'), 'Password updated!', 'success');
    });

    document.getElementById('change-title-btn').addEventListener('click', () => {
      const newTitle = document.getElementById('site-title').value;
      if (newTitle.length < 1) return;
      StorageManager.updateSettings({ title: newTitle });
      document.querySelector('.nav-logo').textContent = newTitle;
      document.querySelector('.splash-title').textContent = newTitle;
      document.title = `${newTitle} - A Cinematic Love Letter`;
      this.showStatus(document.querySelector('.settings-group'), 'Title updated!', 'success');
    });
  },

  // --- HELPERS ---
  showStatus(container, message, type) {
    const existing = container.querySelector('.status-msg');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = `status-msg ${type}`;
    msg.textContent = message;
    container.prepend(msg);

    setTimeout(() => msg.remove(), 3000);
  }
};
