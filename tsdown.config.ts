import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  platform: 'neutral',
  sourcemap: true,
  publint: true,
  attw: { profile: 'esm-only', level: 'warn' },
})
