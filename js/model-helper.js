/**
 * Visual-House - Model Helper
 * Handles model loading, textures, and visibility issues
 * Last updated: 2025-04-23 14:50:58
 * Developer: AntonisSavva02
 */

const ModelHelper = {
    // Initialize model helper
    init: function() {
        console.log('Model Helper initializing...');
        
        // Add direct model loading and texture support
        this.setupDirectModelLoader();
        
        // Register components for model loading and visibility fixes
        this.registerModelLoaderComponent();
        this.registerEmergencyFixComponent();
        
        // Apply global fixes to THREE.js and A-Frame
        this.applyGlobalFixes();
        
        // Setup periodic model checking
        this.setupModelWatchdog();
        
        console.log('Model Helper initialized successfully');
    },
    
    // Setup a function to directly load models without relying on A-Frame's built-in loader
    setupDirectModelLoader: function() {
        if (!window.THREE || !window.THREE.GLTFLoader) {
            console.log('THREE.GLTFLoader not available yet, will retry later');
            setTimeout(() => this.setupDirectModelLoader(), 1000);
            return;
        }
        
        console.log('Setting up direct model loader using THREE.GLTFLoader');
        
        // Create a map of model IDs to their file paths
        this.modelPaths = {
            // Walls
            'blank-wall': 'assets/models/walls/blank_wall.glb',
            'wall_with_door': 'assets/models/walls/wall_with_door.glb',
            'wall_with_window': 'assets/models/walls/wall_with_window.glb',
            
            // Floors
            'concrete_floor': 'assets/models/floors/concrete_floor.gltf',
            'wood_floor': 'assets/models/floors/wood_floor.gltf',
            
            // Roofs
            'brick_roof': 'assets/models/roofs/brick_roof.gltf',
            'polygonal_roof': 'assets/models/roofs/polygonal_roof.gltf',
            'tile_roof': 'assets/models/roofs/tile_roof.gltf',
            
            // Bathroom
            'bathroom': 'assets/models/bathroom/bathroom.gltf',
            'bathroom_1': 'assets/models/bathroom/bathroom(1).gltf',
            'toilet': 'assets/models/bathroom/toilet.gltf',
            
            // Bedroom
            'bed': 'assets/models/bedroom/bed.gltf',
            
            // Accessories
            'bookshelf': 'assets/models/accessories/bookshelf.gltf',
            'house_lamp': 'assets/models/accessories/house_lamp.gltf',
            'office_desk': 'assets/models/accessories/office_desk.gltf',
            'tv': 'assets/models/accessories/tv.gltf',
            'wall_shelf': 'assets/models/accessories/wall_shelf.gltf',
            'wardrobe': 'assets/models/accessories/wardrobe.gltf',
            'washing_machine': 'assets/models/accessories/washing_machine.gltf',
            
            // Sofas
            'big_sofa_set_1': 'assets/models/sofa/big_sofa_set_1.glb',
            'small_sofa_set_1': 'assets/models/sofa/small_sofa_set_1.glb',
            'chair_sofa_set_1': 'assets/models/sofa/chair_sofa_set_1.glb',
            'sofa_set_2': 'assets/models/sofa/sofa_set_2.glb',
            'chair_sofa_set_2': 'assets/models/sofa/chair_sofa_set_2.glb',
            
            // Carpets
            'sofa_set_2_carpet': 'assets/models/carpets/sofa_set_2_carpet.glb',
            
            // Tables
            'sofa_set_2_table': 'assets/models/tables/sofa_set_2_table.glb'
        };
        
        // Create a map of texture paths for each category
        this.textureCategoryPaths = {
            'structures': [
                // Wall textures
                'assets/models/walls/textures/01_-_Plaster003_0_baseColor.jpeg',
                'assets/models/walls/textures/01_-_Plaster003_baseColor.jpeg',
                // Floor textures
                'assets/models/floors/concrete_textures/floor_texture_baseColor.png',
                'assets/models/floors/wood_textures/DefaultMaterial_baseColor.png'
            ],
            'furniture': [
                // Furniture textures
                'assets/models/bathroom/textures/bathroom_baseColor.png',
                'assets/models/bedroom/textures/bed_baseColor.png',
                'assets/models/sofa/textures/sofa_baseColor.png'
            ],
            'decor': [
                // Decor textures
                'assets/models/carpets/textures/carpet_baseColor.png'
            ]
        };
        
        // Create a direct loader function that can be called for any model
        this.directLoadModel = function(modelId, targetElement) {
            // Get path from ID
            let path = null;
            
            // If it's a direct model ID
            if (this.modelPaths[modelId]) {
                path = this.modelPaths[modelId];
            } 
            // If it starts with #, remove the # and check again
            else if (modelId.startsWith('#') && this.modelPaths[modelId.substring(1)]) {
                path = this.modelPaths[modelId.substring(1)];
            }
            
            if (!path) {
                console.error(`No path found for model ID: ${modelId}`);
                return;
            }
            
            console.log(`Directly loading model from path: ${path}`);
            
            // Create the GLTFLoader
            const loader = new THREE.GLTFLoader();
            loader.crossOrigin = 'anonymous';
            
            // Add timestamp to bust cache
            const cacheBusterPath = path + '?cb=' + Date.now();
            
            // Load the model
            loader.load(
                cacheBusterPath,
                // Success callback
                (gltf) => {
                    console.log(`Model loaded successfully: ${path}`);
                    const model = gltf.scene;
                    
                    // Apply visibility fixes
                    model.visible = true;
                    model.traverse((node) => {
                        if (node) {
                            node.visible = true;
                            
                            if (node.isMesh && node.material) {
                                let materials = Array.isArray(node.material) ? node.material : [node.material];
                                
                                let hasTexture = false;
                                materials.forEach(mat => {
                                    if (mat && mat.map) hasTexture = true;
                                });
                                
                                // If no texture, check if we need to apply one
                                if (!hasTexture) {
                                    // Get object type from element
                                    const objectType = targetElement.getAttribute('data-object-type');
                                    if (objectType && MODELS[objectType]) {
                                        const category = MODELS[objectType].category;
                                        this.applyTextureToMesh(node, category, objectType);
                                    }
                                }
                            }
                        }
                    });
                    
                    // Add model to target element
                    if (targetElement) {
                        targetElement.setObject3D('mesh', model);
                        targetElement.emit('model-loaded', {format: 'gltf', model: model});
                    }
                },
                // Progress callback
                (xhr) => {
                    console.log(`Loading ${path}: ${Math.round(xhr.loaded / xhr.total * 100)}% loaded`);
                },
                // Error callback
                (error) => {
                    console.error(`Error loading model ${path}:`, error);
                    
                    // Try with alternate extension
                    if (path.toLowerCase().endsWith('.glb')) {
                        const altPath = path.replace(/\.glb$/i, '.gltf');
                        console.log(`Trying alternate extension: ${altPath}`);
                        this.directLoadModel(altPath, targetElement);
                    } else if (path.toLowerCase().endsWith('.gltf')) {
                        const altPath = path.replace(/\.gltf$/i, '.glb');
                        console.log(`Trying alternate extension: ${altPath}`);
                        this.directLoadModel(altPath, targetElement);
                    } else {
                        // Create fallback box
                        this.createFallbackBox(targetElement, modelId);
                    }
                }
            );
        };
    },
    
    // Create a fallback box for failed models
    createFallbackBox: function(targetElement, modelId) {
        console.log(`Creating fallback box for model: ${modelId}`);
        
        // Extract object type
        let objectType = null;
        if (targetElement) {
            objectType = targetElement.getAttribute('data-object-type');
        }
        
        // Get color based on model type or use default
        let color = '#FF5555';
        if (objectType && MODELS[objectType] && MODELS[objectType].materials && MODELS[objectType].materials.length > 0) {
            color = MODELS[objectType].materials[0];
        }
        
        // Create geometry
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        // Create mesh
        const box = new THREE.Mesh(geometry, material);
        box.visible = true;
        
        // Add to element
        if (targetElement) {
            targetElement.setObject3D('mesh', box);
            targetElement.classList.add('model-fallback');
        }
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
        
        // Create our own direct model loading component that overrides gltf-model
        if (window.AFRAME) {
            // Register direct model loader component
            AFRAME.registerComponent('direct-model', {
                schema: {
                    src: {type: 'string'},
                    textureOverride: {type: 'string', default: ''}
                },
                
                init: function() {
                    this.model = null;
                    this.loader = new THREE.GLTFLoader();
                    
                    // If src is provided, load immediately
                    if (this.data.src) {
                        this.loadModel();
                    }
                },
                
                update: function(oldData) {
                    // If src changed, load new model
                    if (oldData.src !== this.data.src && this.data.src) {
                        this.loadModel();
                    }
                },
                
                loadModel: function() {
                    const src = this.data.src;
                    
                    // Skip if no source
                    if (!src) return;
                    
                    console.log(`Loading model directly: ${src}`);
                    
                    // Extract actual path - if it starts with #, resolve from modelPaths
                    let path = src;
                    if (src.startsWith('#')) {
                        const modelId = src.substring(1);
                        if (ModelHelper.modelPaths[modelId]) {
                            path = ModelHelper.modelPaths[modelId];
                        }
                    }
                    
                    // Add timestamp to bust cache
                    const cacheBusterPath = path + '?cb=' + Date.now();
                    
                    // Load model
                    this.loader.load(
                        cacheBusterPath,
                        (gltf) => {
                            console.log(`Model loaded successfully: ${path}`);
                            const model = gltf.scene;
                            
                            // Remove previous model if exists
                            if (this.model) {
                                this.el.removeObject3D('mesh');
                            }
                            
                            // Apply visibility fixes
                            model.visible = true;
                            model.traverse((node) => {
                                if (node) {
                                    node.visible = true;
                                    
                                    if (node.isMesh && node.material) {
                                        let materials = Array.isArray(node.material) ? node.material : [node.material];
                                        
                                        // Fix each material
                                        materials.forEach(mat => {
                                            if (mat) {
                                                mat.transparent = true;
                                                mat.opacity = 1.0;
                                                mat.side = THREE.DoubleSide;
                                                mat.needsUpdate = true;
                                            }
                                        });
                                    }
                                }
                            });
                            
                            // Add model to entity
                            this.el.setObject3D('mesh', model);
                            this.model = model;
                            
                            // Apply texture if needed
                            this.checkAndApplyTexture();
                            
                            // Fire loaded event
                            this.el.emit('model-loaded', {format: 'gltf', model: model});
                        },
                        undefined,
                        (error) => {
                            console.error(`Error loading model ${path}:`, error);
                            
                            // Try with alternate extension
                            if (path.toLowerCase().endsWith('.glb')) {
                                const altPath = path.replace(/\.glb$/i, '.gltf') + '?cb=' + Date.now();
                                console.log(`Trying alternate extension: ${altPath}`);
                                this.loader.load(
                                    altPath,
                                    (gltf) => {
                                        console.log(`Model loaded with alternate extension: ${altPath}`);
                                        this.el.setObject3D('mesh', gltf.scene);
                                        this.model = gltf.scene;
                                        this.checkAndApplyTexture();
                                        this.el.emit('model-loaded', {format: 'gltf', model: gltf.scene});
                                    },
                                    undefined,
                                    () => this.createFallbackBox()
                                );
                            } else if (path.toLowerCase().endsWith('.gltf')) {
                                const altPath = path.replace(/\.gltf$/i, '.glb') + '?cb=' + Date.now();
                                console.log(`Trying alternate extension: ${altPath}`);
                                this.loader.load(
                                    altPath,
                                    (gltf) => {
                                        console.log(`Model loaded with alternate extension: ${altPath}`);
                                        this.el.setObject3D('mesh', gltf.scene);
                                        this.model = gltf.scene;
                                        this.checkAndApplyTexture();
                                        this.el.emit('model-loaded', {format: 'gltf', model: gltf.scene});
                                    },
                                    undefined,
                                    () => this.createFallbackBox()
                                );
                            } else {
                                this.createFallbackBox();
                            }
                        }
                    );
                },
                
                checkAndApplyTexture: function() {
                    if (!this.model) return;
                    
                    // Check if model already has textures
                    let hasTextures = false;
                    this.model.traverse(node => {
                        if (node.isMesh && node.material) {
                            let materials = Array.isArray(node.material) ? node.material : [node.material];
                            materials.forEach(mat => {
                                if (mat && mat.map) hasTextures = true;
                            });
                        }
                    });
                    
                    // If no textures, try to apply some
                    if (!hasTextures) {
                        // Try to get object type
                        const objectType = this.el.getAttribute('data-object-type');
                        
                        if (objectType && MODELS[objectType]) {
                            const category = MODELS[objectType].category;
                            
                            // Find textures by category and type
                            const texturePaths = ModelHelper.findTexturePaths(category, objectType);
                            
                            if (texturePaths.length > 0) {
                                console.log(`Applying textures to model ${objectType}`);
                                
                                // Apply textures to all meshes
                                this.model.traverse(node => {
                                    if (node.isMesh) {
                                        ModelHelper.tryLoadTexture(node, texturePaths, 0);
                                    }
                                });
                            }
                        }
                    }
                },
                
                createFallbackBox: function() {
                    console.log('Creating fallback box for failed model');
                    
                    // Get object type color if available
                    let color = '#FF5555';
                    const objectType = this.el.getAttribute('data-object-type');
                    if (objectType && MODELS[objectType] && MODELS[objectType].materials && MODELS[objectType].materials.length > 0) {
                        color = MODELS[objectType].materials[0];
                    }
                    
                    // Create box geometry and material
                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const material = new THREE.MeshStandardMaterial({
                        color: color,
                        transparent: true,
                        opacity: 0.8
                    });
                    
                    const box = new THREE.Mesh(geometry, material);
                    
                    // Add to entity
                    this.el.setObject3D('mesh', box);
                    this.el.classList.add('model-error');
                    
                    // Emit error event
                    this.el.emit('model-error', {src: this.data.src});
                },
                
                remove: function() {
                    if (this.model) {
                        this.el.removeObject3D('mesh');
                        this.model = null;
                    }
                }
            });
            
            // Replace all gltf-model with our direct-model
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    const models = document.querySelectorAll('[gltf-model]');
                    models.forEach(model => {
                        const src = model.getAttribute('gltf-model');
                        if (src) {
                            console.log(`Replacing ${src} with direct-model component`);
                            
                            // Remove gltf-model attribute
                            model.removeAttribute('gltf-model');
                            
                            // Add our component instead
                            model.setAttribute('direct-model', {src: src});
                        }
                    });
                }, 500);
            });
            
            console.log('Registered direct-model component');
        }
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
    
    // Apply texture to a specific mesh
    applyTextureToMesh: function(mesh, category, objectType) {
        // Find texture paths
        const texturePaths = this.findTexturePaths(category, objectType);
        
        if (texturePaths.length === 0) {
            console.log(`No texture paths found for ${objectType}`);
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
        loader.crossOrigin = 'anonymous'; // Add this line
        loader.load(
            texturePath + cacheBust,
            // Success handler
            (texture) => {
                console.log(`Texture loaded successfully: ${texturePath}`);
                
                // Fix texture settings
                texture.encoding = THREE.sRGBEncoding;
                texture.flipY = false; // Important for GLB/GLTF models
                
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
    
    // Setup a watchdog to periodically check for and fix model issues
    setupModelWatchdog: function() {
        console.log('Setting up model watchdog');
        
        this.watchdogTimer = setInterval(() => {
            // First check for direct-model components
            const directModels = document.querySelectorAll('[direct-model]');
            
            // Then check for any remaining gltf-model components
            const gltfModels = document.querySelectorAll('[gltf-model]');
            
            console.log(`Checking ${directModels.length} direct-models and ${gltfModels.length} gltf-models for visibility issues`);
            
            // Process direct-models
            directModels.forEach(model => {
                // Check if model is visible
                if (model.object3D && model.object3D.visible === false) {
                    console.warn('Found invisible direct-model:', model);
                    model.object3D.visible = true;
                    
                    // Force deep visibility
                    model.object3D.traverse(node => {
                        if (node) node.visible = true;
                    });
                }
                
                // Check for textures
                const mesh = model.getObject3D('mesh');
                if (mesh) {
                    let hasTexture = false;
                    
                    mesh.traverse(node => {
                        if (node.isMesh && node.material) {
                            const materials = Array.isArray(node.material) ? node.material : [node.material];
                            materials.forEach(mat => {
                                if (mat && mat.map) hasTexture = true;
                            });
                        }
                    });
                    
                    if (!hasTexture) {
                        // Try to get object type
                        const objectType = model.getAttribute('data-object-type');
                        if (objectType && MODELS[objectType]) {
                            const category = MODELS[objectType].category;
                            
                            // Find and apply textures
                            const texturePaths = this.findTexturePaths(category, objectType);
                            if (texturePaths.length > 0) {
                                mesh.traverse(node => {
                                    if (node.isMesh) {
                                        this.tryLoadTexture(node, texturePaths, 0);
                                    }
                                });
                            }
                        }
                    }
                }
            });
            
            // Process any remaining gltf-models
            gltfModels.forEach(model => {
                // If there are still gltf-model components, convert them to direct-model
                const src = model.getAttribute('gltf-model');
                if (src) {
                    console.log(`Converting ${src} to direct-model component`);
                    model.removeAttribute('gltf-model');
                    model.setAttribute('direct-model', {src: src});
                }
            });
            
        }, 3000); // Check every 3 seconds
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
                if (this.el.hasAttribute('gltf-model')) {
                    this.el.removeAttribute('gltf-model');
                }
                
                // Remove direct-model attribute if present
                if (this.el.hasAttribute('direct-model')) {
                    this.el.removeAttribute('direct-model');
                }
                
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
                    // Check both direct-model and gltf-model elements
                    const directModels = document.querySelectorAll('[direct-model]');
                    const gltfModels = document.querySelectorAll('[gltf-model]');
                    const totalModels = directModels.length + gltfModels.length;
                    
                    console.log('Emergency fix scanning', totalModels, 'models');
                    
                    let visibleCount = 0;
                    let invisibleCount = 0;
                    let texturedCount = 0;
                    let untexturedCount = 0;
                    
                    // Process direct-models
                    directModels.forEach(model => {
                        // Fix visibility
                        if (model.object3D) {
                            model.object3D.visible = true;
                            
                            // Count visibility
                            if (model.object3D.visible) {
                                visibleCount++;
                            } else {
                                invisibleCount++;
                            }
                            
                            // Count textures
                            let hasTexture = this.checkForTextures(model.object3D);
                            if (hasTexture) {
                                texturedCount++;
                            } else {
                                untexturedCount++;
                                
                                // Try to find textures
                                const src = model.getAttribute('direct-model').src;
                                const objectType = model.getAttribute('data-object-type');
                                
                                // Force reload with cache busting
                                if (src) {
                                    const newSrc = src.includes('?') ? 
                                        `${src}&cb=${Date.now()}` : 
                                        `${src}?cb=${Date.now()}`;
                                    
                                    model.setAttribute('direct-model', 'src', newSrc);
                                }
                            }
                        }
                    });
                    
                    // Process any remaining gltf-models
                    gltfModels.forEach(model => {
                        // Convert to direct-model
                        const src = model.getAttribute('gltf-model');
                        if (src) {
                            model.removeAttribute('gltf-model');
                            model.setAttribute('direct-model', {src: src});
                        }
                    });
                    
                    // Update debug UI
                    this.updateDebugInfo({
                        total: totalModels,
                        visible: visibleCount,
                        invisible: invisibleCount,
                        textured: texturedCount,
                        untextured: untexturedCount
                    });
                }, 5000);
            },
            
            checkForTextures: function(object3D) {
                let hasTexture = false;
                
                if (!object3D) return false;
                
                object3D.traverse(node => {
                    if (node.isMesh && node.material) {
                        const materials = Array.isArray(node.material) ? node.material : [node.material];
                        materials.forEach(mat => {
                            if (mat && mat.map) {
                                hasTexture = true;
                            }
                        });
                    }
                });
                
                return hasTexture;
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
                
                // Add reload button
                const reloadButton = document.createElement('button');
                reloadButton.textContent = 'Reload Models';
                reloadButton.style.marginTop = '10px';
                reloadButton.style.padding = '5px 10px';
                reloadButton.style.background = '#4CAF50';
                reloadButton.style.color = 'white';
                reloadButton.style.border = 'none';
                reloadButton.style.borderRadius = '4px';
                reloadButton.style.cursor = 'pointer';
                reloadButton.style.display = 'block';
                reloadButton.style.width = '100%';
                
                reloadButton.addEventListener('click', () => {
                    this.reloadAllModels();
                });
                
                this.debugElement.appendChild(document.createElement('br'));
                this.debugElement.appendChild(reloadButton);
            },
            
            updateDebugInfo: function(stats) {
                if (!this.debugElement) return;
                
                let html = '<strong>Model Helper</strong><br>';
                html += `Models: ${stats.total} (${stats.visible} visible, ${stats.invisible} invisible)<br>`;
                html += `Textures: ${stats.textured} with, ${stats.untextured} without<br>`;
                
                // Set content
                this.debugElement.innerHTML = html;
                
                // Re-add the texture button
                const fixButton = document.createElement('button');
                fixButton.textContent = 'Find Textures';
                fixButton.style.marginTop = '10px';
                fixButton.style.padding = '5px 10px';
                fixButton.style.background = '#5B8BFF';
                fixButton.style.color = 'white';
                fixButton.style.border = 'none';
                fixButton.style.borderRadius = '4px';
                fixButton.style.cursor = 'pointer';
                fixButton.style.width = '100%';
                
                fixButton.addEventListener('click', () => {
                    this.manualTextureSearch();
                });
                
                // Re-add the reload button
                const reloadButton = document.createElement('button');
                reloadButton.textContent = 'Reload Models';
                reloadButton.style.marginTop = '10px';
                reloadButton.style.padding = '5px 10px';
                reloadButton.style.background = '#4CAF50';
                reloadButton.style.color = 'white';
                reloadButton.style.border = 'none';
                reloadButton.style.borderRadius = '4px';
                reloadButton.style.cursor = 'pointer';
                reloadButton.style.width = '100%';
                
                reloadButton.addEventListener('click', () => {
                    this.reloadAllModels();
                });
                
                this.debugElement.appendChild(document.createElement('br'));
                this.debugElement.appendChild(fixButton);
                this.debugElement.appendChild(document.createElement('br'));
                this.debugElement.appendChild(reloadButton);
            },
            
            manualTextureSearch: function() {
                console.log('Manual texture search initiated');
                
                // Find all models (both direct-model and gltf-model)
                const directModels = document.querySelectorAll('[direct-model]');
                const gltfModels = document.querySelectorAll('[gltf-model]');
                let foundTextures = 0;
                
                // Process direct models
                directModels.forEach(model => {
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
                            texture.flipY = false; // Important for GLTF models
                            
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
                
                // Convert any remaining gltf-models to direct-model
                gltfModels.forEach(model => {
                    const src = model.getAttribute('gltf-model');
                    if (src) {
                        model.removeAttribute('gltf-model');
                        model.setAttribute('direct-model', {src: src});
                    }
                });
                
                // Show a notification if nothing found after a timeout
                setTimeout(() => {
                    if (foundTextures === 0) {
                        this.showNotification('No textures found');
                    }
                }, 2000);
            },
            
            reloadAllModels: function() {
                console.log('Reloading all models');
                
                const directModels = document.querySelectorAll('[direct-model]');
                const gltfModels = document.querySelectorAll('[gltf-model]');
                
                // Process direct models
                directModels.forEach((model, index) => {
                    setTimeout(() => {
                        const component = model.components['direct-model'];
                        if (component && component.data.src) {
                            const src = component.data.src;
                            const newSrc = src.includes('?') ? 
                                `${src}&cb=${Date.now()}` : 
                                `${src}?cb=${Date.now()}`;
                                
                            // Force reload
                            model.setAttribute('direct-model', 'src', '');
                            setTimeout(() => {
                                model.setAttribute('direct-model', 'src', newSrc);
                            }, 50);
                        }
                    }, index * 100);
                });
                
                // Convert any gltf-models
                gltfModels.forEach(model => {
                    const src = model.getAttribute('gltf-model');
                    if (src) {
                        model.removeAttribute('gltf-model');
                        model.setAttribute('direct-model', {src: src});
                    }
                });
                
                // Show notification
                this.showNotification('Reloading all models...');
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
        
        // Process gltf-model elements
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
                
                // Try to convert to direct-model
                const src = element.getAttribute('gltf-model');
                if (src) {
                    element.removeAttribute('gltf-model');
                    element.setAttribute('direct-model', {src: src});
                }
                
                // Force visibility
                element.setAttribute('visible', 'true');
                if (element.object3D) {
                    element.object3D.visible = true;
                }
            }
        });
        
        // Process direct-model elements
        document.querySelectorAll('[direct-model]').forEach(element => {
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
    
    // Add a global helper function to reload all models
    window.reloadAllModels = function() {
        const scene = document.querySelector('a-scene');
        if (scene && scene.components['emergency-model-fix']) {
            scene.components['emergency-model-fix'].reloadAllModels();
            return 'Reloading all models...';
        } else {
            console.error('Could not find emergency-model-fix component');
            return 'Error: Could not reload models';
        }
    };
    
    // Add a global helper function to find textures
    window.findTextures = function() {
        const scene = document.querySelector('a-scene');
        if (scene && scene.components['emergency-model-fix']) {
            scene.components['emergency-model-fix'].manualTextureSearch();
            return 'Searching for textures...';
        } else {
            console.error('Could not find emergency-model-fix component');
            return 'Error: Could not search for textures';
        }
    };
});