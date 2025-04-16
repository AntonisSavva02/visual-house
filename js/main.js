// Initialize the application when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main app components
    const app = new FloorPlanApp();
    const cameraController = new CameraController();
    const modelsManager = new ModelsManager();
    
    // Make the models manager available to the app
    app.modelsManager = modelsManager;
    
    // Initialize components when the A-Frame scene is loaded
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', function() {
        console.log('A-Frame scene loaded');
        
        // Initialize components
        app.init();
        cameraController.init();
        
        // Add objects to window for console debugging
        window.app = app;
        window.cameraController = cameraController;
        window.modelsManager = modelsManager;
    });
});