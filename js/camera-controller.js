/**
 * EasyFloor - Camera Controller
 * Manages camera position, rotation, and movement
 */

const CameraController = {
    camera: null,
    cameraRig: null,
    rotationSpeed: 0.2,
    panSpeed: 0.2,
    zoomSpeed: 0.5,
    minDistance: 5,
    maxDistance: 30,
    currentDistance: 15, // Default view height
    currentRotation: { x: -90, y: 0, z: 0 }, // Default top-down view
    targetPosition: { x: 0, y: 15, z: 0 }, // Default camera target position
    
    init() {
        this.camera = document.getElementById('camera');
        this.cameraRig = document.getElementById('camera-rig');
        
        if (!this.camera || !this.cameraRig) {
            console.error("Camera elements not found");
            return;
        }
        
        console.log("Camera controller initialized");
        
        // Set initial camera position
        this.cameraRig.setAttribute('position', this.targetPosition);
        this.cameraRig.setAttribute('rotation', this.currentRotation);
    },
    
    setView(type) {
        if (type === '2d') {
            this.set2DView();
        } else {
            this.set3DView();
        }
    },
    
    set2DView() {
        // Animate to top-down view
        const startRotation = { ...this.currentRotation };
        const targetRotation = { x: -90, y: 0, z: 0 };
        
        const animate = (progress) => {
            const rotation = {
                x: startRotation.x + (targetRotation.x - startRotation.x) * progress,
                y: startRotation.y + (targetRotation.y - startRotation.y) * progress,
                z: startRotation.z + (targetRotation.z - startRotation.z) * progress
            };
            
            this.cameraRig.setAttribute('rotation', rotation);
            this.currentRotation = rotation;
        };
        
        this.animateTransition(animate, 300);
    },
    
    set3DView() {
        // Animate to isometric-like view
        const startRotation = { ...this.currentRotation };
        const targetRotation = { x: -45, y: 45, z: 0 };
        
        const animate = (progress) => {
            const rotation = {
                x: startRotation.x + (targetRotation.x - startRotation.x) * progress,
                y: startRotation.y + (targetRotation.y - startRotation.y) * progress,
                z: startRotation.z + (targetRotation.z - startRotation.z) * progress
            };
            
            this.cameraRig.setAttribute('rotation', rotation);
            this.currentRotation = rotation;
        };
        
        this.animateTransition(animate, 300);
    },
    
    animateTransition(animateFn, duration) {
        const startTime = performance.now();
        
        const tick = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            animateFn(progress);
            
            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        };
        
        requestAnimationFrame(tick);
    },
    
    zoomIn() {
        this.currentDistance = Math.max(this.minDistance, this.currentDistance - this.zoomSpeed);
        this.updateCameraPosition();
    },
    
    zoomOut() {
        this.currentDistance = Math.min(this.maxDistance, this.currentDistance + this.zoomSpeed);
        this.updateCameraPosition();
    },
    
    updateCameraPosition() {
        const position = { x: this.targetPosition.x, y: this.currentDistance, z: this.targetPosition.z };
        this.cameraRig.setAttribute('position', position);
    }
};