/* ============================================================
   PureSmile Dental Clinic — script.js
   Features: Loader, Navbar, Scroll Reveal, Dark Mode,
   Hamburger Menu, Testimonials Slider, Gallery + Lightbox,
   Appointment Form, Auth (LocalStorage), Patient Dashboard,
   Toast Notifications, Form Validation, Confirmation Modal
   ============================================================ */

'use strict';

/* ===================== UTILITIES ===================== */

/**
 * Show a toast notification.
 * @param {string} msg - Message text
 * @param {'success'|'error'|''} type - Visual style
 * @param {number} duration - Auto-dismiss in ms
 */
function showToast(msg, type = '', duration = 3500) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast' + (type ? ' ' + type : '');
  toast.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => { toast.hidden = true; }, duration);
}

/** Validate email format */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Validate phone: at least 7 digits */
function isValidPhone(phone) {
  return /[\d\s\-().+]{7,}/.test(phone.trim());
}

/** Set field error text and invalid style */
function setError(inputEl, errEl, msg) {
  if (errEl) errEl.textContent = msg;
  if (inputEl) inputEl.classList.toggle('invalid', !!msg);
}

/** Clear all field errors in a form */
function clearErrors(form) {
  form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
}

/* ===================== LOADER ===================== */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  // Minimum display of 800ms for brand impression
  setTimeout(() => loader.classList.add('hidden'), 800);
});

/* ===================== NAVBAR ===================== */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navLinkEls = navLinks.querySelectorAll('.nav-link');

// Sticky scroll detection
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  highlightActiveNav();
}, { passive: true });

// Hamburger toggle
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu on link click
navLinkEls.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Active section highlighting
function highlightActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPos = window.scrollY + 100;
  let currentSection = '';
  sections.forEach(section => {
    if (scrollPos >= section.offsetTop) currentSection = section.id;
  });
  navLinkEls.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + currentSection);
  });
}

/* ===================== DARK MODE TOGGLE ===================== */
const darkToggle = document.getElementById('darkToggle');
// Persist preference
const savedTheme = localStorage.getItem('puresmile-theme') || 'light';
document.body.classList.add(savedTheme + '-mode');
if (savedTheme === 'dark') document.body.classList.remove('light-mode');

darkToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode', !isDark);
  localStorage.setItem('puresmile-theme', isDark ? 'dark' : 'light');
});

/* ===================== SCROLL REVEAL ===================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger sibling reveals in same parent
      const siblings = entry.target.parentElement.querySelectorAll('.reveal:not(.visible)');
      siblings.forEach((el, idx) => {
        setTimeout(() => el.classList.add('visible'), idx * 80);
      });
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ===================== SMOOTH HERO CTA ===================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ===================== TESTIMONIALS SLIDER ===================== */
(function initSlider() {
  const track = document.getElementById('testimonialsTrack');
  const dotsContainer = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const cards = track.querySelectorAll('.testi-card');
  const VISIBLE = window.innerWidth > 768 ? 3 : 1;
  let current = 0;
  const maxIndex = Math.ceil(cards.length / VISIBLE) - 1;

  // Build dots
  for (let i = 0; i <= maxIndex; i++) {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex));
    const cardWidth = cards[0].offsetWidth + 24; // gap
    track.style.transform = `translateX(-${current * cardWidth * VISIBLE}px)`;
    dotsContainer.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Auto-advance every 5s
  let autoplay = setInterval(() => goTo(current < maxIndex ? current + 1 : 0), 5000);
  track.addEventListener('mouseenter', () => clearInterval(autoplay));
  track.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => goTo(current < maxIndex ? current + 1 : 0), 5000);
  });

  // Touch/swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });
})();

