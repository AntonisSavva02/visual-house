/**
 * Visual-House - Model Helper
 * Handles model loading, textures, and visibility issues
 * Last updated: 2025-04-23 15:05:15
 * Developer: AntonisSavva02
 */

// Create ModelHelper as a global object
window.ModelHelper = {
    // Initialize model helper
    init: function() {
        console.log('Model Helper initializing...');
        
        // Make sure THREE is loaded before we try to use it
        if (!window.THREE) {
            console.error('THREE.js not loaded! Loading model helper failed.');
            this.scheduleRetry();
            return;
        }
        
        // Register essential components
        this.registerModelLoaderComponent();
        
        // Fix GLTFLoader issues
        this.patchGLTFLoader();
        
        // Setup model watching to fix visibility
        this.setupModelWatchdog();
        
        console.log('Model Helper initialized successfully');
    },
    
    // Schedule a retry if initialization fails
    scheduleRetry: function() {
        console.log('Scheduling ModelHelper retry in 1 second');
        setTimeout(() => this.init(), 1000);
    },
    
    // Patch THREE.GLTFLoader to fix visibility issues
    patchGLTFLoader: function() {
        if (!window.THREE || !window.THREE.GLTFLoader) {
            console.log('THREE.GLTFLoader not available yet, will retry later');
            setTimeout(() => this.patchGLTFLoader(), 1000);
            return;
        }
        
        console.log('Patching THREE.GLTFLoader to fix visibility issues');
        
        // Store original parse method
        const originalParse = THREE.GLTFLoader.prototype.parse;
        
        // Override parse method
        THREE.GLTFLoader.prototype.parse = function() {
            // Call original method
            const result = originalParse.apply(this, arguments);
            
            // Add our own success handler
            const originalPromise = result;
            
            // Create new promise that fixes model after loading
            const newPromise = originalPromise.then((gltf) => {
                console.log('GLTFLoader: Model loaded, applying fixes');
                
                // Fix material transparency and visibility
                if (gltf.scene) {
                    gltf.scene.traverse(function(node) {
                        // Make all objects visible
                        if (node) {
                            node.visible = true;
                            
                            // Fix materials
                            if (node.material) {
                                const materials = Array.isArray(node.material) ? node.material : [node.material];
                                
                                materials.forEach(material => {
                                    if (material) {
                                        material.transparent = true;
                                        material.opacity = 1.0;
                                        material.alphaTest = 0.01;
                                        material.side = THREE.DoubleSide;
                                        material.needsUpdate = true;
                                    }
                                });
                            }
                        }
                    });
                }
                
                return gltf;
            });
            
            return newPromise;
        };
        
        console.log('Successfully patched GLTFLoader');
    },
    
    // Register our component to handle model loading and texture application
    registerModelLoaderComponent: function() {
        if (!window.AFRAME) {
            console.error('A-Frame not loaded! Cannot register components.');
            setTimeout(() => this.registerModelLoaderComponent(), 1000);
            return;
        }
        
        console.log('Registering enhanced-model component');
        
        // Register an enhanced model loader component
        AFRAME.registerComponent('enhanced-model', {
            schema: {
                src: {type: 'string'},
                type: {type: 'string', default: ''},
                category: {type: 'string', default: ''}
            },
            
            init: function() {
                console.log('Enhanced model component initialized', this.data);
                this.model = null;
                this.loaded = false;
                
                // Listen for model-loaded event
                this.el.addEventListener('model-loaded', this.onModelLoaded.bind(this));
                
                // Set timeout for backup plan
                this.timeout = setTimeout(() => {
                    if (!this.loaded) {
                        console.warn('Model load timeout, retrying with direct loader');
                        this.loadModelDirectly();
                    }
                }, 5000);
                
                // Set the original gltf-model attribute
                if (this.data.src) {
                    console.log('Setting gltf-model attribute to:', this.data.src);
                    this.el.setAttribute('gltf-model', this.data.src);
                    
                    // Keep track of what we're trying to load
                    this.el.setAttribute('data-model-src', this.data.src);
                }
            },
            
            update: function(oldData) {
                // If src changed, update the model
                if (oldData.src !== this.data.src && this.data.src) {
                    console.log('Enhanced model src changed, updating');
                    this.el.setAttribute('gltf-model', this.data.src);
                }
            },
            
            onModelLoaded: function(evt) {
                clearTimeout(this.timeout);
                this.loaded = true;
                this.model = evt.detail.model || this.el.getObject3D('mesh');
                
                if (!this.model) {
                    console.warn('Model loaded event fired but no model data received');
                    return;
                }
                
                console.log('Model loaded successfully in enhanced-model');
                
                // Make the model visible
                this.model.visible = true;
                
                // Fix all meshes and materials
                this.model.traverse(node => {
                    if (!node) return;
                    
                    // Make everything visible
                    node.visible = true;
                    
                    if (node.isMesh) {
                        // Fix mesh materials
                        const materials = Array.isArray(node.material) ? node.material : [node.material];
                        
                        materials.forEach(mat => {
                            if (mat) {
                                mat.transparent = true;
                                mat.opacity = 1.0;
                                mat.alphaTest = 0.01;
                                mat.side = THREE.DoubleSide;
                                mat.needsUpdate = true;
                            }
                        });
                        
                        // Check if mesh has texture
                        let hasTexture = false;
                        
                        materials.forEach(mat => {
                            if (mat && mat.map) {
                                hasTexture = true;
                            }
                        });
                        
                        // If no texture, try to add one
                        if (!hasTexture && this.data.type && window.MODELS && MODELS[this.data.type]) {
                            this.tryApplyTexture(node);
                        }
                    }
                });
            },
            
            tryApplyTexture: function(mesh) {
                const objectType = this.data.type;
                if (!objectType || !MODELS[objectType]) return;
                
                const modelData = MODELS[objectType];
                const category = modelData.category || this.data.category;
                
                console.log(`Trying to apply texture for ${objectType} (${category})`);
                
                // Find possible textures
                const texturePaths = this.findTexturePaths(category, objectType);
                
                if (texturePaths.length === 0) {
                    console.log('No texture paths found');
                    return;
                }
                
                // Try loading the first texture
                this.tryLoadTexture(mesh, texturePaths, 0);
            },
            
            findTexturePaths: function(category, objectType) {
                const texturePaths = [];
                
                // Structure textures
                if (category === 'structures') {
                    if (objectType.includes('wall')) {
                        texturePaths.push('assets/models/walls/textures/01_-_Plaster003_0_baseColor.jpeg');
                        texturePaths.push('assets/models/walls/textures/01_-_Plaster003_baseColor.jpeg');
                    }
                    
                    if (objectType.includes('floor')) {
                        if (objectType.includes('concrete')) {
                            texturePaths.push('assets/models/floors/concrete_textures/floor_texture_baseColor.png');
                        }
                        
                        if (objectType.includes('wood')) {
                            texturePaths.push('assets/models/floors/wood_textures/DefaultMaterial_baseColor.png');
                        }
                    }
                    
                    if (objectType.includes('roof')) {
                        const roofType = objectType.split('-')[0]; // brick, polygonal, tile
                        texturePaths.push(`assets/models/roofs/textures/${roofType}_roof_baseColor.png`);
                    }
                }
                
                // Furniture textures
                if (category === 'furniture') {
                    if (objectType.includes('bathroom') || objectType === 'toilet') {
                        texturePaths.push('assets/models/bathroom/textures/bathroom_baseColor.png');
                    }
                    
                    if (objectType.includes('bed')) {
                        texturePaths.push('assets/models/bedroom/textures/bed_baseColor.png');
                    }
                    
                    if (objectType.includes('sofa') || objectType.includes('chair')) {
                        texturePaths.push('assets/models/sofa/textures/sofa_baseColor.png');
                    }
                    
                    if (objectType.includes('table')) {
                        texturePaths.push('assets/models/tables/textures/table_baseColor.png');
                    }
                }
                
                // Decor textures
                if (category === 'decor') {
                    if (objectType.includes('carpet')) {
                        texturePaths.push('assets/models/carpets/textures/carpet_baseColor.png');
                    }
                }
                
                // Add fallback textures
                texturePaths.push('assets/textures/default_baseColor.png');
                
                return texturePaths;
            },
            
            tryLoadTexture: function(mesh, texturePaths, index) {
                if (index >= texturePaths.length) {
                    console.warn('All texture paths failed, using default material');
                    this.applyDefaultMaterial(mesh);
                    return;
                }
                
                const texturePath = texturePaths[index];
                console.log(`Trying to load texture: ${texturePath}`);
                
                // Use TextureLoader to load the texture
                const loader = new THREE.TextureLoader();
                loader.crossOrigin = 'anonymous';
                
                loader.load(
                    texturePath,
                    (texture) => {
                        console.log(`Texture loaded successfully: ${texturePath}`);
                        
                        texture.flipY = false;
                        
                        // Create a material with the texture
                        const material = new THREE.MeshStandardMaterial({
                            map: texture,
                            metalness: 0.2,
                            roughness: 0.8,
                            transparent: true,
                            opacity: 1.0,
                            side: THREE.DoubleSide
                        });
                        
                        // Apply material
                        if (mesh.isMesh) {
                            mesh.material = material;
                            mesh.material.needsUpdate = true;
                        } else {
                            mesh.traverse((node) => {
                                if (node.isMesh) {
                                    node.material = material;
                                    node.material.needsUpdate = true;
                                }
                            });
                        }
                    },
                    undefined,
                    () => {
                        console.warn(`Failed to load texture: ${texturePath}, trying next`);
                        this.tryLoadTexture(mesh, texturePaths, index + 1);
                    }
                );
            },
            
            applyDefaultMaterial: function(mesh) {
                const color = '#FF5555';
                const material = new THREE.MeshStandardMaterial({
                    color: color,
                    metalness: 0.2,
                    roughness: 0.8,
                    transparent: true,
                    opacity: 1.0,
                    side: THREE.DoubleSide
                });
                
                // Apply material
                if (mesh.isMesh) {
                    mesh.material = material;
                    mesh.material.needsUpdate = true;
                } else {
                    mesh.traverse((node) => {
                        if (node.isMesh) {
                            node.material = material;
                            node.material.needsUpdate = true;
                        }
                    });
                }
            },
            
            loadModelDirectly: function() {
                // Get the model source
                const src = this.data.src;
                if (!src) return;
                
                // Extract the model ID if it's a reference
                let modelId = src;
                if (src.startsWith('#')) {
                    modelId = src.substring(1);
                }
                
                // Try to find the asset URL
                const assetEl = document.getElementById(modelId);
                if (!assetEl) {
                    console.error(`Could not find asset element with ID ${modelId}`);
                    this.createBackupBox();
                    return;
                }
                
                // Get the actual URL
                const url = assetEl.getAttribute('src');
                if (!url) {
                    console.error(`Asset element ${modelId} has no src attribute`);
                    this.createBackupBox();
                    return;
                }
                
                console.log(`Direct loading model: ${url}`);
                
                // Create a loader
                const loader = new THREE.GLTFLoader();
                loader.crossOrigin = 'anonymous';
                
                // Load the model
                loader.load(url, 
                    (gltf) => {
                        console.log('Direct model load success');
                        
                        // Set the object
                        this.el.removeObject3D('mesh');
                        this.el.setObject3D('mesh', gltf.scene);
                        
                        // Save the reference and mark as loaded
                        this.model = gltf.scene;
                        this.loaded = true;
                        
                        // Fix visibility
                        gltf.scene.visible = true;
                        gltf.scene.traverse(node => {
                            if (!node) return;
                            node.visible = true;
                        });
                        
                        // Emit the loaded event
                        this.el.emit('model-loaded', {format: 'gltf', model: gltf.scene});
                    },
                    undefined,
                    (error) => {
                        console.error('Direct model loading failed', error);
                        this.createBackupBox();
                    }
                );
            },
            
            createBackupBox: function() {
                console.log('Creating backup box');
                
                // Get color
                let color = '#FF5555';
                const objectType = this.data.type;
                if (objectType && MODELS && MODELS[objectType] && MODELS[objectType].materials && MODELS[objectType].materials.length > 0) {
                    color = MODELS[objectType].materials[0];
                }
                
                // Remove gltf-model
                this.el.removeAttribute('gltf-model');
                
                // Add box geometry
                this.el.setAttribute('geometry', {primitive: 'box', width: 1, height: 1, depth: 1});
                
                // Add material
                this.el.setAttribute('material', {color: color});
                
                // Mark as backup
                this.el.classList.add('backup-box');
            },
            
            remove: function() {
                clearTimeout(this.timeout);
            }
        });
        
        // Create improved error handling for standard gltf-model component
        const originalGltfModel = AFRAME.components['gltf-model'];
        if (originalGltfModel) {
            // Patch update method to add error handling
            const originalUpdate = originalGltfModel.Component.prototype.update;
            originalGltfModel.Component.prototype.update = function(oldData) {
                if (oldData !== this.data) {
                    console.log('GLTF Model update', this.data);
                }
                
                // Force crossorigin on model loading
                const originalLoader = this.loader;
                if (originalLoader) {
                    originalLoader.crossOrigin = 'anonymous';
                }
                
                // Call original update
                return originalUpdate.apply(this, arguments);
            };
            
            console.log('Patched gltf-model component for better error handling');
        }
        
        // Register a component to apply to the scene to help with model fixes
        AFRAME.registerComponent('model-fixer', {
            init: function() {
                console.log('Model fixer component initializing');
                
                // Initialize stats
                this.stats = {
                    total: 0,
                    loaded: 0,
                    failed: 0,
                    fixed: 0
                };
                
                // Create debug UI
                this.createDebugUI();
                
                // Set up interval to check and fix models
                this.checkInterval = setInterval(() => this.checkModels(), 3000);
            },
            
            checkModels: function() {
                // Find all model elements
                const gltfModels = document.querySelectorAll('[gltf-model]');
                const enhancedModels = document.querySelectorAll('[enhanced-model]');
                const backupBoxes = document.querySelectorAll('.backup-box');
                
                // Count stats
                this.stats.total = gltfModels.length + enhancedModels.length;
                this.stats.failed = backupBoxes.length;
                
                // Update the UI
                this.updateDebugUI();
                
                // Process gltf-model elements that aren't already enhanced
                gltfModels.forEach(model => {
                    if (!model.hasAttribute('enhanced-model')) {
                        // Get the gltf-model source
                        const src = model.getAttribute('gltf-model');
                        
                        // Get object type if available
                        const objectType = model.getAttribute('data-object-type');
                        
                        // Add the enhanced-model component
                        if (src) {
                            console.log(`Adding enhanced-model to existing gltf-model: ${src}`);
                            model.setAttribute('enhanced-model', {
                                src: src,
                                type: objectType || ''
                            });
                            
                            this.stats.fixed++;
                        }
                    }
                });
            },
            
            createDebugUI: function() {
                // Create debug panel
                this.debugPanel = document.createElement('div');
                this.debugPanel.style.position = 'fixed';
                this.debugPanel.style.bottom = '10px';
                this.debugPanel.style.left = '10px';
                this.debugPanel.style.background = 'rgba(0,0,0,0.7)';
                this.debugPanel.style.color = 'white';
                this.debugPanel.style.padding = '10px';
                this.debugPanel.style.borderRadius = '5px';
                this.debugPanel.style.fontFamily = 'monospace';
                this.debugPanel.style.fontSize = '12px';
                this.debugPanel.style.zIndex = '9999';
                document.body.appendChild(this.debugPanel);
                
                // Update initial UI
                this.updateDebugUI();
            },
            
            updateDebugUI: function() {
                if (!this.debugPanel) return;
                
                // Create content
                let html = '<strong>Visual-House Model Helper</strong><br>';
                html += `Models: ${this.stats.total} (${this.stats.loaded} loaded, ${this.stats.failed} failed)<br>`;
                html += `Fixed: ${this.stats.fixed}<br>`;
                
                // Add buttons
                html += '<button id="fixModelsBtn" style="background:#5B8BFF;color:white;border:none;padding:5px 10px;border-radius:4px;width:100%;margin-top:5px;cursor:pointer;">Fix All Models</button>';
                html += '<button id="reloadPageBtn" style="background:#4CAF50;color:white;border:none;padding:5px 10px;border-radius:4px;width:100%;margin-top:5px;cursor:pointer;">Reload Page</button>';
                
                // Set the HTML
                this.debugPanel.innerHTML = html;
                
                // Add button handlers
                const fixBtn = document.getElementById('fixModelsBtn');
                if (fixBtn) {
                    fixBtn.addEventListener('click', () => this.fixAllModels());
                }
                
                const reloadBtn = document.getElementById('reloadPageBtn');
                if (reloadBtn) {
                    reloadBtn.addEventListener('click', () => window.location.reload());
                }
            },
            
            fixAllModels: function() {
                // Find all model elements that might need fixing
                const gltfModels = document.querySelectorAll('[gltf-model]');
                const assetItems = document.querySelectorAll('a-asset-item');
                
                // Add crossOrigin to all asset items
                assetItems.forEach(item => {
                    item.setAttribute('crossorigin', 'anonymous');
                });
                
                // Fix all gltf-models
                gltfModels.forEach(model => {
                    const src = model.getAttribute('gltf-model');
                    
                    if (src) {
                        // Temporarily remove and re-add the model to force a reload
                        model.removeAttribute('gltf-model');
                        
                        // Get object type if available
                        const objectType = model.getAttribute('data-object-type');
                        
                        // Add enhanced model if not already present
                        if (!model.hasAttribute('enhanced-model')) {
                            model.setAttribute('enhanced-model', {
                                src: src,
                                type: objectType || ''
                            });
                        }
                        
                        // Re-add gltf-model after a short delay
                        setTimeout(() => {
                            model.setAttribute('gltf-model', src);
                        }, 100);
                    }
                });
                
                // Update stats
                this.stats.fixed += gltfModels.length;
                this.updateDebugUI();
            },
            
            remove: function() {
                if (this.checkInterval) {
                    clearInterval(this.checkInterval);
                }
                
                if (this.debugPanel && this.debugPanel.parentNode) {
                    this.debugPanel.parentNode.removeChild(this.debugPanel);
                }
            }
        });
        
        console.log('Model helper components registered successfully');
    },
    
    // Check and fix existing models
    setupModelWatchdog: function() {
        console.log('Setting up model watchdog');
        
        // Wait for scene to be ready
        this.waitForScene()
            .then(scene => {
                console.log('Scene ready, adding model-fixer component');
                scene.setAttribute('model-fixer', '');
            })
            .catch(err => {
                console.error('Error adding model-fixer to scene:', err);
            });
    },
    
    // Utility to wait for scene to be ready
    waitForScene: function() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 20;
            
            const checkScene = () => {
                const scene = document.querySelector('a-scene');
                if (scene) {
                    if (scene.hasLoaded) {
                        resolve(scene);
                    } else {
                        scene.addEventListener('loaded', () => resolve(scene), {once: true});
                    }
                } else {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        reject(new Error('Scene not found after maximum attempts'));
                    } else {
                        setTimeout(checkScene, 500);
                    }
                }
            };
            
            checkScene();
        });
    },
    
    // Fix all models on the page
    fixAllModels: function() {
        console.log('Fixing all models');
        
        // Find scene
        const scene = document.querySelector('a-scene');
        if (scene && scene.components['model-fixer']) {
            scene.components['model-fixer'].fixAllModels();
            return true;
        }
        
        console.warn('Could not find model-fixer component to fix models');
        return false;
    },
    
    // Convert any old-style model to enhanced model
    convertToEnhanced: function(element) {
        if (!element) return false;
        
        // Check if it's a gltf-model
        if (element.hasAttribute('gltf-model')) {
            const src = element.getAttribute('gltf-model');
            const objectType = element.getAttribute('data-object-type');
            
            if (src) {
                // Add enhanced-model component
                element.setAttribute('enhanced-model', {
                    src: src,
                    type: objectType || ''
                });
                
                return true;
            }
        }
        
        return false;
    }
};

// Auto-initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('ModelHelper: DOM ready, initializing...');
    
    // Wait for A-Frame to be ready
    if (window.AFRAME) {
        console.log('A-Frame found, initializing ModelHelper');
        ModelHelper.init();
    } else {
        console.log('A-Frame not found yet, waiting...');
        document.addEventListener('aframe-loaded', function() {
            console.log('A-Frame loaded event fired, initializing ModelHelper');
            ModelHelper.init();
        });
        
        // Fallback in case aframe-loaded event doesn't fire
        setTimeout(function() {
            if (window.AFRAME && !ModelHelper.initialized) {
                console.log('A-Frame found after timeout, initializing ModelHelper');
                ModelHelper.init();
            }
        }, 2000);
    }
    
    // Add a global function for access from other scripts
    window.fixAllModels = function() {
        return ModelHelper.fixAllModels();
    };
});