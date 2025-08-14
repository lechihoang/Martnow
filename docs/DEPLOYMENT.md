# Foodee Deployment Guide

Hướng dẫn deploy ứng dụng Foodee lên production environment.

## 🚀 Deployment Options

### 1. Docker Deployment (Recommended)
### 2. Traditional VPS Deployment
### 3. Cloud Platform Deployment (AWS, GCP, Azure)

---

## 🐳 Docker Deployment

### Prerequisites
- Docker & Docker Compose installed
- Domain name pointing to server
- SSL certificate (Let's Encrypt recommended)

### 1. Create Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:13
    container_name: foodee_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: foodee_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    networks:
      - foodee_network

  # Redis Cache (Optional)
  redis:
    image: redis:6-alpine
    container_name: foodee_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - foodee_network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: foodee_backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=foodee_db
      - JWT_SECRET=${JWT_SECRET}
      - VNPAY_TMN_CODE=${VNPAY_TMN_CODE}
      - VNPAY_SECRET_KEY=${VNPAY_SECRET_KEY}
      - REDIS_HOST=redis
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend/uploads:/app/uploads
    networks:
      - foodee_network

  # Frontend
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.prod
      args:
        - NEXT_PUBLIC_API_URL=${API_URL}
    container_name: foodee_frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - foodee_network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: foodee_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - foodee_network

volumes:
  postgres_data:
  redis_data:

networks:
  foodee_network:
    driver: bridge
```

### 2. Backend Production Dockerfile

```dockerfile
# backend/Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create uploads directory
RUN mkdir -p uploads/products

# Set permissions
RUN chown -R node:node /app
USER node

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

### 3. Frontend Production Dockerfile

```dockerfile
# Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set permissions
RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["npm", "start"]
```

### 4. Nginx Configuration

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    access_log  /var/log/nginx/access.log;
    error_log   /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Upstream servers
    upstream backend {
        server backend:3001;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name foodee.com www.foodee.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name foodee.com www.foodee.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/foodee.com.crt;
        ssl_certificate_key /etc/nginx/ssl/foodee.com.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Client max body size (for file uploads)
        client_max_body_size 10M;

        # API routes
        location /api {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeout settings
            proxy_connect_timeout 5s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Auth routes with stricter rate limiting
        location /auth/login {
            limit_req zone=login burst=5 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files (uploads)
        location /uploads {
            alias /app/uploads;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Frontend (Next.js)
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket support for Next.js dev
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

### 5. Environment Variables

```bash
# .env.production
# Database
DB_PASSWORD=your_strong_db_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters

# VNPay
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_SECRET_KEY=your_vnpay_secret_key

# Redis
REDIS_PASSWORD=your_redis_password

# API URL
API_URL=https://foodee.com
```

### 6. Deployment Commands

```bash
# Clone repository
git clone https://github.com/your-repo/foodee.git
cd foodee

# Set environment variables
cp .env.example .env.production
# Edit .env.production with your values

# Build and start services
docker-compose --env-file .env.production up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 🖥 Traditional VPS Deployment

### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+
- PostgreSQL 13+
- Nginx
- PM2 process manager
- SSL certificate

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install PM2
sudo npm install -g pm2

# Install SSL certificate (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
```

### 2. Database Setup

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE foodee_db;
CREATE USER foodee_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE foodee_db TO foodee_user;
\q

# Configure PostgreSQL
sudo nano /etc/postgresql/13/main/postgresql.conf
# Uncomment and modify:
# listen_addresses = 'localhost'
# max_connections = 100

sudo systemctl restart postgresql
```

### 3. Application Deployment

```bash
# Create app directory
sudo mkdir -p /var/www/foodee
sudo chown -R $USER:$USER /var/www/foodee

# Clone and setup backend
cd /var/www/foodee
git clone https://github.com/your-repo/foodee.git .

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with production values
npm run build

# Setup frontend
cd ..
npm install
cp .env.example .env.local
# Edit .env.local with production values
npm run build

# Start services with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'foodee-backend',
      script: 'backend/dist/main.js',
      cwd: '/var/www/foodee',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log',
      log_file: '/var/log/pm2/backend-combined.log',
    },
    {
      name: 'foodee-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/foodee',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      max_memory_restart: '300M',
      error_file: '/var/log/pm2/frontend-error.log',
      out_file: '/var/log/pm2/frontend-out.log',
      log_file: '/var/log/pm2/frontend-combined.log',
    },
  ],
};
```

### 5. Nginx Configuration

```nginx
# /etc/nginx/sites-available/foodee
server {
    listen 80;
    server_name foodee.com www.foodee.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name foodee.com www.foodee.com;

    ssl_certificate /etc/letsencrypt/live/foodee.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/foodee.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    client_max_body_size 10M;

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/foodee /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d foodee.com -d www.foodee.com
```

---

## ☁️ Cloud Platform Deployment

### AWS Deployment

#### 1. Using AWS ECS (Elastic Container Service)

```yaml
# docker-compose.aws.yml
version: '3.8'
x-aws-vpc: "vpc-12345"
x-aws-cluster: "foodee-cluster"

services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: foodee_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    x-aws-role: "arn:aws:iam::123456789:role/ECSTaskRole"

  backend:
    build: ./backend
    environment:
      - DB_HOST=postgres
    secrets:
      - db_password
      - jwt_secret
    x-aws-role: "arn:aws:iam::123456789:role/ECSTaskRole"

  frontend:
    build: .
    depends_on:
      - backend

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

#### 2. Using AWS Elastic Beanstalk

```json
// .ebextensions/01_nginx.config
{
  "files": {
    "/etc/nginx/conf.d/proxy.conf": {
      "mode": "000644",
      "owner": "root",
      "group": "root",
      "content": "client_max_body_size 10M;\n"
    }
  }
}
```

### Heroku Deployment

```json
// package.json - root level
{
  "name": "foodee",
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "heroku-postbuild": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm install && npm run build",
    "build:frontend": "npm install && npm run build",
    "start": "cd backend && npm run start:prod"
  }
}
```

```yaml
# heroku.yml
build:
  docker:
    web: Dockerfile.heroku

release:
  image: web
  command:
    - npm run typeorm:run
```

---

## 📊 Monitoring & Logging

### 1. Application Monitoring

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  # Prometheus
  prometheus:
    image: prom/prometheus
    container_name: foodee_prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  # Grafana
  grafana:
    image: grafana/grafana
    container_name: foodee_grafana
    ports:
      - "3050:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

  # Node Exporter
  node_exporter:
    image: prom/node-exporter
    container_name: foodee_node_exporter
    ports:
      - "9100:9100"

volumes:
  prometheus_data:
  grafana_data:
```

### 2. Log Aggregation with ELK Stack

```yaml
# docker-compose.elk.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    volumes:
      - ./elk/logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

### 3. Health Checks

```typescript
// backend/src/health/health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  @Get('db')
  async checkDatabase() {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', database: 'connected' };
    } catch (error) {
      return { status: 'error', database: 'disconnected', error: error.message };
    }
  }
}
```

---

## 🔒 Security Checklist

### Application Security
- [ ] Environment variables secured
- [ ] JWT secrets rotated regularly
- [ ] Input validation enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] SQL injection protection
- [ ] XSS protection headers

### Infrastructure Security
- [ ] Firewall configured (UFW/iptables)
- [ ] SSH key-only authentication
- [ ] Regular security updates
- [ ] Database access restricted
- [ ] SSL/TLS certificates configured
- [ ] Backup encryption enabled

### Monitoring Security
- [ ] Failed login attempts monitored
- [ ] Suspicious activity alerts
- [ ] Access logs analyzed
- [ ] Security scan scheduled

---

## 🔧 Maintenance & Updates

### Regular Maintenance Tasks

```bash
#!/bin/bash
# maintenance.sh

echo "Starting maintenance tasks..."

# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
cd /var/www/foodee
npm update

# Database backup
pg_dump -h localhost -U foodee_user foodee_db > /backups/foodee_$(date +%Y%m%d).sql

# Clean old backups (keep 30 days)
find /backups -name "foodee_*.sql" -mtime +30 -delete

# PM2 maintenance
pm2 update
pm2 restart all

# Nginx log rotation
sudo logrotate -f /etc/logrotate.d/nginx

echo "Maintenance completed!"
```

### Zero-Downtime Deployment

```bash
#!/bin/bash
# deploy.sh

echo "Starting zero-downtime deployment..."

# Pull latest code
git pull origin main

# Backend deployment
cd backend
npm install
npm run build
pm2 reload foodee-backend --wait-ready

# Frontend deployment
cd ..
npm install
npm run build
pm2 reload foodee-frontend --wait-ready

# Health check
curl -f http://localhost:3001/health || exit 1
curl -f http://localhost:3000/ || exit 1

echo "Deployment completed successfully!"
```

---

## 📞 Support & Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Restart PostgreSQL
sudo systemctl restart postgresql
```

#### 2. High Memory Usage
```bash
# Check memory usage
free -h
pm2 monit

# Restart services if needed
pm2 restart all
```

#### 3. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew --dry-run
sudo certbot renew
```

### Log Locations
- **Application Logs**: `/var/log/pm2/`
- **Nginx Logs**: `/var/log/nginx/`
- **PostgreSQL Logs**: `/var/log/postgresql/`
- **System Logs**: `/var/log/syslog`

### Performance Monitoring
```bash
# Server performance
htop
iotop
netstat -tulpn

# Application performance
pm2 monit
pm2 logs

# Database performance
sudo -u postgres psql -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

---

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Code tested in staging environment
- [ ] Database migrations reviewed
- [ ] Environment variables configured
- [ ] SSL certificates prepared
- [ ] Backup strategy in place
- [ ] Monitoring configured

### Deployment
- [ ] Services deployed successfully
- [ ] Health checks passing
- [ ] Database migrations applied
- [ ] Static files served correctly
- [ ] SSL/HTTPS working
- [ ] Rate limiting configured

### Post-deployment
- [ ] Application functionality verified
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] Backup working
- [ ] Monitoring alerts configured
- [ ] Documentation updated

---

*Deployment completed successfully! 🎉*
