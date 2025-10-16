import { describe, expect, it } from 'vitest';
import { listTemplates, findTemplate, listThemes } from './index';

describe('template-library', () => {
  it('返回内置模板列表', () => {
    const templates = listTemplates();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0]).toHaveProperty('category');
    expect(templates[0]).toHaveProperty('useCase');
  });

  it('可以根据 ID 定位模板', () => {
    const first = listTemplates()[0];
    expect(findTemplate(first.id)).toMatchObject({ id: first.id });
  });

  it('提供内置主题信息', () => {
    const themes = listThemes();
    expect(themes.some((theme) => theme.id === 'tech-minimal')).toBe(true);
    expect(themes.some((theme) => theme.id === 'wechat-default')).toBe(true);
  });
});
