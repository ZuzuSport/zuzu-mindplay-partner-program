/**
 * app.js — Zuzu MindPlay Partner Program
 * Form validation, partner code formatting, and submission handling.
 */

(function () {
  'use strict';

  /* ─── DOM References ─── */
  const form        = document.getElementById('partnerForm');
  const thankYou    = document.getElementById('thankYou');
  const submitBtn   = document.getElementById('submitBtn');
  const partnerCode = document.getElementById('partnerCode');
  const codeHint    = document.getElementById('codeHint');

  if (!form) return;

  /* ─── Partner Code: force uppercase, strip spaces ─── */
  partnerCode.addEventListener('input', function () {
    const raw     = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.value    = raw;
    validateCode(raw);
  });

  function validateCode(val) {
    if (!val) {
      codeHint.textContent = '';
      codeHint.style.color = '';
      return;
    }
    if (val.length < 4) {
      codeHint.textContent = 'Must be at least 4 characters.';
      codeHint.style.color = '#EF4444';
    } else if (val.length > 15) {
      codeHint.textContent = 'Maximum 15 characters.';
      codeHint.style.color = '#EF4444';
    } else {
      codeHint.textContent = '✓ ' + val + ' looks good! Subject to approval.';
      codeHint.style.color = '#22C55E';
    }
  }

  /* ─── Required field validation ─── */
  function validateField(el) {
    const val = el.value.trim();
    if (el.hasAttribute('required') && !val) {
      markInvalid(el, 'This field is required.');
      return false;
    }
    if (el.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      markInvalid(el, 'Please enter a valid email address.');
      return false;
    }
    if (el.id === 'partnerCode') {
      if (!val) { markInvalid(el, 'Please choose a partner code.'); return false; }
      if (val.length < 4)  { markInvalid(el, 'Minimum 4 characters.'); return false; }
      if (val.length > 15) { markInvalid(el, 'Maximum 15 characters.'); return false; }
      if (!/^[A-Z0-9]+$/.test(val)) { markInvalid(el, 'Uppercase letters and numbers only.'); return false; }
    }
    markValid(el);
    return true;
  }

  function markInvalid(el, msg) {
    el.classList.add('error');
    el.classList.remove('valid');
    let errEl = el.nextElementSibling;
    if (!errEl || !errEl.classList.contains('field-error')) {
      errEl = document.createElement('div');
      errEl.className = 'field-error';
      errEl.style.cssText = 'font-size:0.8rem;color:#EF4444;margin-top:0.3rem;';
      el.parentNode.insertBefore(errEl, el.nextSibling);
    }
    errEl.textContent = msg;
  }

  function markValid(el) {
    el.classList.remove('error');
    el.classList.add('valid');
    const errEl = el.nextElementSibling;
    if (errEl && errEl.classList.contains('field-error')) errEl.remove();
  }

  /* ─── Inline validation on blur ─── */
  form.querySelectorAll('input, select, textarea').forEach(function (el) {
    el.addEventListener('blur', function () { validateField(el); });
    el.addEventListener('input', function () {
      if (el.classList.contains('error')) validateField(el);
    });
  });

  /* ─── At least one partner type selected ─── */
  function validatePartnerTypes() {
    const checked = form.querySelectorAll('input[name="partnerType"]:checked');
    const group   = form.querySelector('.checkbox-grid');
    const existing = form.querySelector('.partner-type-error');
    if (checked.length === 0) {
      if (!existing) {
        const err = document.createElement('div');
        err.className = 'partner-type-error';
        err.style.cssText = 'font-size:0.8rem;color:#EF4444;margin-top:0.5rem;';
        err.textContent  = 'Please select at least one partner type.';
        group.parentNode.appendChild(err);
      }
      return false;
    }
    if (existing) existing.remove();
    return true;
  }

  /* ─── Compliance checkbox ─── */
  function validateCompliance() {
    const cb = document.getElementById('compliance');
    if (!cb.checked) {
      markInvalid(cb, 'You must agree to the compliance terms to apply.');
      return false;
    }
    markValid(cb);
    return true;
  }

  /* ─── Collect form data ─── */
  function collectData() {
    const data = {};
    const fd   = new FormData(form);
    fd.forEach(function (val, key) {
      if (data[key]) {
        data[key] = [].concat(data[key], val);
      } else {
        data[key] = val;
      }
    });
    data.submittedAt = new Date().toISOString();
    data.status      = 'pending';
    return data;
  }

  /* ─── Save to localStorage (pending applications store) ─── */
  function savePending(data) {
    try {
      const existing = JSON.parse(localStorage.getItem('zuzu_partner_applications') || '[]');
      existing.push(data);
      localStorage.setItem('zuzu_partner_applications', JSON.stringify(existing));
    } catch (e) {
      // Storage unavailable — silent fail
    }
  }

  /* ─── Form submit ─── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let valid = true;

    // Validate required text/email fields
    form.querySelectorAll('input[required], select[required], textarea[required]').forEach(function (el) {
      if (!validateField(el)) valid = false;
    });

    // Validate partner type checkboxes
    if (!validatePartnerTypes()) valid = false;

    // Validate compliance
    if (!validateCompliance()) valid = false;

    if (!valid) {
      // Scroll to first error
      const firstError = form.querySelector('.error, .partner-type-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Disable button and show loading state
    submitBtn.disabled     = true;
    submitBtn.textContent  = 'Submitting…';

    // Simulate async submission (replace with real API call)
    setTimeout(function () {
      const data = collectData();
      savePending(data);

      // Hide form, show thank you
      form.style.display    = 'none';
      thankYou.style.display = 'block';
      thankYou.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 900);
  });

  /* ─── Smooth scroll for anchor links ─── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ─── Intersection Observer: fade-in sections ─── */
  if ('IntersectionObserver' in window) {
    const style = document.createElement('style');
    style.textContent = `
      .section, .who-card, .why-item, .reward-card, .faq-item {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.55s ease, transform 0.55s ease;
      }
      .section.visible, .who-card.visible, .why-item.visible,
      .reward-card.visible, .faq-item.visible {
        opacity: 1;
        transform: none;
      }
    `;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section, .who-card, .why-item, .reward-card, .faq-item')
      .forEach(function (el) { observer.observe(el); });
  }

})();
