# Smart Ticket Routing System - Backend Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Component Details](#component-details)
7. [Security Architecture](#security-architecture)
8. [API Design](#api-design)
9. [Database Design](#database-design)
10. [AI Integration](#ai-integration)
11. [Deployment Architecture](#deployment-architecture)
12. [Performance Considerations](#performance-considerations)
13. [Scalability Strategy](#scalability-strategy)
14. [Monitoring & Logging](#monitoring--logging)
15. [Best Practices Implementation](#best-practices-implementation)

## System Overview

The Smart Ticket Routing System is a comprehensive AI-powered customer support platform that combines intelligent ticket classification, voice analysis, and automated FAQ responses. The system follows a **layered architecture pattern** with clear separation of concerns and industry-standard practices.

### Core Features
- **AI-Powered Ticket Classification**: Automatically categorizes and routes support tickets
- **Voice Insights Analysis**: Processes audio files for customer sentiment and intent analysis
- **Smart FAQ Bot**: Provides intelligent responses based on FAQ knowledge base
- **Admin Management**: Secure admin interface for system management
- **Authentication & Authorization**: JWT-based secure access control

## Architecture Patterns

### 1. **Layered Architecture (3-Tier)**
```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│         (Routes & Controllers)      │
├─────────────────────────────────────┤
│           Business Logic Layer      │
│           (Services)                │
├─────────────────────────────────────┤
│           Data Access Layer         │
│           (Models & Database)       │
└─────────────────────────────────────┘
```

### 2. **MVC Pattern**
- **Models**: Data structure and database schemas
- **Views**: API responses (JSON)
- **Controllers**: Request handling and business logic coordination

### 3. **Service-Oriented Architecture**
- Modular services for different functionalities
- Loose coupling between components
- Reusable service components

## Technology Stack

### Backend Framework
- **Node.js** (v18+) - Runtime environment
- **Express.js** (v5.1.0) - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** (v8.15.1) - ODM for MongoDB

### AI & External Services
- **Azure OpenAI** - GPT models for text analysis
- **AssemblyAI** - Audio transcription service
- **JWT** - Authentication tokens

### Security & Utilities
- **bcryptjs** - Password hashing
- **crypto-js** - Data encryption
- **multer** - File upload handling
- **cors** - Cross-origin resource sharing

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                            │
│                    (Frontend Applications)                     │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP/HTTPS
┌─────────────────────▼───────────────────────────────────────────┐
│                    API Gateway Layer                           │
│                    (Express.js Server)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │   CORS      │ │   Auth      │ │   Rate      │            │
│  │ Middleware  │ │ Middleware  │ │ Limiting    │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    Route Layer                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │   Ticket    │ │   Voice     │ │   FAQ       │            │
│  │   Routes    │ │   Routes    │ │   Routes    │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                  Controller Layer                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │   Ticket    │ │   Voice     │ │   FAQ       │            │
│  │ Controller  │ │ Controller  │ │ Controller  │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                   Service Layer                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │   Ticket    │ │   Voice     │ │   FAQ       │            │
│  │   AI        │ │   AI        │ │   Bot       │            │
│  │ Service     │ │ Service     │ │ Service     │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                  External AI Services                          │
│  ┌─────────────┐ ┌─────────────┐                            │
│  │   Azure     │ │ AssemblyAI  │                            │
│  │   OpenAI    │ │ (Audio      │                            │
│  │   (GPT)     │ │  Trans.)    │                            │
│  └─────────────┘ └─────────────┘                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                   Data Layer                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │   Ticket    │ │   Voice     │ │   Admin     │            │
│  │   Model     │ │   Model     │ │   Model     │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                   MongoDB Database                             │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Ticket Creation Flow
```
Client → API Gateway → Ticket Routes → Ticket Controller → Ticket AI Service → Azure OpenAI → Database
   ↑                                                                                              ↓
   └────────────────────────── Response with classified ticket ←──────────────────────────────────┘
```

### 2. Voice Analysis Flow
```
Client → API Gateway → Voice Routes → Voice Controller → Voice AI Service → AssemblyAI → Azure OpenAI → Database
   ↑                                                                                                        ↓
   └────────────────────────── Response with analysis results ←──────────────────────────────────────────────┘
```

### 3. FAQ Bot Flow
```
Client → API Gateway → FAQ Routes → FAQ Controller → FAQ Bot Service → Azure OpenAI → Response
   ↑                                                                                    ↓
   └────────────────────────── Response with FAQ answer ←────────────────────────────────┘
```

## Component Details

### 1. **API Gateway (server.js)**
```javascript
// Central entry point with middleware configuration
- CORS handling
- JSON body parsing
- Route registration
- Database connection
- Environment configuration
```

### 2. **Route Layer**
- **ticketRoutes.js**: Ticket CRUD operations
- **aiVoiceInsightsRoutes.js**: Voice analysis endpoints
- **smartFaqBotRoutes.js**: FAQ bot interactions
- **adminRoutes.js**: Admin management
- **authRoutes.js**: Authentication endpoints

### 3. **Controller Layer**
- **ticketController.js**: Ticket business logic
- **aiVoiceInsightsController.js**: Voice processing logic
- **smartFaqBotController.js**: FAQ response handling
- **adminController.js**: Admin operations
- **authController.js**: Authentication logic

### 4. **Service Layer**
- **ticketAiService.js**: AI ticket classification
- **aiVoiceInsightsService.js**: Voice transcription and analysis
- **faqBotService.js**: FAQ response generation
- **csvService.js**: Data export functionality
- **faqtxtServices.js**: Text processing utilities

### 5. **Data Models**
- **Ticket.js**: Support ticket schema
- **VoiceInsights.js**: Voice analysis results
- **Admin.js**: Admin user management
- **userQuestion.js**: User interaction tracking

## Security Architecture

### 1. **Authentication & Authorization**
```javascript
// JWT-based authentication
- Token generation and validation
- Password hashing with bcrypt
- Role-based access control
- Secure session management
```

### 2. **Data Protection**
```javascript
// Encryption utilities
- API key encryption/decryption
- Sensitive data protection
- Secure environment variables
```

### 3. **Input Validation**
```javascript
// Request validation
- Data sanitization
- Type checking
- Required field validation
- File upload security
```

## API Design

### RESTful API Endpoints

#### Ticket Management
```
POST   /api/tickets              - Create new ticket
POST   /api/tickets/getAllTickets - Get all tickets
```

#### Voice Analysis
```
POST   /api/voice                - Process audio file
POST   /api/voice/tarnscript     - Process transcript
POST   /api/voice/voiceSummary   - Get voice insights
```

#### FAQ Bot
```
POST   /api/ask                  - Get FAQ response
```

#### Admin Management
```
POST   /api/admin/login          - Admin authentication
GET    /api/admin/dashboard      - Admin dashboard
```

#### Authentication
```
POST   /api/auth/login           - User login
POST   /api/auth/register        - User registration
```

### API Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Database Design

### MongoDB Collections

#### 1. **Tickets Collection**
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  customer_email: String (required),
  created_at: Date (default: now),
  priority: String (enum: ['low', 'medium', 'high', 'critical']),
  status: String (enum: ['open', 'in_progress', 'resolved', 'closed']),
  assigned_team: String,
  classified_by_ai: Boolean (default: false),
  ai_confidence: Number (default: 0),
  tags: [String]
}
```

#### 2. **VoiceInsights Collection**
```javascript
{
  _id: ObjectId,
  email: String (required),
  transcript: String,
  finaltext: Object,
  filePath: String,
  type: String,
  createdAt: Date (default: now)
}
```

#### 3. **Admin Collection**
```javascript
{
  _id: ObjectId,
  username: String (required, unique),
  password: String (hashed, required),
  fullName: String (required),
  age: Number (required)
}
```

## AI Integration

### 1. **Azure OpenAI Integration**
```javascript
// Configuration
- Endpoint: Azure OpenAI service
- Model: GPT deployment
- API version: 2023-12-01-preview
- Temperature: 0.3-0.7 (configurable)
- Max tokens: 200-300 (configurable)
```

### 2. **AssemblyAI Integration**
```javascript
// Audio Processing
- File upload to AssemblyAI
- Real-time transcription
- Polling for completion
- Error handling and retry logic
```

### 3. **AI Service Patterns**
```javascript
// Service Layer Pattern
- Async/await for AI calls
- Error handling and fallbacks
- Response parsing and validation
- Caching strategies (future enhancement)
```

## Deployment Architecture

### Development Environment
```
┌─────────────────────────────────────────────────────────────┐
│                    Development Server                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │   Node.js   │ │   MongoDB   │ │   Frontend  │        │
│  │   Server    │ │   Local     │ │   Dev       │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Production Environment (Recommended)
```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Application Servers                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │   Server 1  │ │   Server 2  │ │   Server N  │        │
│  │   Node.js   │ │   Node.js   │ │   Node.js   │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Database Cluster                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │   MongoDB   │ │   MongoDB   │ │   MongoDB   │        │
│  │   Primary   │ │   Secondary │ │   Arbiter   │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Performance Considerations

### 1. **Database Optimization**
```javascript
// Indexing Strategy
- Compound indexes on frequently queried fields
- Text indexes for search functionality
- TTL indexes for temporary data
```

### 2. **Caching Strategy**
```javascript
// Redis Integration (Future Enhancement)
- Session caching
- API response caching
- FAQ data caching
- AI response caching
```

### 3. **Async Processing**
```javascript
// Background Jobs (Future Enhancement)
- Queue-based processing for AI tasks
- Email notifications
- Report generation
- Data analytics
```

## Scalability Strategy

### 1. **Horizontal Scaling**
- Multiple application instances
- Load balancing
- Database sharding
- Microservices architecture (future)

### 2. **Vertical Scaling**
- Increased server resources
- Database optimization
- Connection pooling
- Memory management

### 3. **CDN Integration**
- Static asset delivery
- Global content distribution
- Reduced latency

## Monitoring & Logging

### 1. **Application Monitoring**
```javascript
// Logging Strategy
- Request/response logging
- Error tracking
- Performance metrics
- User activity monitoring
```

### 2. **Health Checks**
```javascript
// System Health
- Database connectivity
- External service status
- API endpoint availability
- Resource utilization
```

### 3. **Alerting System**
```javascript
// Proactive Monitoring
- Error rate thresholds
- Response time alerts
- Service availability
- Security incidents
```

## Best Practices Implementation

### 1. **Code Organization**
- ✅ Modular architecture
- ✅ Separation of concerns
- ✅ Clear naming conventions
- ✅ Consistent code style

### 2. **Error Handling**
- ✅ Try-catch blocks
- ✅ Graceful degradation
- ✅ Meaningful error messages
- ✅ Logging and monitoring

### 3. **Security**
- ✅ Input validation
- ✅ Authentication middleware
- ✅ Data encryption
- ✅ Secure API design

### 4. **Performance**
- ✅ Async/await patterns
- ✅ Efficient database queries
- ✅ Response optimization
- ✅ Resource management

### 5. **Maintainability**
- ✅ Clear documentation
- ✅ Modular services
- ✅ Environment configuration
- ✅ Version control

## Future Enhancements

### 1. **Microservices Architecture**
- Separate services for different domains
- API gateway implementation
- Service discovery
- Inter-service communication

### 2. **Advanced AI Features**
- Real-time chat support
- Predictive analytics
- Sentiment analysis dashboard
- Automated ticket resolution

### 3. **Enterprise Features**
- Multi-tenant architecture
- Advanced reporting
- Integration APIs
- Custom workflows

### 4. **DevOps Integration**
- CI/CD pipelines
- Container orchestration
- Infrastructure as Code
- Automated testing

---

## Conclusion

The Smart Ticket Routing System demonstrates a well-architected, scalable backend solution that follows industry best practices. The layered architecture ensures maintainability, while the AI integration provides intelligent automation. The system is designed for growth and can be easily extended with additional features and services.

**Key Strengths:**
- Clean separation of concerns
- Modular service architecture
- Comprehensive error handling
- Security-first approach
- Scalable design patterns
- Industry-standard practices

This architecture provides a solid foundation for a production-ready customer support platform with room for future enhancements and scaling.
