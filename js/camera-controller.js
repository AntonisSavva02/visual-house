/**
 * Camera controller for the house designer
 * Handles camera movement, zoom, and view switching (2D/3D)
 */
class CameraController {
    constructor() {
        this.camera = null;
        this.rig = null;
        this.isOrbiting = false;
        this.isPanning = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.currentView = '3d'; // '2d' or '3d'
        this.zoomLevel = 15; // Initial zoom level
        this.minZoom = 5;
        this.maxZoom = 30;
        this.orbitSpeed = 0.2;
        this.panSpeed = 0.05;
    }

    init() {
        // Get camera elements
        this.camera = document.getElementById('camera');
        this.rig = document.getElementById('rig');
        
        if (!this.camera || !this.rig) {
            console.error('Camera elements not found');
            return;
        }
        
        // Setup event listeners
        this.setupMouseControls();
        this.setupTouchControls();
        this.setupKeyboardControls();
        
        // Set initial camera position (top-down 2D view)
        this.setTopDownView();
        
        // Add view switching buttons
        this.createViewButtons();
    }

    setupMouseControls() {
        const scene = document.querySelector('a-scene');
        
        // Middle mouse button for orbit
        scene.addEventListener('mousedown', (e) => {
            if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle button or ctrl+left click
                this.isOrbiting = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                e.preventDefault();
            } else if (e.button === 2 || (e.button === 0 && e.shiftKey)) { // Right button or shift+left click
                this.isPanning = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                e.preventDefault();
            }
        });
        
