// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); //  requests from other origins
app.use(express.json()); // parse JSON in request bodies
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
// Simple root route
app.get('/', (req, res) => {
  res.send('<h1>Strady Backend is Running! 🚀  http://localhost:5001/api-docs</h1>');
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    app.listen(PORT, () => {
      console.log(`Server is listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Connection to MongoDB failed!', error.message);
  });