import { z } from 'zod';

export const themeTokenSchema = z.object({
  color: z.record(z.string()),
  typography: z.object({
    fontFamily: z.string(),
    heading: z.object({
      lineHeight: z.number(),
      weight: z.number(),
      fontFamily: z.string().optional()
    }),
    body: z.object({
      lineHeight: z.number(),
      weight: z.number(),
      fontFamily: z.string().optional()
    })
  }),
  spacing: z.record(z.number()),
  border: z
    .object({
      radius: z.number().optional(),
      width: z.number().optional()
    })
    .optional()
});

export const themeComponentSchema = z.record(
  z.string(),
  z.any(), // fine-tune per component later; keep flexible for MVP
);

export const themeSchema = z.object({
  id: z.string(),
  version: z.string(),
  metadata: z.object({
    name: z.string(),
    author: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional()
  }),
  tokens: themeTokenSchema,
  components: themeComponentSchema
});

export type ThemeDefinition = z.infer<typeof themeSchema>;

export const validateTheme = (theme: unknown): ThemeDefinition => {
  return themeSchema.parse(theme);
};

export type InlineStyle = Record<string, string | number | undefined>;

const hyphenate = (prop: string) => prop.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

export const styleObjectToString = (style: InlineStyle): string => {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      const stringValue = typeof value === 'number' ? value.toString() : value;
      return `${hyphenate(key)}:${stringValue}`;
    })
    .join(';');
};

export const mergeInlineStyleString = (base: string | undefined, next: InlineStyle): string => {
  const nextString = styleObjectToString(next);
  if (!base) {
    return nextString;
  }

  return `${base};${nextString}`;
};

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const resolveHeadingFontFamily = (theme: ThemeDefinition) =>
  theme.tokens.typography.heading.fontFamily ?? theme.tokens.typography.fontFamily;

const resolveBodyFontFamily = (theme: ThemeDefinition) =>
  theme.tokens.typography.body.fontFamily ?? theme.tokens.typography.fontFamily;

export const getParagraphStyle = (theme: ThemeDefinition): InlineStyle => {
  const paragraph = theme.components.paragraph as { maxWidth?: number } | undefined;
  return {
    color: theme.tokens.color.text,
    fontFamily: resolveBodyFontFamily(theme),
    fontWeight: theme.tokens.typography.body.weight,
    lineHeight: theme.tokens.typography.body.lineHeight,
    fontSize: '16px',
    marginBottom: `${theme.tokens.spacing.paragraph ?? 16}px`,
    maxWidth: paragraph?.maxWidth ? `${paragraph.maxWidth}px` : undefined
  };
};

export const getHeadingStyle = (theme: ThemeDefinition, level: HeadingLevel): InlineStyle => {
  const heading = (theme.components.heading as Record<string, { fontSize?: number; fontWeight?: number }> | undefined)?.[`h${level}`];
  const sizeFallback = Math.max(16, 36 - (level - 1) * 4);

  return {
    color: theme.tokens.color.text,
    fontFamily: resolveHeadingFontFamily(theme),
    fontWeight: heading?.fontWeight ?? theme.tokens.typography.heading.weight,
    lineHeight: theme.tokens.typography.heading.lineHeight,
    fontSize: `${heading?.fontSize ?? sizeFallback}px`,
    marginTop: level === 1 ? '0' : `${theme.tokens.spacing.section ?? 24}px`,
    marginBottom: `${theme.tokens.spacing.paragraph ?? 16}px`
  };
};

export const getBlockquoteStyle = (theme: ThemeDefinition): InlineStyle => {
  const blockquote = theme.components.blockquote as {
    accentColor?: keyof ThemeDefinition['tokens']['color'] | string;
    borderWidth?: number;
    background?: string;
  } | undefined;

  const borderColorKey = blockquote?.accentColor;
  const borderColor =
    borderColorKey && theme.tokens.color[borderColorKey]
      ? theme.tokens.color[borderColorKey]
      : blockquote?.accentColor ?? theme.tokens.color.primary;

  return {
    color: theme.tokens.color.text,
    fontFamily: resolveBodyFontFamily(theme),
    lineHeight: theme.tokens.typography.body.lineHeight,
    padding: `${theme.tokens.spacing.paragraph ?? 16}px`,
    margin: `${theme.tokens.spacing.paragraph ?? 16}px 0`,
    borderLeft: `${blockquote?.borderWidth ?? 3}px solid ${borderColor}`,
    background: blockquote?.background ?? theme.tokens.color.muted ?? '#F5F8FF'
  };
};

export const getListStyle = (theme: ThemeDefinition): InlineStyle => {
  return {
    color: theme.tokens.color.text,
    fontFamily: resolveBodyFontFamily(theme),
    lineHeight: theme.tokens.typography.body.lineHeight,
    marginBottom: `${theme.tokens.spacing.paragraph ?? 16}px`,
    paddingLeft: '24px'
  };
};

