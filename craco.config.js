const CracoWorkboxPlugin = require('craco-workbox');

module.exports = {
  babel: {
    loaderOptions: {
      // this option lets us display the map-pin marker layer - without this it does not work: https://github.com/visgl/react-map-gl/issues/1266
      ignore: ['./node_modules/maplibre-gl/dist/maplibre-gl.js']
    }
  },
  plugins: [{
    plugin: CracoWorkboxPlugin
  }],
  webpack: {
    alias: {
      'mapbox-gl': 'maplibre-gl',
    },

  },
};