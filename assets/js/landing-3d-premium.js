/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LANDING-3D-PREMIUM.JS - Objets 3D Spectaculaires
   Portefeuilles, Cartes Bancaires, Graphiques Boursiers 3D
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

class Premium3DScene {
    constructor() {
        this.scenes = [];
        this.isThreeJsAvailable = typeof THREE !== 'undefined';
        
        if (!this.isThreeJsAvailable) {
            console.warn('⚠️ Three.js non disponible - Chargez la bibliothèque Three.js');
            return;
        }
        
        this.init();
    }

    init() {
        console.log('🎨 Création des objets 3D premium...');
        
        // Créer tous les objets 3D spectaculaires
        this.createFloatingWallet();           // Portefeuille 3D dans le hero
        this.createCreditCards();              // Cartes bancaires 3D
        this.createStockChart3D();             // Graphique boursier 3D animé
        this.createFloatingCoins();            // Pièces d'or flottantes
        this.createVault3D();                  // Coffre-fort 3D
        this.createTrophy3D();                 // Trophée 3D
        this.createDollarSigns();              // Symboles $ 3D
        this.createCryptoSymbols();            // Symboles crypto 3D
        this.createAnimatedGraph();            // Graphique animé 3D
        
        // Lancer l'animation
        this.animate();
        
        // Observer les sections pour animer au scroll
        this.setupScrollAnimations();
        
        console.log(`✅ ${this.scenes.length} objets 3D créés !`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💼 PORTEFEUILLE 3D FLOTTANT (Hero Section)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createFloatingWallet() {
        const container = document.querySelector('.hero-visual');
        if (!container) return;

        // Créer le conteneur 3D
        const canvas3D = this.create3DContainer(container, {
            width: 400,
            height: 400,
            position: 'absolute',
            top: '10%',
            right: '5%',
            zIndex: 10
        });

        const { scene, camera, renderer } = this.setupScene(canvas3D, 400, 400);
        
        // Créer le portefeuille
        const wallet = this.buildWallet();
        scene.add(wallet);

        // Lumières
        this.addLights(scene);

        // Position de la caméra
        camera.position.set(3, 2, 5);
        camera.lookAt(0, 0, 0);

        this.scenes.push({
            scene,
            camera,
            renderer,
            object: wallet,
            canvas: canvas3D,
            animation: 'float',
            speed: 0.005
        });
    }

    buildWallet() {
        const group = new THREE.Group();

        // Corps principal du portefeuille
        const bodyGeometry = new THREE.BoxGeometry(2, 1.2, 0.3);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.3,
            metalness: 0.7
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);

        // Détails - bande décorative
        const stripeGeometry = new THREE.BoxGeometry(2.05, 0.2, 0.31);
        const stripeMaterial = new THREE.MeshStandardMaterial({
            color: 0x3498db,
            roughness: 0.2,
            metalness: 0.8
        });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.y = 0.3;
        group.add(stripe);

        // Logo/emblème
        const logoGeometry = new THREE.CircleGeometry(0.2, 32);
        const logoMaterial = new THREE.MeshStandardMaterial({
            color: 0xf39c12,
            roughness: 0.1,
            metalness: 0.9
        });
        const logo = new THREE.Mesh(logoGeometry, logoMaterial);
        logo.position.set(0.6, 0.3, 0.16);
        group.add(logo);

        // Ombres
        body.castShadow = true;
        stripe.castShadow = true;

        return group;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💳 CARTES BANCAIRES 3D (Features Section)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createCreditCards() {
        const featuresSection = document.querySelector('.features-section');
        if (!featuresSection) return;

        const canvas3D = this.create3DContainer(featuresSection, {
            width: 500,
            height: 500,
            position: 'absolute',
            top: '20%',
            left: '5%',
            zIndex: 1,
            pointerEvents: 'none'
        });

        const { scene, camera, renderer } = this.setupScene(canvas3D, 500, 500);

        // Créer plusieurs cartes en éventail
        const cardsGroup = new THREE.Group();
        
        const cardColors = [0x3B82F6, 0x8B5CF6, 0x10B981, 0xF59E0B];
        
        for (let i = 0; i < 4; i++) {
            const card = this.buildCreditCard(cardColors[i]);
            card.position.set(0, i * 0.05, -i * 0.1);
            card.rotation.z = (i - 1.5) * 0.15;
            cardsGroup.add(card);
        }

        scene.add(cardsGroup);
        this.addLights(scene);

        camera.position.set(0, 2, 5);
        camera.lookAt(0, 0, 0);

        this.scenes.push({
            scene,
            camera,
            renderer,
            object: cardsGroup,
            canvas: canvas3D,
            animation: 'rotate',
            speed: 0.003
        });
    }

    buildCreditCard(color) {
        const group = new THREE.Group();

        // Corps de la carte
        const cardGeometry = new THREE.BoxGeometry(3, 1.8, 0.05);
        const cardMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.2,
            metalness: 0.8
        });
        const card = new THREE.Mesh(cardGeometry, cardMaterial);
        card.castShadow = true;
        group.add(card);

        // Puce
        const chipGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.06);
        const chipMaterial = new THREE.MeshStandardMaterial({
            color: 0xf39c12,
            roughness: 0.1,
            metalness: 0.9
        });
        const chip = new THREE.Mesh(chipGeometry, chipMaterial);
        chip.position.set(-0.8, 0.3, 0.03);
        group.add(chip);

