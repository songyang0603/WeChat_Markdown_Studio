import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import {
  builtinThemes,
  demoTheme,
  type ThemeDefinition
} from '@theme-engine/core';
import { listTemplates, findTemplate } from '@template-library/core';
import { renderMarkdownToHtml } from '@markdown-pipeline/core';

const renderRequestSchema = z.object({
  markdown: z.string().min(1, 'markdown 内容不可为空'),
  themeId: z.string().optional(),
  inlineStyles: z.boolean().optional()
});

const buildServer = () => {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });

  // 统一错误处理，便于前端调试
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({
      statusCode,
      message: error instanceof z.ZodError ? error.issues : error.message
    });
  });

  app.get('/healthz', async () => ({ status: 'ok' }));

  app.get('/themes', async () => {
    return builtinThemes.map((theme) => ({
      id: theme.id,
      name: theme.metadata.name,
      version: theme.version,
      description: theme.metadata.description ?? '',
      tags: theme.metadata.tags ?? []
    }));
  });

  app.get('/templates', async () => {
    return listTemplates();
  });

  app.get<{ Params: { id: string } }>('/templates/:id', async (request, reply) => {
    const template = findTemplate(request.params.id);

    if (!template) {
      return reply.status(404).send({ statusCode: 404, message: '未找到对应模板' });
    }

    return template;
  });

  app.post('/render/preview', async (request) => {
    const payload = renderRequestSchema.parse(request.body);
    const theme: ThemeDefinition =
      builtinThemes.find((item) => item.id === payload.themeId) ?? demoTheme;

    const html = await renderMarkdownToHtml(payload.markdown, {
      theme,
      inlineStyles: payload.inlineStyles
    });

    return { html };
  });

  return app;
};

const start = async () => {
  const server = buildServer();
  try {
    await server.listen({ port: Number(process.env.PORT ?? 3001), host: '0.0.0.0' });
    server.log.info('API server is running');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  // Only auto-start when run directly
  start();
}

export { buildServer };
