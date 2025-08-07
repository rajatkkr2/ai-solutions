# Database Design Documentation

## Database Overview

The Smart Ticket Routing System uses **MongoDB** as the primary database with **Mongoose ODM** for schema management and data validation. The database is designed to support AI-powered customer support operations with efficient querying and data relationships.

## Database Schema Design

### 1. **Tickets Collection**

#### Schema Definition
```javascript
const TicketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  customer_email: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'resolved', 'closed'], 
    default: 'open' 
  },
  assigned_team: { type: String },
  classified_by_ai: { type: Boolean, default: false },
  ai_confidence: { type: Number, default: 0 },
  tags: [String]
});
```

#### Document Example
```json
{
  "_id": "ObjectId('...')",
  "title": "Payment Issue with Credit Card",
  "description": "Unable to process payment with Visa card ending in 1234",
  "customer_email": "customer@example.com",
  "created_at": "2024-01-01T10:30:00.000Z",
  "priority": "high",
  "status": "open",
  "assigned_team": "Billing",
  "classified_by_ai": true,
  "ai_confidence": 0.95,
  "tags": ["payment", "credit-card", "billing"]
}
```

#### Indexes
```javascript
// Compound index for efficient querying
db.tickets.createIndex({ 
  "status": 1, 
  "priority": 1, 
  "created_at": -1 
});

// Text index for search functionality
db.tickets.createIndex({ 
  "title": "text", 
  "description": "text" 
});

// Index for email-based queries
db.tickets.createIndex({ "customer_email": 1 });
```

### 2. **VoiceInsights Collection**

#### Schema Definition
```javascript
const VoiceInsightsSchema = new mongoose.Schema({
  email: { type: String, required: true },
  transcript: { type: String },
  finaltext: { type: Object },
  filePath: { type: String },
  type: { type: String },
  createdAt: { type: Date, default: Date.now }
});
```

#### Document Example
```json
{
  "_id": "ObjectId('...')",
  "email": "customer@example.com",
  "transcript": "Hello, I'm calling about my recent order...",
  "finaltext": {
    "summary": "Customer called about order delivery",
    "sentiment": "Positive",
    "keyTopics": ["order", "delivery", "tracking"]
  },
  "filePath": "/uploads/audio_123.wav",
  "type": "audioFile",
  "createdAt": "2024-01-01T10:30:00.000Z"
}
```

#### Indexes
```javascript
// Compound index for user-based queries
db.voiceinsights.createIndex({ 
  "email": 1, 
  "createdAt": -1 
});

// Index for type-based filtering
db.voiceinsights.createIndex({ "type": 1 });
```

### 3. **Admin Collection**

#### Schema Definition
```javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  age: { type: Number, required: true }
});
```

#### Document Example
```json
{
  "_id": "ObjectId('...')",
  "username": "admin_user",
  "password": "$2b$10$hashed_password_here",
  "fullName": "John Doe",
  "age": 30
}
```

#### Indexes
```javascript
// Unique index for username
db.logins.createIndex({ "username": 1 }, { unique: true });
```

### 4. **UserQuestion Collection**

#### Schema Definition
```javascript
const userQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
```

#### Document Example
```json
{
  "_id": "ObjectId('...')",
  "question": "How do I reset my password?",
  "answer": "You can reset your password by...",
  "timestamp": "2024-01-01T10:30:00.000Z"
}
```

## Database Relationships

### 1. **One-to-Many Relationships**
```
Customer (email) → Multiple Tickets
Customer (email) → Multiple VoiceInsights
```

### 2. **Data Consistency**
- Email addresses serve as foreign keys
- Timestamps for audit trails
- Status tracking for workflow management

## Query Optimization

### 1. **Efficient Query Patterns**

#### Ticket Queries
```javascript
// Get tickets by status and priority
const tickets = await Ticket.find({
  status: 'open',
  priority: { $in: ['high', 'critical'] }
}).sort({ created_at: -1 });

// Get tickets by customer
const customerTickets = await Ticket.find({
  customer_email: 'customer@example.com'
}).sort({ created_at: -1 });

// Search tickets by text
const searchResults = await Ticket.find({
  $text: { $search: 'payment issue' }
});
```

#### Voice Insights Queries
```javascript
// Get user's voice insights
const insights = await VoiceInsights.find({
  email: 'customer@example.com'
}).sort({ createdAt: -1 });

// Get insights by type
const audioInsights = await VoiceInsights.find({
  type: 'audioFile'
}).sort({ createdAt: -1 });
```

### 2. **Aggregation Pipelines**

#### Ticket Analytics
```javascript
// Ticket statistics by priority
const priorityStats = await Ticket.aggregate([
  {
    $group: {
      _id: '$priority',
      count: { $sum: 1 },
      avgConfidence: { $avg: '$ai_confidence' }
    }
  }
]);

// Team workload distribution
const teamWorkload = await Ticket.aggregate([
  {
    $group: {
      _id: '$assigned_team',
      ticketCount: { $sum: 1 },
      avgPriority: { $avg: { $indexOfArray: ['low', 'medium', 'high', 'critical'], '$priority' } }
    }
  }
]);
```

