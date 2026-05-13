/* ============================================================
   ✦ GLOW UP — Y2K Dreamcore Application Logic
   ============================================================ */

const API_BASE = window.location.origin;

// --- State ---
let selfieFile = null;
let selfieDataUrl = null;
let selectedGender = null;
let selectedStyle = null;
let presetsData = {};

// --- DOM References ---
const screens = {
    upload:   document.getElementById('screen-upload'),
    gender:   document.getElementById('screen-gender'),
    presets:  document.getElementById('screen-presets'),
    loading:  document.getElementById('screen-loading'),
    reveal:   document.getElementById('screen-reveal'),
};

// Upload
const uploadZone     = document.getElementById('upload-zone');
const selfieInput    = document.getElementById('selfie-input');
const btnChoose      = document.getElementById('btn-choose');
const selfiePreview  = document.getElementById('selfie-preview');
const selfieImg      = document.getElementById('selfie-img');
const btnChangePhoto = document.getElementById('btn-change-photo');
const btnContinue    = document.getElementById('btn-continue-gender');

// Gender
const genderCards    = document.querySelectorAll('.gender-card');
const btnBackGender  = document.getElementById('btn-back-gender');

// Presets
const presetsGrid    = document.getElementById('presets-grid');
const selfieMiniImg  = document.getElementById('selfie-mini-img');
const btnGlowUp      = document.getElementById('btn-glow-up');
const btnBackPresets  = document.getElementById('btn-back-presets');

// Loading
const loadingQuote   = document.getElementById('loading-quote');
const progressFill   = document.getElementById('progress-fill');
const downloadLabel  = document.getElementById('download-label');

// Reveal
const imgBefore      = document.getElementById('img-before');
const imgAfter       = document.getElementById('img-after');
const stylistNote    = document.getElementById('stylist-note');
const compOverlay    = document.getElementById('comparison-overlay');
const compSlider     = document.getElementById('comparison-slider');
const compContainer  = document.getElementById('comparison-container');
const btnTryAnother  = document.getElementById('btn-try-another');
const btnNewLook     = document.getElementById('btn-new-look');
const btnSave        = document.getElementById('btn-save');

// ============================================================
// ✦ SPARKLE PARTICLE SYSTEM (Y2K dreamcore shimmer)
// ============================================================
function createSparkles() {
    const field = document.getElementById('sparkle-field');
    const colors = ['#FFB6E1', '#C8B6FF', '#B8D4FF', '#B8F2E6', '#FFD6BA', '#FF3DC7', '#fff'];
    for (let i = 0; i < 30; i++) {
        const dot = document.createElement('div');
        dot.className = 'sparkle-dot';
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 3 + Math.random() * 5;
        dot.style.left = Math.random() * 100 + '%';
        dot.style.top  = Math.random() * 100 + '%';
        dot.style.width  = size + 'px';
        dot.style.height = size + 'px';
        dot.style.background = color;
        dot.style.boxShadow = `0 0 ${size * 2}px ${color}`;
        dot.style.animationDelay = Math.random() * 5 + 's';
        dot.style.animationDuration = (4 + Math.random() * 4) + 's';
        field.appendChild(dot);
    }
}
createSparkles();

// ============================================================
// SCREEN NAVIGATION
// ============================================================
function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    const target = screens[name];
    target.classList.add('active');
    target.style.animation = 'none';
    target.offsetHeight; // reflow
    target.style.animation = '';
}

// ============================================================
// SCREEN 1: UPLOAD
// ============================================================
uploadZone.addEventListener('click', () => selfieInput.click());
btnChoose.addEventListener('click', (e) => {
    e.stopPropagation();
    selfieInput.click();
});

// Drag & drop
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
});
uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
});
uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

selfieInput.addEventListener('change', () => {
    if (selfieInput.files.length) {
        handleFile(selfieInput.files[0]);
    }
});

