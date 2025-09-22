# Better Bite Buddy — Monorepo (web)

Live (Production): https://bbb-web-five.vercel.app  
Preview URL (auto per branch): shown by Vercel on each deployment

---

## Tech
- **Next.js 15 + App Router**
- **Tailwind v4**
- **Auth.js (NextAuth)** – Google OAuth (optional)
- **Vercel** (hosting; auto-deploy on git push)
- **Cloudflare Worker + KV** (email exists check & webhook)
- CSS: global styles in `app/globals.css`

---

## Environments

- **Production** → branch: `main`  
  Env vars (Vercel → Settings → Environment Variables → *Production*):
  - `NEXTAUTH_URL = https://<your-primary-domain>`
  - `NEXTAUTH_SECRET = <random 32+ bytes>`

- **Preview** → any non-main branch (e.g. `staging`)  
  Optional envs (same screen → *Preview*):
  - `NEXTAUTH_URL = https://<your-staging-domain>` (or leave out if auth not needed)

> Each push to a non-main branch creates a **Preview** deployment with its own URL.

---

## Branch workflow (simple)

```bash
# 1) create staging branch once
git checkout -b staging
git push -u origin staging

# 2) develop on staging (safe, creates Preview build each push)
git add -A
git commit -m "feat: change header"
git push

# 3) go live (when happy)
git checkout main
git merge staging
git push    # Vercel deploys Production
