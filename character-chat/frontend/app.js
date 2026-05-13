/* ============================================================
   CHARACTER CHAT — Frontend Application Logic
   Anime-Inspired Edition
   ============================================================ */

const API_BASE = window.location.origin;
const MAX_MESSAGES = 5;

// --- State ---
const state = {
    screen: 'create', // 'create' | 'chat'
    character: { name: '', personality: '', neverSay: '' },
    messages: [],      // { role: 'user' | 'assistant', content: string }
    userMessageCount: 0,
    isLoading: false,
};

// --- DOM References ---
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
    // Screens
    screenCreate: $('#screen-create'),
    screenChat: $('#screen-chat'),

    // Create form
    form: $('#character-form'),
    nameInput: $('#char-name'),
    personalityInput: $('#char-personality'),
    neverSayInput: $('#char-neversay'),
    nameCount: $('#name-count'),
    personalityCount: $('#personality-count'),
    neverSayCount: $('#neversay-count'),
    createBtn: $('#create-btn'),

    // Chat
    charName: $('#chat-char-name'),
    messagesArea: $('#chat-messages'),
    chatForm: $('#chat-form'),
    chatInput: $('#chat-input'),
    sendBtn: $('#send-btn'),
    inputArea: $('#chat-input-area'),
    progress: $('#message-progress'),
    startOverBtn: $('#start-over-btn'),

    // Complete
    chatComplete: $('#chat-complete'),
    newCharBtn: $('#new-character-btn'),

    // Canvases
    confettiCanvas: $('#confetti-canvas'),
    sakuraCanvas: $('#sakura-canvas'),
};

// ============================================================
// INITIALIZATION
// ============================================================

function init() {
    setupCharCounters();
    setupFormValidation();
    setupFormSubmit();
    setupChatSubmit();
    setupStartOver();
    renderProgressDots();
    initSakuraPetals();
}

// ============================================================
// SAKURA PETAL PARTICLE SYSTEM
// ============================================================

