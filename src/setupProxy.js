const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxy request: ${req.method} ${req.url} -> ${proxyReq.path}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`Proxy response: ${proxyRes.statusCode} for ${req.url}`);
      }
    })
  );
};
