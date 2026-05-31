# AGENTS.md

## Quick Commands
- `npm run dev` - Start dev server with nodemon (port 3000)
- `npm start` - Start production server

## Architecture
- **Stack**: Node.js + Express 5, MySQL (mysql2/promise), ES modules
- **Entry**: `src/app.js`
- **Structure**: Routes → Controllers → Models
- **Auth**: JWT tokens (1h expiry), role-based (Admin/User)

## Key Conventions
- All routes under `/api` except auth (`/auth`)
- Middleware chain: `verificarToken` → `verificarAdmin` for protected endpoints
- Passwords hashed with bcrypt (salt rounds: 10)
- File uploads via multer (5MB limit, images only) to `uploads/`

## Database
- MySQL hosted on Railway (connection in `.env`)
- Pool created in `src/config/database.js`

## Environment
- `.env` required (JWT_SECRET, DB credentials)
- Port defaults to 3000 if PORT not set
