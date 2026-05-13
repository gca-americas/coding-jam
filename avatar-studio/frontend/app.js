/* ============================================================
   🎭 AVATAR STUDIO — Application Logic
   ============================================================ */

const API_BASE = window.location.origin;

// --- State ---
let photoFile = null;
let photoDataUrl = null;
let selectedSubject = null;   // "human" | "pet"
let selectedStyle = null;     // style key
let lastAvatarB64 = null;

// --- Style data (matches backend) ---
const STYLES_DATA = [
    { key: "lego",       name: "LEGO Minifig",        emoji: "🧱", tagline: "Plastic fantastic",    color: "#FFD23F" },
    { key: "pixel-hero", name: "Pixel Hero",           emoji: "👾", tagline: "16-bit legend",        color: "#39FF14" },
    { key: "manga-bw",   name: "日本漫画 B&W Manga",   emoji: "🖤", tagline: "Black ink protagonist", color: "#1A1A1A" },
    { key: "watercolor",  name: "Watercolor Dream",    emoji: "🎨", tagline: "Painted by light",     color: "#7EB8DA" },
    { key: "claymation",  name: "Claymation",          emoji: "🫶", tagline: "Stop-motion star",     color: "#E07A5F" },
    { key: "cyberpunk",   name: "Cyberpunk Neon",      emoji: "⚡", tagline: "Neon-lit rebel",       color: "#FF00E5" },
];

// --- DOM References ---
const screens = {
    upload:  document.getElementById("screen-upload"),
    subject: document.getElementById("screen-subject"),
    styles:  document.getElementById("screen-styles"),
    loading: document.getElementById("screen-loading"),
    reveal:  document.getElementById("screen-reveal"),
};

// Upload
const uploadZone     = document.getElementById("upload-zone");
const photoInput     = document.getElementById("photo-input");
const btnChoose      = document.getElementById("btn-choose");
const photoPreview   = document.getElementById("photo-preview");
const photoImg       = document.getElementById("photo-img");
const btnChangePhoto = document.getElementById("btn-change-photo");
const btnContinue    = document.getElementById("btn-continue-subject");

// Subject
const subjectCards    = document.querySelectorAll(".subject-card");
const btnBackSubject  = document.getElementById("btn-back-subject");

// Styles
const stylesGrid      = document.getElementById("styles-grid");
const photoMiniImg    = document.getElementById("photo-mini-img");
const btnTransform    = document.getElementById("btn-transform");
const btnBackStyles   = document.getElementById("btn-back-styles");

// Loading
const portalPhoto     = document.getElementById("portal-photo");
const loadingMessage  = document.getElementById("loading-message");
const loadingBar      = document.getElementById("loading-bar");

// Reveal
const avatarFrame     = document.getElementById("avatar-frame");
const avatarImg       = document.getElementById("avatar-img");
const badgeEmoji      = document.getElementById("badge-emoji");
const badgeName       = document.getElementById("badge-name");
const btnBackReveal   = document.getElementById("btn-back-reveal");
const btnNewStyle     = document.getElementById("btn-new-style");
const btnDownload     = document.getElementById("btn-download");
const btnGenLore      = document.getElementById("btn-gen-lore");

// Lore
const loreCard        = document.getElementById("lore-card");
const loreName        = document.getElementById("lore-name");
const loreTitle       = document.getElementById("lore-title");
const loreBackstory   = document.getElementById("lore-backstory");
const btnRegenLore    = document.getElementById("btn-regen-lore");

// ============================================================
// SCREEN NAVIGATION
// ============================================================
function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    const target = screens[name];
    target.classList.add("active");
    // Retrigger animation
    target.style.animation = "none";
    target.offsetHeight;
    target.style.animation = "";
}

// ============================================================
// SCREEN 1: UPLOAD
// ============================================================
uploadZone.addEventListener("click", () => photoInput.click());
btnChoose.addEventListener("click", (e) => {
    e.stopPropagation();
    photoInput.click();
});

uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("drag-over");
});
uploadZone.addEventListener("dragleave", () => {
    uploadZone.classList.remove("drag-over");
});
uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("drag-over");
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});

photoInput.addEventListener("change", () => {
    if (photoInput.files.length) handleFile(photoInput.files[0]);
});

function handleFile(file) {
    if (!file.type.startsWith("image/")) return;
    photoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        photoDataUrl = e.target.result;
        photoImg.src = photoDataUrl;
        photoMiniImg.src = photoDataUrl;
        portalPhoto.src = photoDataUrl;
        uploadZone.classList.add("hidden");
        photoPreview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
}

