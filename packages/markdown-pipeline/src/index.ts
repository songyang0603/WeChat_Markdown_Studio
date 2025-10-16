import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkDeflist from 'remark-deflist';
import remarkEmoji from 'remark-emoji';
import remarkSupersub from 'remark-supersub';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Root, Element, ElementContent, Text } from 'hast';
import type { Root as MdRoot, Heading, Link, Image, Html } from 'mdast';
import type { Node } from 'unist';
import type { ThemeDefinition, InlineStyle } from '@theme-engine/core';
import {
  demoTheme,
  getBlockquoteStyle,
  getHeadingStyle,
  getLinkStyle,
  getListItemStyle,
  getListStyle,
  getParagraphStyle,
  getTableCellStyle,
  getTableHeaderStyle,
  getTableStyle,
  getCodeBlockStyle,
  getInlineCodeStyle,
  mergeInlineStyleString
} from '@theme-engine/core';

const highlightableTypes = new Set([
  'paragraph',
  'heading',
  'list',
  'listItem',
  'blockquote',
  'code',
  'image',
  'link',
  'table',
  'html',
  'thematicBreak'
]);

const remarkStripFrontmatter = () => (tree: MdRoot) => {
  if (!Array.isArray(tree.children)) {
    return;
  }
  tree.children = tree.children.filter((node) => node.type !== 'yaml' && node.type !== 'toml');
};

const remarkAttachSourceLine = () => (tree: MdRoot) => {
  visit(tree, (rawNode) => {
    const node = rawNode as AnnotatedNode;
    if (!node || typeof node.type !== 'string') {
      return;
    }
    if (!highlightableTypes.has(node.type)) {
      return;
    }
    const line = node?.position?.start?.line;
    if (!line) {
      return;
    }
    if (!node.data) {
      node.data = {};
    }
    if (!node.data.hProperties) {
      node.data.hProperties = {};
    }
    if (!node.data.hProperties['data-source-line']) {
      node.data.hProperties['data-source-line'] = line;
    }
  });
};

const applyInlineStyle = (node: Element, style: InlineStyle) => {
  if (!node.properties) {
    node.properties = {};
  }
  const existing =
    typeof node.properties.style === 'string' ? (node.properties.style as string) : undefined;
  node.properties.style = mergeInlineStyleString(existing, style);
};

const createThemePlugin = (theme: ThemeDefinition) => () => (tree: Root) => {
    if (!tree || !Array.isArray(tree.children)) {
      return;
    }

    visit(tree, 'element', (node, _index, parent) => {
      if (!node || typeof node !== 'object') {
        return;
      }

      const parentElement =
        parent && parent.type === 'element' ? (parent as Element) : undefined;

      switch (node.tagName) {
        case 'p': {
          applyInlineStyle(node, getParagraphStyle(theme));
          break;
        }
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6': {
          const level = Number(node.tagName.replace('h', '')) as 1 | 2 | 3 | 4 | 5 | 6;
          applyInlineStyle(node, getHeadingStyle(theme, level));
          break;
        }
        case 'blockquote': {
          applyInlineStyle(node, getBlockquoteStyle(theme));
          break;
        }
        case 'ul':
        case 'ol': {
          applyInlineStyle(node, getListStyle(theme));
          break;
        }
        case 'li': {
          applyInlineStyle(node, getListItemStyle(theme));
          break;
        }
        case 'table': {
          applyInlineStyle(node, getTableStyle(theme));
          break;
        }
        case 'th': {
          applyInlineStyle(node, getTableHeaderStyle(theme));
          break;
        }
        case 'td': {
          applyInlineStyle(node, getTableCellStyle(theme));
          break;
        }
        case 'pre': {
          applyInlineStyle(node, getCodeBlockStyle(theme));
          break;
        }
        case 'code': {
          const isBlockCode = parentElement?.tagName === 'pre';
          if (isBlockCode) {
            applyInlineStyle(node, {
              fontFamily: '"JetBrains Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace',
              fontSize: '13px',
              display: 'block',
              margin: 0
            });
          } else {
            applyInlineStyle(node, getInlineCodeStyle(theme));
          }
          break;
        }
        case 'a': {
          applyInlineStyle(node, getLinkStyle(theme));
          node.properties = {
            ...node.properties,
            target: node.properties?.target ?? '_blank',
            rel: node.properties?.rel ?? 'noopener noreferrer'
          };
          break;
        }
        case 'img': {
          applyInlineStyle(node, { maxWidth: '100%', height: 'auto', borderRadius: '4px' });
          node.properties = {
            ...node.properties,
            loading: node.properties?.loading ?? 'lazy'
          };
          break;
        }
        case 'dl': {
          applyInlineStyle(node, {
            margin: `${theme.tokens.spacing.paragraph ?? 16}px 0`,
            paddingLeft: '0'
          });
          break;
        }
        case 'dt': {
          applyInlineStyle(node, {
            fontWeight: 600,
            marginTop: '12px',
            color: theme.tokens.color.text
          });
          break;
        }
        case 'dd': {
          applyInlineStyle(node, {
            marginLeft: '16px',
            color: theme.tokens.color.text,
            lineHeight: theme.tokens.typography.body.lineHeight
          });
          break;
        }
        case 'mark': {
          applyInlineStyle(node, {
            background: '#fef08a',
            padding: '0 4px',
            borderRadius: '4px'
          });
          break;
        }
        case 'sup':
        case 'sub': {
          applyInlineStyle(node, { fontSize: '0.85em' });
          break;
        }
        default:
          break;
      }
    });
  };

