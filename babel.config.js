module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    '@babel/preset-env'
  ],
  plugins: [
    '@babel/plugin-transform-private-methods',
    '@babel/plugin-transform-private-property-in-object',
  ]
}