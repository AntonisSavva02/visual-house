/**
 * Visual-House - Interactive Home Design Tool
 * Main application controller
 * Last updated: 2025-04-23
 * Developer: AntonisSavva02
 */

const APP = {
    // App state
    initialized: false,
    mode: 'build',               // Current mode: 'build', 'edit', 'move', 'erase'
    isPlacing: false,            // Whether we're currently placing an object
    selectedItem: null,          // Currently selected item from the catalog
    selectedObject: null,        // Currently selected object in the scene
    placementValid: true,        // Whether current placement position is valid
    
    // UI elements (populated on init)
    categoryPanel: null,
    categoryTabs: null,
    itemsContainer: null,
    placementGuide: null,
    placementControls: null,
    notification: null,
    
    // Scene elements
    camera: null,
    cameraRig: null,
    houseContainer: null,
    placementIndicator: null,
    
    // Init function
    init: function() {
        console.log('Initializing APP...');
        
        // Get UI elements
        this.categoryPanel = document.getElementById('category-panel');
        this.categoryTabs = document.querySelectorAll('.category-tab');
        this.itemsContainer = document.getElementById('items-container');
        this.placementGuide = document.getElementById('placement-guide');
        this.placementControls = document.getElementById('placement-controls');
        this.notification = document.getElementById('notification');
        
        // Get scene elements
        this.camera = document.getElementById('camera');
        this.cameraRig = document.getElementById('camera-rig');
        this.houseContainer = document.getElementById('house-container');
        this.placementIndicator = document.getElementById('placement-indicator');
        
        // Initialize components
        this.initializeUI();
        this.initializeEventListeners();
        
        // Initialize other components
        this.Camera.init(this);
        this.Collision.init(this);
        
        // Set initial state
        this.setMode('build');
        this.showCategory('structures');
        
        // Create grid for placement
        this.createGrid();
        
        // Add debug information for model loading
        this.setupModelDebugHelpers();
        
        this.initialized = true;
        console.log('APP initialized successfully');
        
        // Show welcome notification
        this.showNotification('Welcome to Visual-House! Select an item to begin.');
    },
    
    // Setup debug helpers for model loading
    setupModelDebugHelpers: function() {
        // Monitor asset loading
        const assets = document.querySelector('a-assets');
        if (assets) {
            assets.addEventListener('loaded', () => {
                console.log('All assets loaded successfully');
            });
            
            // Check for timeout
            assets.addEventListener('timeout', () => {
                console.warn('Asset loading timed out');
                this.showNotification('Some assets failed to load, using default models', 'warning');
            });
        }
        
        // Override model error handling to provide better visibility
        const scene = document.querySelector('a-scene');
        if (scene) {
            scene.addEventListener('model-error', (e) => {
                console.error('Error loading model:', e.detail);
                this.showNotification('Error loading model, using placeholder', 'error');
            });
        }
    },
    
    // Create grid for placement
    createGrid: function() {
        const gridEntity = document.getElementById('grid');
        gridEntity.innerHTML = '';
        
        // Create grid lines
        const gridSize = 50;
        const spacing = 1;
        
        // Create horizontal lines
        for (let i = -gridSize/2; i <= gridSize/2; i += spacing) {
            const line = document.createElement('a-entity');
            line.setAttribute('line', {
                start: { x: -gridSize/2, y: 0.01, z: i },
                end: { x: gridSize/2, y: 0.01, z: i },
                color: '#CCCCCC',
                opacity: i === 0 ? 0.8 : 0.2, // Highlight the center line
            });
            gridEntity.appendChild(line);
        }
        
        // Create vertical lines
        for (let i = -gridSize/2; i <= gridSize/2; i += spacing) {
            const line = document.createElement('a-entity');
            line.setAttribute('line', {
                start: { x: i, y: 0.01, z: -gridSize/2 },
                end: { x: i, y: 0.01, z: gridSize/2 },
                color: '#CCCCCC',
                opacity: i === 0 ? 0.8 : 0.2, // Highlight the center line
            });
            gridEntity.appendChild(line);
        }
    },
    
    // Initialize UI
    initializeUI: function() {
        // Populate items from MODELS
        this.populateItemsByCategory('structures');
        
        // Setup category tabs
        this.categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.dataset.tab;
                this.showCategory(category);
            });
        });
        
        // Setup toolbar buttons
        document.getElementById('build-btn').addEventListener('click', () => this.setMode('build'));
        document.getElementById('decorate-btn').addEventListener('click', () => this.setMode('decorate'));
        document.getElementById('edit-btn').addEventListener('click', () => this.setMode('edit'));
        document.getElementById('move-btn').addEventListener('click', () => this.setMode('move'));
        document.getElementById('erase-btn').addEventListener('click', () => this.setMode('erase'));
        
        // Setup view controls
        document.getElementById('view-2d').addEventListener('click', () => this.Camera.set2DView());
        document.getElementById('view-3d').addEventListener('click', () => this.Camera.set3DView());
        document.getElementById('zoom-in').addEventListener('click', () => this.Camera.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.Camera.zoomOut());
        
        // Setup placement controls
        document.getElementById('place-confirm').addEventListener('click', () => this.confirmPlacement());
        document.getElementById('place-cancel').addEventListener('click', () => this.cancelPlacement());
        document.getElementById('place-rotate').addEventListener('click', () => this.rotatePlacementObject());
        
        // Setup context menu
        document.getElementById('edit-btn').addEventListener('click', () => this.editSelectedObject());
        document.getElementById('rotate-btn').addEventListener('click', () => this.rotateSelectedObject());
        document.getElementById('duplicate-btn').addEventListener('click', () => this.duplicateSelectedObject());
        document.getElementById('delete-btn').addEventListener('click', () => this.deleteSelectedObject());
        
        // Setup properties panel close button
        document.getElementById('properties-close').addEventListener('click', () => {
            document.getElementById('properties-panel').style.display = 'none';
        });
    },
    
    // Initialize event listeners
    initializeEventListeners: function() {
        // Add raycaster click event listener
        const scene = document.querySelector('a-scene');
        scene.addEventListener('click', (e) => this.handleSceneClick(e));
        
        // Add mousemove for object placement
        scene.addEventListener('mousemove', (e) => {
            if (this.isPlacing) {
                this.updatePlacementIndicator(e);
            }
        });
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape key cancels placement or selection
            if (e.key === 'Escape') {
                if (this.isPlacing) {
                    this.cancelPlacement();
                } else if (this.selectedObject) {
                    this.deselectObject();
                }
            }
            
            // Delete key removes selected object
            if (e.key === 'Delete' && this.selectedObject) {
                this.deleteSelectedObject();
            }
            
            // R key rotates object being placed or selected
            if (e.key === 'r' || e.key === 'R') {
                if (this.isPlacing) {
                    this.rotatePlacementObject();
                } else if (this.selectedObject) {
                    this.rotateSelectedObject();
                }
            }
        });
    },
    
    // Set current mode (build, edit, move, erase)
    setMode: function(mode) {
        // Cancel any ongoing placement
        if (this.isPlacing) {
            this.cancelPlacement();
        }
        
        // Deselect any selected object
        this.deselectObject();
        
        // Update mode
        this.mode = mode;
        
        // Update UI
        const buttons = document.querySelectorAll('.build-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}-btn`).classList.add('active');
        
        // Show/hide UI based on mode
        if (mode === 'build' || mode === 'decorate') {
            this.categoryPanel.style.display = 'flex';
            if (mode === 'build') {
                this.showCategory('structures');
            } else {
                this.showCategory('decor');
            }
            this.showNotification(`${mode.charAt(0).toUpperCase() + mode.slice(1)} mode: Select an item to place`);
        } else {
            this.categoryPanel.style.display = 'none';
            this.showNotification(`${mode.charAt(0).toUpperCase() + mode.slice(1)} mode: Click on objects to ${mode}`);
        }
    },
    
    // Show category
    showCategory: function(category) {
        // Update tabs
        this.categoryTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === category);
        });
        
        // Populate items
        this.populateItemsByCategory(category);
    },
    
    // Populate items grid with items from a category
    populateItemsByCategory: function(category) {
        // Clear previous items
        this.itemsContainer.innerHTML = '';
        
        // Find all models in the selected category
        const categoryItems = {};
        
        // Group by subcategory
        Object.keys(MODELS).forEach(key => {
            const model = MODELS[key];
            if (model.category === category) {
                // Determine subcategory based on model key
                let subcategory = 'Other';
                if (key.includes('wall')) subcategory = 'Walls';
                else if (key.includes('floor')) subcategory = 'Floors';
                else if (key.includes('roof')) subcategory = 'Roofs';
                else if (key.includes('bathroom') || key.includes('toilet')) subcategory = 'Bathroom';
                else if (key.includes('bed') || key.includes('wardrobe')) subcategory = 'Bedroom';
                else if (key.includes('sofa') || key.includes('chair')) subcategory = 'Seating';
                else if (key.includes('table')) subcategory = 'Tables';
                else if (key.includes('carpet')) subcategory = 'Carpets';
                else if (key.includes('lamp')) subcategory = 'Lighting';
                
                // Add to subcategory
                if (!categoryItems[subcategory]) {
                    categoryItems[subcategory] = [];
                }
                categoryItems[subcategory].push({ key, model });
            }
        });
        
        // Create subcategory containers
        Object.keys(categoryItems).sort().forEach(subcategory => {
            const items = categoryItems[subcategory];
            
            // Create subcategory title
            const subcategoryDiv = document.createElement('div');
            subcategoryDiv.className = 'subcategory';
            
            const title = document.createElement('div');
            title.className = 'subcategory-title';
            
            // Add icon based on subcategory
            let icon = 'cube';
            if (subcategory === 'Walls') icon = 'square';
            else if (subcategory === 'Floors') icon = 'layer-group';
            else if (subcategory === 'Roofs') icon = 'home';
            else if (subcategory === 'Bathroom') icon = 'bath';
            else if (subcategory === 'Bedroom') icon = 'bed';
            else if (subcategory === 'Seating') icon = 'couch';
            else if (subcategory === 'Tables') icon = 'table';
            else if (subcategory === 'Carpets') icon = 'rug';
            else if (subcategory === 'Lighting') icon = 'lightbulb';
            
            title.innerHTML = `<div class="icon"><i class="fas fa-${icon}"></i></div>${subcategory}`;
            subcategoryDiv.appendChild(title);
            
            // Create grid for items
            const grid = document.createElement('div');
            grid.className = 'items-grid';
            
            // Add each item
            items.forEach(item => {
                const itemCard = document.createElement('div');
                itemCard.className = 'item-card';
                itemCard.dataset.item = item.key;
                
                const preview = document.createElement('div');
                preview.className = 'item-preview';
                preview.innerHTML = `<div class="item-icon"><i class="${item.model.icon}"></i></div>`;
                
                const label = document.createElement('div');
                label.className = 'item-label';
                label.textContent = item.model.displayName;
                
                itemCard.appendChild(preview);
                itemCard.appendChild(label);
                
                // Add click handler
                itemCard.addEventListener('click', () => this.selectItem(item.key));
                
                grid.appendChild(itemCard);
            });
            
            subcategoryDiv.appendChild(grid);
            this.itemsContainer.appendChild(subcategoryDiv);
        });
    },
    
    // Select item from catalog
    selectItem: function(itemKey) {
        this.selectedItem = itemKey;
        
        // Update UI
        const itemCards = document.querySelectorAll('.item-card');
        itemCards.forEach(card => {
            card.classList.toggle('active', card.dataset.item === itemKey);
        });
        
        // Start placement
        this.startPlacement();
    },
    
    // Start placing an object
    startPlacement: function() {
        if (!this.selectedItem || !MODELS[this.selectedItem]) {
            console.error('No item selected for placement');
            return;
        }
        
        const model = MODELS[this.selectedItem];
        
        // Show placement indicator
        this.isPlacing = true;
        this.placementValid = true;
        
        // Create indicator with model
        const indicator = this.placementIndicator;
        indicator.innerHTML = '';
        
        // Create model entity with enhanced loading handler
        const modelEntity = document.createElement('a-entity');
        modelEntity.setAttribute('gltf-model', model.model);
        modelEntity.setAttribute('model-handler', {
            modelSrc: model.model,
            defaultColor: model.materials[0] || '#FF5555',
            modelName: this.selectedItem,
            category: model.category
        });
        modelEntity.setAttribute('scale', model.defaultScale);
        modelEntity.setAttribute('rotation', { x: 0, y: 0, z: 0 });
        
        // Add semi-transparent material
        modelEntity.setAttribute('material', {
            opacity: 0.7,
            transparent: true,
            color: this.placementValid ? '#88FF88' : '#FF8888'
        });
        
        // Add a backup box in case the model doesn't load
        const backupBox = document.createElement('a-box');
        backupBox.setAttribute('class', 'backup-box');
        backupBox.setAttribute('width', model.boundingBox.width);
        backupBox.setAttribute('height', model.boundingBox.height);
        backupBox.setAttribute('depth', model.boundingBox.depth);
        backupBox.setAttribute('material', {
            color: model.materials[0] || '#FF5555',
            opacity: 0.8,
            wireframe: true
        });
        
        // Add both elements to indicator
        indicator.appendChild(modelEntity);
        indicator.appendChild(backupBox);
        
        indicator.setAttribute('visible', true);
        indicator.setAttribute('position', { x: 0, y: 0.5, z: 0 });
        indicator.setAttribute('rotation', { x: 0, y: 0, z: 0 });
        
        // Show placement guide and controls
        this.placementGuide.classList.add('show');
        this.placementGuide.querySelector('.text').textContent = `Click to place ${model.displayName}`;
        
        this.placementControls.classList.add('show');
    },
    
    // Update placement indicator position
    updatePlacementIndicator: function(event) {
        if (!this.isPlacing) return;
        
        // Get intersection with the ground
        const intersection = this.Camera.getGroundIntersection(event);
        if (!intersection) return;
        
        // Update position
        const position = intersection.point;
        
        // Snap to grid
        position.x = Math.round(position.x);
        position.z = Math.round(position.z);
        position.y = Math.max(0.5, position.y); // Ensure it's above ground
        
        this.placementIndicator.setAttribute('position', position);
        
        // Check for placement validity
        const modelData = MODELS[this.selectedItem];
        const boundingBox = this.calculateBoundingBox(
            position,
            this.placementIndicator.getAttribute('rotation'),
            modelData.boundingBox
        );
        
        // Check if placement is valid
        this.placementValid = this.isPlacementValid(boundingBox, this.selectedItem);
        
        // Update indicator color based on validity
        const indicator = this.placementIndicator.firstChild;
        if (indicator) {
            indicator.setAttribute('material', {
                opacity: 0.7,
                transparent: true,
                color: this.placementValid ? '#88FF88' : '#FF8888'
            });
        }
    },
    
    // Calculate bounding box for collision detection
    calculateBoundingBox: function(position, rotation, size) {
        // Simple AABB calculation without rotation consideration
        const halfWidth = size.width / 2;
        const halfHeight = size.height / 2;
        const halfDepth = size.depth / 2;
        
        return {
            min: {
                x: position.x - halfWidth,
                y: position.y - halfHeight,
                z: position.z - halfDepth
            },
            max: {
                x: position.x + halfWidth,
                y: position.y + halfHeight,
                z: position.z + halfDepth
            }
        };
    },
    
    // Check if placement is valid (no collisions)
    isPlacementValid: function(boundingBox, objectType, excludeElement) {
        // Check collisions with other objects
        return this.Collision.checkPlacement(boundingBox, excludeElement);
    },
    
    // Rotate placement object
    rotatePlacementObject: function() {
        if (!this.isPlacing) return;
        
        // Get current rotation and add 90 degrees
        const rotation = this.placementIndicator.getAttribute('rotation');
        rotation.y = (rotation.y + 90) % 360;
        
        this.placementIndicator.setAttribute('rotation', rotation);
        
        // Update collision detection
        const position = this.placementIndicator.getAttribute('position');
        const modelData = MODELS[this.selectedItem];
        const boundingBox = this.calculateBoundingBox(position, rotation, modelData.boundingBox);
        
        // Check if placement is valid with new rotation
        this.placementValid = this.isPlacementValid(boundingBox, this.selectedItem);
    },
    
    // Confirm placement of object
    confirmPlacement: function() {
        if (!this.isPlacing || !this.placementValid) return;
        
        // Get the indicator position and rotation
        const position = this.placementIndicator.getAttribute('position');
        const rotation = this.placementIndicator.getAttribute('rotation');
        
        // Create the actual object
        this.createObject(this.selectedItem, position, rotation);
        
        // Show success notification
        const modelName = MODELS[this.selectedItem].displayName;
        this.showNotification(`Placed ${modelName} successfully`, 'success');
        
        // Continue placing the same object
        this.startPlacement();
    },
    
    // Cancel placement
    cancelPlacement: function() {
        if (!this.isPlacing) return;
        
        // Hide placement indicator
        this.isPlacing = false;
        this.placementIndicator.setAttribute('visible', false);
        
        // Hide placement guide and controls
        this.placementGuide.classList.remove('show');
        this.placementControls.classList.remove('show');
        
        // Deselect item
        this.selectedItem = null;
        
        // Update UI
        const itemCards = document.querySelectorAll('.item-card');
        itemCards.forEach(card => card.classList.remove('active'));
    },
    
    // Create object in the scene
    createObject: function(objectType, position, rotation) {
        if (!objectType || !MODELS[objectType]) {
            console.error(`Invalid model type: ${objectType}`);
            return;
        }
        
        const objectData = MODELS[objectType];
        
        // Ensure position is above ground
        position.y = Math.max(0.5, position.y);
        
        // Create object entity with enhanced model handler
        const obj = document.createElement('a-entity');
        obj.setAttribute('class', 'interactive collidable');
        obj.setAttribute('data-object-type', objectType);
        obj.setAttribute('gltf-model', objectData.model);
        obj.setAttribute('model-handler', {
            modelSrc: objectData.model,
            defaultColor: objectData.materials[0] || '#FF5555',
            modelName: objectType,
            category: objectData.category
        });
        obj.setAttribute('position', position);
        obj.setAttribute('rotation', rotation);
        obj.setAttribute('scale', objectData.defaultScale);
        obj.setAttribute('shadow', 'cast: true; receive: true');
        obj.setAttribute('visible', true);
        
        // Apply default material/color directly with emissive property to make it glow
        obj.setAttribute('material', {
            color: objectData.materials[0] || '#FF5555',
            metalness: 0.2,
            roughness: 0.8,
            emissive: objectData.materials[0] || '#FF5555',
            emissiveIntensity: 0.3,
            opacity: 1.0,
            transparent: false
        });
        
        // Add a backup box in case the model doesn't load
        const backupBox = document.createElement('a-box');
        backupBox.setAttribute('class', 'backup-box');
        backupBox.setAttribute('width', objectData.boundingBox.width);
        backupBox.setAttribute('height', objectData.boundingBox.height);
        backupBox.setAttribute('depth', objectData.boundingBox.depth);
        backupBox.setAttribute('material', {
            color: objectData.materials[0] || '#FF5555',
            opacity: 0.8,
            wireframe: true
        });
        obj.appendChild(backupBox);
        
        // Add a point light to help make the object visible
        const pointLight = document.createElement('a-entity');
        pointLight.setAttribute('light', {
            type: 'point',
            color: '#FFFFFF',
            intensity: 0.5,
            distance: 3
        });
        pointLight.setAttribute('position', '0 1 0');
        obj.appendChild(pointLight);
        
        // Add to house container
        this.houseContainer.appendChild(obj);
        
        // Debug log
        console.log(`Created object: ${objectType} at position:`, position);
        
        // Hide backup box when model loads
        obj.addEventListener('model-loaded', function() {
            console.log(`Model loaded: ${objectType}`);
            backupBox.setAttribute('visible', false);
            
            // Ensure object is visible
            setTimeout(() => {
                obj.setAttribute('visible', true);
                obj.object3D.visible = true;
                
                // Force update
                if (obj.object3D) {
                    obj.object3D.traverse((node) => {
                        if (node.isMesh) {
                            node.visible = true;
                            if (node.material) {
                                node.material.needsUpdate = true;
                            }
                        }
                    });
                }
            }, 100);
        });
        
        // Add click handler for object selection
        obj.addEventListener('click', (e) => {
            // Prevent event propagation
            e.stopPropagation();
            
            // Handle based on current mode
            switch(this.mode) {
                case 'edit':
                    this.selectObject(obj);
                    break;
                case 'move':
                    this.startMovingObject(obj);
                    break;
                case 'erase':
                    this.deleteObject(obj);
                    break;
                default:
                    // In build or decorate mode, clicking on objects does nothing
                    break;
            }
        });
        
        return obj;
    },
    
    // Force an object to be visible using all possible means
    forceObjectVisibility: function(obj) {
        if (!obj) return;
        
        // Force visibility at A-Frame level
        obj.setAttribute('visible', true);
        
        // Apply direct object3D visibility if available
        if (obj.object3D) {
            obj.object3D.visible = true;
            
            // Traverse all children and make them visible
            obj.object3D.traverse((node) => {
                node.visible = true;
                
                if (node.isMesh) {
                    // Apply material if missing
                    if (!node.material) {
                        const objType = obj.getAttribute('data-object-type');
                        const color = (MODELS[objType] && MODELS[objType].materials && 
                                     MODELS[objType].materials[0]) || '#FF5555';
                        node.material = new THREE.MeshStandardMaterial({
                            color: color,
                            metalness: 0.2,
                            roughness: 0.8
                        });
                    }
                    
                    // Make material visible
                    node.material.transparent = false;
                    node.material.opacity = 1.0;
                    node.material.needsUpdate = true;
                }
            });
        }
    },
    
    // Handle scene click
    handleSceneClick: function(event) {
        if (this.isPlacing && this.placementValid) {
            // When placing, click confirms placement at the indicator position
            this.confirmPlacement();
        } else if (event.target.id === 'ground' || event.target.closest('#ground')) {
            // Clicking on ground deselects objects
            this.deselectObject();
        }
    },
    
    // Select object
    selectObject: function(obj) {
        // Deselect previous object
        this.deselectObject();
        
        // Select new object
        this.selectedObject = obj;
        
        // Highlight selected object
        obj.setAttribute('material', {
            opacity: 1,
            transparent: true,
            emissive: '#5B8BFF',
            emissiveIntensity: 0.5
        });
        
        // Show object menu
        this.showObjectMenu(obj);
        
        // Show properties panel
        this.showPropertiesPanel(obj);
    },
    
    // Deselect object
    deselectObject: function() {
        if (!this.selectedObject) return;
        
        // Remove highlight
        this.selectedObject.removeAttribute('material');
        
        // Hide object menu
        const objectMenu = document.getElementById('object-menu');
        objectMenu.style.display = 'none';
        
        // Hide properties panel
        const propertiesPanel = document.getElementById('properties-panel');
        propertiesPanel.style.display = 'none';
        
        this.selectedObject = null;
    },
    
    // Show object menu near the selected object
    showObjectMenu: function(obj) {
        const objectMenu = document.getElementById('object-menu');
        
        // Get object's screen position
        const objPos = obj.getAttribute('position');
        const screenPos = this.Camera.worldToScreen(objPos);
        
        // Position menu
        objectMenu.style.display = 'flex';
        objectMenu.style.left = `${screenPos.x + 50}px`; // Offset to not overlap the object
        objectMenu.style.top = `${screenPos.y - 60}px`; // Position above the object
    },
    
    // Show properties panel with object properties
    showPropertiesPanel: function(obj) {
        const propertiesPanel = document.getElementById('properties-panel');
        const propertiesContent = document.getElementById('properties-content');
        
        // Get object type and data
        const objectType = obj.getAttribute('data-object-type');
        const objectData = MODELS[objectType];
        
        // Create properties content
        propertiesContent.innerHTML = '';
        
        // Object Type group
        const typeGroup = document.createElement('div');
        typeGroup.className = 'property-group';
        typeGroup.innerHTML = `
            <div class="group-title">Object Info</div>
            <div class="property-row">
                <label>Type</label>
                <input type="text" value="${objectData.displayName}" disabled>
            </div>
            <div class="property-row">
                <label>Category</label>
                <input type="text" value="${objectData.category.charAt(0).toUpperCase() + objectData.category.slice(1)}" disabled>
            </div>
        `;
        propertiesContent.appendChild(typeGroup);
        
        // Position group
        const posGroup = document.createElement('div');
        posGroup.className = 'property-group';
        posGroup.innerHTML = `
            <div class="group-title">Position</div>
            <div class="property-row">
                <label>X Position</label>
                <div class="slider-control">
                    <div class="slider-row">
                        <input type="range" id="pos-x" min="-25" max="25" value="${obj.getAttribute('position').x}" step="0.5">
                        <span class="slider-value" id="pos-x-value">${obj.getAttribute('position').x}</span>
                    </div>
                </div>
            </div>
            <div class="property-row">
                <label>Z Position</label>
                <div class="slider-control">
                    <div class="slider-row">
                        <input type="range" id="pos-z" min="-25" max="25" value="${obj.getAttribute('position').z}" step="0.5">
                        <span class="slider-value" id="pos-z-value">${obj.getAttribute('position').z}</span>
                    </div>
                </div>
            </div>
        `;
        propertiesContent.appendChild(posGroup);
        
        // Rotation group
        const rotGroup = document.createElement('div');
        rotGroup.className = 'property-group';
        rotGroup.innerHTML = `
            <div class="group-title">Rotation</div>
            <div class="property-row">
                <label>Y Rotation</label>
                <div class="slider-control">
                    <div class="slider-row">
                        <input type="range" id="rot-y" min="0" max="359" value="${obj.getAttribute('rotation').y}" step="45">
                        <span class="slider-value" id="rot-y-value">${obj.getAttribute('rotation').y}°</span>
                    </div>
                </div>
            </div>
        `;
        propertiesContent.appendChild(rotGroup);
        
        // Materials group (if available)
        if (objectData.materials && objectData.materials.length > 0) {
            const matGroup = document.createElement('div');
            matGroup.className = 'property-group';
            matGroup.innerHTML = `
                <div class="group-title">Appearance</div>
                <div class="property-row">
                    <label>Material</label>
                    <div class="color-options" id="color-options">
                        ${objectData.materials.map((color, index) => `
                            <div class="color-option" style="background-color: ${color}" data-color="${color}" data-index="${index}"></div>
                        `).join('')}
                    </div>
                </div>
            `;
            propertiesContent.appendChild(matGroup);
        }
        
        // Actions group
        const actionsGroup = document.createElement('div');
        actionsGroup.className = 'property-group';
        actionsGroup.innerHTML = `
            <div class="group-title">Actions</div>
            <div class="property-actions">
                <div class="property-btn btn-secondary" id="duplicate-property">Duplicate</div>
                <div class="property-btn danger" id="delete-property">Delete</div>
            </div>
        `;
        propertiesContent.appendChild(actionsGroup);
        
        // Add event listeners to UI controls
        
        // Position X slider
        const posXSlider = document.getElementById('pos-x');
        const posXValue = document.getElementById('pos-x-value');
        posXSlider.addEventListener('input', () => {
            const value = parseFloat(posXSlider.value);
            posXValue.textContent = value;
            const position = obj.getAttribute('position');
            position.x = value;
            obj.setAttribute('position', position);
        });
        
        // Position Z slider
        const posZSlider = document.getElementById('pos-z');
        const posZValue = document.getElementById('pos-z-value');
        posZSlider.addEventListener('input', () => {
            const value = parseFloat(posZSlider.value);
            posZValue.textContent = value;
            const position = obj.getAttribute('position');
            position.z = value;
            obj.setAttribute('position', position);
        });
        
        // Rotation Y slider
        const rotYSlider = document.getElementById('rot-y');
        const rotYValue = document.getElementById('rot-y-value');
        rotYSlider.addEventListener('input', () => {
            const value = parseInt(rotYSlider.value);
            rotYValue.textContent = `${value}°`;
            const rotation = obj.getAttribute('rotation');
            rotation.y = value;
            obj.setAttribute('rotation', rotation);
        });
        
        // Color options
        const colorOptions = document.querySelectorAll('#color-options .color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                const color = option.dataset.color;
                
                // Highlight selected color
                colorOptions.forEach(c => c.classList.remove('active'));
                option.classList.add('active');
                
                // Apply color to object
                obj.setAttribute('material', {
                    color: color,
                    emissive: '#5B8BFF',
                    emissiveIntensity: 0.2
                });
            });
        });
        
        // Duplicate button
        document.getElementById('duplicate-property').addEventListener('click', () => {
            this.duplicateSelectedObject();
        });
        
        // Delete button
        document.getElementById('delete-property').addEventListener('click', () => {
            this.deleteSelectedObject();
        });
        
        // Show panel
        propertiesPanel.style.display = 'block';
    },
    
    // Edit selected object
    editSelectedObject: function() {
        if (!this.selectedObject) return;
        
        // Show properties panel
        this.showPropertiesPanel(this.selectedObject);
    },
    
    // Rotate selected object
    rotateSelectedObject: function() {
        if (!this.selectedObject) return;
        
        // Get current rotation and add 90 degrees
        const rotation = this.selectedObject.getAttribute('rotation');
        rotation.y = (rotation.y + 90) % 360;
        
        this.selectedObject.setAttribute('rotation', rotation);
        
        // Update properties panel if open
        const rotYSlider = document.getElementById('rot-y');
        const rotYValue = document.getElementById('rot-y-value');
        if (rotYSlider && rotYValue) {
            rotYSlider.value = rotation.y;
            rotYValue.textContent = `${rotation.y}°`;
        }
    },
    
    // Duplicate selected object
    duplicateSelectedObject: function() {
        if (!this.selectedObject) return;
        
        // Get object data
        const objectType = this.selectedObject.getAttribute('data-object-type');
        const position = this.selectedObject.getAttribute('position');
        const rotation = this.selectedObject.getAttribute('rotation');
        
        // Offset position slightly
        const newPosition = {
            x: position.x + 1,
            y: position.y,
            z: position.z + 1
        };
        
        // Create duplicate object
        const newObj = this.createObject(objectType, newPosition, rotation);
        
        // Select the new object
        this.selectObject(newObj);
        
        // Show notification
        this.showNotification('Object duplicated', 'success');
    },
    
    // Delete selected object
    deleteSelectedObject: function() {
        if (!this.selectedObject) return;
        
        // Remove object from scene
        this.deleteObject(this.selectedObject);
        
        // Clear selection
        this.selectedObject = null;
        
        // Hide object menu
        document.getElementById('object-menu').style.display = 'none';
        
        // Hide properties panel
        document.getElementById('properties-panel').style.display = 'none';
    },
    
    // Delete object from scene
    deleteObject: function(obj) {
        // Remove from house container
        obj.parentNode.removeChild(obj);
        
        // Show notification
        this.showNotification('Object deleted', 'success');
    },
    
    // Start moving an object
    startMovingObject: function(obj) {
        // Store reference to object being moved
        this.selectedObject = obj;
        
        // Show placement indicator at object's position
        const position = obj.getAttribute('position');
        const rotation = obj.getAttribute('rotation');
        const objectType = obj.getAttribute('data-object-type');
        
        // Create placement indicator
        this.isPlacing = true;
        this.placementValid = true;
        this.selectedItem = objectType;
        
        // Create indicator with model
        const indicator = this.placementIndicator;
        indicator.innerHTML = '';
        
        // Create model entity
        const modelEntity = document.createElement('a-entity');
        modelEntity.setAttribute('gltf-model', MODELS[objectType].model);
        modelEntity.setAttribute('scale', MODELS[objectType].defaultScale);
        modelEntity.setAttribute('rotation', rotation);
        
        // Add semi-transparent material for placement
        modelEntity.setAttribute('material', {
            opacity: 0.7,
            transparent: true,
            color: '#88FF88'
        });
        
        // Add a backup box as fallback
        const backupBox = document.createElement('a-box');
        backupBox.setAttribute('class', 'backup-box');
        backupBox.setAttribute('width', MODELS[objectType].boundingBox.width);
        backupBox.setAttribute('height', MODELS[objectType].boundingBox.height);
        backupBox.setAttribute('depth', MODELS[objectType].boundingBox.depth);
        backupBox.setAttribute('material', {
            color: MODELS[objectType].materials[0] || '#FF5555',
            opacity: 0.8,
            wireframe: true
        });
        
        indicator.appendChild(modelEntity);
        indicator.appendChild(backupBox);
        
        indicator.setAttribute('visible', true);
        indicator.setAttribute('position', position);
        indicator.setAttribute('rotation', rotation);
        
        // Hide the original object
        obj.setAttribute('visible', false);
        
        // Show placement guide and controls
        this.placementGuide.classList.add('show');
        this.placementGuide.querySelector('.text').textContent = 'Click to place object';
        
        this.placementControls.classList.add('show');
        
        // Setup confirm/cancel handlers for moving
        const confirmBtn = document.getElementById('place-confirm');
        const cancelBtn = document.getElementById('place-cancel');
        
        // Store original handlers
        this.originalConfirmHandler = confirmBtn.onclick;
        this.originalCancelHandler = cancelBtn.onclick;
        
        // Set new handlers
        confirmBtn.onclick = () => {
            // Apply new position and rotation to original object
            obj.setAttribute('position', this.placementIndicator.getAttribute('position'));
            obj.setAttribute('rotation', this.placementIndicator.getAttribute('rotation'));
            
            // Show the original object
            obj.setAttribute('visible', true);
            
            // End placement mode
            this.cancelPlacement();
            
            // Restore original handlers
            confirmBtn.onclick = this.originalConfirmHandler;
            cancelBtn.onclick = this.originalCancelHandler;
            
            // Show notification
            this.showNotification('Object moved', 'success');
            
            // Clear selection
            this.selectedObject = null;
        };
        
        cancelBtn.onclick = () => {
            // Show the original object without moving it
            obj.setAttribute('visible', true);
            
            // End placement mode
            this.cancelPlacement();
            
            // Restore original handlers
            confirmBtn.onclick = this.originalConfirmHandler;
            cancelBtn.onclick = this.originalCancelHandler;
            
            // Clear selection
            this.selectedObject = null;
        };
    },
    
    // Show notification
    showNotification: function(message, type = '') {
        const notification = this.notification;
        const textElement = document.getElementById('notification-text');
        
        // Set message and type
        textElement.textContent = message;
        notification.className = 'notification';
        
        if (type) {
            notification.classList.add(type);
        }
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after 3 seconds
        clearTimeout(this.notificationTimeout);
        this.notificationTimeout = setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
};