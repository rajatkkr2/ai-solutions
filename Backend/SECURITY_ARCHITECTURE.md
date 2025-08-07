# Security Architecture Documentation

## Security Overview

The Smart Ticket Routing System implements a comprehensive security architecture following industry best practices and OWASP guidelines. The system employs multiple layers of security controls to protect data, authenticate users, and ensure secure communication.

## Security Layers

### 1. **Authentication & Authorization**

#### JWT-Based Authentication
```javascript
// authMiddleware.js
const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
```

#### Password Security
```javascript
// Admin.js - Password hashing
const bcrypt = require('bcryptjs');

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};
```

### 2. **Data Encryption**

#### API Key Encryption
```javascript
// utility/crypto.js
const CryptoJS = require("crypto-js");
const SECRET_KEY = process.env.CRYPTO_SECRET_KEY;

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

#### Environment Variable Protection
```javascript
// .env file (not in version control)
JWT_SECRET=your-super-secret-jwt-key
CRYPTO_SECRET_KEY=your-encryption-key
AZURE_OPENAI_KEY=encrypted_azure_key
ASSEMBLYAI_API_KEY=your_assemblyai_key
MONGO_URI=mongodb://localhost:27017/smart_ticket_system
```

### 3. **Input Validation & Sanitization**

#### Request Validation
```javascript
// Input validation middleware
const validateTicketInput = (req, res, next) => {
  const { title, description, customer_email } = req.body;
  
  if (!title || !description || !customer_email) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customer_email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  
  // Length validation
  if (title.length > 200 || description.length > 1000) {
    return res.status(400).json({ message: 'Input too long' });
  }
  
  next();
};
```

#### File Upload Security
```javascript
// Multer configuration with security
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Allow only audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});
```

### 4. **CORS Configuration**

#### Cross-Origin Resource Sharing
```javascript
// server.js
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Security Headers

### 1. **Helmet.js Integration**
```javascript
// Security headers middleware
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 2. **Rate Limiting**
```javascript
// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

## Database Security

### 1. **MongoDB Security**
```javascript
// Database connection with security
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: process.env.NODE_ENV === 'production',
      sslValidate: true,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority'
    });
    console.log('MongoDB connected securely');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};
```

### 2. **Data Validation**
```javascript
// Mongoose schema validation
const TicketSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    minlength: 5,
    maxlength: 200,
    trim: true
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

## API Security

### 1. **Request Logging**
```javascript
// Security logging middleware
const securityLogger = (req, res, next) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.admin || 'anonymous'
  };
  
  console.log('Security Log:', logEntry);
  next();
};

app.use(securityLogger);
```

### 2. **Error Handling**
```javascript
// Secure error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't expose internal errors to client
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
    
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: errorMessage,
      code: err.code || 'INTERNAL_ERROR'
    }
  });
});
```

## External Service Security

### 1. **Azure OpenAI Security**
```javascript
// Secure API key handling
const callAzureOpenAI = async (prompt) => {
  const encryptedKey = process.env.AZURE_OPENAI_KEY;
  const decryptedKey = decrypt(encryptedKey);
  
  const response = await axios.post(url, {
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 200,
  }, {
    headers: {
      'api-key': decryptedKey,
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
  });
  
  return response.data;
};
```

### 2. **AssemblyAI Security**
```javascript
// Secure audio processing
const processAudioSecurely = async (filePath) => {
  // Validate file exists and is accessible
  if (!fs.existsSync(filePath)) {
    throw new Error('Audio file not found');
  }
  
  // Check file size
  const stats = fs.statSync(filePath);
  if (stats.size > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('File too large');
  }
  
  // Process with AssemblyAI
  const transcript = await transcribeAudio(filePath);
  
  // Clean up temporary file
  fs.unlinkSync(filePath);
  
  return transcript;
};
```

## Security Monitoring

### 1. **Intrusion Detection**
```javascript
// Suspicious activity detection
const detectSuspiciousActivity = (req) => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onload=/i,
    /onerror=/i
  ];
  
  const requestBody = JSON.stringify(req.body);
  const requestUrl = req.url;
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestBody) || pattern.test(requestUrl)) {
      console.warn('Suspicious activity detected:', {
        ip: req.ip,
        url: req.url,
        pattern: pattern.source
      });
      return true;
    }
  }
  
  return false;
};
```

### 2. **Failed Authentication Monitoring**
```javascript
// Track failed login attempts
const trackFailedLogin = (username, ip) => {
  const failedAttempts = getFailedAttempts(ip);
  
  if (failedAttempts > 5) {
    console.warn('Multiple failed login attempts:', { username, ip });
    // Implement account lockout or CAPTCHA
  }
};
```

## Compliance & Auditing

### 1. **Audit Logging**
```javascript
// Comprehensive audit trail
const auditLog = (action, userId, details) => {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };
  
  // Store in audit collection
  AuditLog.create(auditEntry);
};
```

### 2. **Data Privacy**
```javascript
// GDPR compliance - data anonymization
const anonymizeUserData = (email) => {
  const [localPart, domain] = email.split('@');
  const anonymizedLocal = localPart.substring(0, 2) + '***';
  return `${anonymizedLocal}@${domain}`;
};
```

## Security Testing

### 1. **Penetration Testing Checklist**
- [ ] SQL Injection testing
- [ ] XSS vulnerability testing
- [ ] CSRF protection testing
- [ ] Authentication bypass testing
- [ ] File upload vulnerability testing
- [ ] API endpoint security testing

### 2. **Security Headers Testing**
```javascript
// Test security headers
const testSecurityHeaders = (res) => {
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Strict-Transport-Security'
  ];
  
  requiredHeaders.forEach(header => {
    assert(res.headers[header], `Missing security header: ${header}`);
  });
};
```

## Incident Response

### 1. **Security Incident Procedures**
```javascript
// Security incident handler
const handleSecurityIncident = (incident) => {
  console.error('SECURITY INCIDENT:', incident);
  
  // Log incident
  SecurityIncident.create({
    type: incident.type,
    severity: incident.severity,
    details: incident.details,
    timestamp: new Date(),
    ip: incident.ip,
    userId: incident.userId
  });
  
  // Alert administrators
  notifyAdmins(incident);
  
  // Take immediate action
  if (incident.severity === 'HIGH') {
    blockIP(incident.ip);
  }
};
```

### 2. **Recovery Procedures**
```javascript
// System recovery after security incident
const systemRecovery = async () => {
  // Revoke all active sessions
  await Session.deleteMany({});
  
  // Reset failed login attempts
  await FailedLoginAttempt.deleteMany({});
  
  // Generate new API keys
  await rotateAPIKeys();
  
  console.log('System recovered from security incident');
};
```

## Security Best Practices Summary

### ✅ **Implemented Security Measures**
- JWT-based authentication
- Password hashing with bcrypt
- API key encryption
- Input validation and sanitization
- CORS configuration
- File upload security
- Error handling without information disclosure
- Audit logging
- Rate limiting (planned)

### 🔄 **Future Security Enhancements**
- Two-factor authentication (2FA)
- OAuth2 integration
- Advanced rate limiting
- Web Application Firewall (WAF)
- Security headers with Helmet.js
- Automated security scanning
- Vulnerability assessment tools
- Security monitoring dashboard

This security architecture provides a robust foundation for protecting sensitive customer data and ensuring secure system operations.
