/* ============================================
   MY YEAR IN MOMENTS — Y2K Dreamcore Edition
   Application Logic — Cinematic Story Flow
   ============================================ */

const API_URL = '/api/generate';
const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Y2K Dreamcore holographic accent palette
const ACCENT_COLORS = [
  '#FF3DC7', // neon magenta
  '#C8B6FF', // hologram lavender
  '#3DDCFF', // neon cyan
  '#FFB6E1', // hologram pink
  '#B8F2E6', // hologram mint
  '#FFD6BA', // hologram peach
];

const PLACEHOLDERS = [
  "the day i moved to san francisco",
  "mom's birthday ✦",
  "our anniversary ♥",
  "the day i got promoted",
  "when i adopted my cat, miso",
  "first day at my new job",
  "the day we met ♪",
  "graduation day",
];

let moments = [];
let currentYear = new Date().getFullYear();
let placeholderIndex = 0;

// Story state
let storySlides = [];          // Array of slide data objects
let currentSlide = 0;
let isTransitioning = false;
let momentsSnapshot = [];      // frozen copy of input moments — survives reset for stats

// ─── DOM refs ───
const $landing   = document.getElementById('screen-landing');
const $input     = document.getElementById('screen-input');
const $loading   = document.getElementById('screen-loading');
const $story     = document.getElementById('screen-story');
const $momentsList    = document.getElementById('moments-list');
const $counter        = document.getElementById('moment-counter');
const $btnGenerate    = document.getElementById('btn-generate');
const $btnBegin       = document.getElementById('btn-begin');
const $btnAdd         = document.getElementById('btn-add-moment');
const $loadingText    = document.getElementById('loading-text');
const $bigProgressFill = document.getElementById('big-progress-fill');
const $scrollProgress  = document.getElementById('scroll-progress');
const $storyViewport  = document.getElementById('story-viewport');
const $storyTimeline  = document.getElementById('story-timeline');
const $btnPrev        = document.getElementById('btn-prev-chapter');
const $btnNext        = document.getElementById('btn-next-chapter');
const $chapterIndicator = document.getElementById('chapter-indicator');

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
    requestAnimationFrame(() => { target.classList.add('active'); });
    // Hide scroll progress for story (we use timeline dots instead)
    $scrollProgress.classList.remove('visible');
  }, 450);
}

// ─── Moment card management (mini chrome windows) ───
function createMomentCard(index, prefill = {}) {
  const card = document.createElement('div');
  card.className = 'moment-card';
  card.dataset.index = index;

  const placeholder = PLACEHOLDERS[placeholderIndex++ % PLACEHOLDERS.length];

  card.innerHTML = `
    <div class="card-header">
      <span class="card-number">FILE_${String(index + 1).padStart(2, '0')}.MOMENT</span>
      <button class="btn-remove" title="Remove">×</button>
    </div>
    <div class="card-fields">
      <div class="field-group">
        <label class="field-label">Date</label>
        <input type="date" class="field-input" data-field="date"
               value="${prefill.date || ''}" min="${currentYear}-01-01" max="${currentYear}-12-31" />
      </div>
      <div class="field-group">
        <label class="field-label">What happened?</label>
        <input type="text" class="field-input" data-field="description"
               placeholder="${prefill.description || placeholder}" maxlength="100"
               value="${prefill.description || ''}" />
      </div>
      <div class="field-group">
        <label class="field-label">Who is this about? (optional)</label>
        <input type="text" class="field-input" data-field="person"
               placeholder="e.g. luna, my golden retriever ♥" maxlength="60"
               value="${prefill.person || ''}" />
      </div>
    </div>
  `;

  card.querySelector('.btn-remove').addEventListener('click', () => removeMoment(card));
  card.querySelectorAll('.field-input').forEach(input => {
    input.addEventListener('input', syncMoments);
  });

  return card;
}

