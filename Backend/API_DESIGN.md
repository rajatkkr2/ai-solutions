# API Design Documentation

## RESTful API Endpoints

### Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### POST /api/auth/login
**Description**: User authentication
**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
**Response**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "string",
    "fullName": "string"
  }
}
```

### POST /api/auth/register
**Description**: User registration
**Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "fullName": "string",
  "age": "number"
}
```

## Ticket Management Endpoints

### POST /api/tickets
**Description**: Create new support ticket with AI classification
**Request Body**:
```json
{
  "title": "string",
  "description": "string",
  "customer_email": "string"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "ticket_id",
    "title": "string",
    "description": "string",
    "customer_email": "string",
    "priority": "low|medium|high|critical",
    "assigned_team": "Billing|Technical Support|Sales|General",
    "tags": ["tag1", "tag2"],
    "ai_confidence": 0.95,
    "classified_by_ai": true,
    "status": "open",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/tickets/getAllTickets
**Description**: Retrieve all tickets
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "ticket_id",
      "title": "string",
      "description": "string",
      "customer_email": "string",
      "priority": "string",
      "status": "string",
      "assigned_team": "string",
      "tags": ["string"],
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Voice Analysis Endpoints

### POST /api/voice
**Description**: Process audio file for voice insights
**Content-Type**: `multipart/form-data`
**Request Body**:
```
audio: [audio_file]
email: "string"
```
**Response**:
```json
{
  "success": true,
  "data": {
    "transcript": "audio transcription text",
    "finaltext": {
      "summary": "call summary",
      "sentiment": "Positive|Neutral|Negative",
      "keyTopics": ["topic1", "topic2"]
    }
  }
}
```

### POST /api/voice/tarnscript
**Description**: Process text transcript for analysis
**Request Body**:
```json
{
  "username": "string",
  "transcript": "string",
  "type": "string"
}
```

### POST /api/voice/voiceSummary
**Description**: Get voice insights summary for user
**Request Body**:
```json
{
  "email": "string"
}
```
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "insight_id",
      "email": "string",
      "transcript": "string",
      "finaltext": {
        "summary": "string",
        "sentiment": "string",
        "keyTopics": ["string"]
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## FAQ Bot Endpoints

### POST /api/ask
**Description**: Get intelligent FAQ response
**Request Body**:
```json
{
  "message": "user question"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "response": "AI-generated answer based on FAQ knowledge base"
  }
}
```

## Admin Management Endpoints

### POST /api/admin/login
**Description**: Admin authentication
**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

### GET /api/admin/dashboard
**Description**: Admin dashboard data
**Headers**: `Authorization: Bearer <token>`

## Error Response Format

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## API Design Principles

### 1. **RESTful Design**
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URL structure
- Stateless operations
- Consistent response formats

### 2. **Authentication & Authorization**
- JWT-based authentication
- Bearer token in Authorization header
- Role-based access control
- Secure password handling

### 3. **Input Validation**
- Request body validation
- Required field checking
- Data type validation
- File upload validation

### 4. **Error Handling**
- Consistent error response format
- Meaningful error messages
- Appropriate HTTP status codes
- Detailed logging for debugging

### 5. **Performance Considerations**
- Async/await for database operations
- Efficient query patterns
- Response caching (future enhancement)
- Rate limiting (future enhancement)

## Security Implementation

### 1. **Authentication Middleware**
```javascript
// JWT token verification
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  // Token verification logic
};
```

### 2. **Data Encryption**
```javascript
// API key encryption/decryption
const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

const decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
```

### 3. **Password Security**
```javascript
// Password hashing with bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

## API Versioning Strategy

### Current Version
- Base URL: `/api`
- No version prefix (v1 is implicit)

### Future Versioning
```javascript
// Versioned endpoints (future enhancement)
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v2/tickets', ticketRoutesV2);
```

## Rate Limiting (Future Enhancement)

### Implementation Strategy
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

## API Documentation (Future Enhancement)

### Swagger/OpenAPI Integration
```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Ticket Routing API',
      version: '1.0.0',
      description: 'AI-powered customer support API'
    }
  },
  apis: ['./routes/*.js']
};
```

## Testing Strategy

### 1. **Unit Testing**
- Controller function testing
- Service layer testing
- Model validation testing

### 2. **Integration Testing**
- API endpoint testing
- Database integration testing
- External service testing

### 3. **Load Testing**
- Performance testing
- Stress testing
- Scalability testing

## Monitoring & Analytics

### 1. **Request Logging**
```javascript
// Request/response logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});
```

### 2. **Error Tracking**
```javascript
// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
```

### 3. **Performance Metrics**
- Response time monitoring
- Database query performance
- External API call tracking
- Error rate monitoring