export const getListItemStyle = (theme: ThemeDefinition): InlineStyle => {
  const baseSpacing = theme.tokens.spacing.paragraph ?? 16;
  return {
    marginBottom: `${Math.round(baseSpacing / 2)}px`
  };
};

export const getLinkStyle = (theme: ThemeDefinition): InlineStyle => {
  return {
    color: theme.tokens.color.primary,
    textDecoration: 'none',
    fontFamily: resolveBodyFontFamily(theme)
  };
};

export const getTableStyle = (theme: ThemeDefinition): InlineStyle => {
  return {
    width: '100%',
    borderCollapse: 'collapse',
    margin: `${theme.tokens.spacing.paragraph ?? 16}px 0`,
    fontFamily: resolveBodyFontFamily(theme),
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
    borderSpacing: 0,
    overflow: 'hidden',
    border: '1px solid rgba(15, 23, 42, 0.08)'
  };
};

export const getTableHeaderStyle = (theme: ThemeDefinition): InlineStyle => {
  return {
    background: theme.tokens.color.primary,
    color: '#ffffff',
    textAlign: 'left',
    padding: '14px 18px',
    fontWeight: 600,
    fontSize: '14px',
    borderBottom: '1px solid rgba(255,255,255,0.2)'
  };
};

export const getTableCellStyle = (theme: ThemeDefinition): InlineStyle => {
  return {
    padding: '14px 18px',
    borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
    fontSize: '13px',
    color: theme.tokens.color.text,
    background: '#ffffff'
  };
};

export const getCodeBlockStyle = (theme: ThemeDefinition): InlineStyle => {
  return {
    fontFamily: '"JetBrains Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace',
    background: '#121826',
    color: '#f8fafc',
    padding: '32px 24px 24px',
    borderRadius: '18px',
    margin: `${theme.tokens.spacing.paragraph ?? 16}px 0`,
    overflowX: 'auto',
    boxShadow: '0 24px 48px rgba(15, 23, 42, 0.32)',
    border: '1px solid rgba(255,255,255,0.08)',
    position: 'relative'
  };
};

export const getInlineCodeStyle = (theme: ThemeDefinition): InlineStyle => {
  return {
    fontFamily: '"JetBrains Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace',
    background: 'rgba(37, 99, 235, 0.08)',
    color: theme.tokens.color.primary,
    padding: '2px 6px',
    borderRadius: '6px',
    fontSize: '12px'
  };
};

export const demoTheme: ThemeDefinition = {
  id: 'tech-minimal',
  version: '0.1.0',
  metadata: {
    name: 'Tech Minimal',
    author: 'Core Team',
    description: '简洁科技风配色，适合科技/效率类文章。',
    tags: ['tech', 'minimal']
  },
  tokens: {
    color: {
      primary: '#1A73E8',
      text: '#2B2B2B',
      background: '#FFFFFF',
      muted: '#F5F8FF'
    },
    typography: {
      fontFamily: 'PingFang SC, "Helvetica Neue", Helvetica, Arial, sans-serif',
      heading: {
        lineHeight: 1.4,
        weight: 600,
        fontFamily: 'PingFang SC, "Helvetica Neue", Helvetica, Arial, sans-serif'
      },
      body: {
        lineHeight: 1.7,
        weight: 400,
        fontFamily: 'PingFang SC, "Helvetica Neue", Helvetica, Arial, sans-serif'
      }
    },
    spacing: {
      paragraph: 16,
      section: 32,
      blockquote: 20
    },
    border: {
      radius: 8,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 680
    },
    heading: {
      h1: { fontSize: 34 },
      h2: { fontSize: 28 },
      h3: { fontSize: 22 }
    },
    blockquote: {
      accentColor: 'primary',
      borderWidth: 3,
      background: '#F1F6FF'
    },
    callout: {
      background: '#F5F8FF',
      icon: 'info',
      padding: { x: 16, y: 12 }
    }
  }
};

export const warmNoteTheme: ThemeDefinition = {
  id: 'warm-note',
  version: '0.1.0',
  metadata: {
    name: '暖意手帐',
    author: 'Core Team',
    description: '手帐风格，暖色调配合柔性标题，适合生活方式/品牌软文。',
    tags: ['lifestyle', 'brand']
  },
  tokens: {
    color: {
      primary: '#F97316',
      text: '#2D2A26',
      background: '#FFFDF8',
      muted: '#FFF6EB'
    },
    typography: {
      fontFamily: 'Hiragino Mincho ProN, "Songti SC", "PingFang SC", "Microsoft YaHei", serif',
      heading: {
        lineHeight: 1.5,
        weight: 500,
        fontFamily: 'Hiragino Mincho ProN, "Songti SC", "PingFang SC", "Microsoft YaHei", serif'
      },
      body: {
        lineHeight: 1.8,
        weight: 400,
        fontFamily: 'Hiragino Sans, "PingFang SC", "Microsoft YaHei", sans-serif'
      }
    },
    spacing: {
      paragraph: 18,
      section: 36,
      blockquote: 24
    },
    border: {
      radius: 12,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 640
    },
    heading: {
      h1: { fontSize: 32, fontWeight: 600 },
      h2: { fontSize: 26, fontWeight: 500 },
      h3: { fontSize: 22, fontWeight: 500 }
    },
    blockquote: {
      accentColor: '#F97316',
      borderWidth: 2,
      background: '#FFF0E0'
    },
    callout: {
      background: '#FFF6EB',
      icon: 'sparkle',
      padding: { x: 18, y: 14 }
    }
  }
};

