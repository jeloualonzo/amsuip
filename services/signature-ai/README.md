# AI Signature Verification Service

A Node.js/TypeScript microservice for AI-powered signature verification using ONNX Runtime, Supabase, and pgvector.

## Features

- **AI-Powered Verification**: Uses ONNX Runtime for signature embedding generation and similarity matching
- **Vector Similarity Search**: Leverages pgvector for efficient cosine similarity searches
- **Adaptive Thresholds**: Per-student threshold adjustment based on training data
- **Image Processing**: Automatic signature preprocessing with Sharp (resize, grayscale, binarization)
- **Real-time Training**: Dynamic model training when new signatures are uploaded
- **Robust Architecture**: Built with Fastify for high performance and type safety

## API Endpoints

### POST /train/:studentId
Trains the AI model for a specific student using their uploaded signatures.

**Parameters:**
- `studentId` (path): The student's database ID

**Response:**
```json
{
  "success": true,
  "message": "Training completed successfully",
  "profile": {
    "student_id": 123,
    "status": "ready",
    "num_samples": 5,
    "threshold": 0.32,
    "last_trained_at": "2025-01-17T10:00:00Z"
  }
}
```

### POST /verify
Verifies a signature image against all trained students.

**Body:** Multipart form data with:
- `file`: Image file (JPEG, PNG, WebP)
- `session_id` (optional): Session ID for automatic attendance marking

**Response:**
```json
{
  "success": true,
  "match": true,
  "predicted_student_id": 123,
  "predicted_student": {
    "id": 123,
    "student_id": "2021-00001",
    "firstname": "John",
    "surname": "Doe"
  },
  "score": 0.85,
  "decision": "match",
  "message": "Signature matched: John Doe (2021-00001)"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-17T10:00:00Z",
  "services": {
    "database": "ok",
    "ai_model": "ok"
  }
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8081` |
| `HOST` | Server host | `0.0.0.0` |
| `SUPABASE_URL` | Supabase project URL | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Required |
| `AI_MODEL_PATH` | Path to ONNX model file | `/models/signature_embedding.onnx` |
| `EMBED_DIM` | Embedding dimension | `512` |
| `DEFAULT_THRESHOLD` | Default similarity threshold | `0.35` |
| `MIN_SAMPLES_FOR_TRAINING` | Minimum samples required | `3` |
| `KNN_SEARCH_LIMIT` | KNN search result limit | `5` |

### Model Requirements

The ONNX model should:
- Accept input shape: `[1, 1, 128, 256]` (batch, channels, height, width)
- Input type: `float32`, normalized to [0, 1]
- Output a 512-dimensional embedding vector
- Be trained using metric learning (triplet loss, contrastive loss, etc.)

## Development

### Prerequisites
- Node.js 18+
- PostgreSQL with pgvector extension
- Supabase project

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development server:
```bash
npm run dev
```

### Building

```bash
npm run build
npm start
```

### Testing

```bash
npm test
```

## Docker Deployment

### Local Development

```bash
docker-compose up signature-ai
```

### Production

1. Build the image:
```bash
docker build -t signature-ai .
```

2. Run with environment variables:
```bash
docker run -p 8081:8081 \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  -v /path/to/models:/models:ro \
  signature-ai
```

## Architecture

### Training Flow
1. Student uploads signature images via frontend
2. Frontend calls `/train/:studentId`
3. Service downloads images from Supabase storage
4. Images are preprocessed (resize, grayscale, binarization)
5. ONNX model generates embeddings
6. Centroid and adaptive threshold are computed
7. Profile is stored with status 'ready'

### Verification Flow
1. User captures signature via camera
2. Frontend calls `/verify` with image data
3. Service preprocesses the captured image
4. ONNX model generates embedding
5. pgvector performs cosine similarity search
6. Best match is determined using adaptive thresholds
7. Attendance is automatically updated if match found

### Database Schema

The service uses these tables:
- `signature_images`: Metadata for uploaded signature images
- `signature_embeddings`: 512-dimensional vectors for each signature
- `signature_profiles`: Per-student training status and parameters
- `signature_verification_events`: Audit log of all verification attempts

## Performance Considerations

- **Vector Indexing**: Uses IVFFlat index for fast similarity search
- **Batch Processing**: Processes multiple signatures efficiently
- **Memory Management**: ONNX session is loaded once at startup
- **Connection Pooling**: Supabase client handles connection management

## Security

- **Service Role Access**: Uses Supabase service role for database operations
- **Input Validation**: Validates image format, size, and content
- **Rate Limiting**: Built-in Fastify rate limiting (configure as needed)
- **Error Handling**: Comprehensive error handling with detailed logging

## Monitoring

- Health check endpoint for uptime monitoring
- Structured logging with request tracing
- Performance metrics via Fastify hooks
- Error tracking and alerting

## Troubleshooting

### Common Issues

1. **Model Loading Error**: Ensure ONNX model file exists and is readable
2. **Database Connection**: Verify Supabase credentials and network access
3. **Image Processing**: Check Sharp dependencies and system libraries
4. **Memory Issues**: Monitor memory usage with large images or batch processing

### Development Mode

The service includes a mock embedding generator for development when no ONNX model is available. This allows testing the full pipeline without a trained model.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.