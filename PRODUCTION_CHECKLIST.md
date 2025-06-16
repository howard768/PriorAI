# PriorAI Production Deployment Checklist

## Pre-Deployment

### Code & Dependencies
- [ ] All code changes committed
- [ ] Dependencies updated and locked (`package-lock.json`)
- [ ] No console.log statements in production code
- [ ] Error handling implemented for all API calls
- [ ] Environment variables documented

### Security
- [ ] Anthropic API key secured (use environment variable)
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection headers configured

### Testing
- [ ] All features tested locally
- [ ] API endpoints tested with production-like data
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing completed
- [ ] Load testing performed

## Deployment Steps

### 1. Server Preparation
- [ ] Server provisioned (minimum 2GB RAM, 2 CPU cores)
- [ ] Domain name configured
- [ ] SSL certificates obtained (Let's Encrypt)
- [ ] Firewall configured (ports 80, 443 open)
- [ ] SSH key authentication set up

### 2. Software Installation
- [ ] Node.js 18+ installed
- [ ] PM2 installed globally
- [ ] Nginx installed and configured
- [ ] Git installed

### 3. Application Deployment
- [ ] Code deployed to server
- [ ] `.env` file created with production values
- [ ] Dependencies installed (`npm install`)
- [ ] React app built (`npm run build`)
- [ ] Database directory created with proper permissions

### 4. Service Configuration
- [ ] PM2 ecosystem file configured
- [ ] Services started with PM2
- [ ] PM2 startup script enabled
- [ ] Nginx reverse proxy configured
- [ ] SSL enabled and forced

### 5. Post-Deployment Verification
- [ ] All services running (`pm2 status`)
- [ ] Health endpoints responding
  - [ ] Frontend: https://yourdomain.com
  - [ ] AI Service: https://ai.yourdomain.com/health
  - [ ] Data Service: https://api.yourdomain.com/health
- [ ] Prior auth form loads and submits successfully
- [ ] Analytics dashboard displays data
- [ ] Letter generation works with real data

## Monitoring Setup

- [ ] PM2 monitoring enabled
- [ ] Log rotation configured
- [ ] Disk space monitoring
- [ ] Uptime monitoring (e.g., UptimeRobot)
- [ ] Error tracking (e.g., Sentry) - optional

## Backup Configuration

- [ ] Database backup script created
- [ ] Backup cron job scheduled
- [ ] Backup retention policy set
- [ ] Backup restoration tested

## Documentation

- [ ] API documentation updated
- [ ] Deployment guide reviewed
- [ ] Admin credentials documented securely
- [ ] Support contact information updated

## Performance Optimization

- [ ] Gzip compression enabled in Nginx
- [ ] Static assets cached properly
- [ ] Database indexes verified
- [ ] PM2 cluster mode enabled

## Final Checks

- [ ] Remove any test data
- [ ] Verify no sensitive data in logs
- [ ] Check all environment variables set correctly
- [ ] Confirm services auto-restart on reboot
- [ ] Document any custom configurations

## Go-Live

- [ ] DNS records updated
- [ ] Monitor logs during initial traffic
- [ ] Test critical user flows
- [ ] Announce go-live to stakeholders
- [ ] Monitor performance metrics

## Post-Launch (First 24 Hours)

- [ ] Monitor error logs
- [ ] Check resource usage
- [ ] Verify backup ran successfully
- [ ] Address any user-reported issues
- [ ] Document any lessons learned

---

**Emergency Contacts:**
- DevOps Lead: ___________
- System Admin: ___________
- On-call Developer: ___________

**Quick Commands:**
```bash
# View all services
pm2 status

# Restart a service
pm2 restart priorai-ai-service

# View logs
pm2 logs

# Monitor resources
pm2 monit
``` 