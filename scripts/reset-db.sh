#!/bin/bash

# Sales CRM - Reset Database Script
# This script resets the development database

set -e

echo "🔄 Resetting Sales CRM Development Database..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Stop and remove containers and volumes
echo "🛑 Stopping Docker services..."
docker-compose down -v

echo "🗑️ Removing database volumes..."
docker-compose down -v --remove-orphans

echo "🔄 Restarting services..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "   Waiting for database..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# Navigate to backend directory
cd backend

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Reset and migrate database
echo "🗄️ Resetting and migrating database..."
npx prisma migrate reset --force

# Run new migration
echo "🗄️ Running fresh migrations..."
npx prisma migrate dev --name init

# Seed database if seed script exists
if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
    echo "🌱 Seeding database..."
    npx prisma db seed
else
    echo "⚠️ No seed script found, skipping..."
fi

cd ..

echo ""
echo "🎉 Database reset complete!"
echo ""
echo "📋 Database Details:"
echo "   • Host: localhost:5432"
echo "   • Database: sales_crm_dev"
echo "   • User: postgres"
echo "   • Password: postgres123"
echo ""
echo "💡 You can now start the backend server with: cd backend && npm run start:dev"
echo ""