# Deploy na Vercel

## 1. Přihlášení (jednorázově)

V terminálu v kořenu projektu spusť:

```bash
npx vercel login
```

Otevře se prohlížeč – přihlas se ke svému Vercel účtu (nebo vytvoř účet na [vercel.com](https://vercel.com)).

## 2. Deploy

Po přihlášení:

```bash
npx vercel --prod
```

- První deploy: Vercel se zeptá na nastavení (link to existing project / create new). Zvol **Create new** a potvrď výchozí hodnoty (Enter).
- Nasadí se production build a dostaneš URL typu `https://tvoj-projekt.vercel.app`.

## 3. Proměnné prostředí na Vercelu

V **Vercel Dashboard** → tvůj projekt → **Settings** → **Environment Variables** nastav všechny potřebné proměnné (stejné jako v lokálním `.env.local`), např.:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_TAVILY_API_KEY`
- `QDRANT_URL`, `QDRANT_API_KEY` (pokud používáš Qdrant)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (+ další podle potřeby)

Po přidání/změně env proměnných je potřeba spustit **Redeploy** (Deployments → … u posledního deploye → Redeploy).

## 4. Další deploye

Při dalších změnách stačí znovu spustit:

```bash
npx vercel --prod
```

Nebo zapojit **Git**: připoj projekt k repozitáři v GitHubu/GitLabu/Bitbucketu v Vercel Dashboard – každý push do `main` pak spustí automatický deploy.
