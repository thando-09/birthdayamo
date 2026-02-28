// Audio Context for sound effects
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playTone(freq, type, duration) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playSparkle() {
    for(let i = 0; i < 5; i++) {
        setTimeout(() => playTone(800 + Math.random() * 400, 'sine', 0.1), i * 50);
    }
}

// Starfield Background
const starCanvas = document.getElementById('star-canvas');
const starCtx = starCanvas.getContext('2d');
let stars = [];
let shootingStars = [];

function resizeStarCanvas() {
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
}
resizeStarCanvas();
window.addEventListener('resize', resizeStarCanvas);

class Star {
    constructor() {
        this.x = Math.random() * starCanvas.width;
        this.y = Math.random() * starCanvas.height;
        this.size = Math.random() * 2;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.brightness = Math.random();
        this.twinkleSpeed = 0.01 + Math.random() * 0.03;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.brightness += this.twinkleSpeed;
        if (this.brightness > 1 || this.brightness < 0.3) this.twinkleSpeed *= -1;
        
        if (this.x < 0) this.x = starCanvas.width;
        if (this.x > starCanvas.width) this.x = 0;
        if (this.y < 0) this.y = starCanvas.height;
        if (this.y > starCanvas.height) this.y = 0;
    }

    draw() {
        starCtx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
        starCtx.beginPath();
        starCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        starCtx.fill();
        
        // Glow effect
        starCtx.shadowBlur = 10;
        starCtx.shadowColor = 'white';
        starCtx.fill();
        starCtx.shadowBlur = 0;
    }
}

class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * starCanvas.width;
        this.y = 0;
        this.length = Math.random() * 80 + 20;
        this.speed = Math.random() * 10 + 5;
        this.angle = Math.random() * Math.PI / 4 + Math.PI / 4;
        this.life = 1;
        this.active = false;
    }

    activate() {
        this.active = true;
        this.reset();
    }

    update() {
        if (!this.active) return;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.life -= 0.02;
        if (this.life <= 0 || this.x > starCanvas.width || this.y > starCanvas.height) {
            this.active = false;
        }
    }

    draw() {
        if (!this.active) return;
        const gradient = starCtx.createLinearGradient(
            this.x, this.y,
            this.x - Math.cos(this.angle) * this.length,
            this.y - Math.sin(this.angle) * this.length
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.life})`);
        gradient.addColorStop(1, 'transparent');
        
        starCtx.strokeStyle = gradient;
        starCtx.lineWidth = 2;
        starCtx.beginPath();
        starCtx.moveTo(this.x, this.y);
        starCtx.lineTo(
            this.x - Math.cos(this.angle) * this.length,
            this.y - Math.sin(this.angle) * this.length
        );
        starCtx.stroke();
    }
}

// Initialize stars
for (let i = 0; i < 300; i++) {
    stars.push(new Star());
}
for (let i = 0; i < 3; i++) {
    shootingStars.push(new ShootingStar());
}

function animateStars() {
    starCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    starCtx.fillRect(0, 0, starCanvas.width, starCanvas.height);
    
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    if (Math.random() < 0.02) {
        const inactive = shootingStars.find(s => !s.active);
        if (inactive) inactive.activate();
    }

    shootingStars.forEach(star => {
        star.update();
        star.draw();
    });

    requestAnimationFrame(animateStars);
}
animateStars();

// LED Heart Generation
function createLEDHeart() {
    const container = document.getElementById('heart-container');
    const centerX = 300;
    const centerY = 300;
    const rings = 15;
    
    for (let r = 1; r <= rings; r++) {
        const ring = document.createElement('div');
        ring.className = 'led-ring';
        const size = r * 40;
        ring.style.width = size + 'px';
        ring.style.height = size + 'px';
        ring.style.color = `hsl(${280 + r * 10}, 100%, 50%)`;
        ring.style.animationDelay = (r * 0.1) + 's';
        container.appendChild(ring);
    }

    // Fill heart with particles
    for (let i = 0; i < 200; i++) {
        const t = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.8;
        const x = 16 * Math.pow(Math.sin(t), 3) * r * 12 + centerX;
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * r * 12 + centerY;
        
        const particle = document.createElement('div');
        particle.className = 'led-particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.animationDelay = Math.random() * 2 + 's';
        particle.style.background = `radial-gradient(circle, #fff 0%, #ff00ff 50%, hsl(${280 + Math.random() * 40}, 100%, 30%) 100%)`;
        container.appendChild(particle);
    }
}
createLEDHeart();

