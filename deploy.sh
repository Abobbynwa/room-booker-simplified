#!/bin/bash
# Quick deployment script for Room Booker
# Usage: ./deploy.sh [environment]
# Environments: development, production

set -e

ENVIRONMENT=${1:-development}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==================================================="
echo "Room Booker Deployment Script"
echo "Environment: $ENVIRONMENT"
echo "==================================================="

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 is required"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is required"
        exit 1
    fi
    
    echo "✅ Prerequisites checked"
}

# Deploy Backend
deploy_backend() {
    echo ""
    echo "Deploying backend..."
    cd "$PROJECT_ROOT/backend"
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    
    # Create admin user if it doesn't exist
    echo ""
    echo "Setting up admin user..."
    python3 create_admin.py --email admin@example.com --password SecurePass123 || true
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo ""
        echo "Starting production server with Gunicorn..."
        gunicorn -w 4 -b 0.0.0.0:8000 main:app &
    else
        echo ""
        echo "Starting development server..."
        uvicorn main:app --reload &
    fi
    
    echo "✅ Backend started"
}

# Deploy Frontend
deploy_frontend() {
    echo ""
    echo "Deploying frontend..."
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    npm install
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "Building for production..."
        npm run build
        
        # Output location
        echo ""
        echo "✅ Frontend built"
        echo "📁 Output: $PROJECT_ROOT/dist"
        echo ""
        echo "To deploy to Netlify/Vercel:"
        echo "  1. Push to GitHub"
        echo "  2. Connect repo to Netlify/Vercel"
        echo "  3. Set VITE_BACKEND_URL environment variable"
    else
        echo "Starting development server..."
        npm run dev &
        echo "✅ Frontend running at http://localhost:5173"
    fi
}

# Main deployment flow
main() {
    check_prerequisites
    deploy_backend
    deploy_frontend
    
    echo ""
    echo "==================================================="
    echo "✅ Deployment complete!"
    echo "==================================================="
    echo ""
    echo "Backend API: http://localhost:8000"
    echo "API Docs: http://localhost:8000/docs"
    echo ""
    echo "Frontend: http://localhost:5173 (dev) or dist/ (prod)"
    echo ""
    echo "Admin credentials:"
    echo "  Email: admin@example.com"
    echo "  Password: SecurePass123"
    echo ""
    echo "Next steps:"
    echo "  1. Update backend/.env with your settings"
    echo "  2. Update .env.local with your backend URL"
    echo "  3. Test the application at http://localhost:5173"
    echo ""
}

main
