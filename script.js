'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  initPackageFilter();
  initNewsletterForm();
  initBookingForm();
  initSearchForm();
  setMinDate();
});


/* 1. NAV — scroll background + mobile menu */
function initNav() {
  const nav        = document.getElementById('mainNav');
  const burgerBtn  = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 50);
  }, { passive: true });

  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('is-open');
      burgerBtn.classList.toggle('is-open', open);
      burgerBtn.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    document.querySelectorAll('.nav__mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        burgerBtn.classList.remove('is-open');
        burgerBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        mobileMenu.classList.remove('is-open');
        burgerBtn.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  }
}


/* 2. SCROLL REVEAL — fade in on scroll */
function initScrollReveal() {
  const items = document.querySelectorAll('.scroll-reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  items.forEach(el => observer.observe(el));
}


/* 3. PACKAGE FILTER */
function initPackageFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const pkgCards   = document.querySelectorAll('[data-category]');
  const noResults  = document.getElementById('noResults');

  if (!filterBtns.length || !pkgCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      const filter = btn.dataset.filter;
      let count = 0;

      pkgCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category.includes(filter);
        card.classList.toggle('is-hidden', !match);
        if (match) { card.classList.add('is-visible'); count++; }
      });

      if (noResults) noResults.style.display = count === 0 ? 'block' : 'none';
    });
  });
}


/* 4. NEWSLETTER FORM */
function initNewsletterForm() {
  const form       = document.getElementById('newsletterForm');
  const emailInput = document.getElementById('emailInput');
  const emailError = document.getElementById('emailError');

  if (!form) return;

  const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  form.addEventListener('submit', e => {
    e.preventDefault();

    if (!validEmail(emailInput.value)) {
      emailInput.classList.add('has-error');
      if (emailError) emailError.classList.add('visible');
      return;
    }

    emailInput.classList.remove('has-error');
    if (emailError) emailError.classList.remove('visible');

    const btn = form.querySelector('.btn');
    if (btn) {
      btn.textContent = '✓ Subscribed!';
      btn.style.background = '#27ae60';
      btn.disabled = true;
    }
    emailInput.value = '';
  });

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      emailInput.classList.remove('has-error');
      if (emailError) emailError.classList.remove('visible');
    });
  }
}


/* 5. BOOKING FORM */
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  const successMsg = document.getElementById('bookingSuccess');
  const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const check = (id, errId, fn) => {
    const input = document.getElementById(id);
    const err   = document.getElementById(errId);
    if (!input) return true;
    const ok = fn(input.value);
    input.classList.toggle('has-error', !ok);
    if (err) err.classList.toggle('visible', !ok);
    return ok;
  };

  form.addEventListener('submit', e => {
    e.preventDefault();

    const results = [
      check('bf-fname',  'fname-error',  v => v.trim().length > 0),
      check('bf-lname',  'lname-error',  v => v.trim().length > 0),
      check('bf-email',  'email-error',  validEmail),
      check('bf-depart', 'depart-error', v => v.length > 0 && new Date(v) > new Date()),
      check('bf-guests', 'guests-error', v => v.trim().length > 0),
    ];

    const terms = document.getElementById('bf-terms');
    const termsErr = document.getElementById('terms-error');
    const termsOk = !terms || terms.checked;
    if (termsErr) termsErr.classList.toggle('visible', !termsOk);

    if (results.every(Boolean) && termsOk) {
      form.querySelectorAll('.booking-form__row, .booking-form__group, .booking-form__submit').forEach(el => {
        el.style.display = 'none';
      });
      if (successMsg) {
        successMsg.classList.add('visible');
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      const firstErr = form.querySelector('.has-error');
      if (firstErr) { firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' }); firstErr.focus(); }
    }
  });

  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('has-error');
      const err = document.getElementById(input.id + '-error');
      if (err) err.classList.remove('visible');
    });
  });
}


/* 6. SEARCH FORM */
function initSearchForm() {
  const form = document.getElementById('searchForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const dest = document.getElementById('destination');
    if (!dest || !dest.value.trim()) {
      if (dest) {
        dest.style.borderColor = '#c0392b';
        dest.focus();
        setTimeout(() => dest.style.borderColor = '', 2000);
      }
      return;
    }
    window.location.href = `packages.html?destination=${encodeURIComponent(dest.value.trim())}`;
  });
}


/* 7. MIN DATE */
function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(input => {
    input.setAttribute('min', today);
  });
}