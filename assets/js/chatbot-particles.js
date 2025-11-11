// ============================================
// PARTICLES BACKGROUND (DARK/LIGHT MODE ADAPTIVE)
// Version: 2.0 - 60 FPS Optimized
// ============================================

function initializeParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) {
        console.warn('⚠️ Particles canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d', { alpha: true });
    
    // Resize canvas to full viewport
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    
    // Detect dark mode
    function isDarkMode() {
        return document.body.classList.contains('dark-mode');
    }
    
    // Optimized settings
    const particles = [];
    const particleCount = 80;
    const connectionDistance = 150;
    
    // Colors adapted to theme
    const lightColors = ['#667eea', '#764ba2', '#8b5cf6'];
    const darkColors = ['#818cf8', '#a78bfa', '#c084fc'];
    
    // Particle class
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
            this.updateColor();
        }
        
        updateColor() {
            const colors = isDarkMode() ? darkColors : lightColors;
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
            ctx.fill();
        }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Get background gradient based on theme
    function getBackgroundGradient() {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        
        if (isDarkMode()) {
            // Dark mode: subtle dark gradient
            gradient.addColorStop(0, '#0f172a');
            gradient.addColorStop(0.5, '#1e293b');
            gradient.addColorStop(1, '#334155');
        } else {
            // Light mode: soft light gradient
            gradient.addColorStop(0, '#f8fafc');
            gradient.addColorStop(0.5, '#f1f5f9');
            gradient.addColorStop(1, '#e2e8f0');
        }
        
        return gradient;
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
        
        // Clear with adaptive gradient
        ctx.fillStyle = getBackgroundGradient();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        // Draw connections (optimized)
        ctx.lineWidth = 1;
        const connectionColor = isDarkMode() 
            ? 'rgba(129, 140, 248, OPACITY)' 
            : 'rgba(102, 126, 234, OPACITY)';
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    const opacity = (1 - distance / connectionDistance) * 0.4;
                    ctx.strokeStyle = connectionColor.replace('OPACITY', opacity);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    requestAnimationFrame(animate);
    
    // Listen to theme changes
    const themeObserver = new MutationObserver(() => {
        console.log('🎨 Theme changed, updating particles...');
        particles.forEach(p => p.updateColor());
    });
    
    themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
    
    // Debounced resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas();
            particles.forEach(p => p.reset());
        }, 250);
    });
    
    console.log('✅ Particles initialized with theme support');
    console.log('🎨 Current mode:', isDarkMode() ? 'DARK' : 'LIGHT');
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeParticles);
} else {
    initializeParticles();
}