/**
 * Visual-House - Collision Manager
 * Handles collision detection between objects
 */

APP.Collision = {
    init: function (app) {
        this.app = app;
    },

    checkPlacement: function (boundingBox, excludeElement) {
        const collidables = document.querySelectorAll('.collidable');

        for (let i = 0; i < collidables.length; i++) {
            const element = collidables[i];

            if (excludeElement && element === excludeElement) continue;

            const position = element.getAttribute('position');
            const rotation = element.getAttribute('rotation');
            const objectType = element.getAttribute('data-object-type');

            if (!position || !objectType || !MODELS[objectType]) continue;

            const objectBoundingBox = this.app.calculateBoundingBox(
                position,
                rotation,
                MODELS[objectType].boundingBox
            );

            if (this.checkIntersection(boundingBox, objectBoundingBox)) {
                return false; // Collision detected
            }
        }

        return true; // No collision
    },

    checkIntersection: function (box1, box2) {
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