/**
 * EasyFloor - Camera Controller
 * Handles camera movement, rotation, and zooming
 */

const CameraController = {
    // Camera settings
    camera: null,
    cameraRig: null,
    view: '3d', // 2d or 3d
    defaultHeight: 15,
    minHeight: 5,
    maxHeight: 25,
    defaultAngle: -90, // Looking down in 2D view
    defaultDistance: 15,
    panSpeed: 0.1,
    rotateSpeed: 0.5,
    zoomSpeed: 1,
    
    // Mouse tracking
    isDragging: false,
    lastMousePosition: { x: 0, y: 0 },
    
    // Initialize the camera controller
    init() {
        console.log("Initializing CameraController...");
        
        this.camera = document.getElementById('camera');
        this.cameraRig = document.getElementById('camera-rig');
        
        if (!this.camera || !this.cameraRig) {
            console.error("Camera or camera rig not found!");
            return;
        }
        
        // Set initial position
        this.set3DView();
        
        // Add event listeners for camera controls
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Mouse controls for panning and rotating
        const scene = document.querySelector('a-scene');
        if (!scene) return;
        
        scene.addEventListener('mousedown', (e) => {
            // Only handle middle mouse button or right button while holding shift
            if (e.button === 1 || (e.button === 2 && e.shiftKey)) {
                this.isDragging = true;
                this.lastMousePosition = { x: e.clientX, y: e.clientY };
                e.preventDefault();
            }
        });
        
        scene.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            const deltaX = e.clientX - this.lastMousePosition.x;
            const deltaY = e.clientY - this.lastMousePosition.y;
            
            if (this.view === '2d') {
                // In 2D view, mouse movement pans the camera
                this.panCamera(deltaX, deltaY);
            } else {
                // In 3D view, mouse movement rotates the camera
                this.rotateCamera(deltaX, deltaY);
            }
            
            this.lastMousePosition = { x: e.clientX, y: e.clientY };
            e.preventDefault();
        });
        
        scene.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        scene.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });
        
        // Zoom with mouse wheel
        scene.addEventListener('wheel', (e) => {
            if (e.target.closest('.ui-container')) return; // Don't zoom when scrolling UI
            
            if (e.deltaY > 0) {
                this.zoomOut();
            } else {
                this.zoomIn();
            }
            
            e.preventDefault();
        });
        
        // Touch controls for mobile
        let initialTouchDistance = 0;
        let initialRigPosition = { x: 0, y: 0, z: 0 };
        let initialTouchPosition = { x: 0, y: 0 };
        
        scene.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Two-finger gesture for zooming
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialTouchDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
            } else if (e.touches.length === 1 && e.target.closest('#ground')) {
                // One-finger drag for panning
                initialTouchPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                initialRigPosition = this.cameraRig.getAttribute('position');
            }
        });
        
        scene.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                // Handle pinch to zoom
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                
                const delta = currentDistance - initialTouchDistance;
                
                if (Math.abs(delta) > 10) {
                    if (delta > 0) {
                        this.zoomIn();
                    } else {
                        this.zoomOut();
                    }
                    initialTouchDistance = currentDistance;
                }
                
                e.preventDefault();
            } else if (e.touches.length === 1 && initialRigPosition) {
                // Handle pan
                const deltaX = e.touches[0].clientX - initialTouchPosition.x;
                const deltaY = e.touches[0].clientY - initialTouchPosition.y;
                
                this.panCamera(deltaX, deltaY);
                
                initialTouchPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                e.preventDefault();
            }
        });
        
        scene.addEventListener('touchend', () => {
            initialTouchDistance = 0;
            initialRigPosition = null;
        });
    },
    
    set2DView() {
        this.view = '2d';
        
        if (!this.cameraRig) return;
        
        // Position camera above the scene, looking down
        const currentPos = this.cameraRig.getAttribute('position');
        
        this.cameraRig.setAttribute('position', {
            x: currentPos.x,
            y: this.defaultHeight,
            z: currentPos.z
        });
        
        this.cameraRig.setAttribute('rotation', {
            x: -90, // Looking straight down
            y: 0,
            z: 0
        });
        
        // Disable rotation in 2D view
        if (this.camera) {
            this.camera.setAttribute('look-controls', 'enabled', false);
        }
    },
    
    set3DView() {
        this.view = '3d';
        
        if (!this.cameraRig) return;
        
        // Position camera at an isometric angle
        const currentPos = this.cameraRig.getAttribute('position');
        
        this.cameraRig.setAttribute('position', {
            x: currentPos.x,
            y: this.defaultHeight,
            z: currentPos.z + 10 // Move back to get a better view
        });
        
        this.cameraRig.setAttribute('rotation', {
            x: -45, // Angled view
            y: 0,
            z: 0
        });
        
        // Enable rotation in 3D view
        if (this.camera) {
            this.camera.setAttribute('look-controls', 'enabled', true);
        }
    },
    
    panCamera(deltaX, deltaY) {
        if (!this.cameraRig) return;
        
        const currentPos = this.cameraRig.getAttribute('position');
        const currentRot = this.cameraRig.getAttribute('rotation');
        
        // Calculate movement based on camera angle
        const radians = (currentRot.y * Math.PI) / 180;
        const cosY = Math.cos(radians);
        const sinY = Math.sin(radians);
        
        // Adjust movement direction based on camera rotation
        const adjustedDeltaX = (deltaX * cosY - deltaY * sinY) * this.panSpeed;
        const adjustedDeltaZ = (deltaX * sinY + deltaY * cosY) * this.panSpeed;
        
        this.cameraRig.setAttribute('position', {
            x: currentPos.x - adjustedDeltaX,
            y: currentPos.y,
            z: currentPos.z - adjustedDeltaZ
        });
    },
    
    rotateCamera(deltaX, deltaY) {
        if (this.view !== '3d' || !this.cameraRig) return;
        
        const currentRot = this.cameraRig.getAttribute('rotation');
        
        // Only allow rotation around the Y axis (left/right)
        this.cameraRig.setAttribute('rotation', {
            x: Math.max(-80, Math.min(-10, currentRot.x - deltaY * this.rotateSpeed * 0.2)),
            y: (currentRot.y + deltaX * this.rotateSpeed) % 360,
            z: 0
        });
    },
    
    zoomIn() {
        if (!this.cameraRig) return;
        
        const currentPos = this.cameraRig.getAttribute('position');
        const currentRot = this.cameraRig.getAttribute('rotation');
        
        if (this.view === '2d') {
            // In 2D view, zoom by adjusting height
            const newHeight = Math.max(this.minHeight, currentPos.y - this.zoomSpeed);
            
            this.cameraRig.setAttribute('position', {
                x: currentPos.x,
                y: newHeight,
                z: currentPos.z
            });
        } else {
            // In 3D view, move camera forward
            const radians = (currentRot.y * Math.PI) / 180;
            const radiansX = (currentRot.x * Math.PI) / 180;
            
            // Calculate the direction vector
            const dirX = Math.sin(radians) * Math.cos(radiansX);
            const dirY = Math.sin(radiansX);
            const dirZ = Math.cos(radians) * Math.cos(radiansX);
            
            this.cameraRig.setAttribute('position', {
                x: currentPos.x + dirX * this.zoomSpeed,
                y: currentPos.y - dirY * this.zoomSpeed,
                z: currentPos.z - dirZ * this.zoomSpeed
            });
        }
    },
    
    zoomOut() {
        if (!this.cameraRig) return;
        
        const currentPos = this.cameraRig.getAttribute('position');
        const currentRot = this.cameraRig.getAttribute('rotation');
        
        if (this.view === '2d') {
            // In 2D view, zoom by adjusting height
            const newHeight = Math.min(this.maxHeight, currentPos.y + this.zoomSpeed);
            
            this.cameraRig.setAttribute('position', {
                x: currentPos.x,
                y: newHeight,
                z: currentPos.z
            });
        } else {
            // In 3D view, move camera backward
            const radians = (currentRot.y * Math.PI) / 180;
            const radiansX = (currentRot.x * Math.PI) / 180;
            
            // Calculate the direction vector
            const dirX = Math.sin(radians) * Math.cos(radiansX);
            const dirY = Math.sin(radiansX);
            const dirZ = Math.cos(radians) * Math.cos(radiansX);
            
            this.cameraRig.setAttribute('position', {
                x: currentPos.x - dirX * this.zoomSpeed,
                y: currentPos.y + dirY * this.zoomSpeed,
                z: currentPos.z + dirZ * this.zoomSpeed
            });
        }
    }
};