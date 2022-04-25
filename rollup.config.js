import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
	input: 'src/index.js',
	output: {
		file: 'build/index.js',
		sourcemap: true,
	},
	onwarn: function (message, warn) {
		if (message.code === 'CIRCULAR_DEPENDENCY' && /node_modules/.test(message.importer)) {
			return;
		}
		warn(message)
	},
	plugins: [
		resolve({
			browser: true,
		}),
		commonjs(),
	],
};
