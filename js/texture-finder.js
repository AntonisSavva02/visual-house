/**
 * Visual-House - Texture Finder
 * Helps find and apply missing textures to 3D models
 * Last updated: 2025-04-23 13:55:07
 * Developer: AntonisSavva02
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Texture Finder initializing...');
    
    // Add UI components
    createControls();
    
    // Set up model tracking
    trackModelLoading();
    
    // Wait a bit for models to load before checking textures
    setTimeout(function() {
        checkModelsForTextures();
    }, 2000);
});

/**
 * Create UI controls for the texture finder
 */
function createControls() {
    // Create the main debug panel
    const debugPanel = document.createElement('div');
    debugPanel.id = 'texture-finder-panel';
    debugPanel.style.position = 'fixed';
    debugPanel.style.bottom = '20px';
    debugPanel.style.right = '20px';
    debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugPanel.style.color = 'white';
    debugPanel.style.padding = '10px';
    debugPanel.style.borderRadius = '5px';
    debugPanel.style.zIndex = '9999';
    debugPanel.style.maxWidth = '300px';
    debugPanel.style.fontSize = '12px';
    debugPanel.style.fontFamily = 'monospace';
    debugPanel.innerHTML = '<strong>Texture Finder</strong><br>Loading...';
    document.body.appendChild(debugPanel);
    
    // Create the "Find Textures" button
    const findTexturesBtn = document.createElement('button');
    findTexturesBtn.textContent = 'Find Textures';
    findTexturesBtn.style.backgroundColor = '#4CAF50';
    findTexturesBtn.style.color = 'white';
    findTexturesBtn.style.border = 'none';
    findTexturesBtn.style.padding = '5px 10px';
    findTexturesBtn.style.marginTop = '10px';
    findTexturesBtn.style.borderRadius = '3px';
    findTexturesBtn.style.cursor = 'pointer';
    findTexturesBtn.style.width = '100%';
    findTexturesBtn.style.fontWeight = 'bold';
    
    // Add event listener to find textures
    findTexturesBtn.addEventListener('click', function() {
        findTexturesForAllModels();
    });
    
    // Add button to the debug panel
    debugPanel.appendChild(document.createElement('br'));
    debugPanel.appendChild(findTexturesBtn);
    
    // Also create a "Fix Models" button
    const fixModelsBtn = document.createElement('button');
    fixModelsBtn.textContent = 'Fix Models';
    fixModelsBtn.style.backgroundColor = '#2196F3';
    fixModelsBtn.style.color = 'white';
    fixModelsBtn.style.border = 'none';
    fixModelsBtn.style.padding = '5px 10px';
    fixModelsBtn.style.marginTop = '5px';
    fixModelsBtn.style.borderRadius = '3px';
    fixModelsBtn.style.cursor = 'pointer';
    fixModelsBtn.style.width = '100%';
    fixModelsBtn.style.fontWeight = 'bold';
    
    // Add event listener to fix models
    fixModelsBtn.addEventListener('click', function() {
        fixModelVisibility();
    });
    
    // Add button to the debug panel
    debugPanel.appendChild(document.createElement('br'));
    debugPanel.appendChild(fixModelsBtn);
    
    // Update the debug panel every few seconds
    setInterval(updateDebugPanel, 2000);
}

/**
 * Update the debug panel with the latest info
 */
