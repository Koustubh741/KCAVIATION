# 🔍 Environment Variable Verification

## Current Status
✅ `.env.local` file exists
✅ API key appears to be set (starts with `sk-svcacct-`)

## ⚠️ Important Notes

### 1. Server Must Be Restarted
Environment variables are **only loaded when the server starts**. If you updated `.env.local` after starting the server, you MUST restart it:

```powershell
# Stop the server (Ctrl+C in the terminal running npm run dev)
# Then start it again:
cd backend
npm run dev
```

### 2. API Key Format
Your API key starts with `sk-svcacct-` which is a **service account key**. Make sure:
- The key is complete (not truncated)
- No extra spaces or quotes
- The key is valid and active in your OpenAI account

### 3. Check for Multiple Env Files
Next.js loads environment files in this order (later files override earlier ones):
1. `.env`
2. `.env.local` ← **This is what you should use**
3. `.env.development`
4. `.env.development.local`

If you have both `.env` and `.env.local`, make sure `.env.local` has the correct values.

---

## 🔧 Quick Fix Steps

1. **Stop the backend server** (if running)
2. **Verify your `.env.local` file**:
   ```powershell
   cd backend
   notepad .env.local
   ```
   Make sure the line looks like:
   ```env
   OPENAI_API_KEY=sk-svcacct-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   (No spaces, no quotes, complete key)

3. **Restart the backend server**:
   ```powershell
   npm run dev
   ```

4. **Test the API key**:
   ```powershell
   # In a new terminal
   Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing | Select-Object -ExpandProperty Content
   ```
   Should show: `"openai": "configured"`

---

## 🐛 If Still Not Working

### Check the actual environment variable being used:
Add this temporary debug code to see what the server is reading:

In `backend/app/api/transcribe/route.ts`, add after line 7:
```typescript
console.log('API Key check:', process.env.OPENAI_API_KEY ? 
  process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 
  'NOT SET');
```

Then check the backend terminal output when you try to use the API.

### Verify the key is valid:
Test your API key directly:
```powershell
$headers = @{ "Authorization" = "Bearer sk-svcacct-YOUR_KEY_HERE" }
Invoke-WebRequest -Uri "https://api.openai.com/v1/models" -Headers $headers
```

If this fails, your API key might be invalid or expired.

---

## ✅ Success Indicators

- Backend server shows no API key errors in console
- Health endpoint returns `"openai": "configured"`
- Signup/login works without "Failed to fetch" errors
- Voice transcription and analysis work