btnChangePhoto.addEventListener("click", () => {
    photoFile = null;
    photoDataUrl = null;
    photoInput.value = "";
    uploadZone.classList.remove("hidden");
    photoPreview.classList.add("hidden");
});

btnContinue.addEventListener("click", () => {
    if (!photoFile) return;
    showScreen("subject");
});

// ============================================================
// SCREEN 2: SUBJECT PICKER
// ============================================================
subjectCards.forEach(card => {
    card.addEventListener("click", () => {
        selectedSubject = card.dataset.subject;
        subjectCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        setTimeout(() => {
            buildStyleCards();
            showScreen("styles");
        }, 350);
    });
});

btnBackSubject.addEventListener("click", () => showScreen("upload"));

// ============================================================
// SCREEN 3: STYLE PICKER
// ============================================================
function buildStyleCards() {
    stylesGrid.innerHTML = "";
    selectedStyle = null;
    btnTransform.classList.add("disabled");
    btnTransform.disabled = true;

    STYLES_DATA.forEach(style => {
        const card = document.createElement("button");
        card.className = "style-card";
        card.dataset.style = style.key;
        card.style.setProperty("--style-color", style.color);
        card.innerHTML = `
            <div class="style-emoji">${style.emoji}</div>
            <div class="style-name">${style.name}</div>
            <div class="style-tagline">${style.tagline}</div>
        `;
        card.addEventListener("click", () => {
            document.querySelectorAll(".style-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            selectedStyle = style.key;
            btnTransform.classList.remove("disabled");
            btnTransform.disabled = false;
        });
        stylesGrid.appendChild(card);
    });
}

btnBackStyles.addEventListener("click", () => {
    selectedSubject = null;
    subjectCards.forEach(c => c.classList.remove("selected"));
    showScreen("subject");
});

btnTransform.addEventListener("click", () => {
    if (!selectedStyle || btnTransform.disabled) return;
    startTransform();
});

// ============================================================
// SCREEN 4: LOADING + API CALL
// ============================================================
const LOADING_MESSAGES = [
    '"mixing the palette…"',
    '"adding the final brushstroke…"',
    '"your alter ego is waking up…"',
    '"almost ready to frame…"',
    '"scanning your essence…"',
    '"rendering in another universe…"',
];

let msgInterval = null;
let progressInterval = null;

async function startTransform() {
    showScreen("loading");

    // Reset loading state
    loadingBar.style.width = "0%";
    let progress = 0;
    let msgIdx = 0;
    loadingMessage.textContent = LOADING_MESSAGES[0];

    // Animate progress
    progressInterval = setInterval(() => {
        if (progress < 85) {
            progress += Math.random() * 3 + 1;
            progress = Math.min(progress, 85);
            loadingBar.style.width = progress + "%";
        }
    }, 300);

    // Rotate messages
    msgInterval = setInterval(() => {
        msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
        loadingMessage.style.opacity = 0;
        setTimeout(() => {
            loadingMessage.textContent = LOADING_MESSAGES[msgIdx];
            loadingMessage.style.opacity = 1;
        }, 300);
    }, 3000);

    try {
        const formData = new FormData();
        formData.append("photo", photoFile);
        formData.append("subject", selectedSubject);
        formData.append("style", selectedStyle);

        const response = await fetch(`${API_BASE}/api/transform`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: "Unknown error" }));
            throw new Error(err.detail || `HTTP ${response.status}`);
        }

        const data = await response.json();

        // Complete progress
        clearInterval(progressInterval);
        loadingBar.style.width = "100%";

        await new Promise(r => setTimeout(r, 500));
        clearInterval(msgInterval);

        showReveal(data);

    } catch (error) {
        clearInterval(progressInterval);
        clearInterval(msgInterval);
        console.error("Transform failed:", error);
        alert(`Transform failed — ${error.message}\n\nTry again?`);
        showScreen("styles");
    }
}

// ============================================================
// SCREEN 5: REVEAL
// ============================================================
function showReveal(data) {
    lastAvatarB64 = data.avatar;

    // Set avatar image
    avatarImg.src = `data:image/png;base64,${data.avatar}`;
    avatarFrame.setAttribute("data-style", data.style_key);

    // Reset animation
    avatarImg.style.animation = "none";
    avatarImg.offsetHeight;
    avatarImg.style.animation = "";

    // Badge
    badgeEmoji.textContent = data.style_emoji;
    badgeName.textContent = data.style_name;

    // Show/hide lore elements
    loreCard.classList.add("hidden");
    btnGenLore.classList.remove("hidden");

    showScreen("reveal");
}

