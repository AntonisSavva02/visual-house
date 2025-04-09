/* global AFRAME */
AFRAME.registerSystem('save-load-system', {
    init: function() {
        this.saveBtn = document.getElementById('save-design');
        this.loadBtn = document.getElementById('load-design');
        
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', this.saveDesign.bind(this));
        }
        
        if (this.loadBtn) {
            this.loadBtn.addEventListener('click', this.loadDesign.bind(this));
        }
    },
    
    saveDesign: function() {
        // Get all interactive elements
        const interactiveEls = Array.from(document.querySelectorAll('.interactive'));
        
        // Create a data structure to store the design
        const designData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            objects: []
        };
        
        // Store data for each object
        interactiveEls.forEach(el => {
            // Skip any template elements or hidden elements
            if (el.closest('template') || !el.object3D.visible) return;
            
            const objectData = {
                type: el.getAttribute('data-type') || 'unknown',
                model: this.getModelId(el),
                position: el.object3D.position.clone(),
                rotation: {
                    x: THREE.MathUtils.radToDeg(el.object3D.rotation.x),
                    y: THREE.MathUtils.radToDeg(el.object3D.rotation.y),
                    z: THREE.MathUtils.radToDeg(el.object3D.rotation.z)
                },
                scale: el.object3D.scale.clone()
            };
            
            designData.objects.push(objectData);
        });
        
        // Convert to JSON and save to local storage
        const designJson = JSON.stringify(designData);
        localStorage.setItem('homeDesign', designJson);
        
        // Create download link
        this.createDownloadLink(designJson, 'home-design.json');
        
        // Show confirmation
        this.showNotification('Design saved successfully!');
    },
    
    getModelId: function(el) {
        // Extract the model ID from the element
        if (el.hasAttribute('gltf-model')) {
            const modelUrl = el.getAttribute('gltf-model');
            // Extract ID from URL like "#model-id"
            return modelUrl.startsWith('#') ? modelUrl.substring(1) : modelUrl;
        }
        
        return null;
    },
    
    createDownloadLink: function(content, filename) {
        const blob = new Blob([content], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        
        // Append to body, click and remove
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(url), 100);
    },
    
    loadDesign: function() {
        // Check for saved design in local storage
        const designJson = localStorage.getItem('homeDesign');
        
        if (!designJson) {
            this.showNotification('No saved design found. You can also import a design file.');
            this.promptFileUpload();
            return;
        }
        
        try {
            this.loadDesignFromJson(designJson);
            this.showNotification('Design loaded successfully!');
        } catch (error) {
            console.error('Error loading design:', error);
            this.showNotification('Error loading design. See console for details.');
        }
    },
    
    promptFileUpload: function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = event => {
                const content = event.target.result;
                this.loadDesignFromJson(content);
            };
            reader.readAsText(file);
        };
        
        input.click();
    },
    
    loadDesignFromJson: function(jsonContent) {
        const designData = JSON.parse(jsonContent);
        
        // Check version compatibility
        if (!designData.version || !designData.objects) {
            throw new Error('Invalid design file format');
        }
        
        // Clear existing objects
        const existingObjects = Array.from(document.querySelectorAll('.interactive'));
        existingObjects.forEach(el => {
            if (!el.closest('template')) {
                el.parentNode.removeChild(el);
            }
        });
        
        // Create new objects from the design data
        designData.objects.forEach(obj => {
            if (!obj.model) return;
            
            const template = document.getElementById(`${obj.model}-template`);
            if (!template) {
                console.warn(`Template not found for model: ${obj.model}`);
                return;
            }
            
            // Clone the template content
            const entityEl = document.importNode(template.content, true).children[0];
            
            // Set the position, rotation, and scale
            entityEl.setAttribute('position', obj.position);
            entityEl.setAttribute('rotation', obj.rotation);
            entityEl.setAttribute('scale', obj.scale);
            
            // Add to the scene
            this.el.sceneEl.appendChild(entityEl);
        });
    },
    
    showNotification: function(message) {
        // Create or update notification element
        let notification = document.getElementById('notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 1000;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.style.opacity = '1';
        
        // Hide after delay
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 3000);
    }
});