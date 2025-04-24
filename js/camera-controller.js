/**
 * Visual-House - Camera Controller
 * Handles camera movement, positioning, and view modes
 */

// Add Camera Controller to APP
APP.Camera = {
    // Default camera positions
    defaultPosition2D: { x: 0, y: 15, z: 0 },
    defaultRotation2D: { x: -90, y: 0, z: 0 },
    defaultPosition3D: { x: 15, y: 15, z: 15 },
    defaultRotation3D: { x: -45, y: 45, z: 0 },
    
    // Camera settings
    zoomLevel: 15,
    minZoom: 5,
    maxZoom: 30,
    zoomStep: 2,
    isOrbiting: false,
    lastMousePosition: { x: 0, y: 0 },
    
    // Initialize camera controller
    init: function(app) {
        this.app = app;
        this.cameraRig = app.cameraRig;
        this.camera = app.camera;
        
        // Set initial camera position
        this.set2DView();
        
        // Setup mouse wheel for zooming
        document.addEventListener('wheel', (e) => this.handleMouseWheel(e));
        
        // Setup middle mouse button for orbiting in 3D view
        document.addEventListener('mousedown', (e) => {
            if (e.button === 1 || e.button === 2) { // Middle or right button
                this.startOrbiting(e);
                e.preventDefault();
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.button === 1 || e.button === 2) { // Middle or right button
                this.stopOrbiting();
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isOrbiting) {
                this.updateOrbiting(e);
            }
        });
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    },
    
    // Set 2D top-down view
    set2DView: function() {
        // Move camera to top-down position
        this.cameraRig.setAttribute('position', this.defaultPosition2D);
        this.cameraRig.setAttribute('rotation', this.defaultRotation2D);
        
        // Update zoom level
        this.zoomLevel = this.defaultPosition2D.y;
        
        // Lock camera controls
        this.camera.setAttribute('look-controls', 'enabled', false);
        
        // Show notification
        this.app.showNotification('Switched to 2D view');
    },
    
    // Set 3D perspective view
    set3DView: function() {
        // Move camera to perspective position
        this.cameraRig.setAttribute('position', this.defaultPosition3D);
        this.cameraRig.setAttribute('rotation', this.defaultRotation3D);
        
        // Update zoom level
        this.zoomLevel = 15;
        
        // Show notification
        this.app.showNotification('Switched to 3D view');
    },
    
    // Zoom in
    zoomIn: function() {
        if (this.zoomLevel <= this.minZoom) return;
        
        this.zoomLevel -= this.zoomStep;
        this.updateZoom();
        
        // Show notification
        this.app.showNotification('Zooming in');
    },
    
    // Zoom out
    zoomOut: function() {
        if (this.zoomLevel >= this.maxZoom) return;
        
        this.zoomLevel += this.zoomStep;
        this.updateZoom();
        
        // Show notification
        this.app.showNotification('Zooming out');
    },
    
    // Update zoom based on current zoom level
    updateZoom: function() {
        const position = this.cameraRig.getAttribute('position');
        const rotation = this.cameraRig.getAttribute('rotation');
        
        // If in 2D view (looking straight down)
        if (rotation.x <= -85) {
            position.y = this.zoomLevel;
        } else {
            // In 3D view, maintain angle while zooming in/out
            const angle = THREE.Math.degToRad(rotation.y);
            const height = Math.abs(position.y);
            const radius = Math.sqrt(position.x * position.x + position.z * position.z);
            const ratio = this.zoomLevel / radius;
            
            position.x = Math.sin(angle) * this.zoomLevel;
            position.z = Math.cos(angle) * this.zoomLevel;
            position.y = height * ratio;
        }
        
        this.cameraRig.setAttribute('position', position);
    },
    
    // Handle mouse wheel for zooming
    handleMouseWheel: function(e) {
        if (e.deltaY < 0) {
            this.zoomIn();
        } else {
            this.zoomOut();
        }
    },
    
    // Start orbiting the camera (with middle/right mouse button)
    startOrbiting: function(e) {
        this.isOrbiting = true;
        this.lastMousePosition = { x: e.clientX, y: e.clientY };
    },
    
    // Stop orbiting
    stopOrbiting: function() {
        this.isOrbiting = false;
    },
    
    // Update camera while orbiting
    updateOrbiting: function(e) {
        // Calculate mouse movement
        const deltaX = e.clientX - this.lastMousePosition.x;
        const deltaY = e.clientY - this.lastMousePosition.y;
        this.lastMousePosition = { x: e.clientX, y: e.clientY };
        
        // Get current rotation and position
        const rotation = this.cameraRig.getAttribute('rotation');
        const position = this.cameraRig.getAttribute('position');
        
        // Update rotation (orbit around center)
        rotation.y += deltaX * 0.5;
        rotation.x -= deltaY * 0.5;
        
        // Limit vertical rotation to avoid flipping
        rotation.x = Math.max(-90, Math.min(0, rotation.x));
        
        // Update position based on rotation and zoom level
        const phi = THREE.Math.degToRad(90 + rotation.x);
        const theta = THREE.Math.degToRad(rotation.y);
        
        position.x = this.zoomLevel * Math.sin(phi) * Math.sin(theta);
        position.y = this.zoomLevel * Math.cos(phi);
        position.z = this.zoomLevel * Math.sin(phi) * Math.cos(theta);
        
        // Apply new rotation and position
        this.cameraRig.setAttribute('rotation', rotation);
        this.cameraRig.setAttribute('position', position);
    },
    
    // Get intersection with ground plane
    getGroundIntersection: function(mouseEvent) {
        const scene = document.querySelector('a-scene');
        if (!scene) return null;
        
        // Create raycaster
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        // Get normalized mouse position
        const bounds = scene.canvas.getBoundingClientRect();
        const x = ((mouseEvent.clientX - bounds.left) / bounds.width) * 2 - 1;
        const y = -((mouseEvent.clientY - bounds.top) / bounds.height) * 2 + 1;
        mouse.set(x, y);
        
        // Get camera and update raycaster
        const camera = document.getElementById('camera').object3D.children[0];
        raycaster.setFromCamera(mouse, camera);
        
        // Create ground plane for intersection
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersection = new THREE.Vector3();
        
        // Check for intersection
        const result = raycaster.ray.intersectPlane(groundPlane, intersection);
        
        return result ? { point: intersection } : null;
    },
    
    // Convert world position to screen coordinates
    worldToScreen: function(worldPos) {
        const scene = document.querySelector('a-scene');
        if (!scene) return { x: 0, y: 0 };
        
        // Create vector from world position
        const vector = new THREE.Vector3(worldPos.x, worldPos.y, worldPos.z);
        
        // Get camera and canvas
        const camera = document.getElementById('camera').object3D.children[0];
        const canvas = scene.canvas;
        
        // Project world position to screen
        vector.project(camera);
        
        // Convert to screen coordinates
        const screenX = (vector.x * 0.5 + 0.5) * canvas.clientWidth;
        const screenY = (vector.y * -0.5 + 0.5) * canvas.clientHeight;
        
        return { x: screenX, y: screenY };
    }
};