        // Bande magnétique
        const stripeGeometry = new THREE.BoxGeometry(3.02, 0.4, 0.01);
        const stripeMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.3
        });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.set(0, 0.5, -0.03);
        group.add(stripe);

        // Logo (cercles)
        const logo1Geometry = new THREE.CircleGeometry(0.15, 32);
        const logo1Material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2,
            transparent: true,
            opacity: 0.9
        });
        const logo1 = new THREE.Mesh(logo1Geometry, logo1Material);
        logo1.position.set(0.9, -0.5, 0.026);
        group.add(logo1);

        const logo2 = logo1.clone();
        logo2.position.x = 1.15;
        group.add(logo2);

        return group;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 GRAPHIQUE BOURSIER 3D ANIMÉ (Demo Section)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createStockChart3D() {
        const demoSection = document.querySelector('.demo-interactive');
        if (!demoSection) return;

        const canvas3D = this.create3DContainer(demoSection, {
            width: 600,
            height: 400,
            position: 'absolute',
            top: '10%',
            right: '2%',
            zIndex: 1,
            pointerEvents: 'none'
        });

        const { scene, camera, renderer } = this.setupScene(canvas3D, 600, 400);

        const chart = this.buildStockChart();
        scene.add(chart);

        this.addLights(scene);

        camera.position.set(8, 6, 10);
        camera.lookAt(0, 0, 0);

        this.scenes.push({
            scene,
            camera,
            renderer,
            object: chart,
            canvas: canvas3D,
            animation: 'pulse',
            speed: 0.01
        });
    }

    buildStockChart() {
        const group = new THREE.Group();

        // Base du graphique
        const baseGeometry = new THREE.BoxGeometry(8, 0.1, 4);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.3,
            metalness: 0.7
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -0.05;
        group.add(base);

        // Barres du graphique (valeurs croissantes)
        const heights = [0.5, 0.8, 1.2, 1.8, 2.5, 3.2, 4.0, 4.5];
        const colors = [0x3B82F6, 0x4F8BF9, 0x6494FC, 0x789DFF, 0x8DA6FF, 0xA1AFFF, 0xB5B8FF, 0xC9C1FF];

        for (let i = 0; i < heights.length; i++) {
            const barGeometry = new THREE.BoxGeometry(0.6, heights[i], 0.6);
            const barMaterial = new THREE.MeshStandardMaterial({
                color: colors[i],
                roughness: 0.2,
                metalness: 0.8,
                emissive: colors[i],
                emissiveIntensity: 0.2
            });
            const bar = new THREE.Mesh(barGeometry, barMaterial);
            bar.position.set((i - 3.5) * 1, heights[i] / 2, 0);
            bar.castShadow = true;
            bar.userData.initialHeight = heights[i];
            bar.userData.index = i;
            group.add(bar);
        }

        return group;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🪙 PIÈCES D'OR FLOTTANTES (Solutions Section)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createFloatingCoins() {
        const solutionsSection = document.querySelector('.solutions-section');
        if (!solutionsSection) return;

        const canvas3D = this.create3DContainer(solutionsSection, {
            width: 500,
            height: 500,
            position: 'absolute',
            top: '15%',
            right: '5%',
            zIndex: 1,
            pointerEvents: 'none'
        });

        const { scene, camera, renderer } = this.setupScene(canvas3D, 500, 500);

        const coinsGroup = new THREE.Group();

        // Créer plusieurs pièces à différentes positions
        for (let i = 0; i < 10; i++) {
            const coin = this.buildCoin();
            coin.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 4
            );
            coin.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            coin.userData.speedX = (Math.random() - 0.5) * 0.02;
            coin.userData.speedY = (Math.random() - 0.5) * 0.01;
            coinsGroup.add(coin);
        }

        scene.add(coinsGroup);
        this.addLights(scene);

        camera.position.z = 10;

        this.scenes.push({
            scene,
            camera,
            renderer,
            object: coinsGroup,
            canvas: canvas3D,
            animation: 'coins',
            speed: 0.02
        });
    }

    buildCoin() {
        const group = new THREE.Group();

        // Corps de la pièce
        const coinGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
        const coinMaterial = new THREE.MeshStandardMaterial({
            color: 0xf39c12,
            roughness: 0.2,
            metalness: 0.9,
            emissive: 0xf39c12,
            emissiveIntensity: 0.3
        });
        const coin = new THREE.Mesh(coinGeometry, coinMaterial);
        coin.castShadow = true;
        group.add(coin);

        // Symbole $ sur la pièce
        const symbolGeometry = new THREE.RingGeometry(0.2, 0.25, 32);
        const symbolMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            roughness: 0.1,
            metalness: 1.0
        });
        const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
        symbol.position.z = 0.06;
        symbol.rotation.x = Math.PI / 2;
        group.add(symbol);

        return group;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔒 COFFRE-FORT 3D (Pricing Section)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createVault3D() {
        const pricingSection = document.querySelector('.pricing-section');
        if (!pricingSection) return;

        const canvas3D = this.create3DContainer(pricingSection, {
            width: 400,
            height: 400,
            position: 'absolute',
            top: '10%',
            left: '5%',
            zIndex: 1,
            pointerEvents: 'none'
        });

        const { scene, camera, renderer } = this.setupScene(canvas3D, 400, 400);

        const vault = this.buildVault();
        scene.add(vault);

        this.addLights(scene);

        camera.position.set(3, 3, 5);
        camera.lookAt(0, 0, 0);

        this.scenes.push({
            scene,
            camera,
            renderer,
            object: vault,
            canvas: canvas3D,
            animation: 'rotate',
            speed: 0.005
        });
    }

    buildVault() {
        const group = new THREE.Group();

        // Corps du coffre
        const bodyGeometry = new THREE.BoxGeometry(2, 2.5, 1.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.3,
            metalness: 0.9
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);

        // Porte
        const doorGeometry = new THREE.BoxGeometry(1.8, 2.3, 0.1);
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: 0x34495e,
            roughness: 0.2,
            metalness: 0.8
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.z = 0.76;
        group.add(door);

        // Cadran
        const dialGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 32);
        const dialMaterial = new THREE.MeshStandardMaterial({
            color: 0x95a5a6,
            roughness: 0.1,
            metalness: 1.0
        });
        const dial = new THREE.Mesh(dialGeometry, dialMaterial);
        dial.rotation.x = Math.PI / 2;
        dial.position.set(0, 0, 0.85);
        group.add(dial);

        // Marques sur le cadran
        for (let i = 0; i < 12; i++) {
            const markGeometry = new THREE.BoxGeometry(0.05, 0.15, 0.05);
            const markMaterial = new THREE.MeshStandardMaterial({
                color: 0xf39c12,
                roughness: 0.2,
                metalness: 0.8
            });
            const mark = new THREE.Mesh(markGeometry, markMaterial);
            const angle = (i / 12) * Math.PI * 2;
            mark.position.set(
                Math.cos(angle) * 0.35,
                Math.sin(angle) * 0.35,
                0.85
            );
            group.add(mark);
        }

        // Poignée
        const handleGeometry = new THREE.TorusGeometry(0.15, 0.05, 16, 32);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0xf39c12,
            roughness: 0.2,
            metalness: 0.9
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0.5, -0.5, 0.85);
        group.add(handle);

        return group;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🏆 TROPHÉE 3D (CTA Section)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createTrophy3D() {
        const ctaSection = document.querySelector('.cta-final');
        if (!ctaSection) return;

        const canvas3D = this.create3DContainer(ctaSection, {
            width: 350,
            height: 350,
            position: 'absolute',
            top: '50%',
            right: '10%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            pointerEvents: 'none'
        });

        const { scene, camera, renderer } = this.setupScene(canvas3D, 350, 350);

        const trophy = this.buildTrophy();
        scene.add(trophy);

        this.addLights(scene);

        camera.position.set(0, 2, 5);
        camera.lookAt(0, 0, 0);

        this.scenes.push({
            scene,
            camera,
            renderer,
            object: trophy,
            canvas: canvas3D,
            animation: 'float',
            speed: 0.008
        });
    }

    buildTrophy() {
        const group = new THREE.Group();

        // Coupe
        const cupGeometry = new THREE.CylinderGeometry(0.8, 0.5, 1.5, 32);
        const cupMaterial = new THREE.MeshStandardMaterial({
            color: 0xf39c12,
            roughness: 0.1,
            metalness: 1.0,
            emissive: 0xf39c12,
            emissiveIntensity: 0.3
        });
        const cup = new THREE.Mesh(cupGeometry, cupMaterial);
        cup.position.y = 1;
        cup.castShadow = true;
        group.add(cup);

        // Anses
        const handleGeometry = new THREE.TorusGeometry(0.4, 0.08, 16, 32, Math.PI);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0xf39c12,
            roughness: 0.1,
            metalness: 1.0
        });
        
        const handle1 = new THREE.Mesh(handleGeometry, handleMaterial);
        handle1.rotation.y = Math.PI / 2;
        handle1.position.set(0.9, 1, 0);
        group.add(handle1);

        const handle2 = new THREE.Mesh(handleGeometry, handleMaterial);
        handle2.rotation.y = -Math.PI / 2;
        handle2.position.set(-0.9, 1, 0);
        group.add(handle2);

        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.6, 0.7, 0.3, 32);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.3,
            metalness: 0.8
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0;
        group.add(base);

        // Étoile au sommet
        const starGeometry = new THREE.SphereGeometry(0.15, 32, 32);
        const starMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            roughness: 0.1,
            metalness: 1.0,
            emissive: 0xffd700,
            emissiveIntensity: 0.5
        });
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.y = 1.9;
        group.add(star);

        return group;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💲 SYMBOLES DOLLAR 3D (Tools Section)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createDollarSigns() {
        const toolsSection = document.querySelector('.tools-section');
        if (!toolsSection) return;

        const canvas3D = this.create3DContainer(toolsSection, {
            width: 400,
            height: 400,
            position: 'absolute',
            top: '20%',
            right: '5%',
            zIndex: 1,
            pointerEvents: 'none'
        });

        const { scene, camera, renderer } = this.setupScene(canvas3D, 400, 400);

        const dollarsGroup = new THREE.Group();

        // Créer plusieurs symboles $
        for (let i = 0; i < 5; i++) {
            const dollar = this.buildDollarSign();
            dollar.position.set(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 2
            );
            dollar.rotation.y = Math.random() * Math.PI * 2;
            dollar.userData.speedY = (Math.random() - 0.5) * 0.02;
            dollarsGroup.add(dollar);
        }

        scene.add(dollarsGroup);
        this.addLights(scene);

        camera.position.z = 6;

        this.scenes.push({
            scene,
            camera,
            renderer,
            object: dollarsGroup,
            canvas: canvas3D,
            animation: 'float',
            speed: 0.01
        });
    }

    buildDollarSign() {
        const group = new THREE.Group();

        // Créer le symbole $ avec des formes géométriques
        const material = new THREE.MeshStandardMaterial({
            color: 0x10B981,
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0x10B981,
            emissiveIntensity: 0.3
        });

        // Barre verticale
        const verticalGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.1);
        const vertical = new THREE.Mesh(verticalGeometry, material);
        group.add(vertical);

        // Courbe supérieure (approximée avec un tore)
        const topCurveGeometry = new THREE.TorusGeometry(0.3, 0.08, 16, 32, Math.PI);
        const topCurve = new THREE.Mesh(topCurveGeometry, material);
        topCurve.rotation.z = Math.PI / 2;
        topCurve.position.y = 0.3;
        group.add(topCurve);

        // Courbe inférieure
        const bottomCurveGeometry = new THREE.TorusGeometry(0.3, 0.08, 16, 32, Math.PI);
        const bottomCurve = new THREE.Mesh(bottomCurveGeometry, material);
        bottomCurve.rotation.z = -Math.PI / 2;
        bottomCurve.position.y = -0.3;
        group.add(bottomCurve);

        group.castShadow = true;

        return group;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ₿ SYMBOLES CRYPTO 3D
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createCryptoSymbols() {
        const hero = document.querySelector('.hero-bg');
        if (!hero) return;

        const canvas3D = this.create3DContainer(hero, {
            width: 300,
            height: 300,
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            zIndex: 2,
            pointerEvents: 'none'
        });

        const { scene, camera, renderer } = this.setupScene(canvas3D, 300, 300);

        const cryptoGroup = new THREE.Group();

        // Bitcoin symbol
        const bitcoin = this.buildBitcoinSymbol();
        bitcoin.position.set(-1, 0, 0);
        cryptoGroup.add(bitcoin);

        // Ethereum symbol
        const ethereum = this.buildEthereumSymbol();
        ethereum.position.set(1, 0, 0);
        cryptoGroup.add(ethereum);

        scene.add(cryptoGroup);
        this.addLights(scene);

        camera.position.z = 4;

        this.scenes.push({
            scene,
            camera,
            renderer,
            object: cryptoGroup,
            canvas: canvas3D,
            animation: 'rotate',
            speed: 0.01
        });
    }

    buildBitcoinSymbol() {
        const group = new THREE.Group();

        // Pièce
        const coinGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.15, 32);
        const coinMaterial = new THREE.MeshStandardMaterial({
            color: 0xf7931a,
            roughness: 0.2,
            metalness: 0.9,
            emissive: 0xf7931a,
            emissiveIntensity: 0.3
        });
        const coin = new THREE.Mesh(coinGeometry, coinMaterial);
        coin.rotation.x = Math.PI / 2;
        coin.castShadow = true;
        group.add(coin);

        // Symbole B (simplifié)
        const bGeometry = new THREE.TorusGeometry(0.25, 0.05, 16, 32);
        const bMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 1.0
        });
        const b = new THREE.Mesh(bGeometry, bMaterial);
        b.position.z = 0.08;
        group.add(b);

        return group;
    }

    buildEthereumSymbol() {
        const group = new THREE.Group();

        // Pièce
        const coinGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.15, 32);
        const coinMaterial = new THREE.MeshStandardMaterial({
            color: 0x627eea,
            roughness: 0.2,
            metalness: 0.9,
            emissive: 0x627eea,
            emissiveIntensity: 0.3
        });
        const coin = new THREE.Mesh(coinGeometry, coinMaterial);
        coin.rotation.x = Math.PI / 2;
        coin.castShadow = true;
        group.add(coin);

        // Symbole ETH (losange)
        const diamondGeometry = new THREE.ConeGeometry(0.25, 0.4, 4);
        const diamondMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 1.0
        });
        const diamond = new THREE.Mesh(diamondGeometry, diamondMaterial);
        diamond.position.z = 0.08;
        diamond.rotation.z = Math.PI / 4;
        group.add(diamond);

        return group;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📈 GRAPHIQUE ANIMÉ 3D (avec barres qui montent)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createAnimatedGraph() {
        const trustedSection = document.querySelector('.trusted-by');
        if (!trustedSection) return;

        const canvas3D = this.create3DContainer(trustedSection, {
            width: 400,
            height: 300,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
            pointerEvents: 'none',
            opacity: 0.3
        });

        const { scene, camera, renderer } = this.setupScene(canvas3D, 400, 300);

        const graph = this.buildAnimatedGraph();
        scene.add(graph);

        this.addLights(scene);

        camera.position.set(5, 4, 8);
        camera.lookAt(0, 1, 0);

        this.scenes.push({
            scene,
            camera,
            renderer,
            object: graph,
            canvas: canvas3D,
            animation: 'growth',
            speed: 0.02
        });
    }

    buildAnimatedGraph() {
        const group = new THREE.Group();

        // Créer des barres qui vont "grandir"
        for (let i = 0; i < 6; i++) {
            const targetHeight = 1 + i * 0.4;
            const barGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
            const barMaterial = new THREE.MeshStandardMaterial({
                color: 0x3B82F6,
                roughness: 0.2,
                metalness: 0.8,
                emissive: 0x3B82F6,
                emissiveIntensity: 0.2
            });
            const bar = new THREE.Mesh(barGeometry, barMaterial);
            bar.position.set((i - 2.5) * 0.8, 0.05, 0);
            bar.userData.targetHeight = targetHeight;
            bar.userData.currentHeight = 0.1;
            bar.userData.growing = true;
            bar.castShadow = true;
            group.add(bar);
        }

        return group;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔧 HELPERS - Configuration de scène
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    create3DContainer(parent, styles) {
        const container = document.createElement('div');
        container.className = 'threejs-container';
        
        Object.assign(container.style, {
            position: styles.position || 'absolute',
            width: styles.width + 'px',
            height: styles.height + 'px',
            top: styles.top || '0',
            left: styles.left || 'auto',
            right: styles.right || 'auto',
            bottom: styles.bottom || 'auto',
            transform: styles.transform || 'none',
            zIndex: styles.zIndex || 1,
            pointerEvents: styles.pointerEvents || 'none',
            opacity: styles.opacity || 1
        });

        parent.style.position = 'relative';
        parent.appendChild(container);

        const canvas = document.createElement('canvas');
        container.appendChild(canvas);

        return canvas;
    }

    setupScene(canvas, width, height) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true
        });

        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        return { scene, camera, renderer };
    }

    addLights(scene) {
        // Lumière ambiante
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        // Lumière directionnelle principale
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        scene.add(directionalLight);

        // Lumière d'accentuation
        const accentLight = new THREE.PointLight(0x3B82F6, 0.5, 100);
        accentLight.position.set(-5, 3, -5);
        scene.add(accentLight);

        // Lumière d'accentuation 2
        const accentLight2 = new THREE.PointLight(0x8B5CF6, 0.5, 100);
        accentLight2.position.set(5, -3, 5);
        scene.add(accentLight2);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎬 SYSTÈME D'ANIMATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    animate() {
        requestAnimationFrame(() => this.animate());

        this.scenes.forEach(sceneData => {
            const { scene, camera, renderer, object, animation, speed } = sceneData;

            if (!object) return;

            switch (animation) {
                case 'float':
                    // Animation de flottement
                    object.position.y = Math.sin(Date.now() * speed) * 0.3;
                    object.rotation.y += speed;
                    break;

                case 'rotate':
                    // Rotation simple
                    object.rotation.y += speed;
                    object.rotation.x += speed * 0.5;
                    break;

                case 'pulse':
                    // Pulsation (graphique boursier)
                    const pulse = Math.sin(Date.now() * speed) * 0.1 + 1;
                    object.children.forEach((bar, index) => {
                        if (bar.userData.initialHeight) {
                            bar.scale.y = pulse;
                        }
                    });
                    object.rotation.y += speed * 0.5;
                    break;

                case 'coins':
                    // Animation des pièces
                    object.children.forEach(coin => {
                        coin.rotation.y += 0.02;
                        coin.rotation.x += coin.userData.speedX;
                        coin.position.y += coin.userData.speedY;

                        // Réinitialiser si hors limites
                        if (coin.position.y > 3) coin.position.y = -3;
                        if (coin.position.y < -3) coin.position.y = 3;
                    });
                    break;

                case 'growth':
                    // Animation de croissance des barres
                    object.children.forEach(bar => {
                        if (bar.userData.growing && bar.userData.currentHeight < bar.userData.targetHeight) {
                            bar.userData.currentHeight += 0.02;
                            bar.scale.y = bar.userData.currentHeight / 0.1;
                            bar.position.y = bar.userData.currentHeight / 2;

                            if (bar.userData.currentHeight >= bar.userData.targetHeight) {
                                bar.userData.growing = false;
                                setTimeout(() => {
                                    bar.userData.currentHeight = 0.1;
                                    bar.userData.growing = true;
                                }, 2000);
                            }
                        }
                    });
                    break;
            }

            renderer.render(scene, camera);
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👀 ANIMATIONS AU SCROLL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'scale(1)';
                } else {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'scale(0.8)';
                }
            });
        }, {
            threshold: 0.2
        });

        // Observer tous les conteneurs 3D
        document.querySelectorAll('.threejs-container').forEach(container => {
            container.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            container.style.opacity = '0';
            container.style.transform = 'scale(0.8)';
            observer.observe(container);
        });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 INITIALISATION AUTO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Attendre que Three.js soit chargé
function initPremium3D() {
    if (typeof THREE !== 'undefined') {
        window.premium3DScene = new Premium3DScene();
        console.log('%c🎨 Objets 3D Premium chargés !', 'background: #10b981; color: white; padding: 10px; font-weight: bold;');
    } else {
        console.warn('⚠️ Three.js non disponible - Les objets 3D ne seront pas affichés');
    }
}

// Lancer au chargement de la page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPremium3D);
} else {
    initPremium3D();
}