/* ============================================
   MY CORNER — Application Logic
   Setup → AI Generate → Personal Page
   ============================================ */

const API_URL = '/api/generate';

// ─── DOM Refs ───
const $setup = document.getElementById('screen-setup');
const $loading = document.getElementById('screen-loading');
const $page = document.getElementById('screen-page');

const $blurb = document.getElementById('user-blurb');
const $charCount = document.getElementById('char-count');
const $btnGenerate = document.getElementById('btn-generate');
const $loadingText = document.getElementById('loading-text');
const $btnEdit = document.getElementById('btn-edit');
const $themeToggle = document.getElementById('theme-toggle');

// ─── Screen transitions ───
function showScreen(target) {
  document.querySelectorAll('.screen.active').forEach(s => {
    s.classList.add('fade-out');
    setTimeout(() => {
      s.classList.remove('active', 'fade-out');
      s.style.display = 'none';
    }, 400);
  });

  setTimeout(() => {
    target.style.display = 'flex';
    requestAnimationFrame(() => target.classList.add('active'));
    window.scrollTo(0, 0);
  }, 450);
}

// ─── Setup Screen Logic ───
$blurb.addEventListener('input', () => {
  const len = $blurb.value.length;
  $charCount.textContent = `${len} / 3000`;
  $btnGenerate.disabled = len < 20;
});

// Hint chips — add text to blurb
document.querySelectorAll('.hint-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const hint = chip.dataset.hint;
    const current = $blurb.value.trim();
    const separator = current ? '\n' : '';
    $blurb.value = current + separator + `• ${hint}: `;
    $blurb.focus();
    $blurb.setSelectionRange($blurb.value.length, $blurb.value.length);
    chip.classList.add('used');
    $blurb.dispatchEvent(new Event('input'));
  });
});

// ─── Generate Flow ───
$btnGenerate.addEventListener('click', async () => {
  const blurb = $blurb.value.trim();
  if (blurb.length < 20) return;

  // Show loading
  showScreen($loading);

  // Rotate loading messages
  const messages = [
    'Reading your story...',
    'Finding your vibe...',
    'Crafting your bio...',
    'Picking the perfect emojis...',
    'Almost there...',
  ];
  let msgIndex = 0;
  const msgInterval = setInterval(() => {
    msgIndex++;
    if (msgIndex < messages.length) {
      $loadingText.style.opacity = '0';
      setTimeout(() => {
        $loadingText.textContent = messages[msgIndex];
        $loadingText.style.opacity = '1';
      }, 300);
    }
  }, 2000);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blurb }),
    });

    clearInterval(msgInterval);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Generation failed');
    }

    const data = await response.json();
    renderPage(data.profile);
    showScreen($page);

    // Trigger staggered entrance
    setTimeout(() => {
      document.querySelector('.page-wrapper').classList.add('page-entering');
    }, 100);

  } catch (err) {
    clearInterval(msgInterval);
    console.error('Generation failed:', err);

    $loadingText.style.opacity = '0';
    setTimeout(() => {
      $loadingText.textContent = 'Something went wrong — let\'s try again.';
      $loadingText.style.opacity = '1';
    }, 300);

    setTimeout(() => showScreen($setup), 2500);
  }
});

// ─── Render the Generated Page ───
function renderPage(profile) {
  // Name
  const nameEl = document.getElementById('hero-name');
  nameEl.textContent = profile.name || 'Your Name';

  // Bio
  const bioEl = document.getElementById('hero-bio');
  bioEl.textContent = profile.bio || '';

  // Initials
  const initialsEl = document.getElementById('hero-initials');
  if (profile.name) {
    const initials = profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    initialsEl.textContent = initials;
    initialsEl.setAttribute('aria-label', `Photo of ${profile.name}`);
  }

  // Proud-of cards
  const proudGrid = document.getElementById('proud-grid');
  if (profile.proudOf && profile.proudOf.length > 0) {
    proudGrid.innerHTML = profile.proudOf.map(item => `
      <div class="proud-card">
        <span class="proud-emoji" aria-hidden="true">${item.emoji}</span>
        <div class="proud-title">${escapeHtml(item.title)}</div>
        <p class="proud-desc">${escapeHtml(item.description)}</p>
      </div>
    `).join('');
  }

  // Links
  const linksList = document.getElementById('links-list');
  if (profile.links && profile.links.length > 0) {
    linksList.innerHTML = profile.links.map(link => `
      <a href="${escapeHtml(link.url)}" class="link-button" target="_blank" rel="noopener noreferrer">
        <span class="link-emoji" aria-hidden="true">${link.emoji}</span>
        ${escapeHtml(link.label)}
      </a>
    `).join('');
    document.getElementById('links-section').style.display = '';
  }

  // Posts
  const postsList = document.getElementById('posts-list');
  if (profile.posts && profile.posts.length > 0) {
    postsList.innerHTML = profile.posts.map(post => `
      <li class="post-card">
        <div class="post-header">
          <span class="post-mood" aria-hidden="true">${post.mood || ''}</span>
          <span class="post-date">${formatDate(post.date)}</span>
        </div>
        <div class="post-title">${escapeHtml(post.title)}</div>
        <p class="post-body">${escapeHtml(post.body)}</p>
      </li>
    `).join('');
  } else {
    postsList.innerHTML = '<p class="posts-empty">Nothing here yet — check back soon.</p>';
  }

  // Page title
  document.title = `${profile.name || 'My Corner'} — My Corner`;

  // Init page features
  initScrollFadeIn();
  loadGuestbook();
  initGuestbookForm();
}

