import { FastifyRequest, FastifyReply } from 'fastify';
interface TrainParams {
    studentId: string;
}
export declare function trainStudent(request: FastifyRequest<{
    Params: TrainParams;
}>, reply: FastifyReply): Promise<void>;
export {};
//# sourceMappingURL=train.d.ts.map