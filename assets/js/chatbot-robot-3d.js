// ============================================
// 🤖 ROBOT 3D ULTRA-RÉALISTE (THREE.JS)
// ============================================

let robot3DScene, robot3DCamera, robot3DRenderer, robot3DModel;
let robotAnimationFrame;
let robotIdle = true;
let robotThinking = false;
let robotTalking = false;

let robotHead, robotEyeLeft, robotEyeRight, robotBody, robotAntenna;

let mouseX = 0, mouseY = 0;

function initRobot3D() {
    console.log('🎨 Initializing 3D Robot...');
    
    const container = document.getElementById('robot-3d-container');
    if (!container) {
        console.error('❌ Robot container not found!');
        return;
    }
    
    // ✅ NETTOYER L'ANCIEN RENDERER SI EXISTE
    if (robot3DRenderer) {
        container.innerHTML = '';
        disposeRobot3D();
    }
    
    // ============================================
    // SCENE SETUP
    // ============================================
    robot3DScene = new THREE.Scene();
    robot3DScene.background = null;
    
    // Camera
    robot3DCamera = new THREE.PerspectiveCamera(
        45, 
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    robot3DCamera.position.set(0, 0, 8);
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
    robot3DRenderer.toneMappingExposure = 1.2;
    
    container.appendChild(robot3DRenderer.domElement);
    console.log('✅ Renderer created and appended');
    
    // ============================================
    // LIGHTING
    // ============================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    robot3DScene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    robot3DScene.add(mainLight);
    
    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 0.6);
    rimLight.position.set(-5, 3, -5);
    robot3DScene.add(rimLight);
    
    const fillLight = new THREE.DirectionalLight(0x667eea, 0.4);
    fillLight.position.set(0, -5, 3);
    robot3DScene.add(fillLight);
    
    const eyeGlow = new THREE.PointLight(0x8b5cf6, 0.8, 10);
    eyeGlow.position.set(0, 0.5, 1.5);
    robot3DScene.add(eyeGlow);
    
    // ============================================
    // CREATE ROBOT
    // ============================================
    createRobotModel();
    
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
    
    console.log('✅ 3D Robot initialized successfully!');
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

function createRobotModel() {
    robot3DModel = new THREE.Group();
    
    // ============================================
    // MATERIALS
    // ============================================
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.8,
        roughness: 0.2
    });
    
    const darkMetalMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.3
    });
    
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x8b5cf6,
        emissiveIntensity: 1.5,
        metalness: 0.3,
        roughness: 0.1
    });
    
    const antennaTipMaterial = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xfbbf24,
        emissiveIntensity: 2,
        metalness: 0,
        roughness: 0.2
    });
    
    const tieMaterial = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        metalness: 0.2,
        roughness: 0.6
    });
    
    // ============================================
    // HEAD
    // ============================================
    const headGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    robotHead = new THREE.Mesh(headGeometry, metalMaterial);
    robotHead.position.y = 1.5;
    robotHead.castShadow = true;
    robot3DModel.add(robotHead);
    
    // ============================================
    // EYES
    // ============================================
    const eyeGeometry = new THREE.SphereGeometry(0.18, 32, 32);
    
    robotEyeLeft = new THREE.Mesh(eyeGeometry, eyeMaterial);
    robotEyeLeft.position.set(-0.3, 1.6, 0.6);
    robotEyeLeft.castShadow = true;
    robot3DModel.add(robotEyeLeft);
    
    robotEyeRight = new THREE.Mesh(eyeGeometry, eyeMaterial);
    robotEyeRight.position.set(0.3, 1.6, 0.6);
    robotEyeRight.castShadow = true;
    robot3DModel.add(robotEyeRight);
    
    const highlightGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const highlightLeft = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlightLeft.position.set(-0.08, 0.08, 0.15);
    robotEyeLeft.add(highlightLeft);
    
    const highlightRight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlightRight.position.set(-0.08, 0.08, 0.15);
    robotEyeRight.add(highlightRight);
    
    // ============================================
    // ANTENNA
    // ============================================
    const antennaGroup = new THREE.Group();
    
    const antennaStickGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 16);
    const antennaStick = new THREE.Mesh(antennaStickGeometry, metalMaterial);
    antennaStick.position.y = 2.3;
    antennaGroup.add(antennaStick);
    
    const antennaTipGeometry = new THREE.SphereGeometry(0.12, 32, 32);
    const antennaTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial);
    antennaTip.position.y = 2.6;
    antennaGroup.add(antennaTip);
    
    robotAntenna = antennaGroup;
    robot3DModel.add(antennaGroup);
    
    // ============================================
    // MOUTH
    // ============================================
    const mouthGeometry = new THREE.TorusGeometry(0.3, 0.05, 16, 32, Math.PI);
    const mouthMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0f172a,
        metalness: 0.1,
        roughness: 0.8
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 1.2, 0.6);
    mouth.rotation.x = Math.PI;
    robot3DModel.add(mouth);
    
    // ============================================
    // BODY
    // ============================================
    const bodyGeometry = new THREE.BoxGeometry(1.4, 1.6, 1);
    robotBody = new THREE.Mesh(bodyGeometry, darkMetalMaterial);
    robotBody.position.y = 0.2;
    robotBody.castShadow = true;
    robot3DModel.add(robotBody);
    
    const panelGeometry = new THREE.BoxGeometry(0.9, 1.2, 0.05);
    const panel = new THREE.Mesh(panelGeometry, metalMaterial);
    panel.position.set(0, 0.2, 0.52);
    robot3DModel.add(panel);
    
    // ============================================
    // TIE
    // ============================================
    const tieShape = new THREE.Shape();
    tieShape.moveTo(0, 0);
    tieShape.lineTo(-0.15, -0.1);
    tieShape.lineTo(-0.1, -0.8);
    tieShape.lineTo(0.1, -0.8);
    tieShape.lineTo(0.15, -0.1);
    tieShape.lineTo(0, 0);
    
    const tieGeometry = new THREE.ExtrudeGeometry(tieShape, {
        depth: 0.05,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelSegments: 3
    });
    
    const tie = new THREE.Mesh(tieGeometry, tieMaterial);
    tie.position.set(0, 0.8, 0.52);
    robot3DModel.add(tie);
    
    // ============================================
    // BUTTONS
    // ============================================
    const buttonGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.03, 32);
    const buttonMaterial = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xfbbf24,
        emissiveIntensity: 1,
        metalness: 0.5,
        roughness: 0.3
    });
    
    for (let i = 0; i < 3; i++) {
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
        button.position.set(0, 0.3 - i * 0.25, 0.55);
        button.rotation.x = Math.PI / 2;
        robot3DModel.add(button);
    }
    
    // ============================================
    // ARMS
    // ============================================
    const armGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.9, 16);
    
    const leftArm = new THREE.Mesh(armGeometry, metalMaterial);
    leftArm.position.set(-0.8, 0.2, 0);
    leftArm.rotation.z = -0.2;
    leftArm.castShadow = true;
    robot3DModel.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, metalMaterial);
    rightArm.position.set(0.8, 0.2, 0);
    rightArm.rotation.z = 0.2;
    rightArm.castShadow = true;
    robot3DModel.add(rightArm);
    
    const handGeometry = new THREE.SphereGeometry(0.18, 32, 32);
    
    const leftHand = new THREE.Mesh(handGeometry, metalMaterial);
    leftHand.position.set(-0.8, -0.3, 0);
    leftHand.castShadow = true;
    robot3DModel.add(leftHand);
    
    const rightHand = new THREE.Mesh(handGeometry, metalMaterial);
    rightHand.position.set(0.8, -0.3, 0);
    rightHand.castShadow = true;
    robot3DModel.add(rightHand);
    
    // ============================================
    // ADD TO SCENE
    // ============================================
    robot3DScene.add(robot3DModel);
    robot3DModel.rotation.y = 0.2;
    
    console.log('✅ Robot model created');
}

