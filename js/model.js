/**
 * Models manager for the floor plan designer
 * Handles loading and management of 3D models for furniture and elements
 */
class ModelsManager {
    constructor() {
        this.modelRegistry = {
            // Basic furniture
            'sofa': {
                type: 'composite',
                components: [
                    { primitive: 'box', width: 2, height: 0.5, depth: 0.8, color: '#6082B6', position: { x: 0, y: 0.25, z: 0 } },
                    { primitive: 'box', width: 2, height: 0.7, depth: 0.2, color: '#6082B6', position: { x: 0, y: 0.85, z: -0.3 } },
                    { primitive: 'box', width: 0.2, height: 0.7, depth: 0.8, color: '#6082B6', position: { x: 0.9, y: 0.6, z: 0 } },
                    { primitive: 'box', width: 0.2, height: 0.7, depth: 0.8, color: '#6082B6', position: { x: -0.9, y: 0.6, z: 0 } }
                ],
                boundingBox: { width: 2, height: 1, depth: 0.8 },
                placementRules: {
                    validSurfaces: ['floor'],
                    placeOnWalls: false,
                    rotationStep: 90,
                    elevationOffset: 0
                }
            },
            'chair': {
                type: 'composite',
                components: [
                    { primitive: 'box', width: 0.5, height: 0.05, depth: 0.5, color: '#8B4513', position: { x: 0, y: 0.4, z: 0 } },
                    { primitive: 'box', width: 0.5, height: 0.5, depth: 0.05, color: '#8B4513', position: { x: 0, y: 0.65, z: -0.25 } },
                    { primitive: 'box', width: 0.05, height: 0.4, depth: 0.05, color: '#8B4513', position: { x: 0.2, y: 0.2, z: 0.2 } },
                    { primitive: 'box', width: 0.05, height: 0.4, depth: 0.05, color: '#8B4513', position: { x: 0.2, y: 0.2, z: -0.2 } },
                    { primitive: 'box', width: 0.05, height: 0.4, depth: 0.05, color: '#8B4513', position: { x: -0.2, y: 0.2, z: 0.2 } },
                    { primitive: 'box', width: 0.05, height: 0.4, depth: 0.05, color: '#8B4513', position: { x: -0.2, y: 0.2, z: -0.2 } }
                ],
                boundingBox: { width: 0.5, height: 0.9, depth: 0.5 },
                placementRules: {
                    validSurfaces: ['floor'],
                    placeOnWalls: false,
                    rotationStep: 45,
                    elevationOffset: 0
                }
            },
            'table': {
                type: 'composite',
                components: [
                    { primitive: 'box', width: 1.2, height: 0.05, depth: 0.8, color: '#8B4513', position: { x: 0, y: 0.7, z: 0 } },
                    { primitive: 'box', width: 0.05, height: 0.7, depth: 0.05, color: '#8B4513', position: { x: 0.55, y: 0.35, z: 0.35 } },
                    { primitive: 'box', width: 0.05, height: 0.7, depth: 0.05, color: '#8B4513', position: { x: 0.55, y: 0.35, z: -0.35 } },
                    { primitive: 'box', width: 0.05, height: 0.7, depth: 0.05, color: '#8B4513', position: { x: -0.55, y: 0.35, z: 0.35 } },
                    { primitive: 'box', width: 0.05, height: 0.7, depth: 0.05, color: '#8B4513', position: { x: -0.55, y: 0.35, z: -0.35 } }
                ],
                boundingBox: { width: 1.2, height: 0.7, depth: 0.8 },
                placementRules: {
                    validSurfaces: ['floor'],
                    placeOnWalls: false,
                    rotationStep: 90,
                    elevationOffset: 0
                }
            },
            'bed': {
                type: 'composite',
                components: [
                    { primitive: 'box', width: 1.6, height: 0.3, depth: 2, color: '#8B4513', position: { x: 0, y: 0.15, z: 0 } },
                    { primitive: 'box', width: 1.6, height: 0.1, depth: 2, color: '#F5F5DC', position: { x: 0, y: 0.35, z: 0 } },
                    { primitive: 'box', width: 1.6, height: 0.6, depth: 0.1, color: '#8B4513', position: { x: 0, y: 0.65, z: -0.95 } }
                ],
                boundingBox: { width: 1.6, height: 0.45, depth: 2 },
                placementRules: {
                    validSurfaces: ['floor'],
                    placeOnWalls: false,
                    rotationStep: 90,
                    elevationOffset: 0
                }
            },
            'tv': {
                type: 'composite',
                components: [
                    { primitive: 'box', width: 1.2, height: 0.7, depth: 0.1, color: '#333333', position: { x: 0, y: 1.2, z: 0 } },
                    { primitive: 'box', width: 0.6, height: 0.1, depth: 0.4, color: '#555555', position: { x: 0, y: 0.05, z: 0 } },
                    { primitive: 'box', width: 0.1, height: 0.7, depth: 0.1, color: '#555555', position: { x: 0, y: 0.4, z: 0 } }
                ],
                boundingBox: { width: 1.2, height: 1.9, depth: 0.4 },
                placementRules: {
                    validSurfaces: ['floor', 'table'],
                    placeOnWalls: true,
                    rotationStep: 90,
                    elevationOffset: 0
                }
            },
            'counter': {
                type: 'composite',
                components: [
                    { primitive: 'box', width: 1.5, height: 0.05, depth: 0.6, color: '#D3D3D3', position: { x: 0, y: 0.9, z: 0 } },
                    { primitive: 'box', width: 1.5, height: 0.9, depth: 0.6, color: '#A9A9A9', position: { x: 0, y: 0.45, z: 0 } }
                ],
                boundingBox: { width: 1.5, height: 0.9, depth: 0.6 },
                placementRules: {
                    validSurfaces: ['floor'],
                    placeOnWalls: true,
                    rotationStep: 90,
                    elevationOffset: 0
                }
            },
            'fridge': {
                type: 'composite',
                components: [
                    { primitive: 'box', width: 0.8, height: 1.8, depth: 0.8, color: '#E0E0E0', position: { x: 0, y: 0.9, z: 0 } },
                    { primitive: 'box', width: 0.7, height: 0.8, depth: 0.1, color: '#D0D0D0', position: { x: 0, y: 1.3, z: -0.35 } },
                    { primitive: 'box', width: 0.7, height: 0.8, depth: 0.1, color: '#D0D0D0', position: { x: 0, y: 0.5, z: -0.35 } }
                ],
                boundingBox: { width: 0.8, height: 1.8, depth: 0.8 },
                placementRules: {
                    validSurfaces: ['floor'],
                    placeOnWalls: false,
                    rotationStep: 90,
                    elevationOffset: 0
                }
            },
            'wardrobe': {
                type: 'composite',
                components: [
                    { primitive: 'box', width: 1.2, height: 2, depth: 0.6, color: '#8B4513', position: { x: 0, y: 1, z: 0 } },
                    { primitive: 'box', width: 0.4, height: 1.8, depth: 0.05, color: '#A0522D', position: { x: -0.35, y: 1, z: -0.28 } },
                    { primitive: 'box', width: 0.4, height: 1.8, depth: 0.05, color: '#A0522D', position: { x: 0.35, y: 1, z: -0.28 } },
                    { primitive: 'sphere', radius: 0.03, color: '#FFD700', position: { x: -0.35, y: 1, z: -0.3 } },
                    { primitive: 'sphere', radius: 0.03, color: '#FFD700', position: { x: 0.35, y: 1, z: -0.3 } }
                ],
                boundingBox: { width: 1.2, height: 2, depth: 0.6 },
                placementRules: {
                    validSurfaces: ['floor'],
                    placeOnWalls: true,
                    rotationStep: 90,
                    elevationOffset: 0
                }
            },
            // Structural elements
            'wall': {
                type: 'primitive',
                primitive: 'box',
                defaultDimensions: { width: 1, height: 2.7, depth: 0.15 },
                defaultColor: '#F5F5F5',
                boundingBox: { width: 1, height: 2.7, depth: 0.15 },
                placementRules: {
                    validSurfaces: ['floor'],
                    placeOnWalls: false,
                    rotationStep: 1,
                    elevationOffset: 1.35  // Half of height
                }
            },
            'door': {
                type: 'composite',
                components: [
                    { primitive: 'box', width: 1, height: 2.2, depth: 0.2, color: '#A0522D', position: { x: 0, y: 1.1, z: 0 }, class: 'door-frame' },
                    { primitive: 'box', width: 0.9, height: 2.1, depth: 0.05, color: '#CD853F', position: { x: 0, y: 1.05, z: 0.06 }, class: 'door-panel' },
                    { primitive: 'sphere', radius: 0.03, color: '#FFD700', position: { x: 0.35, y: 1.05, z: 0.1 }, class: 'door-knob' }
                ],
                boundingBox: { width: 1, height: 2.2, depth: 0.2 },
                placementRules: {
                    validSurfaces: ['wall'],
                    placeOnWalls: true,
                    rotationStep: 90,
                    elevationOffset: 1.1  // Half of height
                }
            },
            'window': {
                type: 'composite',
                components: [
                    { primitive: 'box', width: 1.2, height: 1.2, depth: 0.2, color: '#A0522D', position: { x: 0, y: 1.5, z: 0 }, class: 'window-frame' },
                    { primitive: 'box', width: 1, height: 1, depth: 0.05, color: '#87CEEB', position: { x: 0, y: 1.5, z: 0 }, class: 'window-glass', opacity: 0.7 }
                ],
                boundingBox: { width: 1.2, height: 1.2, depth: 0.2 },
                placementRules: {
                    validSurfaces: ['wall'],
                    placeOnWalls: true,
                    rotationStep: 90,
                    elevationOffset: 1.5  // Half of height
                }
            }
        };
        
        // Material presets
        this.materialPresets = {
            wallMaterials: [
                { name: 'White Paint', color: '#F5F5F5', texture: null },
                { name: 'Light Gray', color: '#D3D3D3', texture: null },
                { name: 'Dark Gray', color: '#A9A9A9', texture: null },
                { name: 'Lavender', color: '#E6E6FA', texture: null },
                { name: 'Blush', color: '#FFE4E1', texture: null }
            ],
            floorMaterials: [
                { name: 'Hardwood', color: '#8B4513', texture: 'texture-hardwood.jpg' },
                { name: 'Tile', color: '#F5F5F5', texture: 'texture-tile.jpg' },
                { name: 'Carpet', color: '#A0A0A0', texture: 'texture-carpet.jpg' },
                { name: 'Marble', color: '#F0F0F0', texture: 'texture-marble.jpg' },
                { name: 'Concrete', color: '#C0C0C0', texture: 'texture-concrete.jpg' }
            ],
            woodMaterials: [
                { name: 'Dark Oak', color: '#8B4513', texture: null },
                { name: 'Maple', color: '#CD853F', texture: null },
                { name: 'Cherry', color: '#A0522D', texture: null },
                { name: 'Walnut', color: '#5C4033', texture: null },
                { name: 'Pine', color: '#DEB887', texture: null }
            ]
        };
    }

