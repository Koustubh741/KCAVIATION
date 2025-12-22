@echo off
REM Setup script for backend (Windows)

echo Setting up KCAVIATION Backend...

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file from env.example...
    copy env.example .env
    echo.
    echo IMPORTANT: Please edit .env and add your OPENAI_API_KEY
    echo.
)

echo Setup complete!
echo.
echo To run the server:
echo   venv\Scripts\activate
echo   python run.py
echo.
echo Or:
echo   uvicorn src.api.main:app --reload

pause