/* ===================== GALLERY & LIGHTBOX ===================== */
(function initGallery() {
  const tabs = document.querySelectorAll('.tab-btn');
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxImgWrap = document.getElementById('lightboxImgWrap');
  const lightboxCaption = document.getElementById('lightboxCaption');

  // Filter tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.tab;
      items.forEach(item => {
        if (filter === 'all' || item.dataset.cat === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // Lightbox open
  items.forEach(item => {
    item.addEventListener('click', () => {
      const thumb = item.querySelector('.gallery-thumb');
      const caption = item.querySelector('.gallery-overlay span')?.textContent || '';
      lightboxImgWrap.innerHTML = thumb.innerHTML;
      lightboxImgWrap.querySelector('svg')?.setAttribute('style', 'width:100%;max-height:70vh;');
      lightboxCaption.textContent = caption;
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxOverlay.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
})();

/* ===================== APPOINTMENT FORM ===================== */
(function initAppointmentForm() {
  const form = document.getElementById('appointmentForm');
  if (!form) return;

  // Set min date to today
  const dateInput = document.getElementById('apptDate');
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);

    const name = document.getElementById('apptName');
    const phone = document.getElementById('apptPhone');
    const email = document.getElementById('apptEmail');
    const date = document.getElementById('apptDate');
    const service = document.getElementById('apptService');

    let valid = true;

    if (!name.value.trim() || name.value.trim().length < 2) {
      setError(name, document.getElementById('apptNameErr'), 'Please enter your full name.');
      valid = false;
    }
    if (!isValidPhone(phone.value)) {
      setError(phone, document.getElementById('apptPhoneErr'), 'Please enter a valid phone number.');
      valid = false;
    }
    if (!isValidEmail(email.value)) {
      setError(email, document.getElementById('apptEmailErr'), 'Please enter a valid email address.');
      valid = false;
    }
    if (!date.value) {
      setError(date, document.getElementById('apptDateErr'), 'Please select a preferred date.');
      valid = false;
    }
    if (!service.value) {
      setError(service, document.getElementById('apptServiceErr'), 'Please select a service.');
      valid = false;
    }

    if (!valid) return;

    // Simulate async booking
    const submitBtn = document.getElementById('apptSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Booking…';

    await new Promise(r => setTimeout(r, 1400));

    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').textContent = 'Confirm Appointment';

    // Save appointment to localStorage
    const currentUser = getCurrentUser();
    const apptData = {
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      date: date.value,
      service: service.value,
      message: document.getElementById('apptMessage').value.trim(),
      bookedAt: new Date().toISOString()
    };
    if (currentUser) {
      const userAppts = JSON.parse(localStorage.getItem('puresmile-appts-' + currentUser.email) || '[]');
      userAppts.push(apptData);
      localStorage.setItem('puresmile-appts-' + currentUser.email, JSON.stringify(userAppts));
    }

    // Show confirmation modal
    const formattedDate = new Date(date.value + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    document.getElementById('confirmDetail').innerHTML =
      `<strong>Patient:</strong> ${apptData.name}<br/>` +
      `<strong>Service:</strong> ${apptData.service}<br/>` +
      `<strong>Date:</strong> ${formattedDate}<br/>` +
      `<strong>Confirmation sent to:</strong> ${apptData.email}`;

    openModal('confirmModal');
    form.reset();
  });

  document.getElementById('confirmOk').addEventListener('click', () => closeModal('confirmModal'));
  document.getElementById('confirmOverlay').addEventListener('click', () => closeModal('confirmModal'));
})();

/* ===================== CONTACT FORM ===================== */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);

    const name = document.getElementById('ctName');
    const email = document.getElementById('ctEmail');
    const message = document.getElementById('ctMessage');
    let valid = true;

    if (!name.value.trim() || name.value.trim().length < 2) {
      setError(name, document.getElementById('ctNameErr'), 'Name is required.');
      valid = false;
    }
    if (!isValidEmail(email.value)) {
      setError(email, document.getElementById('ctEmailErr'), 'Valid email is required.');
      valid = false;
    }
    if (!message.value.trim() || message.value.trim().length < 10) {
      setError(message, document.getElementById('ctMessageErr'), 'Please write at least 10 characters.');
      valid = false;
    }

    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    await new Promise(r => setTimeout(r, 1200));
    btn.textContent = 'Send Message';
    btn.disabled = false;
    form.reset();
    showToast('Your message has been sent! We\'ll be in touch soon.', 'success');
  });
})();

/* ===================== NEWSLETTER FORM ===================== */
document.getElementById('newsletterForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  if (!isValidEmail(input.value)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }
  showToast('Thanks for subscribing! 🦷', 'success');
  e.target.reset();
});

/* ===================== MODAL HELPERS ===================== */
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
}

/* ===================== AUTH SYSTEM ===================== */

