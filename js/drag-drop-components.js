/* global AFRAME, THREE */
AFRAME.registerComponent('drag-droppable', {
    schema: {
        // Whether the entity can be moved
        enabled: {default: true},
        // The distance at which the object follows the cursor/controller
        dragDistance: {default: 0.5},
    },
    
    init: function () {
        this.camera = document.getElementById('camera');
        this.isDragging = false;
        this.dragOffset = new THREE.Vector3();
        this.placementPoint = new THREE.Vector3();
        this.intersection = null;
        this.draggedEntity = null;
        
        // Raycaster setup for placement
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Bind methods
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        
        // Add event listeners
        document.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('mousemove', this.onMouseMove);
        
        // Create highlight effect for hover
        this.addHighlightEffect();
        
        // Add hover event listeners
        this.el.addEventListener('mouseenter', () => {
            if (!this.isDragging) {
                this.el.setAttribute('material', 'opacity', 0.7);
                document.body.style.cursor = 'grab';
            }
        });
        
        this.el.addEventListener('mouseleave', () => {
            if (!this.isDragging) {
                this.el.setAttribute('material', 'opacity', 1.0);
                document.body.style.cursor = 'default';
            }
        });
    },
    
    addHighlightEffect: function() {
        // This method adds a highlight effect to the 3D model when hovered
        // We'll use a simple opacity change for this example
        const mesh = this.el.getObject3D('mesh');
        if (mesh) {
            mesh.traverse((node) => {
                if (node.isMesh) {
                    // Make original material transparent to enable opacity changes
                    if (node.material) {
                        const materials = Array.isArray(node.material) ? node.material : [node.material];
                        materials.forEach(material => {
                            material.transparent = true;
                            material.opacity = 1.0;
                            material.originalOpacity = material.opacity;
                        });
                    }
                }
            });
        } else {
            // If mesh isn't loaded yet, wait for it
            this.el.addEventListener('model-loaded', () => {
                this.addHighlightEffect();
            });
        }
    },
    
    onMouseDown: function(event) {
        if (!this.data.enabled || !this.el.sceneEl.is('vr-mode')) {
            const intersection = this.getMouseIntersection();
            if (intersection && intersection.object.el === this.el) {
                this.startDrag(intersection);
            }
        }
    },
    
    onMouseMove: function(event) {
        if (this.isDragging) {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            this.updateDragPosition();
        }
    },
    
    onMouseUp: function(event) {
        if (this.isDragging) {
            this.endDrag();
        }
    },
    
    startDrag: function(intersection) {
        this.isDragging = true;
        this.draggedEntity = this.el;
        document.body.style.cursor = 'grabbing';
        
        // Calculate the offset from the center of the object to the click point
        const objectPos = new THREE.Vector3();
        this.el.object3D.getWorldPosition(objectPos);
        this.dragOffset.copy(intersection.point).sub(objectPos);
        
        // Temporarily disable physics if using physics system
        if (this.el.hasAttribute('dynamic-body')) {
            this.el.removeAttribute('dynamic-body');
            this.hadPhysics = true;
        }
        
        // Emit event
        this.el.emit('dragstart', {intersection: intersection});
    },
    
    updateDragPosition: function() {
        if (!this.isDragging) return;
        
        // Cast ray from camera using mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera.getObject3D('camera'));
        
        // Check for intersection with the ground plane
        const groundIntersection = this.getGroundIntersection();
        
        if (groundIntersection) {
            // Set object position to the intersection point, considering the offset
            this.placementPoint.copy(groundIntersection.point).sub(this.dragOffset);
            
            // Adjust Y position based on object's height
            const boundingBox = new THREE.Box3().setFromObject(this.el.object3D);
            const height = boundingBox.max.y - boundingBox.min.y;
            this.placementPoint.y = height / 2;
            
            this.draggedEntity.object3D.position.copy(this.placementPoint);
            
            // Emit move event
            this.el.emit('dragmove', {intersection: groundIntersection});
        }
    },
    
    endDrag: function() {
        this.isDragging = false;
        document.body.style.cursor = 'grab';
        
        // Re-enable physics if it was disabled
        if (this.hadPhysics) {
            setTimeout(() => {
                this.el.setAttribute('dynamic-body', '');
                this.hadPhysics = false;
            }, 100);
        }
        
        // Snap to grid if needed
        this.snapToGrid();
        
        // Emit event
        this.el.emit('dragend', {});
    },
    
    snapToGrid: function() {
        // Optional: Implement grid snapping
        const gridSize = 0.5; // Grid cell size in meters
        const pos = this.el.object3D.position;
        
        // Snap to grid
        pos.x = Math.round(pos.x / gridSize) * gridSize;
        pos.z = Math.round(pos.z / gridSize) * gridSize;
        
        this.el.object3D.position.copy(pos);
    },
    
    getMouseIntersection: function() {
        // Convert mouse position to normalized device coordinates
        const canvas = this.el.sceneEl.canvas;
        const bounds = canvas.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
        const y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
        
        // Set up raycaster
        const raycaster = this.raycaster;
        raycaster.setFromCamera({x, y}, this.camera.getObject3D('camera'));
        
        // Get intersections with all interactive objects
        const objects = Array.from(document.querySelectorAll('.interactive')).map(el => el.object3D);
        const intersections = raycaster.intersectObjects(objects, true);
        
        // Find the first intersection
        if (intersections.length > 0) {
            // Find corresponding A-Frame entity
            let object = intersections[0].object;
            while (object && !object.el) {
                object = object.parent;
            }
            
            if (object && object.el) {
                intersections[0].object = object;
                return intersections[0];
            }
        }
        
        return null;
    },
    
    getGroundIntersection: function() {
        // Set up ray from camera through mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera.getObject3D('camera'));
        
        // Get all collidable objects
        const collidables = Array.from(document.querySelectorAll('.collidable')).map(el => el.object3D);
        
        // Check intersections
        const intersections = this.raycaster.intersectObjects(collidables, true);
        
        if (intersections.length > 0) {
            return intersections[0];
        }
        
        return null;
    },
    
    remove: function() {
        // Remove event listeners
        document.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('mousemove', this.onMouseMove);
    }
});