/**
 * Visual-House - Model Helper
 * Handles model loading, textures, and visibility issues
 * Last updated: 2025-04-23 13:07:23
 * Developer: AntonisSavva02ok
 */

const ModelHelper = {
    // Initialize model helper
    init: function() {
        console.log('Model Helper initializing...');
        
        // Register components for model loading and visibility fixes
        this.registerModelLoaderComponent();
        this.registerEmergencyFixComponent();
        
        // Apply global fixes to THREE.js and A-Frame
        this.applyGlobalFixes();
        
        // Setup periodic model checking
        this.setupModelWatchdog();
        
        console.log('Model Helper initialized successfully');
    },
    
    // Apply global fixes to A-Frame rendering
    applyGlobalFixes: function() {
        console.log('Applying global fixes to A-Frame and THREE.js');
        
        // Fix for GLTFLoader material visibility issues
        if (window.THREE && window.THREE.GLTFLoader) {
            const originalCreateMesh = THREE.GLTFLoader.prototype.createMesh;
            THREE.GLTFLoader.prototype.createMesh = function() {
                const mesh = originalCreateMesh.apply(this, arguments);
                
                // Force all materials to be visible
                if (mesh && mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(mat => {
                            if (mat) {
                                mat.transparent = true;
                                mat.opacity = 1.0;
                                mat.alphaTest = 0.01;
                                mat.side = THREE.DoubleSide;
                                mat.needsUpdate = true;
                            }
                        });
                    } else if (mesh.material) {
                        mesh.material.transparent = true;
                        mesh.material.opacity = 1.0;
                        mesh.material.alphaTest = 0.01;
                        mesh.material.side = THREE.DoubleSide;
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
        
        // Override A-Frame's material update function
        if (window.AFRAME && AFRAME.components.material) {
            const originalUpdateMaterial = AFRAME.components.material.Component.prototype.updateMaterial;
            AFRAME.components.material.Component.prototype.updateMaterial = function() {
                originalUpdateMaterial.call(this);
                
                // Ensure the material is always visible
                if (this.material) {
                    this.material.transparent = true;
                    this.material.opacity = 1.0;
                    this.material.alphaTest = 0.01;
                    this.material.side = THREE.DoubleSide;
                    this.material.needsUpdate = true;
                }
            };
            console.log('Applied Material update override');
        }
        
        // Fix for model-loaded event
        if (window.AFRAME) {
            const originalModelLoader = AFRAME.components['gltf-model'].Component.prototype.update;
            AFRAME.components['gltf-model'].Component.prototype.update = function() {
                // Store original src for troubleshooting
                const src = this.data;
                if (src) {
                    this.el.setAttribute('data-original-model-src', src);
                }
                
                // Call original update
                originalModelLoader.call(this);
                
                // Add a timeout to check if model loaded successfully
                setTimeout(() => {
                    const mesh = this.el.getObject3D('mesh');
                    if (!mesh) {
                        console.warn('Model not loaded after timeout:', src);
                        this.tryModelFixes(src);
                    }
                }, 5000);
            };
            
            // Add method to try model loading fixes
            AFRAME.components['gltf-model'].Component.prototype.tryModelFixes = function(src) {
                console.log('Attempting model load fixes for:', src);
                
                // Try adding cache busting parameter
                const cacheBustSrc = src.includes('?') ? 
                    `${src}&cb=${Date.now()}` : 
                    `${src}?cb=${Date.now()}`;
                
                // Force reload model with cache busting
                this.el.setAttribute('gltf-model', '');
                setTimeout(() => {
                    this.el.setAttribute('gltf-model', cacheBustSrc);
                }, 100);
                
                // Add backup geometry in case loading fails again
                setTimeout(() => {
                    const mesh = this.el.getObject3D('mesh');
                    if (!mesh) {
                        console.warn('Model failed to load even after retry:', src);
                        this.createBackupGeometry();
                    }
                }, 5000);
            };
            
            // Add method to create backup geometry
            AFRAME.components['gltf-model'].Component.prototype.createBackupGeometry = function() {
                console.log('Creating backup geometry for failed model');
                
                // Remove gltf-model attribute
                this.el.removeAttribute('gltf-model');
                
                // Add placeholder box
                this.el.setAttribute('geometry', {
                    primitive: 'box',
                    width: 1,
                    height: 1,
                    depth: 1
                });
                
                // Add material with vibrant color
                const objectType = this.el.getAttribute('data-object-type');
                let color = '#FF5555';
                
                if (objectType && MODELS[objectType]) {
                    // Use the first material color from model definition
                    color = MODELS[objectType].materials[0] || color;
                }
                
                this.el.setAttribute('material', {
                    color: color,
                    metalness: 0.2,
                    roughness: 0.8,
                    emissive: color,
                    emissiveIntensity: 0.3,
                });
                
                // Mark as backup
                this.el.classList.add('backup-box');
            };
            
            console.log('Applied gltf-model component overrides');
        }
    },
    
    // Setup a watchdog to periodically check for and fix model issues
    setupModelWatchdog: function() {
        console.log('Setting up model watchdog');
        
        this.watchdogTimer = setInterval(() => {
            const models = document.querySelectorAll('[gltf-model]');
            console.log(`Checking ${models.length} models for visibility issues`);
            
            models.forEach(model => {
                // Check if model is visible
                if (model.object3D && model.object3D.visible === false) {
                    console.warn('Found invisible model:', model);
                    model.object3D.visible = true;
                    
                    // Force deep visibility across all child meshes
                    model.object3D.traverse(node => {
                        if (node) {
                            node.visible = true;
                            
                            if (node.isMesh && node.material) {
                                if (Array.isArray(node.material)) {
                                    node.material.forEach(mat => {
                                        if (mat) {
                                            mat.transparent = true;
                                            mat.opacity = 1.0;
                                            mat.alphaTest = 0.01;
                                            mat.side = THREE.DoubleSide;
                                            mat.needsUpdate = true;
                                        }
                                    });
                                } else if (node.material) {
                                    node.material.transparent = true;
                                    node.material.opacity = 1.0;
                                    node.material.alphaTest = 0.01;
                                    node.material.side = THREE.DoubleSide;
                                    node.material.needsUpdate = true;
                                }
                            }
                        }
                    });
                }
                
                // Check if model has textures
                const mesh = model.getObject3D('mesh');
                if (mesh) {
                    let hasTexture = false;
                    
                    mesh.traverse(node => {
                        if (node.isMesh && node.material) {
                            const materials = Array.isArray(node.material) ? node.material : [node.material];
                            
                            materials.forEach(mat => {
                                if (mat && mat.map) {
                                    hasTexture = true;
                                }
                            });
                        }
                    });
                    
                    if (!hasTexture) {
                        // Model loaded but has no textures, try to apply textures
                        this.applyTextureToModel(model);
                    }
                }
            });
        }, 5000); // Check every 5 seconds
    },
    
    // Apply textures to a model that's missing them
    applyTextureToModel: function(modelElement) {
        const objectType = modelElement.getAttribute('data-object-type');
        if (!objectType || !MODELS[objectType]) {
            return;
        }
        
        const modelData = MODELS[objectType];
        const category = modelData.category;
        
        console.log(`Trying to apply textures to model: ${objectType} (${category})`);
        
        // Find all possible texture paths for this model
        const texturePaths = this.findTexturePaths(category, objectType);
        
        if (texturePaths.length === 0) {
            console.log(`No texture paths found for ${objectType}`);
            return;
        }
        
        // Get the model's 3D object
        const mesh = modelElement.getObject3D('mesh');
        if (!mesh) {
            return;
        }
        
        // Try loading the first texture
        this.tryLoadTexture(mesh, texturePaths, 0);
    },
    
    // Try loading textures from a list of paths
    tryLoadTexture: function(mesh, texturePaths, index) {
        if (index >= texturePaths.length) {
            console.warn('All texture paths failed, using default material');
            this.applyDefaultMaterial(mesh);
            return;
        }
        
        const texturePath = texturePaths[index];
        console.log(`Trying to load texture: ${texturePath}`);
        
        // Add cache-busting parameter to URL
        const cacheBust = `?cb=${Date.now()}`;
        
        // Use TextureLoader to load the texture
        const loader = new THREE.TextureLoader();
        loader.load(
            texturePath + cacheBust,
            // Success handler
            (texture) => {
                console.log(`Texture loaded successfully: ${texturePath}`);
                
                // Create a material with the texture
                const material = new THREE.MeshStandardMaterial({
                    map: texture,
                    metalness: 0.2,
                    roughness: 0.8,
                    transparent: true,
                    opacity: 1.0,
                    side: THREE.DoubleSide,
                });
                
                // Apply material to all meshes
                mesh.traverse((node) => {
                    if (node.isMesh) {
                        node.material = material;
                        node.material.needsUpdate = true;
                        node.visible = true;
                    }
                });
            },
            // Progress handler
            undefined,
            // Error handler
            (error) => {
                console.warn(`Error loading texture ${texturePath}:`, error);
                
                // Try next texture in list
                this.tryLoadTexture(mesh, texturePaths, index + 1);
            }
        );
    },
    
    // Apply a default material to a mesh
    applyDefaultMaterial: function(mesh) {
        console.log('Applying default colored material to mesh');
        
        // Create a default material with a vibrant color
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#FF5555'),
            metalness: 0.2,
            roughness: 0.8,
            emissive: '#FF3333',
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 1.0,
            side: THREE.DoubleSide
        });
        
        // Apply material to all sub-meshes
        mesh.traverse((node) => {
            if (node.isMesh) {
                node.material = material;
                node.material.needsUpdate = true;
                node.visible = true;
            }
        });
    },
    
    // Find appropriate texture paths based on category and type
    findTexturePaths: function(category, objectType) {
        console.log(`Finding texture paths for: ${category} / ${objectType}`);
        
        const texturePaths = [];
        
        // Wall textures - Verified actual paths in the repository
        if (category === 'structures' && objectType.includes('wall')) {
            texturePaths.push('assets/models/walls/textures/01_-_Plaster003_0_baseColor.jpeg');
            texturePaths.push('assets/models/walls/textures/01_-_Plaster003_baseColor.jpeg');
            texturePaths.push('assets/models/walls/textures/02_-_Wood006_baseColor.jpeg');
            texturePaths.push('assets/models/walls/textures/02_-_Wood05_baseColor.png');
            texturePaths.push('assets/models/walls/textures/07_-_Ornate_baseColor.png');
        }
        
        // Floor textures - Verified actual paths
        if (category === 'structures' && objectType.includes('floor')) {
            if (objectType.includes('concrete')) {
                texturePaths.push('assets/models/floors/concrete_textures/floor_texture_baseColor.png');
            }
            
            if (objectType.includes('wood')) {
                texturePaths.push('assets/models/floors/wood_textures/DefaultMaterial_baseColor.png');
            }
            
            // General floor textures as fallback
            texturePaths.push('assets/models/floors/concrete_textures/floor_texture_baseColor.png');
            texturePaths.push('assets/models/floors/wood_textures/DefaultMaterial_baseColor.png');
        }
        
        // Roof textures
        if (category === 'structures' && objectType.includes('roof')) {
            // Try standard texture naming patterns based on the object type
            const roofType = objectType.split('-')[0]; // brick, polygonal, tile
            texturePaths.push(`assets/models/roofs/textures/${roofType}_roof_baseColor.png`);
            texturePaths.push(`assets/models/roofs/textures/${roofType}_baseColor.png`);
            texturePaths.push(`assets/models/roofs/textures/roof_baseColor.png`);
        }
        
        // Villa textures
        if (category === 'structures') {
            texturePaths.push('assets/models/villa_textures/facade_baseColor.jpeg');
            texturePaths.push('assets/models/villa_textures/fdtn_baseColor.jpeg');
            texturePaths.push('assets/models/villa_textures/floor_baseColor.jpeg');
            texturePaths.push('assets/models/villa_textures/villa_fl_plan_baseColor.png');
        }
        
        // Bathroom textures
        if (category === 'furniture' && (objectType.includes('bathroom') || objectType === 'toilet')) {
            texturePaths.push(`assets/models/bathroom/textures/${objectType}_baseColor.png`);
            texturePaths.push(`assets/models/bathroom/textures/bathroom_baseColor.png`);
            texturePaths.push(`assets/models/bathroom/textures/toilet_baseColor.png`);
        }
        
        // Bedroom textures
        if (category === 'furniture' && objectType.includes('bed')) {
            texturePaths.push('assets/models/bedroom/textures/bed_baseColor.png');
            texturePaths.push('assets/models/bedroom/textures/bedding_baseColor.png');
            texturePaths.push('assets/models/bedroom/textures/bedroom_baseColor.png');
        }
        
        // Sofa textures
        if (category === 'furniture' && (objectType.includes('sofa') || objectType.includes('chair'))) {
            // Get specific sofa set number from object type
            const setMatch = objectType.match(/set[-_]?(\d+)/i);
            const setNumber = setMatch ? setMatch[1] : '';
            
            texturePaths.push(`assets/models/sofa/textures/sofa_set${setNumber}_baseColor.png`);
            texturePaths.push(`assets/models/sofa/textures/sofa_baseColor.png`);
            texturePaths.push(`assets/models/sofa/textures/fabric_baseColor.png`);
        }
        
        // Table textures
        if (category === 'furniture' && objectType.includes('table')) {
            texturePaths.push(`assets/models/tables/textures/${objectType}_baseColor.png`);
            texturePaths.push('assets/models/tables/textures/table_baseColor.png');
            texturePaths.push('assets/models/tables/textures/wood_baseColor.png');
        }
        
        // Carpet textures
        if (category === 'decor' && objectType.includes('carpet')) {
            texturePaths.push(`assets/models/carpets/textures/${objectType}_baseColor.png`);
            texturePaths.push('assets/models/carpets/textures/carpet_baseColor.png');
        }
        
        // Accessories (bookshelf, lamp, tv, office_desk, etc.)
        if ((category === 'furniture' || category === 'decor') && 
            (objectType.includes('bookshelf') || objectType.includes('lamp') || 
             objectType.includes('tv') || objectType.includes('desk') || 
             objectType.includes('shelf') || objectType.includes('wardrobe') || 
             objectType.includes('washing'))) {
            
            // Extract the basic object type without hyphens or prefixes
            const basicType = objectType.replace(/^.*-/, '');
            
            texturePaths.push(`assets/models/accessories/textures/${basicType}_baseColor.png`);
            texturePaths.push(`assets/models/accessories/textures/${objectType}_baseColor.png`);
        }
        
        // Add fallback textures that might be in the root textures directory
        texturePaths.push(`assets/textures/${objectType}_baseColor.png`);
        texturePaths.push(`assets/textures/${category}_baseColor.png`);
        texturePaths.push('assets/textures/default_baseColor.png');
        
        console.log(`Found ${texturePaths.length} potential texture paths`);
        return texturePaths;
    },
    
    // Register component to handle model loading and texture application
    registerModelLoaderComponent: function() {
        console.log('Registering model loader component');
        
        if (typeof AFRAME === 'undefined') {
            console.error('A-Frame not loaded, unable to register components');
            return;
        }
        
        // Register component for handling model loading and textures
        AFRAME.registerComponent('model-loader', {
            schema: {
                type: {type: 'string', default: ''},
                category: {type: 'string', default: ''},
                color: {type: 'string', default: '#FF5555'}
            },
            
            init: function() {
                const type = this.data.type;
                console.log(`Model loader initializing for: ${type}`);
                
                // Wait for model-loaded event
                this.el.addEventListener('model-loaded', this.onModelLoaded.bind(this));
                this.el.addEventListener('model-error', this.onModelError.bind(this));
                
                // Set up timeout for backup plan
                this.timeout = setTimeout(() => {
                    const mesh = this.el.getObject3D('mesh');
                    if (!mesh) {
                        console.warn(`Model ${type} not loaded after timeout`);
                        this.createBackupModel();
                    }
                }, 10000);
            },
            
            onModelLoaded: function(evt) {
                clearTimeout(this.timeout);
                const type = this.data.type;
                console.log(`Model loaded successfully: ${type}`);
                
                const model = evt.detail.model;
                if (!model) {
                    console.warn(`Model loaded event but no model data for: ${type}`);
                    return;
                }
                
                // Force model to be visible
                model.visible = true;
                
                // Process all meshes in the model
                model.traverse(node => {
                    if (node.isMesh) {
                        // Force visibility
                        node.visible = true;
                        
                        // Check if mesh has texture
                        const materials = Array.isArray(node.material) ? node.material : [node.material];
                        let hasTexture = false;
                        
                        materials.forEach(mat => {
                            if (mat && mat.map) {
                                hasTexture = true;
                                // Ensure texture is visible
                                mat.transparent = true;
                                mat.opacity = 1.0;
                                mat.side = THREE.DoubleSide;
                                mat.needsUpdate = true;
                            }
                        });
                        
                        // If no texture, try to load one
                        if (!hasTexture) {
                            console.log(`Model ${type} has no texture, attempting to find one`);
                            this.loadTexture(node);
                        }
                    }
                });
            },
            
            loadTexture: function(mesh) {
                const type = this.data.type;
                const category = this.data.category;
                
                // Get texture paths
                const texturePaths = ModelHelper.findTexturePaths(category, type);
                
                if (texturePaths.length === 0) {
                    console.log(`No textures found for ${type}`);
                    return;
                }
                
                // Try loading the first texture
                ModelHelper.tryLoadTexture(mesh, texturePaths, 0);
            },
            
            onModelError: function(evt) {
                clearTimeout(this.timeout);
                const type = this.data.type;
                console.error(`Error loading model: ${type}`, evt.detail);
                this.createBackupModel();
            },
            
            createBackupModel: function() {
                console.log('Creating backup model');
                
                // Remove gltf-model attribute
                this.el.removeAttribute('gltf-model');
                
                // Create a box as placeholder
                this.el.setAttribute('geometry', {
                    primitive: 'box',
                    width: 1,
                    height: 1, 
                    depth: 1
                });
                
                // Add material with color
                this.el.setAttribute('material', {
                    color: this.data.color,
                    metalness: 0.2,
                    roughness: 0.8,
                    emissive: this.data.color,
                    emissiveIntensity: 0.3
                });
                
                // Mark as backup
                this.el.classList.add('backup-box');
                
                // Add message to show on click
                this.el.setAttribute('data-error-message', `Failed to load model: ${this.data.type}`);
            },
            
            remove: function() {
                clearTimeout(this.timeout);
            }
        });
        
        console.log('Model loader component registered');
    },
    
    // Register a component to fix emergency visibility issues
    registerEmergencyFixComponent: function() {
        console.log('Registering emergency fix component');
        
        if (typeof AFRAME === 'undefined') {
            console.error('A-Frame not loaded, unable to register components');
            return;
        }
        
        // Create a component that will be added to the scene to fix model visibility globally
        AFRAME.registerComponent('emergency-model-fix', {
            init: function() {
                console.log('Emergency model fix active');
                
                // Create debug indicator in UI
                this.createDebugUI();
                
                // Force re-render all models periodically
                this.fixInterval = setInterval(() => {
                    const models = document.querySelectorAll('[gltf-model]');
                    console.log('Emergency fix scanning', models.length, 'models');
                    
                    let visibleCount = 0;
                    let invisibleCount = 0;
                    let texturedCount = 0;
                    let untexturedCount = 0;
                    
                    models.forEach(model => {
                        // Force model to be visible
                        if (model.object3D) {
                            model.object3D.visible = true;
                            
                            // Check if model is actually visible
                            if (model.object3D.visible) {
                                visibleCount++;
                            } else {
                                invisibleCount++;
                            }
                            
                            // Check for textures
                            let hasTexture = false;
                            model.object3D.traverse(node => {
                                if (node.isMesh && node.material) {
                                    const materials = Array.isArray(node.material) ? node.material : [node.material];
                                    materials.forEach(mat => {
                                        if (mat && mat.map) {
                                            hasTexture = true;
                                        }
                                    });
                                }
                            });
                            
                            if (hasTexture) {
                                texturedCount++;
                            } else {
                                untexturedCount++;
                            }
                            
                            // Force re-render by toggling attributes
                            if (!hasTexture || !model.object3D.visible) {
                                // Get the model source
                                const currentSrc = model.getAttribute('gltf-model');
                                if (currentSrc) {
                                    // Add dummy parameter to force refresh
                                    const newSrc = currentSrc.includes('?') ? 
                                        `${currentSrc}&t=${Date.now()}` : 
                                        `${currentSrc}?t=${Date.now()}`;
                                    
                                    // Toggle model to force refresh
                                    model.setAttribute('gltf-model', '');
                                    setTimeout(() => {
                                        model.setAttribute('gltf-model', newSrc);
                                    }, 50);
                                }
                            }
                        }
                    });
                    
                    // Update debug UI with counts
                    this.updateDebugInfo({
                        total: models.length,
                        visible: visibleCount,
                        invisible: invisibleCount,
                        textured: texturedCount,
                        untextured: untexturedCount
                    });
                    
                }, 5000); // Every 5 seconds
            },
            
            createDebugUI: function() {
                // Create debug indicator
                this.debugElement = document.createElement('div');
                this.debugElement.style.position = 'fixed';
                this.debugElement.style.bottom = '80px';
                this.debugElement.style.left = '20px';
                this.debugElement.style.background = 'rgba(0,0,0,0.7)';
                this.debugElement.style.color = 'white';
                this.debugElement.style.padding = '10px';
                this.debugElement.style.borderRadius = '5px';
                this.debugElement.style.fontFamily = 'monospace';
                this.debugElement.style.fontSize = '12px';
                this.debugElement.style.zIndex = '9999';
                this.debugElement.id = 'model-helper-debug';
                document.body.appendChild(this.debugElement);
                
                // Add button to find textures manually
                const fixButton = document.createElement('button');
                fixButton.textContent = 'Find Textures';
                fixButton.style.marginTop = '10px';
                fixButton.style.padding = '5px 10px';
                fixButton.style.background = '#5B8BFF';
                fixButton.style.color = 'white';
                fixButton.style.border = 'none';
                fixButton.style.borderRadius = '4px';
                fixButton.style.cursor = 'pointer';
                
                fixButton.addEventListener('click', () => {
                    this.manualTextureSearch();
                });
                
                this.debugElement.appendChild(document.createElement('br'));
                this.debugElement.appendChild(fixButton);
            },
            
            updateDebugInfo: function(stats) {
                if (!this.debugElement) return;
                
                let html = '<strong>Model Helper</strong><br>';
                html += `Models: ${stats.total} (${stats.visible} visible, ${stats.invisible} invisible)<br>`;
                html += `Textures: ${stats.textured} with, ${stats.untextured} without<br>`;
                
                // Set content
                this.debugElement.innerHTML = html;
                
                // Re-add the button
                const fixButton = document.createElement('button');
                fixButton.textContent = 'Find Textures';
                fixButton.style.marginTop = '10px';
                fixButton.style.padding = '5px 10px';
                fixButton.style.background = '#5B8BFF';
                fixButton.style.color = 'white';
                fixButton.style.border = 'none';
                fixButton.style.borderRadius = '4px';
                fixButton.style.cursor = 'pointer';
                
                fixButton.addEventListener('click', () => {
                    this.manualTextureSearch();
                });
                
                this.debugElement.appendChild(document.createElement('br'));
                this.debugElement.appendChild(fixButton);
            },
            
            manualTextureSearch: function() {
                console.log('Manual texture search initiated');
                
                const models = document.querySelectorAll('[gltf-model]');
                let foundTextures = 0;
                
                models.forEach(model => {
                    const objectType = model.getAttribute('data-object-type');
                    if (!objectType || !MODELS[objectType]) return;
                    
                    const modelData = MODELS[objectType];
                    const category = modelData.category;
                    
                    // Find all possible texture paths
                    const texturePaths = ModelHelper.findTexturePaths(category, objectType);
                    
                    // Get the model's mesh
                    const mesh = model.getObject3D('mesh');
                    if (!mesh) return;
                    
                    // Try each texture path
                    for (let i = 0; i < texturePaths.length; i++) {
                        const path = texturePaths[i];
                        
                        // Create an image element to test if texture exists
                        const img = document.createElement('img');
                        img.onload = () => {
                            console.log(`Found valid texture: ${path}`);
                            foundTextures++;
                            
                            // Apply this texture to the model
                            const texture = new THREE.TextureLoader().load(path);
                            const material = new THREE.MeshStandardMaterial({
                                map: texture,
                                transparent: true,
                                opacity: 1.0,
                                side: THREE.DoubleSide
                            });
                            
                            mesh.traverse(node => {
                                if (node.isMesh) {
                                    node.material = material;
                                    node.material.needsUpdate = true;
                                }
                            });
                            
                            // Show notification
                            this.showNotification(`Found ${foundTextures} textures`);
                        };
                        
                        img.onerror = () => {
                            // Texture doesn't exist
                        };
                        
                        // Start loading to test
                        img.src = path;
                    }
                });
                
                // Show a notification if nothing found after a timeout
                setTimeout(() => {
                    if (foundTextures === 0) {
                        this.showNotification('No textures found');
                    }
                }, 2000);
            },
            
            showNotification: function(message) {
                // Find or create notification element
                let notification = document.getElementById('model-helper-notification');
                
                if (!notification) {
                    notification = document.createElement('div');
                    notification.id = 'model-helper-notification';
                    notification.style.position = 'fixed';
                    notification.style.top = '80px';
                    notification.style.left = '50%';
                    notification.style.transform = 'translateX(-50%)';
                    notification.style.background = 'rgba(91, 139, 255, 0.9)';
                    notification.style.color = 'white';
                    notification.style.padding = '10px 20px';
                    notification.style.borderRadius = '5px';
                    notification.style.fontWeight = 'bold';
                    notification.style.zIndex = '9999';
                    notification.style.opacity = '0';
                    notification.style.transition = 'opacity 0.3s';
                    document.body.appendChild(notification);
                }
                
                // Set message and show
                notification.textContent = message;
                notification.style.opacity = '1';
                
                // Hide after 3 seconds
                setTimeout(() => {
                    notification.style.opacity = '0';
                }, 3000);
            },
            
            remove: function() {
                if (this.fixInterval) {
                    clearInterval(this.fixInterval);
                }
                
                if (this.debugElement && this.debugElement.parentNode) {
                    this.debugElement.parentNode.removeChild(this.debugElement);
                }
            }
        });
        
        // Add this component to the scene when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const scene = document.querySelector('a-scene');
                if (scene) {
                    scene.setAttribute('emergency-model-fix', '');
                    console.log('Added emergency model fix to scene');
                } else {
                    console.warn('Scene not found, could not add emergency fix component');
                }
            }, 1000);
        });
        
        console.log('Emergency fix component registered');
    },
    
    // Apply model-loader component to all models in the scene
    applyToAllModels: function() {
        console.log('Applying model-loader to all models');
        
        document.querySelectorAll('[gltf-model]').forEach(element => {
            const objectType = element.getAttribute('data-object-type');
            if (objectType && MODELS[objectType]) {
                const modelData = MODELS[objectType];
                
                // Add model-loader component if not already present
                if (!element.hasAttribute('model-loader')) {
                    element.setAttribute('model-loader', {
                        type: objectType,
                        category: modelData.category || '',
                        color: modelData.materials && modelData.materials[0] ? modelData.materials[0] : '#FF5555'
                    });
                }
                
                // Force visibility
                element.setAttribute('visible', 'true');
                if (element.object3D) {
                    element.object3D.visible = true;
                }
            }
        });
    }
};

// Auto-initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Model Helper script loaded - initializing...');
    ModelHelper.init();
    
    // Apply to models with a small delay to ensure they're created
    setTimeout(function() {
        ModelHelper.applyToAllModels();
    }, 2000);
    
    // Also periodically check for new models
    setInterval(function() {
        ModelHelper.applyToAllModels();
    }, 5000);
});