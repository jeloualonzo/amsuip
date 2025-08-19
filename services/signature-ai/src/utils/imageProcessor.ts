import sharp from 'sharp';
import { CONFIG } from '../config';

export class ImageProcessor {
  /**
   * Preprocess signature image for AI inference
   * Steps: resize, grayscale, normalize, binarize
   */
  async preprocessSignature(imageBuffer: Buffer): Promise<Float32Array> {
    try {
      // Resize, convert to grayscale, and normalize
      const processed = await sharp(imageBuffer)
        .resize(CONFIG.SIGNATURE_WIDTH, CONFIG.SIGNATURE_HEIGHT, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .grayscale()
        .normalise()
        .raw()
        .toBuffer();

      // Convert to Float32Array and normalize to [0, 1]
      const pixels = new Float32Array(processed.length);
      for (let i = 0; i < processed.length; i++) {
        pixels[i] = processed[i] / 255.0;
      }

      // Apply simple binarization threshold
      const threshold = 0.5;
      for (let i = 0; i < pixels.length; i++) {
        pixels[i] = pixels[i] > threshold ? 1.0 : 0.0;
      }

      return pixels;
    } catch (error) {
      console.error('Error preprocessing image:', error);
      throw new Error('Failed to preprocess signature image');
    }
  }

  /**
   * Apply data augmentation for training robustness
   */
  async augmentImage(imageBuffer: Buffer, augmentationType: 'rotation' | 'blur' | 'contrast'): Promise<Buffer> {
    try {
      let sharpInstance = sharp(imageBuffer);

      switch (augmentationType) {
        case 'rotation':
          // Small rotation (-5 to 5 degrees)
          const angle = (Math.random() - 0.5) * 10;
          sharpInstance = sharpInstance.rotate(angle, { background: 'white' });
          break;
        
        case 'blur':
          // Light blur
          sharpInstance = sharpInstance.blur(0.5 + Math.random() * 0.5);
          break;
        
        case 'contrast':
          // Slight contrast adjustment
          const contrast = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
          sharpInstance = sharpInstance.linear(contrast, 0);
          break;
      }

      return await sharpInstance.toBuffer();
    } catch (error) {
      console.error('Error augmenting image:', error);
      throw new Error('Failed to augment signature image');
    }
  }

  /**
   * Validate image format and size
   */
  async validateImage(imageBuffer: Buffer): Promise<{ valid: boolean; error?: string }> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      
      if (!metadata.format || !CONFIG.ALLOWED_MIME_TYPES.includes(`image/${metadata.format}`)) {
        return { valid: false, error: 'Invalid image format. Only JPEG, PNG, and WebP are supported.' };
      }

      if (imageBuffer.length > CONFIG.MAX_FILE_SIZE) {
        return { valid: false, error: 'Image file too large. Maximum size is 10MB.' };
      }

      if (!metadata.width || !metadata.height || metadata.width < 50 || metadata.height < 25) {
        return { valid: false, error: 'Image too small. Minimum size is 50x25 pixels.' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Invalid or corrupted image file.' };
    }
  }

  /**
   * Extract region of interest (ROI) from signature
   * Simple implementation - crops to content bounds
   */
  async extractROI(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .trim({ threshold: 10 }) // Remove whitespace with small threshold
        .toBuffer();
    } catch (error) {
      console.error('Error extracting ROI:', error);
      // If ROI extraction fails, return original
      return imageBuffer;
    }
  }
}