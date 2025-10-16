import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  renderMarkdownToHtml,
  runQualityChecks,
  type QualityIssue,
  type QualityIssueType
} from '@markdown-pipeline/core';
import {
  builtinThemes,
  demoTheme,
  type ThemeDefinition,
  validateTheme
} from '@theme-engine/core';
import { Badge } from '@ui/core';
import {
  listTemplates,
  type TemplateDefinition
} from '@template-library/core';
import { prepareWechatExportHtml } from './utils/exportTransforms';

const DEFAULT_MARKDOWN = `# 欢迎使用 WeChat Markdown Studio

> 这是一个示例段落，帮助你快速体验主题排版与质量检查。

- 支持基础 Markdown 语法
- 自动应用主题行内样式
- 导出后可直接粘贴到公众号后台

[示例链接](https://mp.weixin.qq.com/)

![示例图片](https://via.placeholder.com/600x320)
`;

const renderQualityLabel = (issue: QualityIssue) => {
  switch (issue.type) {
    case 'link-protocol':
      return <Badge variant="warning">链接协议</Badge>;
    case 'accessibility':
      return <Badge variant="warning">可访问性</Badge>;
    case 'image-reference':
      return <Badge variant="warning">图片来源</Badge>;
    case 'html-embed':
      return <Badge variant="warning">HTML</Badge>;
    case 'structure':
    default:
      return <Badge>结构</Badge>;
  }
};

const issueHints: Partial<Record<QualityIssueType, string>> = {
  'link-protocol': '建议替换为 HTTPS 链接，避免被微信拦截。',
  accessibility: '补充可读文本或 alt，提升阅读体验与无障碍能力。',
  'image-reference': '使用公网图床或公众号素材库，确保图片稳定可见。',
  'html-embed': '发布前务必在微信预览确认内嵌 HTML 的兼容性与安全性。',
  structure: '按 H1→H2→H3 递进结构，控制标题长度，提升可读性。'
};

type ThemeOverride = {
  primaryColor?: string;
  textColor?: string;
  backgroundColor?: string;
  paragraphSpacing?: number;
  headingFontFamily?: string;
  bodyFontFamily?: string;
};

const applyThemeOverrides = (base: ThemeDefinition, overrides: ThemeOverride): ThemeDefinition => {
  const {
    primaryColor,
    textColor,
    backgroundColor,
    paragraphSpacing,
    headingFontFamily,
    bodyFontFamily
  } = overrides;
  return {
    ...base,
    tokens: {
      ...base.tokens,
      color: {
        ...base.tokens.color,
        primary: primaryColor ?? base.tokens.color.primary,
        text: textColor ?? base.tokens.color.text,
        background: backgroundColor ?? base.tokens.color.background
      },
      spacing: {
        ...base.tokens.spacing,
        paragraph: paragraphSpacing ?? base.tokens.spacing.paragraph
      },
      typography: {
        ...base.tokens.typography,
        heading: {
          ...base.tokens.typography.heading,
          fontFamily: headingFontFamily ?? base.tokens.typography.heading.fontFamily
        },
        body: {
          ...base.tokens.typography.body,
          fontFamily: bodyFontFamily ?? base.tokens.typography.body.fontFamily
        }
      }
    }
  };
};

const issueKey = (issue: QualityIssue, index: number) => {
  const line = issue.location?.line ?? 'NA';
  const column = issue.location?.column ?? 'NA';
  return `${issue.type}-${line}-${column}-${issue.message}-${index}`;
};

const headingFontOptions = [
  'PingFang SC, "Helvetica Neue", Helvetica, Arial, sans-serif',
  'Hiragino Sans, "PingFang SC", "Microsoft YaHei", sans-serif',
  'Georgia, "Times New Roman", Times, serif',
  '"Source Han Serif", "Songti SC", serif',
  '"Noto Sans SC", sans-serif'
];

const bodyFontOptions = [
  'PingFang SC, "Helvetica Neue", Helvetica, Arial, sans-serif',
  'Hiragino Sans, "PingFang SC", "Microsoft YaHei", sans-serif',
  '"Noto Sans SC", sans-serif',
  'Georgia, "Times New Roman", Times, serif',
  '"Lantinghei SC", "PingFang SC", sans-serif'
];

