// vite.config.js
import { defineConfig } from "file:///D:/Develop/Algorithm_Visualization/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Develop/Algorithm_Visualization/node_modules/@vitejs/plugin-react/dist/index.mjs";
import mdx from "file:///D:/Develop/Algorithm_Visualization/node_modules/@mdx-js/rollup/index.js";
import remarkFrontmatter from "file:///D:/Develop/Algorithm_Visualization/node_modules/remark-frontmatter/index.js";
import remarkMdxFrontmatter from "file:///D:/Develop/Algorithm_Visualization/node_modules/remark-mdx-frontmatter/dist/remark-mdx-frontmatter.js";
import remarkMath from "file:///D:/Develop/Algorithm_Visualization/node_modules/remark-math/index.js";
import remarkGfm from "file:///D:/Develop/Algorithm_Visualization/node_modules/remark-gfm/index.js";
import rehypeKatex from "file:///D:/Develop/Algorithm_Visualization/node_modules/rehype-katex/index.js";
var vite_config_default = defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        // 配置remarkMdxFrontmatter，确保frontmatter数据正确导出
        [remarkMdxFrontmatter, { name: "attributes" }],
        remarkMath,
        remarkGfm
      ],
      rehypePlugins: [
        rehypeKatex
      ]
    }),
    react()
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxEZXZlbG9wXFxcXEFsZ29yaXRobV9WaXN1YWxpemF0aW9uXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxEZXZlbG9wXFxcXEFsZ29yaXRobV9WaXN1YWxpemF0aW9uXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9EZXZlbG9wL0FsZ29yaXRobV9WaXN1YWxpemF0aW9uL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCBtZHggZnJvbSAnQG1keC1qcy9yb2xsdXAnXG5pbXBvcnQgcmVtYXJrRnJvbnRtYXR0ZXIgZnJvbSAncmVtYXJrLWZyb250bWF0dGVyJ1xuaW1wb3J0IHJlbWFya01keEZyb250bWF0dGVyIGZyb20gJ3JlbWFyay1tZHgtZnJvbnRtYXR0ZXInXG5pbXBvcnQgcmVtYXJrTWF0aCBmcm9tICdyZW1hcmstbWF0aCdcbmltcG9ydCByZW1hcmtHZm0gZnJvbSAncmVtYXJrLWdmbSdcbmltcG9ydCByZWh5cGVLYXRleCBmcm9tICdyZWh5cGUta2F0ZXgnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgbWR4KHtcbiAgICAgIHJlbWFya1BsdWdpbnM6IFtcbiAgICAgICAgcmVtYXJrRnJvbnRtYXR0ZXIsXG4gICAgICAgIC8vIFx1OTE0RFx1N0Y2RXJlbWFya01keEZyb250bWF0dGVyXHVGRjBDXHU3ODZFXHU0RkREZnJvbnRtYXR0ZXJcdTY1NzBcdTYzNkVcdTZCNjNcdTc4NkVcdTVCRkNcdTUxRkFcbiAgICAgICAgW3JlbWFya01keEZyb250bWF0dGVyLCB7IG5hbWU6ICdhdHRyaWJ1dGVzJyB9XSxcbiAgICAgICAgcmVtYXJrTWF0aCxcbiAgICAgICAgcmVtYXJrR2ZtXG4gICAgICBdLFxuICAgICAgcmVoeXBlUGx1Z2luczogW1xuICAgICAgICByZWh5cGVLYXRleFxuICAgICAgXVxuICAgIH0pLCBcbiAgICByZWFjdCgpXG4gIF1cbn0pIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4UixTQUFTLG9CQUFvQjtBQUMzVCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sdUJBQXVCO0FBQzlCLE9BQU8sMEJBQTBCO0FBQ2pDLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZUFBZTtBQUN0QixPQUFPLGlCQUFpQjtBQUd4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsTUFDRixlQUFlO0FBQUEsUUFDYjtBQUFBO0FBQUEsUUFFQSxDQUFDLHNCQUFzQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQUEsUUFDN0M7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsZUFBZTtBQUFBLFFBQ2I7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