const HIGHLIGHT_REGEX = /==([\s\S]+?)==/g;
type HighlightSegment = { value: string; marked: boolean };

const splitHighlightSegments = (value: string): HighlightSegment[] | null => {
  let lastIndex = 0;
  const segments: HighlightSegment[] = [];
  let match: RegExpExecArray | null;
  HIGHLIGHT_REGEX.lastIndex = 0;

  while ((match = HIGHLIGHT_REGEX.exec(value)) !== null) {
    const [full, captured] = match;
    if (match.index > lastIndex) {
      segments.push({ value: value.slice(lastIndex, match.index), marked: false });
    }
    if (captured && captured.length > 0) {
      segments.push({ value: captured, marked: true });
    }
    lastIndex = match.index + full.length;
  }

  if (segments.length === 0) {
    return null;
  }

  if (lastIndex < value.length) {
    segments.push({ value: value.slice(lastIndex), marked: false });
  }

  return segments;
};

const shouldSkipHighlight = (parent?: Element) => {
  if (!parent) {
    return false;
  }
  const tagName = parent.tagName;
  if (tagName === 'code' || tagName === 'pre' || tagName === 'script' || tagName === 'style') {
    return true;
  }
  return false;
};

const rehypeHighlightMark = () => () => (tree: Root) => {
  visit(tree, 'text', (node, index, parent) => {
    if (!parent || parent.type !== 'element' || typeof index !== 'number') {
      return;
    }

    const parentElement = parent as Element;
    if (shouldSkipHighlight(parentElement)) {
      return;
    }

    const value = (node as Text).value;
    if (!value || value.indexOf('==') === -1) {
      return;
    }

    const segments = splitHighlightSegments(value);
    if (!segments) {
      return;
    }

    const replacement: ElementContent[] = segments.map((segment) => {
      if (segment.marked) {
        return {
          type: 'element',
          tagName: 'mark',
          properties: {},
          children: [{ type: 'text', value: segment.value }] as ElementContent[]
        } as Element;
      }
      return { type: 'text', value: segment.value };
    });

    parentElement.children.splice(index, 1, ...replacement);
    return index + replacement.length;
  });
};

const isWhitespaceText = (node: Node): node is Text => {
  return node.type === 'text' && typeof (node as Text).value === 'string' && (node as Text).value.trim() === '';
};

const extractImagesFromNode = (node: Node): Element[] => {
  if (node.type !== 'element') {
    return [];
  }

  const element = node as Element;
  if (element.tagName === 'img') {
    return [element];
  }

  if (element.tagName === 'p') {
    const images: Element[] = [];
    for (const child of element.children ?? []) {
      if (child.type === 'element' && (child as Element).tagName === 'img') {
        images.push(child as Element);
        continue;
      }
      if (isWhitespaceText(child)) {
        continue;
      }
      return [];
    }
    return images;
  }

  return [];
};