// Fireworks System
const fwCanvas = document.getElementById('fireworks-canvas');
const fwCtx = fwCanvas.getContext('2d');
let fireworks = [];
let particles = [];

function resizeFwCanvas() {
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;
}
resizeFwCanvas();
window.addEventListener('resize', resizeFwCanvas);

class Firework {
    constructor(x, y, targetY, color) {
        this.x = x;
        this.y = y;
        this.targetY = targetY;
        this.color = color;
        this.speed = 8;
        this.angle = -Math.PI / 2;
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: Math.sin(this.angle) * this.speed
        };
        this.trail = [];
        this.dead = false;
    }

    update() {
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 5) this.trail.shift();
        
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.y += 0.1; // gravity

        if (this.y <= this.targetY || this.velocity.y >= 0) {
            this.dead = true;
            createExplosion(this.x, this.y, this.color);
        }
    }

    draw() {
        fwCtx.strokeStyle = this.color;
        fwCtx.lineWidth = 3;
        fwCtx.beginPath();
        fwCtx.moveTo(this.trail[0]?.x || this.x, this.trail[0]?.y || this.y);
        for (let point of this.trail) {
            fwCtx.lineTo(point.x, point.y);
        }
        fwCtx.lineTo(this.x, this.y);
        fwCtx.stroke();

        fwCtx.fillStyle = '#fff';
        fwCtx.beginPath();
        fwCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        fwCtx.fill();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        this.life = 1;
        this.decay = Math.random() * 0.015 + 0.01;
        this.gravity = 0.05;
    }

    update() {
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life -= this.decay;
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;
    }

    draw() {
        fwCtx.globalAlpha = this.life;
        fwCtx.fillStyle = this.color;
        fwCtx.beginPath();
        fwCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        fwCtx.fill();
        
        // Glow
        fwCtx.shadowBlur = 10;
        fwCtx.shadowColor = this.color;
        fwCtx.fill();
        fwCtx.shadowBlur = 0;
        fwCtx.globalAlpha = 1;
    }
}

function createExplosion(x, y, color) {
    playSparkle();
    for (let i = 0; i < 80; i++) {
        particles.push(new Particle(x, y, color));
    }
    // Secondary explosion
    setTimeout(() => {
        for (let i = 0; i < 40; i++) {
            particles.push(new Particle(x + (Math.random() - 0.5) * 50, y + (Math.random() - 0.5) * 50, 
                `hsl(${Math.random() * 60 + 280}, 100%, 50%)`));
        }
    }, 200);
}

function launchFirework() {
    const x = Math.random() * fwCanvas.width;
    const targetY = Math.random() * fwCanvas.height * 0.4 + 50;
    const color = `hsl(${Math.random() * 60 + 280}, 100%, 50%)`;
    fireworks.push(new Firework(x, fwCanvas.height, targetY, color));
}

function animateFireworks() {
    fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);

    fireworks = fireworks.filter(f => !f.dead);
    particles = particles.filter(p => p.life > 0);

    fireworks.forEach(f => {
        f.update();
        f.draw();
    });

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animateFireworks);
}
animateFireworks();

// Cake and Candles
function createCake() {
    const cake = document.getElementById('cake');
    const candlePositions = [
        {x: 20, layer: 2}, {x: 50, layer: 2}, {x: 80, layer: 2},
        {x: 35, layer: 1}, {x: 65, layer: 1},
        {x: 20, layer: 0}, {x: 40, layer: 0}, {x: 60, layer: 0}, {x: 80, layer: 0},
        {x: 10, layer: 0}, {x: 30, layer: 0}, {x: 50, layer: 0}, {x: 70, layer: 0}, {x: 90, layer: 0},
        {x: 50, layer: 2}, {x: 25, layer: 1}, {x: 75, layer: 1}, {x: 50, layer: 0}, {x: 15, layer: 2}
    ];

    candlePositions.forEach((pos, i) => {
        const candle = document.createElement('div');
        candle.className = 'candle';
        candle.style.left = pos.x + '%';
        
        let bottom;
        if (pos.layer === 2) bottom = 210;
        else if (pos.layer === 1) bottom = 140;
        else bottom = 70;
        
        candle.style.bottom = bottom + 'px';
        candle.dataset.index = i;
        cake.appendChild(candle);
    });
}
createCake();