function addMoment(prefill = {}) {
  if (moments.length >= 20) return;
  const index = $momentsList.children.length;
  const card = createMomentCard(index, prefill);
  $momentsList.appendChild(card);
  syncMoments();
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function removeMoment(card) {
  if ($momentsList.children.length <= 1) return;
  card.classList.add('removing');
  setTimeout(() => {
    card.remove();
    renumberCards();
    syncMoments();
  }, 320);
}

function renumberCards() {
  $momentsList.querySelectorAll('.moment-card').forEach((card, i) => {
    card.dataset.index = i;
    card.querySelector('.card-number').textContent =
      `FILE_${String(i + 1).padStart(2, '0')}.MOMENT`;
  });
}

function syncMoments() {
  moments = [];
  $momentsList.querySelectorAll('.moment-card').forEach(card => {
    const date = card.querySelector('[data-field="date"]').value;
    const desc = card.querySelector('[data-field="description"]').value;
    const person = card.querySelector('[data-field="person"]').value;
    if (date && desc) {
      moments.push({ date, description: desc, person: person || null });
    }
  });

  const count = moments.length;
  $counter.textContent = `${count} MOMENT${count !== 1 ? 'S' : ''} ADDED`;
  $btnGenerate.disabled = count < 3;
}

// ─── Loading animation (Y2K download window) ───
function runLoadingAnimation() {
  const steps = [
    { text: 'INITIALIZING DREAM.EXE...', pct: 8 },
    { text: 'DOWNLOADING YOUR YEAR... 24%', pct: 24 },
    { text: 'APPLYING HOLOGRAPHIC FILTER... 48%', pct: 48 },
    { text: 'GLITTER PARTICLES LOADING... 67%', pct: 67 },
    { text: 'POLISHING THE CHROME... 85%', pct: 85 },
    { text: 'ALMOST READY ♥ ... 96%', pct: 96 },
  ];

  $loadingText.textContent = steps[0].text;
  $bigProgressFill.style.width = steps[0].pct + '%';

  const timeouts = [];
  steps.forEach((step, i) => {
    if (i === 0) return;
    const t = setTimeout(() => {
      $loadingText.textContent = step.text;
      $bigProgressFill.style.width = step.pct + '%';
    }, i * 750);
    timeouts.push(t);
  });

  return () => timeouts.forEach(t => clearTimeout(t));
}

// ============================================================
// STORY RENDERING — Cinematic chapter-by-chapter flow
// ============================================================

function renderStory(data) {
  const cal = data.calendar;
  storySlides = [];
  currentSlide = 0;

  // Assign accent colors
  cal.moments.forEach((m, i) => {
    m.color_accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
  });

  // 1. Opening slide
  storySlides.push({
    type: 'opening',
    count: cal.moments.length,
    year: cal.year,
  });

  // 2. One slide per moment (sorted by date already from backend)
  const totalChapters = cal.moments.length;
  cal.moments.forEach((m, i) => {
    const parts = m.date.split('-');
    const monthIdx = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    const dt = new Date(cal.year, monthIdx, day);
    const dayName = DAY_NAMES[dt.getDay()];

    storySlides.push({
      type: 'chapter',
      index: i + 1,
      total: totalChapters,
      emoji: m.emoji,
      note: m.note,
      date: m.date,
      dayName: dayName,
      monthName: MONTH_NAMES[monthIdx],
      day: day,
      originalDesc: m.original_description,
      color: m.color_accent,
    });
  });

  // 3. Summary card slide (the finale, replaces the old closing reflection)
  storySlides.push({
    type: 'summary',
    year: cal.year,
    closingNote: cal.closing_note,
    stats: computeYearStats(cal, momentsSnapshot),
  });

  // Build timeline
  buildTimeline();

  // Render first slide
  renderCurrentSlide('none');
  updateNav();
}

// ─── Compute stats for the summary card ───
function computeYearStats(cal, snapshot) {
  const total = cal.moments.length;

  // Unique people from the original input (snapshot survives reset)
  const peopleSet = new Set(
    (snapshot || [])
      .map(m => (m.person || '').trim().toLowerCase())
      .filter(Boolean)
  );
  const peopleCount = peopleSet.size;

  // Busiest month
  const monthCounts = {};
  cal.moments.forEach(m => {
    const mo = parseInt(m.date.split('-')[1]);
    monthCounts[mo] = (monthCounts[mo] || 0) + 1;
  });
  let busiestMonth = 1, busiestCount = 0;
  for (let mo = 1; mo <= 12; mo++) {
    if ((monthCounts[mo] || 0) > busiestCount) {
      busiestCount = monthCounts[mo];
      busiestMonth = mo;
    }
  }
  const busiestMonthAbbr = MONTH_NAMES[busiestMonth - 1].slice(0, 3).toUpperCase();

  // First 3 highlights (already date-sorted by backend)
  const highlights = cal.moments.slice(0, 3).map(m => {
    const parts = m.date.split('-');
    const monthIdx = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    return {
      emoji: m.emoji,
      monthAbbr: MONTH_NAMES[monthIdx].slice(0, 3).toUpperCase(),
      day: day,
      desc: m.original_description,
      color: m.color_accent,
    };
  });

  return { total, peopleCount, busiestMonthAbbr, highlights };
}

// ─── Build timeline dots ───
function buildTimeline() {
  $storyTimeline.innerHTML = '';

  storySlides.forEach((slide, i) => {
    const dot = document.createElement('div');
    dot.className = 'timeline-dot';
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      if (i !== currentSlide && !isTransitioning) {
        const direction = i > currentSlide ? 'right' : 'left';
        currentSlide = i;
        renderCurrentSlide(direction);
        updateNav();
        updateTimeline();
      }
    });
    $storyTimeline.appendChild(dot);

    // Add connecting line between dots (not after last)
    if (i < storySlides.length - 1) {
      const line = document.createElement('div');
      line.className = 'timeline-line';
      $storyTimeline.appendChild(line);
    }
  });
}