export const techSpectrumTheme: ThemeDefinition = {
  id: 'tech-spectrum',
  version: '0.1.0',
  metadata: {
    name: '技术蓝谱',
    author: 'Studio Preset',
    description: '高对比科技主题，适合技术教程与产品发布。',
    tags: ['tech', 'product']
  },
  tokens: {
    color: {
      primary: '#0B5FFF',
      text: '#1C2333',
      background: '#FFFFFF',
      muted: '#F1F5FF'
    },
    typography: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      heading: {
        lineHeight: 1.35,
        weight: 700,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
      },
      body: {
        lineHeight: 1.8,
        weight: 400,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
      }
    },
    spacing: {
      paragraph: 18,
      section: 36,
      blockquote: 22
    },
    border: {
      radius: 14,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 720
    },
    heading: {
      h1: { fontSize: 30, fontWeight: 700 },
      h2: { fontSize: 26, fontWeight: 700 },
      h3: { fontSize: 22, fontWeight: 600 }
    },
    blockquote: {
      accentColor: '#0B5FFF',
      borderWidth: 4,
      background: '#EEF4FF'
    },
    callout: {
      background: '#EEF4FF',
      icon: 'sparkle',
      padding: { x: 18, y: 14 }
    }
  }
};

export const elegantMediaTheme: ThemeDefinition = {
  id: 'elegant-media',
  version: '0.1.0',
  metadata: {
    name: '媒体雅致',
    author: 'Studio Preset',
    description: '温润杂志风排版，适合媒体报道、生活方式内容。',
    tags: ['media', 'lifestyle']
  },
  tokens: {
    color: {
      primary: '#FFA000',
      text: '#33302E',
      background: '#FFFDF8',
      muted: '#FFF4E0'
    },
    typography: {
      fontFamily: '"Source Serif Pro", "Songti SC", Georgia, serif',
      heading: {
        lineHeight: 1.45,
        weight: 600,
        fontFamily: '"Source Serif Pro", "Songti SC", Georgia, serif'
      },
      body: {
        lineHeight: 1.85,
        weight: 400,
        fontFamily: '"Source Sans Pro", "PingFang SC", "Microsoft YaHei", sans-serif'
      }
    },
    spacing: {
      paragraph: 20,
      section: 42,
      blockquote: 28
    },
    border: {
      radius: 16,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 680
    },
    heading: {
      h1: { fontSize: 32, fontWeight: 600 },
      h2: { fontSize: 28, fontWeight: 600 },
      h3: { fontSize: 22, fontWeight: 500 }
    },
    blockquote: {
      accentColor: '#FFA000',
      borderWidth: 4,
      background: '#FFF4E0'
    },
    callout: {
      background: '#FFF4E0',
      icon: 'info',
      padding: { x: 20, y: 16 }
    }
  }
};

export const wechatDefaultTheme: ThemeDefinition = {
  id: 'wechat-default',
  version: '0.1.0',
  metadata: {
    name: '默认公众号',
    author: 'Studio Preset',
    description: '复刻公众号常用的官方排版，适合公告、宣发与活动资讯。',
    tags: ['wechat', 'general']
  },
  tokens: {
    color: {
      primary: '#3498db',
      text: '#3f3f3f',
      background: '#ffffff',
      muted: '#fafafa'
    },
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      heading: {
        lineHeight: 1.4,
        weight: 600,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      },
      body: {
        lineHeight: 1.8,
        weight: 400,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }
    },
    spacing: {
      paragraph: 16,
      section: 32,
      blockquote: 20
    },
    border: {
      radius: 12,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 740
    },
    heading: {
      h1: { fontSize: 24, fontWeight: 600 },
      h2: { fontSize: 22, fontWeight: 600 },
      h3: { fontSize: 20, fontWeight: 600 }
    },
    blockquote: {
      accentColor: '#3498db',
      borderWidth: 3,
      background: '#fafafa'
    },
    callout: {
      background: '#f5f8ff',
      icon: 'info',
      padding: { x: 16, y: 12 }
    }
  }
};

