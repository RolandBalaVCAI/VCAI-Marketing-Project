import { defineConfig } from 'orval'

export default defineConfig({
  'marketing-api': {
    input: {
      target: './openapi.json',
      validation: false
    },
    output: {
      target: './src/generated/api.ts',
      schemas: './src/generated/types.ts',
      client: 'axios',
      mode: 'split',
      mock: false,
      prettier: true,
      override: {}
    }
  }
})