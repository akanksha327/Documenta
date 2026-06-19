# SignForge - Document Signature App

A modern, secure SaaS platform for uploading, signing, managing, and tracking PDF documents. Built with React/Next.js, Node.js/Express, MongoDB, and JSON Web Tokens.

## Project Structure

- `frontend/`: React Next.js 15 App Router interface.
- `backend/`: Node.js Express server with Mongoose & MongoDB.
- `docs/`: Product design plans and architectural documents.

## Startup Instructions

### Backend (Express & MongoDB)
1. Navigate to directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env` with connection credentials:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/signforge
   JWT_SECRET=DOCUMENT_SIGNATURE_APP_SECRET_2026
   JWT_EXPIRES_IN=7d
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

### Frontend (Next.js)
1. Navigate to directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Access client app at `http://localhost:3000`
