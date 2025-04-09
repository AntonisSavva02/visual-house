/* global AFRAME, THREE */
AFRAME.registerComponent('sidebar', {
    schema: {
        selector: {type: 'string', default: '#sidebar'}
    },
    
    init: function() {
        this.sidebar = document.querySelector(this.data.selector);
        
        if (!this.sidebar) {
            console.warn('Sidebar element not found:', this.data.selector);
            return;
        }
        
        // Set up the drag and drop functionality
        this.setupDragAndDrop();
        
        // Handle resize events
        window.addEventListener('resize', this.onResize.bind(this));
    },
    
    setupDragAndDrop: function() {
        const items = this.sidebar.querySelectorAll('.item[draggable="true"]');
        const scene = this.el;
        
        items.forEach(item => {
            // Add drag start event
            item.addEventListener('dragstart', (event) => {
                const modelType = item.getAttribute('data-model');
                event.dataTransfer.setData('model/type', modelType);
                
                // Set a ghost image for dragging
                const img = item.querySelector('img');
                if (img) {
                    event.dataTransfer.setDragImage(img, 25, 25);
                }
            });
        });
        
        // Add drop target (the entire scene)
        const canvas = scene.canvas;
        
        canvas.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        });
        
        canvas.addEventListener('drop', (event) => {
            event.preventDefault();
            
            // Get the model type
            const modelType = event.dataTransfer.getData('model/type');
            if (!modelType) return;
            
            // Calculate drop position in 3D space
            const dropPos = this.getDropPosition(event);
            
            // Create new entity from template
            this.createEntityFromTemplate(modelType, dropPos);
        });
    },
    
    getDropPosition: function(event) {
        // Convert screen coordinates to normalized device coordinates
        const canvas = this.el.canvas;
        const rect = canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Set up raycaster
        const raycaster = new THREE.Raycaster();
        const camera = document.getElementById('camera').getObject3D('camera');
        
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        
        // Raycast against the ground
        const ground = document.getElementById('ground').object3D;
        const intersects = raycaster.intersectObject(ground, true);
        
        if (intersects.length > 0) {
            // Return the intersection point
            return intersects[0].point;
        } else {
            // Fallback: Fixed distance in front of camera
            const position = new THREE.Vector3(0, 0, -3);
            position.applyMatrix4(camera.matrixWorld);
            return position;
        }
    },
    
    createEntityFromTemplate: function(modelType, position) {
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
        this.el.appendChild(entityEl);
        
        // Select the new entity
        setTimeout(() => {
            entityEl.click();
        }, 100);
    },
    
    onResize: function() {
        // Handle any sidebar UI adjustments on resize
        // This is a placeholder for any responsive adjustments needed
    }
});