function initSakuraPetals() {
    const canvas = dom.sakuraCanvas;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Petal colors — soft pinks and whites matching the anime palette
    const petalColors = [
        'rgba(232, 140, 165, 0.6)',
        'rgba(242, 181, 198, 0.5)',
        'rgba(252, 228, 236, 0.5)',
        'rgba(255, 255, 255, 0.4)',
        'rgba(163, 197, 232, 0.4)',
    ];

    const petals = [];
    const PETAL_COUNT = 25;

    for (let i = 0; i < PETAL_COUNT; i++) {
        petals.push(createPetal(canvas));
    }

    function createPetal(canvas) {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height * 0.2,
            size: Math.random() * 8 + 4,
            speedX: (Math.random() - 0.3) * 0.8,
            speedY: Math.random() * 0.6 + 0.3,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2,
            color: petalColors[Math.floor(Math.random() * petalColors.length)],
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.02 + 0.01,
            opacity: Math.random() * 0.5 + 0.3,
        };
    }

    function drawPetal(ctx, petal) {
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate((petal.rotation * Math.PI) / 180);
        ctx.globalAlpha = petal.opacity;
        ctx.fillStyle = petal.color;

        // Draw a petal shape
        ctx.beginPath();
        const s = petal.size;
        ctx.moveTo(0, -s);
        ctx.bezierCurveTo(s * 0.8, -s * 0.6, s * 0.6, s * 0.3, 0, s * 0.5);
        ctx.bezierCurveTo(-s * 0.6, s * 0.3, -s * 0.8, -s * 0.6, 0, -s);
        ctx.fill();

        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        petals.forEach((petal) => {
            // Update
            petal.wobble += petal.wobbleSpeed;
            petal.x += petal.speedX + Math.sin(petal.wobble) * 0.5;
            petal.y += petal.speedY;
            petal.rotation += petal.rotationSpeed;

            // Wrap around
            if (petal.y > canvas.height + 20) {
                petal.y = -20;
                petal.x = Math.random() * canvas.width;
            }
            if (petal.x > canvas.width + 20) {
                petal.x = -20;
            }
            if (petal.x < -20) {
                petal.x = canvas.width + 20;
            }

            // Draw
            drawPetal(ctx, petal);
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// ============================================================
// CHARACTER CREATION
// ============================================================

function setupCharCounters() {
    const fields = [
        { input: dom.nameInput, counter: dom.nameCount, max: 50 },
        { input: dom.personalityInput, counter: dom.personalityCount, max: 500 },
        { input: dom.neverSayInput, counter: dom.neverSayCount, max: 200 },
    ];

    fields.forEach(({ input, counter, max }) => {
        input.addEventListener('input', () => {
            const len = input.value.length;
            counter.textContent = `${len} / ${max}`;

            // Color thresholds
            counter.classList.remove('warning', 'danger');
            if (len >= max * 0.9) {
                counter.classList.add('danger');
            } else if (len >= max * 0.75) {
                counter.classList.add('warning');
            }

            validateForm();
        });
    });
}

function setupFormValidation() {
    [dom.nameInput, dom.personalityInput, dom.neverSayInput].forEach((input) => {
        input.addEventListener('input', validateForm);
    });
}

function validateForm() {
    const valid =
        dom.nameInput.value.trim().length > 0 &&
        dom.personalityInput.value.trim().length > 0 &&
        dom.neverSayInput.value.trim().length > 0;

    dom.createBtn.disabled = !valid;
}

function setupFormSubmit() {
    dom.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (dom.createBtn.disabled) return;

        // Save character
        state.character = {
            name: dom.nameInput.value.trim(),
            personality: dom.personalityInput.value.trim(),
            neverSay: dom.neverSayInput.value.trim(),
        };

        // Show loading
        dom.createBtn.classList.add('loading');
        dom.createBtn.disabled = true;

        try {
            // Generate opener
            const opener = await generateOpener();

            // Initialize chat state
            state.messages = [{ role: 'assistant', content: opener }];
            state.userMessageCount = 0;

            // Switch to chat
            switchScreen('chat');
        } catch (err) {
            console.error('Failed to generate opener:', err);
            alert('Failed to bring character to life. Check your API key and try again.');
        } finally {
            dom.createBtn.classList.remove('loading');
            dom.createBtn.disabled = false;
        }
    });
}

// ============================================================
// API CALLS
// ============================================================

async function generateOpener() {
    const res = await fetch(`${API_BASE}/api/opener`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            character: {
                name: state.character.name,
                personality: state.character.personality,
                never_say: state.character.neverSay,
            },
        }),
    });

    if (!res.ok) {
        throw new Error(`Opener failed: ${res.status}`);
    }

    const data = await res.json();
    return data.reply;
}

async function sendMessage(userMessage) {
    // Add user message to state
    state.messages.push({ role: 'user', content: userMessage });
    state.userMessageCount++;

    // Render user message
    renderMessage({ role: 'user', content: userMessage });
    updateProgressDots();

    // Show typing
    state.isLoading = true;
    const typingEl = showTypingIndicator();
    updateInputState();

    try {
        const res = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                character: {
                    name: state.character.name,
                    personality: state.character.personality,
                    never_say: state.character.neverSay,
                },
                messages: state.messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                })),
            }),
        });

        if (!res.ok) {
            throw new Error(`Chat failed: ${res.status}`);
        }

        const data = await res.json();

        // Remove typing indicator
        typingEl.remove();

        // Add assistant reply
        state.messages.push({ role: 'assistant', content: data.reply });
        renderMessage({ role: 'assistant', content: data.reply });
    } catch (err) {
        console.error('Chat error:', err);
        typingEl.remove();

        // Remove the failed user message from state
        state.messages.pop();
        state.userMessageCount--;
        updateProgressDots();

        renderSystemMessage('Something went wrong. Try sending again.');
    } finally {
        state.isLoading = false;
        updateInputState();

        // Check if conversation complete
        if (state.userMessageCount >= MAX_MESSAGES) {
            setTimeout(showConversationComplete, 800);
        }
    }
}

