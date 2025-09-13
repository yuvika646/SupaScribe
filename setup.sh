#!/bin/bash

echo "🚀 Setting up SupaScribe..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creating environment file..."
    cp .env.example .env.local
    echo "🔧 Please edit .env.local with your Supabase credentials before running the app."
else
    echo "✅ Environment file already exists."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up your Supabase project"
echo "2. Run the SQL script from database-schema.sql in your Supabase SQL editor"
echo "3. Update .env.local with your Supabase credentials"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "📚 See README.md for detailed instructions."
