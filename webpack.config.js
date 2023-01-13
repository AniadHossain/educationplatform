const path = require('path');

module.exports = {
  entry: {
	 main: './src/Playground.js',
  },

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/js'),
    clean: true,
  },
};