function updateDebugPanel() {
    const debugPanel = document.getElementById('texture-finder-panel');
    if (!debugPanel) return;
    
    // Count models
    const totalModels = document.querySelectorAll('[gltf-model]').length;
    
    // Count loaded models
    const loadedModels = document.querySelectorAll('[gltf-model][data-loaded="true"]').length;
    
    // Count models with textures
    let modelsWithTextures = 0;
    document.querySelectorAll('[gltf-model]').forEach(model => {
        const mesh = model.getObject3D('mesh');
        if (mesh) {
            let hasTextures = false;
            mesh.traverse(node => {
                if (node.isMesh && node.material) {
                    const materials = Array.isArray(node.material) ? node.material : [node.material];
                    materials.forEach(mat => {
                        if (mat && mat.map) hasTextures = true;
                    });
                }
            });
            if (hasTextures) modelsWithTextures++;
        }
    });
    
    // Update the panel content
    debugPanel.innerHTML = `
        <strong>Texture Finder</strong>
        <br>Total Models: ${totalModels}
        <br>Loaded Models: ${loadedModels}
        <br>Models with Textures: ${modelsWithTextures}
        <br>Missing Textures: ${loadedModels - modelsWithTextures}
        <br>Last Update: ${new Date().toLocaleTimeString()}
    `;
    
    // Add buttons back to the panel
    const findTexturesBtn = document.createElement('button');
    findTexturesBtn.textContent = 'Find Textures';
    findTexturesBtn.style.backgroundColor = '#4CAF50';
    findTexturesBtn.style.color = 'white';
    findTexturesBtn.style.border = 'none';
    findTexturesBtn.style.padding = '5px 10px';
    findTexturesBtn.style.marginTop = '10px';
    findTexturesBtn.style.borderRadius = '3px';
    findTexturesBtn.style.cursor = 'pointer';
    findTexturesBtn.style.width = '100%';
    findTexturesBtn.style.fontWeight = 'bold';
    findTexturesBtn.addEventListener('click', function() {
        findTexturesForAllModels();
    });
    
    const fixModelsBtn = document.createElement('button');
    fixModelsBtn.textContent = 'Fix Models';
    fixModelsBtn.style.backgroundColor = '#2196F3';
    fixModelsBtn.style.color = 'white';
    fixModelsBtn.style.border = 'none';
    fixModelsBtn.style.padding = '5px 10px';
    fixModelsBtn.style.marginTop = '5px';
    fixModelsBtn.style.borderRadius = '3px';
    fixModelsBtn.style.cursor = 'pointer';
    fixModelsBtn.style.width = '100%';
    fixModelsBtn.style.fontWeight = 'bold';
    fixModelsBtn.addEventListener('click', function() {
        fixModelVisibility();
    });
    
    debugPanel.appendChild(document.createElement('br'));
    debugPanel.appendChild(findTexturesBtn);
    debugPanel.appendChild(document.createElement('br'));
    debugPanel.appendChild(fixModelsBtn);
}

/**
 * Set up tracking for model loading
 */
function trackModelLoading() {
    // Register a component to track when models are loaded
    if (window.AFRAME) {
        AFRAME.registerComponent('model-load-tracker', {
            init: function() {
                this.el.addEventListener('model-loaded', e => {
                    console.log('Model loaded:', this.el.id || 'unnamed model');
                    this.el.setAttribute('data-loaded', 'true');
                    
                    // Check if this model has textures
                    const mesh = this.el.getObject3D('mesh');
                    if (mesh) {
                        let hasTextures = false;
                        mesh.traverse(node => {
                            if (node.isMesh && node.material) {
                                const materials = Array.isArray(node.material) ? node.material : [node.material];
                                materials.forEach(mat => {
                                    if (mat && mat.map) hasTextures = true;
                                });
                            }
                        });
                        
                        // Mark whether it has textures
                        this.el.setAttribute('data-has-textures', hasTextures ? 'true' : 'false');
                        
                        // If it doesn't have textures, add a visual indicator
                        if (!hasTextures) {
                            console.warn('Model loaded without textures:', this.el.id || 'unnamed model');
                            this.el.classList.add('missing-textures');
                        }
                    }
                });
                
                this.el.addEventListener('model-error', e => {
                    console.error('Error loading model:', this.el.id || 'unnamed model', e.detail);
                    this.el.setAttribute('data-loaded', 'error');
                });
            }
        });
        
        // Add the component to all models
        document.querySelectorAll('[gltf-model]').forEach(model => {
            if (!model.hasAttribute('model-load-tracker')) {
                model.setAttribute('model-load-tracker', '');
            }
        });
    } else {
        console.warn('A-Frame not found, model tracking disabled');
    }
}

