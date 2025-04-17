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
    
    // Initialize the application
    init() {
        this.setupEventListeners();
        this.setupGrid();
        this.loadSavedDesign();
        this.createSelectionBox();
        this.updateUI();
        
        // Initialize collision manager
        CollisionManager.init();
        
        // Initialize camera controller
        CameraController.init();
        
        // Show notification
        this.showNotification('Welcome to EasyFloor! Start by selecting an item from the panel.', 'info');
    },
    
    setupEventListeners() {
        // Mode buttons
        document.getElementById('build-btn').addEventListener('click', () => this.setMode('build'));
        document.getElementById('decorate-btn').addEventListener('click', () => this.setMode('decorate'));
        document.getElementById('edit-btn').addEventListener('click', () => this.setMode('edit'));
        document.getElementById('move-btn').addEventListener('click', () => this.setMode('move'));
        document.getElementById('erase-btn').addEventListener('click', () => this.setMode('erase'));
        
        // View controls
        document.getElementById('view-2d').addEventListener('click', () => this.setView('2d'));
        document.getElementById('view-3d').addEventListener('click', () => this.setView('3d'));
        document.getElementById('zoom-in').addEventListener('click', () => CameraController.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => CameraController.zoomOut());
        
        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
                e.target.classList.add('active');
                
                // Here you would update the category content based on the selected tab
                // For now we'll just log the tab name
                console.log(`Selected tab: ${e.target.dataset.tab}`);
            });
        });
        
        // Item selection
        document.querySelectorAll('.item-card').forEach(item => {
            item.addEventListener('click', (e) => {
                const itemCard = e.target.closest('.item-card');
                document.querySelectorAll('.item-card').forEach(i => i.classList.remove('active'));
                itemCard.classList.add('active');
                
                this.selectedItem = itemCard.dataset.item;
                this.prepareObjectPlacement(this.selectedItem);
            });
        });
        
        // Placement controls
        document.getElementById('place-cancel').addEventListener('click', () => this.cancelPlacement());
        document.getElementById('place-rotate').addEventListener('click', () => this.rotateObject());
        document.getElementById('place-confirm').addEventListener('click', () => this.confirmPlacement());
        
        // Save/load/export buttons
        document.getElementById('save-btn').addEventListener('click', () => this.saveDesign());
        document.getElementById('load-btn').addEventListener('click', () => this.loadDesign());
        document.getElementById('export-btn').addEventListener('click', () => this.exportDesign());
        
        // Properties panel close button
        document.getElementById('properties-close').addEventListener('click', () => {
            document.getElementById('properties-panel').style.display = 'none';
        });
        
        // A-Frame scene events for mouse interaction
        const scene = document.querySelector('a-scene');
        
        scene.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        scene.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        scene.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Touch events for mobile
        scene.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        scene.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        scene.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Object menu event listeners
        document.getElementById('edit-btn').addEventListener('click', () => this.editSelectedObject());
        document.getElementById('rotate-btn').addEventListener('click', () => this.rotateSelectedObject());
        document.getElementById('duplicate-btn').addEventListener('click', () => this.duplicateSelectedObject());
        document.getElementById('delete-btn').addEventListener('click', () => this.deleteSelectedObject());
        
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
    },
    
    setupGrid() {
        const grid = document.getElementById('grid');
        const size = 20; // Grid size in meters
        const divisions = size / this.gridSize;
        
        // Create grid lines
        for (let i = -size/2; i <= size/2; i += this.gridSize) {
            // X axis lines
            const xLine = document.createElement('a-entity');
            xLine.setAttribute('line', `start: ${i} 0.01 ${-size/2}; end: ${i} 0.01 ${size/2}; color: #BBBBBB; opacity: 0.3`);
            grid.appendChild(xLine);
            
            // Z axis lines
            const zLine = document.createElement('a-entity');
            zLine.setAttribute('line', `start: ${-size/2} 0.01 ${i}; end: ${size/2} 0.01 ${i}; color: #BBBBBB; opacity: 0.3`);
            grid.appendChild(zLine);
        }
    },
    
    createSelectionBox() {
        // Create a selection box for highlighting selected objects
        const scene = document.querySelector('a-scene');
        this.selectionBox = document.createElement('a-entity');
        this.selectionBox.setAttribute('id', 'selection-box');
        this.selectionBox.setAttribute('visible', 'false');
        scene.appendChild(this.selectionBox);
    },
    
    setMode(mode) {
        this.mode = mode;
        
        // Update UI to reflect the current mode
        document.querySelectorAll('.build-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}-btn`).classList.add('active');
        
        // Deselect current object if in erase mode
        if (mode === 'erase') {
            this.deselectObject();
            this.showNotification('Erase mode: Click on objects to remove them', 'info');
        } else if (mode === 'move') {
            this.showNotification('Move mode: Click and drag objects to reposition them', 'info');
        } else if (mode === 'edit') {
            this.showNotification('Edit mode: Click on objects to modify their properties', 'info');
        } else {
            document.getElementById('properties-panel').style.display = 'none';
        }
        
        // Show or hide category panel based on mode
        if (mode === 'build' || mode === 'decorate') {
            document.getElementById('category-panel').style.display = 'flex';
            
            // Show the appropriate tab based on mode
            if (mode === 'build') {
                document.querySelector('[data-tab="structures"]').click();
            } else {
                document.querySelector('[data-tab="furniture"]').click();
            }
        } else {
            document.getElementById('category-panel').style.display = 'none';
        }
    },
    
    setView(view) {
        this.view = view;
        
        // Update UI to reflect the current view
        document.querySelectorAll('#view-2d, #view-3d').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`view-${view}`).classList.add('active');
        
        // Adjust camera position and rotation based on view
        if (view === '2d') {
            CameraController.set2DView();
        } else {
            CameraController.set3DView();
        }
    },
    
    prepareObjectPlacement(objectType) {
        this.isPlacing = true;
        this.currentRotation = 0;
        
        // Get object details from models
        const objectData = MODELS[objectType] || MODELS['wall']; // Default to wall if not found
        
        // Create temporary object for placement preview
        const indicator = document.getElementById('placement-indicator');
        indicator.innerHTML = ''; // Clear previous contents
        
        // Create object based on type
        const obj = this.createObject(objectType, {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: objectData.defaultScale || { x: 1, y: 1, z: 1 }
        });
        
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
        document.getElementById('placement-controls').classList.add('show');
        
        // Show placement guide
        const placementGuide = document.getElementById('placement-guide');
        placementGuide.querySelector('.text').textContent = `Click to place ${objectData.displayName || objectType}`;
        placementGuide.classList.add('show');
        
        // Show grid overlay
        document.getElementById('grid-overlay').classList.add('show');
        this.gridVisible = true;
    },
    
    createObject(type, options = {}) {
        const objectData = MODELS[type];
        if (!objectData) return null;
        
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
            
            // Store current material color for later changes
            entity.setAttribute('data-color', objectData.materials[0]);
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
            entity.setAttribute('geometry', objectData.geometry);
            entity.setAttribute('material', objectData.material);
        }
        
        return entity;
    },
    
    handleMouseDown(event) {
        // Store starting position
        const intersection = event.detail.intersection;
        if (!intersection) return;
        
        this.dragStartPosition = {
            x: intersection.point.x,
            y: intersection.point.y,
            z: intersection.point.z
        };
        
        // Handle different modes
        if (this.isPlacing) {
            // When placing, clicks handle confirmations
        } 
        else if (this.mode === 'move' && event.target.classList.contains('interactive')) {
            // Select and start moving the clicked object
            this.selectedElement = event.target.closest('.interactive');
            this.selectObject(this.selectedElement);
            this.isDragging = true;
        }
        else if (this.mode === 'edit' && event.target.classList.contains('interactive')) {
            // Select the object and show properties panel
            this.selectedElement = event.target.closest('.interactive');
            this.selectObject(this.selectedElement);
            this.showPropertiesPanel();
        }
        else if (this.mode === 'erase' && event.target.classList.contains('interactive')) {
            // Delete the clicked object
            this.selectedElement = event.target.closest('.interactive');
            this.deleteObject(this.selectedElement);
        }
        else if (event.target.closest('#ground')) {
            // Clicked on ground - deselect any selected object
            this.deselectObject();
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
            
            // Snap to grid
            const snappedPos = this.snapToGrid(this.currentPosition);
            indicator.setAttribute('position', snappedPos);
            
            // Set rotation
            indicator.setAttribute('rotation', { x: 0, y: this.currentRotation, z: 0 });
            
            // Check for collisions
            const objectType = indicator.firstChild.dataset.type;
            const objectData = MODELS[objectType];
            
            // Create a bounding box for collision detection
            const boundingBox = this.calculateBoundingBox(
                snappedPos,
                { x: 0, y: this.currentRotation, z: 0 },
                objectData.boundingBox || { width: 1, height: 1, depth: 1 }
            );
            
            // Check if placement is valid
            this.placementValid = this.isPlacementValid(boundingBox, objectType);
            
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
            const objectData = MODELS[objectType];
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
        if (this.isPlacing && event.target.closest('#ground')) {
            // Confirm placement if clicking on the ground
            if (this.placementValid) {
                this.confirmPlacement();
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
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        
        this.handleMouseDown({ detail: mouseEvent.detail, target: event.target });
    },
    
    handleTouchMove(event) {
        event.preventDefault();
        
        const touch = event.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        
        this.handleMouseMove({ detail: mouseEvent.detail });
    },
    
    handleTouchEnd(event) {
        event.preventDefault();
        
        const mouseEvent = new MouseEvent('mouseup', {});
        this.handleMouseUp({ detail: mouseEvent.detail, target: event.target });
    },
    
    confirmPlacement() {
        if (!this.placementValid) {
            this.showNotification('Cannot place object here - it overlaps with another object', 'error');
            return;
        }
        
        // Get the indicator and its position/rotation
        const indicator = document.getElementById('placement-indicator');
        const position = indicator.getAttribute('position');
        const rotation = indicator.getAttribute('rotation');
        
        // Create the actual object
        const objectType = this.selectedItem;
        const objectData = MODELS[objectType];
        
        const obj = this.createObject(objectType, {
            position: position,
            rotation: rotation,
            scale: objectData.defaultScale || { x: 1, y: 1, z: 1 }
        });
        
        // Add to the house container
        document.getElementById('house-container').appendChild(obj);
        
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
        document.getElementById('placement-controls').classList.remove('show');
        document.getElementById('placement-guide').classList.remove('show');
        document.getElementById('grid-overlay').classList.remove('show');
        
        this.isPlacing = false;
        this.gridVisible = false;
        
        // Deselect item
        document.querySelectorAll('.item-card').forEach(i => i.classList.remove('active'));
        this.selectedItem = null;
        
        // Add to undo stack
        this.addToUndoStack();
        
        // Show notification
        this.showNotification(`${objectData.displayName || objectType} placed successfully!`, 'success');
    },
    
    cancelPlacement() {
        // Hide placement indicator
        const indicator = document.getElementById('placement-indicator');
        indicator.setAttribute('visible', false);
        
        // Hide placement controls
        document.getElementById('placement-controls').classList.remove('show');
        document.getElementById('placement-guide').classList.remove('show');
        document.getElementById('grid-overlay').classList.remove('show');
        
        this.isPlacing = false;
        this.gridVisible = false;
        
        // Deselect item
        document.querySelectorAll('.item-card').forEach(i => i.classList.remove('active'));
        this.selectedItem = null;
    },
    
    rotateObject() {
        if (this.isPlacing) {
            // Rotate in 45-degree increments
            this.currentRotation = (this.currentRotation + 45) % 360;
            document.getElementById('placement-indicator').setAttribute('rotation', { x: 0, y: this.currentRotation, z: 0 });
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
        // Deselect any previously selected object
        this.deselectObject();
        
        // Select the new object
        this.selectedElement = element;
        
        // Highlight the selected object
        this.updateSelectionBox();
    },
    
    updateSelectionBox() {
        if (!this.selectedElement) {
            this.selectionBox.setAttribute('visible', false);
            return;
        }
        
        // Get object properties
        const position = this.selectedElement.getAttribute('position');
        const rotation = this.selectedElement.getAttribute('rotation');
        const objectType = this.selectedElement.dataset.type;
        const objectData = MODELS[objectType];
        
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
        this.selectionBox.setAttribute('visible', false);
        document.getElementById('object-menu').style.display = 'none';
        document.getElementById('properties-panel').style.display = 'none';
    },
    
    showObjectMenu(event) {
        // Position the menu at the mouse position
        const menu = document.getElementById('object-menu');
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
            
            this.selectedElement.setAttribute('rotation', newRotation);
            this.updateSelectionBox();
            
            // Add to undo stack
            this.addToUndoStack();
        }
    },
    
    duplicateSelectedObject() {
        if (this.selectedElement) {
            const objectType = this.selectedElement.dataset.type;
            const position = this.selectedElement.getAttribute('position');
            const rotation = this.selectedElement.getAttribute('rotation');
            const scale = this.selectedElement.getAttribute('scale');
            
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
            
            // Check if the placement is valid
            const objectData = MODELS[objectType];
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
            document.getElementById('house-container').appendChild(obj);
            
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
        }
    },
    
    deleteSelectedObject() {
        if (this.selectedElement) {
            this.deleteObject(this.selectedElement);
        }
    },
    
    deleteObject(element) {
        // Find the object in the array
        const index = this.objects.findIndex(obj => obj.element === element);
        
        if (index !== -1) {
            // Remove from the array
            this.objects.splice(index, 1);
            
            // Remove from the DOM
            element.parentNode.removeChild(element);
            
            // Deselect
            this.deselectObject();
            
            // Add to undo stack
            this.addToUndoStack();
            
            // Show notification
            this.showNotification('Object deleted', 'info');
        }
    },
    
    showPropertiesPanel() {
        if (!this.selectedElement) return;
        
        const panel = document.getElementById('properties-panel');
        const content = document.getElementById('properties-content');
        
        // Clear previous content
        content.innerHTML = '';
        
        // Get object data
        const objectType = this.selectedElement.dataset.type;
        const objectData = MODELS[objectType];
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
            
            // Add event listeners to color options
            setTimeout(() => {
                document.querySelectorAll('.color-option').forEach(option => {
                    option.addEventListener('click', () => {
                        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
                        option.classList.add('active');
                        
                        const color = option.dataset.color;
                        this.changeObjectColor(color);
                    });
                });
            }, 0);
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
            document.getElementById('pos-x').addEventListener('change', (e) => {
                const newPos = { ...position, x: parseFloat(e.target.value) };
                this.updateObjectPosition(newPos);
            });
            
            document.getElementById('pos-z').addEventListener('change', (e) => {
                const newPos = { ...position, z: parseFloat(e.target.value) };
                this.updateObjectPosition(newPos);
            });
            
            // Rotation slider
            const rotSlider = document.getElementById('rot-y');
            const rotValue = rotSlider.nextElementSibling;
            rotSlider.addEventListener('input', (e) => {
                rotValue.textContent = `${e.target.value}°`;
            });
            
            rotSlider.addEventListener('change', (e) => {
                const newRot = { ...rotation, y: parseInt(e.target.value) };
                this.updateObjectRotation(newRot);
            });
            
            // Scale sliders
            ['x', 'y', 'z'].forEach(axis => {
                const scaleSlider = document.getElementById(`scale-${axis}`);
                const scaleValue = scaleSlider.nextElementSibling;
                
                scaleSlider.addEventListener('input', (e) => {
                    scaleValue.textContent = parseFloat(e.target.value).toFixed(1);
                });
                
                scaleSlider.addEventListener('change', (e) => {
                    const newScale = { ...scale };
                    newScale[axis] = parseFloat(e.target.value);
                    this.updateObjectScale(newScale);
                });
            });
            
            // Action buttons
            document.getElementById('prop-duplicate').addEventListener('click', () => this.duplicateSelectedObject());
            document.getElementById('prop-delete').addEventListener('click', () => this.deleteSelectedObject());
        }, 0);
        
        // Show the panel
        panel.style.display = 'block';
    },
    
    updateObjectPosition(newPos) {
        if (!this.selectedElement) return;
        
        // Check if the new position is valid
        const objectType = this.selectedElement.dataset.type;
        const objectData = MODELS[objectType];
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
            document.getElementById('pos-x').value = currentPos.x.toFixed(2);
            document.getElementById('pos-z').value = currentPos.z.toFixed(2);
            
            this.showNotification('Cannot move object to this position - it overlaps with another object', 'error');
        }
    },
    
    updateObjectRotation(newRot) {
        if (!this.selectedElement) return;
        
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
        if (!this.selectedElement) return;
        
        // Check if the new scale is valid (no collisions)
        const objectType = this.selectedElement.dataset.type;
        const position = this.selectedElement.getAttribute('position');
        const rotation = this.selectedElement.getAttribute('rotation');
        
        // Create a bounding box for collision detection
        const boundingBox = {
            width: MODELS[objectType].boundingBox.width * newScale.x,
            height: MODELS[objectType].boundingBox.height * newScale.y,
            depth: MODELS[objectType].boundingBox.depth * newScale.z
        };
        
        const box = this.calculateBoundingBox(
            position,
            rotation,
            boundingBox
        );
        
        // Only scale if valid
        if (this.isPlacementValid(box, objectType, this.selectedElement)) {
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
                slider.value = currentScale[axis];
                slider.nextElementSibling.textContent = currentScale[axis].toFixed(1);
            });
            
            this.showNotification('Cannot resize object - it would overlap with another object', 'error');
        }
    },
    
    changeObjectColor(color) {
        if (!this.selectedElement) return;
        
        const objectType = this.selectedElement.dataset.type;
        const objectData = MODELS[objectType];
        
        if (objectData.materialComponent) {
            // For GLTF models, we need to set the material property on the specific component
            // This requires the model to have named materials
            this.selectedElement.setAttribute(`material__${objectData.materialComponent}`, `color: ${color}`);
            
            // Store the current color
            this.selectedElement.setAttribute('data-color', color);
        } else {
            // For primitive-based objects
            this.selectedElement.querySelectorAll('[material]').forEach(el => {
                const material = el.getAttribute('material');
                el.setAttribute('material', `${material}; color: ${color}`);
            });
        }
        
        // Add to undo stack
        this.addToUndoStack();
    },
    
    calculateBoundingBox(position, rotation, dimensions) {
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
        // Check for collisions with other objects
        return CollisionManager.checkPlacement(boundingBox, objectType, excludeElement, this.objects);
    },
    
    saveDesign() {
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
        localStorage.setItem('easyfloor_design', JSON.stringify(saveData));
        
        // Record save time
        this.lastSaved = new Date();
        
        // Show notification
        this.showNotification('Design saved successfully!', 'success');
    },
    
    loadDesign() {
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
                if (obj.element.parentNode) {
                    obj.element.parentNode.removeChild(obj.element);
                }
            });
            
            this.objects = [];
            
            // Load saved objects
            const container = document.getElementById('house-container');
            
            data.objects.forEach(objData => {
                const obj = this.createObject(objData.type, {
                    position: objData.position,
                    rotation: objData.rotation,
                    scale: objData.scale
                });
                
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
                if (objData.color) {
                    const objectData = MODELS[objData.type];
                    if (objectData.materialComponent) {
                        obj.setAttribute(`material__${objectData.materialComponent}`, `color: ${objData.color}`);
                        obj.setAttribute('data-color', objData.color);
                    } else {
                        obj.querySelectorAll('[material]').forEach(el => {
                            const material = el.getAttribute('material');
                            el.setAttribute('material', `${material}; color: ${objData.color}`);
                        });
                    }
                }
            });
            
            // Show notification
            this.showNotification('Design loaded successfully!', 'success');
            
        } catch (e) {
            console.error('Error loading design:', e);
            this.showNotification('Error loading design', 'error');
        }
    },
    
    loadSavedDesign() {
        // Check if there's a saved design on initialization
        const saveData = localStorage.getItem('easyfloor_design');
        
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                
                // Load saved objects
                const container = document.getElementById('house-container');
                
                data.objects.forEach(objData => {
                    const obj = this.createObject(objData.type, {
                        position: objData.position,
                        rotation: objData.rotation,
                        scale: objData.scale
                    });
                    
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
                    if (objData.color) {
                        const objectData = MODELS[objData.type];
                        if (objectData.materialComponent) {
                            obj.setAttribute(`material__${objectData.materialComponent}`, `color: ${objData.color}`);
                            obj.setAttribute('data-color', objData.color);
                        } else {
                            obj.querySelectorAll('[material]').forEach(el => {
                                const material = el.getAttribute('material');
                                el.setAttribute('material', `${material}; color: ${objData.color}`);
                            });
                        }
                    }
                });
                
            } catch (e) {
                console.error('Error loading saved design:', e);
            }
        }
    },
    
    exportDesign() {
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
    },
    
    undo() {
        if (this.undoStack.length === 0) return;
        
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
    },
    
    redo() {
        if (this.redoStack.length === 0) return;
        
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
    },
    
    applyState(state) {
        // Clear current objects
        this.objects.forEach(obj => {
            if (obj.element.parentNode) {
                obj.element.parentNode.removeChild(obj.element);
            }
        });
        
        // Apply the new state
        this.objects = state.objects;
        
        // Add all objects to the container
        const container = document.getElementById('house-container');
        
        this.objects.forEach(obj => {
            container.appendChild(obj.element);
        });
    },
    
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const text = document.getElementById('notification-text');
        
        // Set message and type
        text.textContent = message;
        
        // Remove all type classes
        notification.classList.remove('info', 'success', 'error');
        
        // Add the appropriate type class
        notification.classList.add(type);
        
        // Show the notification
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    },
    
    updateUI() {
        // Update the UI based on the current state
        // This is called when the application initializes or when the state changes
        
        // Set the correct mode button
        document.querySelectorAll('.build-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${this.mode}-btn`).classList.add('active');
        
        // Show or hide panels based on mode
        if (this.mode === 'build' || this.mode === 'decorate') {
            document.getElementById('category-panel').style.display = 'flex';
        } else {
            document.getElementById('category-panel').style.display = 'none';
        }
    }
};

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    APP.init();
});