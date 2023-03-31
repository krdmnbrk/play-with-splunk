const path = require('path');
const webpackMerge = require('webpack-merge');
const baseComponentConfig = require('@splunk/webpack-configs/component.config').default;

module.exports = webpackMerge(baseComponentConfig, {
    entry: {
        SigmaComponent: path.join(__dirname, 'src/SigmaComponent.jsx'),
    },
    output: {
        path: path.join(__dirname),
    },
});
