import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
	input: 'src/index.js',
	output: {
		file: 'build/index.js',
		sourcemap: true,
	},
	plugins: [
		resolve({
			browser: true,
		}),
		commonjs(),
	],
};
