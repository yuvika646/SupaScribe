# SupaScribe Setup Script for Windows

Write-Host "🚀 Setting up SupaScribe..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Check if .env.local exists
if (!(Test-Path ".env.local")) {
    Write-Host "⚙️  Creating environment file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "🔧 Please edit .env.local with your Supabase credentials before running the app." -ForegroundColor Cyan
} else {
    Write-Host "✅ Environment file already exists." -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Set up your Supabase project" -ForegroundColor White
Write-Host "2. Run the SQL script from database-schema.sql in your Supabase SQL editor" -ForegroundColor White
Write-Host "3. Update .env.local with your Supabase credentials" -ForegroundColor White
Write-Host "4. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host ""
Write-Host "📚 See README.md for detailed instructions." -ForegroundColor Cyan
