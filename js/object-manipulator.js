/* global AFRAME, THREE */
AFRAME.registerComponent('manipulable', {
    schema: {
        selectedColor: {type: 'color', default: '#4CC3D9'},
        mode: {type: 'string', default: 'translate', oneOf: ['translate', 'rotate', 'scale']}
    },
    
    init: function() {
        // Binding functions
        this.onSelect = this.onSelect.bind(this);
        this.onDeselect = this.onDeselect.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.update = this.update.bind(this);
        
        // Set up state
        this.isSelected = false;
        this.initialPosition = new THREE.Vector3();
        this.initialRotation = new THREE.Euler();
        this.initialScale = new THREE.Vector3();
        this.lastMousePosition = new THREE.Vector2();
        
        // Set up controls
        this.setupControls();
        
        // Add listeners
        this.el.addEventListener('click', this.onSelect);
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('mousedown', (e) => {
            if (e.target.tagName !== 'CANVAS' && this.isSelected) {
                this.onDeselect();
            }
        });
        
        // Add this to global manipulable objects list
        if (!AFRAME.manipulableObjects) {
            AFRAME.manipulableObjects = [];
        }
        AFRAME.manipulableObjects.push(this);
        
        // Set the default manipulation mode from data
        this.currentMode = this.data.mode;
    },
    
    setupControls: function() {
        // Create transformation controls container
        this.controlsContainer = document.createElement('a-entity');
        this.controlsContainer.setAttribute('visible', false);
        this.el.appendChild(this.controlsContainer);
        
        // Create the control handles based on the current mode
        this.createTransformControls();
    },
    
    createTransformControls: function() {
        this.controlsContainer.innerHTML = '';
        
        switch(this.data.mode) {
            case 'translate':
                this.createTranslationControls();
                break;
            case 'rotate':
                this.createRotationControls();
                break;
            case 'scale':
                this.createScaleControls();
                break;
        }
    },
    
    createTranslationControls: function() {
        // X axis (red)
        const xAxis = document.createElement('a-entity');
        xAxis.setAttribute('geometry', {primitive: 'cylinder', height: 0.3, radius: 0.01});
        xAxis.setAttribute('material', {color: '#FF0000'});
        xAxis.setAttribute('position', {x: 0.15, y: 0, z: 0});
        xAxis.setAttribute('rotation', {x: 0, y: 0, z: 90});
        xAxis.classList.add('control-handle');
        xAxis.setAttribute('data-axis', 'x');
        this.controlsContainer.appendChild(xAxis);
        
        // X axis handle
        const xHandle = document.createElement('a-entity');
        xHandle.setAttribute('geometry', {primitive: 'cone', height: 0.05, radiusBottom: 0.02, radiusTop: 0});
        xHandle.setAttribute('material', {color: '#FF0000'});
        xHandle.setAttribute('position', {x: 0.325, y: 0, z: 0});
        xHandle.setAttribute('rotation', {x: 0, y: 0, z: -90});
        xHandle.classList.add('control-handle');
        xHandle.setAttribute('data-axis', 'x');
        this.controlsContainer.appendChild(xHandle);
        
        // Z axis (blue)
        const zAxis = document.createElement('a-entity');
        zAxis.setAttribute('geometry', {primitive: 'cylinder', height: 0.3, radius: 0.01});
        zAxis.setAttribute('material', {color: '#0000FF'});
        zAxis.setAttribute('position', {x: 0, y: 0, z: 0.15});
        zAxis.setAttribute('rotation', {x: 90, y: 0, z: 0});
        zAxis.classList.add('control-handle');
        zAxis.setAttribute('data-axis', 'z');
        this.controlsContainer.appendChild(zAxis);
        
        // Z axis handle
        const zHandle = document.createElement('a-entity');
        zHandle.setAttribute('geometry', {primitive: 'cone', height: 0.05, radiusBottom: 0.02, radiusTop: 0});
        zHandle.setAttribute('material', {color: '#0000FF'});
        zHandle.setAttribute('position', {x: 0, y: 0, z: 0.325});
        zHandle.setAttribute('rotation', {x: 0, y: 0, z: 0});
        zHandle.classList.add('control-handle');
        zHandle.setAttribute('data-axis', 'z');
        this.controlsContainer.appendChild(zHandle);
        
        // Y axis (green)
        const yAxis = document.createElement('a-entity');
        yAxis.setAttribute('geometry', {primitive: 'cylinder', height: 0.3, radius: 0.01});
        yAxis.setAttribute('material', {color: '#00FF00'});
        yAxis.setAttribute('position', {x: 0, y: 0.15, z: 0});
        yAxis.classList.add('control-handle');
        yAxis.setAttribute('data-axis', 'y');
        this.controlsContainer.appendChild(yAxis);
        
        // Y axis handle
        const yHandle = document.createElement('a-entity');
        yHandle.setAttribute('geometry', {primitive: 'cone', height: 0.05, radiusBottom: 0.02, radiusTop: 0});
        yHandle.setAttribute('material', {color: '#00FF00'});
        yHandle.setAttribute('position', {x: 0, y: 0.325, z: 0});
        yHandle.classList.add('control-handle');
        yHandle.setAttribute('data-axis', 'y');
        this.controlsContainer.appendChild(yHandle);
    },
    
    createRotationControls: function() {
        // X rotation ring (red)
        const xRing = document.createElement('a-entity');
        xRing.setAttribute('geometry', {primitive: 'torus', radius: 0.2, radiusTubular: 0.01});
        xRing.setAttribute('material', {color: '#FF0000', side: 'double'});
        xRing.setAttribute('rotation', {x: 0, y: 90, z: 0});
        xRing.classList.add('control-handle');
        xRing.setAttribute('data-axis', 'x');
        this.controlsContainer.appendChild(xRing);
        
        // Y rotation ring (green)
        const yRing = document.createElement('a-entity');
        yRing.setAttribute('geometry', {primitive: 'torus', radius: 0.2, radiusTubular: 0.01});
        yRing.setAttribute('material', {color: '#00FF00', side: 'double'});
        yRing.classList.add('control-handle');
        yRing.setAttribute('data-axis', 'y');
        this.controlsContainer.appendChild(yRing);
        
        // Z rotation ring (blue)
        const zRing = document.createElement('a-entity');
        zRing.setAttribute('geometry', {primitive: 'torus', radius: 0.2, radiusTubular: 0.01});
        zRing.setAttribute('material', {color: '#0000FF', side: 'double'});
        zRing.setAttribute('rotation', {x: 90, y: 0, z: 0});
        zRing.classList.add('control-handle');
        zRing.setAttribute('data-axis', 'z');
        this.controlsContainer.appendChild(zRing);
    },
    
    createScaleControls: function() {
        // Create scale handles in 3 directions
        const axes = [
            {axis: 'x', color: '#FF0000', position: {x: 0.2, y: 0, z: 0}},
            {axis: 'y', color: '#00FF00', position: {x: 0, y: 0.2, z: 0}},
            {axis: 'z', color: '#0000FF', position: {x: 0, y: 0, z: 0.2}}
        ];
        
        axes.forEach(axisInfo => {
            const handle = document.createElement('a-entity');
            handle.setAttribute('geometry', {primitive: 'box', width: 0.05, height: 0.05, depth: 0.05});
            handle.setAttribute('material', {color: axisInfo.color});
            handle.setAttribute('position', axisInfo.position);
            handle.classList.add('control-handle');
            handle.setAttribute('data-axis', axisInfo.axis);
            this.controlsContainer.appendChild(handle);
        });
        
        // Uniform scale handle (center)
        const uniformHandle = document.createElement('a-entity');
        uniformHandle.setAttribute('geometry', {primitive: 'box', width: 0.05, height: 0.05, depth: 0.05});
        uniformHandle.setAttribute('material', {color: '#FFFF00'});
        uniformHandle.setAttribute('position', {x: 0, y: 0, z: 0});
        uniformHandle.classList.add('control-handle');
        uniformHandle.setAttribute('data-axis', 'uniform');
        this.controlsContainer.appendChild(uniformHandle);
    },
    
    onSelect: function(evt) {
        // Deselect any previously selected object
        if (AFRAME.manipulableObjects) {
            AFRAME.manipulableObjects.forEach(obj => {
                if (obj !== this && obj.isSelected) {
                    obj.onDeselect();
                }
            });
        }
        
        this.isSelected = true;
        
        // Store initial transformation
        this.initialPosition.copy(this.el.object3D.position);
        this.initialRotation.copy(this.el.object3D.rotation);
        this.initialScale.copy(this.el.object3D.scale);
        
        // Add a subtle highlight to show selected state
        this.applyHighlight();
        
        // Show controls
        this.controlsContainer.setAttribute('visible', true);
        
        // Set up mouse move handling
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        
        // Emit event
        this.el.emit('object-selected', {component: this});
    },
    
    onDeselect: function() {
        this.isSelected = false;
        
        // Remove highlight
        this.removeHighlight();
        
        // Hide controls
        this.controlsContainer.setAttribute('visible', false);
        
        // Remove listeners
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        
        // Emit event
        this.el.emit('object-deselected', {component: this});
    },
    
    onKeyDown: function(evt) {
        if (!this.isSelected) return;
        
        // Handle keyboard shortcuts for manipulating objects
        const step = evt.shiftKey ? 0.1 : 0.5;
        
        switch(evt.key) {
            case 'Delete':
            case 'Backspace':
                if (this.isSelected) {
                    this.el.parentNode.removeChild(this.el);
                    if (AFRAME.manipulableObjects) {
                        const index = AFRAME.manipulableObjects.indexOf(this);
                        if (index !== -1) {
                            AFRAME.manipulableObjects.splice(index, 1);
                        }
                    }
                }
                break;
                
            case 'g': // Toggle between transformation modes
                this.cycleTransformationMode();
                break;
                
            // Translation keys
            case 'ArrowLeft': 
                if (this.data.mode === 'translate') {
                    this.el.object3D.position.x -= step;
                }
                break;
            case 'ArrowRight': 
                if (this.data.mode === 'translate') {
                    this.el.object3D.position.x += step;
                }
                break;
            case 'ArrowUp': 
                if (evt.ctrlKey || evt.metaKey) {
                    if (this.data.mode === 'translate') {
                        this.el.object3D.position.y += step;
                    }
                } else {
                    if (this.data.mode === 'translate') {
                        this.el.object3D.position.z -= step;
                    }
                }
                break;
            case 'ArrowDown': 
                if (evt.ctrlKey || evt.metaKey) {
                    if (this.data.mode === 'translate') {
                        this.el.object3D.position.y -= step;
                    }
                } else {
                    if (this.data.mode === 'translate') {
                        this.el.object3D.position.z += step;
                    }
                }
                break;
                
            // Rotation keys
            case 'x':
                if (this.data.mode === 'rotate') {
                    this.el.object3D.rotation.x += THREE.MathUtils.degToRad(step * 10);
                }
                break;
            case 'y':
                if (this.data.mode === 'rotate') {
                    this.el.object3D.rotation.y += THREE.MathUtils.degToRad(step * 10);
                }
                break;
            case 'z':
                if (this.data.mode === 'rotate') {
                    this.el.object3D.rotation.z += THREE.MathUtils.degToRad(step * 10);
                }
                break;
                
            // Scale keys
            case '+':
            case '=':
                if (this.data.mode === 'scale') {
                    const scale = this.el.object3D.scale;
                    scale.x += step * 0.1;
                    scale.y += step * 0.1;
                    scale.z += step * 0.1;
                }
                break;
            case '-':
                if (this.data.mode === 'scale') {
                    const scale = this.el.object3D.scale;
                    scale.x -= step * 0.1;
                    scale.y -= step * 0.1;
                    scale.z -= step * 0.1;
                    
                    // Prevent negative scale
                    scale.x = Math.max(0.1, scale.x);
                    scale.y = Math.max(0.1, scale.y);
                    scale.z = Math.max(0.1, scale.z);
                }
                break;
        }
        
        // Update position display if needed
        this.updateControlsPosition();
    },
    
    updateControlsPosition: function() {
        // Make sure the controls stay attached to the object
        const position = new THREE.Vector3();
        this.el.object3D.getWorldPosition(position);
        this.controlsContainer.object3D.position.copy(this.el.object3D.position);
    },
    
    cycleTransformationMode: function() {
        // Cycle between translate -> rotate -> scale
        const modes = ['translate', 'rotate', 'scale'];
        const currentIndex = modes.indexOf(this.data.mode);
        const nextIndex = (currentIndex + 1) % modes.length;
        
        this.data.mode = modes[nextIndex];
        
        // Update UI to reflect the new mode
        this.createTransformControls();
        
        // Emit mode change event
        this.el.emit('transformation-mode-changed', {mode: this.data.mode});
    },
    
    applyHighlight: function() {
        const mesh = this.el.getObject3D('mesh');
        if (mesh) {
            mesh.traverse((node) => {
                if (node.isMesh && node.material) {
                    const materials = Array.isArray(node.material) ? node.material : [node.material];
                    materials.forEach(material => {
                        // Store original color
                        if (!material.originalColor) {
                            material.originalColor = material.color.clone();
                        }
                        
                        // Apply a slight highlight
                        material.emissive = new THREE.Color(0x222222);
                    });
                }
            });
        }
    },
    
    removeHighlight: function() {
        const mesh = this.el.getObject3D('mesh');
        if (mesh) {
            mesh.traverse((node) => {
                if (node.isMesh && node.material) {
                    const materials = Array.isArray(node.material) ? node.material : [node.material];
                    materials.forEach(material => {
                        // Reset to original color
                        if (material.originalColor) {
                            material.color.copy(material.originalColor);
                        }
                        
                        // Remove emission
                        material.emissive = new THREE.Color(0x000000);
                    });
                }
            });
        }
    },
    
    update: function(oldData) {
        if (oldData && this.data.mode !== oldData.mode) {
            this.createTransformControls();
        }
    },
    
    remove: function() {
        document.removeEventListener('keydown', this.onKeyDown);
        this.el.removeEventListener('click', this.onSelect);
        
        if (this.isSelected) {
            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('mouseup', this.onMouseUp);
        }
        
        // Remove from global list
        if (AFRAME.manipulableObjects) {
            const index = AFRAME.manipulableObjects.indexOf(this);
            if (index !== -1) {
                AFRAME.manipulableObjects.splice(index, 1);
            }
        }
    }
});