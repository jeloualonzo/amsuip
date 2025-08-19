# AI Signature Verification - Deployment Guide

This guide walks you through deploying the AI signature verification system step by step.

## Prerequisites

- Supabase project with database access
- Docker and Docker Compose installed
- Node.js 18+ (for development)
- PostgreSQL with pgvector extension enabled

## Step 1: Database Setup

### 1.1 Apply Database Migration

Run the migration to add AI tables and pgvector support:

```bash
# If using Supabase CLI
supabase db push

# Or apply the migration manually in your Supabase SQL editor
# Copy and paste the contents of: supabase/migrations/20250117000000_add_ai_signature_verification.sql
```

### 1.2 Verify Tables Created

Check that these tables exist in your database:
- `signature_images`
- `signature_embeddings` 
- `signature_profiles`
- `signature_verification_events`

## Step 2: Environment Configuration

### 2.1 Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2.2 Configure Variables

Edit `.env` with your actual values:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# AI Service Configuration  
VITE_AI_BASE_URL=http://localhost:8081

# Backend Configuration (for docker-compose)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
BUCKET_NAME=signatures
```

**Important:** Get your service role key from Supabase Dashboard > Settings > API

## Step 3: AI Service Deployment

### 3.1 Local Development

Start the AI service locally:

```bash
# Build and start with Docker Compose
docker-compose up signature-ai

# Or run directly (requires Node.js 18+)
cd services/signature-ai
npm install
npm run dev
```

### 3.2 Production Deployment

#### Option A: Docker Compose
```bash
docker-compose up -d signature-ai
```

#### Option B: Standalone Docker
```bash
cd services/signature-ai
docker build -t signature-ai .
docker run -p 8081:8081 \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  signature-ai
```

#### Option C: Cloud Deployment (Render/Fly.io/Railway)

1. Push the `services/signature-ai` directory to a Git repository
2. Connect your cloud provider to the repository
3. Set environment variables in your cloud provider's dashboard
4. Deploy the service

## Step 4: Frontend Integration

### 4.1 Update Frontend Configuration

Ensure your frontend `.env` includes:

```bash
VITE_AI_BASE_URL=http://localhost:8081  # Local development
# OR
VITE_AI_BASE_URL=https://your-ai-service.com  # Production
```

### 4.2 Build Frontend

```bash
npm install
npm run build
```

## Step 5: Testing the System

### 5.1 Test AI Service Health

```bash
curl http://localhost:8081/health
```

Expected response:
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

### 5.2 Test Complete Flow

1. **Upload Signatures**: Go to Students page, upload 3-5 signature images for a student
2. **Verify Training**: Check that the student's profile status becomes 'ready'
3. **Test Verification**: Go to Take Attendance, capture a signature, verify it matches

### 5.3 Automated Testing

Use the included test script:

```bash
cd services/signature-ai
node test-service.js http://localhost:8081
```

## Step 6: Production Considerations

### 6.1 ONNX Model

For production, you need a trained ONNX model:

1. **Development**: The service runs with mock embeddings for testing
2. **Production**: Place your trained model at `/models/signature_embedding.onnx`

Model requirements:
- Input: `[1, 1, 128, 256]` float32 array
- Output: 512-dimensional embedding vector
- Trained with metric learning (triplet loss, contrastive loss)

### 6.2 Performance Tuning

Adjust these environment variables for your use case:

```bash
DEFAULT_THRESHOLD=0.35          # Lower = stricter matching
MIN_SAMPLES_FOR_TRAINING=3      # Minimum signatures per student
KNN_SEARCH_LIMIT=5             # Number of similar embeddings to check
```

### 6.3 Monitoring

Set up monitoring for:
- AI service health endpoint (`/health`)
- Database connection status
- Model inference latency
- Verification accuracy rates

### 6.4 Scaling

For high-traffic deployments:
- Use multiple AI service instances behind a load balancer
- Consider Redis for caching frequent lookups
- Monitor memory usage with large images
- Implement request rate limiting

## Step 7: Security Checklist

- [ ] Service role key is kept secure (never in frontend)
- [ ] AI service is not directly accessible from internet (use reverse proxy)
- [ ] File upload size limits are enforced
- [ ] Input validation is enabled for all endpoints
- [ ] HTTPS is enabled in production
- [ ] Database RLS policies are active

## Troubleshooting

### Common Issues

1. **"ONNX model not found"**
   - Service runs with mock embeddings in development
   - For production, ensure model file exists at configured path

2. **"Database connection failed"**
   - Verify Supabase URL and service role key
   - Check network connectivity to Supabase

3. **"pgvector extension not found"**
   - Run the database migration to enable pgvector
   - Ensure your Supabase project supports extensions

4. **"Frontend can't reach AI service"**
   - Check VITE_AI_BASE_URL is correctly set
   - Verify AI service is running and accessible
   - Check CORS settings if cross-origin

5. **"Training fails with 'insufficient data'"**
   - Upload at least 3 signature images per student
   - Ensure images are valid and accessible

### Debug Mode

Enable debug logging:

```bash
# AI Service
DEBUG=* npm run dev

# Check logs
docker-compose logs signature-ai
```

### Health Checks

Monitor these endpoints:
- `GET /health` - Overall service health
- Database connectivity via Supabase dashboard
- Frontend console for AI service calls

## Support

For issues or questions:

1. Check the logs first (`docker-compose logs signature-ai`)
2. Verify environment variables are set correctly
3. Test with the included test script
4. Review the troubleshooting section above

## Next Steps

After successful deployment:

1. **Train Models**: Upload signatures for all students
2. **Monitor Performance**: Track verification accuracy and speed  
3. **Optimize Thresholds**: Adjust per-student thresholds based on usage
4. **Scale Infrastructure**: Add more AI service instances as needed
5. **Implement Analytics**: Track attendance patterns and system usage