#### Voice Insights Analytics
```javascript
// Sentiment analysis over time
const sentimentTrends = await VoiceInsights.aggregate([
  {
    $group: {
      _id: {
        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
      },
      avgSentiment: { $avg: { $cond: [
        { $eq: ['$finaltext.sentiment', 'Positive'] }, 1,
        { $cond: [{ $eq: ['$finaltext.sentiment', 'Negative'] }, -1, 0] }
      ]}}
    }
  },
  { $sort: { _id: 1 } }
]);
```

## Data Validation

### 1. **Schema Validation**
```javascript
// Mongoose schema validation
const TicketSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    minlength: 5,
    maxlength: 200
  },
  customer_email: { 
    type: String, 
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  }
});
```

### 2. **Business Logic Validation**
```javascript
// Pre-save validation
TicketSchema.pre('save', function(next) {
  if (this.priority === 'critical' && this.status === 'closed') {
    return next(new Error('Critical tickets cannot be closed directly'));
  }
  next();
});
```

## Backup and Recovery

### 1. **Backup Strategy**
```bash
# Automated daily backups
mongodump --db smart_ticket_system --out /backup/$(date +%Y%m%d)

# Weekly full backups
mongodump --db smart_ticket_system --out /backup/weekly/$(date +%Y%m%d)
```

### 2. **Recovery Procedures**
```bash
# Restore from backup
mongorestore --db smart_ticket_system /backup/20240101/smart_ticket_system/
```

## Performance Monitoring

### 1. **Query Performance**
```javascript
// Enable query logging
mongoose.set('debug', true);

// Monitor slow queries
db.setProfilingLevel(1, { slowms: 100 });
```

### 2. **Index Usage Analysis**
```javascript
// Analyze index usage
db.tickets.aggregate([
  { $indexStats: {} }
]);
```

## Data Migration Strategy

### 1. **Schema Evolution**
```javascript
// Version-based migrations
const migrationScripts = {
  '1.0.0': async () => {
    // Initial schema setup
  },
  '1.1.0': async () => {
    // Add new fields
    await Ticket.updateMany({}, { $set: { ai_confidence: 0 } });
  }
};
```

### 2. **Data Transformation**
```javascript
// Transform existing data
const transformTickets = async () => {
  const tickets = await Ticket.find({});
  for (const ticket of tickets) {
    if (!ticket.tags) {
      ticket.tags = [];
      await ticket.save();
    }
  }
};
```

## Security Considerations

### 1. **Data Encryption**
```javascript
// Encrypt sensitive fields
const encryptField = (value) => {
  return CryptoJS.AES.encrypt(value, process.env.ENCRYPTION_KEY).toString();
};

const decryptField = (encryptedValue) => {
  const bytes = CryptoJS.AES.decrypt(encryptedValue, process.env.ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
```

### 2. **Access Control**
```javascript
// Row-level security (future enhancement)
const secureQuery = (userRole, userId) => {
  const baseQuery = {};
  if (userRole === 'agent') {
    baseQuery.assigned_team = userTeam;
  }
  return baseQuery;
};
```

## Scalability Considerations

### 1. **Sharding Strategy**
```javascript
// Shard by customer email
db.tickets.createIndex({ "customer_email": 1 });
sh.shardCollection("smart_ticket_system.tickets", { "customer_email": 1 });
```

### 2. **Read Replicas**
```javascript
// Configure read preferences
const readPreference = 'secondaryPreferred';
const tickets = await Ticket.find().read(readPreference);
```

## Data Retention Policy

### 1. **TTL Indexes**
```javascript
// Auto-delete old voice files after 90 days
db.voiceinsights.createIndex(
  { "createdAt": 1 }, 
  { expireAfterSeconds: 7776000 } // 90 days
);
```

### 2. **Archive Strategy**
```javascript
// Archive resolved tickets after 1 year
const archiveOldTickets = async () => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  await Ticket.updateMany(
    { 
      status: 'resolved', 
      created_at: { $lt: oneYearAgo } 
    },
    { $set: { archived: true } }
  );
};
```

## Monitoring and Alerting

### 1. **Database Health Checks**
```javascript
// Connection monitoring
mongoose.connection.on('error', (err) => {
  console.error('Database connection error:', err);
  // Send alert
});

mongoose.connection.on('disconnected', () => {
  console.log('Database disconnected');
  // Send alert
});
```

### 2. **Performance Alerts**
```javascript
// Monitor query performance
const monitorQueryTime = async (queryFn) => {
  const start = Date.now();
  const result = await queryFn();
  const duration = Date.now() - start;
  
  if (duration > 1000) {
    console.warn(`Slow query detected: ${duration}ms`);
    // Send alert
  }
  
  return result;
};
```