// --- Reveal Actions ---
btnBackReveal.addEventListener("click", () => showScreen("styles"));

btnNewStyle.addEventListener("click", () => {
    selectedStyle = null;
    document.querySelectorAll(".style-card").forEach(c => c.classList.remove("selected"));
    btnTransform.classList.add("disabled");
    btnTransform.disabled = true;
    showScreen("styles");
});

btnDownload.addEventListener("click", () => {
    if (!lastAvatarB64) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${lastAvatarB64}`;
    const styleName = selectedStyle || "avatar";
    link.download = `avatar-studio-${styleName}.png`;
    link.click();
});

// ============================================================
// LORE GENERATION
// ============================================================
btnGenLore.addEventListener("click", () => generateLore());
btnRegenLore.addEventListener("click", () => generateLore());

async function generateLore() {
    btnGenLore.disabled = true;
    btnGenLore.textContent = "✨ Generating…";
    btnRegenLore.disabled = true;

    try {
        const formData = new FormData();
        formData.append("style", selectedStyle);
        formData.append("subject", selectedSubject);

        const response = await fetch(`${API_BASE}/api/lore`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Lore generation failed");
        }

        const lore = await response.json();

        // Populate card
        loreName.textContent = lore.name || "Mystery Character";
        document.getElementById("lore-title").textContent = lore.title || "Unknown Origin";
        loreBackstory.textContent = lore.backstory || "A character shrouded in mystery…";

        // Animate stats
        const stats = lore.stats || { charisma: 70, power: 60, wisdom: 75, cuteness: 85 };
        animateStat("cha", stats.charisma);
        animateStat("pow", stats.power);
        animateStat("wis", stats.wisdom);
        animateStat("cut", stats.cuteness);

        // Show lore card, hide generate button
        btnGenLore.classList.add("hidden");
        loreCard.classList.remove("hidden");
        // Retrigger animation
        loreCard.style.animation = "none";
        loreCard.offsetHeight;
        loreCard.style.animation = "";

    } catch (error) {
        console.error("Lore generation failed:", error);
        alert("Couldn't generate lore — try again?");
    } finally {
        btnGenLore.disabled = false;
        btnGenLore.textContent = "✨ Generate Character Lore";
        btnRegenLore.disabled = false;
    }
}

function animateStat(key, value) {
    const fill = document.getElementById(`stat-${key}`);
    const valEl = document.getElementById(`stat-${key}-val`);
    // Reset then animate
    fill.style.width = "0%";
    valEl.textContent = "0";

    setTimeout(() => {
        fill.style.width = value + "%";
        // Animate number
        let current = 0;
        const step = Math.max(1, Math.floor(value / 30));
        const interval = setInterval(() => {
            current += step;
            if (current >= value) {
                current = value;
                clearInterval(interval);
            }
            valEl.textContent = current;
        }, 30);
    }, 200);
}

// ============================================================
// ✨ ANIMATION LAYERS
// ============================================================
(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    // 1. Sparkles — randomized, low-density
    const sparkleHost = document.getElementById('fx-sparkles');
    if (sparkleHost) {
        for (let i = 0; i < 15; i++) {
            const s = document.createElement('div');
            s.className = 'fx-sparkle';
            s.style.left = Math.random() * 100 + '%';
            s.style.setProperty('--dur', (14 + Math.random() * 10) + 's');
            s.style.setProperty('--delay', -Math.random() * 18 + 's');
            s.style.setProperty('--drift', (Math.random() * 100 - 50) + 'px');
            sparkleHost.appendChild(s);
        }
    }

    // 2. Scroll-reveal (re-triggered on each screen transition)
    function triggerReveals(container) {
        const els = (container || document).querySelectorAll('[data-reveal]');
        els.forEach((el, i) => {
            el.classList.remove('in');
            el.style.transitionDelay = (i * 80) + 'ms';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    el.classList.add('in');
                });
            });
        });
    }

    // Patch showScreen to retrigger reveals
    const _origShowScreen = window.showScreen || showScreen;
    window.showScreen = showScreen = function(name) {
        _origShowScreen(name);
        const target = screens[name];
        if (target) triggerReveals(target);
    };

    // Initial reveal for the active screen
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen) triggerReveals(activeScreen);

    // 3. Magnetic hover (desktop only)
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
        document.querySelectorAll('[data-magnetic]').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });
            el.addEventListener('mouseleave', () => el.style.transform = '');
        });

        // 4. Container parallax (very subtle)
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 8;
            const y = (e.clientY / window.innerHeight - 0.5) * 8;
            document.querySelectorAll('.fx-parallax').forEach(t => {
                t.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    }
})();
