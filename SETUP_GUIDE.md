# 🚀 AeroIntel - Quick Setup Guide

## Prerequisites
- ✅ Node.js 18.x or higher (You have v24.11.1 ✓)
- ✅ npm or yarn package manager
- ✅ OpenAI API Key (for transcription and analysis)

---

## Step 1: Install Backend Dependencies

```powershell
cd backend
npm install
```

---

## Step 2: Configure Backend Environment

1. Copy the example environment file:
```powershell
cd backend
Copy-Item env.example.txt .env.local
```

2. Edit `.env.local` and add your values:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-32-characters
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Important:** 
- Replace `OPENAI_API_KEY` with your actual OpenAI API key
- Generate a secure `JWT_SECRET` (you can use: `openssl rand -base64 64` or any random 32+ character string)

---

## Step 3: Install Frontend Dependencies

```powershell
cd ..\frontend
npm install
```

---

## Step 4: Configure Frontend Environment

1. Copy the example environment file:
```powershell
cd frontend
Copy-Item env.local.example .env.local
```

2. Edit `.env.local` (it should already have the correct backend URL):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Step 5: Run the Application

### Terminal 1 - Backend (Port 3001)
```powershell
cd backend
npm run dev
```

### Terminal 2 - Frontend (Port 3000)
```powershell
cd frontend
npm run dev
```

---

## Step 6: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health

---

## First-Time Setup

1. Open http://localhost:3000
2. Click **Sign Up** to create an account
3. Fill in: Email, Password, Name, Role (analyst/manager/executive/admin)
4. Click **Create Account**
5. Switch to **Sign In** and login
6. You're ready to use the platform!

---

## Troubleshooting

### Issue: Dependencies not installing
**Solution:** Make sure you're in the correct directory and Node.js is installed correctly.

### Issue: Port already in use
**Solution:** Change the PORT in `.env.local` or stop the process using that port.

### Issue: OpenAI API errors
**Solution:** 
- Verify your `OPENAI_API_KEY` is correct
- Check your OpenAI account has credits/quota
- Ensure you have access to `whisper-1` and `gpt-4o-mini` models

### Issue: CORS errors
**Solution:** Make sure `ALLOWED_ORIGINS` in backend `.env.local` includes `http://localhost:3000`

---

## Quick Commands Reference

```powershell
# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Frontend
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
```

---

## What's Next?

Once the application is running, you can:
1. Record voice notes and get AI-powered analysis
2. View insights and alerts on the dashboard
3. Filter and search through intelligence data
4. Explore the 3D globe visualization

**Ready to make changes?** Let me know what you'd like to implement! 🚀







