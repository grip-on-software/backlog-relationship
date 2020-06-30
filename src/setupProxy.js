const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function(app) {
  app.use(
    `/${process.env.REACT_APP_JIRA_PATH}`,
    createProxyMiddleware({
      target: process.env.REACT_APP_JIRA_HOST,
      changeOrigin: true,
    })
  )
}