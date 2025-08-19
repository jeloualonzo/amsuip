import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONFIG } from '../config';
import {
  SignatureImage,
  SignatureEmbedding,
  SignatureProfile,
  SignatureVerificationEvent,
  Student,
  KNNSearchResult,
} from '../types';

export class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      CONFIG.SUPABASE_URL,
      CONFIG.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async getStudent(studentId: number): Promise<Student | null> {
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

  async getSignatureImages(studentId: number): Promise<SignatureImage[]> {
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

  async createSignatureImage(
    studentId: number,
    storagePath: string,
    publicUrl: string
  ): Promise<SignatureImage | null> {
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

  async updateSignatureImageProcessed(imageId: number): Promise<void> {
    const { error } = await this.supabase
      .from('signature_images')
      .update({ processed: true })
      .eq('id', imageId);

    if (error) {
      console.error('Error updating signature image processed status:', error);
    }
  }

  async upsertSignatureEmbedding(
    studentId: number,
    imageId: number | null,
    embedding: number[]
  ): Promise<SignatureEmbedding | null> {
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

  async getSignatureEmbeddings(studentId: number): Promise<SignatureEmbedding[]> {
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

  async searchSimilarEmbeddings(
    embedding: number[],
    limit: number = CONFIG.KNN_SEARCH_LIMIT
  ): Promise<KNNSearchResult[]> {
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

  async upsertSignatureProfile(profile: Partial<SignatureProfile>): Promise<SignatureProfile | null> {
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

  async getSignatureProfile(studentId: number): Promise<SignatureProfile | null> {
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

  async createVerificationEvent(event: Omit<SignatureVerificationEvent, 'id' | 'created_at'>): Promise<SignatureVerificationEvent | null> {
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

  async updateAttendance(
    sessionId: number,
    studentId: number,
    status: 'present' | 'absent' | 'late' | 'excused' = 'present'
  ): Promise<boolean> {
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