module.exports = {
  transpileDependencies: [],
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  
  devServer: {
    port: 8080,
    host: 'localhost'
  },
  
  lintOnSave: false // Disable ESLint during development
}