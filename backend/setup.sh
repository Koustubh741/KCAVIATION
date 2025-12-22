#!/bin/bash
# Setup script for backend

echo "Setting up KCAVIATION Backend..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from env.example..."
    cp env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your OPENAI_API_KEY"
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "To run the server:"
echo "  source venv/bin/activate"
echo "  python run.py"
echo ""
echo "Or:"
echo "  uvicorn src.api.main:app --reload"

