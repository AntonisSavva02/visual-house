/**
 * Collision and grid system manager for the EasyFloor house designer
 * Handles object placement, collision detection, and grid snapping
 */
class CollisionManager {
    constructor() {
        // Grid settings
        this.gridSize = 0.5; // Size of grid cells in meters
        this.gridVisible = true;
        this.snapToGrid = true;
        
        // Collision settings
        this.objectRegistry = new Map(); // Track all objects for collision detection
        this.wallSegments = []; // Track wall segments for special collision rules
        this.showPlacementPreview = true;
        
        // DOM elements
        this.groundEntity = null;
        this.gridEntity = null;
        this.placementIndicator = null;
        this.gridOverlay = null;
        
        // Placement state
        this.isValidPlacement = false;
        this.currentPlacementType = null;
        this.placementGhost = null;
        this.placementPosition = null;
        this.placementRotation = 0;
    }

    /**
     * Initialize the collision manager
     */
    init() {
        // Get DOM elements
        this.groundEntity = document.getElementById('ground');
        this.gridEntity = document.getElementById('grid');
        this.placementIndicator = document.getElementById('placement-indicator');
        this.gridOverlay = document.getElementById('grid-overlay');
        
        // Create the grid
        this.createGrid();
        
        console.log('Collision manager initialized');
    }