/** Get all registered users from localStorage */
function getUsers() {
  return JSON.parse(localStorage.getItem('puresmile-users') || '[]');
}

/** Save users array back to localStorage */
function saveUsers(users) {
  localStorage.setItem('puresmile-users', JSON.stringify(users));
}

/** Get currently logged-in user object or null */
function getCurrentUser() {
  const raw = sessionStorage.getItem('puresmile-current-user');
  return raw ? JSON.parse(raw) : null;
}

/** Store logged-in user in session */
function setCurrentUser(user) {
  sessionStorage.setItem('puresmile-current-user', JSON.stringify(user));
}

/** Clear session (logout) */
function clearCurrentUser() {
  sessionStorage.removeItem('puresmile-current-user');
}

/** Update the Patient Login nav button based on auth state */
function updateNavAuthButton() {
  const user = getCurrentUser();
  const btn = document.getElementById('openAuthModal');
  if (user) {
    btn.textContent = user.firstName + '\'s Dashboard';
    btn.onclick = () => openDashboard();
  } else {
    btn.textContent = 'Patient Login';
    btn.onclick = () => openModal('authModal');
  }
}

/** Open auth modal */
document.getElementById('openAuthModal').addEventListener('click', () => {
  const user = getCurrentUser();
  if (user) openDashboard();
  else openModal('authModal');
});

document.getElementById('authClose').addEventListener('click', () => closeModal('authModal'));
document.getElementById('authOverlay').addEventListener('click', () => closeModal('authModal'));

/* Auth tab switching */
const authTabs = document.querySelectorAll('.auth-tab');
authTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    authTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === target));
    document.getElementById('loginPanel').hidden = (target !== 'login');
    document.getElementById('registerPanel').hidden = (target !== 'register');
  });
});

/* Switch links inside auth forms */
document.querySelectorAll('.link-btn[data-switch]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.switch;
    authTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === target));
    document.getElementById('loginPanel').hidden = (target !== 'login');
    document.getElementById('registerPanel').hidden = (target !== 'register');
  });
});

/* LOGIN FORM */
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  clearErrors(form);

  const emailEl = document.getElementById('loginEmail');
  const passwordEl = document.getElementById('loginPassword');
  let valid = true;

  if (!isValidEmail(emailEl.value)) {
    setError(emailEl, document.getElementById('loginEmailErr'), 'Enter a valid email.');
    valid = false;
  }
  if (passwordEl.value.length < 6) {
    setError(passwordEl, document.getElementById('loginPasswordErr'), 'Password must be at least 6 characters.');
    valid = false;
  }
  if (!valid) return;

  const users = getUsers();
  const user = users.find(u => u.email === emailEl.value.trim().toLowerCase() && u.password === passwordEl.value);
  if (!user) {
    setError(passwordEl, document.getElementById('loginPasswordErr'), 'Invalid email or password.');
    return;
  }

  setCurrentUser(user);
  closeModal('authModal');
  updateNavAuthButton();
  showToast(`Welcome back, ${user.firstName}! 👋`, 'success');
  openDashboard();
});

/* REGISTER FORM */
document.getElementById('registerForm').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  clearErrors(form);

  const firstEl = document.getElementById('regFirst');
  const lastEl = document.getElementById('regLast');
  const emailEl = document.getElementById('regEmail');
  const passwordEl = document.getElementById('regPassword');
  let valid = true;

  if (!firstEl.value.trim()) {
    setError(firstEl, document.getElementById('regFirstErr'), 'First name is required.');
    valid = false;
  }
  if (!lastEl.value.trim()) {
    setError(lastEl, document.getElementById('regLastErr'), 'Last name is required.');
    valid = false;
  }
  if (!isValidEmail(emailEl.value)) {
    setError(emailEl, document.getElementById('regEmailErr'), 'Enter a valid email.');
    valid = false;
  }
  if (passwordEl.value.length < 6) {
    setError(passwordEl, document.getElementById('regPasswordErr'), 'Password must be at least 6 characters.');
    valid = false;
  }
  if (!valid) return;

  const users = getUsers();
  if (users.find(u => u.email === emailEl.value.trim().toLowerCase())) {
    setError(emailEl, document.getElementById('regEmailErr'), 'An account with this email already exists.');
    return;
  }

  const newUser = {
    firstName: firstEl.value.trim(),
    lastName: lastEl.value.trim(),
    email: emailEl.value.trim().toLowerCase(),
    phone: document.getElementById('regPhone').value.trim(),
    password: passwordEl.value,
    registeredAt: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);

  closeModal('authModal');
  updateNavAuthButton();
  showToast(`Welcome to PureSmile, ${newUser.firstName}! 🦷`, 'success');
  openDashboard();
});

