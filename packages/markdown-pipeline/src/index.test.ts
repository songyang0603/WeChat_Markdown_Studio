import { describe, expect, it } from 'vitest';
import { renderMarkdownToHtml, runQualityChecks } from './index';
import { demoTheme } from '@theme-engine/core';

describe('renderMarkdownToHtml', () => {
  it('注入行内样式并渲染 Markdown', async () => {
    const html = await renderMarkdownToHtml('# 标题\n\n正文段落', { theme: demoTheme });
    expect(html).toMatch(/<h1[^>]*style=/);
    expect(html).toMatch(/<p[^>]*style=/);
    expect(html).toContain('正文段落');
  });

  it('支持 GFM 表格并附带行内样式', async () => {
    const markdown = `| 指标 | 数值 |
| --- | --- |
| 日活 | 12345 |`;
    const html = await renderMarkdownToHtml(markdown, { theme: demoTheme });
    expect(html).toMatch(/<table[^>]*style="/);
    expect(html).toMatch(/<th[^>]*style="/);
    expect(html).toMatch(/<td[^>]*style="/);
  });

  it('渲染代码块并保留样式与结构', async () => {
    const markdown = '```js\nconsole.log("hello")\n```';
    const html = await renderMarkdownToHtml(markdown, { theme: demoTheme });
    expect(html).toMatch(/<pre[^>]*style="/);
    expect(html).toMatch(/<code[^>]*font-family/);
    expect(html).toContain('console.log("hello")');
  });

  it('将连续图片渲染为多图网格容器', async () => {
    const markdown = [
      '![图一](https://example.com/1.png)',
      '![图二](https://example.com/2.png)',
      '![图三](https://example.com/3.png)'
    ].join('\n');
    const html = await renderMarkdownToHtml(markdown, { theme: demoTheme });
    expect(html).toContain('wechat-multi-image-grid');
    expect(html).toContain('data-image-count="3"');
    expect(html).toContain('data-columns="3"');
  });

  it('移除 YAML Frontmatter 并正确渲染正文', async () => {
    const markdown = ['---', 'title: 测试', 'tags: [demo]', '---', '', '正文内容'].join('\n');
    const html = await renderMarkdownToHtml(markdown, { theme: demoTheme });
    expect(html).not.toContain('title: 测试');
    expect(html).toContain('<p');
    expect(html).toContain('正文内容');
  });

  it('支持定义列表语法渲染为 dl/dt/dd', async () => {
    const markdown = ['术语', ': 这是定义', '', '另一个术语', ': 第二段定义'].join('\n');
    const html = await renderMarkdownToHtml(markdown, { theme: demoTheme });
    expect(html).toContain('<dl');
    expect(html).toMatch(/<dt[^>]*>术语<\/dt>/);
    expect(html).toMatch(/<dd[^>]*>这是定义<\/dd>/);
    expect(html).toMatch(/<dt[^>]*>另一个术语<\/dt>/);
  });

  it('支持 == 高亮语法并输出 mark 标签', async () => {
    const markdown = '这是 ==重点== 提醒';
    const html = await renderMarkdownToHtml(markdown, { theme: demoTheme });
    expect(html).toContain('<mark');
    expect(html).toContain('重点');
  });

  it('支持数学公式并生成 KaTeX 结构', async () => {
    const markdown = ['这里是公式：', '$$', 'E = mc^2', '$$'].join('\n');
    const html = await renderMarkdownToHtml(markdown, { theme: demoTheme });
    expect(html).toContain('katex-display');
    expect(html).toContain('E = mc');
  });
});

describe('runQualityChecks', () => {
  it('识别非 HTTPS 链接', () => {
    const issues = runQualityChecks('请查看 [链接](http://example.com)');
    expect(issues.some((issue) => issue.type === 'link-protocol')).toBe(true);
  });

  it('捕捉缺少 alt 的图片', () => {
    const issues = runQualityChecks('![](https://example.com/img.png)');
    expect(issues.some((issue) => issue.type === 'accessibility')).toBe(true);
  });

  it('提示标题层级跳跃', () => {
    const markdown = '# 一级\n\n#### 跳跃的四级标题';
    const issues = runQualityChecks(markdown);
    expect(issues.some((issue) => issue.type === 'structure')).toBe(true);
  });

  it('提示存在内嵌 HTML', () => {
    const issues = runQualityChecks('段落\n\n<div>内嵌 HTML</div>');
    expect(issues.some((issue) => issue.type === 'html-embed')).toBe(true);
  });
});
