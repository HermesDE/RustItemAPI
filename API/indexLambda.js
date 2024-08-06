const express = require('express');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

// Middleware
app.use(express.json());

// Define a route
router.get('/items', async (req, res) =>
{
    // Replace this with your actual database query logic
    res.json({ message: 'List of items' });
});

app.use('/.netlify/functions/api', router); // Adjust path for deployment

// Export handler for Lambda
module.exports.handler = serverless(app);
