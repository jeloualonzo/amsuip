"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildServer = buildServer;
const fastify_1 = __importDefault(require("fastify"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const config_1 = require("./config");
const onnxInference_1 = require("./utils/onnxInference");
const train_1 = require("./routes/train");
const verify_1 = require("./routes/verify");
const health_1 = require("./routes/health");
async function buildServer() {
    const server = (0, fastify_1.default)({
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
    await server.register(multipart_1.default, {
        limits: {
            fileSize: config_1.CONFIG.MAX_FILE_SIZE,
            files: 1,
        },
    });
    // Initialize ONNX service
    const onnxService = new onnxInference_1.ONNXInferenceService();
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
    server.get('/health', health_1.healthCheck);
    // Training endpoint
    server.post('/train/:studentId', train_1.trainStudent);
    // Verification endpoint
    server.post('/verify', verify_1.verifySignature);
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
                message: `File size exceeds maximum limit of ${config_1.CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
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
    const gracefulShutdown = async (signal) => {
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
        }
        catch (error) {
            server.log.error('Error during graceful shutdown:');
            server.log.error(error);
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
            port: config_1.CONFIG.PORT,
            host: config_1.CONFIG.HOST,
        });
        server.log.info(`🚀 Signature AI service started on ${config_1.CONFIG.HOST}:${config_1.CONFIG.PORT}`);
        server.log.info(`📊 Model path: ${config_1.CONFIG.AI_MODEL_PATH}`);
        server.log.info(`🔧 Embedding dimension: ${config_1.CONFIG.EMBED_DIM}`);
        server.log.info(`🎯 Default threshold: ${config_1.CONFIG.DEFAULT_THRESHOLD}`);
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    start();
}
//# sourceMappingURL=index.js.map