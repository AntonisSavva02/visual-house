/**
 * Visual-House - Model Helper
 * Handles model loading, textures, and visibility issues
 * Last updated: 2025-04-23
 * Developer: AntonisSavva02
 */

const ModelHelper = {
    // Initialize model helper
    init: function() {
        // Register custom component for model loading
        this.registerModelLoaderComponent();
        this.registerEmergencyFixComponent();
        
        console.log('Model Helper initialized with emergency visibility fixes');
        
        // Apply global fixes immediately
        this.applyGlobalFixes();
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
                    mesh.material.transparent = false;
                    mesh.material.opacity = 1;
                    mesh.material.needsUpdate = true;
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
                                            console.log('Applying emergency material to mesh');
                                            node.material = new THREE.MeshStandardMaterial({
                                                color: 0xFF5555,
                                                metalness: 0.2,
                                                roughness: 0.8,
                                                emissive: 0xFF5555,
                                                emissiveIntensity: 0.3
                                            });
                                            node.visible = true;
                                        }
                                    });
                                }
                                
                                model.setAttribute('visible', true);
                            }, 100);
                        }
                    });
                }, 5000); // Every 5 seconds
                
                // Create a box to confirm rendering is working
                const testBox = document.createElement('a-box');
                testBox.setAttribute('position', '0 2 0');
                testBox.setAttribute('color', 'red');
                testBox.setAttribute('scale', '0.5 0.5 0.5');
                document.querySelector('a-scene').appendChild(testBox);
                console.log('Created test box to verify rendering');
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
                loader.load(
                    texturePath,
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
                
                // Don't try to load textures if no model name or category
                if (!this.data.modelName || !this.data.category) {
                    return textures;
                }
                
                // Map to likely texture paths based on category and model name
                const simplifiedName = this.data.modelName.replace(/[_-]/g, '');
                const basePath = `assets/textures/${this.data.category}/`;
                
                // Common texture file names (with various formats)
                const textureNames = [
                    `${this.data.modelName}_diffuse.jpg`,
                    `${this.data.modelName}_diffuse.png`,
                    `${this.data.modelName}_albedo.jpg`,
                    `${this.data.modelName}_albedo.png`,
                    `${this.data.modelName}_color.jpg`,
                    `${this.data.modelName}_color.png`,
                    `${this.data.modelName}.jpg`,
                    `${this.data.modelName}.png`,
                    `${simplifiedName}.jpg`,
                    `${simplifiedName}.png`,
                    `texture.jpg`,
                    `texture.png`,
                    `diffuse.jpg`,
                    `diffuse.png`
                ];
                
                // Build full paths
                textureNames.forEach(name => {
                    textures.push(basePath + name);
                });
                
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
                    case 'decor': return '#FF55FF';
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
                
                // Add model handler component
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