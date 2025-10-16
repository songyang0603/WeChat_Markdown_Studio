# WeChat Markdown Studio (MVP)

## Overview
Mono-repo for building a Markdown → WeChat排版工作台，覆盖 Web Studio、主题系统、模板库与质量检查。架构按可扩展性设计，后续将支持浏览器插件、AI 功能与模板商店。

## Repository Layout
- `apps/web-studio`: React + TypeScript 应用，提供 Markdown 编辑、实时预览、导出流程。
- `apps/api`: Fastify 服务，负责主题/模板 CRUD、渲染任务接口。
- `packages/theme-engine`: 主题 JSON 规范、token 工具、渲染辅助。
- `packages/markdown-pipeline`: Markdown 解析、WeChat 兼容 HTML 导出、质量检查。
- `packages/ui`: 共享 UI 组件和 design tokens。
- `packages/template-library`: 内置模板清单、字段定义、主题映射工具。
- `configs`: ESLint、Prettier、Vitest 等统一配置。
- `tooling`: CLI/脚本、CI Hook 等。

## Getting Started
1. 安装 `pnpm`（>=9.11）。
2. 安装依赖：`pnpm install`.
3. 运行 Web Studio：`pnpm dev:web`（默认在 http://localhost:5173 ）。
4. 运行 API：`pnpm dev:api`（默认在 http://localhost:3001 ）。

## Development Guidelines
- 使用统一的 lint/test 命令：`pnpm lint`、`pnpm test`。
- 主题定义遵守 `packages/theme-engine` 中的 JSON Schema。
- 关键函数写简洁注释说明设计意图。
- 每次开发更新 `DEV_LOG.txt` 记录改动。

## 当前功能亮点
- Web Studio：双栏 Markdown 编辑 + 主题预览，支持复制/下载 HTML、质量问题点击定位（编辑器选中 + 预览高亮）、模板套用/Markdown 一键复制、主题切换。
- Theme Engine：两套内置主题（科技极简、暖意手帐），提供段落/标题/引用/列表/链接的行内样式生成工具。
- Markdown Pipeline：基于 remark/rehype 解析，自动注入行内样式，并提供链接协议、图片可访问性、标题层级、内嵌 HTML 等质量检查规则，且在预览端高亮定位。
- Template Library：两份示例模板（科技产品发布稿、生活方式品牌故事），可在 Web Studio 一键套用，也可通过 API 获取。
- API 占位：`GET /themes`、`GET /templates`、`GET /templates/:id`、`POST /render/preview`，用于后续前端/插件接入。

## 本地运行
1. 安装依赖：`pnpm install`
2. 启动 Web Studio：`pnpm dev:web`
   - 默认地址 http://localhost:5173 ，实时渲染 Markdown → 公众号 HTML
3. （可选）启动 API：`pnpm dev:api`
   - 默认地址 http://localhost:3001 ，可访问 `/themes` `/templates` `/render/preview`
4. Lint 与测试：`pnpm lint`、`pnpm test`

## 使用指南
- 点击右上角主题下拉可切换主题，或在“主题调整”面板内微调主色/间距、导入自定义 JSON。
- 模板库按类别分组展示，卡片支持预览封面、快速套用与复制纯 Markdown 源稿。
- 质量检查列表中的问题可点击定位，编辑器会自动高亮相关 Markdown 行，预览区同步高亮；支持忽略/恢复，减少重复干扰。
- 支持复制导出的 HTML 或下载到本地文件，直接粘贴/上传至公众号后台即可。
- 若需新增模板，可在 `packages/template-library/src/index.ts` 中追加数据并重新运行 `pnpm dev:web`。

## Roadmap Snapshot
1. 丰富主题 JSON schema（组件粒度配置、变量继承），上线可视化主题编辑器。
2. 扩展 Markdown pipeline：支持 Notion/飞书导入、二维码/卡片组件、更多质量规则。
3. 构建浏览器插件原型，实现公众号后台内嵌粘贴与质检提示。
4. 规划模板商店（上架/审核/付费）与 AI 服务（润色、配色建议）的接入流程。

详情参见 `docs/architecture_plan.md`。
