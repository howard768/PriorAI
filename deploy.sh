#!/bin/bash

# PriorAI Production Deployment Script
# This script prepares the application for production deployment

echo "🚀 Starting PriorAI Production Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run this script as root${NC}"
   exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}npm is not installed. Please install npm${NC}"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js version must be 18 or higher${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p logs
mkdir -p data
chmod 755 data

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Install service dependencies
echo -e "${YELLOW}Installing AI service dependencies...${NC}"
cd services/ai-service && npm install
cd ../..

echo -e "${YELLOW}Installing Data Collection service dependencies...${NC}"
cd services/data-collection-service && npm install
cd ../..

echo -e "${YELLOW}Installing Dashboard dependencies...${NC}"
cd dashboard && npm install
cd ..

# Build React app
echo -e "${YELLOW}Building React application...${NC}"
cd dashboard
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}React build failed${NC}"
    exit 1
fi
cd ..

echo -e "${GREEN}✓ Build completed successfully${NC}"

# Check for environment file
if [ ! -f .env ]; then
    echo -e "${YELLOW}No .env file found. Creating from template...${NC}"
    cat > .env << EOF
# Production Environment Configuration
# UPDATE THESE VALUES BEFORE RUNNING IN PRODUCTION

# AI Service Configuration
AI_SERVICE_PORT=3001
ANTHROPIC_API_KEY=your_production_anthropic_api_key_here

# Data Collection Service Configuration
DATA_COLLECTION_PORT=3002

# Frontend Configuration
REACT_APP_API_BASE_URL=http://localhost:3002
REACT_APP_AI_SERVICE_URL=http://localhost:3001

# Security
NODE_ENV=production
EOF
    echo -e "${RED}⚠️  Please update .env file with your production values${NC}"
fi

# Install PM2 if not installed
if ! command_exists pm2; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    npm install -g pm2
fi

# Install serve if not installed
if ! command_exists serve; then
    echo -e "${YELLOW}Installing serve...${NC}"
    npm install -g serve
fi

# Create systemd service (optional)
echo -e "${YELLOW}Do you want to create systemd service? (y/n)${NC}"
read -r CREATE_SYSTEMD

if [ "$CREATE_SYSTEMD" = "y" ]; then
    echo -e "${YELLOW}Creating systemd service...${NC}"
    pm2 startup systemd -u $USER --hp $HOME
fi

echo -e "${GREEN}✅ Deployment preparation complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update .env file with your production values"
echo "2. Set up your domain and SSL certificates"
echo "3. Configure Nginx as reverse proxy"
echo "4. Run: pm2 start ecosystem.config.js"
echo "5. Run: pm2 save"
echo ""
echo -e "${GREEN}For detailed instructions, see DEPLOYMENT.md${NC}" 