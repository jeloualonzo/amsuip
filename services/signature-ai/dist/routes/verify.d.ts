import { FastifyRequest, FastifyReply } from 'fastify';
interface VerifyBody {
    session_id?: number;
}
export declare function verifySignature(request: FastifyRequest<{
    Body: VerifyBody;
}>, reply: FastifyReply): Promise<void>;
export {};
//# sourceMappingURL=verify.d.ts.map