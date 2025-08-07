# Deployment Architecture Documentation

## Deployment Overview

The Smart Ticket Routing System is designed for scalable deployment across multiple environments with proper separation of concerns, security, and monitoring capabilities.

## Environment Strategy

### 1. **Development Environment**
```
┌─────────────────────────────────────────────────────────────┐
│                    Development Server                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │   Node.js   │ │   MongoDB   │ │   Frontend  │        │
│  │   Server    │ │   Local     │ │   Dev       │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

**Configuration:**
- Node.js development server
- Local MongoDB instance
- Hot reloading with nodemon
- Debug logging enabled
- Unminified code for debugging

### 2. **Staging Environment**
```
┌─────────────────────────────────────────────────────────────┐
│                    Staging Environment                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │   Node.js   │ │   MongoDB   │ │   Frontend  │        │
│  │   Server    │ │   Staging   │ │   Staging   │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

**Configuration:**
- Production-like environment
- Staging database
- Performance testing
- Integration testing
- Security testing

### 3. **Production Environment**
```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer                           │
│                    (Nginx/HAProxy)                        │
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

## Containerization Strategy

### 1. **Docker Configuration**

#### Dockerfile
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy application files
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Set ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

EXPOSE 5000
CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/smart_ticket_system
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

volumes:
  mongo_data:
```

### 2. **Kubernetes Deployment**

#### Deployment YAML
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: smart-ticket-system
  labels:
    app: smart-ticket-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: smart-ticket-system
  template:
    metadata:
      labels:
        app: smart-ticket-system
    spec:
      containers:
      - name: smart-ticket-system
        image: smart-ticket-system:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGO_URI
          valueFrom:
            secretKeyRef:
              name: mongo-secret
              key: uri
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Service YAML
```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: smart-ticket-service
spec:
  selector:
    app: smart-ticket-system
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
  type: LoadBalancer
```

## CI/CD Pipeline

### 1. **GitHub Actions Workflow**

#### Development Pipeline
```yaml
# .github/workflows/development.yml
name: Development Pipeline

on:
  push:
    branches: [ develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6.0
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.runCommand(\"ping\")'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
      env:
        MONGO_URI: mongodb://localhost:27017/test
    
    - name: Run linting
      run: npm run lint
    
    - name: Security audit
      run: npm audit

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: docker build -t smart-ticket-system:${{ github.sha }} .
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push smart-ticket-system:${{ github.sha }}
```

#### Production Pipeline
```yaml
# .github/workflows/production.yml
name: Production Deployment

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to staging
      run: |
        # Deploy to staging environment
        kubectl apply -f k8s/staging/
    
    - name: Run integration tests
      run: |
        # Run integration tests against staging
        npm run test:integration
    
    - name: Deploy to production
      if: success()
      run: |
        # Deploy to production environment
        kubectl apply -f k8s/production/
```

### 2. **Infrastructure as Code**

#### Terraform Configuration
```hcl
# infrastructure/main.tf
provider "aws" {
  region = "us-west-2"
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "smart-ticket-vpc"
  }
}

# EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = "smart-ticket-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "1.27"

  vpc_config {
    subnet_ids = [
      aws_subnet.public_1.id,
      aws_subnet.public_2.id,
      aws_subnet.private_1.id,
      aws_subnet.private_2.id
    ]
  }
}

# RDS MongoDB
resource "aws_docdb_cluster" "main" {
  cluster_identifier = "smart-ticket-mongodb"
  engine             = "docdb"
  master_username    = "admin"
  master_password    = var.db_password
  skip_final_snapshot = true
}
```

## Monitoring & Observability

### 1. **Application Monitoring**

#### Health Check Endpoint
```javascript
// healthcheck.js
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected'
  };
  
  res.status(200).json(health);
});

app.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready' });
  }
});
```

#### Logging Configuration
```javascript
// logging.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'smart-ticket-system' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 2. **Infrastructure Monitoring**

#### Prometheus Metrics
```javascript
// metrics.js
const prometheus = require('prom-client');

const collectDefaultMetrics = prometheus.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});
```

## Scaling Strategy

### 1. **Horizontal Scaling**
```javascript
// Load balancer configuration
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Replace dead worker
  });
} else {
  // Worker process
  require('./server.js');
}
```

### 2. **Auto Scaling**
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: smart-ticket-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: smart-ticket-system
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Backup & Disaster Recovery

### 1. **Database Backup**
```bash
#!/bin/bash
# backup.sh

# Create backup directory
BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# MongoDB backup
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR"

# Compress backup
tar -czf "$BACKUP_DIR.tar.gz" -C "$BACKUP_DIR" .

# Upload to cloud storage
aws s3 cp "$BACKUP_DIR.tar.gz" "s3://backup-bucket/smart-ticket-system/"

# Clean up local files
rm -rf "$BACKUP_DIR"
rm "$BACKUP_DIR.tar.gz"
```

### 2. **Recovery Procedures**
```bash
#!/bin/bash
# restore.sh

# Download latest backup
aws s3 cp "s3://backup-bucket/smart-ticket-system/latest.tar.gz" .

# Extract backup
tar -xzf latest.tar.gz

# Restore database
mongorestore --uri="$MONGO_URI" backup/

# Clean up
rm -rf backup/
rm latest.tar.gz
```

## Security in Deployment

### 1. **Secrets Management**
```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  JWT_SECRET: <base64-encoded-jwt-secret>
  AZURE_OPENAI_KEY: <base64-encoded-azure-key>
  ASSEMBLYAI_API_KEY: <base64-encoded-assemblyai-key>
  MONGO_URI: <base64-encoded-mongo-uri>
```

### 2. **Network Security**
```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: smart-ticket-network-policy
spec:
  podSelector:
    matchLabels:
      app: smart-ticket-system
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 5000
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: mongodb
    ports:
    - protocol: TCP
      port: 27017
```

## Performance Optimization

### 1. **Caching Strategy**
```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});

const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      res.sendResponse = res.json;
      res.json = (body) => {
        client.setex(key, duration, JSON.stringify(body));
        res.sendResponse(body);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};
```

### 2. **CDN Configuration**
```javascript
// Static file serving with CDN
app.use('/static', express.static('public', {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));
```

This deployment architecture ensures high availability, scalability, security, and maintainability of the Smart Ticket Routing System across different environments.