    /**
     * Create grid visualization
     */
    createGrid() {
        // Clear any existing grid
        while (this.gridEntity.firstChild) {
            this.gridEntity.removeChild(this.gridEntity.firstChild);
        }
        
        const gridSize = 30; // Total grid size in meters
        const interval = this.gridSize; // Grid cell size
        const lineCount = gridSize / interval;
        const startPos = -gridSize / 2;
        const gridColor = '#555555';
        
        // Create lines along x-axis
        for (let i = 0; i <= lineCount; i++) {
            const linePos = startPos + (i * interval);
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
                y: 0.01, // Slightly above ground to prevent z-fighting
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
        for (let i = 0; i <= lineCount; i++) {
            const linePos = startPos + (i * interval);
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
                y: 0.01, // Slightly above ground to prevent z-fighting
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

    /**
     * Register an object for collision detection
     * @param {Element} object - The A-Frame entity to register
     * @param {Object} boundsInfo - Information about the object's bounds
     */
    registerObject(object, boundsInfo) {
        const id = object.id || `obj_${Math.random().toString(36).substr(2, 9)}`;
        if (!object.id) object.id = id;
        
        this.objectRegistry.set(id, {
            el: object,
            bounds: boundsInfo,
            position: object.getAttribute('position'),
            rotation: object.getAttribute('rotation'),
            type: object.getAttribute('data-type') || 'generic'
        });
        
        // Add to wall segments if it's a wall
        if (object.classList.contains('wall')) {
            this.registerWallSegment(object);
        }
    }

    /**
     * Register a wall segment for special collision rules
     * @param {Element} wallEl - The wall element
     */
    registerWallSegment(wallEl) {
        const position = wallEl.getAttribute('position');
        const rotation = wallEl.getAttribute('rotation');
        const length = parseFloat(wallEl.getAttribute('data-length') || 1);
        const thickness = parseFloat(wallEl.getAttribute('data-thickness') || 0.15);
        
        // Calculate wall start and end points based on rotation
        const angleRad = rotation.y * (Math.PI / 180);
        const halfLength = length / 2;
        const dx = Math.sin(angleRad) * halfLength;
        const dz = Math.cos(angleRad) * halfLength;
        
        const start = { x: position.x - dx, z: position.z - dz };
        const end = { x: position.x + dx, z: position.z + dz };
        
        this.wallSegments.push({
            id: wallEl.id,
            start: start,
            end: end,
            length: length,
            thickness: thickness,
            rotation: rotation.y,
            position: position,
            el: wallEl
        });
    }

    /**
     * Unregister an object from collision detection
     * @param {string} objectId - The ID of the object to unregister
     */
    unregisterObject(objectId) {
        this.objectRegistry.delete(objectId);
        
        // Remove from wall segments if it's a wall
        const wallIndex = this.wallSegments.findIndex(wall => wall.id === objectId);
        if (wallIndex !== -1) {
            this.wallSegments.splice(wallIndex, 1);
        }
    }

    /**
     * Snap a position to the nearest grid point
     * @param {Object} position - The position to snap {x, y, z}
     * @returns {Object} The snapped position {x, y, z}
     */
    snapToGridPoint(position) {
        if (!this.snapToGrid) return position;
        
        return {
            x: Math.round(position.x / this.gridSize) * this.gridSize,
            y: position.y,
            z: Math.round(position.z / this.gridSize) * this.gridSize
        };
    }

    /**
     * Start object placement mode
     * @param {string} objectType - Type of object being placed
     * @param {Object} initialPosition - Initial position for placement
     */
    startPlacement(objectType, initialPosition = { x: 0, y: 0, z: 0 }) {
        // Show grid overlay
        this.gridOverlay.classList.add('show');
        
        // Set placement state
        this.currentPlacementType = objectType;
        this.placementRotation = 0;
        
        // Create placement ghost/preview
        this.createPlacementGhost(objectType, initialPosition);
        
        // Show placement controls
        document.getElementById('placement-controls').classList.add('show');
    }

    /**
     * Create a ghost/preview of the object being placed
     * @param {string} objectType - Type of object to preview
     * @param {Object} position - Initial position
     */
    createPlacementGhost(objectType, position) {
        // Clear any existing ghost
        this.clearPlacementGhost();
        
        // Create new ghost based on object type
        this.placementGhost = document.createElement('a-entity');
        this.placementGhost.id = 'placement-ghost';
        
        // Set ghost appearance based on object type
        switch (objectType) {
            case 'wall':
                const wallEntity = document.createElement('a-box');
                wallEntity.setAttribute('width', 2);
                wallEntity.setAttribute('height', 2.7);
                wallEntity.setAttribute('depth', 0.15);
                wallEntity.setAttribute('position', { x: 0, y: 1.35, z: 0 });
                wallEntity.setAttribute('material', {
                    color: '#5B8BFF',
                    opacity: 0.6,
                    transparent: true
                });
                this.placementGhost.appendChild(wallEntity);
                break;
                
            case 'floor':
                const floorEntity = document.createElement('a-plane');
                floorEntity.setAttribute('width', 4);
                floorEntity.setAttribute('height', 4);
                floorEntity.setAttribute('rotation', { x: -90, y: 0, z: 0 });
                floorEntity.setAttribute('material', {
                    color: '#5B8BFF',
                    opacity: 0.6,
                    transparent: true
                });
                floorEntity.setAttribute('position', { x: 0, y: 0.02, z: 0 });
                this.placementGhost.appendChild(floorEntity);
                break;
                
            case 'door':
                const doorEntity = document.createElement('a-entity');
                doorEntity.setAttribute('mixin', 'door-frame-mixin');
                doorEntity.setAttribute('material', {
                    color: '#5B8BFF',
                    opacity: 0.6,
                    transparent: true
                });
                doorEntity.setAttribute('position', { x: 0, y: 1.1, z: 0 });
                this.placementGhost.appendChild(doorEntity);
                break;
                
            case 'window':
                const windowEntity = document.createElement('a-entity');
                windowEntity.setAttribute('mixin', 'window-frame-mixin');
                windowEntity.setAttribute('material', {
                    color: '#5B8BFF',
                    opacity: 0.6,
                    transparent: true
                });
                windowEntity.setAttribute('position', { x: 0, y: 1.5, z: 0 });
                this.placementGhost.appendChild(windowEntity);
                break;
                
            case 'sofa':
            case 'bed':
            case 'table':
            case 'chair':
            case 'counter':
                // Use mixin for furniture types
                const furnitureEntity = document.createElement('a-entity');
                furnitureEntity.setAttribute('mixin', `${objectType}-mixin`);
                furnitureEntity.setAttribute('material', {
                    color: '#5B8BFF',
                    opacity: 0.6,
                    transparent: true
                });
                
                // Adjust y position based on furniture type
                let yPos = 0;
                if (objectType === 'sofa') yPos = 0.4;
                else if (objectType === 'bed') yPos = 0.25;
                else if (objectType === 'table') yPos = 0.35;
                else if (objectType === 'chair') yPos = 0.2;
                else if (objectType === 'counter') yPos = 0.45;
                
                furnitureEntity.setAttribute('position', { x: 0, y: yPos, z: 0 });
                this.placementGhost.appendChild(furnitureEntity);
                break;
                
            default:
                // Generic object (simple box)
                const genericEntity = document.createElement('a-box');
                genericEntity.setAttribute('width', 1);
                genericEntity.setAttribute('height', 1);
                genericEntity.setAttribute('depth', 1);
                genericEntity.setAttribute('position', { x: 0, y: 0.5, z: 0 });
                genericEntity.setAttribute('material', {
                    color: '#5B8BFF',
                    opacity: 0.6,
                    transparent: true
                });
                this.placementGhost.appendChild(genericEntity);
        }
        
        // Set initial position and rotation
        const snappedPosition = this.snapToGridPoint(position);
        this.placementGhost.setAttribute('position', snappedPosition);
        this.placementGhost.setAttribute('rotation', { x: 0, y: this.placementRotation, z: 0 });
        this.placementGhost.setAttribute('visible', true);
        
        // Add to the scene
        this.placementIndicator.appendChild(this.placementGhost);
        this.placementIndicator.setAttribute('visible', true);
        
        // Store the current placement position
        this.placementPosition = snappedPosition;
        
        // Check initial placement validity
        this.updatePlacementValidity();
    }

    /**
     * Clear the placement ghost/preview
     */
    clearPlacementGhost() {
        if (this.placementGhost) {
            this.placementGhost.parentNode.removeChild(this.placementGhost);
            this.placementGhost = null;
        }
        
        this.placementIndicator.setAttribute('visible', false);
    }

    /**
     * Update the position of the placement ghost
     * @param {Object} position - New position for the ghost
     */
    updatePlacementPosition(position) {
        if (!this.placementGhost) return;
        
        const snappedPosition = this.snapToGridPoint(position);
        this.placementGhost.setAttribute('position', snappedPosition);
        this.placementPosition = snappedPosition;
        
        // Check if this is a valid placement
        this.updatePlacementValidity();
    }

    /**
     * Rotate the placement ghost
     * @param {number} angleDelta - Angle to rotate by (in degrees)
     */
    rotatePlacement(angleDelta = 90) {
        if (!this.placementGhost) return;
        
        this.placementRotation = (this.placementRotation + angleDelta) % 360;
        this.placementGhost.setAttribute('rotation', { x: 0, y: this.placementRotation, z: 0 });
        
        // Check if this is a valid placement after rotation
        this.updatePlacementValidity();
    }

    /**
     * Update the visual state of the placement ghost based on placement validity
     */
    updatePlacementValidity() {
        if (!this.placementGhost) return;
        
        // Get object bounds and position
        const bounds = this.getObjectBounds(this.currentPlacementType);
        const position = this.placementPosition;
        const rotation = { x: 0, y: this.placementRotation, z: 0 };
        
        // Check for collisions
        this.isValidPlacement = !this.checkCollision(
            bounds,
            position,
            rotation,
            this.currentPlacementType
        );
        
        // Update ghost appearance based on validity
        const ghostMaterial = this.isValidPlacement ? 
            { color: '#19EFAA', opacity: 0.6, transparent: true } : 
            { color: '#FF7367', opacity: 0.6, transparent: true };
        
        // Apply to all child elements with material
        const materialElements = this.placementGhost.querySelectorAll('[material]');
        if (materialElements.length > 0) {
            materialElements.forEach(el => {
                el.setAttribute('material', ghostMaterial);
            });
        } else {
            // Apply directly to the ghost if no children have materials
            this.placementGhost.setAttribute('material', ghostMaterial);
        }
    }

    /**
     * Complete the placement and create the actual object
     * @returns {Element|null} The created object if placement was valid, null otherwise
     */
    completePlacement() {
        if (!this.isValidPlacement || !this.placementGhost) return null;
        
        // Create the actual object based on current placement settings
        // This is a placeholder - the actual implementation would create the appropriate object
        // and add it to the scene
        
        // Hide placement UI
        this.endPlacement();
        
        // In a real implementation, you would return the created object
        return true;
    }

    /**
     * Cancel the current placement
     */
    cancelPlacement() {
        this.endPlacement();
    }

    /**
     * Clean up placement mode
     */
    endPlacement() {
        // Clear ghost
        this.clearPlacementGhost();
        
        // Hide grid overlay
        this.gridOverlay.classList.remove('show');
        
        // Hide placement controls
        document.getElementById('placement-controls').classList.remove('show');
        
        // Reset placement state
        this.currentPlacementType = null;
        this.placementPosition = null;
        this.placementRotation = 0;
        this.isValidPlacement = false;
    }

    /**
     * Get the bounding box for an object type
     * @param {string} objectType - Type of object
     * @returns {Object} Bounding box dimensions {width, height, depth}
     */
    getObjectBounds(objectType) {
        // Default bounds
        const defaultBounds = { width: 1, height: 1, depth: 1 };
        
        // Return bounds based on object type
        switch (objectType) {
            case 'wall':
                return { width: 2, height: 2.7, depth: 0.15 };
            case 'floor':
                return { width: 4, height: 0.02, depth: 4 };
            case 'door':
                return { width: 1, height: 2.2, depth: 0.1 };
            case 'window':
                return { width: 1, height: 1.2, depth: 0.1 };
            case 'sofa':
                return { width: 2, height: 0.8, depth: 1 };
            case 'bed':
                return { width: 1.6, height: 0.5, depth: 2 };
            case 'table':
                return { width: 1.2, height: 0.4, depth: 0.8 };
            case 'chair':
                return { width: 0.5, height: 0.9, depth: 0.5 };
            case 'counter':
                return { width: 1.8, height: 0.9, depth: 0.6 };
            default:
                return defaultBounds;
        }
    }

    /**
     * Check if an object would collide at a given position and rotation
     * @param {Object} bounds - The bounding box of the object
     * @param {Object} position - The position to check
     * @param {Object} rotation - The rotation to check
     * @param {string} type - The type of object being checked
     * @param {string} [excludeId] - Optional ID to exclude from collision check
     * @returns {boolean} True if a collision would occur
     */
    checkCollision(bounds, position, rotation, type, excludeId) {
        // Special rules for different object types
        switch (type) {
            case 'wall':
                return this.checkWallCollision(bounds, position, rotation, excludeId);
            case 'door':
            case 'window':
                return !this.checkPlacementOnWall(bounds, position, rotation, type);
            case 'floor':
                // Floors can overlap
                return false;
            default:
                return this.checkGenericCollision(bounds, position, rotation, excludeId);
        }
    }

    /**
     * Check if a wall would collide with other objects
     * @param {Object} bounds - The wall's bounds
     * @param {Object} position - The position to check
     * @param {Object} rotation - The rotation to check
     * @param {string} [excludeId] - Optional ID to exclude from collision check
     * @returns {boolean} True if a collision would occur
     */
    checkWallCollision(bounds, position, rotation, excludeId) {
        // Walls can intersect with other walls (to form corners)
        // but shouldn't overlap with furniture
        
        // Calculate wall endpoints
        const angleRad = rotation.y * (Math.PI / 180);
        const halfLength = bounds.width / 2;
        const dx = Math.sin(angleRad) * halfLength;
        const dz = Math.cos(angleRad) * halfLength;
        
        const start = { x: position.x - dx, z: position.z - dz };
        const end = { x: position.x + dx, z: position.z + dz };
        
        // Check collisions with objects other than walls
        for (const [id, obj] of this.objectRegistry.entries()) {
            if (id === excludeId) continue;
            if (obj.type === 'wall') continue; // Allow wall-wall intersections
            if (obj.type === 'floor') continue; // Allow wall-floor intersections
            
            const objBounds = obj.bounds;
            const objPos = obj.position;
            
            // Simple bounding box check for non-wall objects
            if (this.boxSegmentIntersect(objPos, objBounds, start, end, bounds.depth)) {
                return true; // Collision detected
            }
        }
        
        return false; // No collision
    }

    /**
     * Check if a door or window can be placed on a wall
     * @param {Object} bounds - The door/window bounds
     * @param {Object} position - The position to check
     * @param {Object} rotation - The rotation to check
     * @param {string} type - Either 'door' or 'window'
     * @returns {boolean} True if placement is valid (on a wall)
     */
    checkPlacementOnWall(bounds, position, rotation, type) {
        // Doors and windows must be placed on walls
        let validPlacement = false;
        
        // Check if position is on a wall
        for (const wall of this.wallSegments) {
            const wallStart = wall.start;
            const wallEnd = wall.end;
            
            // Check if point is on line segment
            const distance = this.pointToSegmentDistance(
                position.x, position.z,
                wallStart.x, wallStart.z,
                wallEnd.x, wallEnd.z
            );
            
            // If within threshold of wall
            if (distance < 0.1) {
                // Check if rotation aligns with wall (perpendicular)
                const wallAngle = wall.rotation;
                const placementAngle = rotation.y;
                
                // Normalize angles to 0-360
                const normalizedWallAngle = ((wallAngle % 360) + 360) % 360;
                const normalizedPlacementAngle = ((placementAngle % 360) + 360) % 360;
                
                // Check if placement is perpendicular to wall (90 or 270 degrees difference)
                const angleDiff = Math.abs(normalizedPlacementAngle - normalizedWallAngle) % 180;
                if (Math.abs(angleDiff - 90) < 5) {
                    validPlacement = true;
                    break;
                }
            }
        }
        
        return validPlacement;
    }

    /**
     * Check collision for regular objects (furniture, etc.)
     * @param {Object} bounds - The object's bounds
     * @param {Object} position - The position to check
     * @param {Object} rotation - The rotation to check
     * @param {string} [excludeId] - Optional ID to exclude from collision check
     * @returns {boolean} True if a collision would occur
     */
    checkGenericCollision(bounds, position, rotation, excludeId) {
        for (const [id, obj] of this.objectRegistry.entries()) {
            if (id === excludeId) continue;
            if (obj.type === 'floor') continue; // Objects can be placed on floors
            
            const objBounds = obj.bounds;
            const objPos = obj.position;
            const objRot = obj.rotation;
            
            // Simple distance-based collision check for now
            // In a real implementation, you would use more accurate OBB (oriented bounding box) collision
            
            // Calculate adjusted dimensions based on rotation
            // For simplicity, we're just using the larger dimension for both width and depth
            const rotatedWidth = Math.max(bounds.width, bounds.depth);
            const rotatedDepth = rotatedWidth;
            
            const objRotatedWidth = Math.max(objBounds.width, objBounds.depth);
            const objRotatedDepth = objRotatedWidth;
            
            // Combine dimensions for collision check
            const combinedWidth = (rotatedWidth + objRotatedWidth) / 2;
            const combinedDepth = (rotatedDepth + objRotatedDepth) / 2;
            
            // Check distances on x and z axes
            const distanceX = Math.abs(position.x - objPos.x);
            const distanceZ = Math.abs(position.z - objPos.z);
            
            // Collision occurs if both distances are less than the combined dimensions
            if (distanceX < combinedWidth * 0.9 && distanceZ < combinedDepth * 0.9) {
                return true; // Collision detected
            }
        }
        
        return false; // No collision
    }

    /**
     * Calculate distance from a point to a line segment
     * @param {number} px - Point x coordinate
     * @param {number} pz - Point z coordinate
     * @param {number} x1 - Line segment start x
     * @param {number} z1 - Line segment start z
     * @param {number} x2 - Line segment end x
     * @param {number} z2 - Line segment end z
     * @returns {number} Distance from point to line segment
     */
    pointToSegmentDistance(px, pz, x1, z1, x2, z2) {
        const A = px - x1;
        const B = pz - z1;
        const C = x2 - x1;
        const D = z2 - z1;
        
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        
        if (len_sq !== 0) param = dot / len_sq;
        
        let xx, zz;
        
        if (param < 0) {
            xx = x1;
            zz = z1;
        } else if (param > 1) {
            xx = x2;
            zz = z2;
        } else {
            xx = x1 + param * C;
            zz = z1 + param * D;
        }
        
        const dx = px - xx;
        const dz = pz - zz;
        
        return Math.sqrt(dx * dx + dz * dz);
    }

    /**
     * Check if a box intersects with a line segment
     * @param {Object} boxPosition - Box center position {x, y, z}
     * @param {Object} boxDimensions - Box dimensions {width, height, depth}
     * @param {Object} segmentStart - Line segment start {x, z}
     * @param {Object} segmentEnd - Line segment end {x, z}
     * @param {number} segmentWidth - Width of the segment
     * @returns {boolean} True if intersection occurs
     */
    boxSegmentIntersect(boxPosition, boxDimensions, segmentStart, segmentEnd, segmentWidth) {
        // Expand box dimensions by half the segment width to account for segment thickness
        const expandedWidth = boxDimensions.width + segmentWidth;
        const expandedDepth = boxDimensions.depth + segmentWidth;
        
        // Create expanded box bounds
        const minX = boxPosition.x - expandedWidth / 2;
        const maxX = boxPosition.x + expandedWidth / 2;
        const minZ = boxPosition.z - expandedDepth / 2;
        const maxZ = boxPosition.z + expandedDepth / 2;
        
        // Check if either endpoint of the segment is inside the expanded box
        if ((segmentStart.x >= minX && segmentStart.x <= maxX && 
             segmentStart.z >= minZ && segmentStart.z <= maxZ) ||
            (segmentEnd.x >= minX && segmentEnd.x <= maxX && 
             segmentEnd.z >= minZ && segmentEnd.z <= maxZ)) {
            return true;
        }
        
        // Check if the segment intersects any of the box edges
        const edges = [
            { p1: { x: minX, z: minZ }, p2: { x: maxX, z: minZ } }, // Bottom edge
            { p1: { x: maxX, z: minZ }, p2: { x: maxX, z: maxZ } }, // Right edge
            { p1: { x: maxX, z: maxZ }, p2: { x: minX, z: maxZ } }, // Top edge
            { p1: { x: minX, z: maxZ }, p2: { x: minX, z: minZ } }  // Left edge
        ];
        
        for (const edge of edges) {
            if (this.lineSegmentsIntersect(
                segmentStart.x, segmentStart.z, 
                segmentEnd.x, segmentEnd.z, 
                edge.p1.x, edge.p1.z, 
                edge.p2.x, edge.p2.z
            )) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if two line segments intersect
     * @param {number} p0_x - First segment start x
     * @param {number} p0_z - First segment start z
     * @param {number} p1_x - First segment end x
     * @param {number} p1_z - First segment end z
     * @param {number} p2_x - Second segment start x
     * @param {number} p2_z - Second segment start z
     * @param {number} p3_x - Second segment end x
     * @param {number} p3_z - Second segment end z
     * @returns {boolean} True if segments intersect
     */
    lineSegmentsIntersect(p0_x, p0_z, p1_x, p1_z, p2_x, p2_z, p3_x, p3_z) {
        const s1_x = p1_x - p0_x;
        const s1_z = p1_z - p0_z;
        const s2_x = p3_x - p2_x;
        const s2_z = p3_z - p2_z;
        
        const s = (-s1_z * (p0_x - p2_x) + s1_x * (p0_z - p2_z)) / (-s2_x * s1_z + s1_x * s2_z);
        const t = (s2_x * (p0_z - p2_z) - s2_z * (p0_x - p2_x)) / (-s2_x * s1_z + s1_x * s2_z);
        
        return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
    }
}