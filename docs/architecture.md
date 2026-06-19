# SignForge System Architecture

This project is structured as a separate backend and frontend application:

- **Frontend**: A Next.js App Router workspace running on port `3000`. Connects to Express endpoints via next.config proxy rewrites.
- **Backend**: An Express API workspace running on port `3001` that connects to MongoDB using Mongoose, signs/validates JWTs, handles file system storage, and stores signature placements.
