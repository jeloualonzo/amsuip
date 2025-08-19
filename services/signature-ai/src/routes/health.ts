import { FastifyRequest, FastifyReply } from 'fastify';
import { ONNXInferenceService } from '../utils/onnxInference';
import { DatabaseService } from '../utils/database';

export async function healthCheck(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const onnx = request.server.onnx as ONNXInferenceService;
    const db = new DatabaseService();

    // Check database connection
    let dbStatus = 'ok';
    try {
      // Simple query to test connection
      await db.getSignatureProfile(0); // This will return null but tests connection
    } catch (error) {
      dbStatus = 'error';
      console.error('Database health check failed:', error);
    }

    // Check AI model status
    const aiStatus = onnx ? 'ok' : 'error';

    const health = {
      status: dbStatus === 'ok' && aiStatus === 'ok' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        ai_model: aiStatus,
      },
      version: '1.0.0',
    };

    if (health.status === 'healthy') {
      reply.send(health);
    } else {
      reply.code(503).send(health);
    }
  } catch (error) {
    console.error('Health check error:', error);
    reply.code(500).send({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
}