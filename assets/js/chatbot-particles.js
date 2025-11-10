// ============================================
// PARTICLES BACKGROUND - FULL SCREEN VISIBLE
// ============================================

function initializeParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) {
        console.warn('⚠️ Particles canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d', { alpha: false });
    
    // Full viewport size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log('📐 Canvas size:', canvas.width, 'x', canvas.height);
    }
    resizeCanvas();
    
    // Enhanced settings for visibility
    const particles = [];
    const particleCount = 100; // Increased for better coverage
    const connectionDistance = 180;
    const colors = ['#667eea', '#764ba2', '#8b5cf6', '#6366f1'];
    
    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.radius = Math.random() * 2.5 + 1.5;
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Optimized animation loop
    let lastTime = 0;
    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;
    
    function animate(currentTime) {
        requestAnimationFrame(animate);
        
        const deltaTime = currentTime - lastTime;
        if (deltaTime < frameTime) return;
        
        lastTime = currentTime - (deltaTime % frameTime);
        
        // Enhanced gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#f8fafc');
        gradient.addColorStop(0.3, '#eff6ff');
        gradient.addColorStop(0.5, '#f1f5f9');
        gradient.addColorStop(0.7, '#e8eef5');
        gradient.addColorStop(1, '#f0f4f8');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        // Draw connections (more visible)
        ctx.lineWidth = 1.5;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    const opacity = (1 - distance / connectionDistance) * 0.5;
                    ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    requestAnimationFrame(animate);
    
    // Debounced resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas();
            particles.forEach(p => p.reset());
        }, 250);
    });
    
    console.log('✅ Particles initialized:', particleCount, 'particles - FULL SCREEN');
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeParticles);
} else {
    initializeParticles();
}