/**
 * Check existing models for missing textures
 */
function checkModelsForTextures() {
    console.log('Checking models for textures...');
    
    const modelElements = document.querySelectorAll('[gltf-model]');
    let modelsWithTextures = 0;
    let modelsWithoutTextures = 0;
    
    modelElements.forEach(model => {
        const mesh = model.getObject3D('mesh');
        if (mesh) {
            let hasTextures = false;
            
            mesh.traverse(node => {
                if (node.isMesh && node.material) {
                    const materials = Array.isArray(node.material) ? node.material : [node.material];
                    materials.forEach(mat => {
                        if (mat && mat.map) hasTextures = true;
                    });
                }
            });
            
            if (hasTextures) {
                modelsWithTextures++;
            } else {
                modelsWithoutTextures++;
                model.classList.add('missing-textures');
            }
        }
    });
    
    console.log(`Model texture check complete: ${modelsWithTextures} with textures, ${modelsWithoutTextures} without textures`);
    
    // Show notification if models have missing textures
    if (modelsWithoutTextures > 0) {
        showNotification(`${modelsWithoutTextures} models missing textures. Click "Find Textures" to fix.`);
    }
}

/**
 * Find textures for all models that are missing them
 */
function findTexturesForAllModels() {
    showNotification('Finding textures for all models...');
    console.log('Finding textures for all models...');
    
    // Get all model elements
    const modelElements = document.querySelectorAll('[gltf-model]');
    let totalModels = modelElements.length;
    let processedModels = 0;
    let texturesFound = 0;
    
    // Process each model with a small delay between them
    modelElements.forEach((model, index) => {
        setTimeout(() => {
            // Find textures for this model
            const modelId = getModelId(model);
            const found = findTexturesForModel(model, modelId);
            if (found) texturesFound++;
            
            // Update processed count
            processedModels++;
            
            // Update notification with progress
            const progress = Math.round((processedModels / totalModels) * 100);
            showNotification(`Finding textures: ${progress}% complete (${texturesFound} found)`);
            
            // Show final notification when complete
            if (processedModels === totalModels) {
                setTimeout(() => {
                    showNotification(`Texture search complete: ${texturesFound} textures found`);
                }, 500);
            }
        }, index * 100); // Process one model every 100ms to avoid browser lag
    });
}

/**
 * Find and apply textures for a specific model
 */
function findTexturesForModel(modelElement, modelId) {
    // Skip if already has textures
    const mesh = modelElement.getObject3D('mesh');
    if (!mesh) return false;
    
    // Check if already has textures
    let hasTextures = false;
    mesh.traverse(node => {
        if (node.isMesh && node.material) {
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            materials.forEach(mat => {
                if (mat && mat.map) hasTextures = true;
            });
        }
    });
    
    // Skip if already has textures
    if (hasTextures) return false;
    
    // Get the model source to determine what type it is
    const modelSrc = modelElement.getAttribute('gltf-model');
    if (!modelSrc) return false;
    
    // Extract the model ID
    let id = modelId;
    if (!id && modelSrc.startsWith('#')) {
        id = modelSrc.substring(1);
    }
    
    // Get the model category from the source path or model ID
    let category = '';
    if (modelSrc.includes('/walls/')) category = 'walls';
    else if (modelSrc.includes('/floors/')) category = 'floors';
    else if (modelSrc.includes('/roofs/')) category = 'roofs';
    else if (modelSrc.includes('/bathroom/')) category = 'bathroom';
    else if (modelSrc.includes('/bedroom/')) category = 'bedroom';
    else if (modelSrc.includes('/accessories/')) category = 'accessories';
    else if (modelSrc.includes('/sofa/')) category = 'sofa';
    else if (modelSrc.includes('/carpets/')) category = 'carpets';
    else if (modelSrc.includes('/tables/')) category = 'tables';
    else if (id && id.includes('wall')) category = 'walls';
    else if (id && id.includes('floor')) category = 'floors';
    else if (id && id.includes('roof')) category = 'roofs';
    else if (id && (id.includes('bathroom') || id.includes('toilet'))) category = 'bathroom';
    else if (id && id.includes('bed')) category = 'bedroom';
    else if (id && id.includes('sofa')) category = 'sofa';
    else if (id && id.includes('carpet')) category = 'carpets';
    else if (id && id.includes('table')) category = 'tables';
    else category = 'accessories'; // Default category
    
    // Generate list of potential texture paths
    const texturePaths = generateTexturePaths(id, category);
    
    // Try to load textures from the list
    tryLoadTextureSequentially(mesh, texturePaths, 0);
    
    return true; // Return true to indicate we attempted to find textures
}