export const wechatTechTheme: ThemeDefinition = {
  id: 'wechat-tech',
  version: '0.1.0',
  metadata: {
    name: '科技质感',
    author: 'Studio Preset',
    description: '强调信息结构与高对比配色，适合产品发布、功能路线图。',
    tags: ['wechat', 'tech']
  },
  tokens: {
    color: {
      primary: '#0066cc',
      text: '#1a1a1a',
      background: '#ffffff',
      muted: '#f5f9fc'
    },
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      heading: {
        lineHeight: 1.35,
        weight: 700,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      },
      body: {
        lineHeight: 1.8,
        weight: 400,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }
    },
    spacing: {
      paragraph: 18,
      section: 34,
      blockquote: 22
    },
    border: {
      radius: 14,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 760
    },
    heading: {
      h1: { fontSize: 26, fontWeight: 700 },
      h2: { fontSize: 22, fontWeight: 700 },
      h3: { fontSize: 20, fontWeight: 600 }
    },
    blockquote: {
      accentColor: '#2196f3',
      borderWidth: 4,
      background: '#f5f9fc'
    },
    callout: {
      background: '#eef4ff',
      icon: 'sparkle',
      padding: { x: 18, y: 14 }
    }
  }
};

export const wechatElegantTheme: ThemeDefinition = {
  id: 'wechat-elegant',
  version: '0.1.0',
  metadata: {
    name: '优雅简约',
    author: 'Studio Preset',
    description: '宋体与长行距布局，适合文化类长文与品牌故事。',
    tags: ['wechat', 'culture']
  },
  tokens: {
    color: {
      primary: '#8B7355',
      text: '#333333',
      background: '#FFFFFF',
      muted: '#F9F6F0'
    },
    typography: {
      fontFamily: '"Songti SC", "SimSun", Georgia, serif',
      heading: {
        lineHeight: 1.5,
        weight: 400,
        fontFamily: '"Songti SC", "SimSun", Georgia, serif'
      },
      body: {
        lineHeight: 2,
        weight: 400,
        fontFamily: '"Songti SC", "SimSun", Georgia, serif'
      }
    },
    spacing: {
      paragraph: 20,
      section: 36,
      blockquote: 24
    },
    border: {
      radius: 10,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 720
    },
    heading: {
      h1: { fontSize: 28, fontWeight: 400 },
      h2: { fontSize: 24, fontWeight: 400 },
      h3: { fontSize: 20, fontWeight: 400 }
    },
    blockquote: {
      accentColor: '#C0AA82',
      borderWidth: 2,
      background: '#FAF5E9'
    },
    callout: {
      background: '#FAF5E9',
      icon: 'bookmark',
      padding: { x: 18, y: 14 }
    }
  }
};

export const wechatDeepReadTheme: ThemeDefinition = {
  id: 'wechat-deepread',
  version: '0.1.0',
  metadata: {
    name: '深度阅读',
    author: 'Studio Preset',
    description: '强调正文可读性与章节层级，适合长篇深度稿件。',
    tags: ['wechat', 'longform']
  },
  tokens: {
    color: {
      primary: '#0A0A0A',
      text: '#1A1A1A',
      background: '#FFFFFF',
      muted: '#F6F8FA'
    },
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      heading: {
        lineHeight: 1.35,
        weight: 700,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      },
      body: {
        lineHeight: 1.85,
        weight: 400,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }
    },
    spacing: {
      paragraph: 22,
      section: 40,
      blockquote: 26
    },
    border: {
      radius: 10,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 680
    },
    heading: {
      h1: { fontSize: 32, fontWeight: 700 },
      h2: { fontSize: 28, fontWeight: 700 },
      h3: { fontSize: 22, fontWeight: 600 }
    },
    blockquote: {
      accentColor: '#0A0A0A',
      borderWidth: 4,
      background: '#F8F9FA'
    },
    callout: {
      background: '#F1F2F5',
      icon: 'insight',
      padding: { x: 20, y: 16 }
    }
  }
};

export const wechatNytTheme: ThemeDefinition = {
  id: 'wechat-nyt',
  version: '0.1.0',
  metadata: {
    name: '纽约时报',
    author: 'Studio Preset',
    description: '经典报纸排版风格，适用于国际新闻与深度解读。',
    tags: ['wechat', 'news']
  },
  tokens: {
    color: {
      primary: '#326891',
      text: '#121212',
      background: '#FFFFFF',
      muted: '#F7F7F7'
    },
    typography: {
      fontFamily: 'Georgia, "Times New Roman", Times, serif',
      heading: {
        lineHeight: 1.3,
        weight: 700,
        fontFamily: 'Georgia, "Times New Roman", Times, serif'
      },
      body: {
        lineHeight: 1.8,
        weight: 400,
        fontFamily: 'Georgia, "Times New Roman", Times, serif'
      }
    },
    spacing: {
      paragraph: 20,
      section: 42,
      blockquote: 28
    },
    border: {
      radius: 8,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 680
    },
    heading: {
      h1: { fontSize: 42, fontWeight: 700 },
      h2: { fontSize: 32, fontWeight: 700 },
      h3: { fontSize: 24, fontWeight: 700 }
    },
    blockquote: {
      accentColor: '#121212',
      borderWidth: 5,
      background: '#F7F7F7'
    },
    callout: {
      background: '#EFF3F8',
      icon: 'newspaper',
      padding: { x: 18, y: 14 }
    }
  }
};

