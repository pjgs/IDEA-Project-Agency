/**
 * IDEA PROJET AGENCY - Main JavaScript
 * 
 * This file contains global JavaScript functionality
 * for the IDEA Projet Agency website.
 */

// Dark mode toggle (if needed in the future)
const initDarkMode = () => {
  // Check for saved theme preference or default to 'dark'
  const theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

// Mobile menu toggle
const initMobileMenu = () => {
  const menuBtn = document.querySelector('.header__menu-btn');
  const nav = document.querySelector('.header__nav');
  
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }
};

// Smooth scroll for anchor links
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
};

// Form validation and submission
const initFormHandling = () => {
  const forms = document.querySelectorAll('form[data-netlify]');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      // Basic validation is handled by HTML5 required attributes
      // Additional custom validation can be added here if needed
      console.log('Form submitted');
    });
  });
};

// Initialize all functions when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initMobileMenu();
  initSmoothScroll();
  initFormHandling();
});

// Export functions for potential use in other scripts
export { initDarkMode, initMobileMenu, initSmoothScroll, initFormHandling };
