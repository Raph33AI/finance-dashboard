/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LANDING.JS - GSAP PREMIUM EDITION
   Version COMPLÈTE avec GSAP + Three.js + AnimXYZ
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 CONFIGURATION GLOBALE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const APP_CONFIG = {
    navScrollThreshold: 50,
    smoothScrollOffset: 80,
    chartAnimationDuration: 2000,
    numberAnimationDuration: 2000,
    throttleDelay: 100,
    debounceDelay: 300
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 UTILITY FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 GSAP ANIMATIONS MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class GSAPAnimationsManager {
    constructor() {
        this.isGsapAvailable = typeof gsap !== 'undefined';
        
        if (!this.isGsapAvailable) {
            console.warn('⚠️ GSAP non disponible - Animations désactivées');
            return;
        }
        
        console.log('🎬 GSAP Animations Manager - Initialisation...');
        this.init();
    }

    init() {
        // Register GSAP plugins
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            console.log('✅ ScrollTrigger enregistré');
        }
        
        if (typeof TextPlugin !== 'undefined') {
            gsap.registerPlugin(TextPlugin);
            console.log('✅ TextPlugin enregistré');
        }

        // Initialize all animations
        this.heroAnimations();
        this.statsCardsAnimations();
        this.dashboardAnimations();
        this.featuresAnimations();
        this.sectionAnimations();
        this.parallaxEffects();
        
        console.log('✅ Toutes les animations GSAP initialisées');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 HERO SECTION ANIMATIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    heroAnimations() {
        const timeline = gsap.timeline({ delay: 0.3 });

        // Title animation
        timeline.from('.gsap-hero-title', {
            duration: 1,
            y: 100,
            opacity: 0,
            ease: 'power4.out',
            onComplete: () => {
                // Ajouter l'animation de lévitation
                gsap.to('.gsap-hero-title', {
                    y: -10,
                    duration: 3,
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: -1
                });
            }
        });

        // Subtitle animation
        timeline.from('.gsap-hero-subtitle', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: 'power3.out'
        }, '-=0.5');

        // CTA buttons
        timeline.from('.gsap-hero-cta .btn-hero-primary', {
            duration: 0.6,
            scale: 0,
            opacity: 0,
            ease: 'back.out(2)'
        }, '-=0.3');

        // Social proof
        timeline.from('.gsap-social-proof', {
            duration: 0.8,
            y: 20,
            opacity: 0,
            ease: 'power2.out'
        }, '-=0.4');

        console.log('✅ Hero animations configurées');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 STATS CARDS ANIMATIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    statsCardsAnimations() {
        const cards = gsap.utils.toArray('.gsap-stat-card');
        
        cards.forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                duration: 0.6,
                y: 50,
                opacity: 0,
                scale: 0.9,
                delay: index * 0.1,
                ease: 'back.out(1.7)',
                onComplete: () => {
                    // Floating animation
                    gsap.to(card, {
                        y: -5,
                        duration: 2 + index * 0.5,
                        ease: 'sine.inOut',
                        yoyo: true,
                        repeat: -1
                    });
                }
            });
        });

        console.log('✅ Stats cards animations configurées');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🖥️ DASHBOARD ANIMATIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    dashboardAnimations() {
        gsap.from('.gsap-dashboard', {
            scrollTrigger: {
                trigger: '.gsap-dashboard',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            duration: 1.2,
            x: 100,
            opacity: 0,
            rotationY: 15,
            transformPerspective: 1000,
            ease: 'power3.out'
        });

        console.log('✅ Dashboard animations configurées');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎨 FEATURES SECTION ANIMATIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    featuresAnimations() {
        // Section tag
        gsap.from('.gsap-section-tag', {
            scrollTrigger: {
                trigger: '.gsap-section',
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.6,
            scale: 0,
            opacity: 0,
            ease: 'back.out(2)'
        });

        // Section title
        gsap.from('.gsap-section-title', {
            scrollTrigger: {
                trigger: '.gsap-section',
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            y: 50,
            opacity: 0,
            ease: 'power3.out',
            delay: 0.2
        });

        // Section description
        gsap.from('.gsap-section-desc', {
            scrollTrigger: {
                trigger: '.gsap-section',
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: 'power2.out',
            delay: 0.4
        });

        // Feature cards
        const featureCards = gsap.utils.toArray('.gsap-features-grid .feature-card');
        
        featureCards.forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                duration: 0.8,
                y: 80,
                opacity: 0,
                scale: 0.9,
                rotationX: -10,
                delay: index * 0.1,
                ease: 'power3.out'
            });
        });

        console.log('✅ Features animations configurées');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📐 SECTION ANIMATIONS GÉNÉRIQUES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    sectionAnimations() {
        const sections = gsap.utils.toArray('.gsap-section');
        
        sections.forEach(section => {
            gsap.from(section, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                duration: 1,
                y: 50,
                opacity: 0,
                ease: 'power2.out'
            });
        });

        console.log('✅ Sections génériques animées');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌊 PARALLAX EFFECTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    parallaxEffects() {
        // Floating orbs parallax
        gsap.to('.orb-1', {
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            y: -150,
            ease: 'none'
        });

        gsap.to('.orb-2', {
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            y: 150,
            ease: 'none'
        });

        console.log('✅ Parallax effects configurés');
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 THREE.JS - OBJETS 3D VOLUMÉTRIQUES (SUITE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class Landing3DObjects {
    constructor() {
        this.scenes = [];
        this.isThreeJsAvailable = typeof THREE !== 'undefined';
        
        if (!this.isThreeJsAvailable) {
            console.warn('⚠️ Three.js non disponible - Objets 3D désactivés');
            return;
        }
        
        this.init();
    }

    init() {
        console.log('🎨 Initialisation des objets 3D...');
        this.createFeatureIcons3D();
        this.createHeroChart3D();
        this.createCoins3D();
        this.animate();
        console.log('✅ Objets 3D créés:', this.scenes.length);
    }

    createFeatureIcons3D() {
        const featureIcons = document.querySelectorAll('.feature-icon');
        
        featureIcons.forEach((iconContainer, index) => {
            const faIcon = iconContainer.querySelector('i');
            if (faIcon) faIcon.style.display = 'none';
            
            const canvas = document.createElement('canvas');
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            iconContainer.appendChild(canvas);
            
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ 
                canvas, 
                alpha: true, 
                antialias: true 
            });
            
            renderer.setSize(56, 56);
            renderer.setPixelRatio(window.devicePixelRatio);
            camera.position.z = 3;
            
            let object;
            
            switch(index % 8) {
                case 0:
                    object = this.createBrain();
                    break;
                case 1:
                    object = this.createDatabase();
                    break;
                case 2:
                    object = this.createPieChart();
                    break;
                case 3:
                    object = this.createScale();
                    break;
                case 4:
                    object = this.createDice();
                    break;
                case 5:
                    object = this.createBarChart();
                    break;
                case 6:
                    object = this.createLineChart();
                    break;
                case 7:
                    object = this.createDashboard();
                    break;
                default:
                    object = this.createCube();
            }
            
            scene.add(object);
            
            const light1 = new THREE.PointLight(0x4c8aff, 1, 100);
            light1.position.set(5, 5, 5);
            scene.add(light1);
            
            const light2 = new THREE.PointLight(0x8b5cf6, 0.8, 100);
            light2.position.set(-5, -5, 5);
            scene.add(light2);
            
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            
            this.scenes.push({
                scene,
                camera,
                renderer,
                object,
                canvas,
                iconContainer,
                rotationSpeed: 0.01 + Math.random() * 0.01
            });
            
            iconContainer.addEventListener('mouseenter', () => {
                object.userData.hovered = true;
            });
            
            iconContainer.addEventListener('mouseleave', () => {
                object.userData.hovered = false;
            });
        });
    }

    createBrain() {
        const group = new THREE.Group();
        const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x4c8aff,
            shininess: 100,
            specular: 0x8b5cf6
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        group.add(sphere);
        
        for (let i = 0; i < 8; i++) {
            const lobeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const lobe = new THREE.Mesh(lobeGeometry, sphereMaterial);
            const angle = (i / 8) * Math.PI * 2;
            lobe.position.x = Math.cos(angle) * 0.6;
            lobe.position.y = Math.sin(angle) * 0.6;
            lobe.position.z = Math.random() * 0.3;
            group.add(lobe);
        }
        
        return group;
    }

    createDatabase() {
        const group = new THREE.Group();
        const cylinderGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x4c8aff,
            shininess: 100
        });
        
        for (let i = 0; i < 3; i++) {
            const cylinder = new THREE.Mesh(cylinderGeometry, material);
            cylinder.position.y = i * 0.4 - 0.4;
            group.add(cylinder);
        }
        
        return group;
    }

    createPieChart() {
        const group = new THREE.Group();
        const colors = [0x4c8aff, 0x8b5cf6, 0x10b981, 0xf59e0b];
        const segments = 4;
        
        for (let i = 0; i < segments; i++) {
            const geometry = new THREE.CylinderGeometry(
                0.7, 0.7, 0.3, 32, 1, false,
                (i / segments) * Math.PI * 2,
                (Math.PI * 2) / segments
            );
            
            const material = new THREE.MeshPhongMaterial({
                color: colors[i],
                shininess: 100
            });
            
            const segment = new THREE.Mesh(geometry, material);
            const angle = ((i + 0.5) / segments) * Math.PI * 2;
            segment.position.x = Math.cos(angle) * 0.1;
            segment.position.z = Math.sin(angle) * 0.1;
            
            group.add(segment);
        }
        
        return group;
    }

    createScale() {
        const group = new THREE.Group();
        const material = new THREE.MeshPhongMaterial({
            color: 0x4c8aff,
            shininess: 100
        });
        
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.2, 32);
        const base = new THREE.Mesh(baseGeometry, material);
        base.position.y = -0.6;
        group.add(base);
        
        const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 16);
        const pole = new THREE.Mesh(poleGeometry, material);
        pole.position.y = -0.1;
        group.add(pole);
        
        const plateGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32);
        const plate1 = new THREE.Mesh(plateGeometry, material);
        plate1.position.set(-0.5, 0.4, 0);
        group.add(plate1);
        
        const plate2 = new THREE.Mesh(plateGeometry, material);
        plate2.position.set(0.5, 0.4, 0);
        group.add(plate2);
        
        return group;
    }

    createDice() {
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const material = new THREE.MeshPhongMaterial({
            color: 0x4c8aff,
            shininess: 100
        });
        
        return new THREE.Mesh(geometry, material);
    }

    createBarChart() {
        const group = new THREE.Group();
        const material = new THREE.MeshPhongMaterial({
            color: 0x4c8aff,
            shininess: 100
        });
        
        const heights = [0.4, 0.7, 0.5, 0.9, 0.6];
        
        for (let i = 0; i < heights.length; i++) {
            const geometry = new THREE.BoxGeometry(0.15, heights[i], 0.15);
            const bar = new THREE.Mesh(geometry, material);
            bar.position.x = (i - 2) * 0.25;
            bar.position.y = heights[i] / 2 - 0.5;
            group.add(bar);
        }
        
        return group;
    }

    createLineChart() {
        const group = new THREE.Group();
        const material = new THREE.MeshPhongMaterial({
            color: 0x4c8aff,
            shininess: 100
        });
        
        const points = [
            new THREE.Vector3(-0.6, -0.3, 0),
            new THREE.Vector3(-0.3, 0.1, 0),
            new THREE.Vector3(0, -0.1, 0),
            new THREE.Vector3(0.3, 0.4, 0),
            new THREE.Vector3(0.6, 0.2, 0)
        ];
        
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
        const line = new THREE.Mesh(tubeGeometry, material);
        group.add(line);
        
        points.forEach(point => {
            const sphereGeometry = new THREE.SphereGeometry(0.08, 16, 16);
            const sphere = new THREE.Mesh(sphereGeometry, material);
            sphere.position.copy(point);
            group.add(sphere);
        });
        
        return group;
    }

    createDashboard() {
        const group = new THREE.Group();
        const material = new THREE.MeshPhongMaterial({
            color: 0x4c8aff,
            shininess: 100
        });
        
        const screenGeometry = new THREE.BoxGeometry(1, 0.6, 0.05);
        const screen = new THREE.Mesh(screenGeometry, material);
        group.add(screen);
        
        const baseGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32);
        const base = new THREE.Mesh(baseGeometry, material);
        base.position.y = -0.35;
        group.add(base);
        
        return group;
    }

    createCube() {
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const material = new THREE.MeshPhongMaterial({
            color: 0x4c8aff,
            shininess: 100
        });
        
        return new THREE.Mesh(geometry, material);
    }

    createHeroChart3D() {
        const chartArea = document.querySelector('.mockup-chart-area');
        if (!chartArea) return;
        
        const threeDContainer = document.createElement('div');
        threeDContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            opacity: 0.3;
        `;
        chartArea.style.position = 'relative';
        chartArea.appendChild(threeDContainer);
        
        const canvas = document.createElement('canvas');
        threeDContainer.appendChild(canvas);
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            50, 
            chartArea.offsetWidth / chartArea.offsetHeight, 
            0.1, 
            1000
        );
        
        const renderer = new THREE.WebGLRenderer({ 
            canvas, 
            alpha: true, 
            antialias: true 
        });
        
        renderer.setSize(chartArea.offsetWidth, chartArea.offsetHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        camera.position.set(5, 3, 5);
        camera.lookAt(0, 0, 0);
        
        const group = new THREE.Group();
        
        const data = [2.4, 2.52, 2.68, 2.75, 2.82, 2.847];
        const material = new THREE.MeshPhongMaterial({
            color: 0x4c8aff,
            shininess: 100,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < data.length; i++) {
            const height = data[i];
            const geometry = new THREE.BoxGeometry(0.3, height, 0.3);
            const bar = new THREE.Mesh(geometry, material);
            bar.position.x = (i - 2.5) * 0.5;
            bar.position.y = height / 2;
            group.add(bar);
        }
        
        scene.add(group);
        
        const light1 = new THREE.DirectionalLight(0xffffff, 1);
        light1.position.set(5, 5, 5);
        scene.add(light1);
        
        const light2 = new THREE.DirectionalLight(0x8b5cf6, 0.5);
        light2.position.set(-5, 3, -5);
        scene.add(light2);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);
        
        this.scenes.push({
            scene,
            camera,
            renderer,
            object: group,
            canvas,
            isChart: true,
            rotationSpeed: 0.005
        });
    }

    createCoins3D() {
        const hero = document.querySelector('.hero-bg');
        if (!hero) return;
        
        const coinsContainer = document.createElement('div');
        coinsContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        hero.appendChild(coinsContainer);
        
        for (let i = 0; i < 5; i++) {
            const coinCanvas = document.createElement('canvas');
            coinCanvas.style.cssText = `
                position: absolute;
                width: 80px;
                height: 80px;
                left: ${20 + i * 15}%;
                top: ${30 + (i % 2) * 20}%;
            `;
            coinsContainer.appendChild(coinCanvas);
            
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ 
                canvas: coinCanvas, 
                alpha: true, 
                antialias: true 
            });
            
            renderer.setSize(80, 80);
            renderer.setPixelRatio(window.devicePixelRatio);
            camera.position.z = 3;
            
            const coinGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 32);
            const coinMaterial = new THREE.MeshPhongMaterial({
                color: 0xf59e0b,
                shininess: 100,
                specular: 0xfbbf24
            });
            
            const coin = new THREE.Mesh(coinGeometry, coinMaterial);
            coin.rotation.x = Math.PI / 2;
            scene.add(coin);
            
            const light = new THREE.PointLight(0xffffff, 1, 100);
            light.position.set(2, 2, 2);
            scene.add(light);
            
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            
            this.scenes.push({
                scene,
                camera,
                renderer,
                object: coin,
                canvas: coinCanvas,
                isCoin: true,
                speed: 0.01 + Math.random() * 0.02
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.scenes.forEach(({ scene, camera, renderer, object, isCoin, isChart, speed, rotationSpeed }) => {
            if (object) {
                if (isCoin) {
                    object.rotation.y += speed;
                    object.rotation.z += speed * 0.5;
                } else if (isChart) {
                    object.rotation.y += rotationSpeed || 0.005;
                } else {
                    const baseSpeed = rotationSpeed || 0.01;
                    object.rotation.x += baseSpeed;
                    object.rotation.y += baseSpeed;
                    
                    if (object.userData.hovered) {
                        object.rotation.x += baseSpeed * 2;
                        object.rotation.y += baseSpeed * 2;
                        object.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
                    } else {
                        object.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
                    }
                }
            }
            
            renderer.render(scene, camera);
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧭 NAVIGATION MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class NavigationManager {
    constructor() {
        this.nav = document.getElementById('landingNav');
        this.lastScrollTop = 0;
        this.init();
    }

    init() {
        if (!this.nav) return;
        
        window.addEventListener('scroll', throttle(() => {
            this.handleScroll();
        }, APP_CONFIG.throttleDelay));
        
        this.handleScroll();
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > APP_CONFIG.navScrollThreshold) {
            this.nav.classList.add('scrolled');
        } else {
            this.nav.classList.remove('scrolled');
        }
        
        this.lastScrollTop = scrollTop;
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 MOBILE MENU MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class MobileMenuManager {
    constructor() {
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        if (!this.mobileMenuBtn || !this.navMenu) return;

        this.mobileMenuBtn.addEventListener('click', () => {
            this.toggleMenu();
        });

        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        document.addEventListener('click', (e) => {
            if (!this.navMenu.contains(e.target) && !this.mobileMenuBtn.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.mobileMenuBtn.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        
        if (this.navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    closeMenu() {
        this.mobileMenuBtn.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👤 USER MENU MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class UserMenuManager {
    constructor() {
        this.profileButton = document.getElementById('userProfileButton');
        this.dropdownMenu = document.getElementById('userDropdownMenu');
        this.logoutButton = document.getElementById('logoutButton');
        this.settingsLink = document.getElementById('settingsLink');
        this.init();
    }

    init() {
        if (!this.profileButton || !this.dropdownMenu) return;

        this.profileButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleDropdown();
        }, true);

        document.addEventListener('click', (e) => {
            if (this.profileButton.contains(e.target)) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDropdown();
                return;
            }
            
            if (!this.dropdownMenu.contains(e.target)) {
                if (this.dropdownMenu.classList.contains('active')) {
                    this.closeDropdown();
                }
            }
        });

        if (this.logoutButton) {
            this.logoutButton.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        if (this.settingsLink) {
            this.settingsLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'settings.html';
            });
        }
    }

    toggleDropdown() {
        const isExpanded = this.profileButton.getAttribute('aria-expanded') === 'true';
        const newState = !isExpanded;
        
        this.profileButton.setAttribute('aria-expanded', newState);
        this.dropdownMenu.classList.toggle('active');
        
        const chevron = this.profileButton.querySelector('.user-dropdown-icon');
        if (chevron) {
            chevron.style.transform = newState ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }

    closeDropdown() {
        if (!this.dropdownMenu.classList.contains('active')) return;
        
        this.profileButton.setAttribute('aria-expanded', 'false');
        this.dropdownMenu.classList.remove('active');
        
        const chevron = this.profileButton.querySelector('.user-dropdown-icon');
        if (chevron) {
            chevron.style.transform = 'rotate(0deg)';
        }
    }

    handleLogout() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signOut()
                .then(() => {
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error('Erreur déconnexion:', error);
                });
        } else {
            window.location.href = 'index.html';
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 AUTH STATE MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class AuthStateManager {
    constructor() {
        this.navCtaLoggedOut = document.getElementById('navCtaLoggedOut');
        this.navCtaLoggedIn = document.getElementById('navCtaLoggedIn');
        this.init();
    }

    init() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                this.updateUIForUser(user);
            });
        } else {
            this.showLoggedOutState();
        }
    }

    updateUIForUser(user) {
        if (user) {
            this.showLoggedInState(user);
        } else {
            this.showLoggedOutState();
        }
    }

    showLoggedInState(user) {
        if (this.navCtaLoggedOut) this.navCtaLoggedOut.style.display = 'none';
        if (this.navCtaLoggedIn) this.navCtaLoggedIn.style.display = 'flex';

        const displayName = user.displayName || user.email?.split('@')[0] || 'User';
        const userDisplayNameElements = document.querySelectorAll('#userDisplayName, #dropdownUserName');
        userDisplayNameElements.forEach(el => {
            if (el) el.textContent = displayName;
        });

        const userEmailElements = document.querySelectorAll('#dropdownUserEmail');
        userEmailElements.forEach(el => {
            if (el) el.textContent = user.email || '';
        });

        const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3B82F6&color=fff&bold=true&size=96`;
        const avatarElements = document.querySelectorAll('#userAvatarImg, #dropdownAvatarImg');
        avatarElements.forEach(el => {
            if (el) el.src = avatarUrl;
        });
    }

    showLoggedOutState() {
        if (this.navCtaLoggedOut) this.navCtaLoggedOut.style.display = 'flex';
        if (this.navCtaLoggedIn) this.navCtaLoggedIn.style.display = 'none';
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 GRAPHIQUE BOURSIER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class HeroChartManager {
    constructor() {
        this.canvas = document.getElementById('stockChart');
        this.chart = null;
        this.currentPeriod = '1d';
        
        if (!this.canvas) return;
        if (typeof Chart === 'undefined') return;
        
        this.init();
    }

    init() {
        this.createChart();
        this.setupTimeframeButtons();
    }

    createChart() {
        const ctx = this.canvas.getContext('2d');
        const data = this.generateStockData(30);
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Price',
                    data: data.prices,
                    borderColor: '#3B82F6',
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
                        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
                        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                        return gradient;
                    },
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#3B82F6',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3,
                    pointHitRadius: 30
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#3B82F6',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                return '$' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                size: 11,
                                weight: '500'
                            },
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 6
                        }
                    },
                    y: {
                        position: 'right',
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                size: 11,
                                weight: '500'
                            },
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            },
                            count: 5
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    generateStockData(days) {
        const labels = [];
        const prices = [];
        const today = new Date();
        let basePrice = 170;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const month = date.toLocaleDateString('en-US', { month: 'short' });
            const day = date.getDate();
            labels.push(`${month} ${day}`);
            
            const change = (Math.random() - 0.4) * 4;
            basePrice += change;
            prices.push(parseFloat(basePrice.toFixed(2)));
        }

        return { labels, prices };
    }

    setupTimeframeButtons() {
        const buttons = document.querySelectorAll('.tf-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const period = btn.getAttribute('data-period');
                this.updateChartData(period);
            });
        });
    }

    updateChartData(period) {
        if (!this.chart) return;

        let days;
        switch(period) {
            case '1d': days = 24; break;
            case '1w': days = 7; break;
            case '1m': days = 30; break;
            case '1y': days = 365; break;
            default: days = 30;
        }

        const newData = this.generateStockData(days);
        this.chart.data.labels = newData.labels;
        this.chart.data.datasets[0].data = newData.prices;
        this.chart.update('active');
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 CTA MANAGER + AUTRES MANAGERS (identiques)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class CTAManager {
    constructor() {
        this.buttons = {
            loginBtn: document.getElementById('loginBtn'),
            signupBtn: document.getElementById('signupBtn'),
            heroGetStarted: document.getElementById('heroGetStarted'),
            finalCTABtn: document.getElementById('finalCTABtn')
        };
        this.init();
    }

    init() {
        if (this.buttons.loginBtn) {
            this.buttons.loginBtn.addEventListener('click', () => {
                window.location.href = 'auth.html';
            });
        }

        [this.buttons.signupBtn, this.buttons.heroGetStarted, this.buttons.finalCTABtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    window.location.href = 'auth.html#signup';
                });
            }
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 APPLICATION INITIALIZATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class LandingApp {
    constructor() {
        this.managers = {};
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeManagers());
        } else {
            this.initializeManagers();
        }
    }

    initializeManagers() {
        console.log('%c🚀 AlphaVault Landing - GSAP Edition', 'color: #3B82F6; font-size: 16px; font-weight: bold;');

        try {
            // GSAP Animations
            this.managers.gsapAnimations = new GSAPAnimationsManager();
            
            // Three.js 3D Objects
            this.managers.threeDObjects = new Landing3DObjects();
            
            // Core Managers
            this.managers.navigation = new NavigationManager();
            this.managers.mobileMenu = new MobileMenuManager();
            this.managers.userMenu = new UserMenuManager();
            this.managers.authState = new AuthStateManager();
            this.managers.heroChart = new HeroChartManager();
            this.managers.cta = new CTAManager();

            console.log('%c✅ Tous les modules chargés !', 'color: #10B981; font-size: 14px; font-weight: bold;');
            console.log('%c🎨 GSAP + Three.js + AnimXYZ activés', 'color: #F59E0B; font-size: 12px;');

        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 LANCEMENT DE L'APPLICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const financeLandingApp = new LandingApp();
window.FinanceLandingApp = financeLandingApp;

console.log('%c✅ Landing Premium initialisé !', 'color: #10B981; font-size: 14px; font-weight: bold;');