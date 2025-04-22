const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Serve static files silently (no logging)
app.use(express.static('./'));

// Start the server with minimal output
app.listen(port, () => {
  console.log(`Server started on port ${port}`);const express = require('express');
  const path = require('path');
  const app = express();
  const port = process.env.PORT || 8080;
  
  // Serve static files with no logging
  app.use(express.static(path.join(__dirname)));
  
  // Simple middleware to suppress any server-side console output
  app.use((req, res, next) => {
    // Skip timestamp and username logging
    next();
  });
  
  // Start the server with minimal output
  app.listen(port, () => {
    console.log(`Server started on port ${port}. Open http://localhost:${port} in your browser.`);
  });
});