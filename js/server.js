const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../')));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});