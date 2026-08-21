# MF India CRM — Complete Starter

A production-oriented Next.js + TypeScript CRM foundation for MF India with Supabase authentication/database.

## Features
- Admin/Agent authentication
- Dashboard metrics
- Lead management
- Agent assignment
- Follow-up records
- Product master
- Agent management
- Login activity table
- Supabase Row Level Security

## 1. Install
Requirements:
- Node.js 20+
- A Supabase project
- A GitHub account
- A Vercel account

Run:
```bash
npm install
npm run dev
```

## 2. Supabase setup
1. Open Supabase SQL Editor.
2. Run `supabase/schema.sql`.
3. Optionally run `supabase/seed.sql`.
4. In Authentication > Users, create your first admin user with email/password.
5. Copy that email into the last SQL command in schema.sql and run:
```sql
update public.profiles set role='admin' where email='YOUR_ADMIN_EMAIL';
```

## 3. Environment
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
Get both values from Supabase Project Settings > API.

## 4. Run locally
```bash
npm run dev
```
Open:
http://localhost:3000

Login using the Supabase user you created.

## 5. GitHub
Create a new GitHub repository and push this folder:
```bash
git init
git add .
git commit -m "MF India CRM initial version"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mf-india-crm.git
git push -u origin main
```

## 6. Vercel
1. Import the GitHub repository into Vercel.
2. Add:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Deploy.
4. Open the Vercel URL and login.

## Important production notes
- Never put a Supabase service-role key in browser/client code.
- Keep `.env.local` out of GitHub.
- Before real deployment, configure custom domain, backups, email authentication settings, and audit/permission review.
- The current UI is the complete working foundation; advanced CRM enhancements such as bulk Excel import/export, WhatsApp integration, reminders, lead scoring, duplicate detection, detailed analytics and audit reports can be added as the next version.