function animateRobot3D() {
    robotAnimationFrame = requestAnimationFrame(animateRobot3D);
    
    if (!robot3DModel || !robot3DRenderer || !robot3DScene || !robot3DCamera) return;
    
    const time = Date.now() * 0.001;
    
    // IDLE
    if (robotIdle) {
        robot3DModel.position.y = Math.sin(time * 1.5) * 0.15;
        robot3DModel.rotation.y = 0.2 + Math.sin(time * 0.5) * 0.1;
        
        if (robotBody) {
            const breathe = 1 + Math.sin(time * 2) * 0.02;
            robotBody.scale.set(1, breathe, 1);
        }
    }
    
    // THINKING
    if (robotThinking && robotHead) {
        robotHead.rotation.x = Math.sin(time * 3) * 0.1;
        robotHead.rotation.y = Math.sin(time * 2) * 0.15;
        
        if (robotAntenna) {
            robotAntenna.rotation.z = Math.sin(time * 4) * 0.2;
        }
    }
    
    // TALKING
    if (robotTalking && robotHead) {
        robotHead.rotation.z = Math.sin(time * 10) * 0.05;
    }
    
    // BLINK
    if (Math.random() < 0.01) {
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
    if (robotHead && !robotThinking) {
        const targetRotationY = mouseX * 0.3;
        const targetRotationX = mouseY * 0.2;
        
        robotHead.rotation.y += (targetRotationY - robotHead.rotation.y) * 0.05;
        robotHead.rotation.x += (targetRotationX - robotHead.rotation.x) * 0.05;
    }
    
    // RENDER
    robot3DRenderer.render(robot3DScene, robot3DCamera);
}

// ============================================
// CONTROL FUNCTIONS
// ============================================
function setRobotThinking(thinking) {
    robotThinking = thinking;
    robotIdle = !thinking;
    console.log(thinking ? '🤔 Robot thinking...' : '😌 Robot idle');
}

function setRobotTalking(talking) {
    robotTalking = talking;
    console.log(talking ? '🗣️ Robot talking...' : '🤐 Robot silent');
}

function resetRobot3D() {
    if (robot3DModel) {
        robot3DModel.position.set(0, 0, 0);
        robot3DModel.rotation.set(0, 0.2, 0);
    }
    
    if (robotHead) {
        robotHead.rotation.set(0, 0, 0);
    }
    
    robotIdle = true;
    robotThinking = false;
    robotTalking = false;
    
    console.log('🔄 Robot reset');
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
    
    if (robot3DScene) {
        robot3DScene = null;
    }
    
    console.log('🗑️ Robot 3D disposed');
}

window.addEventListener('beforeunload', disposeRobot3D);