export const wechatFtTheme: ThemeDefinition = {
  id: 'wechat-ft',
  version: '0.1.0',
  metadata: {
    name: '金融时报',
    author: 'Studio Preset',
    description: '金融时报风格配色，适用于财经评论、宏观分析。',
    tags: ['wechat', 'finance']
  },
  tokens: {
    color: {
      primary: '#990F3D',
      text: '#33302E',
      background: '#FFF1E5',
      muted: '#FBE6D7'
    },
    typography: {
      fontFamily: 'Georgia, "Times New Roman", Times, serif',
      heading: {
        lineHeight: 1.35,
        weight: 600,
        fontFamily: 'Georgia, "Times New Roman", Times, serif'
      },
      body: {
        lineHeight: 1.78,
        weight: 400,
        fontFamily: 'Georgia, "Times New Roman", Times, serif'
      }
    },
    spacing: {
      paragraph: 20,
      section: 38,
      blockquote: 26
    },
    border: {
      radius: 10,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 680
    },
    heading: {
      h1: { fontSize: 38, fontWeight: 600 },
      h2: { fontSize: 30, fontWeight: 600 },
      h3: { fontSize: 24, fontWeight: 600 }
    },
    blockquote: {
      accentColor: '#990F3D',
      borderWidth: 4,
      background: '#FBE3EB'
    },
    callout: {
      background: '#F7D9DD',
      icon: 'finance',
      padding: { x: 20, y: 16 }
    }
  }
};

export const wechatJonyIveTheme: ThemeDefinition = {
  id: 'wechat-jonyive',
  version: '0.1.0',
  metadata: {
    name: 'Jony Ive 极简',
    author: 'Studio Preset',
    description: 'Apple 式留白与大标题排版，适合设计故事与品牌宣言。',
    tags: ['wechat', 'minimal']
  },
  tokens: {
    color: {
      primary: '#1D1D1F',
      text: '#6E6E73',
      background: '#FBFBFD',
      muted: '#F5F5F7'
    },
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      heading: {
        lineHeight: 1.2,
        weight: 500,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif'
      },
      body: {
        lineHeight: 1.65,
        weight: 300,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif'
      }
    },
    spacing: {
      paragraph: 28,
      section: 54,
      blockquote: 32
    },
    border: {
      radius: 14,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 620
    },
    heading: {
      h1: { fontSize: 56, fontWeight: 200 },
      h2: { fontSize: 40, fontWeight: 300 },
      h3: { fontSize: 28, fontWeight: 400 }
    },
    blockquote: {
      accentColor: '#1D1D1F',
      borderWidth: 2,
      background: '#F5F5F7'
    },
    callout: {
      background: '#F0F0F3',
      icon: 'sparkle',
      padding: { x: 22, y: 18 }
    }
  }
};

export const wechatMediumTheme: ThemeDefinition = {
  id: 'wechat-medium',
  version: '0.1.0',
  metadata: {
    name: 'Medium 长文',
    author: 'Studio Preset',
    description: '借鉴 Medium 的大字号与舒适行距，适合长篇观点文章。',
    tags: ['wechat', 'essay']
  },
  tokens: {
    color: {
      primary: '#242424',
      text: '#242424',
      background: '#FFFFFF',
      muted: '#F7F7F7'
    },
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      heading: {
        lineHeight: 1.25,
        weight: 700,
        fontFamily: 'Georgia, "Times New Roman", serif'
      },
      body: {
        lineHeight: 1.6,
        weight: 400,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }
    },
    spacing: {
      paragraph: 24,
      section: 44,
      blockquote: 30
    },
    border: {
      radius: 12,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 680
    },
    heading: {
      h1: { fontSize: 42, fontWeight: 700 },
      h2: { fontSize: 34, fontWeight: 700 },
      h3: { fontSize: 28, fontWeight: 700 }
    },
    blockquote: {
      accentColor: '#242424',
      borderWidth: 3,
      background: '#F5F5F5'
    },
    callout: {
      background: '#F0F0F0',
      icon: 'note',
      padding: { x: 22, y: 18 }
    }
  }
};

