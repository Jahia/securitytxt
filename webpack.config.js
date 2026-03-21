const path = require('path');

module.exports = (env, argv) => ({
    entry: {
        main: path.resolve(__dirname, 'src/javascript/apps/index')
    },
    output: {
        path: path.resolve(__dirname, 'src/main/resources/javascript/apps'),
        filename: 'securitytxt.bundle.js',
        chunkFilename: '[id].securitytxt.[chunkhash:6].js'
    },
    resolve: {
        extensions: ['.mjs', '.jsx', '.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [path.join(__dirname, 'src/javascript')],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: { chrome: '80', firefox: '75' } }],
                            '@babel/preset-react'
                        ]
                    }
                }
            }
        ]
    },
    // Use Jahia admin's globally provided libraries to avoid version conflicts
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'react-i18next': 'reactI18next',
        '@jahia/ui-extender': 'jahiaUiExtender',
        '@jahia/moonstone': 'moonstone'
    },
    devtool: argv && argv.mode === 'production' ? 'source-map' : 'eval-source-map'
});
