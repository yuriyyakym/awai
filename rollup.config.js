import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

import { readFileSync } from 'fs';
const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
const name = packageJson.main.replace(/\.cjs$/, '');

const bundle = (config) => ({
  ...config,
  input: 'src/index.ts',
  external: (id) => !/^[./]/.test(id),
});

export default [
  bundle({
    output: [
      {
        file: `${name}.cjs`,
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