export const wechatAppleTheme: ThemeDefinition = {
  id: 'wechat-apple',
  version: '0.1.0',
  metadata: {
    name: 'Apple 极简',
    author: 'Studio Preset',
    description: '柔雅留白与高对比标题，适用于新品发布与品牌指南。',
    tags: ['wechat', 'design']
  },
  tokens: {
    color: {
      primary: '#0066CC',
      text: '#1D1D1F',
      background: '#FBFBFD',
      muted: '#F5F5F7'
    },
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      heading: {
        lineHeight: 1.2,
        weight: 600,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif'
      },
      body: {
        lineHeight: 1.65,
        weight: 400,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif'
      }
    },
    spacing: {
      paragraph: 24,
      section: 44,
      blockquote: 30
    },
    border: {
      radius: 14,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 640
    },
    heading: {
      h1: { fontSize: 48, fontWeight: 600 },
      h2: { fontSize: 36, fontWeight: 600 },
      h3: { fontSize: 28, fontWeight: 600 }
    },
    blockquote: {
      accentColor: '#1D1D1F',
      borderWidth: 2,
      background: '#F5F5F7'
    },
    callout: {
      background: '#F0F0F3',
      icon: 'sparkle',
      padding: { x: 20, y: 16 }
    }
  }
};

export const wechatAnthropicTheme: ThemeDefinition = {
  id: 'wechat-anthropic',
  version: '0.1.0',
  metadata: {
    name: 'Claude 优雅',
    author: 'Studio Preset',
    description: '渐变高光与暖色强调，适用于 AI 研究摘要与产品灵感。',
    tags: ['wechat', 'ai']
  },
  tokens: {
    color: {
      primary: '#C15F3C',
      text: '#2B2B2B',
      background: '#FAF9F7',
      muted: '#F4ECE4'
    },
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      heading: {
        lineHeight: 1.28,
        weight: 600,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif'
      },
      body: {
        lineHeight: 1.75,
        weight: 400,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif'
      }
    },
    spacing: {
      paragraph: 28,
      section: 52,
      blockquote: 32
    },
    border: {
      radius: 16,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 700
    },
    heading: {
      h1: { fontSize: 48, fontWeight: 600 },
      h2: { fontSize: 36, fontWeight: 600 },
      h3: { fontSize: 28, fontWeight: 600 }
    },
    blockquote: {
      accentColor: '#C15F3C',
      borderWidth: 4,
      background: '#F8EDE7'
    },
    callout: {
      background: '#F5E2D7',
      icon: 'sparkle',
      padding: { x: 22, y: 18 }
    }
  }
};

export const latepostDepthTheme: ThemeDefinition = {
  id: 'latepost-depth',
  version: '0.1.0',
  metadata: {
    name: 'LatePost 深度',
    author: 'Studio Preset',
    description: '借鉴深度报道排版，突出权威、严谨的资讯类内容。',
    tags: ['media', 'investigation']
  },
  tokens: {
    color: {
      primary: '#d32f2f',
      text: '#1a1a1a',
      background: '#ffffff',
      muted: '#f5f5f5'
    },
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
      heading: {
        lineHeight: 1.4,
        weight: 700,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
      },
      body: {
        lineHeight: 1.9,
        weight: 400,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
      }
    },
    spacing: {
      paragraph: 20,
      section: 44,
      blockquote: 28
    },
    border: {
      radius: 10,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 700
    },
    heading: {
      h1: { fontSize: 32, fontWeight: 700 },
      h2: { fontSize: 24, fontWeight: 600 },
      h3: { fontSize: 20, fontWeight: 600 }
    },
    blockquote: {
      accentColor: '#d32f2f',
      borderWidth: 4,
      background: '#f5f5f5'
    },
    callout: {
      background: '#fee2e2',
      icon: 'alert',
      padding: { x: 20, y: 16 }
    }
  }
};

export const kenyaEmptinessTheme: ThemeDefinition = {
  id: 'kenya-emptiness',
  version: '0.1.0',
  metadata: {
    name: '原研哉·空',
    author: 'Studio Preset',
    description: '大量留白与轻量排版，适用于展览记事、设计随笔。',
    tags: ['design', 'minimal']
  },
  tokens: {
    color: {
      primary: '#999999',
      text: '#333333',
      background: '#FFFFFF',
      muted: '#F5F5F5'
    },
    typography: {
      fontFamily: '"Hiragino Sans", "PingFang SC", "Microsoft YaHei", sans-serif',
      heading: {
        lineHeight: 2,
        weight: 300,
        fontFamily: '"Hiragino Sans", "PingFang SC", "Microsoft YaHei", sans-serif'
      },
      body: {
        lineHeight: 2.4,
        weight: 300,
        fontFamily: '"Hiragino Sans", "PingFang SC", "Microsoft YaHei", sans-serif'
      }
    },
    spacing: {
      paragraph: 32,
      section: 60,
      blockquote: 40
    },
    border: {
      radius: 4,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 640
    },
    heading: {
      h1: { fontSize: 24, fontWeight: 300 },
      h2: { fontSize: 18, fontWeight: 300 },
      h3: { fontSize: 16, fontWeight: 400 }
    },
    blockquote: {
      accentColor: '#E0E0E0',
      borderWidth: 1,
      background: '#FFFFFF'
    },
    callout: {
      background: '#F5F5F5',
      icon: 'insight',
      padding: { x: 18, y: 14 }
    }
  }
};

