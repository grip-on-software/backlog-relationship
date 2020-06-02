const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function(app) {
  app.use(
    "/jira",
    createProxyMiddleware({
      target: "http://jira.example",
      changeOrigin: true,
    })
  )
}