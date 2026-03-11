# Aniruddha Routh — Personal Portfolio

A modern personal portfolio website with an admin dashboard built with Next.js 16, TypeScript, Tailwind CSS, and SQLite.
https://aniruddha-routh-kuli.vercel.app/
## Features

### Public Portfolio
- 🏠 **Home page** — Hero, About, Achievements, Hobbies, Gallery, Contact sections
- 🏆 **Achievements** — Full list of milestones
- ❤️ **Hobbies** — All interests and hobbies
- 🖼️ **Gallery** — Photo gallery

### Admin Dashboard (`/admin`)
- 📝 **Notes** — Create, edit, pin, and delete personal notes
- 🏆 **Achievements** — Add/edit/delete achievements shown on portfolio
- ❤️ **Hobbies** — Manage hobbies and interests
- 🖼️ **Gallery** — Upload and manage photos

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite via Prisma ORM
- **Auth**: NextAuth.js v5 (credentials)
- **Icons**: Lucide React

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

Key variables:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-password"
```

### 3. Set up database
```bash
npx prisma migrate dev
```

### 4. Create admin user
Start the dev server, then visit:
```
http://localhost:3000/api/seed
```

### 5. Run development server
```bash
npm run dev
```

Visit `http://localhost:3000` for the portfolio and `/admin/login` for the admin dashboard.

## Deployment

### Vercel + Turso (recommended — both free tiers)

#### 1. Set up a remote database with Turso

```bash
# Install the Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Sign up / log in
turso auth signup   # or: turso auth login

# Create a database
turso db create my-portfolio-db

# Get the database URL
turso db show my-portfolio-db --url
# → libsql://<your-database>.turso.io

# Create an auth token
turso db tokens create my-portfolio-db
# → <token>
```

#### 2. Apply database migrations

```bash
export DATABASE_URL="libsql://<your-database>.turso.io"
export DATABASE_AUTH_TOKEN="<your-token>"

npx prisma migrate deploy
```

#### 3. Deploy to Vercel

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. In **Environment Variables** add:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | `libsql://<your-database>.turso.io` |
   | `DATABASE_AUTH_TOKEN` | `<your-turso-token>` |
   | `NEXTAUTH_SECRET` | output of `openssl rand -base64 32` |
   | `ADMIN_EMAIL` | your admin e-mail |
   | `ADMIN_PASSWORD` | your admin password |

4. Click **Deploy**.
5. After deployment, visit `https://<your-app>.vercel.app/api/seed` once to create the admin user.

> **Tip**: Vercel auto-deploys on every push to `main`. A CI workflow (`.github/workflows/ci.yml`) runs lint and build checks on every PR.

### Other platforms (Railway, Render, Fly.io, self-hosted VPS)

Any Node.js 20+ host works:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

Set the same environment variables via your platform's dashboard or an `.env` file.

## License

MIT