export const hischeEditorialTheme: ThemeDefinition = {
  id: 'hische-editorial',
  version: '0.1.0',
  metadata: {
    name: 'Hische·编辑部',
    author: 'Studio Preset',
    description: '杂志编辑部风格，强调 serif 字体与装饰性边框。',
    tags: ['editorial', 'magazine']
  },
  tokens: {
    color: {
      primary: '#C9302C',
      text: '#2C2C2C',
      background: '#FFFEF9',
      muted: '#FDF1EB'
    },
    typography: {
      fontFamily: '"Crimson Text", Garamond, serif',
      heading: {
        lineHeight: 1.3,
        weight: 400,
        fontFamily: '"Bodoni MT", "Didot", serif'
      },
      body: {
        lineHeight: 1.75,
        weight: 400,
        fontFamily: '"Crimson Text", Garamond, serif'
      }
    },
    spacing: {
      paragraph: 24,
      section: 44,
      blockquote: 30
    },
    border: {
      radius: 8,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 700
    },
    heading: {
      h1: { fontSize: 52, fontWeight: 400 },
      h2: { fontSize: 38, fontWeight: 400 },
      h3: { fontSize: 30, fontWeight: 400 }
    },
    blockquote: {
      accentColor: '#C9302C',
      borderWidth: 4,
      background: '#F9F3EE'
    },
    callout: {
      background: '#F7E6E0',
      icon: 'bookmark',
      padding: { x: 20, y: 16 }
    }
  }
};

export const andoConcreteTheme: ThemeDefinition = {
  id: 'ando-concrete',
  version: '0.1.0',
  metadata: {
    name: '安藤·清水',
    author: 'Studio Preset',
    description: '灵感来自安藤忠雄清水混凝土风格，强调秩序与克制。',
    tags: ['architecture', 'minimal']
  },
  tokens: {
    color: {
      primary: '#2A2A2A',
      text: '#4A4A4A',
      background: '#FFFFFF',
      muted: '#F6F6F6'
    },
    typography: {
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      heading: {
        lineHeight: 1.6,
        weight: 400,
        fontFamily: '"Helvetica Neue", Arial, sans-serif'
      },
      body: {
        lineHeight: 2,
        weight: 400,
        fontFamily: '"Helvetica Neue", Arial, sans-serif'
      }
    },
    spacing: {
      paragraph: 30,
      section: 50,
      blockquote: 34
    },
    border: {
      radius: 6,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 600
    },
    heading: {
      h1: { fontSize: 28, fontWeight: 300 },
      h2: { fontSize: 20, fontWeight: 400 },
      h3: { fontSize: 17, fontWeight: 400 }
    },
    blockquote: {
      accentColor: '#D0D0D0',
      borderWidth: 1,
      background: '#FFFFFF'
    },
    callout: {
      background: '#EFEFEF',
      icon: 'insight',
      padding: { x: 18, y: 14 }
    }
  }
};

export const gaudiOrganicTheme: ThemeDefinition = {
  id: 'gaudi-organic',
  version: '0.1.0',
  metadata: {
    name: '高迪·有机',
    author: 'Studio Preset',
    description: '灵动有机的色块与渐变，适合创意策划与体验报告。',
    tags: ['creative', 'story']
  },
  tokens: {
    color: {
      primary: '#FF6B6B',
      text: '#3D2914',
      background: '#FFF5E6',
      muted: '#FFE9C6'
    },
    typography: {
      fontFamily: '"Baskerville", "Georgia", serif',
      heading: {
        lineHeight: 1.3,
        weight: 600,
        fontFamily: '"Baskerville", "Georgia", serif'
      },
      body: {
        lineHeight: 1.9,
        weight: 400,
        fontFamily: '"Baskerville", "Georgia", serif'
      }
    },
    spacing: {
      paragraph: 22,
      section: 42,
      blockquote: 30
    },
    border: {
      radius: 14,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 700
    },
    heading: {
      h1: { fontSize: 52, fontWeight: 700 },
      h2: { fontSize: 38, fontWeight: 600 },
      h3: { fontSize: 28, fontWeight: 600 }
    },
    blockquote: {
      accentColor: '#FF6B6B',
      borderWidth: 3,
      background: '#FFE6D3'
    },
    callout: {
      background: '#FFE0B2',
      icon: 'sparkle',
      padding: { x: 22, y: 18 }
    }
  }
};

