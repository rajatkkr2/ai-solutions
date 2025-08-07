# Smart Ticket Routing System - Backend Architecture Overview

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
- Central entry point with middleware configuration
- CORS handling
- JSON body parsing
- Route registration
- Database connection
- Environment configuration

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
