// ============================================
// 🤖 ROBOT 3D ULTRA-RÉALISTE
// ============================================

let robot3DScene, robot3DCamera, robot3DRenderer, robot3DModel;
let robotAnimationFrame;
let robotIdle = true;
let robotThinking = false;
let robotTalking = false;

let robotHead, robotEyeLeft, robotEyeRight, robotBody, robotGlasses;
let robotTie, robotLeftArm, robotRightArm;

let mouseX = 0, mouseY = 0;
let introProgress = 0;

function initRobot3D() {
    console.log('🎨 [ROBOT] Initializing ultra-realistic robot...');
    
    const container = document.getElementById('robot-3d-container');
    if (!container) {
        console.error('❌ [ROBOT] Container not found!');
        return;
    }
    
    if (typeof THREE === 'undefined') {
        console.error('❌ [ROBOT] THREE.js not loaded!');
        return;
    }
    
    console.log('✅ [ROBOT] Container found:', container.clientWidth, 'x', container.clientHeight);
    
    if (robot3DRenderer) {
        container.innerHTML = '';
        disposeRobot3D();
    }
    
    try {
        // SCENE
        robot3DScene = new THREE.Scene();
        robot3DScene.background = null;
        
        // CAMERA
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        robot3DCamera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
        robot3DCamera.position.set(0, 1.5, 10);
        robot3DCamera.lookAt(0, 0.5, 0);
        
        // RENDERER
        robot3DRenderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true
        });
        robot3DRenderer.setSize(width, height);
        robot3DRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        robot3DRenderer.shadowMap.enabled = true;
        robot3DRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        robot3DRenderer.toneMapping = THREE.ACESFilmicToneMapping;
        robot3DRenderer.toneMappingExposure = 1.3;
        
        container.appendChild(robot3DRenderer.domElement);
        console.log('✅ [ROBOT] Renderer created');
        
        // LIGHTS
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        robot3DScene.add(ambientLight);
        
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
        mainLight.position.set(8, 12, 8);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        robot3DScene.add(mainLight);
        
        const rimLight = new THREE.DirectionalLight(0x667eea, 1);
        rimLight.position.set(-8, 5, -8);
        robot3DScene.add(rimLight);
        
        const fillLight = new THREE.DirectionalLight(0x8b5cf6, 0.6);
        fillLight.position.set(0, -8, 5);
        robot3DScene.add(fillLight);
        
        // Eye glow
        const eyeGlowLeft = new THREE.PointLight(0x60a5fa, 1.5, 8);
        eyeGlowLeft.position.set(-0.3, 2, 2);
        robot3DScene.add(eyeGlowLeft);
        
        const eyeGlowRight = new THREE.PointLight(0x60a5fa, 1.5, 8);
        eyeGlowRight.position.set(0.3, 2, 2);
        robot3DScene.add(eyeGlowRight);
        
        console.log('✅ [ROBOT] Lights added');
        
        // CREATE ROBOT
        createProfessionalRobot();
        
        // MOUSE TRACKING
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        
        // RESIZE
        window.addEventListener('resize', onRobotResize);
        
        // START ANIMATION
        animateRobot3D();
        
        console.log('✅ [ROBOT] Initialization complete!');
        
    } catch (error) {
        console.error('❌ [ROBOT] Error:', error);
    }
}

