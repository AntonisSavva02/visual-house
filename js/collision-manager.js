/**
 * EasyFloor - Collision Manager
 * Handles collision detection between objects
 */

const CollisionManager = {
    // Placement rules for different object types
    placementRules: {
        // Default rules
        default: {
            // Objects that this object can be placed on
            canPlaceOn: ['floor', 'ground'],
            // Minimum distance from other objects (in grid units)
            minDistance: 0,
            // Objects that this object cannot overlap with
            cannotOverlap: ['*'], // * means all objects
            // Special placement requirements
            requirements: []
        },
        
        // Walls can be placed on floors or ground
        wall: {
            canPlaceOn: ['floor', 'ground'],
            minDistance: 0,
            cannotOverlap: ['*'],
            requirements: []
        },
        
        // Floors can be placed on the ground or other floors (for multi-level buildings)
        floor: {
            canPlaceOn: ['ground', 'floor'],
            minDistance: 0,
            cannotOverlap: ['*'],
            // Can overlap with walls
            canOverlap: ['wall']
        },
        
        // Windows must be placed on walls
        window: {
            canPlaceOn: ['wall'],
            minDistance: 0.5, // Half a grid unit away from other windows or doors
            cannotOverlap: ['*'],
            requirements: [
                { type: 'mustBeOn', objectType: 'wall' }
            ]
        },
        
        // Doors must be placed on walls
        door: {
            canPlaceOn: ['wall'],
            minDistance: 0.5, // Half a grid unit away from other windows or doors
            cannotOverlap: ['*'],
            requirements: [
                { type: 'mustBeOn', objectType: 'wall' }
            ]
        },
        
        // Furniture placement rules
        sofa: {
            canPlaceOn: ['floor'],
            minDistance: 0.5,
            cannotOverlap: ['*'],
            requirements: [
                { type: 'mustBeOn', objectType: 'floor' }
            ]
        },
        
        'coffee-table': {
            canPlaceOn: ['floor'],
            minDistance: 0.5,
            cannotOverlap: ['*'],
            requirements: [
                { type: 'mustBeOn', objectType: 'floor' }
            ]
        },
        
        bed: {
            canPlaceOn: ['floor'],
            minDistance: 0.5,
            cannotOverlap: ['*'],
            requirements: [
                { type: 'mustBeOn', objectType: 'floor' }
            ]
        },
        
        wardrobe: {
            canPlaceOn: ['floor'],
            minDistance: 0,
            cannotOverlap: ['*'],
            requirements: [
                { type: 'mustBeOn', objectType: 'floor' },
                { type: 'mustBeNextTo', objectType: 'wall' }
            ]
        },
        
        counter: {
            canPlaceOn: ['floor'],
            minDistance: 0,
            cannotOverlap: ['*'],
            requirements: [
                { type: 'mustBeOn', objectType: 'floor' }
            ]
        },
        
        // Bathroom fixtures
        toilet: {
            canPlaceOn: ['floor'],
            minDistance: 0,
            cannotOverlap: ['*'],
            requirements: [
                { type: 'mustBeOn', objectType: 'floor' },
                { type: 'mustBeNextTo', objectType: 'wall' }
            ]
        },
        
        bathtub: {
            canPlaceOn: ['floor'],
            minDistance: 0,
            cannotOverlap: ['*'],
            requirements: [
                { type: 'mustBeOn', objectType: 'floor' },
                { type: 'mustBeNextTo', objectType: 'wall' }
            ]
        },
        
        sink: {
            canPlaceOn: ['floor'],
            minDistance: 0,
            cannotOverlap: ['*'],
            requirements: [
                { type: 'mustBeOn', objectType: 'floor' }
            ]
        }
    },
    
    init() {
        // Initialize collision manager
        // This could load custom rules or prepare data structures
    },
    
    checkPlacement(boundingBox, objectType, excludeElement, objects) {
        // Get placement rules for this object type
        const rules = this.placementRules[objectType] || this.placementRules.default;
        
        // Check for collisions with existing objects
        for (const obj of objects) {
            // Skip the object we're currently moving (if provided)
            if (obj.element === excludeElement) continue;
            
            // Get the object's bounding box
            const objBox = this.getObjectBoundingBox(obj);
            
            // Check if the boxes overlap
            if (this.checkBoxOverlap(boundingBox, objBox)) {
                // Check if this overlap is allowed
                if (rules.canOverlap && rules.canOverlap.includes(obj.type)) {
                    // This overlap is explicitly allowed
                    continue;
                }
                
                // If cannotOverlap includes '*' or the specific object type, overlap is not allowed
                if (rules.cannotOverlap.includes('*') || rules.cannotOverlap.includes(obj.type)) {
                    return false; // Collision detected, placement is invalid
                }
            }
        }
        
        // Check for special placement requirements
        if (rules.requirements && rules.requirements.length > 0) {
            for (const req of rules.requirements) {
                // Skip requirement checks during initial placement preview
                if (excludeElement === null && req.type === 'mustBeOn') {
                    continue;
                }
                
                if (req.type === 'mustBeOn') {
                    // Object must be placed on a specific type of object
                    let foundSupportObject = false;
                    
                    // If the required support is 'ground', it's always valid
                    if (req.objectType === 'ground') {
                        foundSupportObject = true;
                    } else {
                        // Check if there's an object of the required type below this one
                        for (const obj of objects) {
                            if (obj.element === excludeElement) continue;
                            
                            if (obj.type === req.objectType) {
                                const objBox = this.getObjectBoundingBox(obj);
                                
                                // Check if this object is directly below the placement point
                                if (this.isObjectBelow(boundingBox, objBox)) {
                                    foundSupportObject = true;
                                    break;
                                }
                            }
                        }
                    }
                    
                    if (!foundSupportObject) {
                        return false; // Required support object not found
                    }
                }
                else if (req.type === 'mustBeNextTo') {
                    // Object must be placed next to a specific type of object
                    let foundAdjacentObject = false;
                    
                    for (const obj of objects) {
                        if (obj.element === excludeElement) continue;
                        
                        if (obj.type === req.objectType) {
                            const objBox = this.getObjectBoundingBox(obj);
                            
                            // Check if this object is adjacent to the placement point
                            if (this.areObjectsAdjacent(boundingBox, objBox)) {
                                foundAdjacentObject = true;
                                break;
                            }
                        }
                    }
                    
                    if (!foundAdjacentObject) {
                        return false; // Required adjacent object not found
                    }
                }
            }
        }
        
        // All checks passed, placement is valid
        return true;
    },
    
    getObjectBoundingBox(obj) {
        const position = obj.position;
        const rotation = obj.rotation;
        const type = obj.type;
        
        // Get object dimensions from model data
        const objectData = MODELS[type];
        const boundingBox = objectData.boundingBox || { width: 1, height: 1, depth: 1 };
        
        // Create the bounding box
        const halfWidth = boundingBox.width / 2 * (obj.scale ? obj.scale.x : 1);
        const halfHeight = boundingBox.height / 2 * (obj.scale ? obj.scale.y : 1);
        const halfDepth = boundingBox.depth / 2 * (obj.scale ? obj.scale.z : 1);
        
        // For simplicity, we're not calculating rotation-aware bounding boxes
        // This can be improved for more accurate collision detection
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
    
    checkBoxOverlap(boxA, boxB) {
        // Check if two axis-aligned bounding boxes overlap
        return (
            boxA.min.x <= boxB.max.x &&
            boxA.max.x >= boxB.min.x &&
            boxA.min.y <= boxB.max.y &&
            boxA.max.y >= boxB.min.y &&
            boxA.min.z <= boxB.max.z &&
            boxA.max.z >= boxB.min.z
        );
    },
    
    isObjectBelow(upper, lower) {
        // Check if lower object is directly below upper object
        const isBelow = (
            upper.min.x <= lower.max.x &&
            upper.max.x >= lower.min.x &&
            upper.min.z <= lower.max.z &&
            upper.max.z >= lower.min.z &&
            Math.abs(upper.min.y - lower.max.y) < 0.1 // Small threshold for "directly above"
        );
        
        return isBelow;
    },
    
    areObjectsAdjacent(boxA, boxB) {
        // Objects are adjacent if they're horizontally adjacent (side-by-side)
        const maxDistance = 0.5; // Maximum distance to be considered adjacent
        
        // Check if objects are at the same height level
        const sameHeight = (
            Math.max(boxA.min.y, boxB.min.y) <= Math.min(boxA.max.y, boxB.max.y)
        );
        
        if (!sameHeight) return false;
        
        // Check if objects are horizontally adjacent
        const adjacentX = (
            (Math.abs(boxA.max.x - boxB.min.x) < maxDistance) ||
            (Math.abs(boxA.min.x - boxB.max.x) < maxDistance)
        );
        
        const adjacentZ = (
            (Math.abs(boxA.max.z - boxB.min.z) < maxDistance) ||
            (Math.abs(boxA.min.z - boxB.max.z) < maxDistance)
        );
        
        // For objects to be adjacent, they should be adjacent in X or Z, but not both
        return (adjacentX && !adjacentZ) || (adjacentZ && !adjacentX);
    }
};