const getSourceLine = (nodes: Node[]): number | undefined => {
  for (const node of nodes) {
    if (node.type === 'element') {
      const element = node as Element;
      const dataSource = element.properties?.['data-source-line'];
      if (typeof dataSource === 'number') {
        return dataSource;
      }
      if (typeof dataSource === 'string') {
        const parsed = Number.parseInt(dataSource, 10);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }
  }
  return undefined;
};

const createImageWrapperNode = (image: Element): Element => {
  const wrapper: Element = {
    type: 'element',
    tagName: 'div',
    properties: {
      className: 'wechat-multi-image-item',
      style:
        'width:100%;overflow:hidden;border-radius:10px;background-color:#f5f7fb;display:flex;align-items:center;justify-content:center;padding:4px;'
    },
    children: []
  };

  const properties = { ...(image.properties ?? {}) };
  const mergedStyle = mergeInlineStyleString(typeof properties.style === 'string' ? properties.style : undefined, {
    width: '100%',
    height: 'auto',
    display: 'block',
    borderRadius: '8px',
    objectFit: 'cover'
  });

  wrapper.children = [
    {
      type: 'element',
      tagName: 'img',
      properties: {
        ...properties,
        style: mergedStyle,
        loading: properties.loading ?? 'lazy'
      },
      children: [] as ElementContent[]
    } as Element
  ];

  return wrapper;
};

const resolveGridColumns = (count: number) => {
  if (count === 2 || count === 4) {
    return 2;
  }
  if (count === 3) {
    return 3;
  }
  return count >= 5 ? 3 : 1;
};

const createMultiImageContainer = (images: Element[], sourceLine?: number): Element => {
  const columns = resolveGridColumns(images.length);
  const containerStyle = [
    'display:grid',
    `grid-template-columns:repeat(${columns},1fr)`,
    'gap:12px',
    'margin:24px auto',
    'width:100%',
    'max-width:760px',
    'align-items:stretch'
  ].join(';');

  const container: Element = {
    type: 'element',
    tagName: 'div',
    properties: {
      className: 'wechat-multi-image-grid',
      style: containerStyle,
      'data-image-count': String(images.length),
      'data-columns': String(columns),
      ...(sourceLine ? { 'data-source-line': sourceLine } : {})
    },
    children: images.map((img) => createImageWrapperNode(img))
  };

  return container;
};

const groupConsecutiveImagesPlugin = () => () => (tree: Root) => {
  if (!tree.children || tree.children.length === 0) {
    return;
  }

  const { children } = tree;
  let index = 0;

  while (index < children.length) {
    const startIndex = index;
    const sequenceNodes: Node[] = [];
    const images: Element[] = [];

    while (index < children.length) {
      const current = children[index];

      if (isWhitespaceText(current)) {
        sequenceNodes.push(current);
        index += 1;
        continue;
      }

      const extracted = extractImagesFromNode(current);
      if (extracted.length === 0) {
        break;
      }

      sequenceNodes.push(current);
      images.push(...extracted);
      index += 1;
    }

    if (images.length >= 2) {
      const sequenceLength = sequenceNodes.length;
      const sourceLine = getSourceLine(sequenceNodes);
      const container = createMultiImageContainer(images, sourceLine);
      children.splice(startIndex, sequenceLength, container);
      index = startIndex + 1;
    } else {
      index = startIndex + 1;
    }
  }
};

export interface RenderOptions {
  /**
   * 是否将主题行内样式应用到生成的 HTML。
   * 默认开启，可在特殊场景下关闭。
   */
  inlineStyles?: boolean;
  /**
   * 指定要应用的主题；若未传入则使用 demoTheme。
   */
  theme?: ThemeDefinition;
}

export const renderMarkdownToHtml = async (markdown: string, options: RenderOptions = {}) => {
  const theme = options.theme ?? demoTheme;
  const inlineStyles = options.inlineStyles ?? true;

  let processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml', 'toml'])
    .use(remarkStripFrontmatter)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkDeflist)
    .use(remarkEmoji, { emoticon: true })
    .use(remarkSupersub)
    .use(remarkAttachSourceLine)
    .use(remarkRehype, { allowDangerousHtml: true });

  processor = processor.use(rehypeHighlightMark());
  processor = processor.use(rehypeKatex);

  if (inlineStyles) {
    processor = processor.use(createThemePlugin(theme));
  }

  processor = processor.use(groupConsecutiveImagesPlugin());
  processor = processor.use(rehypeStringify, { allowDangerousHtml: true });

  const result = await processor.process(markdown);
  return String(result);
};

