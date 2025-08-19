"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("../config");
class DatabaseService {
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(config_1.CONFIG.SUPABASE_URL, config_1.CONFIG.SUPABASE_SERVICE_ROLE_KEY);
    }
    async getStudent(studentId) {
        const { data, error } = await this.supabase
            .from('students')
            .select('id, student_id, firstname, surname, signature_urls, signature_url')
            .eq('id', studentId)
            .single();
        if (error) {
            console.error('Error fetching student:', error);
            return null;
        }
        return data;
    }
    async getSignatureImages(studentId) {
        const { data, error } = await this.supabase
            .from('signature_images')
            .select('*')
            .eq('student_id', studentId)
            .order('uploaded_at', { ascending: false });
        if (error) {
            console.error('Error fetching signature images:', error);
            return [];
        }
        return data || [];
    }
    async createSignatureImage(studentId, storagePath, publicUrl) {
        const { data, error } = await this.supabase
            .from('signature_images')
            .insert({
            student_id: studentId,
            storage_path: storagePath,
            public_url: publicUrl,
            processed: false,
        })
            .select()
            .single();
        if (error) {
            console.error('Error creating signature image:', error);
            return null;
        }
        return data;
    }
    async updateSignatureImageProcessed(imageId) {
        const { error } = await this.supabase
            .from('signature_images')
            .update({ processed: true })
            .eq('id', imageId);
        if (error) {
            console.error('Error updating signature image processed status:', error);
        }
    }
    async upsertSignatureEmbedding(studentId, imageId, embedding) {
        const { data, error } = await this.supabase
            .from('signature_embeddings')
            .upsert({
            student_id: studentId,
            image_id: imageId,
            embedding: embedding,
        })
            .select()
            .single();
        if (error) {
            console.error('Error upserting signature embedding:', error);
            return null;
        }
        return data;
    }
    async getSignatureEmbeddings(studentId) {
        const { data, error } = await this.supabase
            .from('signature_embeddings')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching signature embeddings:', error);
            return [];
        }
        return data || [];
    }
    async searchSimilarEmbeddings(embedding, limit = config_1.CONFIG.KNN_SEARCH_LIMIT) {
        // Using pgvector cosine distance search
        const { data, error } = await this.supabase.rpc('search_similar_signatures', {
            query_embedding: embedding,
            match_count: limit,
        });
        if (error) {
            console.error('Error searching similar embeddings:', error);
            return [];
        }
        return data || [];
    }
    async upsertSignatureProfile(profile) {
        const { data, error } = await this.supabase
            .from('signature_profiles')
            .upsert(profile)
            .select()
            .single();
        if (error) {
            console.error('Error upserting signature profile:', error);
            return null;
        }
        return data;
    }
    async getSignatureProfile(studentId) {
        const { data, error } = await this.supabase
            .from('signature_profiles')
            .select('*')
            .eq('student_id', studentId)
            .single();
        if (error) {
            if (error.code !== 'PGRST116') { // Not found error
                console.error('Error fetching signature profile:', error);
            }
            return null;
        }
        return data;
    }
    async createVerificationEvent(event) {
        const { data, error } = await this.supabase
            .from('signature_verification_events')
            .insert(event)
            .select()
            .single();
        if (error) {
            console.error('Error creating verification event:', error);
            return null;
        }
        return data;
    }
    async updateAttendance(sessionId, studentId, status = 'present') {
        const { error } = await this.supabase
            .from('attendance')
            .upsert({
            session_id: sessionId,
            student_id: studentId,
            status: status,
            time_in: new Date().toISOString(),
        });
        if (error) {
            console.error('Error updating attendance:', error);
            return false;
        }
        return true;
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.js.map