function updateTimeline() {
  const dots = $storyTimeline.querySelectorAll('.timeline-dot');
  const lines = $storyTimeline.querySelectorAll('.timeline-line');

  dots.forEach((dot, i) => {
    dot.classList.remove('active', 'visited');
    if (i === currentSlide) {
      dot.classList.add('active');
    } else if (i < currentSlide) {
      dot.classList.add('visited');
    }
  });

  lines.forEach((line, i) => {
    line.classList.toggle('visited', i < currentSlide);
  });
}

// ─── Render a single slide into the viewport ───
function renderCurrentSlide(direction) {
  const slide = storySlides[currentSlide];
  const oldCard = $storyViewport.querySelector('.chapter-card.active');

  // Build the new card
  const card = document.createElement('div');
  card.className = 'chrome-window chapter-card';

  if (slide.type === 'opening') {
    card.classList.add('chapter-opening');
    card.innerHTML = `
      <div class="chrome-window-header">
        <span class="hdr-left">[X]</span>
        <span class="hdr-title">C:\\YEAR\\STORY.EXE</span>
        <span class="hdr-right">🛍 ✨ ♪</span>
      </div>
      <div class="chapter-inner">
        <div class="opening-count">★ FILE LOADED SUCCESSFULLY ★</div>
        <h1 class="opening-title">YOUR YEAR<br>IN MOMENTS</h1>
        <p class="opening-subtitle">
          your year had <strong>${slide.count} moments</strong> worth remembering.<br>
          let's walk through them, one by one ✦
        </p>
        <div class="chapter-divider">✦ ✧ ⭒ ✦ ✧</div>
        <p class="chapter-desc">use the arrows to navigate your story, or press → to begin</p>
      </div>
    `;
  } else if (slide.type === 'chapter') {
    card.classList.add('chapter-moment');
    card.style.setProperty('--chapter-accent', slide.color);
    card.innerHTML = `
      <div class="chrome-window-header">
        <span class="hdr-left">[X]</span>
        <span class="hdr-title">CHAPTER_${String(slide.index).padStart(2,'0')}.MOMENT</span>
        <span class="hdr-right">💌 ✨</span>
      </div>
      <div class="chapter-scanlines" aria-hidden="true"></div>
      <div class="chapter-shimmer" aria-hidden="true"></div>
      <div class="chapter-inner">
        <div class="chapter-ribbon">
          <span class="ribbon-spark">✦</span>
          <span>CHAPTER ${String(slide.index).padStart(2,'0')} OF ${String(slide.total).padStart(2,'0')}</span>
          <span class="ribbon-spark">✦</span>
        </div>
        <div class="chapter-emoji-frame">
          <div class="chapter-emoji-glow"></div>
          <div class="chapter-emoji">${slide.emoji}</div>
        </div>
        <p class="chapter-note">${slide.note}</p>
        <div class="chapter-divider">✦ ✧ ⭒</div>
        <div class="chapter-date">${slide.monthName} ${slide.day}, ${slide.dayName}</div>
        <p class="chapter-source-caption">SOURCE: "${slide.originalDesc}"</p>
      </div>
    `;
    // Tint the chrome window border with the accent color
    card.style.borderColor = slide.color;
    card.style.boxShadow = `
      inset 1.5px 1.5px 0 var(--chrome-light),
      inset -1.5px -1.5px 0 var(--chrome-shadow),
      0 10px 30px ${slide.color}44,
      0 2px 6px rgba(74, 74, 106, 0.18)`;
  } else if (slide.type === 'summary') {
    card.classList.add('chapter-summary');
    card.innerHTML = renderSummaryCard(slide);
  }

  // Animate transition
  if (direction === 'none' || !oldCard) {
    // No animation — first render
    $storyViewport.innerHTML = '';
    card.classList.add('active');
    $storyViewport.appendChild(card);
    attachClosingHandler(card);
  } else {
    isTransitioning = true;

    // Animate old card out
    const outClass = direction === 'right' ? 'slide-out-left' : 'slide-out-right';
    const inClass = direction === 'right' ? 'slide-in-right' : 'slide-in-left';

    oldCard.classList.remove('active');
    oldCard.classList.add(outClass);

    setTimeout(() => {
      $storyViewport.innerHTML = '';
      card.classList.add('active', inClass);
      $storyViewport.appendChild(card);
      attachClosingHandler(card);

      // Clean up animation class after it finishes
      setTimeout(() => {
        card.classList.remove(inClass);
        isTransitioning = false;
      }, 460);
    }, 360);
  }
}

