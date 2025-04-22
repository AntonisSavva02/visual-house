/**
 * EasyFloor - Main initialization
 * Handles application startup and ensures proper A-Frame initialization
 */

// Wait for the DOM and A-Frame scene to load before initializing
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, waiting for A-Frame scene...');
    
    // Listen for A-Frame scene loaded event
    const scene = document.querySelector('a-scene');
    if (!scene) {
        console.error("A-Frame scene not found!");
        return;
    }
    
    // Debug any click events to help diagnose button issues
    document.addEventListener('click', function(e) {
        console.log('Click detected on:', e.target);
        console.log('Element ID:', e.target.id);
        console.log('Element classes:', e.target.className);
    }, true);
    
    // This is critical - wait for A-Frame to be fully ready
    if (scene.hasLoaded) {
        console.log("A-Frame scene already loaded, initializing APP...");
        initializeApp();
    } else {
        scene.addEventListener('loaded', function() {
            console.log("A-Frame scene loaded, initializing APP...");
            initializeApp();
        });
    }
    
    function initializeApp() {
        // Check for missing elements
        const requiredElements = [
            { id: 'house-container', name: 'House Container' },
            { id: 'grid', name: 'Grid' },
            { id: 'placement-indicator', name: 'Placement Indicator' },
            { id: 'placement-controls', name: 'Placement Controls' },
            { id: 'placement-guide', name: 'Placement Guide' },
            { id: 'notification', name: 'Notification' }
        ];
        
        const missingElements = [];
        requiredElements.forEach(el => {
            if (!document.getElementById(el.id)) {
                missingElements.push(el.name);
                console.error(`Missing required element: ${el.name} (ID: ${el.id})`);
            }
        });
        
        if (missingElements.length > 0) {
            console.error(`Missing required elements: ${missingElements.join(', ')}`);
        }
        
        // Check if APP global object exists
        if (typeof APP === 'undefined') {
            console.error('APP module not found!');
            return;
        }
        
        // Check if MODELS is properly loaded
        if (typeof MODELS === 'undefined' || Object.keys(MODELS).length === 0) {
            console.error('MODELS not properly loaded or empty');
        } else {
            console.log(`MODELS loaded with ${Object.keys(MODELS).length} models`);
        }
        
        // Check if CollisionManager is properly loaded
        if (typeof CollisionManager === 'undefined' || !CollisionManager.init) {
            console.error('CollisionManager not properly loaded');
        } else {
            console.log('CollisionManager loaded');
        }
        
        // Check if CameraController is properly loaded
        if (typeof CameraController === 'undefined' || !CameraController.init) {
            console.error('CameraController not properly loaded');
        } else {
            console.log('CameraController loaded');
        }
        
        // Initialize APP if it hasn't been already
        if (!APP.initialized) {
            console.log('Initializing APP from main.js');
            APP.init();
            
            // Make APP available globally for debugging
            window.APP = APP;
            
            // Add helper functions for testing in console
            console.log('Type APP.testButtons() to check button functionality');
            console.log('Type APP.testModels() to check model availability');
        } else {
            console.log('APP was already initialized');
        }
    }
});

// Add this debug script to check for model loading issues
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up model loading debug...');
    
    // Debug asset loading
    document.querySelectorAll('a-asset-item').forEach(asset => {
        console.log(`Asset: ${asset.id}, src: ${asset.getAttribute('src')}`);
        
        asset.addEventListener('error', function(e) {
            console.error(`Error loading asset ${asset.id} from ${asset.getAttribute('src')}`, e);
        });
        