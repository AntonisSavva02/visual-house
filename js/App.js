// app.js - Main application controller
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    const app = new FloorPlanApp();
    app.init();
});

class FloorPlanApp {
    constructor() {
        // Global state variables
        this.currentTool = 'wall';
        this.isDrawing = false;
        this.drawStartPosition = null;
        this.drawCurrentPosition = null;
        this.selectedObject = null;
        this.wallHeight = 2.7; // Fixed wall height (2.7 meters)
        this.wallThickness = 0.15; // Fixed wall thickness (15cm)
        this.snapToGrid = true;
        this.gridSize = 0.5; // Half-meter grid
        this.wallSegments = []; // Keep track of wall segments
        this.roomSegments = []; // Track room segments
        this.selectedFurnitureType = null;
        
        // DOM elements
        this.scene = null;
        this.camera = null;
        this.houseContainer = null;
        this.drawingIndicator = null;
        this.gridEntity = null;
        this.objectActions = null;
        this.propertiesPanel = null;
        this.catalogPanel = null;
        this.notification = null;
        this.guidance = null;
        this.measurement = null;
    }

    init() {
        // Initialize the scene once it's loaded
        this.scene = document.querySelector('a-scene');
        this.scene.addEventListener('loaded', () => this.sceneLoaded());
        
        // Setup UI handlers immediately (no need to wait for scene)
        this.setupUIHandlers();
    }

    sceneLoaded() {
        console.log('A-Frame scene loaded');
        
        // Get references to scene elements
        this.camera = document.getElementById('camera');
        this.houseContainer = document.getElementById('house-container');
        this.drawingIndicator = document.getElementById('drawing-indicator');
        this.gridEntity = document.getElementById('grid');
        
        // Get references to UI elements
        this.objectActions = document.getElementById('object-actions');
        this.propertiesPanel = document.getElementById('properties');
        this.catalogPanel = document.getElementById('catalog');
        this.notification = document.getElementById('notification');
        this.guidance = document.getElementById('drawing-guidance');
        this.measurement = document.getElementById('measurement');
        
        // Create grid for reference
        this.createGrid();
        
        // Setup event handlers
        this.setupToolbar();
        this.setupSceneEvents();
        
        // Show initial guidance
        this.showGuidance('Click and drag to draw walls');
    }

    createGrid() {
        const gridSize = 30; // Total grid size in meters
        const gridInterval = 1; // 1-meter grid
        const gridLineCount = gridSize / gridInterval;
        const gridColor = '#555555';
        
        // Create lines along x-axis
        for (let i = 0; i <= gridLineCount; i++) {
            const linePos = (i * gridInterval) - (gridSize / 2);
            const line = document.createElement('a-entity');
            line.setAttribute('geometry', {
                primitive: 'plane',
                width: 0.02,
                height: gridSize
            });
            line.setAttribute('material', {
                color: gridColor,
                opacity: 0.2,
                transparent: true
            });
            line.setAttribute('position', {
                x: linePos,
                y: 0,
                z: 0
            });
            line.setAttribute('rotation', {
                x: -90,
                y: 0,
                z: 0
            });
            line.classList.add('grid-line');
            this.gridEntity.appendChild(line);
        }
        
        // Create lines along z-axis
        for (let i = 0; i <= gridLineCount; i++) {
            const linePos = (i * gridInterval) - (gridSize / 2);
            const line = document.createElement('a-entity');
            line.setAttribute('geometry', {
                primitive: 'plane',
                width: gridSize,
                height: 0.02
            });
            line.setAttribute('material', {
                color: gridColor,
                opacity: 0.2,
                transparent: true
            });
            line.setAttribute('position', {
                x: 0,
                y: 0,
                z: linePos
            });
            line.setAttribute('rotation', {
                x: -90,
                y: 0,
                z: 0
            });
            line.classList.add('grid-line');
            this.gridEntity.appendChild(line);
        }
    }