/* ===================== PATIENT DASHBOARD ===================== */
function openDashboard() {
  const user = getCurrentUser();
  if (!user) return;

  // Set avatar initials
  const initials = (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase();
  document.getElementById('dashAvatar').textContent = initials;
  document.getElementById('dashWelcome').textContent = `Welcome, ${user.firstName}!`;
  document.getElementById('dashEmail').textContent = user.email;

  // Load appointments from localStorage
  const storedAppts = JSON.parse(localStorage.getItem('puresmile-appts-' + user.email) || '[]');
  renderDashboardAppts(user, storedAppts);

  openModal('dashModal');
}

function renderDashboardAppts(user, storedAppts) {
  const container = document.getElementById('apptHistory');
  
  // Seed data + stored appointments
  const defaultAppts = [
    { service: 'Dental Cleaning', date: '2025-01-05', status: 'done' },
    { service: 'General Consultation', date: '2025-04-18', status: 'upcoming' }
  ];
  
  const allAppts = [
    ...defaultAppts,
    ...storedAppts.map(a => ({ service: a.service, date: a.date, status: 'upcoming' }))
  ];

  container.innerHTML = allAppts.map(appt => {
    const formatted = new Date(appt.date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    return `
      <div class="appt-row">
        <div class="appt-info">
          <strong>${appt.service}</strong>
          <span>Dr. Sarah Mitchell</span>
        </div>
        <div class="appt-meta">
          <span class="appt-date">${formatted}</span>
          <span class="appt-status ${appt.status === 'done' ? 'status-done' : 'status-upcoming'}">
            ${appt.status === 'done' ? 'Completed' : 'Upcoming'}
          </span>
        </div>
      </div>
    `;
  }).join('');

  // Update stats
  const upcoming = allAppts.filter(a => a.status === 'upcoming').length;
  const done = allAppts.filter(a => a.status === 'done').length;
  const statsEls = document.querySelectorAll('.dash-stat strong');
  if (statsEls[0]) statsEls[0].textContent = allAppts.length;
  if (statsEls[1]) statsEls[1].textContent = upcoming;
}

document.getElementById('dashClose').addEventListener('click', () => closeModal('dashModal'));
document.getElementById('dashOverlay').addEventListener('click', () => closeModal('dashModal'));

document.getElementById('dashBookBtn').addEventListener('click', () => {
  closeModal('dashModal');
  document.getElementById('appointment').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  clearCurrentUser();
  closeModal('dashModal');
  updateNavAuthButton();
  showToast('You have been logged out.', '');
});

/* ===================== SERVICE CARD CLICK ===================== */
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('click', () => {
    const service = card.dataset.service;
    const serviceSelect = document.getElementById('apptService');
    if (serviceSelect) {
      const option = [...serviceSelect.options].find(o => o.value === service);
      if (option) serviceSelect.value = service;
    }
    document.getElementById('appointment').scrollIntoView({ behavior: 'smooth' });
  });
});

/* ===================== KEYBOARD ACCESSIBILITY ===================== */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['authModal', 'dashModal', 'confirmModal'].forEach(id => {
      const modal = document.getElementById(id);
      if (modal && !modal.hidden) closeModal(id);
    });
    const lightbox = document.getElementById('lightbox');
    if (lightbox && !lightbox.hidden) {
      lightbox.hidden = true;
      document.body.style.overflow = '';
    }
  }
});

/* ===================== INIT ===================== */
(function init() {
  updateNavAuthButton();

  // Set current year in footer if needed
  const yearEl = document.querySelector('.footer-bottom span');
  if (yearEl) {
    yearEl.textContent = yearEl.textContent.replace('2025', new Date().getFullYear());
  }

  // Refresh dark mode on init (already handled above, but ensure correct class state)
  const isDark = localStorage.getItem('puresmile-theme') === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  document.body.classList.toggle('light-mode', !isDark);
})();