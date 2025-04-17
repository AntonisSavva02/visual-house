/**
 * EasyFloor - 3D Models
 * Utilizes custom 3D models from the assets folder
 */

const MODELS = {
    // STRUCTURES
    
    // Wall models
    wall: {
        displayName: 'Wall',
        category: 'structures',
        subcategory: 'walls',
        model: '#wall-model', // Reference to a-asset id
        boundingBox: { width: 4, height: 2.7, depth: 0.15 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-grip-lines-vertical',
        materials: ['#F5F5F5', '#E0E0E0', '#FAFAFA', '#D3D3D3', '#A9A9A9', '#CD5C5C', '#8B4513', '#D2B48C', '#FFEBCD', '#DEB887'],
        materialComponent: 'wall-material' // Material component name for color changes
    },
    
    // Floor models
    floor: {
        displayName: 'Floor',
        category: 'structures',
        subcategory: 'floors',
        model: '#floor-model',
        boundingBox: { width: 4, height: 0.05, depth: 4 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-square',
        materials: ['#E8E8E8', '#D3D3D3', '#F5F5F5', '#8B4513', '#D2B48C', '#FFEBCD', '#DEB887', '#808080'],
        materialComponent: 'floor-material'
    },
    
    // Window
    window: {
        displayName: 'Window',
        category: 'structures',
        subcategory: 'openings',
        model: '#window-model',
        boundingBox: { width: 1, height: 1.2, depth: 0.2 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-window-maximize',
        materials: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#B8860B'],
        materialComponent: 'window-frame-material'
    },
    
    // Door
    door: {
        displayName: 'Door',
        category: 'structures',
        subcategory: 'openings',
        model: '#door-model',
        boundingBox: { width: 1, height: 2.2, depth: 0.2 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-door-open',
        materials: ['#A0522D', '#8B4513', '#CD853F', '#D2691E', '#B8860B'],
        materialComponent: 'door-material'
    },
    
    // Roof
    roof: {
        displayName: 'Roof',
        category: 'structures',
        subcategory: 'roofs',
        model: '#roof-model',
        boundingBox: { width: 4, height: 0.2, depth: 4 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-home',
        materials: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#B8860B', '#800000', '#A52A2A', '#B22222', '#DC143C'],
        materialComponent: 'roof-material'
    },
    
    // Stairs
    stairs: {
        displayName: 'Stairs',
        category: 'structures',
        subcategory: 'stairs',
        model: '#stairs-model',
        boundingBox: { width: 1.5, height: 3, depth: 3 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-stairs',
        materials: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#B8860B'],
        materialComponent: 'stairs-material'
    },
    
    // LIVING ROOM FURNITURE
    
    // Sofa
    sofa: {
        displayName: 'Sofa',
        category: 'furniture',
        subcategory: 'living room',
        model: '#sofa-model',
        boundingBox: { width: 2, height: 0.8, depth: 1 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-couch',
        materials: ['#4682B4', '#87CEEB', '#1E90FF', '#6495ED', '#4169E1', '#696969', '#808080', '#A9A9A9', '#C0C0C0', '#D3D3D3'],
        materialComponent: 'sofa-material'
    },
    
    // Coffee table
    'coffee-table': {
        displayName: 'Coffee Table',
        category: 'furniture',
        subcategory: 'living room',
        model: '#coffee-table-model',
        boundingBox: { width: 1.2, height: 0.4, depth: 0.8 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-tablet-alt',
        materials: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#B8860B'],
        materialComponent: 'table-material'
    },
    
    // TV
    tv: {
        displayName: 'TV',
        category: 'furniture',
        subcategory: 'electronics',
        model: '#tv-model',
        boundingBox: { width: 1.4, height: 0.8, depth: 0.1 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-tv',
        materials: ['#2F4F4F', '#000000', '#696969', '#808080'],
        materialComponent: 'tv-material'
    },
    
    // BEDROOM FURNITURE
    
    // Bed
    bed: {
        displayName: 'Bed',
        category: 'furniture',
        subcategory: 'bedroom',
        model: '#bed-model',
        boundingBox: { width: 1.6, height: 0.5, depth: 2 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-bed',
        materials: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#B8860B'],
        materialComponent: 'bed-frame-material'
    },
    
    // Wardrobe
    wardrobe: {
        displayName: 'Wardrobe',
        category: 'furniture',
        subcategory: 'bedroom',
        model: '#wardrobe-model',
        boundingBox: { width: 1.2, height: 2, depth: 0.6 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-archive',
        materials: ['#A0522D', '#8B4513', '#CD853F', '#D2691E', '#B8860B'],
        materialComponent: 'wardrobe-material'
    },
    
    // Nightstand
    nightstand: {
        displayName: 'Nightstand',
        category: 'furniture',
        subcategory: 'bedroom',
        model: '#nightstand-model',
        boundingBox: { width: 0.4, height: 0.5, depth: 0.4 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-cube',
        materials: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#B8860B'],
        materialComponent: 'nightstand-material'
    },
    
    // KITCHEN FURNITURE
    
    // Counter
    counter: {
        displayName: 'Kitchen Counter',
        category: 'furniture',
        subcategory: 'kitchen',
        model: '#counter-model',
        boundingBox: { width: 1.8, height: 0.9, depth: 0.6 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-border-all',
        materials: ['#A9A9A9', '#D3D3D3', '#C0C0C0', '#E8E8E8', '#F5F5F5'],
        materialComponent: 'counter-material'
    },
    
    // Fridge
    fridge: {
        displayName: 'Refrigerator',
        category: 'furniture',
        subcategory: 'kitchen',
        model: '#fridge-model',
        boundingBox: { width: 0.8, height: 1.8, depth: 0.7 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-cube',
        materials: ['#D3D3D3', '#C0C0C0', '#A9A9A9', '#E8E8E8', '#F5F5F5'],
        materialComponent: 'fridge-material'
    },
    
    // Sink
    sink: {
        displayName: 'Kitchen Sink',
        category: 'furniture',
        subcategory: 'kitchen',
        model: '#sink-model',
        boundingBox: { width: 0.8, height: 0.2, depth: 0.5 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-sink',
        materials: ['#C0C0C0', '#A9A9A9', '#D3D3D3', '#E8E8E8', '#F5F5F5'],
        materialComponent: 'sink-material'
    },
    
    // BATHROOM FIXTURES
    
    // Bathtub
    bathtub: {
        displayName: 'Bathtub',
        category: 'furniture',
        subcategory: 'bathroom',
        model: '#bathtub-model',
        boundingBox: { width: 0.7, height: 0.5, depth: 1.7 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-bath',
        materials: ['#FFFFFF', '#F5F5F5', '#E8E8E8', '#D3D3D3', '#C0C0C0'],
        materialComponent: 'bathtub-material'
    },
    
    // Toilet
    toilet: {
        displayName: 'Toilet',
        category: 'furniture',
        subcategory: 'bathroom',
        model: '#toilet-model',
        boundingBox: { width: 0.4, height: 0.4, depth: 0.6 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-toilet',
        materials: ['#FFFFFF', '#F5F5F5', '#E8E8E8', '#D3D3D3', '#C0C0C0'],
        materialComponent: 'toilet-material'
    },
    
    // Bathroom sink
    'sink-bathroom': {
        displayName: 'Bathroom Sink',
        category: 'furniture',
        subcategory: 'bathroom',
        model: '#sink-bathroom-model',
        boundingBox: { width: 0.6, height: 0.8, depth: 0.5 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-sink',
        materials: ['#FFFFFF', '#F5F5F5', '#E8E8E8', '#D3D3D3', '#C0C0C0'],
        materialComponent: 'sink-bathroom-material'
    },
    
    // ROOM TEMPLATES
    
    'room-bedroom': {
        displayName: 'Bedroom Template',
        category: 'templates',
        subcategory: 'rooms',
        icon: 'fas fa-bed',
        // This is a composite template that will place multiple objects
        template: [
            { type: 'floor', position: { x: 0, y: 0, z: 0 }, scale: { x: 1.5, y: 1, z: 1.5 } },
            { type: 'wall', position: { x: 0, y: 1.35, z: -3 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'wall', position: { x: 0, y: 1.35, z: 3 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'wall', position: { x: -3, y: 1.35, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'wall', position: { x: 3, y: 1.35, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'door', position: { x: 0, y: 1.1, z: -3 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'window', position: { x: 3, y: 1.5, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'bed', position: { x: -1.5, y: 0.25, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'wardrobe', position: { x: 2, y: 1, z: 2 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'nightstand', position: { x: -1.5, y: 0.25, z: -1.5 }, rotation: { x: 0, y: 0, z: 0 } }
        ]
    },
    
    'room-kitchen': {
        displayName: 'Kitchen Template',
        category: 'templates',
        subcategory: 'rooms',
        icon: 'fas fa-utensils',
        template: [
            { type: 'floor', position: { x: 0, y: 0, z: 0 }, scale: { x: 1.5, y: 1, z: 1.5 } },
            { type: 'wall', position: { x: 0, y: 1.35, z: -3 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'wall', position: { x: 0, y: 1.35, z: 3 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'wall', position: { x: -3, y: 1.35, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'wall', position: { x: 3, y: 1.35, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'door', position: { x: -3, y: 1.1, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'window', position: { x: 0, y: 1.5, z: 3 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'counter', position: { x: 2, y: 0.45, z: -1 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'counter', position: { x: 2, y: 0.45, z: 1 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'counter', position: { x: 0, y: 0.45, z: 2.5 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'sink', position: { x: 0, y: 0.875, z: 2.5 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'fridge', position: { x: -2, y: 0.9, z: -2 }, rotation: { x: 0, y: 90, z: 0 } }
        ]
    },
    
    'room-bathroom': {
        displayName: 'Bathroom Template',
        category: 'templates',
        subcategory: 'rooms',
        icon: 'fas fa-bath',
        template: [
            { type: 'floor', position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
            { type: 'wall', position: { x: 0, y: 1.35, z: -2 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'wall', position: { x: 0, y: 1.35, z: 2 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'wall', position: { x: -2, y: 1.35, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'wall', position: { x: 2, y: 1.35, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'door', position: { x: -2, y: 1.1, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'window', position: { x: 0, y: 1.5, z: 2 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'bathtub', position: { x: 1.5, y: 0.25, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'sink-bathroom', position: { x: -1, y: 0.4, z: 1.5 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'toilet', position: { x: -1, y: 0.2, z: -1 }, rotation: { x: 0, y: 0, z: 0 } }
        ]
    }
};