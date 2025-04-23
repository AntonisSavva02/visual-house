/**
 * EasyFloor - Interactive House Builder
 * Main application file
 */

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
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize button event listeners
        this.initializeButtons();
        
        // Add error handling for model loading
        document.addEventListener('model-error', function(e) {
            console.error('Model error:', e.detail.src);
            APP.showNotification(`Error loading model: ${e.detail.src}`, 'error');
        });
        
        // Show notification
        this.showNotification('Welcome to EasyFloor! Start by selecting an item from the panel.', 'info');
        
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
        
        try {
            // Mode buttons - bottom toolbar
            const buildBtn = document.getElementById('build-btn');
            const decorateBtn = document.getElementById('decorate-btn');
            const editBtn = document.getElementById('edit-btn');
            const moveBtn = document.getElementById('move-btn');
            const eraseBtn = document.getElementById('erase-btn');
            
            // Clear any existing handlers and set new ones
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
                    return false;
                };
            } else {
                console.error("Build button not found!");
            }
            
            if (decorateBtn) {
                const newDecorateBtn = clearEventHandlers(decorateBtn);
                newDecorateBtn.onclick = (e) => {
                    console.log('Decorate button clicked');
                    this.setMode('decorate');
                    e.stopPropagation();
                    return false;
                };
            } else {
                console.error("Decorate button not found!");
            }
            
            if (editBtn) {
                const newEditBtn = clearEventHandlers(editBtn);
                newEditBtn.onclick = (e) => {
                    console.log('Edit button clicked');
                    this.setMode('edit');
                    e.stopPropagation();
                    return false;
                };
            } else {
                console.error("Edit button not found!");
            }
            
            if (moveBtn) {
                const newMoveBtn = clearEventHandlers(moveBtn);
                newMoveBtn.onclick = (e) => {
                    console.log('Move button clicked');
                    this.setMode('move');
                    e.stopPropagation();
                    return false;
                };
            } else {
                console.error("Move button not found!");
            }
            
            if (eraseBtn) {
                const newEraseBtn = clearEventHandlers(eraseBtn);
                newEraseBtn.onclick = (e) => {
                    console.log('Erase button clicked');
                    this.setMode('erase');
                    e.stopPropagation();
                    return false;
                };
            } else {
                console.error("Erase button not found!");
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
                    return false;
                };
            }
            
            if (view3dBtn) {
                const newView3dBtn = clearEventHandlers(view3dBtn);
                newView3dBtn.onclick = (e) => {
                    console.log('3D view button clicked');
                    this.setView('3d');
                    e.stopPropagation();
                    return false;
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
                    return false;
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
                    return false;
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
                    return false;
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
                                return false;
                            };
                        }
                        
                        if (loadBtn) {
                            const newLoadBtn = clearEventHandlers(loadBtn);
                            newLoadBtn.onclick = (e) => {
                                console.log('Load button clicked');
                                this.loadDesign();
                                e.stopPropagation();
                                return false;
                            };
                        }
                        
                        if (exportBtn) {
                            const newExportBtn = clearEventHandlers(exportBtn);
                            newExportBtn.onclick = (e) => {
                                console.log('Export button clicked');
                                this.exportDesign();
                                e.stopPropagation();
                                return false;
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
                                return false;
                            };
                        }
                        
                        if (placeRotateBtn) {
                            const newPlaceRotateBtn = clearEventHandlers(placeRotateBtn);
                            newPlaceRotateBtn.onclick = (e) => {
                                console.log('Rotate placement button clicked');
                                this.rotateObject();
                                e.stopPropagation();
                                return false;
                            };
                        }
                        
                        if (placeConfirmBtn) {
                            const newPlaceConfirmBtn = clearEventHandlers(placeConfirmBtn);
                            newPlaceConfirmBtn.onclick = (e) => {
                                console.log('Confirm placement button clicked');
                                this.confirmPlacement();
                                e.stopPropagation();
                                return false;
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
                                return false;
                            };
                        }
                        
                        console.log('Button initialization complete!');
                    } catch (e) {
                        console.error('Error initializing buttons:', e);
                    }
                },
                
                setupEventListeners() {
                    console.log("Setting up event listeners...");
                    
                    // Add this debug listener for all clicks
                    document.addEventListener('click', (e) => {
                        console.log(`Click detected on: ${e.target.tagName} ${e.target.id || e.target.className}`);
                    }, true);
                    
                    // A-Frame scene events for mouse interaction
                    const scene = document.querySelector('a-scene');
                    
                    if (scene) {
                        scene.addEventListener('mousedown', (e) => {
                            console.log('Mouse down on scene', e.detail);
                            this.handleMouseDown(e);
                        }, true);
                        
                        scene.addEventListener('mousemove', (e) => this.handleMouseMove(e), true);
                        
                        scene.addEventListener('mouseup', (e) => {
                            console.log('Mouse up on scene', e.detail);
                            this.handleMouseUp(e);
                        }, true);
                        
                        // Touch events for mobile
                        scene.addEventListener('touchstart', (e) => this.handleTouchStart(e), true);
                        scene.addEventListener('touchmove', (e) => this.handleTouchMove(e), true);
                        scene.addEventListener('touchend', (e) => this.handleTouchEnd(e), true);
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
                            return false;
                        });
                    }
                    
                    if (rotateBtn) {
                        rotateBtn.addEventListener('click', (e) => { 
                            console.log('Context menu rotate button clicked');
                            e.stopPropagation();
                            this.rotateSelectedObject(); 
                            return false;
                        });
                    }
                    
                    if (duplicateBtn) {
                        duplicateBtn.addEventListener('click', (e) => { 
                            console.log('Context menu duplicate button clicked');
                            e.stopPropagation();
                            this.duplicateSelectedObject(); 
                            return false;
                        });
                    }
                    
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', (e) => { 
                            console.log('Context menu delete button clicked');
                            e.stopPropagation();
                            this.deleteSelectedObject(); 
                            return false;
                        });
                    }
                    
                    // Context menu for objects
                    document.addEventListener('contextmenu', (e) => {
                        if (e.target.closest('a-entity') && e.target.closest('a-entity').classList.contains('interactive')) {
                            e.preventDefault();
                            this.showObjectMenu(e);
                            return false;
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
                    
                    // Special handler for ground to catch click events
                    const ground = document.getElementById('ground');
                    if (ground) {
                        ground.addEventListener('click', (e) => {
                            console.log('Ground clicked directly', e);
                            // Handle ground clicks for object placement
                            if (this.isPlacing) {
                                console.log("Ground click - attempting placement");
                                this.confirmPlacement();
                            }
                        }, true);
                    }
                    
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
                            return false;
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
                    
                    // Show help message based on mode
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
                },
                
                setView(view) {
                    this.view = view;
                    console.log(`Setting view to: ${view}`);
                    
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
                    const obj = document.createElement('a-entity');
                    obj.setAttribute('class', 'placement-preview');
                    
                    if (objectData.model) {
                        obj.setAttribute('gltf-model', objectData.model);
                        obj.setAttribute('shadow', 'cast: true; receive: false');
                    }
                    
                    // Set material to indicate placement validity
                    // Add a semi-transparent overlay
                    const overlay = document.createElement('a-entity');
                    overlay.setAttribute('geometry', `primitive: box; width: ${objectData.boundingBox.width}; height: ${objectData.boundingBox.height}; depth: ${objectData.boundingBox.depth}`);
                    overlay.setAttribute('material', 'opacity: 0.4; color: #19EFAA; wireframe: true');
                    overlay.setAttribute('class', 'placement-overlay');
                    obj.appendChild(overlay);
                    
                    indicator.appendChild(obj);
                    indicator.setAttribute('visible', true);
                    
                    // Show placement controls
                    const placementControls = document.getElementById('placement-controls');
                    if (placementControls) {
                        placementControls.classList.add('show');
                    }
                    
                    // Show placement guide
                    const placementGuide = document.getElementById('placement-guide');
                    if (placementGuide) {
                        const textElement = placementGuide.querySelector('.text');
                        if (textElement) {
                            textElement.textContent = `Click to place ${objectData.displayName || objectType}`;
                        }
                        placementGuide.classList.add('show');
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
                
                // Check if placement is valid (no collisions)
                isPlacementValid(boundingBox, objectType, excludeElement) {
                    console.log("Checking placement validity");
                    // For simplicity, we'll always return true in this version
                    return true;
                },
                
                calculateBoundingBox(position, rotation, size) {
                    // Simple AABB calculation (no rotation for now)
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
                        // When placing, clicks will be handled in mouseup
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
                        console.log("Ground element clicked in mousedown");
                        // Clicked on ground - handle placement if in placing mode
                        if (this.isPlacing) {
                            console.log("In placement mode and clicked ground - will handle in mouseup");
                        } else {
                            // Just deselect any selected object
                            this.deselectObject();
                            console.log("Clicked on ground - deselecting");
                        }
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
                        
                        // The placement is always valid in this simplified version
                        this.placementValid = true;
                        
                        // Update overlay to indicate validity
                        const overlay = indicator.querySelector('.placement-overlay');
                        if (overlay) {
                            overlay.setAttribute('material', 
                                this.placementValid ? 
                                'opacity: 0.4; color: #19EFAA; wireframe: true' : 
                                'opacity: 0.4; color: #FF7367; wireframe: true'
                            );
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
                        
                        // Move immediately (always valid in this simplified version)
                        this.selectedElement.setAttribute('position', newPos);
                        this.updateSelectionBox();
                        
                        // Update object in objects array
                        const index = this.objects.findIndex(obj => obj.element === this.selectedElement);
                        if (index !== -1) {
                            this.objects[index].position = { ...newPos };
                        }
                        
                        // Update drag start for the next move
                        this.dragStartPosition = this.currentPosition;
                    }
                },
                
                handleMouseUp(event) {
                    console.log("Mouse up event:", event);
                    console.log("Is placing:", this.isPlacing);
                    console.log("Placement valid:", this.placementValid);
                    console.log("Target:", event.target);
                    
                    // Check if we're in placement mode
                    if (this.isPlacing) {
                        console.log("In placement mode - confirming placement");
                        
                        // Always allow placement in this simplified version
                        this.placementValid = true;
                        
                        // Call confirm placement directly
                        this.confirmPlacement();
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
                    console.log("Confirming placement");
                    
                    try {
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
                        console.log("Selected item:", objectType);
                        
                        if (!objectType || !MODELS || !MODELS[objectType]) {
                            console.error(`Invalid model type: ${objectType}`);
                            return;
                        }
                        
                        const objectData = MODELS[objectType];
                        
                        // Create object
                        const obj = document.createElement('a-entity');
                        obj.setAttribute('class', 'interactive collidable');
                        obj.setAttribute('data-type', objectType);
                        obj.setAttribute('position', position);
                        obj.setAttribute('rotation', rotation);
                        obj.setAttribute('scale', objectData.defaultScale || { x: 1, y: 1, z: 1 });
                        
                        // Set model
                        if (objectData.model) {
                            obj.setAttribute('gltf-model', objectData.model);
                            obj.setAttribute('shadow', 'cast: true; receive: true');
                        }
                        
                        // Add to house container
                        const houseContainer = document.getElementById('house-container');
                        if (!houseContainer) {
                            console.error("House container not found");
                            return;
                        }
                        
                        houseContainer.appendChild(obj);
                        console.log("Object added to scene");
                        
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
                        
                        // Show notification
                        this.showNotification(`${objectData.displayName || objectType} placed successfully!`, 'success');
                        
                        console.log("Object placement completed successfully");
                    } catch (error) {
                        console.error("Error in confirmPlacement:", error);
                        this.showNotification("Error placing object", "error");
                    }
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
                },
                
                deselectObject() {
                    this.selectedElement = null;
                    if (this.selectionBox) this.selectionBox.setAttribute('visible', false);
                    
                    const objectMenu = document.getElementById('object-menu');
                    if (objectMenu) objectMenu.style.display = 'none';
                    
                    const propertiesPanel = document.getElementById('properties-panel');
                    if (propertiesPanel) propertiesPanel.style.display = 'none';
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
                },
                
                editSelectedObject() {
                    if (this.selectedElement) {
                        this.showPropertiesPanel();
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
                        
                        const obj = document.createElement('a-entity');
                        obj.setAttribute('class', 'interactive collidable');
                        obj.setAttribute('data-type', objectType);
                        obj.setAttribute('position', newPosition);
                        obj.setAttribute('rotation', rotation);
                        obj.setAttribute('scale', scale);
                        
                        // Set model
                        if (MODELS[objectType].model) {
                            obj.setAttribute('gltf-model', MODELS[objectType].model);
                            obj.setAttribute('shadow', 'cast: true; receive: true');
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
                        
                        // Show notification
                        this.showNotification('Object duplicated', 'success');
                    }
                },
                
                deleteSelectedObject() {
                    if (this.selectedElement) {
                        this.deleteObject(this.selectedElement);
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
                        
                        // Show notification
                        this.showNotification('Object deleted', 'info');
                    }
                },
                
                showPropertiesPanel() {
                    if (!this.selectedElement) return;
                    
                    const panel = document.getElementById('properties-panel');
                    const content = document.getElementById('properties-content');
                    
                    if (!panel || !content) return;
                    
                    // Clear previous content
                    content.innerHTML = '';
                    
                    // Get object data
                    const objectType = this.selectedElement.dataset.type;
                    const objectData = MODELS[objectType];
                    if (!objectData) return;
                    
                    const position = this.selectedElement.getAttribute('position');
                    const rotation = this.selectedElement.getAttribute('rotation');
                    const scale = this.selectedElement.getAttribute('scale');
                    
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
                                this.selectedElement.setAttribute('position', newPos);
                                this.updateSelectionBox();
                            });
                        }
                        
                        const posZ = document.getElementById('pos-z');
                        if (posZ) {
                            posZ.addEventListener('change', (e) => {
                                const newPos = { ...position, z: parseFloat(e.target.value) };
                                this.selectedElement.setAttribute('position', newPos);
                                this.updateSelectionBox();
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
                                this.selectedElement.setAttribute('rotation', newRot);
                                this.updateSelectionBox();
                            });
                        }
                        
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
                
                showNotification(message, type = 'info') {
                    const notification = document.getElementById('notification');
                    const text = document.getElementById('notification-text');
                    
                    if (!notification || !text) return;
                    
                    text.textContent = message;
                    
                    // Reset classes
                    notification.className = 'notification';
                    
                    // Add type-specific class
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
                },
                
                updateUI() {
                    // Update button states based on current mode
                    document.querySelectorAll('.build-btn').forEach(btn => btn.classList.remove('active'));
                    const modeBtn = document.getElementById(`${this.mode}-btn`);
                    if (modeBtn) {
                        modeBtn.classList.add('active');
                    }
                },
                
                saveDesign() {
                    // Simple save to localStorage for now
                    try {
                        const designData = {
                            objects: this.objects.map(obj => ({
                                type: obj.type,
                                position: obj.element.getAttribute('position'),
                                rotation: obj.element.getAttribute('rotation'),
                                scale: obj.element.getAttribute('scale')
                            }))
                        };
                        
                        localStorage.setItem('easyfloor-design', JSON.stringify(designData));
                        this.lastSaved = Date.now();
                        this.showNotification('Design saved', 'success');
                    } catch (e) {
                        console.error('Error saving design:', e);
                        this.showNotification('Error saving design', 'error');
                    }
                },
                
                loadDesign() {
                    try {
                        const savedData = localStorage.getItem('easyfloor-design');
                        if (!savedData) {
                            this.showNotification('No saved design found', 'error');
                            return;
                        }
                        
                        const designData = JSON.parse(savedData);
                        
                        // Clear existing objects
                        this.objects.forEach(obj => {
                            if (obj.element.parentNode) {
                                obj.element.parentNode.removeChild(obj.element);
                            }
                        });
                        
                        this.objects = [];
                        
                        // Create new objects from saved data
                        const houseContainer = document.getElementById('house-container');
                        if (!houseContainer) {
                            console.error("House container element not found");
                            return;
                        }
                        
                        designData.objects.forEach(objData => {
                            const obj = document.createElement('a-entity');
                            obj.setAttribute('class', 'interactive collidable');
                            obj.setAttribute('data-type', objData.type);
                            obj.setAttribute('position', objData.position);
                            obj.setAttribute('rotation', objData.rotation);
                            obj.setAttribute('scale', objData.scale);
                            
                            // Set model
                            const modelData = MODELS[objData.type];
                            if (modelData && modelData.model) {
                                obj.setAttribute('gltf-model', modelData.model);
                                obj.setAttribute('shadow', 'cast: true; receive: true');
                            }
                            
                            houseContainer.appendChild(obj);
                            
                            this.objects.push({
                                type: objData.type,
                                element: obj,
                                position: objData.position,
                                rotation: objData.rotation,
                                scale: objData.scale
                            });
                        });
                        
                        this.showNotification('Design loaded successfully', 'success');
                    } catch (e) {
                        console.error('Error loading design:', e);
                        this.showNotification('Error loading design', 'error');
                    }
                },
                
                exportDesign() {
                    try {
                        // For now, just create a JSON export
                        const designData = {
                            version: '1.0',
                            timestamp: Date.now(),
                            objects: this.objects.map(obj => ({
                                type: obj.type,
                                position: obj.element.getAttribute('position'),
                                rotation: obj.element.getAttribute('rotation'),
                                scale: obj.element.getAttribute('scale')
                            }))
                        };
                        
                        // Create a blob and download link
                        const blob = new Blob([JSON.stringify(designData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `easyfloor-design-${new Date().toISOString().substring(0, 10)}.json`;
                        a.click();
                        
                        URL.revokeObjectURL(url);
                        
                        this.showNotification('Design exported', 'success');
                    } catch (e) {
                        console.error('Error exporting design:', e);
                        this.showNotification('Error exporting design', 'error');
                    }
                },
                
                undo() {
                    // Not implemented in this simplified version
                    this.showNotification('Undo not implemented in demo', 'info');
                },
                
                redo() {
                    // Not implemented in this simplified version
                    this.showNotification('Redo not implemented in demo', 'info');
                },
                
                addToUndoStack() {
                    // Not implemented in this simplified version
                }
            };