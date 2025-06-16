# GitHub Pages Deployment Guide for PriorAI

## 🚀 Quick Deploy Steps

### 1. Prepare Your Repository

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/howard768/PriorAI.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: PriorAI platform"

# Push to GitHub
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to your repository: https://github.com/howard768/PriorAI
2. Click on **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**
   - The workflow will automatically deploy when you push to main

### 3. First Deployment

The GitHub Actions workflow will automatically:
- Build the React app
- Deploy to GitHub Pages
- Make it available at: https://howard768.github.io/PriorAI

## 📋 What's Included in GitHub Pages Demo

### ✅ Working Features
- Complete UI/UX for prior authorization form
- Multi-step form with validation
- Confidence scoring visualization
- Mobile-responsive design
- Demo mode with mock data
- Simulated letter generation

### ⚠️ Demo Limitations
- No real backend connection
- Mock data only (5 sample payers)
- Simulated AI responses
- No actual API calls to Anthropic
- No real policy database access

## 🔧 Customization

### Update Demo Data
Edit `dashboard/src/services/mockDataService.js` to:
- Add more mock payers
- Customize mock letter templates
- Adjust simulated response times

### Change Branding
1. Update logo in `dashboard/src/components/logos/`
2. Modify colors in `dashboard/src/index.css`
3. Change app name in `dashboard/public/index.html`

## 🌐 Full Production Deployment

For complete functionality with real AI and backend:

1. **Deploy Backend Services**
   - Host AI service (port 3001)
   - Host data collection service (port 3002)
   - Set up SQLite database

2. **Update Configuration**
   ```javascript
   // dashboard/src/config/environment.js
   API_BASE_URL: 'https://your-api-domain.com'
   AI_SERVICE_URL: 'https://your-ai-domain.com'
   ```

3. **Environment Variables**
   - Add your Anthropic API key
   - Configure CORS for your domain

## 📊 Monitoring Your Deployment

- **Build Status**: Check Actions tab in GitHub
- **Deployment URL**: https://howard768.github.io/PriorAI
- **Error Logs**: Browser console in demo mode

## 🆘 Troubleshooting

### Build Fails
- Check Node version (requires 18+)
- Verify all dependencies installed
- Check for ESLint errors

### 404 Error
- Ensure GitHub Pages is enabled
- Wait 10-20 minutes for initial deployment
- Check repository settings

### Blank Page
- Check browser console for errors
- Verify homepage in package.json
- Clear browser cache

## 📝 Next Steps

1. **Test the Demo**: Visit https://howard768.github.io/PriorAI
2. **Share with Stakeholders**: Use demo for presentations
3. **Plan Backend Deployment**: For full functionality
4. **Customize**: Modify mock data and branding as needed

---

**Remember**: This GitHub Pages deployment is perfect for demos and showcasing the UI/UX, but you'll need to deploy the backend services separately for full production use with real AI capabilities. 