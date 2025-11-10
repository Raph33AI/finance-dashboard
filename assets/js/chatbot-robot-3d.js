// ============================================
// 🤖 ROBOT HUMANOÏDE RÉALISTE
// ============================================

let robot3DScene, robot3DCamera, robot3DRenderer, robot3DModel;
let robotAnimationFrame;
let robotIdle = true;
let robotThinking = false;
let robotTalking = false;

let robotHead, robotEyeLeft, robotEyeRight;
let robotTorso, robotNeck;
let robotLeftArm, robotRightArm, robotLeftLeg, robotRightLeg;

let mouseX = 0, mouseY = 0;
let introProgress = 0;

function initRobot3D() {
    console.log('🎨 [ROBOT] Init humanoid robot...');
    
    const container = document.getElementById('robot-3d-container');
    if (!container || typeof THREE === 'undefined') {
        console.error('❌ [ROBOT] Missing');
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
        
        // CAMERA
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        robot3DCamera = new THREE.PerspectiveCamera(28, width / height, 0.1, 1000);
        robot3DCamera.position.set(0, 1.5, 12);
        robot3DCamera.lookAt(0, 1, 0);
        
        // RENDERER
        robot3DRenderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: 'low-power'
        });
        robot3DRenderer.setSize(width, height);
        robot3DRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        robot3DRenderer.shadowMap.enabled = false;
        robot3DRenderer.toneMapping = THREE.ACESFilmicToneMapping;
        robot3DRenderer.toneMappingExposure = 1.2;
        
        container.appendChild(robot3DRenderer.domElement);
        
        // LIGHTS
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        robot3DScene.add(ambientLight);
        
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.3);
        mainLight.position.set(6, 10, 6);
        robot3DScene.add(mainLight);
        
        const rimLight = new THREE.DirectionalLight(0x667eea, 0.7);
        rimLight.position.set(-4, 4, -4);
        robot3DScene.add(rimLight);
        
        const fillLight = new THREE.DirectionalLight(0x8b5cf6, 0.4);
        fillLight.position.set(0, -6, 4);
        robot3DScene.add(fillLight);
        
        // Eye glow
        const eyeGlow = new THREE.PointLight(0x60a5fa, 1.2, 8);
        eyeGlow.position.set(0, 2.2, 2);
        robot3DScene.add(eyeGlow);
        
        // CREATE HUMANOID
        createHumanoidRobot();
        
        // MOUSE
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        
        // RESIZE
        window.addEventListener('resize', onRobotResize);
        
        // START
        animateRobot3D();
        
        console.log('✅ [ROBOT] Humanoid ready!');
        
    } catch (error) {
        console.error('❌ [ROBOT] Error:', error);
    }
}