// ============================================================
// SCREEN MANAGEMENT
// ============================================================

function switchScreen(screen) {
    state.screen = screen;

    dom.screenCreate.classList.toggle('active', screen === 'create');
    dom.screenChat.classList.toggle('active', screen === 'chat');

    if (screen === 'chat') {
        setupChatScreen();
    }
}

function setupChatScreen() {
    dom.charName.textContent = state.character.name;
    dom.messagesArea.innerHTML = '';
    dom.chatComplete.classList.remove('visible');
    dom.inputArea.classList.remove('disabled');

    // Render opener message
    if (state.messages.length > 0) {
        renderMessage(state.messages[0]);
    }

    updateProgressDots();
    updateInputState();

    // Focus input after transition
    setTimeout(() => dom.chatInput.focus(), 400);
}

// ============================================================
// CHAT RENDERING
// ============================================================

function renderMessage(msg) {
    const wrapper = document.createElement('div');
    wrapper.className = `message ${msg.role}`;

    if (msg.role === 'assistant') {
        const sender = document.createElement('div');
        sender.className = 'message-sender';
        sender.innerHTML = `<svg viewBox="0 0 48 48" fill="none" width="14" height="14"><circle cx="24" cy="24" r="20" fill="#d4e6f5"/><circle cx="18" cy="22" r="2" fill="#5b7fc7"/><circle cx="30" cy="22" r="2" fill="#5b7fc7"/><path d="M19 30c1.5 2 3 3 5 3s3.5-1 5-3" stroke="#e88ca5" stroke-width="2" stroke-linecap="round"/></svg> ${escapeHtml(state.character.name)}`;
        wrapper.appendChild(sender);
    }

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = msg.content;
    wrapper.appendChild(bubble);

    dom.messagesArea.appendChild(wrapper);
    scrollToBottom();
}

function renderSystemMessage(text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'message assistant';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.style.borderColor = '#e8735a';
    bubble.style.color = '#c0392b';
    bubble.textContent = text;
    wrapper.appendChild(bubble);

    dom.messagesArea.appendChild(wrapper);
    scrollToBottom();
}

function showTypingIndicator() {
    const el = document.createElement('div');
    el.className = 'typing-indicator';
    el.innerHTML = `
        <div class="typing-bubble">
            <span class="typing-name">${escapeHtml(state.character.name)} is thinking…</span>
            <div class="typing-dots">
                <span class="dot-bounce"></span>
                <span class="dot-bounce"></span>
                <span class="dot-bounce"></span>
            </div>
        </div>
    `;
    dom.messagesArea.appendChild(el);
    scrollToBottom();
    return el;
}

function scrollToBottom() {
    requestAnimationFrame(() => {
        dom.messagesArea.scrollTop = dom.messagesArea.scrollHeight;
    });
}

// ============================================================
// PROGRESS DOTS
// ============================================================

function renderProgressDots() {
    dom.progress.innerHTML = '';
    for (let i = 0; i < MAX_MESSAGES; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        dom.progress.appendChild(dot);
    }
}

function updateProgressDots() {
    const dots = dom.progress.querySelectorAll('.progress-dot');
    dots.forEach((dot, i) => {
        dot.classList.remove('filled', 'current');
        if (i < state.userMessageCount) {
            dot.classList.add('filled');
        } else if (i === state.userMessageCount && state.userMessageCount < MAX_MESSAGES) {
            dot.classList.add('current');
        }
    });
}

// ============================================================
// INPUT STATE
// ============================================================

