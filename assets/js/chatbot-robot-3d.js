// ============================================
// 🤖 ROBOT 3D FRIENDLY & OPTIMISÉ
// ============================================

let robot3DScene, robot3DCamera, robot3DRenderer, robot3DModel;
let robotAnimationFrame;
let robotIdle = true;
let robotThinking = false;
let robotTalking = false;

let robotHead, robotEyeLeft, robotEyeRight, robotBody;

let mouseX = 0, mouseY = 0;
let introProgress = 0;

function initRobot3D() {
    console.log('🎨 [ROBOT] Init friendly robot...');
    
    const container = document.getElementById('robot-3d-container');
    if (!container || typeof THREE === 'undefined') {
        console.error('❌ [ROBOT] Container or THREE.js missing');
        return;
    }
    
    if (robot3DRenderer) {
        container.innerHTML = '';
        disposeRobot3D();
    }
    
    try {
        // SCENE
        robot3DScene = new THREE.Scene();
        robot3DScene.background = null;
        
        // CAMERA (plus proche pour plus de détails)
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        robot3DCamera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
        robot3DCamera.position.set(0, 1.2, 8);
        robot3DCamera.lookAt(0, 0.6, 0);
        
        // RENDERER (optimisé)
        robot3DRenderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: 'low-power' // ✅ Performance
        });
        robot3DRenderer.setSize(width, height);
        robot3DRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // ✅ Limité à 1.5
        robot3DRenderer.shadowMap.enabled = false; // ✅ Pas d'ombres = plus rapide
        robot3DRenderer.toneMapping = THREE.ACESFilmicToneMapping;
        robot3DRenderer.toneMappingExposure = 1.2;
        
        container.appendChild(robot3DRenderer.domElement);
        
        // LIGHTS (simplifiées)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        robot3DScene.add(ambientLight);
        
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(5, 8, 5);
        robot3DScene.add(mainLight);
        
        const fillLight = new THREE.DirectionalLight(0x8b5cf6, 0.5);
        fillLight.position.set(-3, 2, -3);
        robot3DScene.add(fillLight);
        
        // Eye glow
        const eyeGlow = new THREE.PointLight(0x60a5fa, 1, 6);
        eyeGlow.position.set(0, 1.8, 1.5);
        robot3DScene.add(eyeGlow);
        
        // CREATE ROBOT (simplifié)
        createFriendlyRobot();
        
        // MOUSE TRACKING
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        
        // RESIZE
        window.addEventListener('resize', onRobotResize);
        
        // START
        animateRobot3D();
        
        console.log('✅ [ROBOT] Ready!');
        
    } catch (error) {
        console.error('❌ [ROBOT] Error:', error);
    }
}

