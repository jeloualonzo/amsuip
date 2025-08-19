export interface SignatureImage {
    id: number;
    student_id: number;
    storage_path: string;
    public_url: string;
    uploaded_at: string;
    processed: boolean;
}
export interface SignatureEmbedding {
    id: number;
    student_id: number;
    image_id: number | null;
    embedding: number[];
    created_at: string;
}
export interface SignatureProfile {
    student_id: number;
    status: 'untrained' | 'training' | 'ready' | 'error';
    embedding_centroid: number[] | null;
    num_samples: number;
    threshold: number;
    last_trained_at: string | null;
    error_message: string | null;
}
export interface SignatureVerificationEvent {
    id: number;
    session_id: number | null;
    candidate_student_id: number | null;
    predicted_student_id: number | null;
    score: number;
    decision: 'match' | 'no_match' | 'error';
    image_public_url: string | null;
    created_at: string;
}
export interface Student {
    id: number;
    student_id: string;
    firstname: string;
    surname: string;
    signature_urls: string[] | null;
    signature_url: string | null;
}
export interface TrainingRequest {
    studentId: string;
}
export interface TrainingResponse {
    success: boolean;
    message: string;
    profile?: SignatureProfile;
    error?: string;
}
export interface VerificationRequest {
    image: Buffer;
    session_id?: number;
}
export interface VerificationResponse {
    success: boolean;
    match: boolean;
    predicted_student_id: number | null;
    predicted_student?: {
        id: number;
        student_id: string;
        firstname: string;
        surname: string;
    };
    score: number;
    decision: 'match' | 'no_match' | 'error';
    message: string;
    error?: string;
}
export interface KNNSearchResult {
    student_id: number;
    distance: number;
    embedding: number[];
}
//# sourceMappingURL=index.d.ts.map