function createProfessionalRobot() {
    console.log('🎨 [ROBOT] Creating professional robot model...');
    
    robot3DModel = new THREE.Group();
    
    // ============================================
    // MATERIALS
    // ============================================
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0xf0f4f8,
        metalness: 0.75,
        roughness: 0.2,
        envMapIntensity: 1.5
    });
    
    const bodyDarkMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e3a8a,
        metalness: 0.9,
        roughness: 0.25
    });
    
    const shirtMaterial = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        metalness: 0.1,
        roughness: 0.6
    });
    
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        emissive: 0x3b82f6,
        emissiveIntensity: 3,
        metalness: 0.1,
        roughness: 0.05
    });
    
    const tieMaterial = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        metalness: 0.3,
        roughness: 0.5
    });
    
    const glassesMaterial = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        metalness: 0.95,
        roughness: 0.1
    });
    
    const glassLensMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x60a5fa,
        metalness: 0,
        roughness: 0,
        transmission: 0.8,
        thickness: 0.1,
        opacity: 0.4,
        transparent: true
    });
    
    // ============================================
    // HEAD (Sphère réaliste)
    // ============================================
    const headGeometry = new THREE.SphereGeometry(0.75, 64, 64);
    robotHead = new THREE.Mesh(headGeometry, headMaterial);
    robotHead.position.y = 2.2;
    robotHead.castShadow = true;
    robotHead.receiveShadow = true;
    
    // Head shine
    const headShineGeometry = new THREE.SphereGeometry(0.77, 32, 32, 0, Math.PI);
    const headShineMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    const headShine = new THREE.Mesh(headShineGeometry, headShineMaterial);
    headShine.rotation.x = -0.3;
    robotHead.add(headShine);
    
    robot3DModel.add(robotHead);
    
    // ============================================
    // EYES (Grands et expressifs)
    // ============================================
    const eyeGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    
    robotEyeLeft = new THREE.Mesh(eyeGeometry, eyeMaterial);
    robotEyeLeft.position.set(-0.28, 2.3, 0.6);
    robotEyeLeft.scale.z = 0.7;
    robotEyeLeft.castShadow = true;
    robot3DModel.add(robotEyeLeft);
    
    robotEyeRight = new THREE.Mesh(eyeGeometry, eyeMaterial);
    robotEyeRight.position.set(0.28, 2.3, 0.6);
    robotEyeRight.scale.z = 0.7;
    robotEyeRight.castShadow = true;
    robot3DModel.add(robotEyeRight);
    
    // Eye highlights
    const highlightGeometry = new THREE.SphereGeometry(0.07, 16, 16);
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const highlightLeft = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlightLeft.position.set(-0.09, 0.09, 0.16);
    robotEyeLeft.add(highlightLeft);
    
    const highlightRight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlightRight.position.set(-0.09, 0.09, 0.16);
    robotEyeRight.add(highlightRight);
    
    // Eye glow rings
    const eyeRingGeometry = new THREE.TorusGeometry(0.22, 0.02, 16, 32);
    const eyeRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.5
    });
    
    const eyeRingLeft = new THREE.Mesh(eyeRingGeometry, eyeRingMaterial);
    eyeRingLeft.position.copy(robotEyeLeft.position);
    robot3DModel.add(eyeRingLeft);
    
    const eyeRingRight = new THREE.Mesh(eyeRingGeometry, eyeRingMaterial);
    eyeRingRight.position.copy(robotEyeRight.position);
    robot3DModel.add(eyeRingRight);
    
    // ============================================
    // GLASSES (Lunettes professionnelles)
    // ============================================
    robotGlasses = new THREE.Group();
    
    // Frames
    const lensFrameGeometry = new THREE.TorusGeometry(0.25, 0.02, 16, 32);
    
    const leftFrame = new THREE.Mesh(lensFrameGeometry, glassesMaterial);
    leftFrame.position.set(-0.28, 2.3, 0.65);
    robotGlasses.add(leftFrame);
    
    const rightFrame = new THREE.Mesh(lensFrameGeometry, glassesMaterial);
    rightFrame.position.set(0.28, 2.3, 0.65);
    robotGlasses.add(rightFrame);
    
    // Lenses
    const lensGeometry = new THREE.CircleGeometry(0.24, 32);
    
    const leftLens = new THREE.Mesh(lensGeometry, glassLensMaterial);
    leftLens.position.set(-0.28, 2.3, 0.67);
    robotGlasses.add(leftLens);
    
    const rightLens = new THREE.Mesh(lensGeometry, glassLensMaterial);
    rightLens.position.set(0.28, 2.3, 0.67);
    robotGlasses.add(rightLens);
    
    // Bridge
    const bridgeGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.36, 16);
    const bridge = new THREE.Mesh(bridgeGeometry, glassesMaterial);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 2.3, 0.65);
    robotGlasses.add(bridge);
    
    // Temples
    const templeGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 16);
    
    const leftTemple = new THREE.Mesh(templeGeometry, glassesMaterial);
    leftTemple.rotation.z = Math.PI / 5;
    leftTemple.position.set(-0.48, 2.3, 0.6);
    robotGlasses.add(leftTemple);
    
    const rightTemple = new THREE.Mesh(templeGeometry, glassesMaterial);
    rightTemple.rotation.z = -Math.PI / 5;
    rightTemple.position.set(0.48, 2.3, 0.6);
    robotGlasses.add(rightTemple);
    
    robot3DModel.add(robotGlasses);
    
    // ============================================
    // MOUTH (Sourire)
    // ============================================
    const mouthCurve = new THREE.EllipseCurve(0, 0, 0.32, 0.18, 0, Math.PI, false, 0);
    const mouthPoints = mouthCurve.getPoints(50);
    const mouthGeometry = new THREE.BufferGeometry().setFromPoints(mouthPoints);
    const mouthMaterial = new THREE.LineBasicMaterial({ color: 0x1e3a8a, linewidth: 3 });
    
    const mouth = new THREE.Line(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 1.9, 0.72);
    mouth.rotation.x = 0.2;
    robot3DModel.add(mouth);
    
    // ============================================
    // NECK
    // ============================================
    const neckGeometry = new THREE.CylinderGeometry(0.23, 0.28, 0.3, 32);
    const neck = new THREE.Mesh(neckGeometry, bodyDarkMaterial);
    neck.position.y = 1.3;
    neck.castShadow = true;
    robot3DModel.add(neck);
    
    // ============================================
    // BODY (Torse arrondi)
    // ============================================
    const bodyGeometry = new THREE.SphereGeometry(0.85, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7);
    robotBody = new THREE.Mesh(bodyGeometry, bodyDarkMaterial);
    robotBody.position.y = 0.5;
    robotBody.scale.y = 1.35;
    robotBody.castShadow = true;
    robotBody.receiveShadow = true;
    robot3DModel.add(robotBody);
    
    // Shirt
    const shirtGeometry = new THREE.SphereGeometry(0.83, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial);
    shirt.position.y = 0.5;
    shirt.scale.set(0.83, 1.3, 0.83);
    robot3DModel.add(shirt);
    
    // Suit panels
    const leftPanel = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 1.15, 0.05),
        bodyDarkMaterial
    );
    leftPanel.position.set(-0.33, 0.72, 0.72);
    leftPanel.rotation.y = -0.28;
    robot3DModel.add(leftPanel);
    
    const rightPanel = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 1.15, 0.05),
        bodyDarkMaterial
    );
    rightPanel.position.set(0.33, 0.72, 0.72);
    rightPanel.rotation.y = 0.28;
    robot3DModel.add(rightPanel);
    
    // ============================================
    // TIE (Cravate réaliste)
    // ============================================
    const tieShape = new THREE.Shape();
    tieShape.moveTo(0, 0);
    tieShape.lineTo(-0.11, -0.07);
    tieShape.lineTo(-0.075, -0.85);
    tieShape.lineTo(0.075, -0.85);
    tieShape.lineTo(0.11, -0.07);
    tieShape.lineTo(0, 0);
    
    const tieGeometry = new THREE.ExtrudeGeometry(tieShape, {
        depth: 0.04,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelSegments: 2
    });
    
    robotTie = new THREE.Mesh(tieGeometry, tieMaterial);
    robotTie.position.set(0, 1.2, 0.77);
    robotTie.castShadow = true;
    robot3DModel.add(robotTie);
    
    // Tie knot
    const tieKnot = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.11, 0.05),
        tieMaterial
    );
    tieKnot.position.set(0, 1.2, 0.79);
    robot3DModel.add(tieKnot);
    
    // ============================================
    // BUTTONS (3 boutons brillants)
    // ============================================
    const buttonGeometry = new THREE.SphereGeometry(0.04, 16, 16);
    const buttonMaterial = new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        emissive: 0x3b82f6,
        emissiveIntensity: 1.5,
        metalness: 0.9,
        roughness: 0.1
    });
    
    for (let i = 0; i < 3; i++) {
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
        button.position.set(0.23, 0.75 - i * 0.24, 0.82);
        robot3DModel.add(button);
    }
    
    // ============================================
    // ARMS (Capsules professionnelles)
    // ============================================
    const armUpperGeometry = new THREE.CapsuleGeometry(0.14, 0.55, 16, 32);
    
    // Left arm
    robotLeftArm = new THREE.Group();
    
    const leftArmUpper = new THREE.Mesh(armUpperGeometry, bodyDarkMaterial);
    leftArmUpper.position.set(-0.72, 0.88, 0);
    leftArmUpper.rotation.z = 0.28;
    leftArmUpper.castShadow = true;
    robotLeftArm.add(leftArmUpper);
    
    const leftArmLower = new THREE.Mesh(armUpperGeometry, shirtMaterial);
    leftArmLower.position.set(-0.95, 0.32, 0);
    leftArmLower.rotation.z = 0.18;
    leftArmLower.castShadow = true;
    robotLeftArm.add(leftArmLower);
    
    const leftHand = new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 32, 32),
        headMaterial
    );
    leftHand.position.set(-1.08, -0.02, 0);
    leftHand.castShadow = true;
    robotLeftArm.add(leftHand);
    
    robot3DModel.add(robotLeftArm);
    
    // Right arm
    robotRightArm = new THREE.Group();
    
    const rightArmUpper = new THREE.Mesh(armUpperGeometry, bodyDarkMaterial);
    rightArmUpper.position.set(0.72, 0.88, 0);
    rightArmUpper.rotation.z = -0.28;
    rightArmUpper.castShadow = true;
    robotRightArm.add(rightArmUpper);
    
    const rightArmLower = new THREE.Mesh(armUpperGeometry, shirtMaterial);
    rightArmLower.position.set(0.95, 0.32, 0);
    rightArmLower.rotation.z = -0.18;
    rightArmLower.castShadow = true;
    robotRightArm.add(rightArmLower);
    
    const rightHand = new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 32, 32),
        headMaterial
    );
    rightHand.position.set(1.08, -0.02, 0);
    rightHand.castShadow = true;
    robotRightArm.add(rightHand);
    
    robot3DModel.add(robotRightArm);
    
    // ============================================
    // LOWER BODY
    // ============================================
    const lowerBodyGeometry = new THREE.CapsuleGeometry(0.48, 0.38, 16, 32);
    const lowerBody = new THREE.Mesh(lowerBodyGeometry, bodyDarkMaterial);
    lowerBody.position.y = -0.28;
    lowerBody.castShadow = true;
    robot3DModel.add(lowerBody);
    
    // ============================================
    // PLATFORM (Cercles brillants)
    // ============================================
    for (let i = 0; i < 3; i++) {
        const ringGeometry = new THREE.TorusGeometry(1.1 - i * 0.28, 0.02, 16, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x60a5fa,
            transparent: true,
            opacity: 0.35 - i * 0.08
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.y = -0.68 + i * 0.02;
        ring.rotation.x = Math.PI / 2;
        robot3DModel.add(ring);
    }
    
    // ============================================
    // ADD TO SCENE
    // ============================================
    robot3DScene.add(robot3DModel);
    robot3DModel.position.y = -0.4;
    
    console.log('✅ [ROBOT] Professional model created');
}

