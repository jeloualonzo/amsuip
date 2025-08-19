import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { CONFIG } from './config';
import { ONNXInferenceService } from './utils/onnxInference';
import { trainStudent } from './routes/train';
import { verifySignature } from './routes/verify';
import { healthCheck } from './routes/health';

// Extend Fastify instance type to include our ONNX service
declare module 'fastify' {
  interface FastifyInstance {
    onnx: ONNXInferenceService;
  }
}

async function buildServer() {
  const server = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register multipart support for file uploads
  await server.register(multipart, {
    limits: {
      fileSize: CONFIG.MAX_FILE_SIZE,
      files: 1,
    },
  });

  // Initialize ONNX service
  const onnxService = new ONNXInferenceService();
  await onnxService.initialize();
  server.decorate('onnx', onnxService);

  // CORS headers
  server.addHook('onRequest', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (request.method === 'OPTIONS') {
      reply.code(200).send();
      return;
    }
  });

  // Health check endpoint
  server.get('/health', healthCheck);

  // Training endpoint
  server.post('/train/:studentId', trainStudent);

  // Verification endpoint
  server.post('/verify', verifySignature);

  // Error handler
  server.setErrorHandler((error, request, reply) => {
    server.log.error(error);
    
    if (error.validation) {
      reply.code(400).send({
        success: false,
        error: 'Validation error',
        message: error.message,
        details: error.validation,
      });
      return;
    }

    if (error.code === 'FST_FILES_LIMIT') {
      reply.code(400).send({
        success: false,
        error: 'File limit exceeded',
        message: 'Only one file can be uploaded at a time',
      });
      return;
    }

    if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
      reply.code(400).send({
        success: false,
        error: 'File too large',
        message: `File size exceeds maximum limit of ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
      return;
    }

    reply.code(500).send({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred',
    });
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    server.log.info(`Received ${signal}, shutting down gracefully...`);
    
    try {
      // Cleanup ONNX resources
      if (server.onnx) {
        await server.onnx.cleanup();
      }
      
      // Close server
      await server.close();
      server.log.info('Server closed successfully');
      process.exit(0);
    } catch (error) {
      server.log.error('Error during graceful shutdown:');
      server.log.error(error as Error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return server;
}

async function start() {
  try {
    const server = await buildServer();
    
    await server.listen({
      port: CONFIG.PORT,
      host: CONFIG.HOST,
    });

    server.log.info(`🚀 Signature AI service started on ${CONFIG.HOST}:${CONFIG.PORT}`);
    server.log.info(`📊 Model path: ${CONFIG.AI_MODEL_PATH}`);
    server.log.info(`🔧 Embedding dimension: ${CONFIG.EMBED_DIM}`);
    server.log.info(`🎯 Default threshold: ${CONFIG.DEFAULT_THRESHOLD}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

export { buildServer };