// ─── Edit Button → Go Back to Setup ───
$btnEdit.addEventListener('click', () => {
  showScreen($setup);
  document.querySelector('.page-wrapper').classList.remove('page-entering');
});

// ─── Dark Mode Toggle ───
function initThemeToggle() {
  const saved = localStorage.getItem('mycorner-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon('dark');
  }

  $themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    if (next === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', next);
    }
    localStorage.setItem('mycorner-theme', next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  $themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  $themeToggle.setAttribute('aria-label',
    theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  );
}

// ─── Seasonal Theme ───
function initSeasonalTheme() {
  const saved = localStorage.getItem('mycorner-season');
  if (saved && saved !== 'auto') {
    document.documentElement.setAttribute('data-season', saved);
    highlightSeasonBtn(saved);
    return;
  }
  const month = new Date().getMonth();
  const day = new Date().getDate();
  let season;
  if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day <= 20)) {
    season = 'spring';
  } else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day <= 21)) {
    season = 'summer';
  } else if ((month === 8 && day >= 22) || month === 9 || month === 10 || (month === 11 && day <= 20)) {
    season = 'autumn';
  } else {
    season = 'winter';
  }
  document.documentElement.setAttribute('data-season', season);
  highlightSeasonBtn(season);
}

function setSeason(season) {
  document.documentElement.setAttribute('data-season', season);
  localStorage.setItem('mycorner-season', season);
  highlightSeasonBtn(season);
}

function highlightSeasonBtn(season) {
  document.querySelectorAll('.season-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.season === season);
  });
}

// ─── Scroll Fade-In ───
function initScrollFadeIn() {
  const targets = document.querySelectorAll('.fade-in');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(el => observer.observe(el));
}

// ─── Guestbook (localStorage) ───
const GUESTBOOK_KEY = 'mycorner-guestbook';

function loadGuestbook() {
  const entries = getGuestbookEntries();
  renderGuestbook(entries);
}

function getGuestbookEntries() {
  try {
    return JSON.parse(localStorage.getItem(GUESTBOOK_KEY)) || [];
  } catch {
    return [];
  }
}

function saveGuestbookEntry(entry) {
  const entries = getGuestbookEntries();
  entries.unshift(entry);
  localStorage.setItem(GUESTBOOK_KEY, JSON.stringify(entries));
  return entries;
}

function renderGuestbook(entries) {
  const container = document.getElementById('guestbook-entries');
  if (!container) return;

  if (entries.length === 0) {
    container.innerHTML = '<p class="guestbook-empty">Be the first to sign. 📝</p>';
    return;
  }

  container.innerHTML = entries.map(e => `
    <li class="guestbook-entry">
      <div class="guestbook-entry-header">
        <span class="guestbook-dash">—</span>
        <span class="guestbook-name">${escapeHtml(e.name)}</span>
        <span class="guestbook-date">· ${formatDate(e.date)}</span>
      </div>
      <p class="guestbook-message">"${escapeHtml(e.message)}"</p>
    </li>
  `).join('');
}

function initGuestbookForm() {
  const form = document.getElementById('guestbook-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = form.querySelector('[name="gb-name"]');
    const msgInput = form.querySelector('[name="gb-message"]');
    const name = nameInput.value.trim().slice(0, 30);
    const message = msgInput.value.trim().slice(0, 140);

    if (!name || !message) return;

    const entry = {
      name,
      message,
      date: new Date().toISOString().split('T')[0]
    };

    const entries = saveGuestbookEntry(entry);
    renderGuestbook(entries);
    nameInput.value = '';
    msgInput.value = '';
  });
}

// ─── Utils ───
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Expose to HTML onclick
window.setSeason = setSeason;

// ─── Init ───
initThemeToggle();
initSeasonalTheme();
