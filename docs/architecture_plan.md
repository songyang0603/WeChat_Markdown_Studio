# 架构与交付计划

## 产品范围
- 发布 **MVP**：支持 Markdown → 公众号文章流程，包含 Web Studio、主题系统、模板库，并导出符合公众号限制的 HTML（行内样式、2 MB 图片提醒、HTTPS 链接）。
- 保持架构可扩展，便于后续接入浏览器插件、AI 服务以及模板商店/支付集成。

## 高层架构
- **apps/web-studio**（React + TypeScript + Vite）：Markdown 编辑器、主题实时预览、导出流程、质量检查面板。
- **apps/api**（Node.js + Fastify）：主题/模板 CRUD、渲染任务、健康检查；当前提供 REST，预留 GraphQL 端点形态。
- **packages/theme-engine**：共享主题 JSON Schema、渲染辅助、排版 token、行内样式生成工具。
- **packages/markdown-pipeline**：基于 remark/rehype 的解析器、生成公众号安全 HTML、规则化质量检查。
- **packages/ui**：共享 React 组件，Tailwind 预设或 styled-components 主题封装，保证设计 token 一致。
- **configs/**：可复用的 ESLint、Prettier、TSConfig、Vitest 配置。
- **tooling/**：lint/test/build 脚本以及未来的 CLI/CI 钩子。

首选使用 pnpm workspace（备选 npm workspaces）管理 mono-repo。

## 主题 JSON（草案）
```json
{
  "id": "tech-minimal",
  "version": "0.1.0",
  "metadata": { "name": "Tech Minimal", "author": "Core Team" },
  "tokens": {
    "color": { "primary": "#1A73E8", "text": "#2B2B2B", "background": "#FFFFFF" },
    "typography": {
      "fontFamily": "PingFang SC, Helvetica, Arial, sans-serif",
      "heading": { "lineHeight": 1.4, "weight": 600 },
      "body": { "lineHeight": 1.7, "weight": 400 }
    },
    "spacing": { "paragraph": 16, "section": 32 },
    "border": { "radius": 8 }
  },
  "components": {
    "paragraph": { "maxWidth": 680 },
    "blockquote": { "accentColor": "primary", "borderWidth": 3 },
    "callout": {
      "background": "#F5F8FF",
      "icon": "info",
      "padding": { "x": 16, "y": 12 }
    }
  }
}
```

## MVP 功能拆解
1. **Markdown 导入**：内置编辑器＋文件导入；未来预留 Notion/飞书连接器占位。
2. **主题应用**：通过 theme-engine 将 AST 节点映射到组件样式，生成行内样式。
3. **预览/导出**：双栏预览、复制 HTML 到剪贴板、支持下载。
4. **模板库**：MVP 使用内存 JSON 列表；后续在 API 中扩展到数据库。
5. **质量检查**：基于 AST 的规则输出可执行提示（HTTP/HTTPS 协议、图片可访问性、标题层级跳跃、内嵌 HTML 等）。
6. **API**：Fastify 服务提供 `/themes`、`/templates`、`/render/preview` 等路由，使用 Zod 做入参校验。
7. **测试**：共享包采用 Vitest，Web 端结合 React Testing Library，API 使用 supertest。

## 超越 MVP 的路线
1. 浏览器插件：将渲染器注入微信后台，复用主题引擎与质检模块。
2. AI 服务：内容润色、配色建议等，通过特性开关控制。
3. 模板商店：支持上传流程、审核管线、Stripe/飞书支付等占位。
4. 团队协作：多账号支持与基于角色的权限管理。

## 近期行动
1. 使用 pnpm workspace 搭建 apps 与 packages 目录框架。
2. 实现 theme-engine 骨架，提供 schema 定义与示例主题数据。
3. 基于 remark → rehype → 自定义渲染构建 markdown-pipeline。
4. 搭建 React 应用，集成编辑器（如 `@uiw/react-md-editor` 或 `react-markdown`）与预览。
5. 创建 Fastify API 占位服务并内置 mock 数据。
6. 将质量检查串联到导出按钮，在 UI 中展示结果。
7. 编写 README，说明安装/开发流程、主题规范与路线图。
