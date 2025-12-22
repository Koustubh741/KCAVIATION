# 🚀 Quick Start Commands - AeroIntel

## Prerequisites Check

```powershell
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version
```

---

## Step 1: Install Dependencies

### Backend
```powershell
cd backend
npm install
```

### Frontend
```powershell
cd ..\frontend
npm install
```

---

## Step 2: Configure Environment Variables

### Backend Configuration

1. Navigate to backend folder:
```powershell
cd backend
```

2. Create `.env.local` file (if not exists):
```powershell
# Copy example file
Copy-Item env.example.txt .env.local
```

3. Edit `.env.local` and add your values:
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
JWT_SECRET=your-super-secure-random-string-minimum-32-characters
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Generate JWT Secret:**
```powershell
# Generate random 32-character string
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Frontend Configuration

1. Navigate to frontend folder:
```powershell
cd ..\frontend
```

2. Create `.env.local` file (if not exists):
```powershell
# Copy example file
Copy-Item env.local.example .env.local
```

3. Edit `.env.local` (should already be correct):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Step 3: Run the Application

### Option 1: Run in Separate Terminal Windows (Recommended)

#### Terminal 1 - Backend
```powershell
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```powershell
cd frontend
npm run dev
```

---

### Option 2: Run Both in Background (PowerShell)

```powershell
# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Admin\OneDrive - CACHE DIGITECH\Desktop\new\KCAVIATION\backend'; npm run dev"

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Admin\OneDrive - CACHE DIGITECH\Desktop\new\KCAVIATION\frontend'; npm run dev"
```

---

## Step 4: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health

---

## Quick Commands Reference

### Backend Commands
```powershell
cd backend

# Development
npm run dev          # Start dev server (port 3001)

# Production
npm run build        # Build for production
npm start            # Start production server

# Other
npm run lint         # Run linter
```

### Frontend Commands
```powershell
cd frontend

# Development
npm run dev          # Start dev server (port 3000)

# Production
npm run build        # Build for production
npm start            # Start production server

# Other
npm run lint         # Run linter
```

---

## Troubleshooting

### Port Already in Use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Find process using port 3001
netstat -ano | findstr :3001

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Dependencies Not Installing
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Environment Variables Not Working
- Make sure `.env.local` files are in the correct directories
- Restart the servers after changing environment variables
- Check for typos in variable names

---

## First Time Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Backend `.env.local` created with `OPENAI_API_KEY` and `JWT_SECRET`
- [ ] Frontend `.env.local` created with `NEXT_PUBLIC_API_URL`
- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 3000
- [ ] Can access http://localhost:3000

---

## Stop Servers

Press `Ctrl + C` in each terminal window to stop the servers.

---

**Ready to go! 🚀**