function createFriendlyRobot() {
    robot3DModel = new THREE.Group();
    
    // MATERIALS (simples)
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0xf0f8ff,
        metalness: 0.6,
        roughness: 0.3
    });
    
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        metalness: 0.7,
        roughness: 0.4
    });
    
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        emissive: 0x3b82f6,
        emissiveIntensity: 2.5
    });
    
    const smileMaterial = new THREE.MeshBasicMaterial({
        color: 0x1e3a8a
    });
    
    // ============================================
    // HEAD (Sphère lisse - FRIENDLY)
    // ============================================
    const headGeometry = new THREE.SphereGeometry(0.7, 32, 32); // ✅ Réduit de 64 à 32
    robotHead = new THREE.Mesh(headGeometry, headMaterial);
    robotHead.position.y = 1.8;
    robot3DModel.add(robotHead);
    
    // Shine (reflet simple)
    const shineGeometry = new THREE.SphereGeometry(0.72, 16, 16, 0, Math.PI);
    const shineMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.25
    });
    const shine = new THREE.Mesh(shineGeometry, shineMaterial);
    shine.rotation.x = -0.3;
    robotHead.add(shine);
    
    // ============================================
    // EYES (Grands et expressifs - FRIENDLY)
    // ============================================
    const eyeGeometry = new THREE.SphereGeometry(0.18, 24, 24); // ✅ Réduit
    
    robotEyeLeft = new THREE.Mesh(eyeGeometry, eyeMaterial);
    robotEyeLeft.position.set(-0.25, 1.9, 0.55);
    robotEyeLeft.scale.z = 0.8;
    robot3DModel.add(robotEyeLeft);
    
    robotEyeRight = new THREE.Mesh(eyeGeometry, eyeMaterial);
    robotEyeRight.position.set(0.25, 1.9, 0.55);
    robotEyeRight.scale.z = 0.8;
    robot3DModel.add(robotEyeRight);
    
    // Eye highlights (reflets)
    const highlightGeometry = new THREE.SphereGeometry(0.06, 12, 12);
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const highlightLeft = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlightLeft.position.set(-0.08, 0.08, 0.15);
    robotEyeLeft.add(highlightLeft);
    
    const highlightRight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlightRight.position.set(-0.08, 0.08, 0.15);
    robotEyeRight.add(highlightRight);
    
    // Eye glow rings (friendly)
    const eyeRingGeometry = new THREE.TorusGeometry(0.2, 0.015, 12, 24); // ✅ Réduit
    const eyeRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.6
    });
    
    const eyeRingLeft = new THREE.Mesh(eyeRingGeometry, eyeRingMaterial);
    eyeRingLeft.position.copy(robotEyeLeft.position);
    robot3DModel.add(eyeRingLeft);
    
    const eyeRingRight = new THREE.Mesh(eyeRingGeometry, eyeRingMaterial);
    eyeRingRight.position.copy(robotEyeRight.position);
    robot3DModel.add(eyeRingRight);
    
    // ============================================
    // SMILE (Grand sourire friendly)
    // ============================================
    const smileCurve = new THREE.EllipseCurve(0, 0, 0.35, 0.2, 0, Math.PI, false, 0);
    const smilePoints = smileCurve.getPoints(40);
    const smileGeometry = new THREE.BufferGeometry().setFromPoints(smilePoints);
    const smileLine = new THREE.Line(smileGeometry, new THREE.LineBasicMaterial({ 
        color: 0x1e3a8a, 
        linewidth: 4 
    }));
    smileLine.position.set(0, 1.55, 0.65);
    smileLine.rotation.x = 0.15;
    robot3DModel.add(smileLine);
    
    // ============================================
    // CHEEKS (friendly touch)
    // ============================================
    const cheekGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const cheekMaterial = new THREE.MeshBasicMaterial({
        color: 0xff9999,
        transparent: true,
        opacity: 0.5
    });
    
    const cheekLeft = new THREE.Mesh(cheekGeometry, cheekMaterial);
    cheekLeft.position.set(-0.5, 1.65, 0.45);
    robot3DModel.add(cheekLeft);
    
    const cheekRight = new THREE.Mesh(cheekGeometry, cheekMaterial);
    cheekRight.position.set(0.5, 1.65, 0.45);
    robot3DModel.add(cheekRight);
    
    // ============================================
    // ANTENNAS (Petites et mignonnes)
    // ============================================
    const antennaGroup = new THREE.Group();
    
    const antennaStickGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 12);
    const antennaMaterial = new THREE.MeshStandardMaterial({
        color: 0xf0f8ff,
        metalness: 0.6,
        roughness: 0.3
    });
    
    // Left antenna
    const leftAntennaStick = new THREE.Mesh(antennaStickGeometry, antennaMaterial);
    leftAntennaStick.position.set(-0.25, 2.25, 0);
    antennaGroup.add(leftAntennaStick);
    
    const leftAntennaTip = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0x60a5fa,
            emissive: 0x3b82f6,
            emissiveIntensity: 2
        })
    );
    leftAntennaTip.position.set(-0.25, 2.45, 0);
    antennaGroup.add(leftAntennaTip);
    
    // Right antenna
    const rightAntennaStick = new THREE.Mesh(antennaStickGeometry, antennaMaterial);
    rightAntennaStick.position.set(0.25, 2.25, 0);
    antennaGroup.add(rightAntennaStick);
    
    const rightAntennaTip = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0x60a5fa,
            emissive: 0x3b82f6,
            emissiveIntensity: 2
        })
    );
    rightAntennaTip.position.set(0.25, 2.45, 0);
    antennaGroup.add(rightAntennaTip);
    
    robot3DModel.add(antennaGroup);
    
    // ============================================
    // NECK (simple)
    // ============================================
    const neckGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.25, 16);
    const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
    neck.position.y = 1.15;
    robot3DModel.add(neck);
    
    // ============================================
    // BODY (Arrondi et amical)
    // ============================================
    const bodyGeometry = new THREE.CapsuleGeometry(0.6, 0.8, 16, 24); // ✅ Capsule = friendly
    robotBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    robotBody.position.y = 0.5;
    robot3DModel.add(robotBody);
    
    // Body panel (décoration)
    const panelGeometry = new THREE.BoxGeometry(0.5, 0.7, 0.05);
    const panelMaterial = new THREE.MeshStandardMaterial({
        color: 0xf0f8ff,
        metalness: 0.1,
        roughness: 0.7
    });
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.set(0, 0.5, 0.61);
    robot3DModel.add(panel);
    
    // ============================================
    // BUTTONS (3 petits boutons)
    // ============================================
    const buttonGeometry = new THREE.SphereGeometry(0.03, 12, 12);
    const buttonMaterial = new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        emissive: 0x3b82f6,
        emissiveIntensity: 1.5
    });
    
    for (let i = 0; i < 3; i++) {
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
        button.position.set(0, 0.65 - i * 0.18, 0.62);
        robot3DModel.add(button);
    }
    
    // ============================================
    // ARMS (Simples et arrondis)
    // ============================================
    const armGeometry = new THREE.CapsuleGeometry(0.1, 0.5, 12, 16);
    
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.65, 0.6, 0);
    leftArm.rotation.z = 0.25;
    robot3DModel.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.65, 0.6, 0);
    rightArm.rotation.z = -0.25;
    robot3DModel.add(rightArm);
    
    // Hands
    const handGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    
    const leftHand = new THREE.Mesh(handGeometry, headMaterial);
    leftHand.position.set(-0.8, 0.2, 0);
    robot3DModel.add(leftHand);
    
    const rightHand = new THREE.Mesh(handGeometry, headMaterial);
    rightHand.position.set(0.8, 0.2, 0);
    robot3DModel.add(rightHand);
    
    // ============================================
    // PLATFORM (Cercles brillants)
    // ============================================
    for (let i = 0; i < 2; i++) {
        const ringGeometry = new THREE.TorusGeometry(0.9 - i * 0.25, 0.015, 12, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x60a5fa,
            transparent: true,
            opacity: 0.3 - i * 0.1
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.y = -0.5 + i * 0.02;
        ring.rotation.x = Math.PI / 2;
        robot3DModel.add(ring);
    }
    
    // ============================================
    // ADD TO SCENE
    // ============================================
    robot3DScene.add(robot3DModel);
    robot3DModel.position.y = -0.3;
}

