import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        // 配置remarkMdxFrontmatter，确保frontmatter数据正确导出
        [remarkMdxFrontmatter, { name: 'attributes' }],
        remarkMath,
        remarkGfm
      ],
      rehypePlugins: [
        rehypeKatex
      ]
    }), 
    react()
  ]
})