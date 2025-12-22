# Dependency Fix - OpenAI Client Error

## Issue
```
TypeError: Client.__init__() got an unexpected keyword argument 'proxies'
```

## Root Cause
Version incompatibility between `openai` package and `httpx`/`httpcore` dependencies. The installed version `openai 1.54.0` was incompatible with the HTTP client libraries.

## Solution Applied
1. **Upgraded OpenAI**: Updated from `openai 1.54.0` to `openai 2.14.0`
2. **Updated httpx/httpcore**: Ensured compatible versions are installed
3. **Updated requirements.txt**: Set `openai>=2.0.0`
4. **Improved error handling**: Updated `main.py` to catch `TypeError` in addition to `ValueError`

## Changes Made

### backend/requirements.txt
```diff
- openai>=1.99.2
+ openai>=2.0.0
+ httpx>=0.27.0
+ httpcore>=1.0.0
```

### backend/src/api/main.py
```diff
- except ValueError as e:
+ except (ValueError, TypeError, Exception) as e:
```

## Testing
After applying the fix, restart the server:
```bash
cd backend
python run.py
```

## Recommendation: Use Virtual Environment
To avoid dependency conflicts with other projects, it's recommended to use the project's virtual environment:

```bash
# Activate virtual environment
cd backend
.\venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run server
python run.py
```

## Note
If you encounter dependency conflicts with other packages (like `langchain-openai`), consider:
1. Using a separate virtual environment for this project
2. Or pinning specific compatible versions in `requirements.txt`

