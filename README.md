# Aniruddha Routh — Personal Portfolio

A modern personal portfolio website with an admin dashboard built with Next.js 16, TypeScript, Tailwind CSS, and SQLite.

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

This app is optimized for **Vercel** (free tier):
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. For production database, switch to PostgreSQL (Supabase free tier)

## License

MIT
