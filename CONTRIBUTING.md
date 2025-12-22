# Contributing to AeroIntel

Thank you for your interest in contributing to AeroIntel! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/KCAVIATION.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m "Add: your feature description"`
6. Push to your branch: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key (for AI features)

### Setup Steps

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp env.example.txt .env.local
   # Edit .env.local with your API keys
   npm run dev
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   cp env.local.example .env.local
   # Edit .env.local with your API URL
   npm run dev
   ```

## Code Style

- Follow existing code patterns
- Use TypeScript for backend, JavaScript for frontend
- Write clear, descriptive commit messages
- Add comments for complex logic
- Keep functions focused and modular

## Environment Variables

- Never commit `.env` or `.env.local` files
- Update `env.example.txt` or `env.local.example` when adding new variables
- Document new environment variables in PR description

## Testing

- Test your changes locally before submitting
- Ensure both frontend and backend start without errors
- Test the specific feature you're adding/modifying

## Pull Request Guidelines

- Provide a clear description of changes
- Reference related issues if applicable
- Ensure all checks pass
- Request review from maintainers

## Security

- Never commit API keys, secrets, or credentials
- Report security vulnerabilities privately to maintainers
- Follow secure coding practices

## Questions?

Open an issue for questions or clarifications.