/**
 * Get the model ID from various attributes
 */
function getModelId(modelElement) {
    // Try data-object-type first
    let id = modelElement.getAttribute('data-object-type');
    if (id) return id;
    
    // Try regular id
    id = modelElement.id;
    if (id) return id;
    
    // Try gltf-model attribute if it starts with #
    const modelSrc = modelElement.getAttribute('gltf-model');
    if (modelSrc && modelSrc.startsWith('#')) {
        return modelSrc.substring(1);
    }
    
    // Try to extract id from the model source
    if (modelSrc && modelSrc.includes('/')) {
        const parts = modelSrc.split('/');
        const filename = parts[parts.length - 1];
        return filename.split('.')[0]; // Remove extension
    }
    
    return ''; // No id found
}

/**
 * Generate a list of potential texture paths for a model
 */
function generateTexturePaths(modelId, category) {
    const paths = [];
    
    // Base texture directories
    const baseTextureDirs = {
        'walls': 'assets/models/walls/textures/',
        'floors': 'assets/models/floors/',
        'roofs': 'assets/models/roofs/textures/',
        'bathroom': 'assets/models/bathroom/textures/',
        'bedroom': 'assets/models/bedroom/textures/',
        'accessories': 'assets/models/accessories/textures/',
        'sofa': 'assets/models/sofa/textures/',
        'carpets': 'assets/models/carpets/textures/',
        'tables': 'assets/models/tables/textures/'
    };
    
    // Common suffixes
    const suffixes = ['_baseColor.png', '_baseColor.jpeg', '_baseColor.jpg', '_diffuse.png', '_diffuse.jpeg', '_diffuse.jpg', '_color.png'];
    
    // Generate specific paths based on model ID and category
    if (modelId) {
        // Clean up the modelId for use in texture names
        const cleanId = modelId
            .replace(/[\(\)]/g, '') // Remove parentheses
            .replace(/[-_ ]/g, '_'); // Standardize separators to underscores
        
        // Add texture paths based on the model ID
        if (baseTextureDirs[category]) {
            for (const suffix of suffixes) {
                paths.push(baseTextureDirs[category] + cleanId + suffix);
            }
            
            // For floors, check specific subdirectories based on model ID
            if (category === 'floors') {
                if (modelId.includes('concrete')) {
                    paths.push('assets/models/floors/concrete_textures/floor_texture_baseColor.png');
                } else if (modelId.includes('wood')) {
                    paths.push('assets/models/floors/wood_textures/DefaultMaterial_baseColor.png');
                }
            }
        }
    }
    
    // Add known texture paths based on the category
    switch (category) {
        case 'walls':
            paths.push('assets/models/walls/textures/01_-_Plaster003_0_baseColor.jpeg');
            paths.push('assets/models/walls/textures/01_-_Plaster003_baseColor.jpeg');
            paths.push('assets/models/walls/textures/02_-_Wood006_baseColor.jpeg');
            paths.push('assets/models/walls/textures/02_-_Wood05_baseColor.png');
            paths.push('assets/models/walls/textures/07_-_Ornate_baseColor.png');
            break;
            
        case 'floors':
            paths.push('assets/models/floors/concrete_textures/floor_texture_baseColor.png');
            paths.push('assets/models/floors/wood_textures/DefaultMaterial_baseColor.png');
            break;
            
        case 'bathroom':
            paths.push('assets/models/bathroom/textures/bathroom_baseColor.png');
            paths.push('assets/models/bathroom/textures/toilet_baseColor.png');
            break;
            
        case 'sofa':
            paths.push('assets/models/sofa/textures/sofa_baseColor.png');
            paths.push('assets/models/sofa/textures/sofa1_baseColor.png');
            paths.push('assets/models/sofa/textures/sofa2_baseColor.png');
            break;
    }
    
    // Add some general fallback textures that might work for any model
    paths.push('assets/textures/default_baseColor.png');
    paths.push('assets/textures/material_baseColor.png');
    
    // For walls, we know specific textures exist
    if (category === 'walls' || modelId.includes('wall')) {
        paths.unshift('assets/models/walls/textures/01_-_Plaster003_0_baseColor.jpeg');
    }
    
    // For floors, we know specific textures exist
    if (category === 'floors' || modelId.includes('floor')) {
        if (modelId.includes('concrete')) {
            paths.unshift('assets/models/floors/concrete_textures/floor_texture_baseColor.png');
        } else if (modelId.includes('wood')) {
            paths.unshift('assets/models/floors/wood_textures/DefaultMaterial_baseColor.png');
        }
    }
    
    return paths;
}

