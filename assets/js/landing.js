/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LANDING.JS - FinancePro Landing Page Premium 3D
   Version COMPLÈTE avec Three.js Integration
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
// 🎨 THREE.JS - OBJETS 3D VOLUMÉTRIQUES
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
        
        // Créer des objets 3D pour chaque icône de feature-card
        this.createFeatureIcons3D();
        
        // Créer un graphique 3D dans le hero
        this.createHeroChart3D();
        
        // Créer des pièces de monnaie 3D
        this.createCoins3D();
        
        // Animer tous les objets
        this.animate();
        
        console.log('✅ Objets 3D créés:', this.scenes.length);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 CRÉER DES ICÔNES 3D POUR LES FEATURE CARDS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createFeatureIcons3D() {
        const featureIcons = document.querySelectorAll('.feature-icon');
        
        featureIcons.forEach((iconContainer, index) => {
            // Cacher l'icône Font Awesome
            const faIcon = iconContainer.querySelector('i');
            if (faIcon) faIcon.style.display = 'none';
            
            // Créer un canvas pour Three.js
            const canvas = document.createElement('canvas');
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            iconContainer.appendChild(canvas);
            
            // Setup Three.js
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
            
            // Créer différents objets 3D selon l'index
            let object;
            
            switch(index % 8) {
                case 0: // Cerveau (Brain)
                    object = this.createBrain();
                    break;
                case 1: // Base de données (Database)
                    object = this.createDatabase();
                    break;
                case 2: // Graphique circulaire (Pie Chart)
                    object = this.createPieChart();
                    break;
                case 3: // Balance (Scale)
                    object = this.createScale();
                    break;
                case 4: // Dé (Dice)
                    object = this.createDice();
                    break;
                case 5: // Graphique en barres (Bar Chart)
                    object = this.createBarChart();
                    break;
                case 6: // Graphique de ligne
                    object = this.createLineChart();
                    break;
                case 7: // Dashboard
                    object = this.createDashboard();
                    break;
                default:
                    object = this.createCube();
            }
            
            scene.add(object);
            
            // Lumières
            const light1 = new THREE.PointLight(0x4c8aff, 1, 100);
            light1.position.set(5, 5, 5);
            scene.add(light1);
            
            const light2 = new THREE.PointLight(0x8b5cf6, 0.8, 100);
            light2.position.set(-5, -5, 5);
            scene.add(light2);
            
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            
            // Stocker pour animation
            this.scenes.push({
                scene,
                camera,
                renderer,
                object,
                canvas,
                iconContainer,
                rotationSpeed: 0.01 + Math.random() * 0.01
            });
            
            // Interaction hover
            iconContainer.addEventListener('mouseenter', () => {
                object.userData.hovered = true;
            });
            
            iconContainer.addEventListener('mouseleave', () => {
                object.userData.hovered = false;
            });
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧠 CRÉER UN CERVEAU 3D
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createBrain() {
        const group = new THREE.Group();
        
        // Sphère principale
        const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x4c8aff,
            shininess: 100,
            specular: 0x8b5cf6
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        group.add(sphere);
        
        // Ajouter des "lobes" pour faire un cerveau
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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💾 CRÉER UNE BASE DE DONNÉES 3D
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createDatabase() {
        const group = new THREE.Group();
        
        const cylinderGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x4c8aff,
            shininess: 100
        });
        
        // Empiler 3 cylindres
        for (let i = 0; i < 3; i++) {
            const cylinder = new THREE.Mesh(cylinderGeometry, material);
            cylinder.position.y = i * 0.4 - 0.4;
            group.add(cylinder);
        }
        
        return group;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 CRÉER UN GRAPHIQUE CIRCULAIRE 3D
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚖️ CRÉER UNE BALANCE 3D
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createScale() {
        const group = new THREE.Group();
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x4c8aff,
            shininess: 100
        });
        
        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.2, 32);
        const base = new THREE.Mesh(baseGeometry, material);
        base.position.y = -0.6;
        group.add(base);
        
        // Tige
        const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 16);
        const pole = new THREE.Mesh(poleGeometry, material);
        pole.position.y = -0.1;
        group.add(pole);
        
        // Plateaux
        const plateGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32);
        const plate1 = new THREE.Mesh(plateGeometry, material);
        plate1.position.set(-0.5, 0.4, 0);
        group.add(plate1);
        
        const plate2 = new THREE.Mesh(plateGeometry, material);
        plate2.position.set(0.5, 0.4, 0);
        group.add(plate2);
        
        return group;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎲 CRÉER UN DÉ 3D
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createDice() {
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const material = new THREE.MeshPhongMaterial({
            color: 0x4c8aff,
            shininess: 100
        });
        
        const dice = new THREE.Mesh(geometry, material);
        
        // Arrondir les bords
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x8b5cf6, 
            linewidth: 2 
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        dice.add(wireframe);
        
        return dice;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 CRÉER UN GRAPHIQUE EN BARRES 3D
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📈 CRÉER UN GRAPHIQUE DE LIGNE 3D
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createLineChart() {
        const group = new THREE.Group();
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x4c8aff,
            shininess: 100
        });
        
        // Points du graphique
        const points = [
            new THREE.Vector3(-0.6, -0.3, 0),
            new THREE.Vector3(-0.3, 0.1, 0),
            new THREE.Vector3(0, -0.1, 0),
            new THREE.Vector3(0.3, 0.4, 0),
            new THREE.Vector3(0.6, 0.2, 0)
        ];
        
        // Créer une ligne
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
        const line = new THREE.Mesh(tubeGeometry, material);
        group.add(line);
        
        // Ajouter des sphères aux points
        points.forEach(point => {
            const sphereGeometry = new THREE.SphereGeometry(0.08, 16, 16);
            const sphere = new THREE.Mesh(sphereGeometry, material);
            sphere.position.copy(point);
            group.add(sphere);
        });
        
        return group;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🖥️ CRÉER UN DASHBOARD 3D
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createDashboard() {
        const group = new THREE.Group();
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x4c8aff,
            shininess: 100
        });
        
        // Écran
        const screenGeometry = new THREE.BoxGeometry(1, 0.6, 0.05);
        const screen = new THREE.Mesh(screenGeometry, material);
        group.add(screen);
        
        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32);
        const base = new THREE.Mesh(baseGeometry, material);
        base.position.y = -0.35;
        group.add(base);
        
        // Support
        const supportGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.15, 16);
        const support = new THREE.Mesh(supportGeometry, material);
        support.position.y = -0.275;
        group.add(support);
        
        return group;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📦 CRÉER UN CUBE GÉNÉRIQUE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createCube() {
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const material = new THREE.MeshPhongMaterial({
            color: 0x4c8aff,
            shininess: 100
        });
        
        return new THREE.Mesh(geometry, material);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📈 CRÉER UN GRAPHIQUE 3D DANS LE HERO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createHeroChart3D() {
        const chartArea = document.querySelector('.mockup-chart-area');
        if (!chartArea) return;
        
        // Ne pas cacher le canvas Chart.js, créer un conteneur séparé
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
        
        // Créer nouveau canvas
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
        
        // Créer un graphique 3D volumétrique
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
        
        // Lumières
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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💰 CRÉER DES PIÈCES DE MONNAIE 3D
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createCoins3D() {
        const hero = document.querySelector('.hero-bg');
        if (!hero) return;
        
        // Créer un conteneur pour les pièces
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
        
        // Créer 5 pièces flottantes
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
            
            // Créer une pièce (cylindre)
            const coinGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 32);
            const coinMaterial = new THREE.MeshPhongMaterial({
                color: 0xf59e0b,
                shininess: 100,
                specular: 0xfbbf24
            });
            
            const coin = new THREE.Mesh(coinGeometry, coinMaterial);
            coin.rotation.x = Math.PI / 2;
            scene.add(coin);
            
            // Lumières
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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎬 ANIMATION LOOP
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.scenes.forEach(({ scene, camera, renderer, object, isCoin, isChart, speed, rotationSpeed }) => {
            if (object) {
                if (isCoin) {
                    // Rotation continue pour les pièces
                    object.rotation.y += speed;
                    object.rotation.z += speed * 0.5;
                } else if (isChart) {
                    // Rotation lente pour le graphique
                    object.rotation.y += rotationSpeed || 0.005;
                } else {
                    // Rotation normale pour les icônes
                    const baseSpeed = rotationSpeed || 0.01;
                    object.rotation.x += baseSpeed;
                    object.rotation.y += baseSpeed;
                    
                    // Animation hover
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
            e.stopPropagation();
            this.toggleDropdown();
        });

        document.addEventListener('click', (e) => {
            if (!this.dropdownMenu.contains(e.target) && !this.profileButton.contains(e.target)) {
                this.closeDropdown();
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
                console.log('🔧 Redirection vers les paramètres...');
                window.location.href = 'settings.html';
            });
        }
    }

    toggleDropdown() {
        const isExpanded = this.profileButton.getAttribute('aria-expanded') === 'true';
        this.profileButton.setAttribute('aria-expanded', !isExpanded);
        this.dropdownMenu.classList.toggle('active');

        const chevron = this.profileButton.querySelector('.user-dropdown-icon');
        if (chevron) {
            chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    }

    closeDropdown() {
        this.profileButton.setAttribute('aria-expanded', 'false');
        this.dropdownMenu.classList.remove('active');
        
        const chevron = this.profileButton.querySelector('.user-dropdown-icon');
        if (chevron) {
            chevron.style.transform = 'rotate(0deg)';
        }
    }

    handleLogout() {
        console.log('🔓 Déconnexion en cours...');
        
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signOut()
                .then(() => {
                    console.log('✅ Déconnexion réussie');
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error('❌ Erreur lors de la déconnexion:', error);
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
// 📊 GRAPHIQUE BOURSIER - VERSION SIMPLIFIÉE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class HeroChartManager {
    constructor() {
        this.canvas = document.getElementById('stockChart');
        this.chart = null;
        this.currentPeriod = '1d';
        
        console.log('📊 Initialisation du graphique boursier...');
        
        if (!this.canvas) {
            console.error('❌ Canvas #stockChart introuvable');
            return;
        }
        
        if (typeof Chart === 'undefined') {
            console.error('❌ Chart.js non chargé');
            return;
        }
        
        this.init();
    }

    init() {
        console.log('✅ Création du graphique...');
        this.createChart();
        this.setupTimeframeButtons();
    }

    createChart() {
        const ctx = this.canvas.getContext('2d');
        
        // Générer des données réalistes
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

        console.log('✅ Graphique créé avec succès !');
    }

    generateStockData(days) {
        const labels = [];
        const prices = [];
        const today = new Date();
        let basePrice = 170;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Format de date
            const month = date.toLocaleDateString('en-US', { month: 'short' });
            const day = date.getDate();
            labels.push(`${month} ${day}`);
            
            // Générer prix avec tendance haussière
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
                // Retirer active de tous
                buttons.forEach(b => b.classList.remove('active'));
                
                // Ajouter active au bouton cliqué
                btn.classList.add('active');
                
                // Récupérer la période
                const period = btn.getAttribute('data-period');
                this.updateChartData(period);
            });
        });
    }

    updateChartData(period) {
        if (!this.chart) return;

        let days;
        switch(period) {
            case '1d':
                days = 24; // 24 heures
                break;
            case '1w':
                days = 7;
                break;
            case '1m':
                days = 30;
                break;
            case '1y':
                days = 365;
                break;
            default:
                days = 30;
        }

        console.log(`📊 Mise à jour du graphique : ${period} (${days} points)`);

        const newData = this.generateStockData(days);
        this.chart.data.labels = newData.labels;
        this.chart.data.datasets[0].data = newData.prices;
        this.chart.update('active');
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 PRICING MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class PricingManager {
    constructor() {
        this.toggle = document.getElementById('pricingToggle');
        this.priceElements = document.querySelectorAll('.amount[data-monthly][data-annual]');
        this.init();
    }

    init() {
        if (!this.toggle) return;
        this.toggle.addEventListener('change', () => this.updatePrices());
    }

    updatePrices() {
        const isAnnual = this.toggle.checked;
        this.priceElements.forEach(element => {
            const monthlyPrice = element.getAttribute('data-monthly');
            const annualPrice = element.getAttribute('data-annual');
            if (monthlyPrice && annualPrice) {
                element.style.transform = 'scale(0.9)';
                element.style.opacity = '0.5';
                setTimeout(() => {
                    element.textContent = isAnnual ? annualPrice : monthlyPrice;
                    element.style.transform = 'scale(1)';
                    element.style.opacity = '1';
                }, 150);
            }
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 DEMO SEARCH MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class DemoSearchManager {
    constructor() {
        this.searchInput = document.getElementById('companySearch');
        this.resultCards = document.querySelectorAll('.company-result-card');
        this.resultsHeader = document.querySelector('.results-header span:first-child');
        this.init();
    }

    init() {
        if (!this.searchInput) return;
        this.searchInput.addEventListener('input', debounce((e) => {
            this.handleSearch(e.target.value);
        }, APP_CONFIG.debounceDelay));
    }

    handleSearch(searchValue) {
        const query = searchValue.toLowerCase().trim();
        let visibleCount = 0;

        this.resultCards.forEach(card => {
            const companyName = card.querySelector('.company-details h4')?.textContent.toLowerCase() || '';
            const ticker = card.querySelector('.company-details p')?.textContent.toLowerCase() || '';
            const isMatch = companyName.includes(query) || ticker.includes(query) || query === '';

            if (isMatch) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.4s ease forwards';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (this.resultsHeader) {
            this.resultsHeader.textContent = `${visibleCount} comparable compan${visibleCount !== 1 ? 'ies' : 'y'} found`;
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 SCROLL REVEAL MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ScrollRevealManager {
    constructor() {
        this.elements = document.querySelectorAll('[data-aos]');
        this.animatedElements = new Set(); // ✅ Tracker les éléments déjà animés
        this.init();
    }

    init() {
        window.addEventListener('scroll', throttle(() => this.revealOnScroll(), APP_CONFIG.throttleDelay));
        this.revealOnScroll();
    }

    revealOnScroll() {
        this.elements.forEach(element => {
            // ✅ Ne pas animer si déjà animé
            if (this.animatedElements.has(element)) return;

            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < window.innerHeight - 150) {
                element.classList.add('aos-animate');
                this.animatedElements.add(element); // ✅ Marquer comme animé
                
                // ✅ Ajouter la classe "levitate" après l'animation
                setTimeout(() => {
                    element.classList.add('levitate');
                }, 800); // Attendre la fin de l'animation AOS
            }
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔢 NUMBER COUNTER MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class NumberCounterManager {
    constructor() {
        this.numbers = document.querySelectorAll('.proof-number');
        this.animated = false;
        this.init();
    }

    init() {
        if (this.numbers.length === 0) return;
        window.addEventListener('scroll', throttle(() => this.checkAndAnimate(), APP_CONFIG.throttleDelay));
        this.checkAndAnimate();
    }

    checkAndAnimate() {
        if (this.animated || this.numbers.length === 0) return;
        const firstNumber = this.numbers[0];
        const rect = firstNumber.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

        if (isVisible) {
            this.animated = true;
            this.animateNumbers();
        }
    }

    animateNumbers() {
        const targets = [10000, 1000000, 500000];
        this.numbers.forEach((element, index) => {
            if (targets[index]) {
                element.textContent = '0';
                setTimeout(() => {
                    animateValue(element, 0, targets[index], APP_CONFIG.numberAnimationDuration);
                }, index * 200);
            }
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 TILT EFFECT MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TiltEffectManager {
    constructor() {
        this.cards = document.querySelectorAll('.feature-card, .solution-card, .pricing-card');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleTilt(card, e));
            card.addEventListener('mouseleave', () => this.resetTilt(card));
        });
    }

    handleTilt(card, e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px) scale(1.02)`;
    }

    resetTilt(card) {
        card.style.transform = '';
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔗 SMOOTH SCROLL MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SmoothScrollManager {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href && href !== '#' && href.length > 1) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        window.scrollTo({
                            top: target.offsetTop - APP_CONFIG.smoothScrollOffset,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 CTA MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class CTAManager {
    constructor() {
        this.buttons = {
            loginBtn: document.getElementById('loginBtn'),
            signupBtn: document.getElementById('signupBtn'),
            heroGetStarted: document.getElementById('heroGetStarted'),
            heroWatchDemo: document.getElementById('heroWatchDemo'),
            tryDemoBtn: document.getElementById('tryDemoBtn'),
            finalCTABtn: document.getElementById('finalCTABtn'),
            contactSalesBtn: document.getElementById('contactSalesBtn')
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

        [this.buttons.heroWatchDemo, this.buttons.tryDemoBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = 'interactive-demo.html';
                });
            }
        });

        if (this.buttons.contactSalesBtn) {
            this.buttons.contactSalesBtn.addEventListener('click', () => {
                window.location.href = 'contact.html';
            });
        }

        document.querySelectorAll('[data-action="demo"]').forEach(btn => {
            btn.addEventListener('click', () => window.location.href = 'interactive-demo.html');
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 PERFORMANCE MONITOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log(`⚡ Page chargée en ${pageLoadTime}ms`);
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
        console.log('%c🚀 FinancePro Landing - Initialisation...', 'color: #3B82F6; font-size: 14px; font-weight: bold;');

        try {
            // Initialiser tous les managers
            this.managers.navigation = new NavigationManager();
            this.managers.mobileMenu = new MobileMenuManager();
            this.managers.userMenu = new UserMenuManager();
            this.managers.authState = new AuthStateManager();
            this.managers.heroChart = new HeroChartManager();
            this.managers.pricing = new PricingManager();
            this.managers.demoSearch = new DemoSearchManager();
            this.managers.scrollReveal = new ScrollRevealManager();
            this.managers.numberCounter = new NumberCounterManager();
            this.managers.tiltEffect = new TiltEffectManager();
            this.managers.smoothScroll = new SmoothScrollManager();
            this.managers.cta = new CTAManager();
            this.managers.performance = new PerformanceMonitor();

            console.log('%c✅ Tous les modules chargés avec succès!', 'color: #10B981; font-size: 14px; font-weight: bold;');
            console.log('%c💎 Animations prêtes', 'color: #F59E0B; font-size: 12px;');

        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎬 LANCEMENT DE L'APPLICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ✅ Utiliser un nom de variable unique
const financeLandingApp = new LandingApp();

// ✅ Export global pour débogage (optionnel)
window.FinanceLandingApp = financeLandingApp;

console.log('%c✅ Landing page initialized successfully!', 'color: #10B981; font-size: 14px; font-weight: bold;');