function animateRobot3D() {
    robotAnimationFrame = requestAnimationFrame(animateRobot3D);
    
    if (!robot3DModel || !robot3DRenderer || !robot3DScene || !robot3DCamera) {
        return;
    }
    
    const time = Date.now() * 0.001;
    
    // INTRO (360° rotation)
    if (introProgress < 1) {
        introProgress += 0.012;
        robot3DModel.rotation.y = introProgress * Math.PI * 2;
        robot3DModel.position.y = -0.4 + Math.sin(introProgress * Math.PI) * 0.3;
        
        if (introProgress >= 1) {
            robot3DModel.rotation.y = 0;
            robot3DModel.position.y = -0.4;
            console.log('✅ [ROBOT] Intro complete');
        }
    }
    
    // IDLE
    if (robotIdle && introProgress >= 1) {
        robot3DModel.position.y = -0.4 + Math.sin(time * 1.2) * 0.1;
        robot3DModel.rotation.y = Math.sin(time * 0.4) * 0.07;
        
        if (robotHead) {
            robotHead.rotation.x = Math.sin(time * 0.8) * 0.04;
        }
        
        if (robotBody) {
            const breathe = 1 + Math.sin(time * 1.8) * 0.02;
            robotBody.scale.set(1, breathe, 1);
        }
    }
    
    // THINKING
    if (robotThinking && robotHead && introProgress >= 1) {
        robotHead.rotation.x = Math.sin(time * 2.5) * 0.1;
        robotHead.rotation.z = Math.sin(time * 1.8) * 0.07;
        
        if (robotGlasses) {
            robotGlasses.position.y = Math.sin(time * 2) * 0.01;
        }
    }
    
    // TALKING
    if (robotTalking && robotHead && introProgress >= 1) {
        robotHead.rotation.z = Math.sin(time * 8) * 0.025;
        
        if (robotTie) {
            robotTie.rotation.x = Math.sin(time * 6) * 0.04;
        }
    }
    
    // BLINK
    if (Math.random() < 0.008 && introProgress >= 1) {
        if (robotEyeLeft && robotEyeRight) {
            robotEyeLeft.scale.y = 0.1;
            robotEyeRight.scale.y = 0.1;
            
            setTimeout(() => {
                robotEyeLeft.scale.y = 1;
                robotEyeRight.scale.y = 1;
            }, 110);
        }
    }
    
    // MOUSE TRACKING
    if (robotHead && !robotThinking && introProgress >= 1) {
        const targetRotationY = mouseX * 0.22;
        const targetRotationX = mouseY * 0.14;
        
        robotHead.rotation.y += (targetRotationY - robotHead.rotation.y) * 0.04;
        
        if (!robotIdle) {
            robotHead.rotation.x += (targetRotationX - robotHead.rotation.x) * 0.04;
        }
    }
    
    // RENDER
    robot3DRenderer.render(robot3DScene, robot3DCamera);
}

