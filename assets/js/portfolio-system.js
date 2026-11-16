/* ==========================================================================
   IRAM KHAN PORTFOLIO SUITE — INTERACTIVE ENGINE
   Handles:
   - Case Study Tab Switchers
   - Graphic Design Category Filtering
   - Figma Prototype & Native-Proportion Lightbox Modal
   - Print / PDF Export Mode
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Case Study Tab Switchers
  const tabSwitchers = document.querySelectorAll('[data-tab-group]');
  tabSwitchers.forEach(group => {
    const groupName = group.getAttribute('data-tab-group');
    const buttons = group.querySelectorAll('[data-tab-target]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab-target');
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const panels = document.querySelectorAll(`[data-tab-panel-group="${groupName}"]`);
        panels.forEach(panel => {
          if (panel.id === targetId) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });
  });

  // 2. Graphic Design Category Filter
  const filterBtns = document.querySelectorAll('[data-filter-btn]');
  const filterItems = document.querySelectorAll('[data-filter-cat]');
  if (filterBtns.length > 0 && filterItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-filter-btn');
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        filterItems.forEach(item => {
          const itemCat = item.getAttribute('data-filter-cat');
          if (cat === 'all' || itemCat === cat) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // 3. Figma Prototype & Native-Proportion Lightbox Modal
  const lightbox = document.getElementById('portfolio-lightbox');
  const lightboxContent = lightbox ? lightbox.querySelector('.lightbox-content') : null;
  const lightboxScrollBody = lightbox ? lightbox.querySelector('.lightbox-scroll-body') : null;
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxModeBadge = document.getElementById('lightbox-mode-badge');

  function openLightbox(src, title, mode) {
    if (!lightbox || !lightboxImg) return;

    if (lightboxContent) {
      lightboxContent.classList.remove('mode-macbook', 'mode-android', 'mode-board-scroll', 'mode-native', 'is-zoomed');
      if (mode === 'macbook') {
        lightboxContent.classList.add('mode-macbook');
      } else if (mode === 'android') {
        lightboxContent.classList.add('mode-android');
      } else if (mode === 'board-scroll') {
        lightboxContent.classList.add('mode-board-scroll');
      } else {
        lightboxContent.classList.add('mode-native');
      }
    }

    if (lightboxModeBadge) {
      if (mode === 'android') {
        lightboxModeBadge.textContent = '';
        lightboxModeBadge.style.display = 'none';
      } else if (mode === 'macbook') {
        lightboxModeBadge.textContent = '💻 Scrollable Web View (Scroll ↕)';
        lightboxModeBadge.style.display = 'inline-block';
      } else if (mode === 'board-scroll') {
        lightboxModeBadge.textContent = '📐 Original Proportions (Click Image to Zoom)';
        lightboxModeBadge.style.display = 'inline-block';
      } else {
        lightboxModeBadge.textContent = '🖼️ Original Native Proportions (Click to Zoom)';
        lightboxModeBadge.style.display = 'inline-block';
      }
    }

    lightboxImg.src = src;
    lightboxImg.alt = title || 'Project Visual';
    if (lightboxTitle) {
      lightboxTitle.textContent = title || 'Project Preview';
    }
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (lightboxScrollBody) {
      lightboxScrollBody.scrollTop = 0;
      lightboxScrollBody.scrollLeft = 0;
    }
  }

  if (lightboxImg && lightboxContent) {
    lightboxImg.addEventListener('click', (e) => {
      if (lightboxContent.classList.contains('mode-native') || lightboxContent.classList.contains('mode-board-scroll')) {
        e.stopPropagation();
        lightboxContent.classList.toggle('is-zoomed');
      }
    });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-lightbox-src]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const src = trigger.getAttribute('data-lightbox-src');
      const title = trigger.getAttribute('data-lightbox-title') || trigger.querySelector('h4, h5, .phone-step-title, .graphic-card-title')?.textContent || 'Visual Inspection';
      const mode = trigger.getAttribute('data-lightbox-mode') || 'native';
      openLightbox(src, title, mode);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });

  // 4. Print / Export PDF Fallback Trigger (for any button using data-action="print-pdf")
  document.querySelectorAll('[data-action="print-pdf"]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.print();
    });
  });

  // 5. Smart Scroll-Up Sticky Header & Active Project Navigation Spy
  const siteHeader = document.querySelector('.site-header');
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const navTargets = navLinks
    .map(link => {
      const targetId = link.getAttribute('href');
      const targetEl = targetId && targetId.length > 1 ? document.querySelector(targetId) : null;
      return targetEl ? { link, targetEl, id: targetId } : null;
    })
    .filter(Boolean);

  let lastScrollY = window.scrollY || 0;
  let isNavigatingByClick = false;
  let navClickTimers = [];

  function clearNavTimers() {
    navClickTimers.forEach(t => clearTimeout(t));
    navClickTimers = [];
  }

  function scrollToElementAccurately(targetEl, targetId) {
    if (!targetEl) return;
    const headerOffset = 84;
    const computeTop = () => Math.max(0, targetEl.getBoundingClientRect().top + (window.scrollY || 0) - headerOffset);

    window.scrollTo({
      top: computeTop(),
      behavior: 'smooth'
    });

    if (history.replaceState && targetId) {
      history.replaceState(null, '', targetId);
    }

    // Re-verify position during & after smooth scroll in case any images finish decoding
    [350, 680, 980].forEach((delay, idx) => {
      const timer = setTimeout(() => {
        const diff = targetEl.getBoundingClientRect().top - headerOffset;
        if (Math.abs(diff) > 14) {
          window.scrollTo({
            top: computeTop(),
            behavior: idx === 2 ? 'auto' : 'smooth'
          });
        }
        if (idx === 2) {
          isNavigatingByClick = false;
          lastScrollY = window.scrollY || 0;
        }
      }, delay);
      navClickTimers.push(timer);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      clearNavTimers();
      isNavigatingByClick = true;

      // Update active state in navbar
      const matchingNav = navLinks.find(l => l.getAttribute('href') === targetId);
      if (matchingNav) {
        navLinks.forEach(l => l.classList.remove('active'));
        matchingNav.classList.add('active');
      }

      if (siteHeader) {
        siteHeader.classList.remove('nav-hidden');
        if (window.scrollY > 40) {
          siteHeader.classList.add('nav-scrolled');
        }
      }

      scrollToElementAccurately(targetEl, targetId);
    });
  });

  function updateActiveNavOnScroll(currentScrollY) {
    if (isNavigatingByClick || navTargets.length === 0) return;

    // Sort targets by actual vertical offset in the document
    const sorted = [...navTargets].sort((a, b) => {
      const topA = a.targetEl.getBoundingClientRect().top + currentScrollY;
      const topB = b.targetEl.getBoundingClientRect().top + currentScrollY;
      return topA - topB;
    });

    const triggerLine = currentScrollY + 220;
    let activeItem = sorted[0];

    for (const item of sorted) {
      const itemTop = item.targetEl.getBoundingClientRect().top + currentScrollY;
      if (itemTop <= triggerLine) {
        activeItem = item;
      }
    }

    // If scrolled near the very bottom of the page, highlight the last section (Resume/CV)
    if (window.innerHeight + currentScrollY >= document.documentElement.scrollHeight - 80) {
      activeItem = sorted[sorted.length - 1];
    }

    if (activeItem) {
      navLinks.forEach(l => l.classList.remove('active'));
      activeItem.link.classList.add('active');
    }
  }

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY || 0;
    const deltaY = currentScrollY - lastScrollY;

    if (siteHeader) {
      if (currentScrollY <= 70) {
        siteHeader.classList.remove('nav-hidden', 'nav-scrolled');
      } else if (deltaY < 0) {
        // Any upward scroll delta immediately pops the navbar back into view
        siteHeader.classList.remove('nav-hidden');
        siteHeader.classList.add('nav-scrolled');
      } else if (deltaY > 4 && currentScrollY > 120 && !isNavigatingByClick) {
        // Scrolling down smoothly tucks the navbar away
        siteHeader.classList.add('nav-hidden');
        siteHeader.classList.remove('nav-scrolled');
      }
    }

    updateActiveNavOnScroll(currentScrollY);
    lastScrollY = currentScrollY;
  }, { passive: true });

  // 6. Cute Editorial "Contact Iram" Pop-Up Modal
  let contactModal = document.getElementById('contact-iram-modal');
  if (!contactModal) {
    contactModal = document.createElement('div');
    contactModal.id = 'contact-iram-modal';
    contactModal.className = 'contact-modal-backdrop';
    contactModal.setAttribute('role', 'dialog');
    contactModal.setAttribute('aria-modal', 'true');
    contactModal.setAttribute('aria-label', 'Contact Iram Khan');
    contactModal.innerHTML = `
      <div class="contact-modal-card">
        <div class="contact-modal-header">
          <div class="contact-modal-brand">
            <span class="contact-modal-monogram">IK</span>
            <div>
              <h3 class="contact-modal-title">Contact Iram Khan</h3>
              <div class="contact-modal-subtitle">UI/UX · Product · Visual Designer</div>
            </div>
          </div>
          <button type="button" class="contact-modal-close" data-contact-modal-close aria-label="Close Contact Modal">×</button>
        </div>
        <div class="contact-modal-list">
          <a href="mailto:iramk252004@gmail.com" class="contact-modal-link">
            <span class="contact-modal-link-left">
              <span class="contact-modal-icon">✉️</span>
              <span class="contact-modal-label">
                <span class="contact-modal-kind">Gmail</span>
                <span class="contact-modal-value">iramk252004@gmail.com</span>
              </span>
            </span>
            <span class="contact-modal-arrow">↗</span>
          </a>
          <a href="tel:+919810619466" class="contact-modal-link">
            <span class="contact-modal-link-left">
              <span class="contact-modal-icon">📞</span>
              <span class="contact-modal-label">
                <span class="contact-modal-kind">Phone Number</span>
                <span class="contact-modal-value">+91 9810619466</span>
              </span>
            </span>
            <span class="contact-modal-arrow">↗</span>
          </a>
          <a href="https://www.behance.net/iramkhan39" target="_blank" rel="noopener noreferrer" class="contact-modal-link">
            <span class="contact-modal-link-left">
              <span class="contact-modal-icon">🅱️</span>
              <span class="contact-modal-label">
                <span class="contact-modal-kind">Behance Portfolio</span>
                <span class="contact-modal-value">behance.net/iramkhan39</span>
              </span>
            </span>
            <span class="contact-modal-arrow">↗</span>
          </a>
          <a href="https://www.linkedin.com/in/iram-khan-332404249" target="_blank" rel="noopener noreferrer" class="contact-modal-link">
            <span class="contact-modal-link-left">
              <span class="contact-modal-icon">🔗</span>
              <span class="contact-modal-label">
                <span class="contact-modal-kind">LinkedIn Profile</span>
                <span class="contact-modal-value">in/iram-khan-332404249</span>
              </span>
            </span>
            <span class="contact-modal-arrow">↗</span>
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(contactModal);
  }

  function openContactModal(e) {
    if (e) e.preventDefault();
    if (!contactModal) return;
    contactModal.classList.add('open');
  }

  function closeContactModal() {
    if (!contactModal) return;
    contactModal.classList.remove('open');
  }

  document.querySelectorAll('[data-contact-modal-open]').forEach(btn => {
    btn.addEventListener('click', openContactModal);
  });

  contactModal.querySelectorAll('[data-contact-modal-close]').forEach(btn => {
    btn.addEventListener('click', closeContactModal);
  });

  contactModal.addEventListener('click', (e) => {
    if (e.target === contactModal) {
      closeContactModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeContactModal();
    }
  });
});
