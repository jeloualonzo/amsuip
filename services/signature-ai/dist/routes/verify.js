"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySignature = verifySignature;
const database_1 = require("../utils/database");
const imageProcessor_1 = require("../utils/imageProcessor");
const config_1 = require("../config");
async function verifySignature(request, reply) {
    const db = new database_1.DatabaseService();
    const onnx = request.server.onnx;
    const imageProcessor = new imageProcessor_1.ImageProcessor();
    try {
        // Get uploaded file
        const data = await request.file();
        if (!data) {
            reply.code(400).send({
                success: false,
                match: false,
                predicted_student_id: null,
                score: 0,
                decision: 'error',
                error: 'No image file provided',
                message: 'Please provide a signature image for verification',
            });
            return;
        }
        // Read image buffer
        const imageBuffer = await data.toBuffer();
        console.log(`Received signature image for verification: ${data.filename}, size: ${imageBuffer.length} bytes`);
        // Validate image
        const validation = await imageProcessor.validateImage(imageBuffer);
        if (!validation.valid) {
            reply.code(400).send({
                success: false,
                match: false,
                predicted_student_id: null,
                score: 0,
                decision: 'error',
                error: 'Invalid image',
                message: validation.error || 'Invalid image format or size',
            });
            return;
        }
        try {
            // Extract ROI and generate embedding
            const roiBuffer = await imageProcessor.extractROI(imageBuffer);
            const candidateEmbedding = await onnx.generateEmbedding(roiBuffer);
            console.log('Generated embedding for candidate signature');
            // Search for similar embeddings using pgvector
            const similarEmbeddings = await db.searchSimilarEmbeddings(candidateEmbedding, config_1.CONFIG.KNN_SEARCH_LIMIT);
            if (similarEmbeddings.length === 0) {
                console.log('No similar embeddings found in database');
                // Log verification event
                await db.createVerificationEvent({
                    session_id: request.body?.session_id || null,
                    candidate_student_id: null,
                    predicted_student_id: null,
                    score: 0,
                    decision: 'no_match',
                    image_public_url: null,
                });
                reply.send({
                    success: true,
                    match: false,
                    predicted_student_id: null,
                    score: 0,
                    decision: 'no_match',
                    message: 'No matching signatures found in the database',
                });
                return;
            }
            console.log(`Found ${similarEmbeddings.length} similar embeddings`);
            // Group by student and find best match
            const studentMatches = new Map();
            for (const result of similarEmbeddings) {
                const distance = result.distance;
                if (!studentMatches.has(result.student_id)) {
                    studentMatches.set(result.student_id, {
                        distances: [],
                        minDistance: distance,
                        avgDistance: 0,
                    });
                }
                const match = studentMatches.get(result.student_id);
                match.distances.push(distance);
                match.minDistance = Math.min(match.minDistance, distance);
                match.avgDistance = match.distances.reduce((sum, d) => sum + d, 0) / match.distances.length;
            }
            // Find the best matching student
            let bestStudentId = null;
            let bestScore = Infinity;
            let matchDecision = 'no_match';
            for (const [studentId, match] of studentMatches) {
                // Get student's profile for personalized threshold
                const profile = await db.getSignatureProfile(studentId);
                const threshold = profile?.threshold || config_1.CONFIG.DEFAULT_THRESHOLD;
                // Use minimum distance for matching (most similar embedding)
                const score = match.minDistance;
                console.log(`Student ${studentId}: min_distance=${score.toFixed(4)}, threshold=${threshold.toFixed(4)}, samples=${match.distances.length}`);
                if (score < threshold && score < bestScore) {
                    bestStudentId = studentId;
                    bestScore = score;
                    matchDecision = 'match';
                }
            }
            // Get student details if match found
            let predictedStudent = null;
            if (bestStudentId) {
                const student = await db.getStudent(bestStudentId);
                if (student) {
                    predictedStudent = {
                        id: student.id,
                        student_id: student.student_id,
                        firstname: student.firstname,
                        surname: student.surname,
                    };
                }
            }
            // Convert distance to similarity score (0-1, higher is better)
            const similarityScore = bestScore === Infinity ? 0 : Math.max(0, 1 - bestScore);
            console.log(`Verification result: ${matchDecision}, student: ${bestStudentId}, score: ${similarityScore.toFixed(4)}`);
            // Log verification event
            await db.createVerificationEvent({
                session_id: request.body?.session_id || null,
                candidate_student_id: null, // We don't know who they claim to be
                predicted_student_id: bestStudentId,
                score: similarityScore,
                decision: matchDecision,
                image_public_url: null, // Could upload to storage if needed
            });
            // Update attendance if match found and session_id provided
            if (matchDecision === 'match' && bestStudentId && request.body?.session_id) {
                const attendanceUpdated = await db.updateAttendance(request.body.session_id, bestStudentId, 'present');
                if (attendanceUpdated) {
                    console.log(`Updated attendance for student ${bestStudentId} in session ${request.body.session_id}`);
                }
            }
            const response = {
                success: true,
                match: matchDecision === 'match',
                predicted_student_id: bestStudentId,
                predicted_student: predictedStudent || undefined,
                score: similarityScore,
                decision: matchDecision,
                message: matchDecision === 'match'
                    ? `Signature matched: ${predictedStudent?.firstname} ${predictedStudent?.surname} (${predictedStudent?.student_id})`
                    : 'No matching signature found',
            };
            reply.send(response);
        }
        catch (error) {
            console.error('Verification processing error:', error);
            // Log error event
            await db.createVerificationEvent({
                session_id: request.body?.session_id || null,
                candidate_student_id: null,
                predicted_student_id: null,
                score: 0,
                decision: 'error',
                image_public_url: null,
            });
            reply.code(500).send({
                success: false,
                match: false,
                predicted_student_id: null,
                score: 0,
                decision: 'error',
                error: 'Verification processing failed',
                message: error instanceof Error ? error.message : 'Unknown error during verification',
            });
        }
    }
    catch (error) {
        console.error('Request error:', error);
        reply.code(500).send({
            success: false,
            match: false,
            predicted_student_id: null,
            score: 0,
            decision: 'error',
            error: 'Internal server error',
            message: 'An unexpected error occurred',
        });
    }
}
//# sourceMappingURL=verify.js.map