'use strict'

const autoprefixer                  = require('autoprefixer')
const path                          = require('path')
const webpack                       = require('webpack')
const HtmlWebpackPlugin             = require('html-webpack-plugin')
const CaseSensitivePathsPlugin      = require('case-sensitive-paths-webpack-plugin')
const InterpolateHtmlPlugin         = require('react-dev-utils/InterpolateHtmlPlugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const eslintFormatter               = require('react-dev-utils/eslintFormatter')
const ModuleScopePlugin             = require('react-dev-utils/ModuleScopePlugin')

const getClientEnvironment          = require('./env')
const paths                         = require('./paths')

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
const publicPath = '/'

// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
const publicUrl = ''

// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl)
let htmlReplacements = env.raw

// Read favicons html
const metaconf = require('./favicons.config.js')

htmlReplacements.META_INFORMATION = ''
try {
	htmlReplacements.META_INFORMATION = fs.readFileSync(metaconf.files_dest+metaconf.html_filename)
} catch(e) {
	htmlReplacements.META_INFORMATION = ''
}


// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
let webpack_dev_config = {
	// You may want 'eval' instead if you prefer to see the compiled output in DevTools.
	// See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
	devtool: 'cheap-module-source-map',

	// These are the "entry points" to our application.
	// This means they will be the "root" imports that are included in JS bundle.
	// The first two entry points enable "hot" CSS and auto-refreshes for JS.
	entry: [
		// Include an alternative client for WebpackDevServer. A client's job is to
		// connect to WebpackDevServer by a socket and get notified about changes.
		// When you save a file, the client will either apply hot updates (in case
		// of CSS changes), or refresh the page (in case of JS changes). When you
		// make a syntax error, this client will display a syntax error overlay.
		// Note: instead of the default WebpackDevServer client, we use a custom one
		// to bring better experience for Create React App users. You can replace
		// the line below with these two lines if you prefer the stock client:
		// require.resolve('webpack-dev-server/client') + '?/',
		// require.resolve('webpack/hot/dev-server'),
		require.resolve('react-dev-utils/webpackHotDevClient'),

		// We ship a few polyfills by default:
		require.resolve('./polyfills'),

		// Errors should be considered fatal in development
		// require.resolve('react-error-overlay'),

		// Finally, this is your app's code:
		paths.appIndexJs,

		// We include the app code last so that if there is a runtime error during
		// initialization, it doesn't blow up the WebpackDevServer client, and
		// changing JS code would still trigger a refresh.
	],
	output: {
		// Next line is not used in dev but WebpackDevServer crashes without it:
		path: paths.appBuild,

		// Add /* filename */ comments to generated require()s in the output.
		pathinfo: true,

		// This does not produce a real file. It's just the virtual path that is
		// served by WebpackDevServer in development. This is the JS bundle
		// containing code from all our entry points, and the Webpack runtime.
		filename: 'static/js/bundle.js',

		// There are also additional JS chunk files if you use code splitting.
		chunkFilename: 'static/js/[name].chunk.js',

		// This is the URL that app is served from. We use "/" in development.
		publicPath: publicPath,

		// Point sourcemap entries to original disk location
		devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath),
	},

	resolve: {
		// This allows you to set a fallback for where Webpack should look for modules.
		// We placed these paths second because we want `node_modules` to "win"
		// if there are any conflicts. This matches Node resolution mechanism.
		// https://github.com/facebookincubator/create-react-app/issues/253
		modules: ['node_modules', paths.appNodeModules].concat(
			// It is guaranteed to exist because we tweak it in `env.js`
			process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
		).concat(paths.myModules),

		// These are the reasonable defaults supported by the Node ecosystem.
		// We also include JSX as a common component filename extension to support
		// some tools, although we do not recommend using it, see:
		// https://github.com/facebookincubator/create-react-app/issues/290
		extensions: ['.js', '.json', '.tag'],
		alias: {
		},
		plugins: [
			// Prevents users from importing files from outside of src/ (or node_modules/).
			// This often causes confusion because we only process files within src/ with babel.
			// To fix this, we prevent you from importing files out of src/ -- if you'd like to,
			// please link the files into your node_modules/ and let module-resolution kick in.
			// Make sure your source files are compiled, as they will not be processed in any way.
			new ModuleScopePlugin(paths.appSrc),
		],
	},
	module: {
		strictExportPresence: true,
		rules: [
			// First, run the linter.
			// It's important to do this before Babel processes the JS.
			{
				test: /\.(js|tag)$/,
				enforce: 'pre',
				use: [
					{
						options: {
							formatter: eslintFormatter,
						},
						loader: require.resolve('eslint-loader'),
					},
				],
				include: paths.appSrc,
			},

			// ** ADDING/UPDATING LOADERS **
			// The "file" loader handles all assets unless explicitly excluded.
			// The `exclude` list *must* be updated with every change to loader extensions.
			// When adding a new loader, you must add its `test`
			// as a new entry in the `exclude` list for "file" loader.

			// "file" loader makes sure those assets get served by WebpackDevServer.
			// When you `import` an asset, you get its (virtual) filename.
			// In production, they would get copied to the `build` folder.
			{
				exclude: [
					/\.html$/,
					/\.js$/,
					/\.tag$/,
					/\.css$/,
					/\.less$/,
					/\.json$/,
					/\.svg$/,
					/\.bmp$/,
					/\.gif$/,
					/\.jpe?g$/,
					/\.png$/,
				],
				loader: require.resolve('file-loader'),
				options: {
					name: 'static/media/[name].[hash:8].[ext]',
				},
			},

			// SVG loader
			// https://github.com/webpack-contrib/svg-inline-loader
			// load svg as plain/html
			// example usage:
			//  import myiconhtml from '../icons/myicon.svg'
			//  this.root.innerHTML = require('../../icons/' + this.opts.src)
			{
				test: /\.svg$/,
				loader: 'svg-inline-loader'
			},

			// "url" loader works like "file" loader except that it embeds assets
			// smaller than specified limit in bytes as data URLs to avoid requests.
			// A missing `test` is equivalent to a match.
			{
				test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
				loader: require.resolve('url-loader'),
				options: {
					limit : 10000,
					name  : 'static/media/[name].[hash : 8].[ext]',
				},
			},


			// Riot tag compiler
			{
				test    : /\.tag$/,
				enforce : 'pre',
				include : paths.appSrc,
				exclude : /node_modules/,
				use: [{
					loader: require.resolve('riot-tag-loader'),
					options: {
						type  : 'es6',
						hot   : true,
						debug : true,
						// add here all the other riot-compiler options
						// http://riotjs.com/guide/compiler/
						// template: 'pug' for example
					}
				}]
			},

			// Process JS with Babel.
			{
				test    : /\.(js|tag)$/,
				include : paths.appSrc,
				enforce : 'post',
				loader  : require.resolve('babel-loader'),
				options: {
					presets: 'es2015-riot',
					// This is a feature of `babel-loader` for webpack (not Babel itself).
					// It enables caching results in ./node_modules/.cache/babel-loader/
					// directory for faster rebuilds.
					cacheDirectory: true,
				},
			},

			// "postcss" loader applies autoprefixer to our CSS.
			// "css" loader resolves paths in CSS and adds assets as dependencies.
			// "style" loader turns CSS into JS modules that inject <style> tags.
			// In production, we use a plugin to extract that CSS to a file, but
			// in development "style" loader enables hot editing of CSS.
			{
				test: /\.css$/,
				use: [
					require.resolve('style-loader'),
					{
						loader: require.resolve('css-loader'),
						options: {
							importLoaders: 1,
						},
					},
					{
						loader: require.resolve('postcss-loader'),
						options: {
							ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
							plugins: () => [
								require('postcss-flexbugs-fixes'),
								autoprefixer({
									browsers: [
										'>1%',
										'last 4 versions',
										'Firefox ESR',
										'not ie < 9', // React doesn't support IE8 anyway
									],
									flexbox: 'no-2009',
								}),
							],
						},
					},
				],
			},

			// ** STOP ** Are you adding a new loader?
			// Remember to add the new extension(s) to the "file" loader exclusion list.

		],
	},

	plugins: [
		new webpack.ProvidePlugin({
			riot:  'riot',
		}),

		// Makes some environment variables available in index.html.
		// The public URL is available as %PUBLIC_URL% in index.html, e.g.:
		// <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
		// In development, this will be an empty string.
		new InterpolateHtmlPlugin(htmlReplacements),

		// Generates an `index.html` file with the <script> injected.
		new HtmlWebpackPlugin({
			inject: true,
			template: paths.appHtml,
		}),

		// Add module names to factory functions so they appear in browser profiler.
		new webpack.NamedModulesPlugin(),

		// Makes some environment variables available to the JS code, for example:
		// if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
		new webpack.DefinePlugin(env.stringified),

		// This is necessary to emit hot updates (currently CSS only):
		new webpack.HotModuleReplacementPlugin(),

		// Watcher doesn't work well if you mistype casing in a path so we use
		// a plugin that prints an error when you attempt to do this.
		// See https://github.com/facebookincubator/create-react-app/issues/240
		new CaseSensitivePathsPlugin(),

		// If you require a missing module and then `npm install` it, you still have
		// to restart the development server for Webpack to discover it. This plugin
		// makes the discovery automatic so you don't have to restart.
		// See https://github.com/facebookincubator/create-react-app/issues/186
		new WatchMissingNodeModulesPlugin(paths.appNodeModules),

		// Moment.js is an extremely popular library that bundles large locale files
		// by default due to how Webpack interprets its code. This is a practical
		// solution that requires the user to opt into importing specific locales.
		// https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
		// You can remove this if you don't use Moment.js:
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
	],

	// Some libraries import Node modules but don't use them in the browser.
	// Tell Webpack to provide empty mocks for them so importing them works.
	node: {
		fs:  'empty',
		net: 'empty',
		tls: 'empty',
	},

	// Turn off performance hints during development because we don't do any
	// splitting or minification in interest of speed. These warnings become
	// cumbersome.
	performance: {
		hints: false,
	},
}


// LESS loader
if (process.env.enable_less){
	webpack_dev_config.module.rules.push({
		test: /\.less$/,
		use: [
			// creates style nodes from JS strings
			{ loader: 'style-loader' },
			// translates CSS into CommonJS
			{ loader: 'css-loader'   },
			// compiles Less to CSS
			{ loader: 'less-loader'  }
		]
	})
}


// SASS loader
if (process.env.enable_sass){
	webpack_dev_config.module.rules.push({
		test: /\.(scss|sass)$/,
		use: [
			// creates style nodes from JS strings
			{ loader: 'style-loader' },
			// translates CSS into CommonJS
			{ loader: 'css-loader'   },
			// compiles Sass to CSS
			{ loader: 'sass-loader'  }
		]
	})
}

// STYLUS loader
if (process.env.enable_stylus){
	webpack_dev_config.module.rules.push({
		test: /\.styl$/,
		use: [
			// creates style nodes from JS strings
			{ loader: 'style-loader' },
			// translates CSS into CommonJS
			{ loader: 'css-loader'   },
			// compiles stylus
			{ loader: 'stylus-loader'  }
		]
	})
}

module.exports = webpack_dev_config
