const path = require('path');
const pkg = require('../package.json');

module.exports = {
  project: {
    ios: {
      automaticPodsInstallation: true,
    },
    android: {
      packageName: 'hapticlabs.example',
    },
  },
  dependencies: {
    [pkg.name]: {
      root: path.join(__dirname, '..'),
    },
  },
};
