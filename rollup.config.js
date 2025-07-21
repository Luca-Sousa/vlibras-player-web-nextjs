const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const copy = require('rollup-plugin-copy');
const postcss = require('rollup-plugin-postcss');

const external = [
  'react',
  'react-dom',
  'next',
  'axios'
];

module.exports = [
  // Build principal (CommonJS)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    external,
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist',
        exclude: ['**/*.test.*', '**/*.spec.*'],
        jsx: 'react-jsx',
        target: 'es2020',
      }),
      postcss({
        extract: 'styles.css',
        minimize: true,
      }),
      copy({
        targets: [
          {
            src: 'src/target/*',
            dest: 'dist/target'
          }
        ]
      })
    ],
  },
  // Build ESM
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        exclude: ['**/*.test.*', '**/*.spec.*'],
        jsx: 'react-jsx',
        target: 'es2020',
      }),
    ],
  },
];