function createHumanoidRobot() {
    robot3DModel = new THREE.Group();
    
    // ============================================
    // MATERIALS
    // ============================================
    const skinMaterial = new THREE.MeshStandardMaterial({
        color: 0xf0f4f8,
        metalness: 0.7,
        roughness: 0.25
    });
    
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        metalness: 0.8,
        roughness: 0.3
    });
    
    const jointMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e40af,
        metalness: 0.85,
        roughness: 0.2
    });
    
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        emissive: 0x3b82f6,
        emissiveIntensity: 2.8
    });
    
    // ============================================
    // HEAD (Humanoïde avec visière)
    // ============================================
    const headGroup = new THREE.Group();
    
    // Casque principal
    const helmetGeometry = new THREE.SphereGeometry(0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.85);
    robotHead = new THREE.Mesh(helmetGeometry, skinMaterial);
    robotHead.position.y = 2.2;
    headGroup.add(robotHead);
    
    // Visière (partie frontale)
    const visorGeometry = new THREE.SphereGeometry(0.48, 24, 24, Math.PI * 0.75, Math.PI * 0.5, Math.PI * 0.35, Math.PI * 0.3);
    const visorMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1e3a8a,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.8
    });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.position.y = 2.2;
    headGroup.add(visor);
    
    // ============================================
    // EYES (Sur la visière)
    // ============================================
    const eyeGeometry = new THREE.SphereGeometry(0.12, 20, 20);
    
    robotEyeLeft = new THREE.Mesh(eyeGeometry, eyeMaterial);
    robotEyeLeft.position.set(-0.18, 2.25, 0.42);
    robotEyeLeft.scale.z = 0.7;
    headGroup.add(robotEyeLeft);
    
    robotEyeRight = new THREE.Mesh(eyeGeometry, eyeMaterial);
    robotEyeRight.position.set(0.18, 2.25, 0.42);
    robotEyeRight.scale.z = 0.7;
    headGroup.add(robotEyeRight);
    
    // Eye highlights
    const highlightGeometry = new THREE.SphereGeometry(0.04, 12, 12);
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const highlightLeft = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlightLeft.position.set(-0.05, 0.05, 0.1);
    robotEyeLeft.add(highlightLeft);
    
    const highlightRight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlightRight.position.set(-0.05, 0.05, 0.1);
    robotEyeRight.add(highlightRight);
    
    robot3DModel.add(headGroup);
    
    // ============================================
    // NECK (Cylindre)
    // ============================================
    const neckGeometry = new THREE.CylinderGeometry(0.18, 0.22, 0.3, 16);
    robotNeck = new THREE.Mesh(neckGeometry, jointMaterial);
    robotNeck.position.y = 1.75;
    robot3DModel.add(robotNeck);
    
    // ============================================
    // TORSO (Forme humaine)
    // ============================================
    const torsoGeometry = new THREE.BoxGeometry(0.9, 1.1, 0.5);
    robotTorso = new THREE.Mesh(torsoGeometry, bodyMaterial);
    robotTorso.position.y = 1;
    robot3DModel.add(robotTorso);
    
    // Chest panel
    const chestPanelGeometry = new THREE.BoxGeometry(0.7, 0.8, 0.05);
    const chestPanel = new THREE.Mesh(chestPanelGeometry, skinMaterial);
    chestPanel.position.set(0, 1, 0.28);
    robot3DModel.add(chestPanel);
    
    // Arc reactor (centre poitrine)
    const reactorGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 24);
    const reactorMaterial = new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        emissive: 0x3b82f6,
        emissiveIntensity: 2
    });
    const reactor = new THREE.Mesh(reactorGeometry, reactorMaterial);
    reactor.rotation.x = Math.PI / 2;
    reactor.position.set(0, 1.1, 0.31);
    robot3DModel.add(reactor);
    
    // ============================================
    // WAIST (Taille)
    // ============================================
    const waistGeometry = new THREE.CylinderGeometry(0.35, 0.4, 0.2, 16);
    const waist = new THREE.Mesh(waistGeometry, jointMaterial);
    waist.position.y = 0.35;
    robot3DModel.add(waist);
    
    // ============================================
    // LEFT ARM (Bras gauche articulé)
    // ============================================
    robotLeftArm = new THREE.Group();
    
    // Épaule
    const shoulderGeometry = new THREE.SphereGeometry(0.14, 16, 16);
    const leftShoulder = new THREE.Mesh(shoulderGeometry, jointMaterial);
    leftShoulder.position.set(-0.55, 1.4, 0);
    robotLeftArm.add(leftShoulder);
    
    // Bras supérieur
    const upperArmGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.5, 12);
    const leftUpperArm = new THREE.Mesh(upperArmGeometry, bodyMaterial);
    leftUpperArm.position.set(-0.55, 1.1, 0);
    robotLeftArm.add(leftUpperArm);
    
    // Coude
    const elbowGeometry = new THREE.SphereGeometry(0.11, 14, 14);
    const leftElbow = new THREE.Mesh(elbowGeometry, jointMaterial);
    leftElbow.position.set(-0.55, 0.85, 0);
    robotLeftArm.add(leftElbow);
    
    // Avant-bras
    const forearmGeometry = new THREE.CylinderGeometry(0.09, 0.1, 0.45, 12);
    const leftForearm = new THREE.Mesh(forearmGeometry, bodyMaterial);
    leftForearm.position.set(-0.55, 0.58, 0);
    robotLeftArm.add(leftForearm);
    
    // Main
    const handGeometry = new THREE.BoxGeometry(0.14, 0.18, 0.08);
    const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
    leftHand.position.set(-0.55, 0.32, 0);
    robotLeftArm.add(leftHand);
    
    robot3DModel.add(robotLeftArm);
    
    // ============================================
    // RIGHT ARM (Bras droit articulé)
    // ============================================
    robotRightArm = new THREE.Group();
    
    // Épaule
    const rightShoulder = new THREE.Mesh(shoulderGeometry, jointMaterial);
    rightShoulder.position.set(0.55, 1.4, 0);
    robotRightArm.add(rightShoulder);
    
    // Bras supérieur
    const rightUpperArm = new THREE.Mesh(upperArmGeometry, bodyMaterial);
    rightUpperArm.position.set(0.55, 1.1, 0);
    robotRightArm.add(rightUpperArm);
    
    // Coude
    const rightElbow = new THREE.Mesh(elbowGeometry, jointMaterial);
    rightElbow.position.set(0.55, 0.85, 0);
    robotRightArm.add(rightElbow);
    
    // Avant-bras
    const rightForearm = new THREE.Mesh(forearmGeometry, bodyMaterial);
    rightForearm.position.set(0.55, 0.58, 0);
    robotRightArm.add(rightForearm);
    
    // Main
    const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
    rightHand.position.set(0.55, 0.32, 0);
    robotRightArm.add(rightHand);
    
    robot3DModel.add(robotRightArm);
    
    // ============================================
    // PELVIS (Bassin)
    // ============================================
    const pelvisGeometry = new THREE.BoxGeometry(0.7, 0.25, 0.4);
    const pelvis = new THREE.Mesh(pelvisGeometry, bodyMaterial);
    pelvis.position.y = 0.12;
    robot3DModel.add(pelvis);
    
    // ============================================
    // LEFT LEG (Jambe gauche)
    // ============================================
    robotLeftLeg = new THREE.Group();
    
    // Hanche
    const hipGeometry = new THREE.SphereGeometry(0.12, 14, 14);
    const leftHip = new THREE.Mesh(hipGeometry, jointMaterial);
    leftHip.position.set(-0.2, 0, 0);
    robotLeftLeg.add(leftHip);
    
    // Cuisse
    const thighGeometry = new THREE.CylinderGeometry(0.11, 0.1, 0.6, 12);
    const leftThigh = new THREE.Mesh(thighGeometry, bodyMaterial);
    leftThigh.position.set(-0.2, -0.3, 0);
    robotLeftLeg.add(leftThigh);
    
    // Genou
    const kneeGeometry = new THREE.SphereGeometry(0.1, 14, 14);
    const leftKnee = new THREE.Mesh(kneeGeometry, jointMaterial);
    leftKnee.position.set(-0.2, -0.6, 0);
    robotLeftLeg.add(leftKnee);
    
    // Jambe inférieure
    const calfGeometry = new THREE.CylinderGeometry(0.09, 0.1, 0.6, 12);
    const leftCalf = new THREE.Mesh(calfGeometry, bodyMaterial);
    leftCalf.position.set(-0.2, -0.9, 0);
    robotLeftLeg.add(leftCalf);
    
    // Pied
    const footGeometry = new THREE.BoxGeometry(0.16, 0.1, 0.28);
    const leftFoot = new THREE.Mesh(footGeometry, skinMaterial);
    leftFoot.position.set(-0.2, -1.25, 0.08);
    robotLeftLeg.add(leftFoot);
    
    robot3DModel.add(robotLeftLeg);
    
    // ============================================
    // RIGHT LEG (Jambe droite)
    // ============================================
    robotRightLeg = new THREE.Group();
    
    // Hanche
    const rightHip = new THREE.Mesh(hipGeometry, jointMaterial);
    rightHip.position.set(0.2, 0, 0);
    robotRightLeg.add(rightHip);
    
    // Cuisse
    const rightThigh = new THREE.Mesh(thighGeometry, bodyMaterial);
    rightThigh.position.set(0.2, -0.3, 0);
    robotRightLeg.add(rightThigh);
    
    // Genou
    const rightKnee = new THREE.Mesh(kneeGeometry, jointMaterial);
    rightKnee.position.set(0.2, -0.6, 0);
    robotRightLeg.add(rightKnee);
    
    // Jambe inférieure
    const rightCalf = new THREE.Mesh(calfGeometry, bodyMaterial);
    rightCalf.position.set(0.2, -0.9, 0);
    robotRightLeg.add(rightCalf);
    
    // Pied
    const rightFoot = new THREE.Mesh(footGeometry, skinMaterial);
    rightFoot.position.set(0.2, -1.25, 0.08);
    robotRightLeg.add(rightFoot);
    
    robot3DModel.add(robotRightLeg);
    
    // ============================================
    // PLATFORM
    // ============================================
    for (let i = 0; i < 2; i++) {
        const ringGeometry = new THREE.TorusGeometry(1 - i * 0.3, 0.015, 12, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x60a5fa,
            transparent: true,
            opacity: 0.3 - i * 0.1
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.y = -1.3 + i * 0.02;
        ring.rotation.x = Math.PI / 2;
        robot3DModel.add(ring);
    }
    
    // ============================================
    // ADD TO SCENE
    // ============================================
    robot3DScene.add(robot3DModel);
    robot3DModel.position.y = 0;
}