    /**
     * Create a model entity based on a registered model type
     * @param {string} modelType - The type of model to create
     * @param {object} position - The position to place the model
     * @param {object} options - Additional options like rotation, scale, etc.
     * @returns {Element} The created entity element
     */
    createModel(modelType, position, options = {}) {
        // Check if model type exists
        if (!this.modelRegistry[modelType]) {
            console.error(`Model type '${modelType}' not found in registry`);
            return null;
        }
        
        const model = this.modelRegistry[modelType];
        const entity = document.createElement('a-entity');
        
        // Add model identification classes and attributes
        entity.classList.add('interactive', modelType);
        entity.setAttribute('data-type', modelType);
        
        // Set position, rotation and scale
        const rotation = options.rotation || { x: 0, y: 0, z: 0 };
        const scale = options.scale || { x: 1, y: 1, z: 1 };
        
        entity.setAttribute('position', position);
        entity.setAttribute('rotation', rotation);
        entity.setAttribute('scale', scale);
        
        // Create model based on its type
        if (model.type === 'primitive') {
            // Single primitive shape
            const dimensions = options.dimensions || model.defaultDimensions;
            const color = options.color || model.defaultColor;
            
            const primitive = document.createElement(`a-${model.primitive}`);
            
            // Set dimensions based on primitive type
            if (model.primitive === 'box') {
                primitive.setAttribute('width', dimensions.width);
                primitive.setAttribute('height', dimensions.height);
                primitive.setAttribute('depth', dimensions.depth);
            } else if (model.primitive === 'cylinder') {
                primitive.setAttribute('radius', dimensions.radius);
                primitive.setAttribute('height', dimensions.height);
            } else if (model.primitive === 'sphere') {
                primitive.setAttribute('radius', dimensions.radius);
            }
            
            primitive.setAttribute('color', color);
            primitive.classList.add('collidable');
            
            entity.appendChild(primitive);
        } else if (model.type === 'composite') {
            // Composite model made of multiple primitives
            const color = options.color; // Optional override color
            
            model.components.forEach(component => {
                const componentEl = document.createElement(`a-${component.primitive}`);
                
                // Set dimensions based on primitive type
                if (component.primitive === 'box') {
                    componentEl.setAttribute('width', component.width);
                    componentEl.setAttribute('height', component.height);
                    componentEl.setAttribute('depth', component.depth);
                } else if (component.primitive === 'cylinder') {
                    componentEl.setAttribute('radius', component.radius);
                    componentEl.setAttribute('height', component.height);
                } else if (component.primitive === 'sphere') {
                    componentEl.setAttribute('radius', component.radius);
                }
                
                // Set position relative to entity center
                componentEl.setAttribute('position', component.position);
                
                // Set color (use override if specified)
                componentEl.setAttribute('color', color || component.color);
                
                // Set opacity if specified
                if (component.opacity) {
                    componentEl.setAttribute('opacity', component.opacity);
                }
                
                // Add class if specified
                if (component.class) {
                    componentEl.classList.add(component.class);
                }
                
                componentEl.classList.add('collidable');
                
                entity.appendChild(componentEl);
            });
        } else if (model.type === 'gltf') {
            // Advanced 3D models (future implementation)
            entity.setAttribute('gltf-model', model.src);
        }
        
        // Add collision detection data
        entity.setAttribute('data-bounding-box', JSON.stringify(model.boundingBox));
        entity.setAttribute('data-placement-rules', JSON.stringify(model.placementRules));
        
        return entity;
    }

