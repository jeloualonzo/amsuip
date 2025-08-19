"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ONNXInferenceService = void 0;
const ort = __importStar(require("onnxruntime-node"));
const config_1 = require("../config");
const imageProcessor_1 = require("./imageProcessor");
class ONNXInferenceService {
    constructor() {
        this.session = null;
        this.imageProcessor = new imageProcessor_1.ImageProcessor();
    }
    /**
     * Initialize ONNX session
     */
    async initialize() {
        try {
            console.log('Loading ONNX model from:', config_1.CONFIG.AI_MODEL_PATH);
            // Check if model file exists (for production, this should be mounted)
            // For development, we'll create a mock model or use a placeholder
            try {
                this.session = await ort.InferenceSession.create(config_1.CONFIG.AI_MODEL_PATH);
                console.log('ONNX model loaded successfully');
            }
            catch (error) {
                console.warn('Could not load ONNX model, using mock embeddings for development:', error);
                this.session = null;
            }
        }
        catch (error) {
            console.error('Error initializing ONNX session:', error);
            throw new Error('Failed to initialize AI model');
        }
    }
    /**
     * Generate embedding from preprocessed signature image
     */
    async generateEmbedding(imageBuffer) {
        try {
            // Preprocess the image
            const preprocessedImage = await this.imageProcessor.preprocessSignature(imageBuffer);
            if (this.session) {
                // Real ONNX inference
                return await this.runONNXInference(preprocessedImage);
            }
            else {
                // Mock embedding for development
                return this.generateMockEmbedding(preprocessedImage);
            }
        }
        catch (error) {
            console.error('Error generating embedding:', error);
            throw new Error('Failed to generate signature embedding');
        }
    }
    /**
     * Run ONNX inference
     */
    async runONNXInference(preprocessedImage) {
        if (!this.session) {
            throw new Error('ONNX session not initialized');
        }
        try {
            // Reshape for model input (assuming model expects [1, 1, height, width])
            const inputTensor = new ort.Tensor('float32', preprocessedImage, [1, 1, config_1.CONFIG.SIGNATURE_HEIGHT, config_1.CONFIG.SIGNATURE_WIDTH]);
            // Run inference
            const results = await this.session.run({ input: inputTensor });
            // Extract embedding (assuming output is named 'output' or similar)
            const outputKey = Object.keys(results)[0];
            const embedding = results[outputKey].data;
            // Convert to regular array and normalize
            const embeddingArray = Array.from(embedding);
            return this.normalizeEmbedding(embeddingArray);
        }
        catch (error) {
            console.error('Error running ONNX inference:', error);
            throw new Error('ONNX inference failed');
        }
    }
    /**
     * Generate mock embedding for development/testing
     */
    generateMockEmbedding(preprocessedImage) {
        console.log('Generating mock embedding for development');
        // Create a deterministic but varied embedding based on image content
        const embedding = new Array(config_1.CONFIG.EMBED_DIM);
        let hash = 0;
        // Simple hash of image content
        for (let i = 0; i < Math.min(preprocessedImage.length, 1000); i++) {
            hash = ((hash << 5) - hash + preprocessedImage[i] * 255) & 0xffffffff;
        }
        // Generate embedding based on hash
        const random = this.seededRandom(Math.abs(hash));
        for (let i = 0; i < config_1.CONFIG.EMBED_DIM; i++) {
            embedding[i] = (random() - 0.5) * 2; // Range [-1, 1]
        }
        return this.normalizeEmbedding(embedding);
    }
    /**
     * Seeded random number generator for consistent mock embeddings
     */
    seededRandom(seed) {
        let state = seed;
        return () => {
            state = (state * 9301 + 49297) % 233280;
            return state / 233280;
        };
    }
    /**
     * Normalize embedding to unit vector
     */
    normalizeEmbedding(embedding) {
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        if (magnitude === 0) {
            return embedding.fill(0);
        }
        return embedding.map(val => val / magnitude);
    }
    /**
     * Calculate cosine similarity between two embeddings
     */
    calculateCosineSimilarity(embedding1, embedding2) {
        if (embedding1.length !== embedding2.length) {
            throw new Error('Embeddings must have the same dimension');
        }
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        for (let i = 0; i < embedding1.length; i++) {
            dotProduct += embedding1[i] * embedding2[i];
            norm1 += embedding1[i] * embedding1[i];
            norm2 += embedding2[i] * embedding2[i];
        }
        const magnitude1 = Math.sqrt(norm1);
        const magnitude2 = Math.sqrt(norm2);
        if (magnitude1 === 0 || magnitude2 === 0) {
            return 0;
        }
        return dotProduct / (magnitude1 * magnitude2);
    }
    /**
     * Calculate cosine distance (1 - cosine similarity)
     */
    calculateCosineDistance(embedding1, embedding2) {
        return 1 - this.calculateCosineSimilarity(embedding1, embedding2);
    }
    /**
     * Compute centroid of multiple embeddings
     */
    computeCentroid(embeddings) {
        if (embeddings.length === 0) {
            return new Array(config_1.CONFIG.EMBED_DIM).fill(0);
        }
        const centroid = new Array(config_1.CONFIG.EMBED_DIM).fill(0);
        for (const embedding of embeddings) {
            for (let i = 0; i < config_1.CONFIG.EMBED_DIM; i++) {
                centroid[i] += embedding[i];
            }
        }
        // Average and normalize
        for (let i = 0; i < config_1.CONFIG.EMBED_DIM; i++) {
            centroid[i] /= embeddings.length;
        }
        return this.normalizeEmbedding(centroid);
    }
    /**
     * Cleanup resources
     */
    async cleanup() {
        if (this.session) {
            // Note: release() method might not be available in all versions
            try {
                if (typeof this.session.release === 'function') {
                    await this.session.release();
                }
            }
            catch (error) {
                console.warn('Failed to release ONNX session:', error);
            }
            this.session = null;
        }
    }
}
exports.ONNXInferenceService = ONNXInferenceService;
//# sourceMappingURL=onnxInference.js.map