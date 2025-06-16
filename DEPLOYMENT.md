# PriorAI Production Deployment Guide

## Overview
This guide covers deploying the PriorAI platform to production, including all three services:
- React Frontend (Port 3000)
- AI Service (Port 3001)
- Data Collection Service (Port 3002)

## Prerequisites
- Node.js 18+ and npm
- PM2 for process management
- Nginx for reverse proxy
- SSL certificate (Let's Encrypt recommended)
- Domain name configured

## Environment Setup

### 1. Create Production Environment File
Create `.env.production` in the root directory:

```bash
# AI Service Configuration
AI_SERVICE_PORT=3001
ANTHROPIC_API_KEY=your_production_api_key_here

# Data Collection Service Configuration
DATA_COLLECTION_PORT=3002

# Frontend Configuration
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_AI_SERVICE_URL=https://ai.yourdomain.com

# Security
NODE_ENV=production
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install service dependencies
cd services/ai-service && npm install
cd ../data-collection-service && npm install
cd ../../dashboard && npm install
```

## Build Process

### 1. Build React App
```bash
cd dashboard
npm run build
```

### 2. Create PM2 Ecosystem File
Create `ecosystem.config.js` in root:

```javascript
module.exports = {
  apps: [
    {
      name: 'priorai-ai-service',
      script: './services/ai-service/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'priorai-data-service',
      script: './services/data-collection-service/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    },
    {
      name: 'priorai-frontend',
      script: 'serve',
      args: '-s dashboard/build -l 3000',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

## Nginx Configuration

Create `/etc/nginx/sites-available/priorai`:

```nginx
# Main site
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# API subdomain
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# AI subdomain
server {
    listen 443 ssl http2;
    server_name ai.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/ai.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ai.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Deployment Steps

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2 serve

# Install Nginx
sudo apt install nginx -y
```

### 2. Clone and Setup
```bash
# Clone repository
git clone https://github.com/yourusername/priorai-platform.git
cd priorai-platform

# Copy production env
cp .env.production .env

# Install dependencies
npm run install-all
```

### 3. Database Setup
```bash
# Ensure data directory exists
mkdir -p data

# Set permissions
chmod 755 data
```

### 4. Start Services
```bash
# Start all services with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

### 5. Configure Nginx
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/priorai /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Security Checklist

- [ ] Set strong Anthropic API key
- [ ] Enable firewall (ufw)
- [ ] Configure fail2ban
- [ ] Set up SSL certificates
- [ ] Disable root SSH access
- [ ] Regular security updates
- [ ] Backup strategy in place
- [ ] Monitor logs regularly

## Monitoring

### 1. PM2 Monitoring
```bash
# View all processes
pm2 list

# Monitor in real-time
pm2 monit

# View logs
pm2 logs
```

### 2. Health Checks
- Frontend: https://yourdomain.com
- AI Service: https://ai.yourdomain.com/health
- Data Service: https://api.yourdomain.com/health

## Backup Strategy

### Daily Backup Script
Create `/home/user/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/user/backups"
DATE=$(date +%Y%m%d)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp /path/to/priorai/data/policies.db $BACKUP_DIR/policies_$DATE.db

# Backup environment files
cp /path/to/priorai/.env $BACKUP_DIR/env_$DATE

# Keep only last 7 days
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "env_*" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /home/user/backup.sh
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port
   sudo lsof -i :3000
   # Kill process
   sudo kill -9 <PID>
   ```

2. **PM2 process not starting**
   ```bash
   # Check logs
   pm2 logs priorai-ai-service
   # Restart specific service
   pm2 restart priorai-ai-service
   ```

3. **Database locked**
   ```bash
   # Check for locks
   lsof | grep policies.db
   # Restart data service
   pm2 restart priorai-data-service
   ```

## Performance Optimization

1. **Enable Gzip compression in Nginx**
2. **Set up CDN for static assets**
3. **Configure PM2 cluster mode**
4. **Optimize SQLite with WAL mode**
5. **Set up Redis for caching (optional)**

## Maintenance

### Weekly Tasks
- Review logs for errors
- Check disk space
- Verify backups
- Update dependencies (test first)

### Monthly Tasks
- Security updates
- Performance review
- Database optimization
- SSL certificate renewal check

## Support

For issues or questions:
- Check logs: `pm2 logs`
- Review health endpoints
- Contact: support@priorai.com 