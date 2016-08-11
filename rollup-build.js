import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/Squid.js',
  dest: 'dist/Squid.js',
  format: 'cjs',
  sourceMap: false,
  plugins: [
    babel({
      babelrc: false,
      presets: [
        'es2015-rollup',
      ],
      plugins: [
        'transform-object-assign',
      ],
    }),
  ],
}