    setupToolbar() {
        // Tool selection
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active tool
                const tool = e.currentTarget.id.split('-')[0];
                this.currentTool = tool;
                
                // Update button states
                toolButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Show appropriate guidance based on tool
                this.updateGuidanceForTool(tool);
                
                // Deselect any currently selected object
                if (this.selectedObject) {
                    this.unhighlightObject(this.selectedObject);
                    this.selectedObject = null;
                    this.hideObjectActions();
                }
            });
        });
    }
    
    updateGuidanceForTool(tool) {
        switch(tool) {
            case 'wall':
                this.showGuidance('Click and drag to draw walls');
                break;
            case 'door':
                this.showGuidance('Click on a wall to add a door');
                break;
            case 'window':
                this.showGuidance('Click on a wall to add a window');
                break;
            case 'room':
                this.showGuidance('Click to auto-detect room from walls');
                break;
            case 'furniture':
                this.showGuidance('Select furniture from the catalog');
                break;
            case 'paint':
                this.showGuidance('Click on objects to change their color');
                break;
            case 'select':
                this.showGuidance('Click objects to select and edit them');
                break;
            case 'delete':
                this.showGuidance('Click objects to delete them');
                break;
        }
    }

    setupSceneEvents() {
        // Mouse down event for starting wall drawing
        this.scene.addEventListener('mousedown', (evt) => {
            if (this.currentTool !== 'wall' || this.isDrawing) return;
            
            // Make sure we're clicking on the ground
            if (evt.detail.intersection && evt.detail.intersection.object.el.id === 'ground') {
                this.isDrawing = true;
                
                // Get start position and snap to grid if enabled
                const point = evt.detail.intersection.point;
                this.drawStartPosition = this.snapToGrid ? this.snapPointToGrid(point) : point;
                
                // Create drawing indicator
                this.createDrawingIndicator(this.drawStartPosition);
                
                // Show measurement display
                this.measurement.style.display = 'block';
            }
        });
        
        // Mouse move event for updating wall preview while drawing
        this.scene.addEventListener('mousemove', (evt) => {
            if (!this.isDrawing) return;
            
            if (evt.detail.intersection) {
                // Get current position and snap to grid if enabled
                const point = evt.detail.intersection.point;
                this.drawCurrentPosition = this.snapToGrid ? this.snapPointToGrid(point) : point;
                
                // Update drawing indicator
                this.updateDrawingIndicator(this.drawStartPosition, this.drawCurrentPosition);
                
                // Update measurement display
                this.updateMeasurement(this.drawStartPosition, this.drawCurrentPosition);
            }
        });
        
        // Mouse up event for finalizing wall creation
        this.scene.addEventListener('mouseup', () => {
            if (!this.isDrawing) return;
            
            // Only create wall if we have both positions and they're different
            if (this.drawStartPosition && this.drawCurrentPosition &&
                (this.drawStartPosition.x !== this.drawCurrentPosition.x || 
                 this.drawStartPosition.z !== this.drawCurrentPosition.z)) {
                
                // Create the actual wall
                this.createWall(this.drawStartPosition, this.drawCurrentPosition);
            }
            
            // Reset drawing state
            this.isDrawing = false;
            this.drawStartPosition = null;
            this.drawCurrentPosition = null;
            
            // Remove drawing indicator
            this.removeDrawingIndicator();
            
            // Hide measurement display
            this.measurement.style.display = 'none';
        });
        
        // Handle clicks on interactive objects
        this.scene.addEventListener('click', (evt) => {
            // Skip if we're in drawing mode
            if (this.isDrawing) return;
            
            // Check if we clicked on the ground and we're in furniture placement mode
            if (this.currentTool === 'furniture' && this.selectedFurnitureType &&
                evt.detail.intersection && evt.detail.intersection.object.el.id === 'ground') {
                
                const position = this.snapToGrid ? 
                    this.snapPointToGrid(evt.detail.intersection.point) : 
                    evt.detail.intersection.point;
                
                this.placeFurniture(this.selectedFurnitureType, position);
                return;
            }
            
            // Check if we clicked on an interactive object
            if (evt.detail.intersection && evt.detail.intersection.object.el.classList.contains('interactive')) {
                const clickedObject = evt.detail.intersection.object.el;
                
                // Handle based on current tool
                this.handleObjectClick(clickedObject, evt.detail.intersection);
            }
        });
    }

    setupUIHandlers() {
        // Properties panel close button
        document.getElementById('properties-close').addEventListener('click', () => {
            this.propertiesPanel.style.display = 'none';
        });
        
        // Catalog tab switching
        const catalogTabs = document.querySelectorAll('.catalog-tab');
        catalogTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Update active tab
                catalogTabs.forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Filter catalog content based on selected tab
                const tabType = e.currentTarget.getAttribute('data-tab');
                this.filterCatalogItems(tabType);
                
                this.showNotification(`Switched to ${e.currentTarget.textContent} tab`);
            });
        });
        
        // Catalog item selection
        const catalogItems = document.querySelectorAll('.catalog-item');
        catalogItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const furnitureType = e.currentTarget.getAttribute('data-item');
                
                // Switch to furniture placement mode
                this.currentTool = 'furniture';
                document.querySelectorAll('.tool-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.id === 'furniture-tool') {
                        btn.classList.add('active');
                    }
                });
                
                // Set the selected furniture type
                this.selectedFurnitureType = furnitureType;
                
                this.showGuidance(`Click to place ${furnitureType}`);
                this.showNotification(`Selected ${furnitureType}. Click to place.`, 'success');
            });
        });
        
        // Object action buttons
        document.getElementById('rotate-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.selectedObject) {
                this.rotateObject(this.selectedObject);
            }
        });
        
        document.getElementById('edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.selectedObject) {
                this.showPropertiesPanel(this.selectedObject);
            }
        });
        
        document.getElementById('remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.selectedObject) {
                this.deleteObject(this.selectedObject);
            }
        });
        
        // Save and load buttons
        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveDesign();
        });
        
        document.getElementById('load-btn').addEventListener('click', () => {
            this.loadDesign();
        });
        
        // Export button
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportDesign();
        });
        
        // Help button
        document.getElementById('help-btn').addEventListener('click', () => {
            this.showHelp();
        });
    }

    // Utility methods
    
    snapPointToGrid(point) {
        return {
            x: Math.round(point.x / this.gridSize) * this.gridSize,
            y: point.y,
            z: Math.round(point.z / this.gridSize) * this.gridSize
        };
    }
    
    createDrawingIndicator(startPos) {
        // Remove any existing indicator
        this.removeDrawingIndicator();
        
        // Create new indicator entity
        const indicator = document.createElement('a-entity');
        indicator.id = 'wall-preview';
        
        // Create a cylinder for start point
        const startPoint = document.createElement('a-cylinder');
        startPoint.setAttribute('radius', 0.1);
        startPoint.setAttribute('height', 0.1);
        startPoint.setAttribute('color', '#4CC3D9');
        startPoint.setAttribute('position', {
            x: startPos.x,
            y: 0.05,
            z: startPos.z
        });
        
        indicator.appendChild(startPoint);
        this.drawingIndicator.appendChild(indicator);
        this.drawingIndicator.setAttribute('visible', 'true');
    }
    
    updateDrawingIndicator(startPos, endPos) {
        // First, make sure the indicator is visible
        this.drawingIndicator.setAttribute('visible', 'true');
        
        // Get the wall preview entity
        const wallPreview = document.getElementById('wall-preview');
        if (!wallPreview) return;
        
        // Calculate wall dimensions
        const dx = endPos.x - startPos.x;
        const dz = endPos.z - startPos.z;
        const length = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dz, dx) * (180 / Math.PI);
        
        // Create or update the wall preview line
        let line = wallPreview.querySelector('.preview-line');
        if (!line) {
            line = document.createElement('a-entity');
            line.classList.add('preview-line');
            wallPreview.appendChild(line);
        }
        
        // Position the preview wall in the middle of the start and end points
        const midX = (startPos.x + endPos.x) / 2;
        const midZ = (startPos.z + endPos.z) / 2;
        
        // Set the line's properties
        line.setAttribute('geometry', {
            primitive: 'box',
            width: length,
            height: this.wallHeight,
            depth: this.wallThickness
        });
        
        line.setAttribute('material', {
            color: '#4CC3D9',
            opacity: 0.5,
            transparent: true
        });
        
        line.setAttribute('position', {
            x: midX,
            y: this.wallHeight / 2,
            z: midZ
        });
        
        line.setAttribute('rotation', {
            x: 0,
            y: angle,
            z: 0
        });
        
        // Create or update end point indicator
        let endPoint = wallPreview.querySelector('.end-point');
        if (!endPoint) {
            endPoint = document.createElement('a-cylinder');
            endPoint.classList.add('end-point');
            wallPreview.appendChild(endPoint);
        }
        
        endPoint.setAttribute('radius', 0.1);
        endPoint.setAttribute('height', 0.1);
        endPoint.setAttribute('color', '#4CC3D9');
        endPoint.setAttribute('position', {
            x: endPos.x,
            y: 0.05,
            z: endPos.z
        });
    }
    
    removeDrawingIndicator() {
        const indicator = document.getElementById('wall-preview');
        if (indicator) {
            indicator.remove();
        }
        this.drawingIndicator.setAttribute('visible', 'false');
    }
    
    updateMeasurement(startPos, endPos) {
        const dx = endPos.x - startPos.x;
        const dz = endPos.z - startPos.z;
        const length = Math.sqrt(dx * dx + dz * dz);
        
        this.measurement.textContent = `Length: ${length.toFixed(2)}m`;
        this.measurement.style.display = 'block';
    }
    
    createWall(startPos, endPos) {
        // Calculate wall dimensions
        const dx = endPos.x - startPos.x;
        const dz = endPos.z - startPos.z;
        const length = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dz, dx) * (180 / Math.PI);
        
        // Create wall entity
        const wall = document.createElement('a-entity');
        wall.classList.add('interactive', 'wall');
        wall.setAttribute('data-type', 'wall');
        wall.setAttribute('data-length', length);
        wall.setAttribute('data-orientation', angle);
        
        // Position the wall in the middle of the start and end points
        const midX = (startPos.x + endPos.x) / 2;
        const midZ = (startPos.z + endPos.z) / 2;
        
        // Create the wall mesh
        const wallMesh = document.createElement('a-box');
        wallMesh.setAttribute('width', length);
        wallMesh.setAttribute('height', this.wallHeight);
        wallMesh.setAttribute('depth', this.wallThickness);
        wallMesh.setAttribute('color', '#F5F5F5');
        wallMesh.setAttribute('material', 'color: #F5F5F5');
        wallMesh.classList.add('collidable');
        
        // Add the mesh to the wall entity
        wall.appendChild(wallMesh);
        
        // Position and rotate the wall
        wall.setAttribute('position', {
            x: midX,
            y: this.wallHeight / 2,
            z: midZ
        });
        
        wall.setAttribute('rotation', {
            x: 0,
            y: angle,
            z: 0
        });
        
        // Store wall segment data for room detection
        this.wallSegments.push({
            start: { x: startPos.x, z: startPos.z },
            end: { x: endPos.x, z: endPos.z },
            length: length,
            angle: angle,
            entity: wall
        });
        
        // Add wall to house container
        this.houseContainer.appendChild(wall);
        
        // Show notification
        this.showNotification('Wall added successfully!', 'success');
    }
    
    handleObjectClick(object, intersection) {
        const objectType = object.classList.contains('wall') ? 'wall' : 
                          object.classList.contains('door') ? 'door' :
                          object.classList.contains('window') ? 'window' :
                          object.classList.contains('furniture') ? 'furniture' : 'unknown';
        
        switch(this.currentTool) {
            case 'select':
                this.selectObject(object, intersection);
                break;
            case 'delete':
                this.deleteObject(object);
                break;
            case 'door':
                if (objectType === 'wall') {
                    this.addDoorToWall(object, intersection);
                } else {
                    this.showNotification('Doors can only be added to walls', 'error');
                }
                break;
            case 'window':
                if (objectType === 'wall') {
                    this.addWindowToWall(object, intersection);
                } else {
                    this.showNotification('Windows can only be added to walls', 'error');
                }
                break;
            case 'paint':
                this.showColorOptions(object);
                break;
            case 'furniture':
                // Don't do anything when clicking an object in furniture mode
                break;
        }
    }
    
    selectObject(object, intersection) {
        // Deselect previously selected object if any
        if (this.selectedObject) {
            this.unhighlightObject(this.selectedObject);
        }
        
        // Select new object
        this.selectedObject = object;
        this.highlightObject(object);
        
        // Show object actions near the object
        this.showObjectActions(object, intersection);
    }
    
    highlightObject(object) {
        // Add highlight effect
        const highlightColor = '#4CC3D9';
        
        if (object.hasAttribute('material')) {
            // Store original color
            const originalColor = object.getAttribute('material').color;
            object.setAttribute('data-original-color', originalColor);
            
            // Apply highlight color
            object.setAttribute('material', 'color', highlightColor);
        } else {
            // For composite objects, highlight all child meshes
            const meshes = object.querySelectorAll('[material]');
            meshes.forEach(mesh => {
                const originalColor = mesh.getAttribute('material').color;
                mesh.setAttribute('data-original-color', originalColor);
                mesh.setAttribute('material', 'color', highlightColor);
            });
        }
        
        // Add wireframe or outline effect (simplified for this demo)
        object.setAttribute('data-selected', 'true');
    }
    
    unhighlightObject(object) {
        // Remove highlight effect
        if (object.hasAttribute('material') && object.hasAttribute('data-original-color')) {
            // Restore original color
            const originalColor = object.getAttribute('data-original-color');
            object.setAttribute('material', 'color', originalColor);
            object.removeAttribute('data-original-color');
        } else {
            // For composite objects, restore all child meshes
            const meshes = object.querySelectorAll('[material]');
            meshes.forEach(mesh => {
                if (mesh.hasAttribute('data-original-color')) {
                    const originalColor = mesh.getAttribute('data-original-color');
                    mesh.setAttribute('material', 'color', originalColor);
                    mesh.removeAttribute('data-original-color');
                }
            });
        }
        
        // Remove wireframe or outline effect
        object.removeAttribute('data-selected');
    }
    
    showObjectActions(object, intersection) {
        // Get object position in 3D space
        const objectPos = object.getAttribute('position');
        
        // Convert to screen coordinates
        const canvas = document.querySelector('canvas');
        const camera = document.getElementById('camera');
        
        // Position the actions menu slightly above the object
        const actionsY = objectPos.y + (object.classList.contains('wall') ? this.wallHeight : 1);
        const tempPos = { x: objectPos.x, y: actionsY, z: objectPos.z };
        
        // Simple way to position overlay UI near the 3D object
        // For a real implementation, you'd use proper 3D->2D coordinate conversion
        const objectRect = object.getBoundingClientRect();
        
        // Show the actions menu
        this.objectActions.style.display = 'flex';
        this.objectActions.style.left = `${objectRect.left + (objectRect.width / 2) - 50}px`;
        this.objectActions.style.top = `${objectRect.top - 50}px`;
    }
    
    hideObjectActions() {
        this.objectActions.style.display = 'none';
    }
    
    deleteObject(object) {
        // Find and remove the object from appropriate tracking arrays
        if (object.classList.contains('wall')) {
            this.removeWallSegment(object);
        }
        
        // Remove the object from the scene
        object.parentNode.removeChild(object);
        
        // Reset selection state
        this.selectedObject = null;
        this.hideObjectActions();
        
        // Show notification
        this.showNotification('Object deleted', 'success');
    }
    
    removeWallSegment(wallEntity) {
        // Find and remove the wall from wallSegments array
        const index = this.wallSegments.findIndex(segment => segment.entity === wallEntity);
        if (index !== -1) {
            this.wallSegments.splice(index, 1);
        }
    }
    
    rotateObject(object) {
        // Get current rotation
        const currentRotation = object.getAttribute('rotation');
        
        // Rotate by 90 degrees around y-axis
        const newYRotation = (currentRotation.y + 90) % 360;
        
        // Apply new rotation
        object.setAttribute('rotation', {
            x: currentRotation.x,
            y: newYRotation,
            z: currentRotation.z
        });
        
        this.showNotification('Object rotated 90°', 'success');
    }
    
    addDoorToWall(wall, intersection) {
        // Get wall dimensions and position
        const wallWidth = parseFloat(wall.getAttribute('data-length'));
        const wallPosition = wall.getAttribute('position');
        const wallRotation = wall.getAttribute('rotation');
        
        // Create door entity
        const door = document.createElement('a-entity');
        door.classList.add('interactive', 'door');
        door.setAttribute('data-type', 'door');
        
        // Get the template content
        const template = document.getElementById('door-template');
        const templateHTML = template.innerHTML;
        
        // Parse the template HTML and create elements from it
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = templateHTML;
        
        // Extract the content from the template
        const templateParts = tempContainer.querySelectorAll('*');
        templateParts.forEach(part => {
            const el = document.createElement(part.tagName);
            
            // Copy all attributes
            Array.from(part.attributes).forEach(attr => {
                el.setAttribute(attr.name, attr.value);
            });
            
            door.appendChild(el);
        });
        
        // Position the door
        // For simplicity, we'll place it in the middle of the wall
        door.setAttribute('position', wallPosition);
        door.setAttribute('rotation', wallRotation);
        
        // Add door to house container
        this.houseContainer.appendChild(door);
        
        // Show notification
        this.showNotification('Door added to wall', 'success');
    }
    
    addWindowToWall(wall, intersection) {
        // Get wall dimensions and position
        const wallWidth = parseFloat(wall.getAttribute('data-length'));
        const wallPosition = wall.getAttribute('position');
        const wallRotation = wall.getAttribute('rotation');
        
        // Create window entity
        const windowEntity = document.createElement('a-entity');
        windowEntity.classList.add('interactive', 'window');
        windowEntity.setAttribute('data-type', 'window');
        
        // Get the template content
        const template = document.getElementById('window-template');
        const templateHTML = template.innerHTML;
        
        // Parse the template HTML and create elements from it
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = templateHTML;
        
        // Extract the content from the template
        const templateParts = tempContainer.querySelectorAll('*');
        templateParts.forEach(part => {
            const el = document.createElement(part.tagName);
            
            // Copy all attributes
            Array.from(part.attributes).forEach(attr => {
                el.setAttribute(attr.name, attr.value);
            });
            
            windowEntity.appendChild(el);
        });
        
        // Position the window
        // For simplicity, we'll place it in the middle of the wall
        windowEntity.setAttribute('position', wallPosition);
        windowEntity.setAttribute('rotation', wallRotation);
        
        // Add window to house container
        this.houseContainer.appendChild(windowEntity);
        
        // Show notification
        this.showNotification('Window added to wall', 'success');
    }
    
    placeFurniture(furnitureType, position) {
        // Create furniture entity
        const furniture = document.createElement('a-entity');
        furniture.classList.add('interactive', 'furniture', furnitureType);
        furniture.setAttribute('data-type', 'furniture');
        furniture.setAttribute('data-furniture-type', furnitureType);
        
        // Get the template content
        const template = document.getElementById(`${furnitureType}-template`);
        if (!template) {
            this.showNotification(`No template found for ${furnitureType}`, 'error');
            return;
        }
        
        const templateHTML = template.innerHTML;
        
        // Parse the template HTML and create elements from it
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = templateHTML;
        
        // Extract the content from the template
        const templateParts = tempContainer.querySelectorAll('*');
        templateParts.forEach(part => {
            const el = document.createElement(part.tagName);
            
            // Copy all attributes
            Array.from(part.attributes).forEach(attr => {
                el.setAttribute(attr.name, attr.value);
            });
            
            furniture.appendChild(el);
        });
        
        // Apply collision detection
        if (this.checkCollision(furniture, position)) {
            this.showNotification('Cannot place furniture here - collision detected', 'error');
            return;
        }
        
        // Position the furniture
        furniture.setAttribute('position', {
            x: position.x,
            y: 0, // Place on the ground
            z: position.z
        });
        
        // Add furniture to house container
        this.houseContainer.appendChild(furniture);
        
        // Show notification
        this.showNotification(`${furnitureType} placed`, 'success');
    }
    
    checkCollision(newObject, position) {
        // Simple placeholder for collision detection
        // In a real implementation, you would use proper physics/collision detection
        
        // For now, let's just check if this position overlaps with any other furniture
        const furnitureItems = document.querySelectorAll('.furniture');
        
        for (let item of furnitureItems) {
            const itemPos = item.getAttribute('position');
            const distance = Math.sqrt(
                Math.pow(position.x - itemPos.x, 2) + 
                Math.pow(position.z - itemPos.z, 2)
            );
            
            // Simple distance check - consider overlapping if within 1 meter
            if (distance < 1) {
                return true; // Collision detected
            }
        }
        
        return false; // No collision
    }
    
    showPropertiesPanel(object) {
        // Get object type
        const objectType = object.getAttribute('data-type') || 
                          (object.classList.contains('wall') ? 'wall' : 
                           object.classList.contains('door') ? 'door' :
                           object.classList.contains('window') ? 'window' :
                           object.classList.contains('furniture') ? 'furniture' : 'unknown');
        
        // Get properties content element
        const propertiesContent = document.getElementById('properties-content');
        
        // Clear previous content
        propertiesContent.innerHTML = '';
        
        // Build properties interface based on object type
        switch(objectType) {
            case 'wall':
                this.buildWallProperties(object, propertiesContent);
                break;
            case 'door':
                this.buildDoorProperties(object, propertiesContent);
                break;
            case 'window':
                this.buildWindowProperties(object, propertiesContent);
                break;
            case 'furniture':
                this.buildFurnitureProperties(object, propertiesContent);
                break;
            default:
                propertiesContent.innerHTML = '<p>No properties available</p>';
        }
        
        // Show the panel
        this.propertiesPanel.style.display = 'block';
    }
    
    buildWallProperties(wall, container) {
        // Create dimensions group
        const dimensionsGroup = document.createElement('div');
        dimensionsGroup.className = 'property-group';
        
        const groupTitle = document.createElement('div');
        groupTitle.className = 'group-title';
        groupTitle.textContent = 'Dimensions';
        dimensionsGroup.appendChild(groupTitle);
        
        // Get wall data
        const length = wall.getAttribute('data-length') || 1;
        
        // Length property
        const lengthRow = document.createElement('div');
        lengthRow.className = 'property-row';
        
        const lengthLabel = document.createElement('label');
        lengthLabel.textContent = 'Length (m)';
        lengthRow.appendChild(lengthLabel);
        
        const lengthInput = document.createElement('input');
        lengthInput.type = 'number';
        lengthInput.min = '0.5';
        lengthInput.step = '0.1';
        lengthInput.value = length;
        lengthInput.addEventListener('change', (e) => {
            const newLength = parseFloat(e.target.value);
            this.updateWallLength(wall, newLength);
        });
        lengthRow.appendChild(lengthInput);
        dimensionsGroup.appendChild(lengthRow);
        
        // Add dimensions group to container
        container.appendChild(dimensionsGroup);
        
        // Create appearance group
        const appearanceGroup = document.createElement('div');
        appearanceGroup.className = 'property-group';
        
        const appearanceTitle = document.createElement('div');
        appearanceTitle.className = 'group-title';
        appearanceTitle.textContent = 'Appearance';
        appearanceGroup.appendChild(appearanceTitle);
        
        // Color options
        const colorOptionsRow = document.createElement('div');
        colorOptionsRow.className = 'property-row';
        
        const colorLabel = document.createElement('label');
        colorLabel.textContent = 'Wall Color';
        colorOptionsRow.appendChild(colorLabel);
        
        const colorOptions = document.createElement('div');
        colorOptions.className = 'color-options';
        
        // Add color swatches
        const colors = ['#F5F5F5', '#D3D3D3', '#A9A9A9', '#E6E6FA', '#FFE4E1'];
        colors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            colorOption.addEventListener('click', () => {
                this.changeObjectColor(wall, color);
                
                // Update active state of color options
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                colorOption.classList.add('active');
            });
            colorOptions.appendChild(colorOption);
        });
        
        colorOptionsRow.appendChild(colorOptions);
        appearanceGroup.appendChild(colorOptionsRow);
        
        // Add appearance group to container
        container.appendChild(appearanceGroup);
        
        // Create actions group
        const actionsGroup = document.createElement('div');
        actionsGroup.className = 'property-group';
        
        const actionsTitle = document.createElement('div');
        actionsTitle.className = 'group-title';
        actionsTitle.textContent = 'Actions';
        actionsGroup.appendChild(actionsTitle);
        
        // Action buttons
        const actionsRow = document.createElement('div');
        actionsRow.className = 'property-actions';
        
        const rotateBtn = document.createElement('button');
        rotateBtn.className = 'property-btn';
        rotateBtn.textContent = 'Rotate';
        rotateBtn.addEventListener('click', () => {
            this.rotateObject(wall);
        });
        actionsRow.appendChild(rotateBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'property-btn danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            this.deleteObject(wall);
            this.propertiesPanel.style.display = 'none';
        });
        actionsRow.appendChild(deleteBtn);
        
        actionsGroup.appendChild(actionsRow);
        
        // Add actions group to container
        container.appendChild(actionsGroup);
    }
    
    buildDoorProperties(door, container) {
        // Create appearance group
        const appearanceGroup = document.createElement('div');
        appearanceGroup.className = 'property-group';
        
        const appearanceTitle = document.createElement('div');
        appearanceTitle.className = 'group-title';
        appearanceTitle.textContent = 'Appearance';
        appearanceGroup.appendChild(appearanceTitle);
        
        // Color options
        const colorOptionsRow = document.createElement('div');
        colorOptionsRow.className = 'property-row';
        
        const colorLabel = document.createElement('label');
        colorLabel.textContent = 'Door Color';
        colorOptionsRow.appendChild(colorLabel);
        
        const colorOptions = document.createElement('div');
        colorOptions.className = 'color-options';
        
        // Add color swatches for doors
        const colors = ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#F5DEB3'];
        colors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            colorOption.addEventListener('click', () => {
                this.changeObjectColor(door, color);
                
                // Update active state of color options
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                colorOption.classList.add('active');
            });
            colorOptions.appendChild(colorOption);
        });
        
        colorOptionsRow.appendChild(colorOptions);
        appearanceGroup.appendChild(colorOptionsRow);
        
        // Add appearance group to container
        container.appendChild(appearanceGroup);
        
        // Create door type row
        const typeRow = document.createElement('div');
        typeRow.className = 'property-row';
        
        const typeLabel = document.createElement('label');
        typeLabel.textContent = 'Door Type';
        typeRow.appendChild(typeLabel);
        
        const typeSelect = document.createElement('select');
        
        const option1 = document.createElement('option');
        option1.value = 'standard';
        option1.textContent = 'Standard';
        typeSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = 'sliding';
        option2.textContent = 'Sliding';
        typeSelect.appendChild(option2);
        
        const option3 = document.createElement('option');
        option3.value = 'pocket';
        option3.textContent = 'Pocket';
        typeSelect.appendChild(option3);
        
        typeRow.appendChild(typeSelect);
        appearanceGroup.appendChild(typeRow);
        
        // Create actions group
        const actionsGroup = document.createElement('div');
        actionsGroup.className = 'property-group';
        
        const actionsTitle = document.createElement('div');
        actionsTitle.className = 'group-title';
        actionsTitle.textContent = 'Actions';
        actionsGroup.appendChild(actionsTitle);
        
        // Action buttons
        const actionsRow = document.createElement('div');
        actionsRow.className = 'property-actions';
        
        const rotateBtn = document.createElement('button');
        rotateBtn.className = 'property-btn';
        rotateBtn.textContent = 'Rotate';
        rotateBtn.addEventListener('click', () => {
            this.rotateObject(door);
        });
        actionsRow.appendChild(rotateBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'property-btn danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            this.deleteObject(door);
            this.propertiesPanel.style.display = 'none';
        });
        actionsRow.appendChild(deleteBtn);
        
        actionsGroup.appendChild(actionsRow);
        
        // Add actions group to container
        container.appendChild(actionsGroup);
    }
    
    buildWindowProperties(windowObj, container) {
        // Create appearance group
        const appearanceGroup = document.createElement('div');
        appearanceGroup.className = 'property-group';
        
        const appearanceTitle = document.createElement('div');
        appearanceTitle.className = 'group-title';
        appearanceTitle.textContent = 'Appearance';
        appearanceGroup.appendChild(appearanceTitle);
        
        // Window type row
        const typeRow = document.createElement('div');
        typeRow.className = 'property-row';
        
        const typeLabel = document.createElement('label');
        typeLabel.textContent = 'Window Type';
        typeRow.appendChild(typeLabel);
        
        const typeSelect = document.createElement('select');
        
        const option1 = document.createElement('option');
        option1.value = 'standard';
        option1.textContent = 'Standard';
        typeSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = 'casement';
        option2.textContent = 'Casement';
        typeSelect.appendChild(option2);
        
        const option3 = document.createElement('option');
        option3.value = 'bay';
        option3.textContent = 'Bay';
        typeSelect.appendChild(option3);
        
        typeRow.appendChild(typeSelect);
        appearanceGroup.appendChild(typeRow);
        
        // Glass opacity row
        const opacityRow = document.createElement('div');
        opacityRow.className = 'property-row';
        
        const opacityLabel = document.createElement('label');
        opacityLabel.textContent = 'Glass Opacity';
        opacityRow.appendChild(opacityLabel);
        
        const opacityInput = document.createElement('input');
        opacityInput.type = 'range';
        opacityInput.min = '0';
        opacityInput.max = '1';
        opacityInput.step = '0.1';
        opacityInput.value = '0.7';
        opacityInput.addEventListener('input', (e) => {
            const opacity = parseFloat(e.target.value);
            this.changeWindowOpacity(windowObj, opacity);
        });
        opacityRow.appendChild(opacityInput);
        appearanceGroup.appendChild(opacityRow);
        
        // Add appearance group to container
        container.appendChild(appearanceGroup);
        
        // Create actions group
        const actionsGroup = document.createElement('div');
        actionsGroup.className = 'property-group';
        
        const actionsTitle = document.createElement('div');
        actionsTitle.className = 'group-title';
        actionsTitle.textContent = 'Actions';
        actionsGroup.appendChild(actionsTitle);
        
        // Action buttons
        const actionsRow = document.createElement('div');
        actionsRow.className = 'property-actions';
        
        const rotateBtn = document.createElement('button');
        rotateBtn.className = 'property-btn';
        rotateBtn.textContent = 'Rotate';
        rotateBtn.addEventListener('click', () => {
            this.rotateObject(windowObj);
        });
        actionsRow.appendChild(rotateBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'property-btn danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            this.deleteObject(windowObj);
            this.propertiesPanel.style.display = 'none';
        });
        actionsRow.appendChild(deleteBtn);
        
        actionsGroup.appendChild(actionsRow);
        
        // Add actions group to container
        container.appendChild(actionsGroup);
    }
    
    buildFurnitureProperties(furniture, container) {
        // Get furniture type
        const furnitureType = furniture.getAttribute('data-furniture-type') || 'unknown';
        
        // Create dimensions group
        const dimensionsGroup = document.createElement('div');
        dimensionsGroup.className = 'property-group';
        
        const groupTitle = document.createElement('div');
        groupTitle.className = 'group-title';
        groupTitle.textContent = 'Dimensions';
        dimensionsGroup.appendChild(groupTitle);
        
        // Scale property
        const scaleRow = document.createElement('div');
        scaleRow.className = 'property-row';
        
        const scaleLabel = document.createElement('label');
        scaleLabel.textContent = 'Size Scale';
        scaleRow.appendChild(scaleLabel);
        
        const scaleInput = document.createElement('input');
        scaleInput.type = 'range';
        scaleInput.min = '0.5';
        scaleInput.max = '1.5';
        scaleInput.step = '0.1';
        scaleInput.value = '1.0';
        scaleInput.addEventListener('input', (e) => {
            const scale = parseFloat(e.target.value);
            this.scaleFurniture(furniture, scale);
        });
        scaleRow.appendChild(scaleInput);
        dimensionsGroup.appendChild(scaleRow);
        
        // Add dimensions group to container
        container.appendChild(dimensionsGroup);
        
        // Create appearance group
        const appearanceGroup = document.createElement('div');
        appearanceGroup.className = 'property-group';
        
        const appearanceTitle = document.createElement('div');
        appearanceTitle.className = 'group-title';
        appearanceTitle.textContent = 'Appearance';
        appearanceGroup.appendChild(appearanceTitle);
        
        // Color options
        const colorOptionsRow = document.createElement('div');
        colorOptionsRow.className = 'property-row';
        
        const colorLabel = document.createElement('label');
        colorLabel.textContent = 'Furniture Color';
        colorOptionsRow.appendChild(colorLabel);
        
        const colorOptions = document.createElement('div');
        colorOptions.className = 'color-options';
        
        // Add color swatches for furniture
        let colors;
        if (furnitureType === 'sofa' || furnitureType === 'chair') {
            colors = ['#6082B6', '#4682B4', '#5F9EA0', '#556B2F', '#8B4513'];
        } else {
            colors = ['#8B4513', '#A0522D', '#D2691E', '#DEB887', '#F5DEB3'];
        }
        
        colors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            colorOption.addEventListener('click', () => {
                this.changeObjectColor(furniture, color);
                
                // Update active state of color options
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                colorOption.classList.add('active');
            });
            colorOptions.appendChild(colorOption);
        });
        
        colorOptionsRow.appendChild(colorOptions);
        appearanceGroup.appendChild(colorOptionsRow);
        
        // Add appearance group to container
        container.appendChild(appearanceGroup);
        
        // Create actions group
        const actionsGroup = document.createElement('div');
        actionsGroup.className = 'property-group';
        
        const actionsTitle = document.createElement('div');
        actionsTitle.className = 'group-title';
        actionsTitle.textContent = 'Actions';
        actionsGroup.appendChild(actionsTitle);
        
        // Action buttons
        const actionsRow = document.createElement('div');
        actionsRow.className = 'property-actions';
        
        const rotateBtn = document.createElement('button');
        rotateBtn.className = 'property-btn';
        rotateBtn.textContent = 'Rotate';
        rotateBtn.addEventListener('click', () => {
            this.rotateObject(furniture);
        });
        actionsRow.appendChild(rotateBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'property-btn danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            this.deleteObject(furniture);
            this.propertiesPanel.style.display = 'none';
        });
        actionsRow.appendChild(deleteBtn);
        
        actionsGroup.appendChild(actionsRow);
        
        // Add actions group to container
        container.appendChild(actionsGroup);
    }
    
    updateWallLength(wall, newLength) {
        // Get wall entity's box element
        const box = wall.querySelector('a-box');
        if (!box) return;
        
        // Update box width (which corresponds to wall length)
        box.setAttribute('width', newLength);
        
        // Update wall's data attribute
        wall.setAttribute('data-length', newLength);
        
        // Show notification
        this.showNotification('Wall length updated', 'success');
    }
    
    changeObjectColor(object, color) {
        if (object.hasAttribute('material')) {
            // Update object's material color
            object.setAttribute('material', 'color', color);
        } else {
            // For composite objects, update all child meshes
            const meshes = object.querySelectorAll('[material]');
            
            // If it's a door or window, only color specific parts
            if (object.classList.contains('door')) {
                const doorPanel = object.querySelector('.door-panel');
                if (doorPanel) {
                    doorPanel.setAttribute('material', 'color', color);
                }
            } else if (object.classList.contains('window')) {
                const windowFrame = object.querySelector('.window-frame');
                if (windowFrame) {
                    windowFrame.setAttribute('material', 'color', color);
                }
            } else {
                // Otherwise color all meshes
                meshes.forEach(mesh => {
                    mesh.setAttribute('material', 'color', color);
                });
            }
        }
        
        this.showNotification('Color updated', 'success');
    }
    
    changeWindowOpacity(windowObj, opacity) {
        const glass = windowObj.querySelector('.window-glass');
        if (glass) {
            glass.setAttribute('material', 'opacity', opacity);
        }
    }
    
    scaleFurniture(furniture, scale) {
        furniture.setAttribute('scale', `${scale} ${scale} ${scale}`);
    }
    
    filterCatalogItems(tabType) {
        // Simple implementation that could be expanded later
        // For now, we're just showing a notification
    }
    
    saveDesign() {
        // Create a representation of the current design
        const design = {
            walls: this.wallSegments.map(wall => ({
                start: wall.start,
                end: wall.end,
                length: wall.length,
                angle: wall.angle
            })),
            doors: Array.from(document.querySelectorAll('.door')).map(door => {
                return {
                    position: door.getAttribute('position'),
                    rotation: door.getAttribute('rotation'),
                    type: door.getAttribute('data-door-type') || 'standard'
                };
            }),
            windows: Array.from(document.querySelectorAll('.window')).map(window => {
                return {
                    position: window.getAttribute('position'),
                    rotation: window.getAttribute('rotation'),
                    type: window.getAttribute('data-window-type') || 'standard'
                };
            }),
            furniture: Array.from(document.querySelectorAll('.furniture')).map(furniture => {
                return {
                    type: furniture.getAttribute('data-furniture-type'),
                    position: furniture.getAttribute('position'),
                    rotation: furniture.getAttribute('rotation'),
                    scale: furniture.getAttribute('scale') || { x: 1, y: 1, z: 1 }
                };
            })
        };
        
        // Convert to JSON string
        const designJSON = JSON.stringify(design);
        
        // Save to local storage
        localStorage.setItem('houseDesign', designJSON);
        
        // In a real app, you could also offer to save to a file
        // or to a server (which would require backend implementation)
        
        this.showNotification('Design saved successfully!', 'success');
    }
    
    loadDesign() {
        // Load from local storage
        const designJSON = localStorage.getItem('houseDesign');
        
        if (!designJSON) {
            this.showNotification('No saved design found', 'error');
            return;
        }
        
        try {
            // Parse the design data
            const design = JSON.parse(designJSON);
            
            // Clear current design
            this.clearDesign();
            
            // Load walls
            if (design.walls && design.walls.length > 0) {
                design.walls.forEach(wall => {
                    // Convert saved coordinates to Vector3
                    const start = { x: wall.start.x, y: 0, z: wall.start.z };
                    const end = { x: wall.end.x, y: 0, z: wall.end.z };
                    this.createWall(start, end);
                });
            }
            
            // Load doors
            if (design.doors && design.doors.length > 0) {
                design.doors.forEach(door => {
                    // Create door entity directly
                    const doorEntity = document.createElement('a-entity');
                    doorEntity.classList.add('interactive', 'door');
                    doorEntity.setAttribute('data-type', 'door');
                    doorEntity.setAttribute('data-door-type', door.type || 'standard');
                    
                    // Get the template content
                    const template = document.getElementById('door-template');
                    const templateHTML = template.innerHTML;
                    
                    // Parse the template HTML and create elements from it
                    const tempContainer = document.createElement('div');
                    tempContainer.innerHTML = templateHTML;
                    
                    // Extract the content from the template
                    const templateParts = tempContainer.querySelectorAll('*');
                    templateParts.forEach(part => {
                        const el = document.createElement(part.tagName);
                        
                        // Copy all attributes
                        Array.from(part.attributes).forEach(attr => {
                            el.setAttribute(attr.name, attr.value);
                        });
                        
                        doorEntity.appendChild(el);
                    });
                    
                    // Set position and rotation
                    doorEntity.setAttribute('position', door.position);
                    doorEntity.setAttribute('rotation', door.rotation);
                    
                    // Add to house container
                    this.houseContainer.appendChild(doorEntity);
                });
            }
            
            // Load windows (similar to doors)
            if (design.windows && design.windows.length > 0) {
                design.windows.forEach(window => {
                    // Create window entity directly
                    const windowEntity = document.createElement('a-entity');
                    windowEntity.classList.add('interactive', 'window');
                    windowEntity.setAttribute('data-type', 'window');
                    windowEntity.setAttribute('data-window-type', window.type || 'standard');
                    
                    // Get the template content
                    const template = document.getElementById('window-template');
                    const templateHTML = template.innerHTML;
                    
                    // Parse the template HTML and create elements from it
                    const tempContainer = document.createElement('div');
                    tempContainer.innerHTML = templateHTML;
                    
                    // Extract the content from the template
                    const templateParts = tempContainer.querySelectorAll('*');
                    templateParts.forEach(part => {
                        const el = document.createElement(part.tagName);
                        
                        // Copy all attributes
                        Array.from(part.attributes).forEach(attr => {
                            el.setAttribute(attr.name, attr.value);
                        });
                        
                        windowEntity.appendChild(el);
                    });
                    
                    // Set position and rotation
                    windowEntity.setAttribute('position', window.position);
                    windowEntity.setAttribute('rotation', window.rotation);
                    
                    // Add to house container
                    this.houseContainer.appendChild(windowEntity);
                });
            }
            
            // Load furniture
            if (design.furniture && design.furniture.length > 0) {
                design.furniture.forEach(item => {
                    // Create furniture entity
                    const furnitureEntity = document.createElement('a-entity');
                    furnitureEntity.classList.add('interactive', 'furniture', item.type);
                    furnitureEntity.setAttribute('data-type', 'furniture');
                    furnitureEntity.setAttribute('data-furniture-type', item.type);
                    
                    // Get the template content
                    const template = document.getElementById(`${item.type}-template`);
                    if (!template) {
                        console.warn(`No template found for furniture type: ${item.type}`);
                        return;
                    }
                    
                    const templateHTML = template.innerHTML;
                    
                    // Parse the template HTML and create elements from it
                    const tempContainer = document.createElement('div');
                    tempContainer.innerHTML = templateHTML;
                    
                    // Extract the content from the template
                    const templateParts = tempContainer.querySelectorAll('*');
                    templateParts.forEach(part => {
                        const el = document.createElement(part.tagName);
                        
                        // Copy all attributes
                        Array.from(part.attributes).forEach(attr => {
                            el.setAttribute(attr.name, attr.value);
                        });
                        
                        furnitureEntity.appendChild(el);
                    });
                    
                    // Set position, rotation, and scale
                    furnitureEntity.setAttribute('position', item.position);
                    furnitureEntity.setAttribute('rotation', item.rotation);
                    if (item.scale) {
                        furnitureEntity.setAttribute('scale', item.scale);
                    }
                    
                    // Add to house container
                    this.houseContainer.appendChild(furnitureEntity);
                });
            }
            
            this.showNotification('Design loaded successfully!', 'success');
        } catch (e) {
            console.error('Error loading design:', e);
            this.showNotification('Error loading design', 'error');
        }
    }
    
    clearDesign() {
        // Remove all walls, doors, windows, and furniture
        this.houseContainer.innerHTML = '';
        
        // Clear wall segments array
        this.wallSegments = [];
        this.roomSegments = [];
        
        // Reset any other state
        if (this.selectedObject) {
            this.selectedObject = null;
            this.hideObjectActions();
        }
    }
    
    exportDesign() {
        // In a real app, this would generate a shareable file or link
        // For this demo, we'll just show a notification
        this.showNotification('Export feature would generate a file here', 'success');
        
        // Alternatively, you could offer to export:
        // 1. As a 3D model (e.g., .gltf, .obj)
        // 2. As a 2D floor plan image
        // 3. As measurements/dimensions for construction
    }
    
    showHelp() {
        // In a real app, this would show a help modal or guide
        this.showNotification('Help feature would show usage instructions here', 'success');
    }
    
    // UI helper methods
    
    showGuidance(text) {
        this.guidance.textContent = text;
        this.guidance.style.display = 'block';
    }
    
    showNotification(message, type = '') {
        const notification = this.notification;
        notification.textContent = message;
        notification.className = ''; // Clear previous classes
        
        // Add notification class
        notification.classList.add('show');
        
        // Add type class if specified
        if (type) {
            notification.classList.add(type);
        }
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}