function animateRobot3D() {
    robotAnimationFrame = requestAnimationFrame(animateRobot3D);
    
    if (!robot3DModel || !robot3DRenderer || !robot3DScene || !robot3DCamera) {
        return;
    }
    
    const time = Date.now() * 0.001;
    
    // INTRO
    if (introProgress < 1) {
        introProgress += 0.018;
        robot3DModel.rotation.y = introProgress * Math.PI * 2;
        robot3DModel.position.y = Math.sin(introProgress * Math.PI) * 0.3;
        
        if (introProgress >= 1) {
            robot3DModel.rotation.y = 0;
            robot3DModel.position.y = 0;
        }
    }
    
    // IDLE (respiration et mouvements subtils)
    if (robotIdle && introProgress >= 1) {
        robot3DModel.position.y = Math.sin(time * 1.2) * 0.05;
        robot3DModel.rotation.y = Math.sin(time * 0.4) * 0.04;
        
        // Tête hochement
        if (robotHead) {
            robotHead.rotation.x = Math.sin(time * 0.8) * 0.02;
        }
        
        // Respiration torso
        if (robotTorso) {
            const breathe = 1 + Math.sin(time * 1.8) * 0.012;
            robotTorso.scale.set(breathe, 1, 1);
        }
        
        // Bras léger balancement
        if (robotLeftArm) {
            robotLeftArm.rotation.x = Math.sin(time * 0.6) * 0.03;
        }
        if (robotRightArm) {
            robotRightArm.rotation.x = Math.sin(time * 0.6 + Math.PI) * 0.03;
        }
    }
    
    // THINKING
    if (robotThinking && robotHead && introProgress >= 1) {
        robotHead.rotation.x = Math.sin(time * 2.5) * 0.08;
        robotHead.rotation.z = Math.sin(time * 1.8) * 0.05;
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
    
    // MOUSE TRACKING
    if (robotHead && !robotThinking && introProgress >= 1) {
        const targetRotationY = mouseX * 0.15;
        const targetRotationX = mouseY * 0.1;
        
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
        robot3DModel.position.set(0, 0, 0);
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