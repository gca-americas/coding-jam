/**
 * BulletProof — App Logic
 * Handles state management, API calls, particles, and UI interactions.
 */

const API_BASE = "http://localhost:8000";

// ============================================
// DOM References
// ============================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const resumeInput = $("#resume-input");
const jobInput = $("#job-input");
const resumeCount = $("#resume-count");
const jobCount = $("#job-count");
const sharpenBtn = $("#sharpen-btn");
const copyAllBtn = $("#copy-all-btn");
const tryAnotherBtn = $("#try-another-btn");
const errorRetryBtn = $("#error-retry-btn");
const scoreFill = $("#score-fill");
const scoreValue = $("#score-value");
const keywordBadges = $("#keyword-badges");
const bulletCards = $("#bullet-cards");
const keywordsFound = $("#keywords-found");
const keywordsMissing = $("#keywords-missing");
const toast = $("#toast");
const errorMessage = $("#error-message");

// ============================================
// State Management
// ============================================
let currentData = null;

function showState(stateId) {
    $$(".state").forEach((s) => s.classList.remove("active"));
    $(`#${stateId}`).classList.add("active");
}

// ============================================
// Character Count
// ============================================
function updateCharCount(textarea, countEl) {
    const len = textarea.value.length;
    if (len > 0) {
        countEl.textContent = `${len.toLocaleString()} chars`;
        countEl.classList.add("visible");
    } else {
        countEl.classList.remove("visible");
    }
}

resumeInput.addEventListener("input", () => {
    updateCharCount(resumeInput, resumeCount);
    updateBtnState();
});

jobInput.addEventListener("input", () => {
    updateCharCount(jobInput, jobCount);
    updateBtnState();
});

function updateBtnState() {
    const ready =
        resumeInput.value.trim().length > 20 &&
        jobInput.value.trim().length > 20;
    sharpenBtn.disabled = !ready;
}

// ============================================
// Loading Animation
// ============================================
function runLoadingSteps() {
    const steps = [$("#step-1"), $("#step-2"), $("#step-3")];

    // Reset all steps
    steps.forEach((step) => {
        step.classList.remove("visible", "complete", "active");
        step.querySelector(".step-icon").textContent = "◌";
    });

    // Step 1
    setTimeout(() => {
        steps[0].classList.add("visible", "active");
    }, 100);

    // Step 1 complete, Step 2 start
    setTimeout(() => {
        steps[0].classList.remove("active");
        steps[0].classList.add("complete");
        steps[0].querySelector(".step-icon").textContent = "✓";
        steps[1].classList.add("visible", "active");
    }, 1200);

    // Step 2 complete, Step 3 start
    setTimeout(() => {
        steps[1].classList.remove("active");
        steps[1].classList.add("complete");
        steps[1].querySelector(".step-icon").textContent = "✓";
        steps[2].classList.add("visible", "active");
    }, 2400);
}

// ============================================
// API Call
// ============================================
async function tailorResume() {
    showState("loading-state");
    runLoadingSteps();

    try {
        const response = await fetch(`${API_BASE}/api/tailor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                resume: resumeInput.value,
                job_posting: jobInput.value,
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Server error");
        }

        currentData = await response.json();
        renderResults(currentData);
        showState("results-state");
    } catch (err) {
        errorMessage.textContent = err.message || "Could not connect to server";
        showState("error-state");
    }
}

// ============================================
// Render Results
// ============================================
function renderResults(data) {
    // Score Ring
    const score = data.match_score;
    const circumference = 2 * Math.PI * 60; // r=60
    const offset = circumference - (score / 100) * circumference;

    // Set color based on score
    let strokeColor = "var(--success)";
    if (score < 40) strokeColor = "var(--danger)";
    else if (score < 70) strokeColor = "var(--warning)";

    scoreFill.style.stroke = strokeColor;

    // Animate the ring
    requestAnimationFrame(() => {
        scoreFill.style.strokeDashoffset = offset;
    });

    // Animate score counter
    animateCounter(scoreValue, 0, score, 1200);

    // Keyword Badges
    keywordBadges.innerHTML = data.keywords_found
        .slice(0, 8)
        .map(
            (kw, i) =>
                `<span class="keyword-badge" style="animation-delay: ${i * 80}ms">${kw}</span>`
        )
        .join("");

    // Bullet Cards
    bulletCards.innerHTML = data.tailored_bullets
        .map((bullet, i) => {
            const tailoredHTML = highlightKeywords(
                bullet.tailored,
                bullet.keywords_matched
            );
            const tags = bullet.keywords_matched
                .map((kw) => `<span class="bullet-tag">${kw}</span>`)
                .join("");

            return `
            <div class="bullet-card" style="animation-delay: ${i * 150}ms">
                <button class="bullet-copy-btn" onclick="copyBullet(this, ${i})" title="Copy tailored bullet">
                    📋
                </button>
                <div class="bullet-original-label">Original</div>
                <div class="bullet-original-text">${escapeHTML(bullet.original)}</div>
                <div class="bullet-divider">
                    <span class="bullet-divider-icon">✨</span>
                </div>
                <div class="bullet-tailored-label">Sharpened</div>
                <div class="bullet-tailored-text">${tailoredHTML}</div>
                <div class="bullet-tags">${tags}</div>
            </div>
        `;
        })
        .join("");

    // Keyword Sidebar
    keywordsFound.innerHTML = data.keywords_found
        .map(
            (kw) =>
                `<div class="keyword-item keyword-item--found"><span>✅</span> ${escapeHTML(kw)}</div>`
        )
        .join("");

    keywordsMissing.innerHTML = data.keywords_missing
        .map(
            (kw) =>
                `<div class="keyword-item keyword-item--missing"><span>❌</span> ${escapeHTML(kw)}</div>`
        )
        .join("");
}

// ============================================
// Utility Functions
// ============================================
function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function highlightKeywords(text, keywords) {
    let html = escapeHTML(text);
    keywords.forEach((kw) => {
        const regex = new RegExp(`(${escapeRegex(kw)})`, "gi");
        html = html.replace(regex, "<mark>$1</mark>");
    });
    return html;
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function animateCounter(el, from, to, duration) {
    const start = performance.now();
    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(from + (to - from) * eased);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// ============================================
// Copy Functions
// ============================================
function showToast() {
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 2000);
}

function copyBullet(btn, index) {
    if (!currentData) return;
    const text = currentData.tailored_bullets[index].tailored;
    navigator.clipboard.writeText(text).then(() => {
        btn.textContent = "✓";
        btn.classList.add("copied");
        showToast();
        setTimeout(() => {
            btn.textContent = "📋";
            btn.classList.remove("copied");
        }, 2000);
    });
}

copyAllBtn.addEventListener("click", () => {
    if (!currentData) return;
    const allBullets = currentData.tailored_bullets
        .map((b) => `• ${b.tailored}`)
        .join("\n\n");
    navigator.clipboard.writeText(allBullets).then(() => {
        showToast();
    });
});

// ============================================
// Navigation
// ============================================
sharpenBtn.addEventListener("click", tailorResume);

tryAnotherBtn.addEventListener("click", () => {
    showState("input-state");
});

errorRetryBtn.addEventListener("click", () => {
    showState("input-state");
});

// ============================================
// Init
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    updateBtnState();
});
