import { SignatureImage, SignatureEmbedding, SignatureProfile, SignatureVerificationEvent, Student, KNNSearchResult } from '../types';
export declare class DatabaseService {
    private supabase;
    constructor();
    getStudent(studentId: number): Promise<Student | null>;
    getSignatureImages(studentId: number): Promise<SignatureImage[]>;
    createSignatureImage(studentId: number, storagePath: string, publicUrl: string): Promise<SignatureImage | null>;
    updateSignatureImageProcessed(imageId: number): Promise<void>;
    upsertSignatureEmbedding(studentId: number, imageId: number | null, embedding: number[]): Promise<SignatureEmbedding | null>;
    getSignatureEmbeddings(studentId: number): Promise<SignatureEmbedding[]>;
    searchSimilarEmbeddings(embedding: number[], limit?: number): Promise<KNNSearchResult[]>;
    upsertSignatureProfile(profile: Partial<SignatureProfile>): Promise<SignatureProfile | null>;
    getSignatureProfile(studentId: number): Promise<SignatureProfile | null>;
    createVerificationEvent(event: Omit<SignatureVerificationEvent, 'id' | 'created_at'>): Promise<SignatureVerificationEvent | null>;
    updateAttendance(sessionId: number, studentId: number, status?: 'present' | 'absent' | 'late' | 'excused'): Promise<boolean>;
}
//# sourceMappingURL=database.d.ts.map