/**
 * Try to load textures from a list of paths sequentially
 */
function tryLoadTextureSequentially(mesh, paths, index) {
    // Stop if we've tried all paths
    if (index >= paths.length) {
        console.log('No texture found after trying all paths');
        return false;
    }
    
    const path = paths[index];
    console.log(`Trying texture path: ${path}`);
    
    // Create an image to check if the texture exists
    const img = new Image();
    
    // Handle successful load
    img.onload = function() {
        console.log(`✅ Texture found: ${path}`);
        
        // Load texture with THREE.js loader
        const texture = new THREE.TextureLoader().load(path);
        
        // Create material with the texture
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            opacity: 1.0,
            side: THREE.DoubleSide,
            metalness: 0.2,
            roughness: 0.8
        });
        
        // Apply material to all meshes
        mesh.traverse(node => {
            if (node.isMesh) {
                // Apply the material
                if (Array.isArray(node.material)) {
                    // If it's an array of materials, apply to each one
                    for (let i = 0; i < node.material.length; i++) {
                        node.material[i] = material.clone();
                    }
                } else {
                    // Single material
                    node.material = material;
                }
                
                // Force update
                node.material.needsUpdate = true;
                node.visible = true;
            }
        });
        
        // Get the model element
        const modelElement = getElementByMesh(mesh);
        if (modelElement) {
            // Mark as having textures
            modelElement.setAttribute('data-has-textures', 'true');
            modelElement.classList.remove('missing-textures');
            
            // Store the successful texture path
            modelElement.setAttribute('data-texture-path', path);
        }
        
        return true;
    };
    
    // Handle load error
    img.onerror = function() {
        // Try next texture in the list
        return tryLoadTextureSequentially(mesh, paths, index + 1);
    };
    
    // Start loading
    img.src = path;
    
    return true;
}

/**
 * Get an A-Frame element by its mesh
 */
function getElementByMesh(mesh) {
    // Find all elements with gltf-model attribute
    const elements = document.querySelectorAll('[gltf-model]');
    
    // Check each element to see if it contains this mesh
    for (const element of elements) {
        const objMesh = element.getObject3D('mesh');
        if (objMesh === mesh) {
            return element;
        }
    }
    
    return null;
}

/**
 * Fix model visibility issues
 */