// Scene Management
const scenes = ['heart-scene', 'countdown-scene', 'birthday-scene', 'cake-scene', 'smile-scene', 'letter-scene'];
let candlesBlown = false;

function showScene(index) {
    console.log('Showing scene:', index, scenes[index]);
    
    // Hide all scenes first
    document.querySelectorAll('.scene').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    
    // Show target scene
    if (index < scenes.length) {
        const targetScene = document.getElementById(scenes[index]);
        if (targetScene) {
            targetScene.style.display = 'flex';
            // Force reflow
            void targetScene.offsetWidth;
            targetScene.classList.add('active');
            console.log('Scene activated:', scenes[index]);
        }
    }
}

function startExperience() {
    document.getElementById('start-btn').classList.add('hidden');
    playTone(440, 'sine', 0.5);
    
    // Show heart scene first
    showScene(0);
    
    setTimeout(() => {
        showScene(1);
        startCountdown();
    }, 4000);
}

function startCountdown() {
    let count = 5;
    const numEl = document.getElementById('countdown-num');
    
    const interval = setInterval(() => {
        numEl.textContent = count;
        // Reset animation
        numEl.style.animation = 'none';
        void numEl.offsetWidth; // Trigger reflow
        numEl.style.animation = 'count-pulse 1s ease-in-out';
        playTone(200 + count * 100, 'square', 0.3);
        
        count--;
        if (count < 0) {
            clearInterval(interval);
            showScene(2);
            startFireworks();
            setTimeout(() => showScene(3), 4000);
        }
    }, 1000);
}

function startFireworks() {
    playTone(800, 'sine', 0.5);
    let count = 0;
    const interval = setInterval(() => {
        launchFirework();
        count++;
        if (count > 20) clearInterval(interval);
    }, 300);
}

// Blow out candles
document.getElementById('blow-instruction').addEventListener('click', function() {
    if (candlesBlown) return;
    candlesBlown = true;
    
    const candles = document.querySelectorAll('.candle');
    candles.forEach((candle, i) => {
        setTimeout(() => {
            candle.classList.add('extinguished');
            // Create smoke
            for (let j = 0; j < 3; j++) {
                const smoke = document.createElement('div');
                smoke.className = 'smoke';
                smoke.style.left = (parseInt(candle.style.left) + Math.random() * 10 - 5) + '%';
                smoke.style.bottom = (parseInt(candle.style.bottom) + 60) + 'px';
                smoke.style.animationDelay = (j * 0.2) + 's';
                document.getElementById('cake').appendChild(smoke);
            }
            playTone(400 - i * 10, 'sine', 0.1);
        }, i * 100);
    });

    this.textContent = '19 Candles Blown Out!';
    
    setTimeout(() => {
        console.log('Transitioning to smile scene');
        showScene(4);
        setTimeout(() => {
            console.log('Transitioning to letter scene');
            showScene(5);
        }, 6000);
    }, 2500);
});

// Letter interaction
document.getElementById('envelope').addEventListener('click', function() {
    this.classList.add('open');
    playTone(600, 'sine', 0.3);
    setTimeout(() => {
        document.getElementById('letter').classList.add('show');
        // Launch celebration fireworks
        for (let i = 0; i < 10; i++) {
            setTimeout(launchFirework, i * 200);
        }
    }, 500);
});

document.getElementById('start-btn').addEventListener('click', startExperience);

// Create floating particles
function createParticles() {
    const colors = ['#ff00ff', '#ff69b4', '#ffb6c1', '#fff'];
    setInterval(() => {
        if (document.querySelector('.scene.active')) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = '100%';
            particle.style.width = Math.random() * 10 + 5 + 'px';
            particle.style.height = particle.style.width;
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.boxShadow = `0 0 10px ${particle.style.background}`;
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 3000);
        }
    }, 500);
}
createParticles();

// Ambient sound on first interaction
document.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}, { once: true });