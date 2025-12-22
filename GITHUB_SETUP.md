# GitHub Setup Guide

This guide will help you push your AeroIntel project to GitHub.

## Prerequisites

1. A GitHub account
2. Git installed on your machine
3. Your project ready to commit

## Step 1: Verify .gitignore is Working

Before pushing, ensure sensitive files are ignored:

```powershell
# Check if .env files are ignored
git check-ignore backend/.env.local frontend/.env.local

# View what will be committed (should NOT show .env files)
git status
```

## Step 2: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Name your repository (e.g., `KCAVIATION` or `AeroIntel`)
4. **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **Create repository**

## Step 3: Add Files and Commit

```powershell
# Navigate to your project directory
cd "C:\Users\Admin\OneDrive - CACHE DIGITECH\Desktop\new\KCAVIATION"

# Add all files (respects .gitignore)
git add .

# Verify what will be committed (check that .env files are NOT listed)
git status

# Create initial commit
git commit -m "Initial commit: AeroIntel Aviation Intelligence Platform"
```

## Step 4: Connect to GitHub and Push

```powershell
# Add your GitHub repository as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note:** You'll be prompted for GitHub credentials. Use a Personal Access Token (PAT) instead of password.

### Creating a Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **Generate new token (classic)**
3. Give it a name (e.g., "AeroIntel Push")
4. Select scopes: `repo` (full control of private repositories)
5. Click **Generate token**
6. **Copy the token immediately** (you won't see it again)
7. Use this token as your password when pushing

## Step 5: Verify on GitHub

1. Go to your repository on GitHub
2. Verify that:
   - ✅ All code files are present
   - ✅ `.env` files are **NOT** visible
   - ✅ `node_modules/` is **NOT** present
   - ✅ README.md is visible

## Important Security Checklist

Before pushing, ensure:

- [ ] No `.env` or `.env.local` files are tracked
- [ ] No API keys are hardcoded in source files
- [ ] `backend/data/db.json` is tracked (contains test data) - or exclude it if it has sensitive data
- [ ] All sensitive information is in `.gitignore`
- [ ] Example env files (`env.example.txt`, `env.local.example`) are included

## Troubleshooting

### "Repository not found" error
- Check that the repository name and username are correct
- Verify you have access to the repository

### "Authentication failed" error
- Use a Personal Access Token instead of password
- Ensure the token has `repo` scope

### "Large files" error
- Check for large files: `git ls-files | ForEach-Object { Get-Item $_ | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}} } | Where-Object {$_.'Size(MB)' -gt 50}`
- Add large files to `.gitignore` or use Git LFS

### Want to exclude db.json?
If `backend/data/db.json` contains sensitive data, uncomment this line in `.gitignore`:
```
# backend/data/db.json
```

Then remove it from tracking:
```powershell
git rm --cached backend/data/db.json
git commit -m "Remove db.json from tracking"
```

## Next Steps

After pushing:
1. Add a repository description on GitHub
2. Add topics/tags (e.g., `nextjs`, `react`, `aviation`, `ai`)
3. Consider adding GitHub Actions for CI/CD
4. Set up branch protection rules for `main` branch
5. Add collaborators if working in a team

## Updating Your Repository

For future changes:

```powershell
# Stage changes
git add .

# Commit
git commit -m "Description of changes"

# Push
git push
```

