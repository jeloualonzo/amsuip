export declare class ImageProcessor {
    /**
     * Preprocess signature image for AI inference
     * Steps: resize, grayscale, normalize, binarize
     */
    preprocessSignature(imageBuffer: Buffer): Promise<Float32Array>;
    /**
     * Apply data augmentation for training robustness
     */
    augmentImage(imageBuffer: Buffer, augmentationType: 'rotation' | 'blur' | 'contrast'): Promise<Buffer>;
    /**
     * Validate image format and size
     */
    validateImage(imageBuffer: Buffer): Promise<{
        valid: boolean;
        error?: string;
    }>;
    /**
     * Extract region of interest (ROI) from signature
     * Simple implementation - crops to content bounds
     */
    extractROI(imageBuffer: Buffer): Promise<Buffer>;
}
//# sourceMappingURL=imageProcessor.d.ts.map