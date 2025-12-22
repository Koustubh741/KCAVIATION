# Check Environment Variables Script
Write-Host "🔍 Checking Backend Environment Configuration..." -ForegroundColor Cyan
Write-Host ""

$envLocalPath = Join-Path $PSScriptRoot ".env.local"
$envPath = Join-Path $PSScriptRoot ".env"

# Check if .env.local exists
if (Test-Path $envLocalPath) {
    Write-Host "✅ .env.local file exists" -ForegroundColor Green
    
    # Read and check API key
    $content = Get-Content $envLocalPath -Raw
    if ($content -match "OPENAI_API_KEY=(.+)") {
        $apiKey = $matches[1].Trim()
        if ($apiKey -like "sk-your-*" -or $apiKey -like "sk-your-openai-api-key-here*" -or $apiKey -eq "") {
            Write-Host "❌ OPENAI_API_KEY is still set to placeholder value!" -ForegroundColor Red
            Write-Host "   Current value: $apiKey" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "   Please update .env.local with your real OpenAI API key:" -ForegroundColor Yellow
            Write-Host "   OPENAI_API_KEY=sk-proj-... (your actual key)" -ForegroundColor White
        } elseif ($apiKey -like "sk-*") {
            Write-Host "✅ OPENAI_API_KEY appears to be set (starts with sk-)" -ForegroundColor Green
            Write-Host "   Key preview: $($apiKey.Substring(0, [Math]::Min(20, $apiKey.Length)))..." -ForegroundColor Gray
        } else {
            Write-Host "⚠️  OPENAI_API_KEY format looks incorrect" -ForegroundColor Yellow
            Write-Host "   Should start with 'sk-' or 'sk-proj-'" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ OPENAI_API_KEY not found in .env.local" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env.local file NOT found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Creating .env.local from env.example.txt..." -ForegroundColor Yellow
    
    if (Test-Path (Join-Path $PSScriptRoot "env.example.txt")) {
        Copy-Item (Join-Path $PSScriptRoot "env.example.txt") $envLocalPath
        Write-Host "✅ Created .env.local - Please edit it and add your OpenAI API key" -ForegroundColor Green
    } else {
        Write-Host "❌ env.example.txt not found!" -ForegroundColor Red
    }
}

# Check if .env exists (Next.js doesn't use this by default)
if (Test-Path $envPath) {
    Write-Host ""
    Write-Host "⚠️  .env file exists, but Next.js uses .env.local by default" -ForegroundColor Yellow
    Write-Host "   Consider renaming .env to .env.local" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Next.js Environment File Priority:" -ForegroundColor Cyan
Write-Host "   1. .env.local (highest priority - used by Next.js)" -ForegroundColor White
Write-Host "   2. .env.development (for dev mode)" -ForegroundColor White
Write-Host "   3. .env (lowest priority)" -ForegroundColor White
Write-Host ""
Write-Host "💡 After updating .env.local, restart the backend server!" -ForegroundColor Yellow


