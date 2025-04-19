// Wait for the A-Frame scene to load before initializing
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, waiting for A-Frame scene...');
    
    // Listen for A-Frame scene loaded event
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', function() {
        console.log('A-Frame scene loaded');
        
        // Make sure APP was initialized properly
        if (typeof APP !== 'undefined' && APP.init) {
            console.log('APP module detected');
            
            // Make APP available globally for debugging
            window.APP = APP;
            
            // Initialize APP if it hasn't been already
            if (!APP.initialized) {
                console.log('Initializing APP from main.js');
                APP.initialized = true;
                APP.init();
            }
        } else {
            console.error('APP module not found or not properly initialized');
        }
    });
});