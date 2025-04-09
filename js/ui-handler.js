/* global AFRAME */
(function() {
    // Wait for DOM content to load
    document.addEventListener('DOMContentLoaded', function() {
        // Get UI elements
        const translateBtn = document.getElementById('translate-mode');
        const rotateBtn = document.getElementById('rotate-mode');
        const scaleBtn = document.getElementById('scale-mode');
        const enterVRBtn = document.getElementById('enter-vr');
        
        // Set up mode switching
        if (translateBtn && rotateBtn && scaleBtn) {
            // Mode switching
            translateBtn.addEventListener('click', () => setManipulationMode('translate'));
            rotateBtn.addEventListener('click', () => setManipulationMode('rotate'));
            scaleBtn.addEventListener('click', () => setManipulationMode('scale'));
        }
        
        // Initialize drag-drop from sidebar
        initSidebarDragDrop();
        
        // Initialize custom VR entry
        if (enterVRBtn) {
            enterVRBtn.addEventListener('click', function() {
                const scene = document.querySelector('a-scene');
                if (scene.hasLoaded) {
                    scene.enterVR();
                } else {
                    scene.addEventListener('loaded', function() {
                        scene.enterVR();
                    });
                }
            });
        }
        
        // Handle VR mode changes for UI visibility
        const scene = document.querySelector('a-scene');
        scene.addEventListener('enter-vr', handleEnterVR);
        scene.addEventListener('exit-vr', handleExitVR);
    });
    
    // Sets the manipulation mode for all objects
    function setManipulationMode(mode) {
        // Update UI
        const buttons = document.querySelectorAll('.tool-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        const activeBtn = document.getElementById(`${mode}-mode`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Update all manipulable objects
        const manipulables = document.querySelectorAll('[manipulable]');
        manipulables.forEach(el => {
            el.setAttribute('manipulable', 'mode', mode);
        });
        
        // Update for any currently selected object
        if (AFRAME.manipulableObjects) {
            AFRAME.manipulableObjects.forEach(obj => {
                if (obj.isSelected) {
                    obj.data.mode = mode;
                    obj.createTransformControls();
                }
            });
        }
    }
    
    // Initialize drag-drop from sidebar items
    function initSidebarDragDrop() {
        const items = document.querySelectorAll('.item[draggable="true"]');
        
        items.forEach(item => {
            // Touch support for mobile devices
            item.addEventListener('touchstart', function(e) {
                const modelType = this.getAttribute('data-model');
                if (!modelType) return;
                
                // Store the model type in a global variable
                window.currentDraggedModelType = modelType;
                
                // Show a feedback that item is selected
                this.classList.add('dragging');
            });
            
            // Handle click on mobile devices
            item.addEventListener('click', function() {
                const modelType = this.getAttribute('data-model');
                if (!modelType) return;
                
                createEntityAtCameraView(modelType);
            });
        });
        
        // Touch move and end for the scene
        document.addEventListener('touchmove', function(e) {
            // Just prevent default to allow dragging
            if (window.currentDraggedModelType) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('touchend', function(e) {
            if (!window.currentDraggedModelType) return;
            
            // Get touch position
            const touch = e.changedTouches[0];
            const canvas = document.querySelector('canvas.a-canvas');
            
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                // Check if touch ended over the canvas
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    
                    // Create entity at touch position
                    createEntityAtTouchPosition(window.currentDraggedModelType, touch, rect);
                }
            }
            
            // Reset state
            document.querySelectorAll('.item.dragging').forEach(el => {
                el.classList.remove('dragging');
            });
            window.currentDraggedModelType = null;
        });
    }
    
    // Create a new entity at the camera's current view
    function createEntityAtCameraView(modelType) {
        // Get camera position and direction
        const camera = document.getElementById('camera');
        if (!camera) return;
        
        const position = new THREE.Vector3();
        camera.object3D.getWorldPosition(position);
        
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(camera.object3D.quaternion);
        
        // Place object 3 meters in front of camera
        position.addScaledVector(direction, 3);
        
        // Ensure Y position is appropriate (on the ground)
        position.y = 0.5; // Half of object's height
        
        // Create entity
        createEntityFromTemplate(modelType, position);
    }
    
    // Create a new entity at the touch position
    function createEntityAtTouchPosition(modelType, touch, canvasRect) {
        // Convert touch coordinates to normalized device coordinates
        const x = ((touch.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
        const y = -((touch.clientY - canvasRect.top) / canvasRect.height) * 2 + 1;
        
        // Set up raycaster
        const raycaster = new THREE.Raycaster();
        const camera = document.getElementById('camera').getObject3D('camera');
        
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        
        // Raycast against the ground
        const ground = document.getElementById('ground').object3D;
        const intersects = raycaster.intersectObject(ground, true);
        
        if (intersects.length > 0) {
            // Create entity at intersection point
            createEntityFromTemplate(modelType, intersects[0].point);
        } else {
            // Fallback: Create in front of camera
            createEntityAtCameraView(modelType);
        }
    }
    
    // Create a new entity from a template
    function createEntityFromTemplate(modelType, position) {
        const template = document.getElementById(`${modelType}-template`);
        if (!template) {
            console.warn(`Template not found for model: ${modelType}`);
            return;
        }
        
        // Clone the template content
        const entityEl = document.importNode(template.content, true).children[0];
        
        // Set the position
        entityEl.setAttribute('position', {
            x: position.x,
            y: position.y,
            z: position.z
        });
        
        // Add to the scene
        const scene = document.querySelector('a-scene');
        scene.appendChild(entityEl);
        
        // Select the new entity after a brief delay to ensure it's initialized
        setTimeout(() => {
            entityEl.click();
        }, 100);
    }
    
    // Handle entering VR mode
    function handleEnterVR() {
        // Show hand tracking controllers
        const leftHand = document.getElementById('leftHand');
        const rightHand = document.getElementById('rightHand');
        
        if (leftHand) leftHand.setAttribute('visible', true);
        if (rightHand) rightHand.setAttribute('visible', true);
        
        // Hide UI elements or make VR-specific adjustments
        const uiContainer = document.getElementById('ui-container');
        if (uiContainer) uiContainer.style.display = 'none';
        
        // Enable raycaster on controllers
        if (rightHand && !rightHand.getAttribute('raycaster')) {
            rightHand.setAttribute('raycaster', {
                objects: '.interactive, .collidable',
                far: 20,
                lineColor: '#FFFFFF',
                lineOpacity: 0.5
            });
            
            rightHand.setAttribute('cursor', {
                rayOrigin: 'hand',
                fuse: false
            });
        }
    }
    
    // Handle exiting VR mode
    function handleExitVR() {
        // Hide hand tracking controllers
        const leftHand = document.getElementById('leftHand');
        const rightHand = document.getElementById('rightHand');
        
        if (leftHand) leftHand.setAttribute('visible', false);
        if (rightHand) rightHand.setAttribute('visible', false);
        
        // Show UI elements
        const uiContainer = document.getElementById('ui-container');
        if (uiContainer) uiContainer.style.display = 'block';
    }
})();