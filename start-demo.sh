#!/bin/bash

echo "🩺 Starting GLP-1 RCM Intelligence Platform Demo"
echo "================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating one from template..."
    cp .env.example .env
    echo "📝 Please edit .env file and add your ANTHROPIC_API_KEY"
    echo "   You can get an API key from: https://console.anthropic.com/"
    read -p "Press Enter when you've added your API key..."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting services..."
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $AI_PID $DATA_PID $HTTP_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup INT TERM

# Start AI service in background
cd services/ai-service
echo "🤖 Starting AI Service on port 3001..."
node server.js &
AI_PID=$!
cd ../..

# Start Data Collection service in background
cd services/data-collection
echo "🏗️ Starting Data Collection Service on port 3002..."
node server.js &
DATA_PID=$!
cd ../..

# Wait a moment for AI service to start
sleep 3

# Start HTTP server for demo in background
cd frontend
echo "🌐 Starting Demo Interface on port 8000..."
python3 -m http.server 8000 >/dev/null 2>&1 &
HTTP_PID=$!
cd ..

# Wait for services to be ready
sleep 2

echo ""
echo "✅ GLP-1 RCM Platform is now running!"
echo ""
echo "🔗 Open these URLs in your browser:"
echo "   Demo Interface:     http://localhost:8000/demo.html"
echo "   Data Moat Dashboard: http://localhost:8000/data-moat.html"
echo "   AI Service API:     http://localhost:3001/health"
echo "   Data Collection API: http://localhost:3002/health"
echo ""
echo "🧪 Test scenarios included:"
echo "   • High Probability Case (85%+ approval)"
echo "   • Medium Probability Case (60-70% approval)" 
echo "   • Challenging Case (40-50% approval)"
echo ""
echo "💡 Investor Demo Tips:"
echo "   1. Load 'High Probability Case' and click 'Generate AI Analysis'"
echo "   2. Show live medical necessity letter generation (<30 seconds)"
echo "   3. Highlight approval probability and AI suggestions"
echo "   4. Switch between different payers to show optimization"
echo ""
echo "🛑 Press Ctrl+C to stop all services"
echo ""

# Keep script running
while true; do
    sleep 1
done 