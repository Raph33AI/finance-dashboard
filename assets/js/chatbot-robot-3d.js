// ============================================
// 🤖 ROBOT 3D SIMPLE MAIS GARANTI
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
    console.log('🎨 [ROBOT] Starting initialization...');
    
    const container = document.getElementById('robot-3d-container');
    if (!container) {
        console.error('❌ [ROBOT] Container #robot-3d-container NOT FOUND!');
        return;
    }
    
    console.log('✅ [ROBOT] Container found:', container);
    console.log('📏 [ROBOT] Container size:', container.clientWidth, 'x', container.clientHeight);
    
    // Vérifier Three.js
    if (typeof THREE === 'undefined') {
        console.error('❌ [ROBOT] THREE.js NOT LOADED!');
        return;
    }
    
    console.log('✅ [ROBOT] THREE.js loaded, version:', THREE.REVISION);
    
    // Cleanup
    if (robot3DRenderer) {
        console.log('🧹 [ROBOT] Cleaning up old renderer...');
        container.innerHTML = '';
        disposeRobot3D();
    }
    
    try {
        // ============================================
        // SCENE
        // ============================================
        robot3DScene = new THREE.Scene();
        robot3DScene.background = null;
        console.log('✅ [ROBOT] Scene created');
        
        // ============================================
        // CAMERA
        // ============================================
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        robot3DCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
        robot3DCamera.position.set(0, 1, 8);
        robot3DCamera.lookAt(0, 0, 0);
        console.log('✅ [ROBOT] Camera created');
        
        // ============================================
        // RENDERER
        // ============================================
        robot3DRenderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true
        });
        robot3DRenderer.setSize(width, height);
        robot3DRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        robot3DRenderer.shadowMap.enabled = true;
        
        container.appendChild(robot3DRenderer.domElement);
        console.log('✅ [ROBOT] Renderer created and appended');
        console.log('📺 [ROBOT] Canvas element:', robot3DRenderer.domElement);
        
        // ============================================
        // LIGHTS
        // ============================================
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        robot3DScene.add(ambientLight);
        
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(5, 10, 5);
        mainLight.castShadow = true;
        robot3DScene.add(mainLight);
        
        const rimLight = new THREE.DirectionalLight(0x667eea, 0.8);
        rimLight.position.set(-5, 3, -5);
        robot3DScene.add(rimLight);
        
        console.log('✅ [ROBOT] Lights added');
        
        // ============================================
        // CREATE SIMPLE ROBOT
        // ============================================
        createSimpleRobot();
        
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
        
        console.log('✅ [ROBOT] Initialization COMPLETE!');
        console.log('🎬 [ROBOT] Animation started');
        
    } catch (error) {
        console.error('❌ [ROBOT] Initialization ERROR:', error);
        console.error(error.stack);
    }
}

function createSimpleRobot() {
    console.log('🎨 [ROBOT] Creating robot model...');
    
    robot3DModel = new THREE.Group();
    
    // Materials
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        metalness: 0.7,
        roughness: 0.2
    });
    
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e3a8a,
        metalness: 0.8,
        roughness: 0.3
    });
    
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        emissive: 0x3b82f6,
        emissiveIntensity: 2,
        metalness: 0.1,
        roughness: 0.1
    });
    
    // HEAD
    const headGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    robotHead = new THREE.Mesh(headGeometry, headMaterial);
    robotHead.position.y = 2;
    robotHead.castShadow = true;
    robot3DModel.add(robotHead);
    console.log('✅ [ROBOT] Head created');
    
    // EYES
    const eyeGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    
    robotEyeLeft = new THREE.Mesh(eyeGeometry, eyeMaterial);
    robotEyeLeft.position.set(-0.3, 2.1, 0.6);
    robot3DModel.add(robotEyeLeft);
    
    robotEyeRight = new THREE.Mesh(eyeGeometry, eyeMaterial);
    robotEyeRight.position.set(0.3, 2.1, 0.6);
    robot3DModel.add(robotEyeRight);
    console.log('✅ [ROBOT] Eyes created');
    
    // BODY
    const bodyGeometry = new THREE.CylinderGeometry(0.7, 0.8, 1.5, 32);
    robotBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    robotBody.position.y = 0.5;
    robotBody.castShadow = true;
    robot3DModel.add(robotBody);
    console.log('✅ [ROBOT] Body created');
    
    // ARMS
    const armGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 16);
    
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.9, 0.6, 0);
    leftArm.rotation.z = 0.3;
    leftArm.castShadow = true;
    robot3DModel.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.9, 0.6, 0);
    rightArm.rotation.z = -0.3;
    rightArm.castShadow = true;
    robot3DModel.add(rightArm);
    console.log('✅ [ROBOT] Arms created');
    
    // ADD TO SCENE
    robot3DScene.add(robot3DModel);
    robot3DModel.position.y = -0.5;
    
    console.log('✅ [ROBOT] Model complete and added to scene');
}

function animateRobot3D() {
    robotAnimationFrame = requestAnimationFrame(animateRobot3D);
    
    if (!robot3DModel || !robot3DRenderer || !robot3DScene || !robot3DCamera) {
        return;
    }
    
    const time = Date.now() * 0.001;
    
    // INTRO (360° rotation)
    if (introProgress < 1) {
        introProgress += 0.015;
        robot3DModel.rotation.y = introProgress * Math.PI * 2;
        robot3DModel.position.y = -0.5 + Math.sin(introProgress * Math.PI) * 0.3;
        
        if (introProgress >= 1) {
            robot3DModel.rotation.y = 0;
            robot3DModel.position.y = -0.5;
            console.log('✅ [ROBOT] Intro animation complete');
        }
    }
    
    // IDLE
    if (robotIdle && introProgress >= 1) {
        robot3DModel.position.y = -0.5 + Math.sin(time * 1.5) * 0.1;
        robot3DModel.rotation.y = Math.sin(time * 0.5) * 0.08;
        
        if (robotHead) {
            robotHead.rotation.x = Math.sin(time * 0.8) * 0.05;
        }
    }
    
    // THINKING
    if (robotThinking && robotHead) {
        robotHead.rotation.x = Math.sin(time * 3) * 0.1;
        robotHead.rotation.z = Math.sin(time * 2) * 0.08;
    }
    
    // TALKING
    if (robotTalking && robotHead) {
        robotHead.rotation.z = Math.sin(time * 10) * 0.03;
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
    if (robotHead && !robotThinking && introProgress >= 1) {
        const targetRotationY = mouseX * 0.3;
        const targetRotationX = mouseY * 0.2;
        
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
    
    console.log('📏 [ROBOT] Resized to', width, 'x', height);
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
        robot3DModel.position.set(0, -0.5, 0);
        robot3DModel.rotation.set(0, 0, 0);
    }
    
    if (robotHead) {
        robotHead.rotation.set(0, 0, 0);
    }
    
    robotIdle = true;
    robotThinking = false;
    robotTalking = false;
    introProgress = 0;
    
    console.log('🔄 [ROBOT] Reset complete');
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

console.log('📝 [ROBOT] Script loaded, waiting for initRobot3D() call...');