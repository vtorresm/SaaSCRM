#!/bin/bash

# Sales CRM - Setup Development Environment Script
# This script sets up the complete development environment with Docker

set -e

echo "🚀 Setting up Sales CRM Development Environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker is available"

# Create .env files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env from template..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env - Please update with your actual credentials"
else
    echo "✅ backend/.env already exists"
fi

# Start Docker services
echo "🐳 Starting Docker services (PostgreSQL, Redis, MinIO)..."
docker-compose up -d postgres redis minio

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "   Waiting for database..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate dev --name init

# Create seed data (optional)
echo "🌱 Seeding database with initial data..."
npx prisma db seed || echo "⚠️ No seed script found, skipping..."

cd ..

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "📋 Services running:"
echo "   • PostgreSQL: localhost:5432"
echo "   • Redis: localhost:6379"
echo "   • MinIO: localhost:9000 (console: localhost:9001)"
echo "   • pgAdmin: http://localhost:8080 (optional, use --profile tools)"
echo "   • MailHog: http://localhost:8025 (optional, use --profile tools)"
echo ""
echo "🔧 Next steps:"
echo "   1. Update backend/.env with your actual credentials"
echo "   2. Start the backend: cd backend && npm run start:dev"
echo "   3. Start the frontend (once created): npm run dev:frontend"
echo ""
echo "🛠️ Useful commands:"
echo "   • Stop all services: docker-compose down"
echo "   • View logs: docker-compose logs -f [service]"
echo "   • Reset database: docker-compose down -v && ./scripts/setup-dev.sh"
echo "   • Access PostgreSQL: docker-compose exec postgres psql -U postgres -d sales_crm_dev"
echo ""
echo "📚 API Documentation will be available at: http://localhost:3001/api/v1/docs"
echo ""
echo "Happy coding! 🚀"