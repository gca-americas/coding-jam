/**
 * Inner Canvas — Generation Ceremony
 * Cloud-Pup: soft cloud-orb, gentle ripples, cozy status phrases.
 */

class Ceremony {
    constructor() {
        this.orb = document.getElementById('orb');
        this.orbContainer = document.getElementById('orb-container');
        this.rippleContainer = document.getElementById('ripple-container');
        this.statusText = document.getElementById('status-text');
        this.colorWash = document.getElementById('color-wash');
        this.artFrame = document.getElementById('art-frame');
        this.artImage = document.getElementById('art-image');
        this.borderTrace = document.getElementById('border-trace');
        this.dividerLine = document.getElementById('divider-line');
        this.reflectionQuestion = document.getElementById('reflection-question');
        this.attribution = document.getElementById('attribution');
        this.actionButtons = document.getElementById('action-buttons');

        this.statusPhrases = [
            'Listening to the clouds...',
            'Feeling for the warmth...',
            'Something soft is forming...',
            'Painting with gentle light...',
            'Almost there, almost cozy...',
        ];
        this.statusIndex = 0;
        this.statusInterval = null;
        this.rippleInterval = null;
    }

    async actDissolve(textArea) {
        const text = textArea.value;
        const wrapper = textArea.parentElement;
        const wordsContainer = document.createElement('div');
        wordsContainer.className = 'dissolve-words-container';
        wordsContainer.style.cssText = `width:100%;padding:1.75rem;font-family:'Nunito',sans-serif;font-size:1.0625rem;font-weight:400;line-height:1.8;color:var(--ink-deep);white-space:pre-wrap;word-wrap:break-word;`;
        text.split(/(\s+)/).forEach(word => {
            const span = document.createElement('span');
            span.className = 'dissolve-word';
            span.textContent = word;
            wordsContainer.appendChild(span);
        });
        textArea.style.display = 'none';
        wrapper.appendChild(wordsContainer);
        const wordSpans = wordsContainer.querySelectorAll('.dissolve-word');
        for (let i = 0; i < wordSpans.length; i++) {
            setTimeout(() => wordSpans[i].classList.add('dissolving'), i * 25); // slightly slower
        }
        await this.wait(Math.min(wordSpans.length * 25 + 700, 1400));
        wordsContainer.remove();
        textArea.style.display = '';
    }

    async actBreathingCanvas(orbColors) {
        document.documentElement.style.setProperty('--orb-color-1', orbColors[0]);
        document.documentElement.style.setProperty('--orb-color-2', orbColors[1]);
        document.documentElement.style.setProperty('--orb-color-3', orbColors[2] || orbColors[0]);
        particleSystem.setColors(orbColors);
        particleSystem.spawn(35);
        particleSystem.start();
        this.orb.style.opacity = '0';
        this.orb.classList.add('breathing');
        await this.fadeIn(this.orb, 800); // slower fade for gentle feel
        this.startRipples();
        this.startStatusRotation();
    }

    startRipples() {
        this.createRipple();
        this.rippleInterval = setInterval(() => this.createRipple(), 1500); // slower ripples
    }

    createRipple() {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        this.rippleContainer.appendChild(ripple);
        setTimeout(() => ripple.remove(), 5000);
    }

    stopRipples() {
        if (this.rippleInterval) { clearInterval(this.rippleInterval); this.rippleInterval = null; }
    }

    startStatusRotation() {
        this.statusIndex = 0;
        this.showStatus(this.statusPhrases[0]);
        this.statusInterval = setInterval(() => {
            this.statusIndex = (this.statusIndex + 1) % this.statusPhrases.length;
            this.crossfadeStatus(this.statusPhrases[this.statusIndex]);
        }, 4000); // slower rotation
    }

    async showStatus(text) {
        this.statusText.textContent = text;
        this.statusText.style.opacity = '1';
    }

    async crossfadeStatus(text) {
        this.statusText.style.opacity = '0';
        this.statusText.style.transform = 'translateY(-8px)';
        await this.wait(500);
        this.statusText.textContent = text;
        this.statusText.style.transform = 'translateY(8px)';
        await this.wait(60);
        this.statusText.style.opacity = '1';
        this.statusText.style.transform = 'translateY(0)';
    }