export type QualityIssueType =
  | 'link-protocol'
  | 'structure'
  | 'accessibility'
  | 'image-reference'
  | 'html-embed';

export interface QualityIssue {
  type: QualityIssueType;
  message: string;
  location?: { line: number; column: number };
}

const toLocation = (node: { position?: { start?: { line?: number; column?: number } } }) => {
  const line = node.position?.start?.line;
  const column = node.position?.start?.column;
  if (typeof line === 'number' && typeof column === 'number') {
    return { line, column };
  }
  return undefined;
};

export const runQualityChecks = (markdown: string): QualityIssue[] => {
  const tree = unified().use(remarkParse).parse(markdown) as MdRoot;
  const issues: QualityIssue[] = [];

  const warn = (issue: QualityIssue) => {
    issues.push(issue);
  };

  let lastHeadingDepth: number | null = null;
  visit(tree, 'heading', (node: Heading) => {
    if (lastHeadingDepth !== null && node.depth > lastHeadingDepth + 1) {
      warn({
        type: 'structure',
        message: `标题层级从 H${lastHeadingDepth} 跳跃到 H${node.depth}，建议按顺序递进。`,
        location: toLocation(node)
      });
    }
    lastHeadingDepth = node.depth;

    const headingText = node.children
      .map((child) => ('value' in child ? String(child.value) : ''))
      .join('')
      .trim();
    if (headingText.length > 48) {
      warn({
        type: 'structure',
        message: `标题“${headingText.slice(0, 20)}…”较长，建议控制在 48 字以内以提升阅读体验。`,
        location: toLocation(node)
      });
    }
  });

  visit(tree, 'link', (node: Link) => {
    if (node.url.startsWith('http://')) {
      warn({
        type: 'link-protocol',
        message: `链接 "${node.url}" 非 HTTPS，微信可能会拦截或提示风险。`,
        location: toLocation(node)
      });
    }

    if (!node.children || node.children.length === 0) {
      warn({
        type: 'accessibility',
        message: `链接 "${node.url}" 缺少可读文本，建议补充描述。`,
        location: toLocation(node)
      });
    }
  });

  visit(tree, 'image', (node: Image) => {
    if (!node.url.includes('://') && !node.url.startsWith('data:')) {
      warn({
        type: 'image-reference',
        message: `图片 "${node.url}" 可能为本地路径，建议使用公网地址或上传至素材库。`,
        location: toLocation(node)
      });
    }

    if (node.url.startsWith('http://')) {
      warn({
        type: 'link-protocol',
        message: `图片链接 "${node.url}" 非 HTTPS，微信可能无法正常加载。`,
        location: toLocation(node)
      });
    }

    if (!node.alt || node.alt.trim().length === 0) {
      warn({
        type: 'accessibility',
        message: `图片 "${node.url}" 缺少替代文本 (alt)，建议补充以提升可访问性。`,
        location: toLocation(node)
      });
    }
  });

  visit(tree, 'html', (node: Html) => {
    warn({
      type: 'html-embed',
      message: '检测到内嵌 HTML 代码，发布到公众号前请确认兼容性与安全性。',
      location: toLocation(node)
    });
  });

  return issues;
};
type AnnotatedNode = Node & {
  type: string;
  position?: { start?: { line?: number; column?: number } };
  data?: { hProperties?: Record<string, unknown> };
};