        scene.addEventListener('mousemove', (e) => {
            if (this.isOrbiting) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;
                
                if (this.currentView === '3d') {
                    this.orbit(deltaX, deltaY);
                }
                
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            } else if (this.isPanning) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;
                
                this.pan(deltaX, deltaY);
                
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });
        
        scene.addEventListener('mouseup', (e) => {
            if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
                this.isOrbiting = false;
            } else if (e.button === 2 || (e.button === 0 && e.shiftKey)) {
                this.isPanning = false;
            }
        });
        
        // Mouse wheel for zoom
        scene.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // Determine zoom direction
            const zoomDirection = e.deltaY > 0 ? 1 : -1;
            this.zoom(zoomDirection);
        });
        
        // Prevent context menu on right click
        scene.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    setupTouchControls() {
        const scene = document.querySelector('a-scene');
        let touchStartX, touchStartY;
        let lastTouchDistance = 0;
        
        scene.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                // Single touch for panning
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                this.isPanning = true;
            } else if (e.touches.length === 2) {
                // Two-finger touch for zooming/rotating
                touchStartX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                touchStartY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                
                // Calculate initial distance between touches
                lastTouchDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                
                this.isOrbiting = true;
            }
        });
        
        scene.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && this.isPanning) {
                // Single touch panning
                const deltaX = e.touches[0].clientX - touchStartX;
                const deltaY = e.touches[0].clientY - touchStartY;
                
                this.pan(deltaX * 0.5, deltaY * 0.5);
                
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                // Two-finger gesture
                const currentTouchX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const currentTouchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                
                // Calculate current distance between touches
                const currentTouchDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                
                // Check if this is primarily a pinch/zoom motion
                const distanceDelta = currentTouchDistance - lastTouchDistance;
                if (Math.abs(distanceDelta) > 5) {
                    // Zoom
                    const zoomDirection = distanceDelta < 0 ? 1 : -1;
                    this.zoom(zoomDirection * 0.5);
                } else if (this.currentView === '3d') {
                    // Orbit/rotate (in 3D view only)
                    const deltaX = currentTouchX - touchStartX;
                    const deltaY = currentTouchY - touchStartY;
                    
                    this.orbit(deltaX * 0.5, deltaY * 0.5);
                }
                
                touchStartX = currentTouchX;
                touchStartY = currentTouchY;
                lastTouchDistance = currentTouchDistance;
            }
        });
        
        scene.addEventListener('touchend', (e) => {
            if (e.touches.length < 1) {
                this.isPanning = false;
                this.isOrbiting = false;
            } else if (e.touches.length === 1) {
                // Transition from 2-finger to 1-finger
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                this.isOrbiting = false;
                this.isPanning = true;
            }
        });
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // Arrow keys for panning
            const panDistance = 0.5;
            switch (e.key) {
                case 'ArrowUp':
                    this.pan(0, panDistance * 2);
                    break;
                case 'ArrowDown':
                    this.pan(0, -panDistance * 2);
                    break;
                case 'ArrowLeft':
                    this.pan(panDistance * 2, 0);
                    break;
                case 'ArrowRight':
                    this.pan(-panDistance * 2, 0);
                    break;
                // Number keys for predefined views
                case '1':
                    this.setTopDownView();
                    break;
                case '3':
                    this.setPerspectiveView();
                    break;
                // +/- for zoom
                case '+':
                case '=':
                    this.zoom(-1);
                    break;
                case '-':
                case '_':
                    this.zoom(1);
                    break;
                case 'r':
                    this.resetCamera();
                    break;
            }
        });
    }

    createViewButtons() {
        // Create view switching buttons
        const container = document.getElementById('ui-container');
        const viewSwitcher = document.createElement('div');
        viewSwitcher.id = 'view-switcher';
        viewSwitcher.style.position = 'absolute';
        viewSwitcher.style.top = '70px';
        viewSwitcher.style.right = '270px';
        viewSwitcher.style.background = 'rgba(255, 255, 255, 0.95)';
        viewSwitcher.style.borderRadius = '8px';
        viewSwitcher.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        viewSwitcher.style.padding = '5px';
        viewSwitcher.style.display = 'flex';
        viewSwitcher.style.gap = '5px';
        viewSwitcher.style.pointerEvents = 'auto';
        
        // 2D view button
        const btn2d = document.createElement('button');
        btn2d.textContent = '2D';
        btn2d.style.padding = '8px 12px';
        btn2d.style.border = 'none';
        btn2d.style.borderRadius = '4px';
        btn2d.style.fontWeight = '600';
        btn2d.style.cursor = 'pointer';
        btn2d.style.background = this.currentView === '2d' ? '#3b82f6' : '#f3f4f6';
        btn2d.style.color = this.currentView === '2d' ? 'white' : '#111827';
        
        btn2d.addEventListener('click', () => {
            this.setTopDownView();
            btn2d.style.background = '#3b82f6';
            btn2d.style.color = 'white';
            btn3d.style.background = '#f3f4f6';
            btn3d.style.color = '#111827';
        });
        
        // 3D view button
        const btn3d = document.createElement('button');
        btn3d.textContent = '3D';
        btn3d.style.padding = '8px 12px';
        btn3d.style.border = 'none';
        btn3d.style.borderRadius = '4px';
        btn3d.style.fontWeight = '600';
        btn3d.style.cursor = 'pointer';
        btn3d.style.background = this.currentView === '3d' ? '#3b82f6' : '#f3f4f6';
        btn3d.style.color = this.currentView === '3d' ? 'white' : '#111827';
        
        btn3d.addEventListener('click', () => {
            this.setPerspectiveView();
            btn3d.style.background = '#3b82f6';
            btn3d.style.color = 'white';
            btn2d.style.background = '#f3f4f6';
            btn2d.style.color = '#111827';
        });
        
        viewSwitcher.appendChild(btn2d);
        viewSwitcher.appendChild(btn3d);
        container.appendChild(viewSwitcher);
    }

    // Camera movement methods
    
    orbit(deltaX, deltaY) {
        if (this.currentView !== '3d') return;
        
        // Get current camera rotation
        const rotation = this.rig.getAttribute('rotation');
        
        // Update rotation based on mouse movement
        const newRotationX = rotation.x - deltaY * this.orbitSpeed;
        const newRotationY = rotation.y + deltaX * this.orbitSpeed;
        
        // Clamp vertical rotation to prevent flipping
        const clampedX = Math.max(-90, Math.min(0, newRotationX));
        
        this.rig.setAttribute('rotation', {
            x: clampedX,
            y: newRotationY,
            z: 0
        });
    }
    
    pan(deltaX, deltaY) {
        // Get current camera position and rotation
        const position = this.rig.getAttribute('position');
        const rotation = this.rig.getAttribute('rotation');
        
        // Calculate movement direction based on camera rotation
        const rotationY = rotation.y * (Math.PI / 180); // Convert to radians
        
        // Calculate movement vector
        let moveX, moveZ;
        
        if (this.currentView === '2d') {
            // In 2D view, panning is straightforward
            moveX = -deltaX * this.panSpeed;
            moveZ = -deltaY * this.panSpeed;
        } else {
            // In 3D view, panning depends on camera rotation
            moveX = -deltaX * this.panSpeed * Math.cos(rotationY) - 
                   deltaY * this.panSpeed * Math.sin(rotationY);
            moveZ = -deltaX * this.panSpeed * Math.sin(rotationY) + 
                   deltaY * this.panSpeed * Math.cos(rotationY);
        }
        
        // Update position
        this.rig.setAttribute('position', {
            x: position.x + moveX,
            y: position.y,
            z: position.z + moveZ
        });
    }
    
    zoom(direction) {
        // Update zoom level
        this.zoomLevel += direction;
        
        // Clamp zoom level to min/max bounds
        this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel));
        
        if (this.currentView === '2d') {
            // In 2D view, adjust camera height
            const position = this.rig.getAttribute('position');
            this.rig.setAttribute('position', {
                x: position.x,
                y: this.zoomLevel,
                z: position.z
            });
        } else {
            // In 3D view, move camera forward/backward
            const position = this.rig.getAttribute('position');
            const rotation = this.rig.getAttribute('rotation');
            
            // Calculate forward vector based on camera rotation
            const rotationY = rotation.y * (Math.PI / 180); // Convert to radians
            const rotationX = rotation.x * (Math.PI / 180); // Convert to radians
            
            // Set the distance based on zoom level
            const distance = this.zoomLevel;
            
            // Calculate position based on angle and distance
            const y = distance * Math.sin(-rotationX);
            const horizontalDistance = distance * Math.cos(-rotationX);
            const x = horizontalDistance * Math.sin(rotationY);
            const z = horizontalDistance * Math.cos(rotationY);
            
            // Update position based on new calculated coords
            this.rig.setAttribute('position', {
                x: x,
                y: y,
                z: z
            });
        }
    }
    
    setTopDownView() {
        // Set to 2D top-down view
        this.currentView = '2d';
        
        // Position the camera directly above
        this.rig.setAttribute('position', {
            x: 0,
            y: this.zoomLevel,
            z: 0
        });
        
        // Rotate camera to look straight down
        this.rig.setAttribute('rotation', {
            x: -90,
            y: 0,
            z: 0
        });
        
        // Update camera settings
        this.camera.setAttribute('fov', 60);
        this.camera.setAttribute('look-controls', 'enabled', false);
    }
    
    setPerspectiveView() {
        // Set to 3D perspective view
        this.currentView = '3d';
        
        // Position camera for an angled view
        this.rig.setAttribute('position', {
            x: 10,
            y: 10,
            z: 10
        });
        
        // Rotate to look at the center
        this.rig.setAttribute('rotation', {
            x: -45,
            y: 45,
            z: 0
        });
        
        // Update camera settings
        this.camera.setAttribute('fov', 75);
        this.camera.setAttribute('look-controls', 'enabled', false);
    }
    
    resetCamera() {
        if (this.currentView === '2d') {
            this.setTopDownView();
        } else {
            this.setPerspectiveView();
        }
    }
}