    async actAnticipation(orbColors) {
        if (this.statusInterval) { clearInterval(this.statusInterval); this.statusInterval = null; }
        this.orb.classList.remove('breathing');
        this.orb.classList.add('slowing');
        await this.wait(400);
        particleSystem.convergeToCenter();
        await this.wait(400);
        this.stopRipples();
        this.rippleContainer.querySelectorAll('.ripple').forEach(r => {
            r.style.animationPlayState = 'paused';
            r.style.opacity = '0';
        });
        await this.crossfadeStatus('...');
        await this.wait(500);
        this.orb.classList.remove('slowing');
        this.orb.classList.add('contracting');
        await this.wait(400);
        this.orb.classList.remove('contracting');
        this.orb.classList.add('burst');
        particleSystem.burstFromCenter(orbColors, 25);
        await this.wait(600);
        this.statusText.style.opacity = '0';
        this.orb.style.opacity = '0';
    }

    async actReveal(imageBase64, altText, reflectionText, dominantColor) {
        document.documentElement.style.setProperty('--dominant-color', dominantColor);
        this.colorWash.classList.add('active');
        await this.wait(1000);
        this.artImage.src = `data:image/png;base64,${imageBase64}`;
        this.artImage.alt = altText;
        this.artFrame.style.opacity = '1';
        await new Promise(resolve => {
            if (this.artImage.complete) resolve();
            else this.artImage.onload = resolve;
        });
        await this.wait(300);
        this.artImage.classList.add('materializing');
        await this.wait(2800);
        this.artImage.classList.add('materialized');
        this.borderTrace.classList.add('tracing');
        this.dividerLine.classList.add('extended');
        await this.wait(1200);
        // Reset particles to cloud-pup defaults
        particleSystem.setColors(['#B8CDE8', '#DCE7F5', '#F5DCD0', '#E8B8A0', '#FBFAF7']);
        particleSystem.spawn(12);
        this.reflectionQuestion.style.opacity = '1';
        await this.typeWriter(this.reflectionQuestion, reflectionText);
        await this.wait(600);
        this.attribution.style.opacity = '0.4';
        await this.wait(600);
        this.actionButtons.style.opacity = '1';
    }

    async typeWriter(element, text) {
        element.innerHTML = '';
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        element.appendChild(cursor);
        for (let i = 0; i < text.length; i++) {
            element.insertBefore(document.createTextNode(text[i]), cursor);
            await this.wait(35); // slightly slower for cozy feel
        }
        await this.wait(1800);
        cursor.style.animation = 'none';
        cursor.style.opacity = '0';
        cursor.style.transition = 'opacity 0.6s';
    }

    reset() {
        if (this.statusInterval) clearInterval(this.statusInterval);
        if (this.rippleInterval) clearInterval(this.rippleInterval);
        // Cloud-pup default palette
        particleSystem.setColors(['#B8CDE8', '#DCE7F5', '#F5DCD0', '#E8B8A0', '#FBFAF7']);
        particleSystem.spawn(30);
        particleSystem.start();
        this.orb.className = 'orb';
        this.orb.style.opacity = '0';
        this.rippleContainer.innerHTML = '';
        this.statusText.textContent = '';
        this.statusText.style.opacity = '0';
        this.statusText.style.transform = '';
        this.colorWash.classList.remove('active');
        this.artFrame.style.opacity = '0';
        this.artImage.className = 'art-image';
        this.artImage.src = '';
        this.borderTrace.classList.remove('tracing');
        this.borderTrace.querySelector('rect').style.strokeDashoffset = '100';
        this.dividerLine.classList.remove('extended');
        this.reflectionQuestion.innerHTML = '';
        this.reflectionQuestion.style.opacity = '0';
        this.attribution.style.opacity = '0';
        this.actionButtons.style.opacity = '0';
    }

    wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    async fadeIn(element, duration = 800) {
        element.style.transition = `opacity ${duration}ms var(--ease-smooth)`;
        element.style.opacity = '0';
        element.offsetHeight;
        element.style.opacity = '1';
        await this.wait(duration);
    }
}

const ceremony = new Ceremony();
