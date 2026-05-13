/**
 * Windowsill v2 — Jar Module
 * Handles jar rendering, slip management, animations, and shake.
 */

const Jar = (function () {
  'use strict';

  const MAX_VISIBLE_SLIPS = 4;
  const STRATA_THRESHOLD = 15;

  const MOOD_COLORS = {
    sunny:  { accent: '#F5C842', bg: '#FFF3D4' },
    gentle: { accent: '#E8A0B0', bg: '#FFF0F3' },
    cloudy: { accent: '#9BB5C9', bg: '#EDF2F7' },
    rainy:  { accent: '#7B98B0', bg: '#E4ECF1' },
    stormy: { accent: '#8B7BA8', bg: '#EDE8F4' },
  };

  const MOOD_EMOJI = {
    sunny: '☀️', gentle: '🌸', cloudy: '☁️', rainy: '🌧️', stormy: '⛈️',
  };

  // DOM refs (set on init)
  let jarContents, jarStrata, jarEmpty, jarContainer;

  function init() {
    jarContents = document.getElementById('jar-contents');
    jarStrata = document.getElementById('jar-strata');
    jarEmpty = document.getElementById('jar-empty');
    jarContainer = document.getElementById('jar-container');
  }

  // ── RENDER FULL JAR ──
  function render(entries) {
    if (!jarContents) init();

    jarContents.innerHTML = '';
    jarStrata.innerHTML = '';

    if (entries.length === 0) {
      jarEmpty.classList.remove('hidden');
      return;
    }

    jarEmpty.classList.add('hidden');

    // Split entries: recent (visible slips) vs old (strata)
    const sorted = [...entries].sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    const recentEntries = sorted.slice(0, MAX_VISIBLE_SLIPS);
    const oldEntries = sorted.slice(MAX_VISIBLE_SLIPS);

    // Render visible items (newest first at top, oldest at bottom)
    recentEntries.forEach((entry) => {
      const el = _createItemElement(entry);
      jarContents.appendChild(el);
    });

    // Render strata for old entries
    if (oldEntries.length > 0) {
      _renderStrata(oldEntries);
    }
  }

  // ── CREATE ITEM ELEMENT ──
  function _createItemElement(entry) {
    if (entry.type === 'mood') {
      return _createDotElement(entry);
    }
    return _createSlipElement(entry);
  }

  function _createSlipElement(entry) {
    const mood = entry.moodOverride || entry.response?.mood || 'gentle';
    const colors = MOOD_COLORS[mood] || MOOD_COLORS.gentle;
    const rotation = _getSlipRotation();
    const offset = _getSlipOffset();

    const slip = document.createElement('div');
    slip.className = 'slip';
    slip.dataset.entryId = entry.id;
    slip.style.setProperty('--slip-accent', colors.accent);
    slip.style.setProperty('--slip-bg', colors.bg);
    slip.style.setProperty('--slip-rotation', rotation + 'deg');
    slip.style.transform = `rotate(${rotation}deg)`;
    slip.style.marginLeft = offset + 'px';
    slip.setAttribute('role', 'button');
    slip.setAttribute('tabindex', '0');
    slip.setAttribute('aria-label', entry.response?.slipLabel || 'Memory');

    const emoji = document.createElement('span');
    emoji.className = 'slip-emoji';
    emoji.textContent = entry.response?.emoji || MOOD_EMOJI[mood];

    const label = document.createElement('span');
    label.className = 'slip-label';
    label.textContent = entry.response?.slipLabel || 'A thought';

    slip.appendChild(emoji);
    slip.appendChild(label);

    slip.addEventListener('click', () => {
      if (typeof App !== 'undefined' && App.openCard) {
        App.openCard(entry.id);
      }
    });

    slip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        slip.click();
      }
    });

    return slip;
  }

  function _createDotElement(entry) {
    const mood = entry.mood || 'gentle';
    const colors = MOOD_COLORS[mood] || MOOD_COLORS.gentle;

    const chip = document.createElement('div');
    chip.className = 'mood-chip';
    chip.dataset.entryId = entry.id;
    chip.style.background = colors.bg;
    chip.style.borderColor = colors.accent;
    chip.style.color = colors.accent;
    chip.setAttribute('role', 'button');
    chip.setAttribute('tabindex', '0');
    chip.setAttribute('aria-label', `${mood} mood check-in`);

    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'mood-chip-emoji';
    emojiSpan.textContent = MOOD_EMOJI[mood];

    const labelSpan = document.createElement('span');
    labelSpan.className = 'mood-chip-label';
    labelSpan.textContent = mood;

    chip.appendChild(emojiSpan);
    chip.appendChild(labelSpan);

    chip.addEventListener('click', () => {
      if (typeof App !== 'undefined' && App.openCard) {
        App.openCard(entry.id);
      }
    });

    return chip;
  }

  // ── ENFORCE MAX VISIBLE ──
  function _enforceMaxVisible() {
    while (jarContents.children.length >= MAX_VISIBLE_SLIPS) {
      // Remove the oldest visible item (last child = oldest, at the bottom)
      const oldest = jarContents.lastElementChild;
      if (oldest) {
        oldest.remove();
      } else {
        break;
      }
    }
  }

  // ── ADD SLIP WITH ANIMATION ──
  function addSlip(entry) {
    if (!jarContents) init();

    jarEmpty.classList.add('hidden');
    _enforceMaxVisible();

    const el = _createSlipElement(entry);
    el.classList.add('dropping');
    jarContents.prepend(el);

    el.addEventListener('animationend', () => {
      el.classList.remove('dropping');
    }, { once: true });
  }

  // ── ADD MOOD CHIP WITH ANIMATION ──
  function addMoodDot(entry) {
    if (!jarContents) init();

    jarEmpty.classList.add('hidden');
    _enforceMaxVisible();

    const chip = _createDotElement(entry);
    chip.classList.add('dropping');
    jarContents.prepend(chip);

    chip.addEventListener('animationend', () => {
      chip.classList.remove('dropping');
    }, { once: true });
  }

  // ── SHAKE ──
  function shake(entries) {
    if (!jarContainer) init();
    if (entries.length < 1) return null;

    // Shake the jar
    jarContainer.classList.add('shaking');
    jarContainer.addEventListener('animationend', () => {
      jarContainer.classList.remove('shaking');
    }, { once: true });

    // Briefly scatter slips
    const slips = jarContents.querySelectorAll('.slip, .mood-chip');
    slips.forEach((s) => {
      const rx = (Math.random() - 0.5) * 16;
      const ry = (Math.random() - 0.5) * 10;
      s.style.transition = 'transform 0.3s ease-out';
      s.style.transform = `translate(${rx}px, ${ry}px) rotate(${(Math.random() - 0.5) * 12}deg)`;
    });

    // Settle and highlight one
    setTimeout(() => {
      slips.forEach((s) => {
        const rot = _getSlipRotation();
        s.style.transition = 'transform 0.4s ease-out';
        s.style.transform = `rotate(${rot}deg)`;
      });

      // Pick a random thought entry (not mood-only)
      const thoughtEntries = entries.filter(e => e.type === 'thought');
      if (thoughtEntries.length === 0) return;

      const randomEntry = thoughtEntries[Math.floor(Math.random() * thoughtEntries.length)];
      highlightSlip(randomEntry.id);
    }, 400);

    return null;
  }

  // ── HIGHLIGHT / CLEAR ──
  function highlightSlip(entryId) {
    clearHighlight();
    const el = jarContents.querySelector(`[data-entry-id="${entryId}"]`);
    if (el) {
      el.classList.add('highlighted');
    }
  }

  function clearHighlight() {
    const prev = jarContents.querySelector('.highlighted');
    if (prev) prev.classList.remove('highlighted');
  }

  // ── UPDATE SLIP COLOR (mood override) ──
  function updateSlipColor(entryId, newMood) {
    const el = jarContents.querySelector(`[data-entry-id="${entryId}"]`);
    if (!el) return;

    const colors = MOOD_COLORS[newMood] || MOOD_COLORS.gentle;
    el.style.setProperty('--slip-accent', colors.accent);
    el.style.setProperty('--slip-bg', colors.bg);
  }

  // ── STRATA ──
  function _renderStrata(oldEntries) {
    // Group by mood, create color bands proportional to count
    const moodCounts = {};
    oldEntries.forEach((e) => {
      const mood = e.moodOverride || e.response?.mood || e.mood || 'gentle';
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });

    const total = oldEntries.length;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      const band = document.createElement('div');
      band.className = 'strata-band';
      const colors = MOOD_COLORS[mood] || MOOD_COLORS.gentle;
      band.style.background = colors.accent;
      band.style.height = Math.max(4, (count / total) * 60) + 'px';
      jarStrata.appendChild(band);
    });
  }

  // ── UTILITIES ──
  function _getSlipRotation() {
    return (Math.random() - 0.5) * 8; // -4° to +4°
  }

  function _getSlipOffset() {
    return (Math.random() - 0.5) * 12; // -6px to +6px
  }

  return {
    init,
    render,
    addSlip,
    addMoodDot,
    shake,
    highlightSlip,
    clearHighlight,
    updateSlipColor,
    MOOD_COLORS,
    MOOD_EMOJI,
  };
})();
