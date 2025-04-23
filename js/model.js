/**
 * EasyFloor - Model Definitions
 * Contains all object types, models, and properties
 */

const MODELS = {
    // WALLS
    'blank-wall': {
        displayName: 'Blank Wall',
        category: 'structures',
        icon: 'fas fa-square',
        model: '#blank-wall',
        boundingBox: { width: 2, height: 3, depth: 0.2 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#FFFFFF', '#E0E0E0', '#F5F5F5']
    },
    
    'wall-with-door': {
        displayName: 'Wall With Door',
        category: 'structures',
        icon: 'fas fa-door-open',
        model: '#wall_with_door',
        boundingBox: { width: 2, height: 3, depth: 0.2 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#FFFFFF', '#E0E0E0', '#F5F5F5']
    },
    
    'wall-with-window': {
        displayName: 'Wall With Window',
        category: 'structures',
        icon: 'fas fa-window-maximize',
        model: '#wall_with_window',
        boundingBox: { width: 2, height: 3, depth: 0.2 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#FFFFFF', '#E0E0E0', '#F5F5F5']
    },
    
    // FLOORS
    'concrete-floor': {
        displayName: 'Concrete Floor',
        category: 'structures',
        icon: 'fas fa-square',
        model: '#concrete_floor',
        boundingBox: { width: 5, height: 0.1, depth: 5 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#C0C0C0', '#A0A0A0', '#808080']
    },
    
    'wood-floor': {
        displayName: 'Wood Floor',
        category: 'structures',
        icon: 'fas fa-square',
        model: '#wood_floor',
        boundingBox: { width: 5, height: 0.1, depth: 5 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#8B4513', '#A0522D', '#CD853F']
    },
    
    // ROOFS
    'brick-roof': {
        displayName: 'Brick Roof',
        category: 'structures',
        icon: 'fas fa-home',
        model: '#brick_roof',
        boundingBox: { width: 5, height: 1, depth: 5 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#8B4513', '#A0522D', '#CD853F']
    },
    
    'polygonal-roof': {
        displayName: 'Polygonal Roof',
        category: 'structures',
        icon: 'fas fa-home',
        model: '#polygonal_roof',
        boundingBox: { width: 5, height: 1.5, depth: 5 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#8B4513', '#A0522D', '#CD853F']
    },
    
    'tile-roof': {
        displayName: 'Tile Roof',
        category: 'structures',
        icon: 'fas fa-home',
        model: '#tile_roof',
        boundingBox: { width: 5, height: 1, depth: 5 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#8B4513', '#A0522D', '#CD853F']
    },
    
    // BATHROOM ITEMS
    'bathroom': {
        displayName: 'Bathroom Set',
        category: 'furniture',
        icon: 'fas fa-bath',
        model: '#bathroom',
        boundingBox: { width: 3, height: 2, depth: 2 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#FFFFFF', '#E0E0E0', '#F5F5F5']
    },
    
    'bathroom-1': {
        displayName: 'Bathroom Set 2',
        category: 'furniture',
        icon: 'fas fa-bath',
        model: '#bathroom_1',
        boundingBox: { width: 3, height: 2, depth: 2 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#FFFFFF', '#E0E0E0', '#F5F5F5']
    },
    
    'toilet': {
        displayName: 'Toilet',
        category: 'furniture',
        icon: 'fas fa-toilet',
        model: '#toilet',
        boundingBox: { width: 1, height: 1, depth: 1 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#FFFFFF', '#E0E0E0', '#F5F5F5']
    },
    
    // BEDROOM ITEMS
    'bed': {
        displayName: 'Bed',
        category: 'furniture',
        icon: 'fas fa-bed',
        model: '#bed',
        boundingBox: { width: 2, height: 1, depth: 3 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#FFFFFF', '#E0E0E0', '#F5F5F5', '#87CEFA', '#FF6347']
    },
    
    // ACCESSORIES
    'bookshelf': {
        displayName: 'Bookshelf',
        category: 'furniture',
        icon: 'fas fa-book',
        model: '#bookshelf',
        boundingBox: { width: 1.5, height: 2, depth: 0.5 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#8B4513', '#A0522D', '#CD853F']
    },
    
    'house-lamp': {
        displayName: 'Lamp',
        category: 'decor',
        icon: 'fas fa-lightbulb',
        model: '#house_lamp',
        boundingBox: { width: 0.5, height: 1.5, depth: 0.5 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#FFFFFF', '#E0E0E0', '#F5F5F5']
    },
    
    'office-desk': {
        displayName: 'Office Desk',
        category: 'furniture',
        icon: 'fas fa-briefcase',
        model: '#office_desk',
        boundingBox: { width: 1.5, height: 1, depth: 0.8 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#8B4513', '#A0522D', '#CD853F']
    },
    
    'tv': {
        displayName: 'TV',
        category: 'decor',
        icon: 'fas fa-tv',
        model: '#tv',
        boundingBox: { width: 1.2, height: 0.8, depth: 0.2 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#000000', '#333333', '#666666']
    },
    
    'wall-shelf': {
        displayName: 'Wall Shelf',
        category: 'furniture',
        icon: 'fas fa-archive',
        model: '#wall_shelf',
        boundingBox: { width: 1.5, height: 0.2, depth: 0.3 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#8B4513', '#A0522D', '#CD853F']
    },
    
    'wardrobe': {
        displayName: 'Wardrobe',
        category: 'furniture',
        icon: 'fas fa-door-closed',
        model: '#wardrobe',
        boundingBox: { width: 1.5, height: 2, depth: 0.6 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#8B4513', '#A0522D', '#CD853F']
    },
    
    'washing-machine': {
        displayName: 'Washing Machine',
        category: 'furniture',
        icon: 'fas fa-tint',
        model: '#washing_machine',
        boundingBox: { width: 0.6, height: 0.9, depth: 0.6 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#FFFFFF', '#E0E0E0', '#F5F5F5']
    },
    
    // SOFA MODELS
    'big-sofa-set-1': {
        displayName: 'Large Sofa',
        category: 'furniture',
        icon: 'fas fa-couch',
        model: '#big_sofa_set_1',
        boundingBox: { width: 3, height: 1, depth: 1.2 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#87CEFA', '#4682B4', '#000080', '#A0522D', '#8B4513']
    },
    
    'small-sofa-set-1': {
        displayName: 'Small Sofa',
        category: 'furniture',
        icon: 'fas fa-couch',
        model: '#small_sofa_set_1',
        boundingBox: { width: 1.5, height: 1, depth: 1 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#87CEFA', '#4682B4', '#000080', '#A0522D', '#8B4513']
    },
    
    'chair-sofa-set-1': {
        displayName: 'Sofa Chair',
        category: 'furniture',
        icon: 'fas fa-chair',
        model: '#chair_sofa_set_1',
        boundingBox: { width: 1, height: 1, depth: 1 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#87CEFA', '#4682B4', '#000080', '#A0522D', '#8B4513']
    },
    
    'sofa-set-2': {
        displayName: 'Sofa Set',
        category: 'furniture',
        icon: 'fas fa-couch',
        model: '#sofa_set_2',
        boundingBox: { width: 3, height: 1, depth: 1.2 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#87CEFA', '#4682B4', '#000080', '#A0522D', '#8B4513']
    },
    
    'chair-sofa-set-2': {
        displayName: 'Chair Set',
        category: 'furniture',
        icon: 'fas fa-chair',
        model: '#chair_sofa_set_2',
        boundingBox: { width: 1, height: 1, depth: 1 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#87CEFA', '#4682B4', '#000080', '#A0522D', '#8B4513']
    },
    
    // CARPETS
    'sofa-set-2-carpet': {
        displayName: 'Carpet',
        category: 'decor',
        icon: 'fas fa-square',
        model: '#sofa_set_2_carpet',
        boundingBox: { width: 3, height: 0.1, depth: 2 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#87CEFA', '#4682B4', '#000080', '#CD853F', '#8B4513']
    },
    
    // TABLES
    'sofa-set-2-table': {
        displayName: 'Coffee Table',
        category: 'furniture',
        icon: 'fas fa-table',
        model: '#sofa_set_2_table',
        boundingBox: { width: 1.2, height: 0.5, depth: 0.8 },
        defaultScale: { x: 1, y: 1, z: 1 },
        materials: ['#8B4513', '#A0522D', '#CD853F', '#FFFFFF', '#E0E0E0']
    }
};