const QUALITY_IGNORE_STORAGE_KEY = 'wechat-studio-quality-ignore';
const THEME_PRESET_STORAGE_KEY = 'wechat-studio-theme-presets';

type ThemePreset = {
  id: string;
  name: string;
  baseThemeId: string;
  overrides: ThemeOverride;
};

export const App: React.FC = () => {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [htmlPreview, setHtmlPreview] = useState('');
  const [qualityIssues, setQualityIssues] = useState<QualityIssue[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [copySuccess, setCopySuccess] = useState<'idle' | 'success' | 'error'>('idle');
  const [wechatCopyState, setWechatCopyState] = useState<'idle' | 'success' | 'error'>('idle');
  const [themeId, setThemeId] = useState<ThemeDefinition['id']>('tech-minimal');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [activeIssueIndex, setActiveIssueIndex] = useState<number | null>(null);
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);
  const [ignoredIssueKeys, setIgnoredIssueKeys] = useState<Record<string, boolean>>({});
  const [showIgnoredIssues, setShowIgnoredIssues] = useState(false);
  const [themeOverrides, setThemeOverrides] = useState<ThemeOverride>({});
  const [customTheme, setCustomTheme] = useState<ThemeDefinition | null>(null);
  const [themeJsonInput, setThemeJsonInput] = useState('');
  const [themeJsonError, setThemeJsonError] = useState<string | null>(null);
  const [templateSearch, setTemplateSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [presetName, setPresetName] = useState('');
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const templates = useMemo<TemplateDefinition[]>(() => listTemplates(), []);
  const issueEntries = useMemo(() => {
    return qualityIssues.map((issue, index) => ({ issue, index, key: issueKey(issue, index) }));
  }, [qualityIssues]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((template) => set.add(template.category));
    return ['全部', ...Array.from(set)];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = templateSearch.trim().toLowerCase();
    return templates.filter((template) => {
      const matchesCategory = activeCategory === '全部' || template.category === activeCategory;
      if (!matchesCategory) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }
      const haystack = [
        template.title,
        template.summary,
        template.author,
        template.useCase,
        template.tags.join(' ')
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [activeCategory, templateSearch, templates]);
  const baseTheme = useMemo<ThemeDefinition>(() => {
    if (customTheme && customTheme.id === themeId) {
      return customTheme;
    }
    if (customTheme && !builtinThemes.some((item) => item.id === themeId)) {
      return customTheme;
    }
    return builtinThemes.find((item) => item.id === themeId) ?? customTheme ?? demoTheme;
  }, [customTheme, themeId]);

  const activeTheme = useMemo<ThemeDefinition>(() => {
    return applyThemeOverrides(baseTheme, themeOverrides);
  }, [baseTheme, themeOverrides]);

  const activeIssueEntries = useMemo(
    () => issueEntries.filter((entry) => !ignoredIssueKeys[entry.key]),
    [issueEntries, ignoredIssueKeys],
  );

  const ignoredIssueEntries = useMemo(
    () => issueEntries.filter((entry) => ignoredIssueKeys[entry.key]),
    [issueEntries, ignoredIssueKeys],
  );

  const displayedIssueEntries = showIgnoredIssues ? ignoredIssueEntries : activeIssueEntries;

  const resolveThemeName = useCallback(
    (id: string) => {
      if (customTheme && customTheme.id === id) {
        return customTheme.metadata.name;
      }
      const builtin = builtinThemes.find((item) => item.id === id);
      if (builtin) {
        return builtin.metadata.name;
      }
      return customTheme?.metadata.name ?? demoTheme.metadata.name;
    },
    [customTheme],
  );

  useEffect(() => {
    try {
      const storedIgnore = localStorage.getItem(QUALITY_IGNORE_STORAGE_KEY);
      if (storedIgnore) {
        const parsed = JSON.parse(storedIgnore);
        if (parsed && typeof parsed === 'object') {
          setIgnoredIssueKeys(parsed);
        }
      }
      const storedPresets = localStorage.getItem(THEME_PRESET_STORAGE_KEY);
      if (storedPresets) {
        const parsedPresets = JSON.parse(storedPresets);
        if (Array.isArray(parsedPresets)) {
          const sanitized = parsedPresets.filter(
            (item): item is ThemePreset =>
              !!item &&
              typeof item === 'object' &&
              'id' in item &&
              'name' in item &&
              'baseThemeId' in item &&
              'overrides' in item,
          );
          setPresets(sanitized);
        }
      }
    } catch (err) {
      console.error('读取本地配置失败', err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(QUALITY_IGNORE_STORAGE_KEY, JSON.stringify(ignoredIssueKeys));
  }, [ignoredIssueKeys]);

  useEffect(() => {
    localStorage.setItem(THEME_PRESET_STORAGE_KEY, JSON.stringify(presets));
  }, [presets]);

  useEffect(() => {
    setActiveIssueIndex((prev) => {
      if (prev === null) {
        return prev;
      }
      const entry = issueEntries.find((item) => item.index === prev);
      if (!entry || ignoredIssueKeys[entry.key]) {
        return null;
      }
      return prev;
    });
  }, [issueEntries, ignoredIssueKeys]);

  useEffect(() => {
    const container = previewRef.current;
    if (!container) {
      return;
    }
    container.querySelectorAll('.preview-highlight').forEach((element) => {
      element.classList.remove('preview-highlight');
    });
    if (activeIssueIndex === null) {
      return;
    }
    const issue = qualityIssues[activeIssueIndex];
    if (!issue?.location) {
      return;
    }
    const target = container.querySelector(
      `[data-source-line="${issue.location.line}"]`,
    ) as HTMLElement | null;
    if (target) {
      target.classList.add('preview-highlight');
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIssueIndex, qualityIssues, htmlPreview]);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      setIsRendering(true);
      try {
        const html = await renderMarkdownToHtml(markdown, { theme: activeTheme });
        if (!cancelled) {
          setHtmlPreview(html);
          setQualityIssues(runQualityChecks(markdown));
        }
      } catch (err) {
        console.error('渲染失败', err);
      } finally {
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [markdown, activeTheme]);

  const handleCopyHtml = async () => {
    if (!htmlPreview) {
      return;
    }
    const exportHtml = prepareWechatExportHtml(htmlPreview);
    try {
      await navigator.clipboard.writeText(exportHtml);
      setCopySuccess('success');
    } catch (err) {
      console.error('复制失败', err);
      setCopySuccess('error');
    } finally {
      setTimeout(() => setCopySuccess('idle'), 1800);
    }
  };

  const handleCopyToWechat = useCallback(async () => {
    if (!htmlPreview) {
      return;
    }
    const exportHtml = prepareWechatExportHtml(htmlPreview);
    const reset = () => setTimeout(() => setWechatCopyState('idle'), 1800);
    try {
      if (navigator.clipboard && 'write' in navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        const htmlBlob = new Blob([exportHtml], { type: 'text/html' });
        const textBlob = new Blob([markdown], { type: 'text/plain' });
        const item = new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob });
        await navigator.clipboard.write([item]);
        setWechatCopyState('success');
        reset();
        return;
      }
    } catch (err) {
      console.warn('navigator.clipboard 写入失败，尝试 fallback', err);
    }

    try {
      const container = document.createElement('div');
      container.innerHTML = exportHtml;
      container.style.position = 'fixed';
      container.style.pointerEvents = 'none';
      container.style.opacity = '0';
      container.style.zIndex = '-1';
      container.style.whiteSpace = 'pre-wrap';
      document.body.appendChild(container);
      const range = document.createRange();
      range.selectNodeContents(container);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      const ok = document.execCommand('copy');
      selection?.removeAllRanges();
      document.body.removeChild(container);
      setWechatCopyState(ok ? 'success' : 'error');
    } catch (err) {
      console.error('复制到公众号失败', err);
      setWechatCopyState('error');
    } finally {
      reset();
    }
  }, [htmlPreview, markdown]);

  const handleApplyTemplate = (template: TemplateDefinition) => {
    setMarkdown(template.content);
    setThemeId(template.themeId);
    setSelectedTemplateId(template.id);
    setActiveIssueIndex(null);
    setCopiedTemplateId(null);
  };

  const handleDownloadHtml = () => {
    const exportHtml = prepareWechatExportHtml(htmlPreview);
    const blob = new Blob([exportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wechat-article.html';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getIndexFromLocation = useCallback(
    (line: number, column: number) => {
      const lines = markdown.split('\n');
      let offset = 0;
      for (let i = 0; i < line - 1 && i < lines.length; i += 1) {
        offset += lines[i].length + 1;
      }
      return Math.min(offset + Math.max(column - 1, 0), markdown.length);
    },
    [markdown],
  );

  const focusIssue = useCallback(
    (issue: QualityIssue | undefined, index: number) => {
      setActiveIssueIndex(index);

      if (!issue || !issue.location || !textareaRef.current) {
        return;
      }
      const start = getIndexFromLocation(issue.location.line, issue.location.column);
      const end = markdown.indexOf('\n', start);
      const highlightEnd = end === -1 ? markdown.length : end;
      const textarea = textareaRef.current;
      textarea.focus();
      textarea.setSelectionRange(start, highlightEnd);
    },
    [getIndexFromLocation, markdown],
  );

  const handleCopyTemplateMarkdown = useCallback(async (template: TemplateDefinition) => {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopiedTemplateId(template.id);
      setTimeout(() => {
        setCopiedTemplateId((prev) => (prev === template.id ? null : prev));
      }, 1800);
    } catch (err) {
      console.error('复制模板失败', err);
      setCopiedTemplateId(null);
    }
  }, []);

  const toggleIssueIgnore = useCallback(
    (entryKey: string, index: number) => {
      setIgnoredIssueKeys((prev) => {
        const next = { ...prev };
        if (next[entryKey]) {
          delete next[entryKey];
        } else {
          next[entryKey] = true;
        }
        return next;
      });
      setActiveIssueIndex((prev) => (prev === index ? null : prev));
    },
    [],
  );

  const handleThemeOverrideChange = useCallback(
    (field: keyof ThemeOverride, value: string) => {
      setThemeOverrides((prev) => {
        if (field === 'paragraphSpacing') {
          const numeric = Number(value);
          if (Number.isNaN(numeric)) {
            return prev;
          }
          return { ...prev, paragraphSpacing: numeric };
        }
        if (value === '') {
          const next = { ...prev };
          delete next[field];
          return next;
        }
        return { ...prev, [field]: value };
      });
    },
    [],
  );

  const resetOverrides = useCallback(() => {
    setThemeOverrides({});
  }, []);

  const applyThemeJson = useCallback(() => {
    try {
      const parsed = JSON.parse(themeJsonInput);
      const validated = validateTheme(parsed);
      setCustomTheme(validated);
      setThemeId(validated.id);
      setThemeOverrides({});
      setThemeJsonError(null);
    } catch (err) {
      setThemeJsonError(err instanceof Error ? err.message : 'JSON 解析失败，请检查格式');
    }
  }, [themeJsonInput]);

  const clearCustomTheme = useCallback(() => {
    setCustomTheme(null);
    setThemeOverrides({});
    setThemeJsonInput('');
    setThemeJsonError(null);
    if (!builtinThemes.some((item) => item.id === themeId)) {
      setThemeId('tech-minimal');
    }
  }, [themeId]);

  const exportIgnoredIssues = useCallback(() => {
    const payload = ignoredIssueEntries.map((entry) => ({
      type: entry.issue.type,
      message: entry.issue.message,
      location: entry.issue.location ?? null
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wechat-quality-ignore-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [ignoredIssueEntries]);

  const savePreset = useCallback(() => {
    if (!presetName.trim()) {
      return;
    }
    if (Object.keys(themeOverrides).length === 0) {
      return;
    }
    const newPreset = {
      id: `preset-${Date.now()}`,
      name: presetName.trim(),
      baseThemeId: baseTheme.id,
      overrides: { ...themeOverrides }
    };
    setPresets((prev) => [...prev, newPreset]);
    setPresetName('');
  }, [presetName, themeOverrides, baseTheme.id]);

  const applyPresetOverrides = useCallback(
    (preset: { id: string; name: string; baseThemeId: string; overrides: ThemeOverride }) => {
      setThemeId(preset.baseThemeId);
      setThemeOverrides({ ...preset.overrides });
    },
    [],
  );

  const deletePreset = useCallback((id: string) => {
    setPresets((prev) => prev.filter((preset) => preset.id !== id));
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>WeChat Markdown Studio</h1>
          <p className="app-subtitle">
            Markdown 写作、主题排版、质量检查，一站式输出可直接粘贴到公众号后台的 HTML。
          </p>
        </div>
        <div className="app-actions">
          <div className="theme-selector">
            <label htmlFor="theme">主题</label>
            <select
              id="theme"
              value={themeId}
              onChange={(event) => {
                setThemeId(event.target.value as ThemeDefinition['id']);
                setSelectedTemplateId(null);
              }}
            >
              {builtinThemes.map((themeOption) => (
                <option key={themeOption.id} value={themeOption.id}>
                  {themeOption.metadata.name}
                </option>
              ))}
              {customTheme && !builtinThemes.some((item) => item.id === customTheme.id) ? (
                <option value={customTheme.id}>自定义 · {customTheme.metadata.name}</option>
              ) : null}
            </select>
          </div>
          <button type="button" onClick={handleCopyHtml} className="primary-btn" disabled={!htmlPreview}>
            复制 HTML
          </button>
          <button
            type="button"
            onClick={handleDownloadHtml}
            className="secondary-btn"
            disabled={!htmlPreview}
          >
            下载 HTML
          </button>
          <button
            type="button"
            onClick={handleCopyToWechat}
            className="wechat-btn"
            disabled={!htmlPreview}
          >
            复制到公众号
          </button>
          {copySuccess === 'success' && <Badge variant="success">已复制</Badge>}
          {copySuccess === 'error' && <Badge variant="warning">复制失败</Badge>}
          {wechatCopyState === 'success' && <Badge variant="success">已复制公众号</Badge>}
          {wechatCopyState === 'error' && <Badge variant="warning">公众号复制失败</Badge>}
        </div>
      </header>

      <section className="workspace">
        <div className="panel editor-panel">
          <div className="panel-header">
            <h2>Markdown 编辑</h2>
          </div>
          <textarea
            spellCheck={false}
            value={markdown}
            onChange={(event) => setMarkdown(event.target.value)}
            className="editor-textarea"
            ref={textareaRef}
          />
        </div>
        <div className="panel preview-panel">
          <div className="panel-header">
            <h2>预览（{activeTheme.metadata.name}）</h2>
            {isRendering ? <Badge>渲染中</Badge> : <Badge variant="success">最新</Badge>}
          </div>
          <div className="preview-content" ref={previewRef}>
            {htmlPreview ? (
              <article dangerouslySetInnerHTML={{ __html: htmlPreview }} />
            ) : (
              <p className="muted">暂无内容，请在左侧输入 Markdown。</p>
            )}
          </div>
        </div>
      </section>

      <section className="template-section">
        <div className="panel template-panel">
          <div className="panel-header">
            <h2>模板库</h2>
            <Badge>Beta</Badge>
          </div>
          <div className="template-toolbar">
            <div className="template-categories">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`template-chip ${activeCategory === category ? 'is-active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <input
              className="template-search"
              type="search"
              placeholder="搜索标题、作者或标签..."
              value={templateSearch}
              onChange={(event) => setTemplateSearch(event.target.value)}
            />
          </div>
          {filteredTemplates.length === 0 ? (
            <p className="muted">暂无匹配的模板，尝试调整筛选条件。</p>
          ) : (
            <div className="template-row">
              {filteredTemplates.map((template) => (
                <article
                  key={template.id}
                  className={`template-card ${
                    selectedTemplateId === template.id ? 'is-active' : ''
                  }`}
                >
                  <div className="template-card-header">
                    <div>
                      <h3>{template.title}</h3>
                      <p>{template.summary}</p>
                    </div>
                    {selectedTemplateId === template.id ? (
                      <Badge variant="success">已应用</Badge>
                    ) : null}
                  </div>
                  {template.coverImage ? (
                    <div className="template-cover">
                      <img src={template.coverImage} alt={`${template.title} 封面`} />
                    </div>
                  ) : null}
                  <div className="template-meta">
                    <span>{resolveThemeName(template.themeId)}</span>
                    <span>{template.updatedAt}</span>
                  </div>
                  <div className="template-details">
                    <p><strong>作者：</strong>{template.author}</p>
                    <p><strong>适用场景：</strong>{template.useCase}</p>
                    <p className="template-tags">{template.tags.map((tag) => `#${tag}`).join(' ')}</p>
                  </div>
                  <div className="template-actions">
                    <button
                      type="button"
                      className="template-btn template-btn-primary"
                      onClick={() => handleApplyTemplate(template)}
                    >
                      套用
                    </button>
                    <button
                      type="button"
                      className="template-btn template-btn-secondary"
                      onClick={() => handleCopyTemplateMarkdown(template)}
                    >
                      {copiedTemplateId === template.id ? '已复制' : '复制 Markdown'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="theme-editor-section">
        <div className="panel theme-editor-panel">
          <div className="panel-header">
            <h2>主题调整</h2>
            <Badge>实验</Badge>
          </div>
          <div className="theme-editor-grid">
            <div className="theme-field">
              <label htmlFor="primaryColor">主色</label>
              <input
                id="primaryColor"
                type="color"
                value={themeOverrides.primaryColor ?? activeTheme.tokens.color.primary}
                onChange={(event) => handleThemeOverrideChange('primaryColor', event.target.value)}
              />
            </div>
            <div className="theme-field">
              <label htmlFor="textColor">正文颜色</label>
              <input
                id="textColor"
                type="color"
                value={themeOverrides.textColor ?? activeTheme.tokens.color.text}
                onChange={(event) => handleThemeOverrideChange('textColor', event.target.value)}
              />
            </div>
            <div className="theme-field">
              <label htmlFor="backgroundColor">背景颜色</label>
              <input
                id="backgroundColor"
                type="color"
                value={themeOverrides.backgroundColor ?? activeTheme.tokens.color.background}
                onChange={(event) => handleThemeOverrideChange('backgroundColor', event.target.value)}
              />
            </div>
            <div className="theme-field">
              <label htmlFor="paragraphSpacing">段落间距</label>
              <input
                id="paragraphSpacing"
                type="range"
                min="8"
                max="48"
                value={
                  themeOverrides.paragraphSpacing ?? activeTheme.tokens.spacing.paragraph ?? 16
                }
                onChange={(event) => handleThemeOverrideChange('paragraphSpacing', event.target.value)}
              />
              <span className="theme-field-value">
                {themeOverrides.paragraphSpacing ?? activeTheme.tokens.spacing.paragraph ?? 16}px
              </span>
            </div>
            <div className="theme-field">
              <label htmlFor="headingFont">标题字体</label>
              <select
                id="headingFont"
                value={themeOverrides.headingFontFamily ?? activeTheme.tokens.typography.heading.fontFamily ?? headingFontOptions[0]}
                onChange={(event) => handleThemeOverrideChange('headingFontFamily', event.target.value)}
              >
                <option value="">跟随主题</option>
                {headingFontOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.split(',')[0]}
                  </option>
                ))}
              </select>
            </div>
            <div className="theme-field">
              <label htmlFor="bodyFont">正文字体</label>
              <select
                id="bodyFont"
                value={themeOverrides.bodyFontFamily ?? activeTheme.tokens.typography.body.fontFamily ?? bodyFontOptions[0]}
                onChange={(event) => handleThemeOverrideChange('bodyFontFamily', event.target.value)}
              >
                <option value="">跟随主题</option>
                {bodyFontOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.split(',')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="theme-actions">
            <button type="button" className="template-btn template-btn-secondary" onClick={resetOverrides}>
              重置微调
            </button>
          </div>
          <div className="theme-json">
            <label htmlFor="themeJson">导入主题 JSON</label>
            <textarea
              id="themeJson"
              value={themeJsonInput}
              onChange={(event) => setThemeJsonInput(event.target.value)}
              placeholder="粘贴符合主题规范的 JSON 对象"
            />
            {themeJsonError ? <p className="theme-json-error">{themeJsonError}</p> : null}
            <div className="theme-json-actions">
              <button type="button" className="template-btn template-btn-primary" onClick={applyThemeJson}>
                应用 JSON
              </button>
              <button type="button" className="template-btn template-btn-secondary" onClick={clearCustomTheme}>
                恢复内置主题
              </button>
            </div>
          </div>
          <div className="theme-presets">
            <div className="theme-presets-header">
              <h3>主题预设</h3>
              <span>{presets.length} 个</span>
            </div>
            <div className="preset-save">
              <input
                type="text"
                placeholder="预设名称"
                value={presetName}
                onChange={(event) => setPresetName(event.target.value)}
              />
              <button
                type="button"
                className="template-btn template-btn-primary"
                onClick={savePreset}
                disabled={!presetName.trim() || Object.keys(themeOverrides).length === 0}
              >
                保存预设
              </button>
            </div>
            {presets.length > 0 ? (
              <ul className="preset-list">
                {presets.map((preset) => (
                  <li key={preset.id}>
                    <span>{preset.name}</span>
                    <div className="preset-actions">
                      <button
                        type="button"
                        className="template-btn template-btn-primary"
                        onClick={() => applyPresetOverrides(preset)}
                      >
                        应用
                      </button>
                      <button
                        type="button"
                        className="template-btn template-btn-secondary"
                        onClick={() => deletePreset(preset.id)}
                      >
                        删除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">暂无保存的预设，可以通过上方微调后保存。</p>
            )}
          </div>
        </div>
      </section>

      <section className="quality-section">
        <div className="panel quality-panel">
          <div className="panel-header">
            <h2>质量检查</h2>
            <Badge variant={activeIssueEntries.length === 0 ? 'success' : 'warning'}>
              {activeIssueEntries.length === 0
                ? '无异常'
                : `${activeIssueEntries.length} 项待处理`}
            </Badge>
          </div>
          <div className="quality-toolbar">
            {ignoredIssueEntries.length > 0 ? (
              <button
                type="button"
                className="template-btn template-btn-secondary"
                onClick={() => setShowIgnoredIssues((prev) => !prev)}
              >
                {showIgnoredIssues
                  ? '查看待处理'
                  : `查看已忽略 (${ignoredIssueEntries.length})`}
              </button>
            ) : null}
            <button
              type="button"
              className="template-btn template-btn-secondary"
              onClick={exportIgnoredIssues}
              disabled={ignoredIssueEntries.length === 0}
            >
              导出忽略列表
            </button>
          </div>
          {displayedIssueEntries.length === 0 ? (
            <p className="muted">{showIgnoredIssues ? '没有已忽略的问题。' : '内容健康，可以放心导出。'}</p>
          ) : (
            <ul className="issue-list">
              {displayedIssueEntries.map((entry) => (
                <li
                  key={entry.key}
                  className={activeIssueIndex === entry.index ? 'is-active' : ''}
                  onClick={() => focusIssue(entry.issue, entry.index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      focusIssue(entry.issue, entry.index);
                    }
                  }}
                >
                  <div className="issue-main">
                    {renderQualityLabel(entry.issue)}
                    <span className="issue-message">{entry.issue.message}</span>
                    {entry.issue.location ? (
                      <span className="issue-location">
                        第 {entry.issue.location.line}:{entry.issue.location.column} 行
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className="issue-toggle"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleIssueIgnore(entry.key, entry.index);
                      }}
                    >
                      {ignoredIssueKeys[entry.key] ? '恢复' : '忽略'}
                    </button>
                  </div>
                  {issueHints[entry.issue.type] ? (
                    <span className="issue-hint">{issueHints[entry.issue.type]}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};
