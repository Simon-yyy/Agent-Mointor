import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 配置：开发服务器 + 后端 API 代理
// 注：本机 agent 沙箱禁止子进程管道通信，esbuild 服务无法启动，
//     因此这里全程规避 esbuild：配置用 .mjs 原生加载、禁用依赖预构建、构建期不压缩。
//     前提：依赖全部为纯 ESM 包（vue / vue-router），页面请求用浏览器原生 fetch。
export default defineConfig({
  plugins: [vue()],
  server: {
    // 显式监听所有接口，确保 IPv4 (127.0.0.1) 与 IPv6 均可正常连接
    host: '0.0.0.0',
    // 专属端口 5180：避开本机 5173 上已占用的其他应用（YOYO file-manager）
    // strictPort：端口被占时直接报错，而不是悄悄换端口导致找不到页面
    port: 5180,
    strictPort: true,
    proxy: {
      // 开发期把 /api 请求转发给 Spring Boot 后端，避免跨域
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    // 跳过 esbuild 依赖扫描与预构建
    noDiscovery: true,
  },
  build: {
    // 构建期不用 esbuild 压缩（本项目体积小，无需压缩）
    minify: false,
  },
})
