/**
 * EasyFloor - 3D Models
 * Utilizes custom 3D models from the assets folder
 */

const MODELS = {
    // STRUCTURES
    
    // Wall models
    'blank-wall': {
        displayName: 'Blank Wall',
        category: 'structures',
        subcategory: 'walls',
        model: '#blank-wall', 
        boundingBox: { width: 4, height: 2.7, depth: 0.15 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-grip-lines-vertical',
        materials: ['#F5F5F5', '#E0E0E0', '#FAFAFA', '#D3D3D3', '#A9A9A9', '#CD5C5C', '#8B4513', '#D2B48C', '#FFEBCD', '#DEB887'],
        materialComponent: 'wall-material'
    },
    
    // Wall with door
    'wall-with-door': {
        displayName: 'Wall with Door',
        category: 'structures',
        subcategory: 'walls',
        model: '#wall_with_door',
        boundingBox: { width: 4, height: 2.7, depth: 0.15 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-door-open',
        materials: ['#F5F5F5', '#E0E0E0', '#FAFAFA', '#D3D3D3', '#A9A9A9', '#CD5C5C', '#8B4513', '#D2B48C', '#FFEBCD', '#DEB887'],
        materialComponent: 'wall-material'
    },
    
    // Wall with window
    'wall-with-window': {
        displayName: 'Wall with Window',
        category: 'structures',
        subcategory: 'walls',
        model: '#wall_with_window',
        boundingBox: { width: 4, height: 2.7, depth: 0.15 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-window-maximize',
        materials: ['#F5F5F5', '#E0E0E0', '#FAFAFA', '#D3D3D3', '#A9A9A9', '#CD5C5C', '#8B4513', '#D2B48C', '#FFEBCD', '#DEB887'],
        materialComponent: 'wall-material'
    },
    
    // Floor models
    'concrete-floor': {
        displayName: 'Concrete Floor',
        category: 'structures',
        subcategory: 'floors',
        model: '#concrete_floor',
        boundingBox: { width: 4, height: 0.05, depth: 4 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-square',
        materials: ['#E8E8E8', '#D3D3D3', '#F5F5F5', '#8B4513', '#D2B48C', '#FFEBCD', '#DEB887', '#808080'],
        materialComponent: 'floor-material'
    },
    
    // Wood floor
    'wood-floor': {
        displayName: 'Wood Floor',
        category: 'structures',
        subcategory: 'floors',
        model: '#wood_floor',
        boundingBox: { width: 4, height: 0.05, depth: 4 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-square',
        materials: ['#8B4513', '#D2B48C', '#FFEBCD', '#DEB887', '#A0522D'],
        materialComponent: 'floor-material'
    },
    
    // Roof models
    'brick-roof': {
        displayName: 'Brick Roof',
        category: 'structures',
        subcategory: 'roofs',
        model: '#brick_roof',
        boundingBox: { width: 4, height: 0.2, depth: 4 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-home',
        materials: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#B8860B', '#800000', '#A52A2A', '#B22222', '#DC143C'],
        materialComponent: 'roof-material'
    },
    
    // Tile Roof
    'tile-roof': {
        displayName: 'Tile Roof',
        category: 'structures',
        subcategory: 'roofs',
        model: '#tile_roof',
        boundingBox: { width: 4, height: 0.2, depth: 4 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-home',
        materials: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#B8860B'],
        materialComponent: 'roof-material'
    },
    
    // Polygonal Roof
    'polygonal-roof': {
        displayName: 'Polygonal Roof',
        category: 'structures',
        subcategory: 'roofs',
        model: '#polygonal_roof',
        boundingBox: { width: 4, height: 0.5, depth: 4 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-home',
        materials: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#B8860B'],
        materialComponent: 'roof-material'
    },
    
    // BEDROOM FURNITURE
    
    // Bed
    bed: {
        displayName: 'Bed',
        category: 'furniture',
        subcategory: 'bedroom',
        model: '#bed',
        boundingBox: { width: 1.6, height: 0.5, depth: 2 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-bed',
        materials: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#B8860B'],
        materialComponent: 'bed-frame-material'
    },
    
    // LIVING ROOM FURNITURE
    
    // Sofa - big
    'big-sofa': {
        displayName: 'Big Sofa',
        category: 'furniture',
        subcategory: 'living room',
        model: '#big_sofa_set_1',
        boundingBox: { width: 2.5, height: 0.9, depth: 1.2 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-couch',
        materials: ['#4682B4', '#87CEEB', '#1E90FF', '#6495ED', '#4169E1'],
        materialComponent: 'sofa-material'
    },
    
    // Sofa - small
    'small-sofa': {
        displayName: 'Small Sofa',
        category: 'furniture',
        subcategory: 'living room',
        model: '#small_sofa_set_1',
        boundingBox: { width: 2, height: 0.8, depth: 1 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-couch',
        materials: ['#4682B4', '#87CEEB', '#1E90FF', '#6495ED', '#4169E1'],
        materialComponent: 'sofa-material'
    },
    
    // Chair sofa
    'chair-sofa': {
        displayName: 'Chair Sofa',
        category: 'furniture',
        subcategory: 'living room',
        model: '#chair_sofa_set_1',
        boundingBox: { width: 1, height: 0.8, depth: 1 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-chair',
        materials: ['#4682B4', '#87CEEB', '#1E90FF', '#6495ED', '#4169E1'],
        materialComponent: 'sofa-material'
    },
    
    // Sofa set 2
    'sofa-set-2': {
        displayName: 'Sofa Set 2',
        category: 'furniture',
        subcategory: 'living room',
        model: '#sofa_set_2',
        boundingBox: { width: 2, height: 0.8, depth: 1 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-couch',
        materials: ['#4682B4', '#87CEEB', '#1E90FF', '#6495ED', '#4169E1'],
        materialComponent: 'sofa-material'
    },
    
    // Chair sofa set 2
    'chair-sofa-set-2': {
        displayName: 'Chair Sofa Set 2',
        category: 'furniture',
        subcategory: 'living room',
        model: '#chair_sofa_set_2',
        boundingBox: { width: 1, height: 0.8, depth: 1 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-chair',
        materials: ['#4682B4', '#87CEEB', '#1E90FF', '#6495ED', '#4169E1'],
        materialComponent: 'sofa-material'
    },
    
    // Coffee table
    'coffee-table': {
        displayName: 'Coffee Table',
        category: 'furniture',
        subcategory: 'living room',
        model: '#sofa_set_2_table',
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
        model: '#tv',
        boundingBox: { width: 1.4, height: 0.8, depth: 0.1 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-tv',
        materials: ['#2F4F4F', '#000000', '#696969', '#808080'],
        materialComponent: 'tv-material'
    },
    
    // Wardrobe
    wardrobe: {
        displayName: 'Wardrobe',
        category: 'furniture',
        subcategory: 'bedroom',
        model: '#wardrobe',
        boundingBox: { width: 1.2, height: 2, depth: 0.6 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-archive',
        materials: ['#A0522D', '#8B4513', '#CD853F', '#D2691E', '#B8860B'],
        materialComponent: 'wardrobe-material'
    },
    
    // Bookshelf
    bookshelf: {
        displayName: 'Bookshelf',
        category: 'furniture',
        subcategory: 'living room',
        model: '#bookshelf',
        boundingBox: { width: 1.2, height: 1.8, depth: 0.4 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-book',
        materials: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#B8860B'],
        materialComponent: 'bookshelf-material'
    },
    
    // Office Desk
    'office-desk': {
        displayName: 'Office Desk',
        category: 'furniture',
        subcategory: 'office',
        model: '#office_desk',
        boundingBox: { width: 1.4, height: 0.8, depth: 0.8 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-desk',
        materials: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#B8860B'],
        materialComponent: 'desk-material'
    },
    
    // House Lamp
    'house-lamp': {
        displayName: 'House Lamp',
        category: 'furniture',
        subcategory: 'lighting',
        model: '#house_lamp',
        boundingBox: { width: 0.6, height: 1.5, depth: 0.6 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-lightbulb',
        materials: ['#F5DEB3', '#FFDEAD', '#FFE4B5', '#FFDAB9', '#EEE8AA'],
        materialComponent: 'lamp-material'
    },
    
    // Wall Shelf
    'wall-shelf': {
        displayName: 'Wall Shelf',
        category: 'furniture',
        subcategory: 'storage',
        model: '#wall_shelf',
        boundingBox: { width: 1.2, height: 0.3, depth: 0.4 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-archive',
        materials: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#B8860B'],
        materialComponent: 'shelf-material'
    },
    
    // Washing Machine
    'washing-machine': {
        displayName: 'Washing Machine',
        category: 'furniture',
        subcategory: 'appliances',
        model: '#washing_machine',
        boundingBox: { width: 0.7, height: 0.9, depth: 0.7 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-tshirt',
        materials: ['#D3D3D3', '#C0C0C0', '#A9A9A9', '#E8E8E8', '#F5F5F5'],
        materialComponent: 'washing-machine-material'
    },
    
    // BATHROOM FIXTURES
    
    // Bathroom set
    bathroom: {
        displayName: 'Bathroom Set',
        category: 'furniture',
        subcategory: 'bathroom',
        model: '#bathroom',
        boundingBox: { width: 2, height: 1, depth: 2 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-bath',
        materials: ['#FFFFFF', '#F5F5F5', '#E8E8E8', '#D3D3D3', '#C0C0C0'],
        materialComponent: 'bathroom-material'
    },
    
    // Bathroom variation
    'bathroom-alt': {
        displayName: 'Bathroom Alt',
        category: 'furniture',
        subcategory: 'bathroom',
        model: '#bathroom_1',
        boundingBox: { width: 2, height: 1, depth: 2 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-bath',
        materials: ['#FFFFFF', '#F5F5F5', '#E8E8E8', '#D3D3D3', '#C0C0C0'],
        materialComponent: 'bathroom-material'
    },
    
    // Toilet
    toilet: {
        displayName: 'Toilet',
        category: 'furniture',
        subcategory: 'bathroom',
        model: '#toilet',
        boundingBox: { width: 0.4, height: 0.4, depth: 0.6 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-toilet',
        materials: ['#FFFFFF', '#F5F5F5', '#E8E8E8', '#D3D3D3', '#C0C0C0'],
        materialComponent: 'toilet-material'
    },
    
    // Carpet
    carpet: {
        displayName: 'Carpet',
        category: 'furniture',
        subcategory: 'decor',
        model: '#sofa_set_2_carpet',
        boundingBox: { width: 2, height: 0.05, depth: 1.5 },
        defaultScale: { x: 1, y: 1, z: 1 },
        icon: 'fas fa-square',
        materials: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#B8860B'],
        materialComponent: 'carpet-material'
    },
    
    // ROOM TEMPLATES
    
    'room-bedroom': {
        displayName: 'Bedroom Template',
        category: 'templates',
        subcategory: 'rooms',
        icon: 'fas fa-bed',
        // This is a composite template that will place multiple objects
        template: [
            { type: 'concrete-floor', position: { x: 0, y: 0, z: 0 }, scale: { x: 1.5, y: 1, z: 1.5 } },
            { type: 'blank-wall', position: { x: 0, y: 1.35, z: -3 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'blank-wall', position: { x: 0, y: 1.35, z: 3 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'blank-wall', position: { x: -3, y: 1.35, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'blank-wall', position: { x: 3, y: 1.35, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'wall-with-door', position: { x: 0, y: 1.1, z: -3 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'wall-with-window', position: { x: 3, y: 1.5, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'bed', position: { x: -1.5, y: 0.25, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'wardrobe', position: { x: 2, y: 1, z: 2 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'bookshelf', position: { x: -1.5, y: 0.25, z: -1.5 }, rotation: { x: 0, y: 0, z: 0 } }
        ]
    },
    
    'room-kitchen': {
        displayName: 'Kitchen Template',
        category: 'templates',
        subcategory: 'rooms',
        icon: 'fas fa-utensils',
        template: [
            { type: 'concrete-floor', position: { x: 0, y: 0, z: 0 }, scale: { x: 1.5, y: 1, z: 1.5 } },
            { type: 'blank-wall', position: { x: 0, y: 1.35, z: -3 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'blank-wall', position: { x: 0, y: 1.35, z: 3 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'blank-wall', position: { x: -3, y: 1.35, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'blank-wall', position: { x: 3, y: 1.35, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'wall-with-door', position: { x: -3, y: 1.1, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'wall-with-window', position: { x: 0, y: 1.5, z: 3 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'big-sofa', position: { x: 2, y: 0.45, z: -1 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'small-sofa', position: { x: 2, y: 0.45, z: 1 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'coffee-table', position: { x: 0, y: 0.45, z: 2.5 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'tv', position: { x: 0, y: 0.875, z: 2.5 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'washing-machine', position: { x: -2, y: 0.45, z: -2 }, rotation: { x: 0, y: 90, z: 0 } }
        ]
    },
    
    'room-bathroom': {
        displayName: 'Bathroom Template',
        category: 'templates',
        subcategory: 'rooms',
        icon: 'fas fa-bath',
        template: [
            { type: 'concrete-floor', position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
            { type: 'blank-wall', position: { x: 0, y: 1.35, z: -2 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'blank-wall', position: { x: 0, y: 1.35, z: 2 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'blank-wall', position: { x: -2, y: 1.35, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'blank-wall', position: { x: 2, y: 1.35, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'wall-with-door', position: { x: -2, y: 1.1, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'wall-with-window', position: { x: 0, y: 1.5, z: 2 }, rotation: { x: 0, y: 0, z: 0 } },
            { type: 'bathroom', position: { x: 1.5, y: 0.25, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
            { type: 'toilet', position: { x: -1, y: 0.2, z: -1 }, rotation: { x: 0, y: 0, z: 0 } }
        ]
    }
};