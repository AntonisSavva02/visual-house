/**
 * EasyFloor - Main initialization script
 * Handles proper A-Frame loading and initialization sequence
 */

// Wait for the A-Frame scene to load before initializing
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, waiting for A-Frame scene...');
    
    // Listen for A-Frame scene loaded event
    const scene = document.querySelector('a-scene');
    if (!scene) {
        console.error("A-Frame scene not found!");
        return;
    }
    
    // Check if we need to wait for scene loading or if it's already loaded
    if (scene.hasLoaded) {
        console.log("A-Frame scene already loaded, initializing APP...");
        initializeApp();
    } else {
        scene.addEventListener('loaded', function() {
            console.log('A-Frame scene loaded, initializing APP...');
            initializeApp();
        });
    }
    
    // Define the initialization function
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
                console.error(`Missing required element: ${el.name} (id: ${el.id})`);
            }
        });
        
        if (missingElements.length > 0) {
            console.error(`Missing required elements: ${missingElements.join(', ')}`);
        }
        
        // Make sure APP was initialized properly
        if (typeof APP !== 'undefined' && APP.init) {
            console.log('APP module detected');
            
            // Make APP available globally for debugging
            window.APP = APP;
            
            // Initialize APP if it hasn't been already
            if (!APP.initialized) {
                console.log('Initializing APP from main.js');
                APP.init();
            } else {
                console.log('APP already initialized');
            }
        } else {
            console.error('APP module not found or not properly initialized');
        }
    }
});