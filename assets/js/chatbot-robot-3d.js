// ============================================
// 🤖 ROBOT 3D HUMANOÏDE ULTRA-ANIMÉ
// ============================================

let robot3DScene, robot3DCamera, robot3DRenderer, robot3DModel;
let robotAnimationFrame;
let robotIdle = true;
let robotThinking = false;
let robotTalking = false;

let robotHead, robotEyeLeft, robotEyeRight, robotBody, robotAntenna;
let robotLeftArm, robotRightArm, robotLeftLeg, robotRightLeg;

let mouseX = 0, mouseY = 0;
let initialRotation = 0;
let introAnimationDone = false;

function initRobot3D() {
    console.log('🎨 Initializing Humanoid 3D Robot...');
    
    const container = document.getElementById('robot-3d-container');
    if (!container) {
        console.error('❌ Robot container not found!');
        return;
    }
    
    if (robot3DRenderer) {
        container.innerHTML = '';
        disposeRobot3D();
    }
    
    // ============================================
    // SCENE
    // ============================================
    robot3DScene = new THREE.Scene();
    robot3DScene.background = null;
    
    // Camera
    robot3DCamera = new THREE.PerspectiveCamera(
        40, 
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    robot3DCamera.position.set(0, 1, 10);
    robot3DCamera.lookAt(0, 0, 0);
    
    // Renderer
    robot3DRenderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
    });
    robot3DRenderer.setSize(container.clientWidth, container.clientHeight);
    robot3DRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    robot3DRenderer.shadowMap.enabled = true;
    robot3DRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    robot3DRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    robot3DRenderer.toneMappingExposure = 1.3;
    
    container.appendChild(robot3DRenderer.domElement);
    console.log('✅ Renderer created');
    
    // ============================================
    // LIGHTING
    // ============================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    robot3DScene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(6, 10, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    robot3DScene.add(mainLight);
    
    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 0.8);
    rimLight.position.set(-6, 4, -6);
    robot3DScene.add(rimLight);
    
    const fillLight = new THREE.DirectionalLight(0x667eea, 0.5);
    fillLight.position.set(0, -6, 4);
    robot3DScene.add(fillLight);
    
    const eyeGlow = new THREE.PointLight(0x8b5cf6, 1.2, 12);
    eyeGlow.position.set(0, 1.5, 2);
    robot3DScene.add(eyeGlow);
    
    // ============================================
    // CREATE HUMANOID ROBOT
    // ============================================
    createHumanoidRobot();
    
    // ============================================
    // INTRO ANIMATION (Rotation 360°)
    // ============================================
    startIntroAnimation();
    
    // ============================================
    // MOUSE TRACKING
    // ============================================
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    
    // ============================================
    // RESIZE
    // ============================================
    window.addEventListener('resize', onRobotResize);
    
    // ============================================
    // START ANIMATION
    // ============================================
    animateRobot3D();
    
    console.log('✅ Humanoid Robot initialized!');
}

function createHumanoidRobot() {
    robot3DModel = new THREE.Group();
    
    // ============================================
    // MATERIALS
    // ============================================
    const skinMaterial = new THREE.MeshStandardMaterial({
        color: 0xf0f4f8,
        metalness: 0.7,
        roughness: 0.25,
        envMapIntensity: 1.5
    });
    
    const darkMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d3748,
        metalness: 0.85,
        roughness: 0.35
    });
    
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x8b5cf6,
        emissiveIntensity: 2,
        metalness: 0.2,
        roughness: 0.1
    });
    
    const antennaMaterial = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xfbbf24,
        emissiveIntensity: 2.5,
        metalness: 0,
        roughness: 0.15
    });
    
    const tieMaterial = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        metalness: 0.25,
        roughness: 0.55
    });
    
    // ============================================
    // HEAD (Sphère arrondie)
    // ============================================
    const headGeometry = new THREE.SphereGeometry(0.7, 64, 64);
    robotHead = new THREE.Mesh(headGeometry, skinMaterial);
    robotHead.position.y = 2;
    robotHead.castShadow = true;
    robotHead.receiveShadow = true;
    robot3DModel.add(robotHead);
    
    // ============================================
    // EYES (Plus grands et expressifs)
    // ============================================
    const eyeGeometry = new THREE.SphereGeometry(0.16, 32, 32);
    
    robotEyeLeft = new THREE.Mesh(eyeGeometry, eyeMaterial);
    robotEyeLeft.position.set(-0.25, 2.1, 0.55);
    robotEyeLeft.castShadow = true;
    robot3DModel.add(robotEyeLeft);
    
    robotEyeRight = new THREE.Mesh(eyeGeometry, eyeMaterial);
    robotEyeRight.position.set(0.25, 2.1, 0.55);
    robotEyeRight.castShadow = true;
    robot3DModel.add(robotEyeRight);
    
    // Eye highlights
    const highlightGeometry = new THREE.SphereGeometry(0.055, 16, 16);
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const highlightLeft = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlightLeft.position.set(-0.07, 0.07, 0.14);
    robotEyeLeft.add(highlightLeft);
    
    const highlightRight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlightRight.position.set(-0.07, 0.07, 0.14);
    robotEyeRight.add(highlightRight);
    
    // ============================================
    // ANTENNA (Plus stylée)
    // ============================================
    const antennaGroup = new THREE.Group();
    
    const antennaStick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.5, 16),
        skinMaterial
    );
    antennaStick.position.y = 2.5;
    antennaGroup.add(antennaStick);
    
    const antennaTip = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 32, 32),
        antennaMaterial
    );
    antennaTip.position.y = 2.75;
    antennaGroup.add(antennaTip);
    
    // Antenna glow ring
    const antennaRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.015, 16, 32),
        antennaMaterial
    );
    antennaRing.position.copy(antennaTip.position);
    antennaRing.rotation.x = Math.PI / 2;
    antennaGroup.add(antennaRing);
    
    robotAntenna = antennaGroup;
    robot3DModel.add(antennaGroup);
    
    // ============================================
    // MOUTH (Sourire)
    // ============================================
    const mouthCurve = new THREE.EllipseCurve(
        0, 0,
        0.3, 0.15,
        0, Math.PI,
        false,
        0
    );
    
    const mouthPoints = mouthCurve.getPoints(50);
    const mouthGeometry = new THREE.BufferGeometry().setFromPoints(mouthPoints);
    const mouthMaterial = new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 3