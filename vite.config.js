import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import rehypeKatex from 'rehype-katex'

export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [remarkGfm, remarkMath, remarkFrontmatter, remarkMdxFrontmatter],
      rehypePlugins: [rehypeKatex],
    }),
    react(),
  ],
  modulePreload: {
    polyfill: false,
  },
  build: {
    minify: false,
    sourcemap: false,
    reportCompressedSize: false,
    target: 'es2019',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const parts = id.toString().split('node_modules/')[1].split('/');
            const pkg = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
            return `vendor-${pkg.replace('@', '').replace('/', '-')}`;
          }
        },
      },
    },
  },
})
