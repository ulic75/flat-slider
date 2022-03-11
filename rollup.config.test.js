import typescript from '@rollup/plugin-typescript';
import { createFilter } from 'rollup-pluginutils';
import litcss from 'rollup-plugin-lit-css';
import { compile } from 'sass';

const external = createFilter(
  ['@open-wc/**', 'lit/**', 'sinon', 'tslib', '@web/**'],
  null,
  { resolve: false }
);

export default [
  {
    input: 'src/flat-slider.spec.ts',
    output: {
      format: 'es',
      dir: 'test',
    },
    external,
    plugins: [
      litcss({
        include: '**/*.scss',
        transform: (data, { filePath }) => compile(filePath).css.toString(),
      }),
      typescript({
        declaration: false,
        outputToFilesystem: false,
        sourceMap: false,
        inlineSources: false,
      }),
    ],
  },
];
