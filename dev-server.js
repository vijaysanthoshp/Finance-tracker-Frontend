const express = require('express');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;
const BACKEND_PORT = 5000;

// Enable JSON parsing
app.use(express.json());

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
};

// Create proxy to backend API with error handling
const apiProxy = createProxyMiddleware({
    target: `http://localhost:${BACKEND_PORT}`,
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api'
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err.code, err.message);
        res.status(500).json({ 
            error: 'Backend Service Unavailable', 
            message: `Cannot connect to backend server at port ${BACKEND_PORT}` 
        });
    }
});

// Apply proxy middleware to all /api routes
app.use('/api', apiProxy);

// Check if build directory exists
const buildPath = path.join(__dirname, 'build');
if (!fs.existsSync(buildPath)) {
    console.error(`❌ Build directory not found at: ${buildPath}`);
    console.error('📋 Please run "npm run build-legacy" first');
    process.exit(1);
}

// Serve static files from build directory
app.use(express.static(buildPath));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        frontend: 'running',
        buildPath: buildPath,
        timestamp: new Date().toISOString() 
    });
});

// Handle React Router - serve index.html for all non-API routes
app.get('*', (req, res) => {
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({ error: 'index.html not found', path: indexPath });
    }
});

// Apply error handler
app.use(errorHandler);

// Start server with error handling
const server = app.listen(PORT, () => {
    console.log(`🚀 Finance Tracker Custom Server running at http://localhost:${PORT}`);
    console.log(`🔄 Proxying API requests to backend at http://localhost:${BACKEND_PORT}`);
    console.log(`📁 Serving build files from: ${buildPath}`);
    console.log('📱 Open your browser and navigate to the URL above');
    console.log('');
    console.log('📋 Available endpoints:');
    console.log(`   - Frontend: http://localhost:${PORT}`);
    console.log(`   - Health Check: http://localhost:${PORT}/health`);
    console.log(`   - API Proxy: http://localhost:${PORT}/api/*`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please stop the existing server or use a different port.`);
    } else {
        console.error('Server Error:', err);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});