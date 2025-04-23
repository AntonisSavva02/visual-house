/**
 * Visual-House - Collision Manager
 * Handles collision detection between objects
 */

// Add Collision Manager to APP
APP.Collision = {
    // Initialize collision system
    init: function(app) {
        this.app = app;
    },
    
    // Check if placement is valid (no collisions)
    checkPlacement: function(boundingBox, excludeElement) {
        // Get all collidable objects
        const collidables = document.querySelectorAll('.collidable');
        
        // Check collisions against each object
        for (let i = 0; i < collidables.length; i++) {
            const element = collidables[i];
            
            // Skip the excluded element (if provided)
            if (excludeElement && element === excludeElement) continue;
            
            // Get the object's position, rotation and type
            const position = element.getAttribute('position');
            const rotation = element.getAttribute('rotation');
            const objectType = element.getAttribute('data-object-type');
            
            // Skip if missing required data
            if (!position || !objectType || !MODELS[objectType]) continue;
            
            // Calculate object's bounding box
            const objectBoundingBox = this.app.calculateBoundingBox(
                position,
                rotation,
                MODELS[objectType].boundingBox
            );
            
            // Check if bounding boxes intersect
            if (this.checkIntersection(boundingBox, objectBoundingBox)) {
                return false; // Collision detected
            }
        }
        
        return true; // No collision
    },
    
    // Check if two bounding boxes intersect
    checkIntersection: function(box1, box2) {
        // Check for intersection in all three axes
        return (
            box1.min.x <= box2.max.x &&
            box1.max.x >= box2.min.x &&
            box1.min.y <= box2.max.y &&
            box1.max.y >= box2.min.y &&
            box1.min.z <= box2.max.z &&
            box1.max.z >= box2.min.z
        );
    }
};