function handleFile(file) {
    if (!file.type.startsWith('image/')) return;
    selfieFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        selfieDataUrl = e.target.result;
        selfieImg.src = selfieDataUrl;
        selfieMiniImg.src = selfieDataUrl;
        uploadZone.classList.add('hidden');
        selfiePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

btnChangePhoto.addEventListener('click', () => {
    selfieFile = null;
    selfieDataUrl = null;
    selfieInput.value = '';
    uploadZone.classList.remove('hidden');
    selfiePreview.classList.add('hidden');
});

btnContinue.addEventListener('click', () => {
    if (!selfieFile) return;
    showScreen('gender');
});

// ============================================================
// SCREEN 2: GENDER PICKER
// ============================================================
genderCards.forEach(card => {
    card.addEventListener('click', () => {
        selectedGender = card.dataset.gender;
        genderCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        setTimeout(() => {
            buildPresetCards();
            showScreen('presets');
        }, 400);
    });
});

btnBackGender.addEventListener('click', () => showScreen('upload'));

// ============================================================
// SCREEN 3: PRESET PICKER
// ============================================================
presetsData = {
    femme: [
        { key: 'curtain-bangs', name: 'Curtain Bangs', emoji: '🌊' },
        { key: 'chic-pixie',    name: 'Chic Pixie',    emoji: '✂️' },
        { key: 'soft-waves',    name: 'Soft Waves',    emoji: '🌀' },
        { key: 'sleek-bob',     name: 'Sleek Bob',     emoji: '🎀' },
    ],
    masc: [
        { key: 'textured-crop', name: 'Textured Crop', emoji: '🌿' },
        { key: 'buzz-fade',     name: 'Buzz Fade',     emoji: '💈' },
        { key: 'slick-back',    name: 'Slick Back',    emoji: '🖤' },
        { key: 'curtain-flow',  name: 'Curtain Flow',  emoji: '🌊' },
    ],
};

function buildPresetCards() {
    presetsGrid.innerHTML = '';
    selectedStyle = null;
    btnGlowUp.classList.add('disabled');
    btnGlowUp.disabled = true;

    const items = presetsData[selectedGender] || [];
    items.forEach(preset => {
        const card = document.createElement('button');
        card.className = 'preset-card';
        card.dataset.style = preset.key;
        card.innerHTML = `
            <div class="preset-emoji">${preset.emoji}</div>
            <div class="preset-name">${preset.name}</div>
        `;
        card.addEventListener('click', () => {
            document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedStyle = preset.key;
            btnGlowUp.classList.remove('disabled');
            btnGlowUp.disabled = false;
        });
        presetsGrid.appendChild(card);
    });
}

btnBackPresets.addEventListener('click', () => {
    selectedGender = null;
    genderCards.forEach(c => c.classList.remove('selected'));
    showScreen('gender');
});

btnGlowUp.addEventListener('click', () => {
    if (!selectedStyle || btnGlowUp.disabled) return;
    startGlowUp();
});

// ============================================================
// SCREEN 4: LOADING + API CALL (Y2K Download Bar Pattern)
// ============================================================
const LOADING_QUOTES = [
    '"great hair doesn\'t happen by chance…" ✦',
    '"consulting the style gods…" ⭒',
    '"mixing the perfect shade of fabulous…" ✧',
    '"almost ready to serve looks…" ♪',
    '"channeling main character energy…" ✦',
];

let quoteInterval = null;
let progressInterval = null;

async function startGlowUp() {
    showScreen('loading');

    // Reset
    progressFill.style.width = '0%';
    downloadLabel.textContent = 'DOWNLOADING YOUR NEW LOOK… 0%';
    let progress = 0;
    let quoteIdx = 0;
    loadingQuote.textContent = LOADING_QUOTES[0];

    // Animate progress bar with download label update
    progressInterval = setInterval(() => {
        if (progress < 85) {
            progress += Math.random() * 3 + 1;
            progress = Math.min(progress, 85);
            progressFill.style.width = progress + '%';
            downloadLabel.textContent = `DOWNLOADING YOUR NEW LOOK… ${Math.round(progress)}%`;
        }
    }, 300);

    // Rotate quotes
    quoteInterval = setInterval(() => {
        quoteIdx = (quoteIdx + 1) % LOADING_QUOTES.length;
        loadingQuote.style.opacity = 0;
        setTimeout(() => {
            loadingQuote.textContent = LOADING_QUOTES[quoteIdx];
            loadingQuote.style.opacity = 1;
        }, 300);
    }, 3000);

    try {
        const formData = new FormData();
        formData.append('selfie', selfieFile);
        formData.append('gender', selectedGender);
        formData.append('style', selectedStyle);

        const response = await fetch(`${API_BASE}/api/glow-up`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(err.detail || `HTTP ${response.status}`);
        }

        const data = await response.json();

        // Complete progress
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        downloadLabel.textContent = '♪ READY ♪';

        await new Promise(r => setTimeout(r, 600));
        clearInterval(quoteInterval);

        showReveal(data);

    } catch (error) {
        clearInterval(progressInterval);
        clearInterval(quoteInterval);
        console.error('Glow Up failed:', error);
        alert(`!! SYSTEM HICCUP — ${error.message}\n\ntry again ?`);
        showScreen('presets');
    }
}

// ============================================================
// SCREEN 5: REVEAL
// ============================================================
function showReveal(data) {
    imgAfter.src = `data:image/png;base64,${data.image}`;
    stylistNote.textContent = data.stylist_note || `${data.style_emoji} looking fabulous with that ${data.style_name} ✦`;

    showScreen('reveal');
}

// --- Reveal Actions ---
btnTryAnother.addEventListener('click', () => {
    showScreen('presets');
});

btnNewLook.addEventListener('click', () => {
    selectedStyle = null;
    document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('selected'));
    btnGlowUp.classList.add('disabled');
    btnGlowUp.disabled = true;
    showScreen('presets');
});

btnSave.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = imgAfter.src;
    link.download = `glow-up-${selectedGender}-${selectedStyle}.png`;
    link.click();
});
