/* ============================================================
   CRJ Fastigheter AB — Main JavaScript
   ============================================================ */

'use strict';

/* ---- Navbar: scroll effect + active link ---- */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  // Scroll class
  const onScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar__link, .navbar__mobile-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkFile = href.split('/').pop();
    if (
      linkFile === currentPath ||
      (currentPath === '' && linkFile === 'index.html') ||
      (currentPath === 'index.html' && (linkFile === 'index.html' || linkFile === ''))
    ) {
      link.classList.add('active');
    }
  });
})();

/* ---- Mobile Menu ---- */
(function initMobileMenu() {
  const hamburger = document.querySelector('.navbar__hamburger');
  const mobileMenu = document.querySelector('.navbar__mobile');
  const closeBtn = document.querySelector('.navbar__mobile-close');
  if (!hamburger || !mobileMenu) return;

  const openMenu = () => {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    if (mobileMenu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  // Close on link click
  const mobileLinks = document.querySelectorAll('.navbar__mobile-link');
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();

/* ---- Scroll Animations (Intersection Observer) ---- */
(function initScrollAnimations() {
  const animatedEls = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
  if (!animatedEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  animatedEls.forEach(el => observer.observe(el));
})();

/* ---- Cookie Consent Banner ---- */
(function initCookieBanner() {
  const COOKIE_KEY = 'crj_cookie_consent';
  const banner = document.querySelector('.cookie-banner');
  if (!banner) return;

  const consent = localStorage.getItem(COOKIE_KEY);
  if (!consent) {
    // Show after short delay for better UX
    setTimeout(() => banner.classList.add('visible'), 800);
  }

  const acceptBtn = banner.querySelector('.cookie-btn--accept');
  const declineBtn = banner.querySelector('.cookie-btn--decline');

  const dismissBanner = (value) => {
    localStorage.setItem(COOKIE_KEY, value);
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 400);
  };

  if (acceptBtn) acceptBtn.addEventListener('click', () => dismissBanner('accepted'));
  if (declineBtn) declineBtn.addEventListener('click', () => dismissBanner('declined'));
})();

/* ---- Form Validation ---- */
function validateForm(form) {
  let valid = true;

  // Clear previous errors
  form.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(field => {
    field.classList.remove('error');
    const errorEl = field.parentElement.querySelector('.form-error');
    if (errorEl) errorEl.classList.remove('visible');
  });

  // Validate each required field
  form.querySelectorAll('[required]').forEach(field => {
    const value = field.value.trim();
    let errorMsg = '';

    if (!value) {
      errorMsg = 'Det här fältet är obligatoriskt.';
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errorMsg = 'Ange en giltig e-postadress.';
    } else if (field.type === 'tel' && value && !/^[\d\s\+\-\(\)]{7,}$/.test(value)) {
      errorMsg = 'Ange ett giltigt telefonnummer.';
    }

    if (errorMsg) {
      valid = false;
      field.classList.add('error');
      const errorEl = field.parentElement.querySelector('.form-error');
      if (errorEl) {
        errorEl.textContent = errorMsg;
        errorEl.classList.add('visible');
      }
    }
  });

  return valid;
}

function showFormSuccess(form, message) {
  let successEl = form.querySelector('.form-success');
  if (!successEl) {
    successEl = document.createElement('div');
    successEl.className = 'form-success';
    successEl.innerHTML = `<i class="fa-solid fa-circle-check"></i><span></span>`;
    form.appendChild(successEl);
  }
  successEl.querySelector('span').textContent = message || 'Tack! Vi återkommer till dig så snart som möjligt.';
  successEl.classList.add('visible');
  form.querySelectorAll('input, select, textarea').forEach(f => f.value = '');
  successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ---- Init all forms on the page ---- */
(function initForms() {
  // Contact form — skip if Supabase handler is attached
  const contactForm = document.getElementById('contact-form');
  if (contactForm && !contactForm.dataset.supabaseHandled) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      if (validateForm(contactForm)) {
        showFormSuccess(contactForm, 'Tack för ditt meddelande! Vi svarar inom 1–2 arbetsdagar.');
      }
    });
  }

  // Interest registration form — skip if Supabase handler is attached
  const interestForm = document.getElementById('interest-form');
  if (interestForm && !interestForm.dataset.supabaseHandled) {
    interestForm.addEventListener('submit', e => {
      e.preventDefault();
      if (validateForm(interestForm)) {
        showFormSuccess(interestForm, 'Tack för din intresseanmälan! Du är nu registrerad i vår kö och vi hör av oss när en lägenhet blir ledig.');
      }
    });
  }

  // Fault report form — skip if Supabase handler is attached
  const faultForm = document.getElementById('fault-form');
  if (faultForm && !faultForm.dataset.supabaseHandled) {
    faultForm.addEventListener('submit', e => {
      e.preventDefault();
      if (validateForm(faultForm)) {
        showFormSuccess(faultForm, 'Tack! Din felanmälan har tagits emot. Vid akuta ärenden, kontakta oss direkt på telefon.');
      }
    });
  }
})();

/* ---- Smooth scroll for anchor links ---- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.navbar')?.offsetHeight || 80;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });
})();
