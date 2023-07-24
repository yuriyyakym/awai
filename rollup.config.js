import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

import packageJson from './package.json' assert { type: 'json' };
const name = packageJson.main.replace(/\.js$/, '');

const bundle = (config) => ({
  ...config,
  input: 'src/index.ts',
  external: (id) => !/^[./]/.test(id),
});

export default [
  bundle({
    output: [
      {
        file: `${name}.js`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `${name}.mjs`,
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [esbuild()],
  }),
  bundle({
    output: {
      file: `${name}.d.ts`,
      format: 'es',
    },
    plugins: [dts()],
  }),
];
