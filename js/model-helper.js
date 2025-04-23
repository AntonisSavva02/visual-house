/**
 * Visual-House - Model Helper
 * Handles model loading, textures, and visibility issues
 * Last updated: 2025-04-23 12:58:59
 * Developer: AntonisSavva02ok
 */

const ModelHelper = {
    // Initialize model helper
    init: function() {
        // Register custom component for model loading
        this.registerModelLoaderComponent();
        this.registerEmergencyFixComponent();
        
        console.log('Model Helper initialized with enhanced visibility fixes');
        
        // Apply global fixes immediately
        this.applyGlobalFixes();
        
        // Setup periodic texture checking
        this.setupTextureWatchdog();
    },
    
    // Apply global fixes to A-Frame rendering
    applyGlobalFixes: function() {
        // Override createMesh to ensure material application
        if (THREE && THREE.GLTFLoader) {
            const originalCreateMesh = THREE.GLTFLoader.prototype.createMesh;
            THREE.GLTFLoader.prototype.createMesh = function() {
                const mesh = originalCreateMesh.apply(this, arguments);
                
                // Force all materials to be visible
                if (mesh && mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(mat => {
                            mat.transparent = false;
                            mat.opacity = 1;
                            mat.needsUpdate = true;
                        });
                    } else {
                        mesh.material.transparent = false;
                        mesh.material.opacity = 1;
                        mesh.material.needsUpdate = true;
                    }
                    mesh.visible = true;
                }
                
                return mesh;
            };
            console.log('Applied GLTFLoader mesh creation override');
        } else {
            console.log('THREE.GLTFLoader not available yet, will retry later');
            setTimeout(() => this.applyGlobalFixes(), 1000);
        }
        
        // Override A-Frame's material update function to force visibility
        if (AFRAME && AFRAME.components.material) {
            const originalUpdateMaterial = AFRAME.components.material.Component.prototype.updateMaterial;
            AFRAME.components.material.Component.prototype.updateMaterial = function() {
                originalUpdateMaterial.call(this);
                
                // Force material to be visible
                if (this.material) {
                    this.material.transparent = false;
                    this.material.opacity = 1.0;
                    this.material.needsUpdate = true;
                }
            };
            console.log('Applied Material update override');
        }
    },
    
    // Setup a watchdog to periodically check for and fix texture issues
    setupTextureWatchdog: function() {
        setInterval(() => {
            const models = document.querySelectorAll('[gltf-model]');
            
            models.forEach(model => {
                if (model.object3D && model.object3D.visible === false) {
                    console.log('Fixing invisible model:', model);
                    model.object3D.visible = true;
                    
                    // Force deep visibility
                    model.object3D.traverse(node => {
                        node.visible = true;
                        if (node.isMesh && node.material) {
                            if (Array.isArray(node.material)) {
                                node.material.forEach(mat => {
                                    mat.transparent = false;
                                    mat.opacity = 1;
                                    mat.needsUpdate = true;
                                });
                            } else {
                                node.material.transparent = false;
                                node.material.opacity = 1;
                                node.material.needsUpdate = true;
                            }
                        }
                    });
                }
            });
        }, 10000); // Check every 10 seconds
    },
    
    // Register a component to fix emergency visibility issues
    registerEmergencyFixComponent: function() {
        if (typeof AFRAME === 'undefined') {
            console.error('A-Frame not loaded, unable to register components');
            return;
        }
        
        // Create a component that will be added to the scene to fix model visibility globally
        AFRAME.registerComponent('emergency-model-fix', {
            init: function() {
                console.log('Emergency model fix active');
                
                // Force re-render all models every second
                this.fixInterval = setInterval(() => {
                    const models = document.querySelectorAll('[gltf-model]');
                    console.log('Emergency fix scanning', models.length, 'models');
                    
                    models.forEach(model => {
                        // Force model to be visible
                        model.setAttribute('visible', true);
                        if (model.object3D) {
                            model.object3D.visible = true;
                        
                            // Force re-render by toggling model
                            const currentSrc = model.getAttribute('gltf-model');
                            if (currentSrc) {
                                // Add dummy parameter to force refresh
                                model.setAttribute('gltf-model', currentSrc + '?fix=' + Date.now());
                                
                                // Apply default material
                                setTimeout(() => {
                                    // Get the model's mesh
                                    if (model.object3D) {
                                        model.object3D.traverse(node => {
                                            if (node.isMesh) {
                                                // Only apply emergency material if no texture is present
                                                if (!node.material || !node.material.map) {
                                                    console.log('Applying emergency material to mesh');
                                                    node.material = new THREE.MeshStandardMaterial({
                                                        color: 0xFF5555,
                                                        metalness: 0.2,
                                                        roughness: 0.8,
                                                        emissive: 0xFF5555,
                                                        emissiveIntensity: 0.3
                                                    });
                                                }
                                                node.visible = true;
                                            }
                                        });
                                    }
                                    
                                    model.setAttribute('visible', true);
                                }, 100);
                            }
                        }
                    });
                }, 5000); // Every 5 seconds
            },
            
            remove: function() {
                if (this.fixInterval) {
                    clearInterval(this.fixInterval);
                }
            }
        });
        
        // Add emergency fix component to the scene
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const scene = document.querySelector('a-scene');
                if (scene) {
                    scene.setAttribute('emergency-model-fix', '');
                    console.log('Added emergency model fix to scene');
                }
            }, 1000);
        });
        
        console.log('Emergency fix component registered');
    },
    
    // Register a component to handle model loading and texture application
    registerModelLoaderComponent: function() {
        if (typeof AFRAME === 'undefined') {
            console.error('A-Frame not loaded, unable to register components');
            return;
        }
        
        // Register component for handling model loading and textures
        AFRAME.registerComponent('model-handler', {
            schema: {
                modelSrc: {type: 'string'},
                defaultColor: {type: 'string', default: '#FF5555'},
                modelName: {type: 'string', default: ''},
                category: {type: 'string', default: ''}
            },
            
            init: function() {
                console.log(`Initializing model-handler for: ${this.data.modelSrc}`);
                this.el.addEventListener('model-loaded', this.onModelLoaded.bind(this));
                this.el.addEventListener('model-error', this.onModelError.bind(this));
                
                // Force model to be visible
                this.el.setAttribute('visible', true);
                
                // Setup a fallback if model doesn't load within 3 seconds
                this.fallbackTimer = setTimeout(() => {
                    console.log('Model load timeout, creating fallback');
                    this.createPlaceholder();
                }, 3000);
                
                // Apply a bright default color so it's visible even without textures
                this.el.setAttribute('material', {
                    color: this.data.defaultColor,
                    metalness: 0.2,
                    roughness: 0.8,
                    emissive: this.data.defaultColor,
                    emissiveIntensity: 0.3,
                    opacity: 1.0
                });
            },
            
            onModelLoaded: function(evt) {
                console.log(`Model loaded successfully: ${this.data.modelSrc}`);
                clearTimeout(this.fallbackTimer);
                
                const model = this.el.getObject3D('mesh');
                if (!model) {
                    console.warn('Model loaded but mesh is unavailable');
                    this.createPlaceholder();
                    return;
                }
                
                // Try to load and apply textures
                this.loadAndApplyTextures(model);
                
                // Force visibility update
                this.el.setAttribute('visible', true);
                model.visible = true;
                
                // Emit custom event that model is ready
                this.el.emit('model-ready', {model: model}, false);
            },
            
            loadAndApplyTextures: function(model) {
                // Find appropriate textures based on model category and name
                const texturePaths = this.findTexturePaths();
                
                if (texturePaths.length === 0) {
                    console.log(`No textures found for ${this.data.modelName}, using default material`);
                    this.applyDefaultMaterial(model);
                    return;
                }
                
                // Try to load the first texture
                this.tryLoadTexture(model, texturePaths, 0);
            },
            
            tryLoadTexture: function(model, texturePaths, index) {
                if (index >= texturePaths.length) {
                    // Tried all paths, fall back to default material
                    console.log('All texture paths failed, using default material');
                    this.applyDefaultMaterial(model);
                    return;
                }
                
                const texturePath = texturePaths[index];
                console.log(`Trying to load texture: ${texturePath}`);
                
                // Load the texture
                const loader = new THREE.TextureLoader();
                
                // Add cache-busting parameter to URL
                const cacheBust = `?cb=${Date.now()}`;
                
                loader.load(
                    texturePath + cacheBust,
                    // Texture loaded successfully
                    (texture) => {
                        console.log(`Texture loaded: ${texturePath}`);
                        
                        // Apply texture to all meshes in the model
                        model.traverse((node) => {
                            if (node.isMesh && node.material) {
                                // Create new material with the texture
                                const material = new THREE.MeshStandardMaterial({
                                    map: texture,
                                    metalness: 0.2,
                                    roughness: 0.8,
                                    emissive: this.data.defaultColor,
                                    emissiveIntensity: 0.1
                                });
                                
                                node.material = material;
                                node.material.needsUpdate = true;
                                node.visible = true;
                            }
                        });
                    },
                    // Texture loading progress
                    undefined,
                    // Texture loading error
                    (error) => {
                        console.warn(`Error loading texture ${texturePath}:`, error);
                        // Try the next texture in the list
                        this.tryLoadTexture(model, texturePaths, index + 1);
                    }
                );
            },
            
            findTexturePaths: function() {
                const textures = [];
                const category = this.data.category;
                
                // Don't try to load textures if no category
                if (!category) {
                    return textures;
                }
                
                // Wall textures - using actual file paths we found in the repository
                if (category === 'walls') {
                    textures.push('assets/models/walls/textures/01_-_Plaster003_0_baseColor.jpeg');
                    textures.push('assets/models/walls/textures/01_-_Plaster003_baseColor.jpeg');
                    textures.push('assets/models/walls/textures/02_-_Wood006_baseColor.jpeg');
                    textures.push('assets/models/walls/textures/02_-_Wood05_baseColor.png');
                    textures.push('assets/models/walls/textures/07_-_Ornate_baseColor.png');
                }
                
                // Floor textures (assuming structure based on how wall textures are organized)
                if (category === 'floors') {
                    textures.push('assets/models/floors/wood_textures/wood_baseColor.jpeg');
                    textures.push('assets/models/floors/concrete_textures/concrete_baseColor.jpeg');
                    // Also use the villa floor texture as fallback
                    textures.push('assets/models/villa_textures/floor_baseColor.jpeg');
                }
                
                // Villa textures from the actual files we found
                if (category === 'structures' || category === 'villa') {
                    textures.push('assets/models/villa_textures/facade_baseColor.jpeg');
                    textures.push('assets/models/villa_textures/fdtn_baseColor.jpeg');
                    textures.push('assets/models/villa_textures/floor_baseColor.jpeg');
                    textures.push('assets/models/villa_textures/villa_fl_plan_baseColor.png');
                }
                
                // For other categories, we'll make educated guesses based on the repository structure
                // These might need to be adjusted once we have access to those directories
                
                // Furniture (sofa, tables, etc.)
                if (category === 'furniture' || category === 'sofa' || category === 'tables') {
                    // Using best guesses based on repository structure
                    textures.push('assets/models/sofa/textures/fabric_baseColor.jpeg');
                    textures.push('assets/models/tables/textures/wood_baseColor.jpeg');
                }
                
                // Bathroom - no textures folder found yet, using educated guess
                if (category === 'bathroom') {
                    textures.push('assets/models/bathroom/textures/ceramic_baseColor.jpeg');
                }
                
                // Bedroom - no textures folder found yet, using educated guess
                if (category === 'bedroom') {
                    textures.push('assets/models/bedroom/textures/fabric_baseColor.jpeg');
                }
                
                // Carpets - no textures folder found yet, using educated guess
                if (category === 'carpets') {
                    textures.push('assets/models/carpets/textures/carpet_baseColor.jpeg');
                }
                
                // Accessories - no textures folder found yet, using educated guess
                if (category === 'accessories') {
                    textures.push('assets/models/accessories/textures/accessory_baseColor.jpeg');
                }
                
                // Roofs - no textures folder found yet, using educated guess
                if (category === 'roofs') {
                    textures.push('assets/models/roofs/textures/roof_baseColor.jpeg');
                }
                
                // Default textures as fallback for any category
                textures.push('assets/textures/default_baseColor.jpeg');
                
                return textures;
            },
            
            onModelError: function(evt) {
                console.error(`Error loading model: ${this.data.modelSrc}`, evt.detail);
                clearTimeout(this.fallbackTimer);
                
                // Create a backup cube as placeholder
                this.createPlaceholder();
            },
            
            applyDefaultMaterial: function(model) {
                console.log('Applying default materials to model');
                
                // Get a vibrant default color
                const defaultColor = this.getVibrantColor();
                
                // Apply material to all meshes in the model
                model.traverse((node) => {
                    if (node.isMesh) {
                        // Create new standard material
                        const defaultMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(defaultColor),
                            metalness: 0.2,
                            roughness: 0.8,
                            emissive: defaultColor,
                            emissiveIntensity: 0.3
                        });
                        
                        // Apply material
                        node.material = defaultMaterial;
                        node.material.needsUpdate = true;
                        
                        // Enable shadows
                        node.castShadow = true;
                        node.receiveShadow = true;
                        node.visible = true;
                    }
                });
                
                // Force entire model to be visible
                model.visible = true;
                
                // Create a light attached to the model to make it stand out
                const pointLight = document.createElement('a-entity');
                pointLight.setAttribute('light', {
                    type: 'point',
                    color: '#FFFFFF',
                    intensity: 0.5,
                    distance: 5
                });
                pointLight.setAttribute('position', '0 1 0');
                this.el.appendChild(pointLight);
            },
            
            getVibrantColor: function() {
                // Use provided default color if available
                if (this.data.defaultColor && this.data.defaultColor !== '#FFFFFF') {
                    return this.data.defaultColor;
                }
                
                // Return different vibrant colors based on category
                switch(this.data.category) {
                    case 'structures': return '#FF5555';
                    case 'walls': return '#FF5555';
                    case 'floors': return '#55FF55';
                    case 'roofs': return '#5555FF';
                    case 'bathroom': return '#55FFFF';
                    case 'bedroom': return '#FF55FF';
                    case 'furniture': return '#FFFF55';
                    case 'sofa': return '#FFAA55';
                    case 'tables': return '#FFFF55';
                    case 'accessories': return '#FF55FF';
                    case 'carpets': return '#FF5555';
                    case 'villa': return '#55FFAA';
                    default: return '#FF9955';
                }
            },
            
            createPlaceholder: function() {
                // Create a colored box as placeholder for failed model
                console.log('Creating placeholder geometry for failed model');
                
                // Remove gltf-model attribute to prevent loading attempts
                this.el.removeAttribute('gltf-model');
                
                // Create a box geometry
                this.el.setAttribute('geometry', {
                    primitive: 'box',
                    width: 1,
                    height: 1,
                    depth: 1
                });
                
                // Add material with vibrant color
                const defaultColor = this.getVibrantColor();
                this.el.setAttribute('material', {
                    color: defaultColor,
                    metalness: 0.2,
                    roughness: 0.8,
                    emissive: defaultColor,
                    emissiveIntensity: 0.3
                });
                
                // Force visibility
                this.el.setAttribute('visible', true);
            }
        });
        
        console.log('Model handler component registered successfully');
    },
    
    // Apply model-handler component to all models in the scene
    applyToAllModels: function() {
        document.querySelectorAll('[gltf-model]').forEach(element => {
            const objectType = element.getAttribute('data-object-type');
            if (objectType && MODELS[objectType]) {
                const modelData = MODELS[objectType];
                
                // Add model handler component if not already present
                if (!element.hasAttribute('model-handler')) {
                    element.setAttribute('model-handler', {
                        modelSrc: element.getAttribute('gltf-model'),
                        defaultColor: modelData.materials[0] || '#FF5555',
                        modelName: objectType,
                        category: modelData.category
                    });
                }
            }
        });
    }
};

// Auto-initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    ModelHelper.init();
    
    // Apply to models periodically to catch newly created ones
    setInterval(function() {
        ModelHelper.applyToAllModels();
    }, 3000);
});