// ─── Summary card markup ───
function renderSummaryCard(slide) {
  const { stats, year, closingNote } = slide;

  const highlightsHTML = stats.highlights.map(h => `
    <div class="hl-row" style="--hl-accent: ${h.color}">
      <div class="hl-emoji">${h.emoji}</div>
      <div class="hl-text">
        <div class="hl-date">${h.monthAbbr} ${String(h.day).padStart(2,'0')}</div>
        <div class="hl-desc">${h.desc}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="chrome-window-header summary-slide-header">
      <span class="hdr-left">[X]</span>
      <span class="hdr-title">EXPORT_VIEWER.EXE</span>
      <span class="hdr-right">📷 ✨ ♪</span>
    </div>

    <div class="summary-slide-inner">

      <!-- The exportable card -->
      <div class="summary-card" id="summary-card-export">
        <div class="summary-card-header">
          <span class="hdr-left">[X]</span>
          <span class="hdr-title">MY_YEAR_${year}.CARD</span>
          <span class="hdr-right">🛍 ✨ ♪</span>
        </div>
        <div class="summary-card-body">
          <div class="summary-deco-band top">✦ ─────────── ✦</div>
          <p class="summary-kicker">a year in moments</p>

          <div class="summary-year">
            <span class="year-digits">${year}</span>
            <div class="year-rule"></div>
          </div>

          <div class="summary-stats">
            <div class="stat-tile">
              <div class="stat-tile-header"><span>✦</span><span>STAT_01</span></div>
              <div class="stat-tile-body">
                <div class="stat-num">${stats.total}</div>
                <div class="stat-label">moments</div>
              </div>
            </div>
            <div class="stat-tile">
              <div class="stat-tile-header"><span>✦</span><span>STAT_02</span></div>
              <div class="stat-tile-body">
                <div class="stat-num">${stats.peopleCount}</div>
                <div class="stat-label">${stats.peopleCount === 1 ? 'person' : 'people'}</div>
              </div>
            </div>
            <div class="stat-tile">
              <div class="stat-tile-header"><span>✦</span><span>STAT_03</span></div>
              <div class="stat-tile-body">
                <div class="stat-num stat-num-sm">${stats.busiestMonthAbbr}</div>
                <div class="stat-label">peak month</div>
              </div>
            </div>
          </div>

          <div class="summary-section-rule">── ✦ HIGHLIGHTS ✦ ──</div>
          <div class="summary-highlights">
            ${highlightsHTML}
          </div>

          <div class="summary-section-rule">── ✦ THE THEME ✦ ──</div>
          <div class="summary-theme">
            <span class="theme-quote-mark theme-quote-open">&#10077;</span>
            <p class="theme-text">${closingNote}</p>
            <span class="theme-quote-mark theme-quote-close">&#10078;</span>
          </div>

          <div class="summary-deco-row">♪ ✧ ⭒ ✦ ✧ ♥ ✦</div>

          <div class="summary-footer">
            <span>✦ year-in-poetry · ${year} ✦</span>
          </div>
        </div>
      </div>

      <!-- Action buttons (NOT included in export) -->
      <div class="summary-actions" data-export-skip="true">
        <button class="btn-y2k btn-save-card" id="btn-save-card">
          <span class="btn-text">✦ SAVE.PNG ✦</span>
        </button>
        <button class="btn-start-over" id="btn-start-over-dynamic">♪ create another year</button>
      </div>

    </div>
  `;
}

function attachClosingHandler(card) {
  const btnRestart = card.querySelector('#btn-start-over-dynamic');
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      moments = [];
      momentsSnapshot = [];
      $momentsList.innerHTML = '';
      storySlides = [];
      currentSlide = 0;
      placeholderIndex = 0;
      showScreen($input);
      setTimeout(() => {
        addMoment();
        setTimeout(() => addMoment(), 120);
        setTimeout(() => addMoment(), 240);
      }, 500);
    });
  }

  const btnSave = card.querySelector('#btn-save-card');
  if (btnSave) {
    btnSave.addEventListener('click', () => saveSummaryCard(btnSave));
  }
}

