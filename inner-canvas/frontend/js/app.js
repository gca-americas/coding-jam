/**
 * Inner Canvas — Main App
 * Orchestrates screens, handles input, drives the ceremony.
 */

(function () {
    // DOM references
    const screenEntry = document.getElementById('screen-entry');
    const screenCeremony = document.getElementById('screen-ceremony');
    const screenReveal = document.getElementById('screen-reveal');
    const screenTimeline = document.getElementById('screen-timeline');
    const greeting = document.getElementById('greeting');
    const journalInput = document.getElementById('journal-input');
    const wordCount = document.getElementById('word-count');
    const submitBtn = document.getElementById('submit-btn');
    const startFreshBtn = document.getElementById('start-fresh-btn');
    const saveBtn = document.getElementById('save-btn');
    const timelineToggle = document.getElementById('timeline-toggle');
    const showTimelineBtn = document.getElementById('show-timeline-btn');
    const closeTimelineBtn = document.getElementById('close-timeline-btn');
    const entriesGrid = document.getElementById('entries-grid');
    const emptyState = document.getElementById('empty-state');

    let currentResult = null;
    let isGenerating = false;

    // ---- Initialize ----
    function init() {
        // Title and subtitle are static in HTML — no dynamic greeting needed
        setupTextArea();
        setupButtons();
        updateTimelineToggle();
    }

    // ---- Text Area ----
    function setupTextArea() {
        journalInput.addEventListener('input', () => {
            autoResize();
            updateWordCount();
            updateSubmitButton();
        });

        journalInput.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!submitBtn.classList.contains('hidden')) {
                    handleSubmit();
                }
            }
        });
    }

    function autoResize() {
        journalInput.style.height = 'auto';
        journalInput.style.height = Math.max(120, journalInput.scrollHeight) + 'px';
    }

    function updateWordCount() {
        const words = journalInput.value.trim().split(/\s+/).filter(w => w.length > 0);
        const count = words.length;
        wordCount.textContent = `${count} word${count !== 1 ? 's' : ''}`;
        wordCount.classList.toggle('visible', count >= 10);
    }

    function updateSubmitButton() {
        const hasEnoughText = journalInput.value.trim().length >= 20;
        submitBtn.classList.toggle('hidden', !hasEnoughText);
    }

    // ---- Buttons ----
    function setupButtons() {
        submitBtn.addEventListener('click', handleSubmit);
        startFreshBtn.addEventListener('click', handleStartFresh);
        saveBtn.addEventListener('click', handleSave);
        if (showTimelineBtn) showTimelineBtn.addEventListener('click', showTimeline);
        if (closeTimelineBtn) closeTimelineBtn.addEventListener('click', hideTimeline);
    }

    // ---- Submit Flow ----
    async function handleSubmit() {
        if (isGenerating) return;
        isGenerating = true;

        const entryText = journalInput.value.trim();
        const timeOfDay = getTimeOfDay();

        // Default orb colors (will be overridden by API response)
        const defaultOrb = ['#94B0D6', '#E8B8A0', '#B8CDE8'];

        try {
            // ACT 1: Dissolve
            switchScreen(screenCeremony);
            await ceremony.actDissolve(journalInput);

            // Start API call in parallel with ACT 2
            const apiPromise = generateFromEntry(entryText, timeOfDay);

            // ACT 2: Breathing Canvas (use default colors, will update)
            await ceremony.actBreathingCanvas(defaultOrb);

            // Wait for API
            const result = await apiPromise;
            currentResult = result;
            currentResult._entryText = entryText;

            // Get ceremony colors from response
            const orbColors = result.ceremony?.orb_colors || defaultOrb;
            const dominantColor = result.ceremony?.dominant_color || '#94B0D6';

            // Update orb colors with actual mood
            document.documentElement.style.setProperty('--orb-color-1', orbColors[0]);
            document.documentElement.style.setProperty('--orb-color-2', orbColors[1]);
            document.documentElement.style.setProperty('--orb-color-3', orbColors[2] || orbColors[0]);
            particleSystem.setColors(orbColors);

            // ACT 3: Anticipation
            await ceremony.actAnticipation(orbColors);

            // Switch to reveal screen
            switchScreen(screenReveal);
            await wait(200);

            // ACT 4: Reveal
            await ceremony.actReveal(
                result.artwork.image_base64,
                result.artwork.alt_text,
                result.reflection.question,
                dominantColor
            );

        } catch (error) {
            console.error('Generation failed:', error);
            ceremony.reset();
            switchScreen(screenEntry);
            showError(error.message || 'Something went quiet. Let\'s try again.');
        } finally {
            isGenerating = false;
        }
    }

    // ---- Start Fresh ----
    function handleStartFresh() {
        ceremony.reset();
        switchScreen(screenEntry);

        // Reset entry
        journalInput.value = '';
        journalInput.style.height = '120px';
        wordCount.classList.remove('visible');
        submitBtn.classList.add('hidden');
        journalInput.focus();
        updateTimelineToggle();
    }

    // ---- Save (Phase 2) ----
    function handleSave() {
        if (!currentResult) return;

        storage.saveEntry({
            text: currentResult._entryText,
            mood: currentResult.mood,
            artwork: currentResult.artwork.image_base64,
            reflection: currentResult.reflection.question,
        });

        // Visual feedback
        saveBtn.textContent = '🐾 Saved';
        saveBtn.style.color = 'var(--apple-red)';
        saveBtn.disabled = true;
        updateTimelineToggle();
    }

    // ---- Timeline ----
    function updateTimelineToggle() {
        if (storage.hasEntries()) {
            timelineToggle.classList.remove('hidden');
        } else {
            timelineToggle.classList.add('hidden');
        }
    }

    function showTimeline() {
        renderTimeline();
        switchScreen(screenTimeline);
    }

    function hideTimeline() {
        switchScreen(screenEntry);
    }

    function renderTimeline() {
        const entries = storage.getEntries();
        entriesGrid.innerHTML = '';

        if (entries.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        entries.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'entry-card';
            card.innerHTML = `
                ${entry.artwork ? `<img class="entry-card-image" src="data:image/png;base64,${entry.artwork}" alt="Mood art" />` : ''}
                <div class="entry-card-body">
                    <div class="entry-card-date">${formatDate(entry.date)}</div>
                    <p class="entry-card-preview">${escapeHtml(entry.text)}</p>
                    ${entry.mood ? `
                        <div class="entry-card-mood">
                            <span class="mood-dot" style="background: ${entry.mood.color_palette?.[0] || 'var(--accent-lavender)'}"></span>
                            ${entry.mood.primary || ''}
                        </div>
                    ` : ''}
                </div>
            `;
            entriesGrid.appendChild(card);
        });
    }

    // ---- Screen Management ----
    function switchScreen(target) {
        [screenEntry, screenCeremony, screenReveal, screenTimeline].forEach(s => {
            s.classList.remove('active');
        });
        target.classList.add('active');
    }

    // ---- Error Display ----
    function showError(message) {
        const errorEl = document.createElement('div');
        errorEl.style.cssText = `
            position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
            padding: 1rem 2rem; background: var(--cloud-white);
            border: none; border-radius: 9999px;
            color: var(--apple-red); font-family: 'Nunito', sans-serif;
            font-size: 0.9375rem; font-weight: 500; z-index: 100;
            box-shadow: 0 4px 12px rgba(148,176,214,0.2), 0 12px 32px rgba(148,176,214,0.15);
            animation: fadeInUp 0.5s cubic-bezier(0.34,1.56,0.64,1);
        `;
        errorEl.textContent = message;
        document.body.appendChild(errorEl);
        setTimeout(() => {
            errorEl.style.opacity = '0';
            errorEl.style.transition = 'opacity 0.5s';
            setTimeout(() => errorEl.remove(), 500);
        }, 4000);
    }

    // ---- Utilities ----
    function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

    function formatDate(isoString) {
        const d = new Date(isoString);
        return d.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
        });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Boot
    init();
})();