function onRobotResize() {
    const container = document.getElementById('robot-3d-container');
    if (!container || !robot3DCamera || !robot3DRenderer) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    robot3DCamera.aspect = width / height;
    robot3DCamera.updateProjectionMatrix();
    
    robot3DRenderer.setSize(width, height);
}

function setRobotThinking(thinking) {
    robotThinking = thinking;
    robotIdle = !thinking;
    console.log(thinking ? '🤔 [ROBOT] Thinking...' : '😌 [ROBOT] Idle');
}

function setRobotTalking(talking) {
    robotTalking = talking;
    console.log(talking ? '🗣️ [ROBOT] Talking...' : '🤐 [ROBOT] Silent');
}

function resetRobot3D() {
    if (robot3DModel) {
        robot3DModel.position.set(0, -0.4, 0);
        robot3DModel.rotation.set(0, 0, 0);
    }
    
    if (robotHead) {
        robotHead.rotation.set(0, 0, 0);
    }
    
    robotIdle = true;
    robotThinking = false;
    robotTalking = false;
    introProgress = 0;
    
    console.log('🔄 [ROBOT] Reset');
}

function disposeRobot3D() {
    if (robotAnimationFrame) {
        cancelAnimationFrame(robotAnimationFrame);
        robotAnimationFrame = null;
    }
    
    if (robot3DRenderer) {
        robot3DRenderer.dispose();
        robot3DRenderer = null;
    }
    
    robot3DScene = null;
    robot3DCamera = null;
    robot3DModel = null;
    
    console.log('🗑️ [ROBOT] Disposed');
}

window.addEventListener('beforeunload', disposeRobot3D);