// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { createFilter } from 'rollup-pluginutils';
import litcss from 'rollup-plugin-lit-css';
import { terser } from 'rollup-plugin-terser';
import { compile } from 'sass';

const external = createFilter(['tslib', 'lit/**'], null, { resolve: false });

export default [
  {
    input: 'src/flat-slider.ts',
    output: [
      { file: './dist/flat-slider.bundle.js', compact: true },
      { file: './dist/flat-slider.cjs', format: 'cjs', compact: true },
    ],
    plugins: [
      litcss({
        uglify: true,
        include: '**/*.scss',
        transform: (data, { filePath }) => compile(filePath).css.toString(),
      }),
      nodeResolve(),
      typescript({
        outputToFilesystem: true,
      }),
      terser(),
    ],
  },
  {
    input: 'src/flat-slider.ts',
    output: {
      dir: './dist',
      format: 'es',
      sourcemap: true,
    },
    external,
    watch: {
      clearScreen: false,
    },
    plugins: [
      litcss({
        include: '**/*.scss',
        transform: (data, { filePath }) => compile(filePath).css.toString(),
      }),
      typescript({
        outputToFilesystem: false,
        declaration: true,
        declarationDir: 'dist',
        removeComments: true,
        sourceMap: true,
        inlineSourceMap: true,
        exclude: ['**/*.spec.ts'],
      }),
    ],
  },
];