function updateInputState() {
    const canSend =
        !state.isLoading &&
        state.userMessageCount < MAX_MESSAGES &&
        dom.chatInput.value.trim().length > 0;

    dom.sendBtn.disabled = !canSend;

    if (state.userMessageCount >= MAX_MESSAGES || state.isLoading) {
        dom.chatInput.disabled = state.userMessageCount >= MAX_MESSAGES;
        if (state.userMessageCount >= MAX_MESSAGES) {
            dom.chatInput.placeholder = 'Conversation complete';
        }
    } else {
        dom.chatInput.disabled = false;
        dom.chatInput.placeholder = 'Type your message...';
    }
}

function setupChatSubmit() {
    dom.chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = dom.chatInput.value.trim();
        if (!text || state.isLoading || state.userMessageCount >= MAX_MESSAGES) return;

        dom.chatInput.value = '';
        dom.sendBtn.disabled = true;
        sendMessage(text);
    });

    dom.chatInput.addEventListener('input', updateInputState);
}

// ============================================================
// CONVERSATION COMPLETE
// ============================================================

function showConversationComplete() {
    dom.inputArea.classList.add('disabled');
    dom.chatComplete.classList.add('visible');
    launchConfetti();
}

function setupStartOver() {
    dom.startOverBtn.addEventListener('click', resetApp);
    dom.newCharBtn.addEventListener('click', resetApp);
}

function resetApp() {
    // Clear state
    state.character = { name: '', personality: '', neverSay: '' };
    state.messages = [];
    state.userMessageCount = 0;
    state.isLoading = false;

    // Clear form
    dom.nameInput.value = '';
    dom.personalityInput.value = '';
    dom.neverSayInput.value = '';
    dom.nameCount.textContent = '0 / 50';
    dom.personalityCount.textContent = '0 / 500';
    dom.neverSayCount.textContent = '0 / 200';
    [dom.nameCount, dom.personalityCount, dom.neverSayCount].forEach((el) => {
        el.classList.remove('warning', 'danger');
    });
    dom.createBtn.disabled = true;

    // Reset chat UI
    dom.messagesArea.innerHTML = '';
    dom.chatComplete.classList.remove('visible');
    dom.inputArea.classList.remove('disabled');
    dom.chatInput.value = '';
    dom.chatInput.disabled = false;
    dom.chatInput.placeholder = 'Type your message...';
    renderProgressDots();

    // Switch screen
    switchScreen('create');

    // Focus name
    setTimeout(() => dom.nameInput.focus(), 400);
}

// ============================================================
// CONFETTI (Anime-themed: sakura + stars)
// ============================================================

function launchConfetti() {
    const canvas = dom.confettiCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Anime palette confetti colors
    const colors = ['#6b9fd4', '#e88ca5', '#f2b5c6', '#a3c5e8', '#fce4ec', '#ffffff', '#7db87d'];
    const particles = [];

    for (let i = 0; i < 80; i++) {
        const isStar = Math.random() > 0.6;
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 8 + 4,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 4 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            opacity: 1,
            isStar,
        });
    }

    let frame = 0;
    const maxFrames = 150;

    function drawStar(ctx, x, y, size, color, opacity, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const method = i === 0 ? 'moveTo' : 'lineTo';
            ctx[method](Math.cos(angle) * size, Math.sin(angle) * size);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function animate() {
        frame++;
        if (frame > maxFrames) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // gravity
            p.rotation += p.rotationSpeed;

            // Fade out in last 30 frames
            if (frame > maxFrames - 30) {
                p.opacity = Math.max(0, (maxFrames - frame) / 30);
            }

            if (p.isStar) {
                drawStar(ctx, p.x, p.y, p.w / 2, p.color, p.opacity, p.rotation);
            } else {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = p.color;
                // Draw petal shape for confetti too
                ctx.beginPath();
                ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// ============================================================
// UTILITIES
// ============================================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- Boot ---
document.addEventListener('DOMContentLoaded', init);