export const guardianTheme: ThemeDefinition = {
  id: 'guardian',
  version: '0.1.0',
  metadata: {
    name: 'Guardian 卫报',
    author: 'Studio Preset',
    description: 'Guardian 报纸配色，醒目标题搭配信息化层级。',
    tags: ['news', 'media']
  },
  tokens: {
    color: {
      primary: '#052962',
      text: '#121212',
      background: '#FFFFFF',
      muted: '#F6F6F6'
    },
    typography: {
      fontFamily:
        '-apple-system, "Helvetica Neue", Arial, sans-serif',
      heading: {
        lineHeight: 1.3,
        weight: 700,
        fontFamily:
          '-apple-system, "Helvetica Neue", Arial, sans-serif'
      },
      body: {
        lineHeight: 1.7,
        weight: 400,
        fontFamily:
          '-apple-system, "Helvetica Neue", Arial, sans-serif'
      }
    },
    spacing: {
      paragraph: 20,
      section: 36,
      blockquote: 24
    },
    border: {
      radius: 8,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 700
    },
    heading: {
      h1: { fontSize: 42, fontWeight: 700 },
      h2: { fontSize: 32, fontWeight: 600 },
      h3: { fontSize: 24, fontWeight: 600 }
    },
    blockquote: {
      accentColor: '#C70000',
      borderWidth: 4,
      background: '#FEC200'
    },
    callout: {
      background: '#EDF2FF',
      icon: 'alert',
      padding: { x: 18, y: 14 }
    }
  }
};

export const nikkeiTheme: ThemeDefinition = {
  id: 'nikkei',
  version: '0.1.0',
  metadata: {
    name: 'Nikkei 日经',
    author: 'Studio Preset',
    description: '利落资讯感的日经风格，适用于行业速览与政策解读。',
    tags: ['news', 'japan']
  },
  tokens: {
    color: {
      primary: '#C41230',
      text: '#1A1A1A',
      background: '#FFFFFF',
      muted: '#F5F5F5'
    },
    typography: {
      fontFamily: '"Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif',
      heading: {
        lineHeight: 1.4,
        weight: 700,
        fontFamily: '"Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif'
      },
      body: {
        lineHeight: 1.6,
        weight: 400,
        fontFamily: '"Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif'
      }
    },
    spacing: {
      paragraph: 16,
      section: 28,
      blockquote: 22
    },
    border: {
      radius: 6,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 650
    },
    heading: {
      h1: { fontSize: 24, fontWeight: 700 },
      h2: { fontSize: 18, fontWeight: 700 },
      h3: { fontSize: 16, fontWeight: 600 }
    },
    blockquote: {
      accentColor: '#C41230',
      borderWidth: 2,
      background: '#F5F5F5'
    },
    callout: {
      background: '#F1F1F1',
      icon: 'insight',
      padding: { x: 16, y: 12 }
    }
  }
};

export const leMondeTheme: ThemeDefinition = {
  id: 'lemonde',
  version: '0.1.0',
  metadata: {
    name: 'Le Monde 世界报',
    author: 'Studio Preset',
    description: '法国报纸调性，配合倾斜体标题与装饰分隔符。',
    tags: ['news', 'culture']
  },
  tokens: {
    color: {
      primary: '#2C2C2C',
      text: '#2C2C2C',
      background: '#FFFEF9',
      muted: '#F5EEDF'
    },
    typography: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      heading: {
        lineHeight: 1.35,
        weight: 400,
        fontFamily: '"Didot", Georgia, serif'
      },
      body: {
        lineHeight: 1.85,
        weight: 400,
        fontFamily: 'Georgia, "Times New Roman", serif'
      }
    },
    spacing: {
      paragraph: 22,
      section: 38,
      blockquote: 28
    },
    border: {
      radius: 8,
      width: 1
    }
  },
  components: {
    paragraph: {
      maxWidth: 680
    },
    heading: {
      h1: { fontSize: 48, fontWeight: 400 },
      h2: { fontSize: 36, fontWeight: 300 },
      h3: { fontSize: 28, fontWeight: 400 }
    },
    blockquote: {
      accentColor: '#2C2C2C',
      borderWidth: 2,
      background: '#FBF5EB'
    },
    callout: {
      background: '#F4E9DA',
      icon: 'bookmark',
      padding: { x: 20, y: 16 }
    }
  }
};

export const builtinThemes: ThemeDefinition[] = [
  demoTheme,
  warmNoteTheme,
  techSpectrumTheme,
  elegantMediaTheme,
  wechatDefaultTheme,
  wechatTechTheme,
  wechatElegantTheme,
  wechatDeepReadTheme,
  wechatNytTheme,
  wechatFtTheme,
  wechatJonyIveTheme,
  wechatMediumTheme,
  wechatAppleTheme,
  wechatAnthropicTheme,
  latepostDepthTheme,
  kenyaEmptinessTheme,
  hischeEditorialTheme,
  andoConcreteTheme,
  gaudiOrganicTheme,
  guardianTheme,
  nikkeiTheme,
  leMondeTheme
];
