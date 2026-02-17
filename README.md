
# Finance Teque

Full-stack web app for managing investors and startups, onboarding and verification, admin operations, newsletters, and redemption requests.

## Workspace layout

- client/ - React + TypeScript + Vite frontend
- server/ - Node.js + Express API

## What this app does

- Public marketing pages (home, about, contact, investment plans, team)
- User registration, login, email verification, and password reset
- Investor/start useUsersup onboarding and verification (documents, status review)
- Admin dashboard for users, verifications, sub-admins, redemptions, and newsletters
- Carousel and media uploads
- Newsletter subscription and batch email sends (Termii templates)
- Redemption request submission and admin review

## Tech stack

Frontend:
- React 19, TypeScript, Vite
- React Router, TanStack Query
- Tailwind CSS + Radix UI
- Framer Motion

Backend:
- Node.js, Express 5
- MongoDB with Mongoose
- JWT auth with access/refresh tokens
- Swagger/OpenAPI docs
- Multer for uploads

## Quick start

### 1) Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 2) Environment variables (server)

Create server/.env with at least a Mongo connection string and auth secrets.

Required or commonly used:
- MONGODB_URI
- PORT
- NODE_ENV
- ACCESS_TOKEN_SECRET
- REFRESH_TOKEN_SECRET
- ACCESS_TOKEN_EXPIRES
- REFRESH_TOKEN_EXPIRES

Email/Termii (used for OTP and templates):
- TERMII_BASE_URL
- TERMII_API_KEY
- TERMII_EMAIL_CONFIGURATION_ID
- TERMII_TIMEOUT_MS
- TERMII_TEMPLATE_RESET_PASSWORD
- TERMII_TEMPLATE_VERIFICATION_SUBMITTED
- TERMII_TEMPLATE_ADMIN_NOTIFICATION
- TERMII_TEMPLATE_WELCOME
- TERMII_TEMPLATE_NEWSLETTER

Admin seed / notifications:
- ADMIN_EMAIL
- ADMIN_PASSWORD
- ADMIN_NAME
- ADMIN_PHONE
- SEED_TEST_PASSWORD

App URLs / branding:
- APP_URL
- ASSET_BASE_URL
- LOGO_URL
- SUPPORT_EMAIL

Other:
- API_KEYS (comma-separated API keys for admin endpoints)
- EMAIL_DISABLED (set to 1 to skip sending emails)
- EMAIL_RESEND_COOLDOWN_MS
- RESET_PASSWORD_EXPIRES_IN
- UPLOADS_DIR

### 3) Run dev servers

```bash
cd server
npm run dev

cd ../client
npm run dev
```

Frontend runs at http://localhost:5173
API runs at http://localhost:3000

### 4) Production build

```bash
cd client
npm run build

cd ../server
npm start
```

The server serves the built client from client/dist.

## API documentation

- Swagger UI: http://localhost:3000/api-docs
- OpenAPI JSON: http://localhost:3000/api-docs.json

## Key API areas

- /api/auth - registration, login, token refresh, password reset
- /api/verification - user verification flow
- /api/admin - user management, verification review, newsletter, sub-admins
- /api/redemption - redemption request submission and admin review
- /api/carousel - carousel items and media
- /api/uploads - file upload and static access

Note: The admin users endpoint returns all matching users and the UI paginates locally.

## Uploads and static files

- Uploaded files are served at /uploads
- UPLOADS_DIR controls where uploads are stored
- The server also serves client/dist and server/public

## Frontend structure

- client/src/app - app shell and route wiring
- client/src/pages - public marketing pages
- client/src/features - feature modules (admin, auth, investors, startup)
- client/src/components - shared UI and layout components
- client/src/lib - API client and helpers

## Backend structure

- server/src/server.js - app bootstrap
- server/src/routes - route definitions
- server/src/controllers - route handlers
- server/src/models - Mongoose schemas
- server/src/middleware - auth, API key, upload, security
- server/src/services - email (Termii) and newsletter

## Notes

- Admin endpoints accept either admin JWT or API key header.
- A default admin can be seeded from env vars on startup.
- Email sending can be disabled via EMAIL_DISABLED.

