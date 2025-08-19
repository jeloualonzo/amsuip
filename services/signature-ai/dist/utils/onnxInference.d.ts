export declare class ONNXInferenceService {
    private session;
    private imageProcessor;
    constructor();
    /**
     * Initialize ONNX session
     */
    initialize(): Promise<void>;
    /**
     * Generate embedding from preprocessed signature image
     */
    generateEmbedding(imageBuffer: Buffer): Promise<number[]>;
    /**
     * Run ONNX inference
     */
    private runONNXInference;
    /**
     * Generate mock embedding for development/testing
     */
    private generateMockEmbedding;
    /**
     * Seeded random number generator for consistent mock embeddings
     */
    private seededRandom;
    /**
     * Normalize embedding to unit vector
     */
    private normalizeEmbedding;
    /**
     * Calculate cosine similarity between two embeddings
     */
    calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number;
    /**
     * Calculate cosine distance (1 - cosine similarity)
     */
    calculateCosineDistance(embedding1: number[], embedding2: number[]): number;
    /**
     * Compute centroid of multiple embeddings
     */
    computeCentroid(embeddings: number[][]): number[];
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=onnxInference.d.ts.map