// ─── Save the summary card as PNG ───
async function saveSummaryCard(btn) {
  const target = document.getElementById('summary-card-export');
  if (!target) return;

  const originalLabel = btn.querySelector('.btn-text').textContent;
  btn.disabled = true;
  btn.querySelector('.btn-text').textContent = '⏳ EXPORTING...';

  try {
    if (typeof html2canvas === 'undefined') {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    if (document.fonts && document.fonts.ready) await document.fonts.ready;

    // Temporarily reset rotation/animation so html2canvas captures clean edges
    const prevTransform = target.style.transform;
    const prevAnimation = target.style.animation;
    target.style.transform = 'none';
    target.style.animation = 'none';

    const canvas = await html2canvas(target, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    target.style.transform = prevTransform;
    target.style.animation = prevAnimation;

    const link = document.createElement('a');
    link.download = `my-year-${currentYear}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    btn.querySelector('.btn-text').textContent = '✦ SAVED ♥ ✦';
    setTimeout(() => {
      btn.querySelector('.btn-text').textContent = originalLabel;
      btn.disabled = false;
    }, 1800);
  } catch (err) {
    console.error('Export failed:', err);
    btn.querySelector('.btn-text').textContent = '!! TRY AGAIN ?';
    setTimeout(() => {
      btn.querySelector('.btn-text').textContent = originalLabel;
      btn.disabled = false;
    }, 2000);
  }
}

// ─── Navigation ───
function updateNav() {
  const total = storySlides.length;
  $btnPrev.disabled = currentSlide === 0;

  // On the last slide, hide the next button
  if (currentSlide >= total - 1) {
    $btnNext.disabled = true;
  } else {
    $btnNext.disabled = false;
  }

  $chapterIndicator.textContent =
    `${String(currentSlide + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  updateTimeline();
}

function goNext() {
  if (currentSlide < storySlides.length - 1 && !isTransitioning) {
    currentSlide++;
    renderCurrentSlide('right');
    updateNav();
  }
}

function goPrev() {
  if (currentSlide > 0 && !isTransitioning) {
    currentSlide--;
    renderCurrentSlide('left');
    updateNav();
  }
}

$btnPrev.addEventListener('click', goPrev);
$btnNext.addEventListener('click', goNext);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!$story.classList.contains('active')) return;
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    goNext();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    goPrev();
  }
});

// Touch swipe support
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
  if (!$story.classList.contains('active')) return;
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  if (!$story.classList.contains('active')) return;
  touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) goNext();   // swipe left = next
    else goPrev();             // swipe right = prev
  }
}, { passive: true });

// ─── Generate flow ───
async function generate() {
  // Freeze the input moments so we can compute people-count later
  momentsSnapshot = moments.map(m => ({ ...m }));

  showScreen($loading);
  const stopLoading = runLoadingAnimation();

  const minDelay = new Promise(resolve => setTimeout(resolve, 4500));

  try {
    const [_, response] = await Promise.all([
      minDelay,
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moments, year: currentYear }),
      }),
    ]);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Generation failed');
    }

    const data = await response.json();
    stopLoading();

    // Brief flash to 100% before transition
    $loadingText.textContent = '✦ READY ✦ — 100%';
    $bigProgressFill.style.width = '100%';
    await new Promise(r => setTimeout(r, 450));

    renderStory(data);
    showScreen($story);

  } catch (err) {
    stopLoading();
    $loadingText.textContent = '!! SYSTEM HICCUP — try again ?';
    $bigProgressFill.style.width = '0%';
    setTimeout(() => showScreen($input), 2500);
    console.error(err);
  }
}

// ─── Event listeners ───
$btnBegin.addEventListener('click', () => {
  showScreen($input);
  setTimeout(() => {
    addMoment();
    setTimeout(() => addMoment(), 120);
    setTimeout(() => addMoment(), 240);
  }, 500);
});

$btnAdd.addEventListener('click', () => addMoment());
$btnGenerate.addEventListener('click', generate);

document.querySelectorAll('.suggestion-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    addMoment({ description: chip.dataset.desc });
    chip.style.opacity = '0.3';
    chip.style.pointerEvents = 'none';
  });
});

// Subtle parallax on the heroine window based on mouse position (landing only)
document.addEventListener('mousemove', (e) => {
  if (!$landing.classList.contains('active')) return;
  const heroine = document.getElementById('heroine-window');
  if (heroine) {
    const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    heroine.style.transform =
      `rotate(2deg) translate(${mouseX * 8}px, ${mouseY * 8}px)`;
  }
});