function fixModelVisibility() {
    showNotification('Fixing model visibility...');
    console.log('Fixing model visibility for all models');
    
    // Get all model elements
    const modelElements = document.querySelectorAll('[gltf-model]');
    
    modelElements.forEach(model => {
        // Force the model to be visible
        model.setAttribute('visible', true);
        
        // Get the mesh
        const mesh = model.getObject3D('mesh');
        if (!mesh) return;
        
        // Force mesh and all children to be visible
        mesh.visible = true;
        mesh.traverse(node => {
            if (node) {
                node.visible = true;
                
                // Fix materials
                if (node.isMesh && node.material) {
                    const materials = Array.isArray(node.material) ? node.material : [node.material];
                    
                    materials.forEach(mat => {
                        if (mat) {
                            // Fix common visibility issues
                            mat.transparent = true;
                            mat.opacity = 1.0;
                            mat.alphaTest = 0.01;
                            mat.side = THREE.DoubleSide;
                            mat.depthWrite = true;
                            mat.depthTest = true;
                            mat.needsUpdate = true;
                            
                            // If no texture, apply a default color based on model type
                            if (!mat.map) {
                                const category = getCategoryFromElement(model);
                                const color = getDefaultColorForCategory(category);
                                mat.color.set(color);
                                mat.emissive.set(color);
                                mat.emissiveIntensity = 0.2;
                            }
                        }
                    });
                }
            }
        });
    });
    
    // Show notification when complete
    showNotification('Model visibility fixed!');
}

/**
 * Get the category of a model from its element
 */
function getCategoryFromElement(element) {
    // Try to get model ID
    let id = getModelId(element);
    
    // Determine category
    if (id.includes('wall') || id.includes('Wall')) return 'walls';
    if (id.includes('floor') || id.includes('Floor')) return 'floors';
    if (id.includes('roof') || id.includes('Roof')) return 'roofs';
    if (id.includes('bathroom') || id.includes('toilet')) return 'bathroom';
    if (id.includes('bed')) return 'bedroom';
    if (id.includes('sofa') || id.includes('chair')) return 'sofa';
    if (id.includes('carpet')) return 'carpets';
    if (id.includes('table')) return 'tables';
    
    // Get category from model source
    const modelSrc = element.getAttribute('gltf-model');
    if (modelSrc) {
        if (modelSrc.includes('/walls/')) return 'walls';
        if (modelSrc.includes('/floors/')) return 'floors';
        if (modelSrc.includes('/roofs/')) return 'roofs';
        if (modelSrc.includes('/bathroom/')) return 'bathroom';
        if (modelSrc.includes('/bedroom/')) return 'bedroom';
        if (modelSrc.includes('/accessories/')) return 'accessories';
        if (modelSrc.includes('/sofa/')) return 'sofa';
        if (modelSrc.includes('/carpets/')) return 'carpets';
        if (modelSrc.includes('/tables/')) return 'tables';
    }
    
    return 'accessories'; // Default category
}

/**
 * Get a default color for a model category
 */
function getDefaultColorForCategory(category) {
    const colors = {
        'walls': '#F5F5F5',
        'floors': '#C0C0C0',
        'roofs': '#8B4513',
        'bathroom': '#FFFFFF',
        'bedroom': '#87CEFA',
        'accessories': '#A0522D',
        'sofa': '#4682B4',
        'carpets': '#CD853F',
        'tables': '#A0522D'
    };
    
    return colors[category] || '#FFFFFF';
}

/**
 * Show a notification message
 */
function showNotification(message) {
    // Find existing notification or create new one
    let notification = document.getElementById('texture-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'texture-notification';
        notification.style.position = 'fixed';
        notification.style.top = '80px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
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
}

// Define a CSS style to highlight models with missing textures
const styleEl = document.createElement('style');
styleEl.textContent = `
    .missing-textures {
        outline: 2px dashed red;
        outline-offset: 5px;
    }
`;
document.head.appendChild(styleEl);

// Create a global helper function that can be called from the console
window.findTexturesNow = function() {
    findTexturesForAllModels();
    return 'Texture search started. Check the debug panel for results.';
};

// Create a global helper function for fixing model visibility
window.fixModelsNow = function() {
    fixModelVisibility();
    return 'Model visibility fixed. Check your models now.';
};