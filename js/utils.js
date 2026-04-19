/* ═══════════════════════════════════════════
   utils.js — Utility Functions
   ═══════════════════════════════════════════ */

/**
 * Generate initials from a full name
 * "Алексей Петров" → "АП"
 */
function getInitials(name) {
  return name
    .split(' ')
    .map(w => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Create an avatar fallback element with initials
 */
function createAvatarFallback(name) {
  const div = document.createElement('div');
  div.className = 'avatar-fallback';
  div.textContent = getInitials(name);
  return div;
}

/**
 * Create a photo element with fallback to initials avatar
 */
function createPhotoElement(src, name) {
  if (src && src.trim() !== '') {
    const img = document.createElement('img');
    img.src = src;
    img.alt = name;
    img.loading = 'lazy';
    img.onerror = function () {
      this.replaceWith(createAvatarFallback(name));
    };
    return img;
  }
  return createAvatarFallback(name);
}

/**
 * SVG icon templates
 */
const icons = {
  arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  email: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="14" height="10" rx="2"/><path d="M1 3l7 5 7-5"/></svg>',
  telegram: '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M13.95 2.23L1.64 7.02c-.84.34-.83.81-.15 1.02l3.15.98 1.22 3.86c.16.43.29.6.59.6.3 0 .43-.14.6-.3l1.44-1.48 3 2.21c.55.3.95.15 1.09-.51l1.97-9.29c.2-.81-.31-1.18-.9-.88z"/></svg>'
};

/**
 * SVG patterns for project covers (fallback)
 */
const coverPatterns = {
  portal: `<svg width="100%" height="100%" opacity=".3"><defs><pattern id="pp" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="currentColor" opacity=".15"/></pattern></defs><rect width="100%" height="100%" fill="url(#pp)"/></svg>`,
  logistics: `<svg width="100%" height="100%" opacity=".3"><line x1="10%" y1="80%" x2="30%" y2="30%" stroke="currentColor" stroke-width="2"/><line x1="30%" y1="30%" x2="50%" y2="60%" stroke="currentColor" stroke-width="2"/><line x1="50%" y1="60%" x2="70%" y2="20%" stroke="currentColor" stroke-width="2"/><line x1="70%" y1="20%" x2="90%" y2="50%" stroke="currentColor" stroke-width="2"/></svg>`,
  api: `<svg width="100%" height="100%" opacity=".3"><circle cx="50%" cy="50%" r="30" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="50%" y1="20%" x2="50%" y2="80%" stroke="currentColor" stroke-width="1"/><line x1="20%" y1="50%" x2="80%" y2="50%" stroke="currentColor" stroke-width="1"/></svg>`,
  bi: `<svg width="100%" height="100%" opacity=".3"><rect x="15%" y="60%" width="12%" height="30%" fill="currentColor" opacity=".3"/><rect x="32%" y="40%" width="12%" height="50%" fill="currentColor" opacity=".3"/><rect x="49%" y="25%" width="12%" height="65%" fill="currentColor" opacity=".3"/><rect x="66%" y="50%" width="12%" height="40%" fill="currentColor" opacity=".3"/></svg>`,
  cicd: `<svg width="100%" height="100%" opacity=".3"><circle cx="20%" cy="50%" r="12" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="27%" y1="50%" x2="43%" y2="50%" stroke="currentColor" stroke-width="1.5"/><circle cx="50%" cy="50%" r="12" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="57%" y1="50%" x2="73%" y2="50%" stroke="currentColor" stroke-width="1.5"/><circle cx="80%" cy="50%" r="12" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`,
  integration: `<svg width="100%" height="100%" opacity=".3"><defs><pattern id="pi" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M0 15h30M15 0v30" stroke="currentColor" stroke-width=".5"/></pattern></defs><rect width="100%" height="100%" fill="url(#pi)"/></svg>`,
  default: `<svg width="100%" height="100%" opacity=".2"><defs><pattern id="pd" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="currentColor"/></pattern></defs><rect width="100%" height="100%" fill="url(#pd)"/></svg>`
};

/**
 * Theme toggle — dark/light
 * Theme is applied from inline <head> script to prevent flash.
 * This function only wires up the toggle button.
 */
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }
}

/**
 * Initialize scroll reveal observer
 */
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/**
 * Initialize navigation highlight on scroll
 */
function initNavHighlight() {
  const navLinks = document.querySelectorAll('#mainNav a');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 200) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current ? 'var(--green)' : '';
    });
  });

  // Burger menu
  const burger = document.getElementById('burger');
  const nav = document.getElementById('mainNav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      nav.classList.toggle('open');
    });
    navLinks.forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('active');
        nav.classList.remove('open');
      });
    });
  }
}

/**
 * Format month name in Russian
 */
const monthNames = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
];

function formatMonth(dateStr) {
  const [year, month] = dateStr.split('-');
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

/**
 * Parse YYYY-MM to Date object (first day of month)
 */
function parseMonth(dateStr) {
  const [year, month] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, 1);
}
