"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainStudent = trainStudent;
const database_1 = require("../utils/database");
const imageProcessor_1 = require("../utils/imageProcessor");
const config_1 = require("../config");
async function trainStudent(request, reply) {
    const { studentId } = request.params;
    const db = new database_1.DatabaseService();
    const onnx = request.server.onnx;
    const imageProcessor = new imageProcessor_1.ImageProcessor();
    try {
        // Parse student ID
        const studentIdNum = parseInt(studentId, 10);
        if (isNaN(studentIdNum)) {
            reply.code(400).send({
                success: false,
                error: 'Invalid student ID',
                message: 'Student ID must be a valid number',
            });
            return;
        }
        // Get student information
        const student = await db.getStudent(studentIdNum);
        if (!student) {
            reply.code(404).send({
                success: false,
                error: 'Student not found',
                message: `Student with ID ${studentId} not found`,
            });
            return;
        }
        console.log(`Starting training for student ${student.student_id} (${student.firstname} ${student.surname})`);
        // Update profile status to training
        await db.upsertSignatureProfile({
            student_id: studentIdNum,
            status: 'training',
            error_message: null,
        });
        try {
            // Get signature images from signature_images table
            let signatureImages = await db.getSignatureImages(studentIdNum);
            // If no images in signature_images table, fall back to signature_urls from students table
            let imageUrls = [];
            if (signatureImages.length === 0) {
                console.log('No signature images found, checking student signature_urls');
                if (student.signature_urls && student.signature_urls.length > 0) {
                    imageUrls = student.signature_urls;
                }
                else if (student.signature_url) {
                    imageUrls = [student.signature_url];
                }
                // Create signature_images entries for existing URLs
                for (const url of imageUrls) {
                    const image = await db.createSignatureImage(studentIdNum, url, url);
                    if (image) {
                        signatureImages.push(image);
                    }
                }
            }
            else {
                imageUrls = signatureImages.map(img => img.public_url);
            }
            if (imageUrls.length === 0) {
                reply.code(400).send({
                    success: false,
                    error: 'No signature images found',
                    message: 'No signature images available for training. Please upload signature images first.',
                });
                return;
            }
            if (imageUrls.length < config_1.CONFIG.MIN_SAMPLES_FOR_TRAINING) {
                reply.code(400).send({
                    success: false,
                    error: 'Insufficient training data',
                    message: `At least ${config_1.CONFIG.MIN_SAMPLES_FOR_TRAINING} signature images are required for training. Found ${imageUrls.length}.`,
                });
                return;
            }
            console.log(`Processing ${imageUrls.length} signature images for training`);
            // Download and process each image
            const embeddings = [];
            let processedCount = 0;
            for (let i = 0; i < imageUrls.length; i++) {
                const imageUrl = imageUrls[i];
                const signatureImage = signatureImages[i];
                try {
                    console.log(`Processing image ${i + 1}/${imageUrls.length}: ${imageUrl}`);
                    // Download image
                    const response = await fetch(imageUrl);
                    if (!response.ok) {
                        console.warn(`Failed to download image ${imageUrl}: ${response.statusText}`);
                        continue;
                    }
                    const imageBuffer = Buffer.from(await response.arrayBuffer());
                    // Validate image
                    const validation = await imageProcessor.validateImage(imageBuffer);
                    if (!validation.valid) {
                        console.warn(`Invalid image ${imageUrl}: ${validation.error}`);
                        continue;
                    }
                    // Extract ROI
                    const roiBuffer = await imageProcessor.extractROI(imageBuffer);
                    // Generate embedding
                    const embedding = await onnx.generateEmbedding(roiBuffer);
                    embeddings.push(embedding);
                    // Store embedding in database
                    await db.upsertSignatureEmbedding(studentIdNum, signatureImage?.id || null, embedding);
                    // Optional: Generate augmented samples for better robustness
                    if (embeddings.length < config_1.CONFIG.MIN_SAMPLES_FOR_TRAINING * 2) {
                        try {
                            const augmentedBuffer = await imageProcessor.augmentImage(roiBuffer, 'rotation');
                            const augmentedEmbedding = await onnx.generateEmbedding(augmentedBuffer);
                            embeddings.push(augmentedEmbedding);
                            await db.upsertSignatureEmbedding(studentIdNum, null, augmentedEmbedding);
                        }
                        catch (augError) {
                            console.warn('Failed to generate augmented sample:', augError);
                        }
                    }
                    processedCount++;
                    // Mark image as processed
                    if (signatureImage) {
                        await db.updateSignatureImageProcessed(signatureImage.id);
                    }
                }
                catch (error) {
                    console.error(`Error processing image ${imageUrl}:`, error);
                    continue;
                }
            }
            if (embeddings.length === 0) {
                throw new Error('No valid signature images could be processed');
            }
            console.log(`Successfully processed ${processedCount} images, generated ${embeddings.length} embeddings`);
            // Compute centroid
            const centroid = onnx.computeCentroid(embeddings);
            // Calculate adaptive threshold based on intra-class distances
            let threshold = config_1.CONFIG.DEFAULT_THRESHOLD;
            if (embeddings.length > 1) {
                const distances = [];
                for (const embedding of embeddings) {
                    const distance = onnx.calculateCosineDistance(embedding, centroid);
                    distances.push(distance);
                }
                // Set threshold as mean + 1.5 * std deviation of intra-class distances
                const mean = distances.reduce((sum, d) => sum + d, 0) / distances.length;
                const variance = distances.reduce((sum, d) => sum + (d - mean) ** 2, 0) / distances.length;
                const stdDev = Math.sqrt(variance);
                threshold = Math.min(config_1.CONFIG.DEFAULT_THRESHOLD, mean + 1.5 * stdDev);
                threshold = Math.max(0.1, threshold); // Minimum threshold
            }
            // Update signature profile
            const profile = await db.upsertSignatureProfile({
                student_id: studentIdNum,
                status: 'ready',
                embedding_centroid: centroid,
                num_samples: embeddings.length,
                threshold: threshold,
                last_trained_at: new Date().toISOString(),
                error_message: null,
            });
            console.log(`Training completed for student ${student.student_id}. Threshold: ${threshold.toFixed(4)}, Samples: ${embeddings.length}`);
            const response = {
                success: true,
                message: `Training completed successfully. Processed ${processedCount} images, generated ${embeddings.length} embeddings.`,
                profile: profile || undefined,
            };
            reply.send(response);
        }
        catch (error) {
            console.error('Training error:', error);
            // Update profile with error status
            await db.upsertSignatureProfile({
                student_id: studentIdNum,
                status: 'error',
                error_message: error instanceof Error ? error.message : 'Unknown training error',
            });
            reply.code(500).send({
                success: false,
                error: 'Training failed',
                message: error instanceof Error ? error.message : 'Unknown error occurred during training',
            });
        }
    }
    catch (error) {
        console.error('Request error:', error);
        reply.code(500).send({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred',
        });
    }
}
//# sourceMappingURL=train.js.map