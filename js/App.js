/**
 * EasyFloor - Interactive House Builder
 * Main application file
 */

// Global state
const APP = {
    mode: 'build', // build, decorate, edit, move, erase
    selectedItem: null,
    selectedElement: null,
    isPlacing: false,
    dragStartPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    placementValid: true,
    gridSize: 0.5, // Grid size in meters
    gridVisible: false,
    objects: [], // All placed objects
    currentRotation: 0,
    currentScale: { x: 1, y: 1, z: 1 },
    view: '3d', // 2d or 3d
    undoStack: [],
    redoStack: [],
    lastSaved: null,
    defaultHeight: 0, // For placing objects on the ground
    viewHeight: 15, // Default camera height
    selectionBox: null,
    debugMode: true, // Set to true to enable debug messages
    initialized: false,
    
    // Initialize the application
    init() {
        console.log("Initializing APP module...");
        if (this.initialized) {
            console.log("APP already initialized, skipping.");
            return;
        }
        
        this.setupEventListeners();
        this.setupGrid();
        this.loadSavedDesign();
        this.createSelectionBox();
        this.updateUI();
        
        // Initialize collision manager
        if (typeof CollisionManager !== 'undefined' && CollisionManager.init) {
            CollisionManager.init();
        } else {
            console.error("CollisionManager not found or missing init method!");
        }
        
        // Initialize camera controller
        if (typeof CameraController !== 'undefined' && CameraController.init) {
            CameraController.init();
        } else {
            console.error("CameraController not found or missing init method!");
        }
        
        // Show notification
        this.showNotification('Welcome to EasyFloor! Start by selecting an item from the panel.', 'info');
        
        // Initialize button event listeners
        this.initializeButtons();
        
        // Add error handling for model loading
        document.addEventListener('model-error', function(e) {
            console.error('Model error:', e.detail.src);
            APP.showNotification(`Error loading model: ${e.detail.src}`, 'error');
        });
        
        // Debug log to verify initialization
        this.debug('Application initialized');

        // Populate items grid initially with structures tab content
        this.switchCategoryContent('structures');
        
        // Mark as initialized
        this.initialized = true;
    },
    
    // Debug helper function
    debug(message, object) {
        if (this.debugMode) {
            if (object) {
                console.log(`[DEBUG] ${message}`, object);
            } else {
                console.log(`[DEBUG] ${message}`);
            }
        }
    },

    // Initialize button handlers
    initializeButtons() {
        console.log("Initializing button event listeners...");
        
        // Mode buttons - bottom toolbar
        const buildBtn = document.getElementById('build-btn');
        const decorateBtn = document.getElementById('decorate-btn');
        const editBtn = document.getElementById('edit-btn');
        const moveBtn = document.getElementById('move-btn');
        const eraseBtn = document.getElementById('erase-btn');
        
        // Clear any existing handlers
        const clearEventHandlers = (element) => {
            if (!element) return;
            const clone = element.cloneNode(true);
            if (element.parentNode) {
                element.parentNode.replaceChild(clone, element);
            }
            return clone;
        };
        
        // Redefine buttons after clearing handlers
        if (buildBtn) {
            const newBuildBtn = clearEventHandlers(buildBtn);
            newBuildBtn.onclick = (e) => {
                console.log('Build button clicked');
                this.setMode('build');
                e.stopPropagation();
            };
        }
        
        if (decorateBtn) {
            const newDecorateBtn = clearEventHandlers(decorateBtn);
            newDecorateBtn.onclick = (e) => {
                console.log('Decorate button clicked');
                this.setMode('decorate');
                e.stopPropagation();
            };
        }
        
        if (editBtn) {
            const newEditBtn = clearEventHandlers(editBtn);
            newEditBtn.onclick = (e) => {
                console.log('Edit button clicked');
                this.setMode('edit');
                e.stopPropagation();
            };
        }
        
        if (moveBtn) {
            const newMoveBtn = clearEventHandlers(moveBtn);
            newMoveBtn.onclick = (e) => {
                console.log('Move button clicked');
                this.setMode('move');
                e.stopPropagation();
            };
        }
        
        if (eraseBtn) {
            const newEraseBtn = clearEventHandlers(eraseBtn);
            newEraseBtn.onclick = (e) => {
                console.log('Erase button clicked');
                this.setMode('erase');
                e.stopPropagation();
            };
        }
        
        // View controls - right sidebar
        const view2dBtn = document.getElementById('view-2d');
        const view3dBtn = document.getElementById('view-3d');
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        
        if (view2dBtn) {
            const newView2dBtn = clearEventHandlers(view2dBtn);
            newView2dBtn.onclick = (e) => {
                console.log('2D view button clicked');
                this.setView('2d');
                e.stopPropagation();
            };
        }
        
        if (view3dBtn) {
            const newView3dBtn = clearEventHandlers(view3dBtn);
            newView3dBtn.onclick = (e) => {
                console.log('3D view button clicked');
                this.setView('3d');
                e.stopPropagation();
            };
        }
        
        if (zoomInBtn) {
            const newZoomInBtn = clearEventHandlers(zoomInBtn);
            newZoomInBtn.onclick = (e) => {
                console.log('Zoom in button clicked');
                if (typeof CameraController !== 'undefined' && CameraController.zoomIn) {
                    CameraController.zoomIn();
                }
                e.stopPropagation();
            };
        }
        
        if (zoomOutBtn) {
            const newZoomOutBtn = clearEventHandlers(zoomOutBtn);
            newZoomOutBtn.onclick = (e) => {
                console.log('Zoom out button clicked');
                if (typeof CameraController !== 'undefined' && CameraController.zoomOut) {
                    CameraController.zoomOut();
                }
                e.stopPropagation();
            };
        }
        
        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            const newTab = clearEventHandlers(tab);
            newTab.onclick = (e) => {
                console.log(`Category tab clicked: ${newTab.dataset.tab}`);
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                newTab.classList.add('active');
                this.switchCategoryContent(newTab.dataset.tab);
                e.stopPropagation();
            };
        });
        
        // Save/load/export buttons
        const saveBtn = document.getElementById('save-btn');
        const loadBtn = document.getElementById('load-btn');
        const exportBtn = document.getElementById('export-btn');
        
        if (saveBtn) {
            const newSaveBtn = clearEventHandlers(saveBtn);
            newSaveBtn.onclick = (e) => {
                console.log('Save button clicked');
                this.saveDesign();
                e.stopPropagation();
            };
        }
        
        if (loadBtn) {
            const newLoadBtn = clearEventHandlers(loadBtn);
            newLoadBtn.onclick = (e) => {
                console.log('Load button clicked');
                this.loadDesign();
                e.stopPropagation();
            };
        }
        
        if (exportBtn) {
            const newExportBtn = clearEventHandlers(exportBtn);
            newExportBtn.onclick = (e) => {
                console.log('Export button clicked');
                this.exportDesign();
                e.stopPropagation();
            };
        }
        
        // Placement control buttons
        const placeCancelBtn = document.getElementById('place-cancel');
        const placeRotateBtn = document.getElementById('place-rotate');
        const placeConfirmBtn = document.getElementById('place-confirm');
        
        if (placeCancelBtn) {
            const newPlaceCancelBtn = clearEventHandlers(placeCancelBtn);
            newPlaceCancelBtn.onclick = (e) => {
                console.log('Cancel placement button clicked');
                this.cancelPlacement();
                e.stopPropagation();
            };
        }
        
        if (placeRotateBtn) {
            const newPlaceRotateBtn = clearEventHandlers(placeRotateBtn);
            newPlaceRotateBtn.onclick = (e) => {
                console.log('Rotate placement button clicked');
                this.rotateObject();
                e.stopPropagation();
            };
        }
        
        if (placeConfirmBtn) {
            const newPlaceConfirmBtn = clearEventHandlers(placeConfirmBtn);
            newPlaceConfirmBtn.onclick = (e) => {
                console.log('Confirm placement button clicked');
                this.confirmPlacement();
                e.stopPropagation();
            };
        }
        
        // Properties panel close button
        const propertiesCloseBtn = document.getElementById('properties-close');
        if (propertiesCloseBtn) {
            const newPropertiesCloseBtn = clearEventHandlers(propertiesCloseBtn);
            newPropertiesCloseBtn.onclick = (e) => {
                console.log('Properties close button clicked');
                document.getElementById('properties-panel').style.display = 'none';
                e.stopPropagation();
            };
        }
        
        console.log('Button initialization complete!');
    },
    
    setupEventListeners() {
        console.log("Setting up event listeners...");
        
        // A-Frame scene events for mouse interaction
        const scene = document.querySelector('a-scene');
        
        if (scene) {
            scene.addEventListener('mousedown', (e) => {
                console.log('Mouse down on scene', e.detail);
                this.handleMouseDown(e);
            });
            
            scene.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            
            scene.addEventListener('mouseup', (e) => {
                console.log('Mouse up on scene', e.detail);
                this.handleMouseUp(e);
            });
            
            // Touch events for mobile
            scene.addEventListener('touchstart', (e) => this.handleTouchStart(e));
            scene.addEventListener('touchmove', (e) => this.handleTouchMove(e));
            scene.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        } else {
            console.error('A-Frame scene not found!');
        }
        
        // Object menu event listeners - context menu buttons
        const contextEditBtn = document.querySelector('#object-menu #edit-btn');
        const rotateBtn = document.getElementById('rotate-btn');
        const duplicateBtn = document.getElementById('duplicate-btn');
        const deleteBtn = document.getElementById('delete-btn');
        
        if (contextEditBtn) {
            contextEditBtn.addEventListener('click', (e) => { 
                console.log('Context menu edit button clicked');
                e.stopPropagation();
                this.editSelectedObject(); 
            });
        }
        
        if (rotateBtn) {
            rotateBtn.addEventListener('click', (e) => { 
                console.log('Context menu rotate button clicked');
                e.stopPropagation();
                this.rotateSelectedObject(); 
            });
        }
        
        if (duplicateBtn) {
            duplicateBtn.addEventListener('click', (e) => { 
                console.log('Context menu duplicate button clicked');
                e.stopPropagation();
                this.duplicateSelectedObject(); 
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => { 
                console.log('Context menu delete button clicked');
                e.stopPropagation();
                this.deleteSelectedObject(); 
            });
        }
        
        // Context menu for objects
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('a-entity') && e.target.closest('a-entity').classList.contains('interactive')) {
                e.preventDefault();
                this.showObjectMenu(e);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' && this.selectedElement) {
                this.deleteSelectedObject();
            }
            else if (e.key === 'Escape') {
                if (this.isPlacing) {
                    this.cancelPlacement();
                } else if (this.selectedElement) {
                    this.deselectObject();
                }
            }
            else if (e.key === 'r' && this.selectedElement) {
                this.rotateSelectedObject();
            }
            else if (e.ctrlKey && e.key === 'z') {
                this.undo();
            }
            else if (e.ctrlKey && e.key === 'y') {
                this.redo();
            }
            else if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveDesign();
            }
        });
        
        console.log("Event listeners setup completed!");
    },
    
    // Switch category content based on selected tab
    switchCategoryContent(tabName) {
        console.log(`Switching to category: ${tabName}`);
        
        let container = document.getElementById('items-container');
        if (!container) {
            // Create items container if it doesn't exist
            const categoryContent = document.querySelector('.category-content');
            if (!categoryContent) {
                console.error("Category content element not found");
                return;
            }
            container = document.createElement('div');
            container.id = 'items-container';
            container.className = 'items-grid';
            categoryContent.appendChild(container);
        }
        
        // Clear existing content
        container.innerHTML = ''; 
        
        // Filter items based on the selected category
        if (typeof MODELS === 'undefined') {
            console.error("MODELS object is undefined");
            return;
        }
        
        let itemsAdded = 0;
        
        Object.entries(MODELS).forEach(([key, model]) => {
            if (model && model.category === tabName) {
                const itemCard = this.createItemCard(key, model);
                container.appendChild(itemCard);
                itemsAdded++;
            }
        });
        
        console.log(`Added ${itemsAdded} items to the ${tabName} category`);
        
        // Attach click handlers to the new cards
        container.querySelectorAll('.item-card').forEach(item => {
            item.onclick = (e) => {
                console.log(`Item card clicked: ${item.dataset.item}`);
                
                document.querySelectorAll('.item-card').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                this.selectedItem = item.dataset.item;
                this.prepareObjectPlacement(this.selectedItem);
                
                e.stopPropagation();
            };
        });
    },
    
    createItemCard(key, model) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.item = key;
        
        card.innerHTML = `
            <div class="item-preview">
                <i class="${model.icon} item-icon"></i>
            </div>
            <div class="item-label">${model.displayName || key}</div>
        `;
        
        return card;
    },
    
    setupGrid() {
        const grid = document.getElementById('grid');
        if (!grid) {
            console.error("Grid element not found");
            return;
        }
        
        const size = 20; // Grid size in meters
        const divisions = size / this.gridSize;
        
        // Create grid lines
        for (let i = -size/2; i <= size/2; i += this.gridSize) {
            // X axis lines
            const xLine = document.createElement('a-entity');
            xLine.setAttribute('line', `start: ${i} 0.01 ${-size/2}; end: ${i} 0.01 ${size/2}; color: #BBBBBB; opacity: 0.3`);
            xLine.setAttribute('class', 'grid-line');
            grid.appendChild(xLine);
            
            // Z axis lines
            const zLine = document.createElement('a-entity');
            zLine.setAttribute('line', `start: ${-size/2} 0.01 ${i}; end: ${size/2} 0.01 ${i}; color: #BBBBBB; opacity: 0.3`);
            zLine.setAttribute('class', 'grid-line');
            grid.appendChild(zLine);
        }
        
        // Initialize grid visibility
        this.setGridVisibility(this.gridVisible);
    },
    
    // Method to toggle grid visibility
    setGridVisibility(visible) {
        this.gridVisible = visible;
        const gridLines = document.querySelectorAll('.grid-line');
        gridLines.forEach(line => {
            line.setAttribute('visible', visible);
        });
    },
    
    createSelectionBox() {
        // Create a selection box for highlighting selected objects
        const scene = document.querySelector('a-scene');
        if (!scene) {
            console.error("Scene element not found");
            return;
        }
        
        this.selectionBox = document.createElement('a-entity');
        this.selectionBox.setAttribute('id', 'selection-box');
        this.selectionBox.setAttribute('visible', 'false');
        scene.appendChild(this.selectionBox);
    },
    
    setMode(mode) {
        this.mode = mode;
        console.log(`Setting mode to: ${mode}`);
        
        // Update UI to reflect the current mode
        document.querySelectorAll('.build-btn').forEach(btn => btn.classList.remove('active'));
        const modeBtn = document.getElementById(`${mode}-btn`);
        if (modeBtn) {
            modeBtn.classList.add('active');
        }
        
        // Deselect current object if in erase mode
        if (mode === 'erase') {
            this.deselectObject();
            this.showNotification('Erase mode: Click on objects to remove them', 'info');
        } else if (mode === 'move') {
            this.showNotification('Move mode: Click and drag objects to reposition them', 'info');
        } else if (mode === 'edit') {
            this.showNotification('Edit mode: Click on objects to modify their properties', 'info');
        } else {
            const propertiesPanel = document.getElementById('properties-panel');
            if (propertiesPanel) {
                propertiesPanel.style.display = 'none';
            }
        }
        
        // Show or hide category panel based on mode
        const categoryPanel = document.getElementById('category-panel');
        if (categoryPanel) {
            if (mode === 'build' || mode === 'decorate') {
                categoryPanel.style.display = 'flex';
                
                // Show the appropriate tab based on mode
                const tabSelector = mode === 'build' ? '[data-tab="structures"]' : '[data-tab="furniture"]';
                const tab = document.querySelector(tabSelector);
                if (tab) {
                    tab.click();
                }
            } else {
                categoryPanel.style.display = 'none';
            }
        }
    },
    
    setView(view) {
        this.view = view;
        console.log(`Setting view to: ${view}`);
        
        // Update UI to reflect the current view
        document.querySelectorAll('#view-2d, #view-3d').forEach(btn => btn.classList.remove('active'));
        const viewBtn = document.getElementById(`view-${view}`);
        if (viewBtn) {
            viewBtn.classList.add('active');
        }
        
        // Adjust camera position and rotation based on view
        if (view === '2d') {
            if (typeof CameraController !== 'undefined' && CameraController.set2DView) {
                CameraController.set2DView();
            }
        } else {
            if (typeof CameraController !== 'undefined' && CameraController.set3DView) {
                CameraController.set3DView();
            }
        }
    },
    
    prepareObjectPlacement(objectType) {
        console.log(`Preparing placement for: ${objectType}`);
        
        if (!objectType) {
            console.error("No object type specified");
            return;
        }
        
        this.isPlacing = true;
        this.currentRotation = 0;
        
        // Get object details from models
        if (typeof MODELS === 'undefined') {
            console.error("MODELS not defined");
            return;
        }
        
        const objectData = MODELS[objectType];
        if (!objectData) {
            console.error(`Model type not found: ${objectType}`);
            this.showNotification(`Error: Model type ${objectType} not found`, 'error');
            return;
        }
        
        console.log("Object data:", objectData);
        
        // Create temporary object for placement preview
        const indicator = document.getElementById('placement-indicator');
        if (!indicator) {
            console.error("Placement indicator element not found");
            return;
        }
        
        indicator.innerHTML = ''; // Clear previous contents
        
        // Create object based on type
        const obj = this.createObject(objectType, {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: objectData.defaultScale || { x: 1, y: 1, z: 1 }
        });
        
        if (!obj) {
            console.error("Failed to create object");
            this.showNotification(`Error creating object of type: ${objectType}`, 'error');
            return;
        }
        
        // Set material to indicate placement validity
        if (objectData.model) {
            // For models, we need to add a semi-transparent overlay
            const overlay = document.createElement('a-entity');
            overlay.setAttribute('geometry', `primitive: box; width: ${objectData.boundingBox.width}; height: ${objectData.boundingBox.height}; depth: ${objectData.boundingBox.depth}`);
            overlay.setAttribute('material', 'opacity: 0.4; color: #19EFAA; wireframe: true');
            overlay.setAttribute('class', 'placement-overlay');
            obj.appendChild(overlay);
        } else {
            // For primitive objects, just set the opacity
            obj.querySelectorAll('[material]').forEach(el => {
                el.setAttribute('material', 'opacity', 0.6);
            });
        }
        
        obj.setAttribute('shadow', 'cast: true; receive: false');
        
        indicator.appendChild(obj);
        indicator.setAttribute('visible', true);
        
        // Show placement controls
        const placementControls = document.getElementById('placement-controls');
        if (placementControls) {
            placementControls.classList.add('show');
        } else {
            console.error("Placement controls not found");
        }
        
        // Show placement guide
        const placementGuide = document.getElementById('placement-guide');
        if (placementGuide) {
            const textElement = placementGuide.querySelector('.text');
            if (textElement) {
                textElement.textContent = `Click to place ${objectData.displayName || objectType}`;
            }
            placementGuide.classList.add('show');
        } else {
            console.error("Placement guide not found");
        }
        
        // Show grid overlay
        const gridOverlay = document.getElementById('grid-overlay');
        if (gridOverlay) {
            gridOverlay.classList.add('show');
        }
        
        // Set grid visibility
        this.setGridVisibility(true);
        
        console.log("Object placement prepared - indicator should be visible");
    },
    
    createObject(type, options = {}) {
        if (!type) {
            console.error("No object type specified");
            return null;
        }
        
        if (typeof MODELS === 'undefined') {
            console.error("MODELS not defined");
            return null;
        }
        
        const objectData = MODELS[type];
        if (!objectData) {
            console.error(`Model type not found: ${type}`);
            return null;
        }
        
        console.log(`Creating object of type: ${type}`);
        
        const entity = document.createElement('a-entity');
        
        // Set common attributes
        entity.setAttribute('class', 'interactive collidable');
        entity.setAttribute('data-type', type);
        
        // Set position, rotation, and scale
        if (options.position) {
            entity.setAttribute('position', options.position);
        }
        
        if (options.rotation) {
            entity.setAttribute('rotation', options.rotation);
        }
        
        if (options.scale) {
            entity.setAttribute('scale', options.scale);
        }
        
        // If this is a model-based object
        if (objectData.model) {
            // Create model entity
            entity.setAttribute('gltf-model', objectData.model);
            entity.setAttribute('shadow', 'cast: true; receive: true');
            
            // Apply default textures and materials
            this.applyDefaultTextures(entity, type);
        } 
        // Fall back to component-based or primitive creation if no model specified
        else if (objectData.components) {
            objectData.components.forEach(component => {
                const elem = document.createElement('a-entity');
                
                // Copy all attributes from the component
                Object.entries(component).forEach(([key, value]) => {
                    if (key !== 'children') {
                        elem.setAttribute(key, value);
                    }
                });
                
                // Add children if any
                if (component.children) {
                    component.children.forEach(child => {
                        const childElem = document.createElement('a-entity');
                        
                        Object.entries(child).forEach(([key, value]) => {
                            childElem.setAttribute(key, value);
                        });
                        
                        elem.appendChild(childElem);
                    });
                }
                
                entity.appendChild(elem);
            });
        } else {
            // Simple geometry for basic objects
            if (objectData.geometry) {
                entity.setAttribute('geometry', objectData.geometry);
            }
            
            if (objectData.material) {
                entity.setAttribute('material', objectData.material);
            }
        }
        
        return entity;
    },
    
    // Function to apply textures and materials to models
    applyDefaultTextures(obj, objectType) {
        if (!obj || !objectType) {
            console.warn("Missing parameters in applyDefaultTextures");
            return;
        }
        
        if (typeof MODELS === 'undefined') {
            console.error("MODELS not defined");
            return;
        }
        
        const objectData = MODELS[objectType];
        if (!objectData) return;
        
        // Set default material/color
        if (objectData.materialComponent && objectData.materials && objectData.materials.length > 0) {
            const defaultColor = objectData.materials[0];
            obj.setAttribute(`material__${objectData.materialComponent}`, `color: ${defaultColor}`);
            obj.setAttribute('data-color', defaultColor);
        }
        
        // For GLTF models, ensure they cast and receive shadows
        obj.setAttribute('shadow', 'cast: true; receive: true');
    },
    
    handleMouseDown(event) {
        console.log("Mouse down event:", event);
        
        // Store starting position
        const intersection = event.detail.intersection;
        if (!intersection) {
            console.log("No intersection in mouse down");
            return;
        }
        
        console.log("Intersection point:", intersection.point);
        
        this.dragStartPosition = {
            x: intersection.point.x,
            y: intersection.point.y,
            z: intersection.point.z
        };
        
        // Handle different modes
        if (this.isPlacing) {
            console.log("In placement mode - will handle in mouseup");
            // When placing, clicks handle confirmations in mouseup
        } 
        else if (this.mode === 'move' && event.target.classList.contains('interactive')) {
            // Select and start moving the clicked object
            this.selectedElement = event.target.closest('.interactive');
            this.selectObject(this.selectedElement);
            this.isDragging = true;
            console.log("Selected for moving:", this.selectedElement);
        }
        else if (this.mode === 'edit' && event.target.classList.contains('interactive')) {
            // Select the object and show properties panel
            this.selectedElement = event.target.closest('.interactive');
            this.selectObject(this.selectedElement);
            this.showPropertiesPanel();
            console.log("Selected for editing:", this.selectedElement);
        }
        else if (this.mode === 'erase' && event.target.classList.contains('interactive')) {
            // Delete the clicked object
            this.selectedElement = event.target.closest('.interactive');
            this.deleteObject(this.selectedElement);
            console.log("Object deleted");
        }
        else if (event.target.closest('#ground')) {
            // Clicked on ground - deselect any selected object
            this.deselectObject();
            console.log("Clicked on ground - deselecting");
        }
    },
    
    handleMouseMove(event) {
        const intersection = event.detail.intersection;
        if (!intersection) return;
        
        this.currentPosition = {
            x: intersection.point.x,
            y: intersection.point.y,
            z: intersection.point.z
        };
        
        if (this.isPlacing) {
            // Update position of placement indicator
            const indicator = document.getElementById('placement-indicator');
            if (!indicator) {
                console.error("Placement indicator not found");
                return;
            }
            
            // Snap to grid
            const snappedPos = this.snapToGrid(this.currentPosition);
            indicator.setAttribute('position', snappedPos);
            
            // Set rotation
            indicator.setAttribute('rotation', { x: 0, y: this.currentRotation, z: 0 });
            
            // Check for collisions
            const objectType = this.selectedItem;
            
            if (typeof MODELS === 'undefined') {
                console.error("MODELS not defined");
                return;
            }
            
            const objectData = MODELS[objectType];
            if (!objectData) {
                console.error(`Model type not found: ${objectType}`);
                return;
            }
            
            // Create a bounding box for collision detection
            const boundingBox = this.calculateBoundingBox(
                snappedPos,
                { x: 0, y: this.currentRotation, z: 0 },
                objectData.boundingBox || { width: 1, height: 1, depth: 1 }
            );
            
            // Check if placement is valid
            this.placementValid = this.isPlacementValid(boundingBox, objectType);
            console.log(`Placement valid: ${this.placementValid}`);
            
            // Update overlay to indicate validity
            const overlay = indicator.querySelector('.placement-overlay');
            if (overlay) {
                overlay.setAttribute('material', 
                    this.placementValid ? 
                    'opacity: 0.4; color: #19EFAA; wireframe: true' : 
                    'opacity: 0.4; color: #FF7367; wireframe: true'
                );
            } else {
                // Update material color to indicate validity for primitive objects
                const material = this.placementValid ? 
                    'opacity: 0.7; color: #19EFAA' : 
                    'opacity: 0.7; color: #FF7367';
                
                indicator.querySelectorAll('[material]').forEach(el => {
                    el.setAttribute('material', material);
                });
            }
        }
        else if (this.isDragging && this.selectedElement) {
            // Move the selected object
            const currentPos = this.selectedElement.getAttribute('position');
            const deltaX = this.currentPosition.x - this.dragStartPosition.x;
            const deltaZ = this.currentPosition.z - this.dragStartPosition.z;
            
            const newPos = {
                x: currentPos.x + deltaX,
                y: currentPos.y,
                z: currentPos.z + deltaZ
            };
            
            // Check if the new position is valid
            const objectType = this.selectedElement.dataset.type;
            
            if (typeof MODELS === 'undefined') {
                console.error("MODELS not defined");
                return;
            }
            
            const objectData = MODELS[objectType];
            if (!objectData) return;
            
            const rotation = this.selectedElement.getAttribute('rotation');
            
            // Create a bounding box for collision detection
            const boundingBox = this.calculateBoundingBox(
                newPos,
                rotation,
                objectData.boundingBox || { width: 1, height: 1, depth: 1 }
            );
            
            // Only move if valid
            if (this.isPlacementValid(boundingBox, objectType, this.selectedElement)) {
                this.selectedElement.setAttribute('position', newPos);
                this.updateSelectionBox();
            }
            
            // Update drag start for the next move
            this.dragStartPosition = this.currentPosition;
        }
    },
    
    handleMouseUp(event) {
        console.log("Mouse up event:", event);
        
        if (this.isPlacing) {
            const groundClicked = event.target.closest('#ground');
            console.log("In placement mode, ground clicked:", !!groundClicked);
            
            if (groundClicked) {
                // Confirm placement if clicking on the ground
                console.log("Placement valid:", this.placementValid);
                if (this.placementValid) {
                    this.confirmPlacement();
                    console.log("Placement confirmed!");
                } else {
                    this.showNotification('Cannot place object here - it overlaps with another object', 'error');
                }
            }
        }
        
        this.isDragging = false;
    },
    
    // Touch event handlers (similar to mouse events but for mobile)
    handleTouchStart(event) {
        // Prevent default to avoid scrolling
        event.preventDefault();
        
        // Convert touch to mouse event and handle
        const touch = event.touches[0];
        const mouseEvent = new CustomEvent('mousedown', {
            detail: {
                intersection: {
                    point: {
                        x: touch.clientX,
                        y: touch.clientY,
                        z: 0
                    }
                }
            }
        });
        
        this.handleMouseDown(mouseEvent);
    },
    
    handleTouchMove(event) {
        event.preventDefault();
        
        const touch = event.touches[0];
        const mouseEvent = new CustomEvent('mousemove', {
            detail: {
                intersection: {
                    point: {
                        x: touch.clientX,
                        y: touch.clientY,
                        z: 0
                    }
                }
            }
        });
        
        this.handleMouseMove(mouseEvent);
    },
    
    handleTouchEnd(event) {
        event.preventDefault();
        
        const mouseEvent = new CustomEvent('mouseup', {});
        this.handleMouseUp(mouseEvent);
    },
    
    confirmPlacement() {
        console.log("Confirming placement, valid:", this.placementValid);
        
        if (!this.placementValid) {
            this.showNotification('Cannot place object here - it overlaps with another object', 'error');
            return;
        }
        
        // Get the indicator and its position/rotation
        const indicator = document.getElementById('placement-indicator');
        if (!indicator) {
            console.error("Placement indicator not found");
            return;
        }
        
        const position = indicator.getAttribute('position');
        const rotation = indicator.getAttribute('rotation');
        
        // Create the actual object
        const objectType = this.selectedItem;
        
        if (typeof MODELS === 'undefined') {
            console.error("MODELS not defined");
            return;
        }
        
        const objectData = MODELS[objectType];
        if (!objectData) {
            console.error(`Model type not found: ${objectType}`);
            return;
        }
        
        const obj = this.createObject(objectType, {
            position: position,
            rotation: rotation,
            scale: objectData.defaultScale || { x: 1, y: 1, z: 1 }
        });
        
        if (!obj) {
            console.error("Failed to create object");
            this.showNotification(`Error creating object of type: ${objectType}`, 'error');
            return;
        }
        
        // Add to the house container
        const houseContainer = document.getElementById('house-container');
        if (!houseContainer) {
            console.error("House container element not found");
            return;
        }
        
        houseContainer.appendChild(obj);
        console.log("Object added to house container");
        
        // Add to objects array
        this.objects.push({
            type: objectType,
            element: obj,
            position: { ...position },
            rotation: { ...rotation },
            scale: objectData.defaultScale || { x: 1, y: 1, z: 1 }
        });
        
        // Reset indicator
        indicator.setAttribute('visible', false);
        
        // Hide placement controls
        const placementControls = document.getElementById('placement-controls');
        if (placementControls) placementControls.classList.remove('show');
        
        const placementGuide = document.getElementById('placement-guide');
        if (placementGuide) placementGuide.classList.remove('show');
        
        const gridOverlay = document.getElementById('grid-overlay');
        if (gridOverlay) gridOverlay.classList.remove('show');
        
        this.isPlacing = false;
        this.setGridVisibility(false);
        
        // Deselect item
        document.querySelectorAll('.item-card').forEach(i => i.classList.remove('active'));
        this.selectedItem = null;
        
        // Add to undo stack
        this.addToUndoStack();
        
        // Show notification
        this.showNotification(`${objectData.displayName || objectType} placed successfully!`, 'success');
        
        console.log("Object placement completed successfully");
    },
    
    cancelPlacement() {
        console.log("Cancelling placement");
        
        // Hide placement indicator
        const indicator = document.getElementById('placement-indicator');
        if (indicator) indicator.setAttribute('visible', false);
        
        // Hide placement controls
        const placementControls = document.getElementById('placement-controls');
        if (placementControls) placementControls.classList.remove('show');
        
        const placementGuide = document.getElementById('placement-guide');
        if (placementGuide) placementGuide.classList.remove('show');
        
        const gridOverlay = document.getElementById('grid-overlay');
        if (gridOverlay) gridOverlay.classList.remove('show');
        
        this.isPlacing = false;
        this.setGridVisibility(false);
        
        // Deselect item
        document.querySelectorAll('.item-card').forEach(i => i.classList.remove('active'));
        this.selectedItem = null;
    },
    
    rotateObject() {
        if (this.isPlacing) {
            // Rotate in 45-degree increments
            this.currentRotation = (this.currentRotation + 45) % 360;
            console.log(`Rotating object to: ${this.currentRotation} degrees`);
            
            const indicator = document.getElementById('placement-indicator');
            if (indicator) {
                indicator.setAttribute('rotation', { x: 0, y: this.currentRotation, z: 0 });
            }
        }
    },
    
    snapToGrid(position) {
        return {
            x: Math.round(position.x / this.gridSize) * this.gridSize,
            y: this.defaultHeight, // Keep at default height
            z: Math.round(position.z / this.gridSize) * this.gridSize
        };
    },
    
    selectObject(element) {
        if (!element) {
            console.warn("Tried to select null element");
            return;
        }
        
        // Deselect any previously selected object
        this.deselectObject();
        
        // Select the new object
        this.selectedElement = element;
        console.log("Selected object:", this.selectedElement);
        
        // Highlight the selected object
        this.updateSelectionBox();
    },
    
    updateSelectionBox() {
        if (!this.selectedElement || !this.selectionBox) {
            if (this.selectionBox) this.selectionBox.setAttribute('visible', false);
            return;
        }
        
        // Get object properties
        const position = this.selectedElement.getAttribute('position');
        const rotation = this.selectedElement.getAttribute('rotation');
        const objectType = this.selectedElement.dataset.type;
        
        if (typeof MODELS === 'undefined') {
            console.error("MODELS not defined");
            return;
        }
        
        const objectData = MODELS[objectType];
        if (!objectData) {
            console.error(`Model type not found: ${objectType}`);
            return;
        }
        
        // Create bounding box for the selection box
        const boundingBox = objectData.boundingBox || { width: 1, height: 1, depth: 1 };
        
        // Update selection box
        this.selectionBox.setAttribute('position', position);
        this.selectionBox.setAttribute('rotation', rotation);
        
        // Create or update the box
        this.selectionBox.innerHTML = '';
        
        // Create wireframe box
        const box = document.createElement('a-entity');
        box.setAttribute('geometry', `primitive: box; width: ${boundingBox.width + 0.05}; height: ${boundingBox.height + 0.05}; depth: ${boundingBox.depth + 0.05}`);
        box.setAttribute('material', 'color: #5B8BFF; opacity: 0.2; wireframe: true');
        
        this.selectionBox.appendChild(box);
        this.selectionBox.setAttribute('visible', true);
        
        console.log("Selection box updated");
    },
    
    deselectObject() {
        this.selectedElement = null;
        if (this.selectionBox) this.selectionBox.setAttribute('visible', false);
        
        const objectMenu = document.getElementById('object-menu');
        if (objectMenu) objectMenu.style.display = 'none';
        
        const propertiesPanel = document.getElementById('properties-panel');
        if (propertiesPanel) propertiesPanel.style.display = 'none';
        
        console.log("Object deselected");
    },
    
    showObjectMenu(event) {
        // Position the menu at the mouse position
        const menu = document.getElementById('object-menu');
        if (!menu) {
            console.error("Object menu not found");
            return;
        }
        
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;
        menu.style.display = 'flex';
        
        console.log("Showing object menu");
    },
    
    editSelectedObject() {
        if (this.selectedElement) {
            this.showPropertiesPanel();
        } else {
            console.warn("No object selected for editing");
        }
    },
    
    rotateSelectedObject() {
        if (this.selectedElement) {
            const currentRotation = this.selectedElement.getAttribute('rotation');
            const newRotation = {
                x: currentRotation.x,
                y: (currentRotation.y + 45) % 360,
                z: currentRotation.z
            };
            
            console.log(`Rotating object to: ${newRotation.y} degrees`);
            this.selectedElement.setAttribute('rotation', newRotation);
            this.updateSelectionBox();
            
            // Add to undo stack
            this.addToUndoStack();
        } else {
            console.warn("No object selected for rotation");
        }
    },
    
    duplicateSelectedObject() {
        if (this.selectedElement) {
            const objectType = this.selectedElement.dataset.type;
            const position = this.selectedElement.getAttribute('position');
            const rotation = this.selectedElement.getAttribute('rotation');
            const scale = this.selectedElement.getAttribute('scale');
            
            console.log(`Duplicating object of type: ${objectType}`);
            
            // Create a new object at a slightly offset position
            const newPosition = {
                x: position.x + this.gridSize,
                y: position.y,
                z: position.z + this.gridSize
            };
            
            const obj = this.createObject(objectType, {
                position: newPosition,
                rotation: rotation,
                scale: scale
            });
            
            if (!obj) {
                console.error(`Failed to create duplicate of: ${objectType}`);
                this.showNotification(`Error creating duplicate of: ${objectType}`, 'error');
                return;
            }
            
            // Check if the placement is valid
            if (typeof MODELS === 'undefined') {
                console.error("MODELS not defined");
                return;
            }
            
            const objectData = MODELS[objectType];
            if (!objectData) {
                console.error(`Model type not found: ${objectType}`);
                return;
            }
            
            const boundingBox = this.calculateBoundingBox(
                newPosition,
                rotation,
                objectData.boundingBox || { width: 1, height: 1, depth: 1 }
            );
            
            if (!this.isPlacementValid(boundingBox, objectType)) {
                this.showNotification('Cannot duplicate object - not enough space', 'error');
                return;
            }
            
            // Add to the house container
            const houseContainer = document.getElementById('house-container');
            if (!houseContainer) {
                console.error("House container not found");
                return;
            }
            
            houseContainer.appendChild(obj);
            
            // Add to objects array
            this.objects.push({
                type: objectType,
                element: obj,
                position: { ...newPosition },
                rotation: { ...rotation },
                scale: { ...scale }
            });
            
            // Select the new object
            this.selectObject(obj);
            
            // Add to undo stack
            this.addToUndoStack();
            
            // Show notification
            this.showNotification('Object duplicated', 'success');
            console.log("Object duplicated successfully");
        } else {
            console.warn("No object selected for duplication");
        }
    },
    
    deleteSelectedObject() {
        if (this.selectedElement) {
            this.deleteObject(this.selectedElement);
        } else {
            console.warn("No object selected for deletion");
        }
    },
    
    deleteObject(element) {
        if (!element) {
            console.warn("Attempted to delete null element");
            return;
        }
        
        // Find the object in the array
        const index = this.objects.findIndex(obj => obj.element === element);
        
        if (index !== -1) {
            // Remove from the array
            this.objects.splice(index, 1);
            
            // Remove from the DOM
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            
            // Deselect
            this.deselectObject();
            
            // Add to undo stack
            this.addToUndoStack();
            
            // Show notification
            this.showNotification('Object deleted', 'info');
            console.log("Object deleted successfully");
        } else {
            console.warn("Object not found in objects array");
        }
    },
    
    showPropertiesPanel() {
        if (!this.selectedElement) {
            console.warn("No object selected for properties");
            return;
        }
        
        const panel = document.getElementById('properties-panel');
        const content = document.getElementById('properties-content');
        
        if (!panel || !content) {
            console.error("Properties panel elements not found");
            return;
        }
        
        // Clear previous content
        content.innerHTML = '';
        
        // Get object data
        const objectType = this.selectedElement.dataset.type;
        
        if (typeof MODELS === 'undefined') {
            console.error("MODELS not defined");
            return;
        }
        
        const objectData = MODELS[objectType];
        if (!objectData) {
            console.error(`Model type not found: ${objectType}`);
            return;
        }
        
        const position = this.selectedElement.getAttribute('position');
        const rotation = this.selectedElement.getAttribute('rotation');
        const scale = this.selectedElement.getAttribute('scale');
        
        console.log("Showing properties for:", objectType);
        
        // Create the properties form
        const form = document.createElement('form');
        form.addEventListener('submit', (e) => e.preventDefault());
        
        // Basic information group
        const basicGroup = document.createElement('div');
        basicGroup.className = 'property-group';
        basicGroup.innerHTML = `
            <div class="group-title">Basic Information</div>
            <div class="property-row">
                <label>Type</label>
                <input type="text" value="${objectData.displayName || objectType}" readonly>
            </div>
        `;
        form.appendChild(basicGroup);
        
        // Position group
        const positionGroup = document.createElement('div');
        positionGroup.className = 'property-group';
        positionGroup.innerHTML = `
            <div class="group-title">Position</div>
            <div class="property-row">
                <label>X Position</label>
                <input type="number" id="pos-x" value="${position.x.toFixed(2)}" step="0.5">
            </div>
            <div class="property-row">
                <label>Z Position</label>
                <input type="number" id="pos-z" value="${position.z.toFixed(2)}" step="0.5">
            </div>
        `;
        form.appendChild(positionGroup);
        
        // Rotation group
        const rotationGroup = document.createElement('div');
        rotationGroup.className = 'property-group';
        rotationGroup.innerHTML = `
            <div class="group-title">Rotation</div>
            <div class="property-row">
                <label>Y Rotation (degrees)</label>
                <div class="slider-control">
                    <div class="slider-row">
                        <input type="range" id="rot-y" min="0" max="359" value="${rotation.y}" step="5">
                        <div class="slider-value">${rotation.y}°</div>
                    </div>
                </div>
            </div>
        `;
        form.appendChild(rotationGroup);
        
        // Scale group
        const scaleGroup = document.createElement('div');
        scaleGroup.className = 'property-group';
        scaleGroup.innerHTML = `
            <div class="group-title">Scale</div>
            <div class="property-row">
                <label>Width</label>
                <div class="slider-control">
                    <div class="slider-row">
                        <input type="range" id="scale-x" min="0.5" max="3" value="${scale.x}" step="0.1">
                        <div class="slider-value">${scale.x.toFixed(1)}</div>
                    </div>
                </div>
            </div>
            <div class="property-row">
                <label>Height</label>
                <div class="slider-control">
                    <div class="slider-row">
                        <input type="range" id="scale-y" min="0.5" max="3" value="${scale.y}" step="0.1">
                        <div class="slider-value">${scale.y.toFixed(1)}</div>
                    </div>
                </div>
            </div>
            <div class="property-row">
                <label>Depth</label>
                <div class="slider-control">
                    <div class="slider-row">
                        <input type="range" id="scale-z" min="0.5" max="3" value="${scale.z}" step="0.1">
                        <div class="slider-value">${scale.z.toFixed(1)}</div>
                    </div>
                </div>
            </div>
        `;
        form.appendChild(scaleGroup);
        
        // Material/color group if the object supports it
        if (objectData.materials && objectData.materials.length > 0) {
            const materialGroup = document.createElement('div');
            materialGroup.className = 'property-group';
            materialGroup.innerHTML = `
                <div class="group-title">Material</div>
                <div class="property-row">
                    <label>Color</label>
                    <div class="color-options">
                        ${objectData.materials.map(color => 
                            `<div class="color-option" style="background-color: ${color};" data-color="${color}"></div>`
                        ).join('')}
                    </div>
                </div>
            `;
            form.appendChild(materialGroup);
        }
        
        // Actions group
        const actionsGroup = document.createElement('div');
        actionsGroup.className = 'property-group';
        actionsGroup.innerHTML = `
            <div class="group-title">Actions</div>
            <div class="property-actions">
                <div class="property-btn btn-secondary" id="prop-duplicate">Duplicate</div>
                <div class="property-btn danger" id="prop-delete">Delete</div>
            </div>
        `;
        form.appendChild(actionsGroup);
        
        // Add the form to the content
        content.appendChild(form);
        
        // Add event listeners to form controls
        setTimeout(() => {
            // Position inputs
            const posX = document.getElementById('pos-x');
            if (posX) {
                posX.addEventListener('change', (e) => {
                    const newPos = { ...position, x: parseFloat(e.target.value) };
                    this.updateObjectPosition(newPos);
                });
            }
            
            const posZ = document.getElementById('pos-z');
            if (posZ) {
                posZ.addEventListener('change', (e) => {
                    const newPos = { ...position, z: parseFloat(e.target.value) };
                    this.updateObjectPosition(newPos);
                });
            }
            
            // Rotation slider
            const rotSlider = document.getElementById('rot-y');
            if (rotSlider) {
                const rotValue = rotSlider.nextElementSibling;
                rotSlider.addEventListener('input', (e) => {
                    if (rotValue) rotValue.textContent = `${e.target.value}°`;
                });
                
                rotSlider.addEventListener('change', (e) => {
                    const newRot = { ...rotation, y: parseInt(e.target.value) };
                    this.updateObjectRotation(newRot);
                });
            }
            
            // Scale sliders
            ['x', 'y', 'z'].forEach(axis => {
                const scaleSlider = document.getElementById(`scale-${axis}`);
                if (scaleSlider) {
                    const scaleValue = scaleSlider.nextElementSibling;
                    
                    scaleSlider.addEventListener('input', (e) => {
                        if (scaleValue) scaleValue.textContent = parseFloat(e.target.value).toFixed(1);
                    });
                    
                    scaleSlider.addEventListener('change', (e) => {
                        const newScale = { ...scale };
                        newScale[axis] = parseFloat(e.target.value);
                        this.updateObjectScale(newScale);
                    });
                }
            });
            
            // Color options
            document.querySelectorAll('.color-option').forEach(option => {
                option.addEventListener('click', () => {
                    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    
                    const color = option.dataset.color;
                    this.changeObjectColor(color);
                });
            });
            
            // Action buttons
            const duplicateBtn = document.getElementById('prop-duplicate');
            if (duplicateBtn) {
                duplicateBtn.addEventListener('click', () => this.duplicateSelectedObject());
            }
            
            const deleteBtn = document.getElementById('prop-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteSelectedObject());
            }
        }, 0);
        
        // Show the panel
        panel.style.display = 'block';
    },
    
    updateObjectPosition(newPos) {
        if (!this.selectedElement) {
            console.warn("No object selected for position update");
            return;
        }
        
        // Check if the new position is valid
        const objectType = this.selectedElement.dataset.type;
        
        if (typeof MODELS === 'undefined') {
            console.error("MODELS not defined");
            return;
        }
        
        const objectData = MODELS[objectType];
        if (!objectData) {
            console.error(`Model type not found: ${objectType}`);
            return;
        }
        
        const rotation = this.selectedElement.getAttribute('rotation');
        
        // Create a bounding box for collision detection
        const boundingBox = this.calculateBoundingBox(
            newPos,
            rotation,
            objectData.boundingBox || { width: 1, height: 1, depth: 1 }
        );
        
        // Only move if valid
        if (this.isPlacementValid(boundingBox, objectType, this.selectedElement)) {
            console.log(`Moving object to: x=${newPos.x}, z=${newPos.z}`);
            this.selectedElement.setAttribute('position', newPos);
            this.updateSelectionBox();
            
            // Update object in objects array
            const index = this.objects.findIndex(obj => obj.element === this.selectedElement);
            if (index !== -1) {
                this.objects[index].position = { ...newPos };
            }
            
            // Add to undo stack
            this.addToUndoStack();
        } else {
            // Revert the input values
            const currentPos = this.selectedElement.getAttribute('position');
            const posX = document.getElementById('pos-x');
            const posZ = document.getElementById('pos-z');
            
            if (posX) posX.value = currentPos.x.toFixed(2);
            if (posZ) posZ.value = currentPos.z.toFixed(2);
            
            this.showNotification('Cannot move object to this position - it overlaps with another object', 'error');
            console.log("Invalid position - reverting");
        }
    },
    
    updateObjectRotation(newRot) {
        if (!this.selectedElement) {
            console.warn("No object selected for rotation update");
            return;
        }
        
        console.log(`Rotating object to: ${newRot.y} degrees`);
        this.selectedElement.setAttribute('rotation', newRot);
        this.updateSelectionBox();
        
        // Update object in objects array
        const index = this.objects.findIndex(obj => obj.element === this.selectedElement);
        if (index !== -1) {
            this.objects[index].rotation = { ...newRot };
        }
        
        // Add to undo stack
        this.addToUndoStack();
    },
    
    updateObjectScale(newScale) {
        if (!this.selectedElement) {
            console.warn("No object selected for scale update");
            return;
        }
        
        // Check if the new scale is valid (no collisions)
        const objectType = this.selectedElement.dataset.type;
        
        if (typeof MODELS === 'undefined') {
            console.error("MODELS not defined");
            return;
        }
        
        const objectData = MODELS[objectType];
        if (!objectData) {
            console.error(`Model type not found: ${objectType}`);
            return;
        }
        
        const position = this.selectedElement.getAttribute('position');
        const rotation = this.selectedElement.getAttribute('rotation');
        
        // Create a bounding box for collision detection
        const boundingBox = {
            width: objectData.boundingBox.width * newScale.x,
            height: objectData.boundingBox.height * newScale.y,
            depth: objectData.boundingBox.depth * newScale.z
        };
        
        const box = this.calculateBoundingBox(
            position,
            rotation,
            boundingBox
        );
        
        // Only scale if valid
        if (this.isPlacementValid(box, objectType, this.selectedElement)) {
            console.log(`Scaling object to: x=${newScale.x}, y=${newScale.y}, z=${newScale.z}`);
            this.selectedElement.setAttribute('scale', newScale);
            this.updateSelectionBox();
            
            // Update object in objects array
            const index = this.objects.findIndex(obj => obj.element === this.selectedElement);
            if (index !== -1) {
                this.objects[index].scale = { ...newScale };
            }
            
            // Add to undo stack
            this.addToUndoStack();
        } else {
            // Revert the slider values
            const currentScale = this.selectedElement.getAttribute('scale');
            ['x', 'y', 'z'].forEach(axis => {
                const slider = document.getElementById(`scale-${axis}`);
                if (slider) {
                    slider.value = currentScale[axis];
                    const scaleValue = slider.nextElementSibling;
                    if (scaleValue) {
                        scaleValue.textContent = currentScale[axis].toFixed(1);
                    }
                }
            });
            
            this.showNotification('Cannot resize object - it would overlap with another object', 'error');
            console.log("Invalid scale - reverting");
        }
    },
    
    changeObjectColor(color) {
        if (!this.selectedElement) {
            console.warn("No object selected for color change");
            return;
        }
        
        const objectType = this.selectedElement.dataset.type;
        
        if (typeof MODELS === 'undefined') {
            console.error("MODELS not defined");
            return;
        }
        
        const objectData = MODELS[objectType];
        if (!objectData) {
            console.error(`Model type not found: ${objectType}`);
            return;
        }
        if (objectData.materialComponent) {
            // For GLTF models, we need to set the material property on the specific component
            console.log(`Setting color to ${color} on material component ${objectData.materialComponent}`);
            this.selectedElement.setAttribute(`material__${objectData.materialComponent}`, `color: ${color}`);
            
            // Store the current color
            this.selectedElement.setAttribute('data-color', color);
        } else {
            // For primitive-based objects
            console.log(`Setting color to ${color} on all material elements`);
            this.selectedElement.querySelectorAll('[material]').forEach(el => {
                const material = el.getAttribute('material');
                el.setAttribute('material', `${material}; color: ${color}`);
            });
        }
        
        // Add to undo stack
        this.addToUndoStack();
    },
    
    calculateBoundingBox(position, rotation, dimensions) {
        if (!position || !dimensions) {
            console.error("Missing parameters for calculateBoundingBox");
            return null;
        }
        
        // Create the 8 corners of the bounding box
        const halfWidth = dimensions.width / 2;
        const halfHeight = dimensions.height / 2;
        const halfDepth = dimensions.depth / 2;
        
        // Simple bounding box for now - doesn't account for rotation
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
    
    isPlacementValid(boundingBox, objectType, excludeElement = null) {
        if (!boundingBox || !objectType) {
            console.warn("Missing parameters for isPlacementValid");
            return false;
        }
        
        // Check for CollisionManager
        if (typeof CollisionManager === 'undefined' || !CollisionManager.checkPlacement) {
            console.error("CollisionManager not available");
            return true; // Default to allowing placement if collision system is not available
        }
        
        // Check for collisions with existing objects
        return CollisionManager.checkPlacement(boundingBox, objectType, excludeElement, this.objects);
    },
    
    saveDesign() {
        console.log("Saving design...");
        
        // Convert objects to a saveable format
        const saveData = {
            version: '1.0',
            objects: this.objects.map(obj => {
                return {
                    type: obj.type,
                    position: obj.position,
                    rotation: obj.rotation,
                    scale: obj.scale,
                    // Add any other properties like color, etc.
                    color: obj.element.getAttribute('data-color') || '#FFFFFF'
                };
            })
        };
        
        // Save to localStorage
        try {
            localStorage.setItem('easyfloor_design', JSON.stringify(saveData));
            
            // Record save time
            this.lastSaved = new Date();
            
            // Show notification
            this.showNotification('Design saved successfully!', 'success');
            console.log("Design saved successfully");
        } catch (error) {
            console.error("Error saving design:", error);
            this.showNotification('Error saving design', 'error');
        }
    },
    
    loadDesign() {
        console.log("Loading design...");
        
        // Try to load from localStorage
        const saveData = localStorage.getItem('easyfloor_design');
        
        if (!saveData) {
            this.showNotification('No saved design found', 'info');
            return;
        }
        
        try {
            const data = JSON.parse(saveData);
            
            // Clear current objects
            this.objects.forEach(obj => {
                if (obj.element && obj.element.parentNode) {
                    obj.element.parentNode.removeChild(obj.element);
                }
            });
            
            this.objects = [];
            
            // Load saved objects
            const container = document.getElementById('house-container');
            if (!container) {
                throw new Error("House container element not found");
            }
            
            console.log(`Loading ${data.objects.length} objects`);
            
            data.objects.forEach(objData => {
                const obj = this.createObject(objData.type, {
                    position: objData.position,
                    rotation: objData.rotation,
                    scale: objData.scale
                });
                
                if (obj) {
                    container.appendChild(obj);
                    
                    // Add to objects array
                    this.objects.push({
                        type: objData.type,
                        element: obj,
                        position: { ...objData.position },
                        rotation: { ...objData.rotation },
                        scale: { ...objData.scale }
                    });
                    
                    // Set color if available
                    if (objData.color && typeof MODELS !== 'undefined') {
                        const objectData = MODELS[objData.type];
                        if (objectData && objectData.materialComponent) {
                            obj.setAttribute(`material__${objectData.materialComponent}`, `color: ${objData.color}`);
                            obj.setAttribute('data-color', objData.color);
                        } else {
                            obj.querySelectorAll('[material]').forEach(el => {
                                const material = el.getAttribute('material');
                                el.setAttribute('material', `${material}; color: ${objData.color}`);
                            });
                        }
                    }
                }
            });
            
            // Show notification
            this.showNotification('Design loaded successfully!', 'success');
            console.log("Design loaded successfully");
            
        } catch (e) {
            console.error('Error loading design:', e);
            this.showNotification('Error loading design', 'error');
        }
    },
    
    loadSavedDesign() {
        console.log("Checking for saved design...");
        
        // Check if there's a saved design on initialization
        const saveData = localStorage.getItem('easyfloor_design');
        
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                
                // Load saved objects
                const container = document.getElementById('house-container');
                if (!container) {
                    throw new Error("House container element not found");
                }
                
                console.log(`Loading ${data.objects.length} objects from saved design`);
                
                data.objects.forEach(objData => {
                    const obj = this.createObject(objData.type, {
                        position: objData.position,
                        rotation: objData.rotation,
                        scale: objData.scale
                    });
                    
                    if (obj) {
                        container.appendChild(obj);
                        
                        // Add to objects array
                        this.objects.push({
                            type: objData.type,
                            element: obj,
                            position: { ...objData.position },
                            rotation: { ...objData.rotation },
                            scale: { ...objData.scale }
                        });
                        
                        // Set color if available
                        if (objData.color && typeof MODELS !== 'undefined') {
                            const objectData = MODELS[objData.type];
                            if (objectData && objectData.materialComponent) {
                                obj.setAttribute(`material__${objectData.materialComponent}`, `color: ${objData.color}`);
                                obj.setAttribute('data-color', objData.color);
                            } else {
                                obj.querySelectorAll('[material]').forEach(el => {
                                    const material = el.getAttribute('material');
                                    el.setAttribute('material', `${material}; color: ${objData.color}`);
                                });
                            }
                        }
                    }
                });
                
            } catch (e) {
                console.error('Error loading saved design:', e);
            }
        } else {
            console.log("No saved design found");
        }
    },
    
    exportDesign() {
        console.log("Exporting design...");
        
        // Convert objects to a saveable format
        const exportData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            objects: this.objects.map(obj => {
                return {
                    type: obj.type,
                    position: obj.position,
                    rotation: obj.rotation,
                    scale: obj.scale,
                    // Add any other properties like color, etc.
                    color: obj.element.getAttribute('data-color') || '#FFFFFF'
                };
            })
        };
        
        // Convert to JSON string
        const jsonString = JSON.stringify(exportData, null, 2);
        
        try {
            // Create a download link
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "easyfloor_design.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            
            // Show notification
            this.showNotification('Design exported successfully!', 'success');
            console.log("Design exported successfully");
        } catch (error) {
            console.error("Error exporting design:", error);
            this.showNotification('Error exporting design', 'error');
        }
    },
    
    addToUndoStack() {
        // Create a snapshot of the current state
        const snapshot = {
            objects: this.objects.map(obj => {
                return {
                    type: obj.type,
                    element: obj.element,
                    position: { ...obj.position },
                    rotation: { ...obj.rotation },
                    scale: { ...obj.scale }
                };
            })
        };
        
        // Add to undo stack
        this.undoStack.push(snapshot);
        
        // Clear redo stack
        this.redoStack = [];
        
        // Limit undo stack size
        if (this.undoStack.length > 20) {
            this.undoStack.shift();
        }
        
        console.log(`Added to undo stack (size: ${this.undoStack.length})`);
    },
    
    undo() {
        if (this.undoStack.length === 0) {
            console.log("Nothing to undo");
            return;
        }
        
        // Store current state in redo stack
        const currentState = {
            objects: this.objects.map(obj => {
                return {
                    type: obj.type,
                    element: obj.element,
                    position: { ...obj.position },
                    rotation: { ...obj.rotation },
                    scale: { ...obj.scale }
                };
            })
        };
        
        this.redoStack.push(currentState);
        
        // Get previous state
        const previousState = this.undoStack.pop();
        
        // Apply the previous state
        this.applyState(previousState);
        
        // Show notification
        this.showNotification('Undo successful', 'info');
        console.log("Undo successful");
    },
    
    redo() {
        if (this.redoStack.length === 0) {
            console.log("Nothing to redo");
            return;
        }
        
        // Store current state in undo stack
        const currentState = {
            objects: this.objects.map(obj => {
                return {
                    type: obj.type,
                    element: obj.element,
                    position: { ...obj.position },
                    rotation: { ...obj.rotation },
                    scale: { ...obj.scale }
                };
            })
        };
        
        this.undoStack.push(currentState);
        
        // Get next state
        const nextState = this.redoStack.pop();
        
        // Apply the next state
        this.applyState(nextState);
        
        // Show notification
        this.showNotification('Redo successful', 'info');
        console.log("Redo successful");
    },
    
    applyState(state) {
        if (!state || !state.objects) {
            console.error("Invalid state to apply");
            return;
        }
        
        // Clear current objects
        this.objects.forEach(obj => {
            if (obj.element && obj.element.parentNode) {
                obj.element.parentNode.removeChild(obj.element);
            }
        });
        
        // Apply the new state
        this.objects = state.objects;
        
        // Add all objects to the container
        const container = document.getElementById('house-container');
        if (!container) {
            console.error("House container element not found");
            return;
        }
        
        this.objects.forEach(obj => {
            if (obj.element) {
                container.appendChild(obj.element);
            }
        });
        
        console.log(`Applied state with ${this.objects.length} objects`);
    },
    
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const text = document.getElementById('notification-text');
        
        if (!notification || !text) {
            console.error("Notification elements not found");
            return;
        }
        
        // Set message and type
        text.textContent = message;
        
        // Remove all type classes
        notification.classList.remove('info', 'success', 'error');
        
        // Add the appropriate type class
        notification.classList.add(type);
        
        // Show the notification
        notification.classList.add('show');
        
        console.log(`Notification (${type}): ${message}`);
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    },
    
    updateUI() {
        console.log("Updating UI");
        
        // Update the correct mode button
        document.querySelectorAll('.build-btn').forEach(btn => btn.classList.remove('active'));
        const modeBtn = document.getElementById(`${this.mode}-btn`);
        if (modeBtn) {
            modeBtn.classList.add('active');
        }
        
        // Show or hide panels based on mode
        const categoryPanel = document.getElementById('category-panel');
        if (categoryPanel) {
            if (this.mode === 'build' || this.mode === 'decorate') {
                categoryPanel.style.display = 'flex';
            } else {
                categoryPanel.style.display = 'none';
            }
        }
    },
    
    // Test functions for diagnosing issues
    testButtons() {
        console.log('Testing button functionality...');
        document.querySelectorAll('.build-btn, .btn-icon, .category-tab, .item-card').forEach(btn => {
            console.log(`Found button: ${btn.id || btn.className}, attaching test handler`);
            btn.onclick = function(e) {
                console.log(`Button clicked: ${this.id || this.className}`);
                e.stopPropagation();
            };
        });
        console.log('Test handlers attached. Try clicking buttons now.');
    },
    
    testModels() {
        console.log('Testing model availability...');
        
        if (typeof MODELS === 'undefined') {
            console.error("MODELS not defined");
            return;
        }
        
        // Log all model definitions
        Object.entries(MODELS).forEach(([key, model]) => {
            console.log(`Model: ${key}`, model);
            
            // Check boundingBox
            if (!model.boundingBox) {
                console.warn(`Model ${key} is missing boundingBox definition`);
            }
            
            // Check model path for 3D models
            if (model.model) {
                // Check if the model file exists
                fetch(model.model)
                    .then(response => {
                        if (!response.ok) {
                            console.error(`Model file not found: ${model.model}`);
                        } else {
                            console.log(`Model verified: ${key} (${model.model})`);
                        }
                    })
                    .catch(error => console.error(`Error loading ${key}:`, error));
            }
        });
    }
};

// DO NOT initialize on DOMContentLoaded - Let main.js handle it
// This prevents double initialization