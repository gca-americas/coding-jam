/**
 * Windowsill v2 — Application Logic
 * Memory Jar with mood tracking
 */

const App = (function () {
  'use strict';

  // ── CONFIG ──
  const STORAGE_KEY = 'windowsill_entries';
  const MAX_ENTRIES = 200;

  // ── DOM REFS ──
  let thoughtInput, charCount, btnPlace, btnShake;
  let inlineLoader, loadingText;
  let moodRibbon, moodStats;
  let cardOverlay, cardOverlayBackdrop, cardOverlayContent;
  let errorToast, toastText, toastDismiss;
  let jarEmpty;

  // ── STATE ──
  const state = {
    entries: [],
    isLoading: false,
    loadingInterval: null,
    toastTimeout: null,
  };

  // ── PLACEHOLDERS ──
  const PLACEHOLDERS = [
    'The sky looked different today…',
    'I saw someone who reminded me of…',
    'It rained and I thought…',
    'I made tea and just sat for a moment…',
    'Something small happened today…',
    'I don\'t know why, but I feel…',
  ];

  const LOADING_MESSAGES = [
    'Letting sunlight in…',
    'Finding the right words…',
    'Almost ready…',
  ];

  // ── INIT ──
  function init() {
    // DOM refs
    thoughtInput = document.getElementById('thought-input');
    charCount = document.getElementById('char-count');
    btnPlace = document.getElementById('btn-place');
    btnShake = document.getElementById('btn-shake');
    inlineLoader = document.getElementById('inline-loader');
    loadingText = document.getElementById('loading-text');
    moodRibbon = document.getElementById('mood-ribbon');
    moodStats = document.getElementById('mood-stats');
    cardOverlay = document.getElementById('card-overlay');
    cardOverlayBackdrop = document.getElementById('card-overlay-backdrop');
    cardOverlayContent = document.getElementById('card-overlay-content');
    errorToast = document.getElementById('error-toast');
    toastText = document.getElementById('toast-text');
    toastDismiss = document.getElementById('toast-dismiss');
    jarEmpty = document.getElementById('jar-empty');

    // Init jar module
    Jar.init();

    // Load persisted entries
    state.entries = loadEntries();

    // Render jar
    Jar.render(state.entries);

    // Render mood ribbon & stats
    renderMoodRibbon();
    renderMoodStats();

    // Random placeholder
    thoughtInput.placeholder = PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];

    // Event listeners
    thoughtInput.addEventListener('input', onInput);
    btnPlace.addEventListener('click', onPlace);
    btnShake.addEventListener('click', onShake);
    toastDismiss.addEventListener('click', hideToast);
    cardOverlayBackdrop.addEventListener('click', closeCard);

    // Mood buttons
    document.querySelectorAll('.mood-btn').forEach((btn) => {
      btn.addEventListener('click', () => onMoodTap(btn.dataset.mood));
    });

    // Keyboard: Escape to close overlay
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !cardOverlay.classList.contains('hidden')) {
        closeCard();
      }
    });

    // Focus textarea after entrance animation
    setTimeout(() => thoughtInput.focus(), 1500);
  }

  // ── INPUT HANDLING ──
  function onInput() {
    const len = thoughtInput.value.length;
    charCount.textContent = `${len} / 1000`;
    charCount.classList.toggle('visible', len > 0);
    charCount.classList.remove('warning', 'danger');
    if (len >= 950) charCount.classList.add('danger');
    else if (len >= 800) charCount.classList.add('warning');
    btnPlace.disabled = len < 5;
  }

  // ── PLACE THOUGHT ──
  async function onPlace() {
    if (state.isLoading) return;
    const text = thoughtInput.value.trim();
    if (text.length < 5) return;

    state.isLoading = true;
    btnPlace.disabled = true;
    inlineLoader.classList.remove('hidden');
    startLoadingRotation();

    try {
      const data = await callAPI(text);
      stopLoadingRotation();
      inlineLoader.classList.add('hidden');

      // Build entry
      const entry = {
        id: 'entry_' + Date.now(),
        type: 'thought',
        timestamp: new Date().toISOString(),
        thought: text,
        response: data,
        moodOverride: null,
      };

      // Save
      state.entries.push(entry);
      saveEntries();

      // Add to jar with animation
      Jar.addSlip(entry);
      playChime();

      // Update ribbon
      renderMoodRibbon();
      renderMoodStats();

      // Clear input
      thoughtInput.value = '';
      charCount.textContent = '0 / 1000';
      charCount.classList.remove('visible', 'warning', 'danger');
      btnPlace.disabled = true;

      // New placeholder
      thoughtInput.placeholder = PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];

    } catch (err) {
      stopLoadingRotation();
      inlineLoader.classList.add('hidden');
      showToast(err.message || "The sunlight's being shy. Try again?");
      btnPlace.disabled = false;
    }

    state.isLoading = false;
  }

  // ── MOOD CHECK-IN ──
  async function onMoodTap(mood) {
    // Pulse animation on button
    const btn = document.querySelector(`.mood-btn[data-mood="${mood}"]`);
    if (btn) {
      btn.classList.add('pulse');
      btn.addEventListener('animationend', () => btn.classList.remove('pulse'), { once: true });
    }

    const entry = {
      id: 'mood_' + Date.now(),
      type: 'mood',
      timestamp: new Date().toISOString(),
      mood: mood,
      thought: null,
      response: null,
      moodOverride: null,
    };

    state.entries.push(entry);
    saveEntries();

    Jar.addMoodDot(entry);
    playChime();

    renderMoodRibbon();
    renderMoodStats();
  }

  // ── API CALL ──
  async function callAPI(thought) {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thought }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "The sunlight's being shy. Try again?");
    }

    return response.json();
  }

  // ── CARD OVERLAY ──
  function openCard(entryId) {
    const entry = state.entries.find(e => e.id === entryId);
    if (!entry) return;

    Jar.clearHighlight();

    const mood = entry.moodOverride || entry.response?.mood || entry.mood || 'gentle';
    const colors = Jar.MOOD_COLORS[mood] || Jar.MOOD_COLORS.gentle;
    const moodEmoji = Jar.MOOD_EMOJI[mood] || '🌸';

    const ts = new Date(entry.timestamp);
    const dateStr = ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = ts.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    let html = `<button class="card-close" id="card-close-btn" aria-label="Close">✕</button>`;

    if (entry.type === 'thought' && entry.response) {
      html += `
        <div class="card-emoji">${entry.response.emoji}</div>
        <div class="card-slip-label">"${entry.response.slipLabel}"</div>
        <div class="card-section-label">You wrote</div>
        <div class="card-thought">${escapeHtml(entry.thought)}</div>
        <div class="card-divider">
          <span class="divider-line"></span>
          <span class="divider-sun">☀️</span>
          <span class="divider-line"></span>
        </div>
        ${entry.response.sentences.map(s => `<p class="card-sentence">"${escapeHtml(s)}"</p>`).join('')}
        <div class="card-meta">
          <span class="card-mood-badge" style="background: ${colors.bg}; color: ${colors.accent}">${moodEmoji} ${mood}</span>
          <span>·</span>
          <span>${dateStr} · ${timeStr}</span>
        </div>
      `;
    } else {
      // Mood-only entry
      html += `
        <div class="card-emoji">${moodEmoji}</div>
        <div class="card-slip-label">Mood check-in</div>
        <div class="card-meta" style="border: none; padding: 0; margin-top: 12px;">
          <span class="card-mood-badge" style="background: ${colors.bg}; color: ${colors.accent}">${moodEmoji} ${mood}</span>
          <span>·</span>
          <span>${dateStr} · ${timeStr}</span>
        </div>
      `;
    }

    // Mood override row (for thought entries)
    if (entry.type === 'thought') {
      html += `
        <div class="card-mood-override">
          <span class="card-mood-override-label">Change mood:</span>
          ${['sunny', 'gentle', 'cloudy', 'rainy', 'stormy'].map(m => `
            <button class="mood-btn ${m === mood ? 'active' : ''}"
              data-mood="${m}"
              data-entry-id="${entry.id}"
              aria-label="Change to ${m}"
              style="${m === mood ? `border-color: ${Jar.MOOD_COLORS[m].accent}` : ''}"
              onclick="App.onMoodOverride('${entry.id}', '${m}')"
            >${Jar.MOOD_EMOJI[m]}</button>
          `).join('')}
        </div>
      `;
    }

    cardOverlayContent.innerHTML = html;
    cardOverlay.classList.remove('hidden');

    // Bind close button
    document.getElementById('card-close-btn').addEventListener('click', closeCard);

    // Focus trap
    cardOverlayContent.focus();
  }

  function closeCard() {
    cardOverlay.classList.add('hidden');
    cardOverlayContent.innerHTML = '';
  }

  function onMoodOverride(entryId, newMood) {
    const entry = state.entries.find(e => e.id === entryId);
    if (!entry) return;

    entry.moodOverride = newMood;
    saveEntries();

    // Update jar slip color
    Jar.updateSlipColor(entryId, newMood);

    // Re-render ribbon
    renderMoodRibbon();
    renderMoodStats();

    // Re-open card to reflect change
    openCard(entryId);
  }

  // ── SHAKE ──
  function onShake() {
    if (state.entries.length < 1) {
      showToast('Place a thought first — then shake!');
      return;
    }
    Jar.shake(state.entries);
  }

  // ── MOOD RIBBON ──
  function renderMoodRibbon() {
    if (!moodRibbon) return;
    moodRibbon.innerHTML = '';

    if (state.entries.length === 0) return;

    // Show last 30 days of entries
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recent = state.entries.filter(e =>
      new Date(e.timestamp) >= thirtyDaysAgo
    );

    if (recent.length === 0) return;

    recent.forEach((entry) => {
      const mood = entry.moodOverride || entry.response?.mood || entry.mood || 'gentle';
      const colors = Jar.MOOD_COLORS[mood] || Jar.MOOD_COLORS.gentle;
      const emoji = Jar.MOOD_EMOJI[mood] || '🌸';

      const segment = document.createElement('div');
      segment.className = 'ribbon-segment';
      segment.style.background = colors.accent;
      segment.dataset.entryId = entry.id;

      // Tooltip
      const ts = new Date(entry.timestamp);
      const dateStr = ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const preview = entry.thought
        ? entry.thought.substring(0, 30) + (entry.thought.length > 30 ? '…' : '')
        : 'Mood check-in';

      const tooltip = document.createElement('div');
      tooltip.className = 'ribbon-tooltip';
      tooltip.textContent = `${emoji} ${dateStr} — ${preview}`;
      segment.appendChild(tooltip);

      segment.addEventListener('click', () => openCard(entry.id));
      moodRibbon.appendChild(segment);
    });
  }

  function renderMoodStats() {
    if (!moodStats) return;

    if (state.entries.length === 0) {
      moodStats.innerHTML = '';
      return;
    }

    // Count moods this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const thisWeek = state.entries.filter(e => new Date(e.timestamp) >= weekAgo);
    const counts = { sunny: 0, gentle: 0, cloudy: 0, rainy: 0, stormy: 0 };

    thisWeek.forEach((entry) => {
      const mood = entry.moodOverride || entry.response?.mood || entry.mood || 'gentle';
      if (counts[mood] !== undefined) counts[mood]++;
    });

    const parts = Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([mood, count]) =>
        `<span class="mood-stat">${Jar.MOOD_EMOJI[mood]} <span class="mood-stat-count">${count}</span></span>`
      );

    if (parts.length === 0) {
      moodStats.innerHTML = '<span style="font-style: italic;">No entries this week — whenever you\'re ready</span>';
      return;
    }

    // Find streak
    const total = thisWeek.length;
    moodStats.innerHTML = parts.join('<span class="mood-stat-separator">·</span>') +
      `<span class="mood-stat-separator">·</span><span class="mood-stat">${total} this week</span>`;
  }

  // ── TOAST ──
  function showToast(message) {
    if (state.toastTimeout) clearTimeout(state.toastTimeout);
    toastText.textContent = message;
    errorToast.classList.remove('hidden');
    state.toastTimeout = setTimeout(hideToast, 5000);
  }

  function hideToast() {
    errorToast.classList.add('hidden');
    if (state.toastTimeout) {
      clearTimeout(state.toastTimeout);
      state.toastTimeout = null;
    }
  }

  // ── LOADING ROTATION ──
  function startLoadingRotation() {
    let index = 0;
    loadingText.textContent = LOADING_MESSAGES[0];

    state.loadingInterval = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      loadingText.style.opacity = '0';
      setTimeout(() => {
        loadingText.textContent = LOADING_MESSAGES[index];
        loadingText.style.opacity = '1';
      }, 300);
    }, 2500);
  }

  function stopLoadingRotation() {
    if (state.loadingInterval) {
      clearInterval(state.loadingInterval);
      state.loadingInterval = null;
    }
  }

  // ── STORAGE ──
  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const entries = JSON.parse(raw);
      return Array.isArray(entries) ? entries : [];
    } catch {
      return [];
    }
  }

  function saveEntries() {
    // Prune if too many
    if (state.entries.length > MAX_ENTRIES) {
      state.entries = state.entries.slice(-MAX_ENTRIES);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
    } catch (e) {
      console.warn('localStorage full, pruning entries');
      state.entries = state.entries.slice(-Math.floor(MAX_ENTRIES / 2));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
      } catch {
        // Give up silently
      }
    }
  }

  // ── SOUND ──
  function playChime() {
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Web Audio not available — silent fallback
    }
  }

  // ── UTILITIES ──
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── BOOT ──
  document.addEventListener('DOMContentLoaded', init);

  // ── PUBLIC API (for jar.js callbacks and inline handlers) ──
  return {
    openCard,
    closeCard,
    onMoodOverride,
  };
})();
