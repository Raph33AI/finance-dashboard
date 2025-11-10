// ============================================
// PARTICLES BACKGROUND - FULL SCREEN
// VERSION CORRIGÉE
// ============================================

function initializeParticles() {
    console.log('🎨 Initializing particles...');
    
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) {
        console.warn('⚠️ Particles canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d', { alpha: true }); // CORRECTION: alpha: true
    
    // Full viewport size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log('📐 Canvas resized:', canvas.width, 'x', canvas.height);
    }
    resizeCanvas();
    
    // Optimized settings
    const particles = [];
    const particleCount = 80; // CORRECTION: Réduit pour meilleures performances
    const connectionDistance = 150;
    const colors = ['#667eea', '#764ba2', '#8b5cf6', '#6366f1'];
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
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
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    let lastTime = 0;
    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;
    
    function animate(currentTime) {
        requestAnimationFrame(animate);
        
        const deltaTime = currentTime - lastTime;
        if (deltaTime < frameTime) return;
        
        lastTime = currentTime - (deltaTime % frameTime);
        
        // Clear with transparency
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Gradient background (subtle)
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(248, 250, 252, 0.3)');
        gradient.addColorStop(0.5, 'rgba(239, 246, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(241, 245, 249, 0.3)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        // Draw connections
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    const opacity = (1 - distance / connectionDistance) * 0.4;
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