# 🔑 Fix OpenAI API Key Error

## Problem
You're getting this error:
```
Incorrect API key provided: sk-your-***************here
```

This means the API key in your environment file is still the **placeholder value**, not your real key.

---

## ✅ Solution

### Step 1: Check Your Environment File

Next.js uses **`.env.local`** (NOT `.env`) for environment variables.

Run this command to check:
```powershell
cd backend
.\CHECK_ENV.ps1
```

Or manually check:
```powershell
cd backend
Get-Content .env.local
```

### Step 2: Update `.env.local` File

**IMPORTANT:** Make sure you're editing `backend/.env.local` (not `.env`)

1. Open `backend/.env.local` in a text editor
2. Find this line:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```
3. Replace it with your **real OpenAI API key**:
   ```env
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

   **Where to get your API key:**
   - Go to: https://platform.openai.com/account/api-keys
   - Create a new API key or copy an existing one
   - It should start with `sk-` or `sk-proj-`

### Step 3: Verify the File

Your `backend/.env.local` should look like this:
```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OpenAI Model Selection for Analysis
OPENAI_MODEL=gpt-4o-mini

# JWT Secret
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-32-characters

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
ENABLE_ALERT_GENERATION=true
ENABLE_PREDICTIVE_ANALYTICS=true
```

### Step 4: Restart the Backend Server

**CRITICAL:** Environment variables are only loaded when the server starts. You MUST restart:

1. Stop the backend server (Ctrl+C)
2. Start it again:
   ```powershell
   cd backend
   npm run dev
   ```

### Step 5: Verify It's Working

Test the health endpoint:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
```

You should see `"openai": "configured"` in the response.

---

## 🐛 Common Issues

### Issue 1: Using `.env` instead of `.env.local`
**Symptom:** Changes don't take effect
**Fix:** Next.js uses `.env.local` by default. Rename `.env` to `.env.local` or create a new `.env.local` file.

### Issue 2: Server not restarted
**Symptom:** Still getting the error after updating
**Fix:** **Restart the backend server** - environment variables are only loaded at startup.

### Issue 3: API key has extra spaces or quotes
**Symptom:** Invalid key error
**Fix:** Make sure there are no spaces around the `=` sign:
   ```env
   OPENAI_API_KEY=sk-proj-xxx  ✅ Correct
   OPENAI_API_KEY = sk-proj-xxx  ❌ Wrong (spaces)
   OPENAI_API_KEY="sk-proj-xxx"  ❌ Wrong (quotes not needed)
   ```

### Issue 4: Wrong file location
**Symptom:** Changes don't apply
**Fix:** The file must be in the `backend/` directory, not the root:
   ```
   ✅ backend/.env.local
   ❌ .env.local (root directory)
   ```

---

## 🔍 Quick Check Commands

```powershell
# Check if .env.local exists
Test-Path backend\.env.local

# View API key (first 20 chars only for security)
(Get-Content backend\.env.local | Select-String "OPENAI_API_KEY").ToString().Substring(0, 30)

# Check if backend is running
Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
```

---

## ✅ Verification Checklist

- [ ] `.env.local` file exists in `backend/` directory
- [ ] `OPENAI_API_KEY` line starts with `sk-` or `sk-proj-`
- [ ] No spaces around the `=` sign
- [ ] Backend server has been **restarted** after changes
- [ ] Health endpoint shows `"openai": "configured"`

---

**After fixing, try signing up again!** 🚀


