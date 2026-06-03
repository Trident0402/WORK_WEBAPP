// js/app.js

const app = {
  currentSection: 'dashboard',
  selectedDate: new Date(),

  init() {
    this.navigate('dashboard');
    this.registerServiceWorker();
  },

  navigate(sectionId) {
    this.currentSection = sectionId;
    
    // Hide all sections
    document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
    
    // Show target section
    const targetEl = document.getElementById(`section-${sectionId}`);
    if (targetEl) {
      targetEl.classList.add('active');
    }

    // Update bottom nav
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.dataset.target === sectionId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Re-render target section
    if (sectionId === 'dashboard') {
      dashboard.render();
    } else if (sectionId === 'tomorrow') {
      tomorrow.render();
    } else if (sectionId === 'todohub') {
      todohub.render();
    }
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
          .then(reg => console.log('SW registered!', reg))
          .catch(err => console.error('SW registration failed', err));
      });
    }
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