    /**
     * Check if a model can be placed at a specific position
     * @param {string} modelType - The type of model to place
     * @param {object} position - The position to check
     * @param {object} rotation - The rotation of the model
     * @returns {boolean} True if placement is valid
     */
    canPlaceModel(modelType, position, rotation = { x: 0, y: 0, z: 0 }) {
        if (!this.modelRegistry[modelType]) return false;
        
        const model = this.modelRegistry[modelType];
        const placementRules = model.placementRules;
        const boundingBox = model.boundingBox;
        
        // Check if there are existing objects at this position
        return !this.checkCollision(modelType, position, rotation, boundingBox);
    }

    /**
     * Check for collisions with existing objects
     * @param {string} modelType - The type of model to check
     * @param {object} position - The position to check
     * @param {object} rotation - The rotation of the model
     * @param {object} boundingBox - The model's bounding box
     * @returns {boolean} True if collision detected
     */
    checkCollision(modelType, position, rotation, boundingBox) {
        // Simple placeholder for collision detection
        // In a real implementation, you would use proper physics/collision detection
        const existingObjects = document.querySelectorAll('.interactive');
        
        // Simple distance-based collision check
        for (let obj of existingObjects) {
            const objType = obj.getAttribute('data-type');
            const objPos = obj.getAttribute('position');
            const objBoundingBoxStr = obj.getAttribute('data-bounding-box');
            
            if (!objBoundingBoxStr) continue;
            
            const objBoundingBox = JSON.parse(objBoundingBoxStr);
            
            // If this is a wall placement, allow intersecting with other walls for corners
            if (modelType === 'wall' && objType === 'wall') continue;
            
            // For doors and windows, check if they're being placed on walls
            if ((modelType === 'door' || modelType === 'window') && objType === 'wall') {
                // Allow placement on walls
                continue;
            }
            
            // Simple distance check based on combined dimensions
            const combinedWidth = (boundingBox.width + objBoundingBox.width) / 2;
            const combinedDepth = (boundingBox.depth + objBoundingBox.depth) / 2;
            
            const distanceX = Math.abs(position.x - objPos.x);
            const distanceZ = Math.abs(position.z - objPos.z);
            
            if (distanceX < combinedWidth * 0.8 && distanceZ < combinedDepth * 0.8) {
                return true; // Collision detected
            }
        }
        
        return false; // No collision
    }

    /**
     * Get material options for a specific category
     * @param {string} category - Material category ('wall', 'floor', 'wood')
     * @returns {Array} Array of material options
     */
    getMaterialOptions(category) {
        switch (category) {
            case 'wall':
                return this.materialPresets.wallMaterials;
            case 'floor':
                return this.materialPresets.floorMaterials;
            case 'wood':
                return this.materialPresets.woodMaterials;
            default:
                return this.materialPresets.wallMaterials;
        }
    }
}