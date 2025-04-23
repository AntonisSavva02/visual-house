/**
 * EasyFloor - Collision Manager
 * Handles object collision detection and placement validation
 */

const CollisionManager = {
    // Default placement rules
    placementRules: {
        default: {
            canOverlap: [], // Object types that can overlap with this object
            cannotOverlap: ['*'] // Object types that cannot overlap (wildcard = all)
        }
    },
    
    init() {
        console.log("Collision Manager initialized");
        
        // Set up specific placement rules for different object types
        this.setupPlacementRules();
    },
    
    setupPlacementRules() {
        // Rules for walls
        this.placementRules['blank-wall'] = {
            canOverlap: ['wall-shelf'], // Wall shelves can be placed on walls
            cannotOverlap: ['*'] // Can't overlap with anything else
        };
        
        // Rules for floors
        this.placementRules['concrete-floor'] = {
            canOverlap: [], // Nothing can overlap with floors
            cannotOverlap: ['*']
        };
        
        this.placementRules['wood-floor'] = {
            canOverlap: [], // Nothing can overlap with floors
            cannotOverlap: ['*']
        };
    },
    
    checkPlacement(boundingBox, objectType, excludeElement, objects) {
        console.log(`Checking placement for ${objectType}...`);
        
        // Always return true for this simplified version
        return true;
    },
    
    checkBoxOverlap(box1, box2) {
        // Check if two bounding boxes overlap
        return (
            box1.min.x <= box2.max.x &&
            box1.max.x >= box2.min.x &&
            box1.min.y <= box2.max.y &&
            box1.max.y >= box2.min.y &&
            box1.min.z <= box2.max.z &&
            box1.max.z >= box2.min.z
        );
    },
    
    getObjectBoundingBox(obj) {
        // Get bounding box for an object based on its position, rotation and size
        if (!obj || !obj.type) return null;
        
        const objectData = MODELS[obj.type];
        if (!objectData || !objectData.boundingBox) return null;
        
        const position = obj.position || obj.element.getAttribute('position');
        const boundingBox = objectData.boundingBox;
        
        const halfWidth = boundingBox.width / 2;
        const halfHeight = boundingBox.height / 2;
        const halfDepth = boundingBox.depth / 2;
        
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
    }
};