function animateRobot3D() {
    robotAnimationFrame = requestAnimationFrame(animateRobot3D);
    
    if (!robot3DModel || !robot3DRenderer || !robot3DScene || !robot3DCamera) {
        return;
    }
    
    const time = Date.now() * 0.001;
    
    // INTRO (rotation rapide)
    if (introProgress < 1) {
        introProgress += 0.02; // ✅ Plus rapide
        robot3DModel.rotation.y = introProgress * Math.PI * 2;
        robot3DModel.position.y = -0.3 + Math.sin(introProgress * Math.PI) * 0.25;
        
        if (introProgress >= 1) {
            robot3DModel.rotation.y = 0;
            robot3DModel.position.y = -0.3;
        }
    }
    
    // IDLE (friendly bouncing)
    if (robotIdle && introProgress >= 1) {
        robot3DModel.position.y = -0.3 + Math.sin(time * 1.5) * 0.08;
        robot3DModel.rotation.y = Math.sin(time * 0.5) * 0.06;
        
        if (robotHead) {
            robotHead.rotation.x = Math.sin(time * 1) * 0.03;
        }
        
        if (robotBody) {
            const breathe = 1 + Math.sin(time * 2) * 0.015;
            robotBody.scale.set(1, breathe, 1);
        }
    }
    
    // THINKING
    if (robotThinking && robotHead && introProgress >= 1) {
        robotHead.rotation.x = Math.sin(time * 3) * 0.08;
        robotHead.rotation.z = Math.sin(time * 2) * 0.05;
    }
    
    // TALKING
    if (robotTalking && robotHead && introProgress >= 1) {
        robotHead.rotation.z = Math.sin(time * 10) * 0.02;
    }
    
    // BLINK
    if (Math.random() < 0.01 && introProgress >= 1) {
        if (robotEyeLeft && robotEyeRight) {
            robotEyeLeft.scale.y = 0.1;
            robotEyeRight.scale.y = 0.1;
            
            setTimeout(() => {
                robotEyeLeft.scale.y = 1;
                robotEyeRight.scale.y = 1;
            }, 100);
        }
    }
    
    // MOUSE TRACKING (friendly)
    if (robotHead && !robotThinking && introProgress >= 1) {
        const targetRotationY = mouseX * 0.2;
        const targetRotationX = mouseY * 0.12;
        
        robotHead.rotation.y += (targetRotationY - robotHead.rotation.y) * 0.05;
        
        if (!robotIdle) {
            robotHead.rotation.x += (targetRotationX - robotHead.rotation.x) * 0.05;
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
}

function setRobotTalking(talking) {
    robotTalking = talking;
}

function resetRobot3D() {
    if (robot3DModel) {
        robot3DModel.position.set(0, -0.3, 0);
        robot3DModel.rotation.set(0, 0, 0);
    }
    
    if (robotHead) {
        robotHead.rotation.set(0, 0, 0);
    }
    
    robotIdle = true;
    robotThinking = false;
    robotTalking = false;
    introProgress = 0;
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
}

window.addEventListener('beforeunload', disposeRobot3D);