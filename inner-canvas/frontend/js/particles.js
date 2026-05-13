/**
 * Inner Canvas — Particle System
 * Cloud-Pup: soft drifting motes — sky-blue, peach, and cloud-white.
 * Particles float gently upward like cotton fluff in a warm breeze.
 */

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.running = false;
        // Cloud-pup defaults: sky, peach, warm white motes
        this.colors = ['#B8CDE8', '#DCE7F5', '#F5DCD0', '#E8B8A0', '#FBFAF7'];
        this.targetCount = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Auto-start ambient particles on load
        this.spawn(30);
        this.start();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setColors(colors) {
        this.colors = colors;
        // Update existing particles
        this.particles.forEach(p => {
            p.color = colors[Math.floor(Math.random() * colors.length)];
        });
    }

    spawn(count) {
        this.targetCount = count;
        while (this.particles.length < count) {
            this.particles.push(this.createParticle());
        }
        // Remove excess
        if (this.particles.length > count) {
            this.particles.length = count;
        }
    }

    createParticle(x, y) {
        const zLayer = Math.random() * 3; // 0-3 depth layers
        return {
            x: x ?? Math.random() * this.canvas.width,
            y: y ?? Math.random() * this.canvas.height,
            size: 2 + Math.random() * 4, // slightly larger, fluffier
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            opacity: 0.08 + Math.random() * 0.25, // softer, more transparent
            speedX: (Math.random() - 0.5) * 0.15, // slower drift
            speedY: -(0.05 + Math.random() * 0.15), // gentle upward float
            zLayer,
            parallaxFactor: 1.5 + zLayer * 1,
            blur: Math.max(0, zLayer - 1),
            phase: Math.random() * Math.PI * 2,
            frequency: 0.003 + Math.random() * 0.006,
            amplitude: 12 + Math.random() * 25,
            opacityPhase: Math.random() * Math.PI * 2,
            // For converge animation
            converging: false,
            targetX: this.canvas.width / 2,
            targetY: this.canvas.height / 2,
            // Soft twinkle
            twinkle: Math.random() > 0.5,
            twinkleSpeed: 0.5 + Math.random() * 1,
        };
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.animate();
    }

    stop() {
        this.running = false;
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    convergeToCenter() {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        this.particles.forEach(p => {
            p.converging = true;
            p.targetX = cx + (Math.random() - 0.5) * 50;
            p.targetY = cy + (Math.random() - 0.5) * 50;
        });
    }

    burstFromCenter(colors, count = 25) {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 1.5 + Math.random() * 3; // gentler burst
            const p = this.createParticle(cx, cy);
            p.speedX = Math.cos(angle) * speed;
            p.speedY = Math.sin(angle) * speed;
            p.color = colors[Math.floor(Math.random() * colors.length)];
            p.opacity = 0.4 + Math.random() * 0.3;
            p.size = 4 + Math.random() * 6;
            p.life = 80; // longer fade
            this.particles.push(p);
        }
    }

    animate() {
        if (!this.running) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const time = Date.now() * 0.001;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Handle burst particles with life
            if (p.life !== undefined) {
                p.life--;
                if (p.life <= 0) {
                    p.opacity -= 0.015;
                    if (p.opacity <= 0) {
                        this.particles.splice(i, 1);
                        continue;
                    }
                }
                p.speedX *= 0.975; // slower decel for dreamy feel
                p.speedY *= 0.975;
            }

            if (p.converging) {
                // Ease toward target — very gentle
                p.x += (p.targetX - p.x) * 0.02;
                p.y += (p.targetY - p.y) * 0.02;
            } else {
                // Brownian drift with sinusoidal variation
                p.x += p.speedX + Math.sin(time * p.frequency * 60 + p.phase) * 0.2;
                p.y += p.speedY + Math.cos(time * p.frequency * 60 + p.phase) * 0.15;
            }

            // Add to position from speed (for burst particles)
            if (p.life !== undefined) {
                p.x += p.speedX;
                p.y += p.speedY;
            }

            // Parallax from mouse — gentler
            const parallaxX = (this.mouseX - this.canvas.width / 2) * 0.0006 * p.parallaxFactor;
            const parallaxY = (this.mouseY - this.canvas.height / 2) * 0.0006 * p.parallaxFactor;

            // Opacity oscillation + twinkle
            let opacityOsc = Math.sin(time * 0.3 + p.opacityPhase) * 0.06;
            if (p.twinkle) {
                opacityOsc += Math.sin(time * p.twinkleSpeed + p.phase) * 0.1;
            }
            const finalOpacity = Math.max(0, Math.min(1, p.opacity + opacityOsc));

            // Wrap around screen edges
            if (p.x < -20) p.x = this.canvas.width + 20;
            if (p.x > this.canvas.width + 20) p.x = -20;
            if (p.y < -20) p.y = this.canvas.height + 20;
            if (p.y > this.canvas.height + 20) p.y = -20;

            // Draw — soft circles with diffuse glow
            this.ctx.save();
            if (p.blur > 0) {
                this.ctx.filter = `blur(${p.blur + 1}px)`; // extra blur for cloud feel
            } else {
                this.ctx.filter = `blur(0.5px)`; // everything slightly soft
            }
            this.ctx.globalAlpha = finalOpacity;
            this.ctx.beginPath();
            this.ctx.arc(
                p.x + parallaxX,
                p.y + parallaxY,
                p.size,
                0,
                Math.PI * 2
            );
            this.ctx.fillStyle = p.color;
            this.ctx.fill();

            // Add soft halo for larger particles
            if (p.size > 3) {
                this.ctx.globalAlpha = finalOpacity * 0.1;
                this.ctx.beginPath();
                this.ctx.arc(
                    p.x + parallaxX,
                    p.y + parallaxY,
                    p.size * 3,
                    0,
                    Math.PI * 2
                );
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
            }

            this.ctx.restore();
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Global instance
const particleSystem = new ParticleSystem('particle-canvas');
