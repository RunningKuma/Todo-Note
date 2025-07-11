const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const alias = require('@rollup/plugin-alias');
const copy = require('rollup-plugin-copy');
const path = require('path');
const fs = require('fs');

module.exports = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
    sourcemap: true,
    exports: 'auto'
  },
  external: [
    // Node.js built-in modules
    'fs',
    'path',
    'crypto',
    'http',
    'https',
    'url',
    'util',
    'events',
    'stream',
    'buffer',
    'querystring',
    'os',
    'zlib',
    'net',
    'tls',

    // External dependencies that should not be bundled
    'bcrypt',
    'sqlite3',
    'express',
    'cors',
    'jsonwebtoken',
    'dotenv'
  ],
  plugins: [
    alias({
      entries: [
        { find: '@server', replacement: path.resolve(__dirname, 'src') }
      ]
    }),

    nodeResolve({
      preferBuiltins: true,
      exportConditions: ['node']
    }),

    commonjs({
      ignoreDynamicRequires: true
    }),

    json(),

    typescript({
      tsconfig: './tsconfig.build.json',
      // sourceMap: true,
      declaration: false
    }),

    copy({
      targets: [
        {
          src: 'src/templates/**/*',
          dest: 'dist/templates'
        },
        {
          src: 'database/database.sqlite',
          dest: 'dist/database'
        },
        {
          src: '.env',
          dest: 'dist'
        },
      ],
      hook: 'writeBundle'
    })
  ],

  onwarn: (warning, warn) => {
    // Suppress certain warnings
    if (warning.code === 'UNRESOLVED_IMPORT') {
      return;
    }
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      return;
    }
    warn(warning);
  }
};
