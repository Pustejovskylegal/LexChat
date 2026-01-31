# Clerk.com Integrace

Tento projekt je připraven pro integraci s Clerk.com pro autentizaci a správu uživatelů.

## Instalace

Clerk balíček je již nainstalován. Pokud potřebujete reinstalovat:

```bash
npm install @clerk/nextjs
```

## Nastavení

1. **Vytvořte účet na Clerk.com**
   - Jděte na https://clerk.com/
   - Vytvořte nový účet nebo se přihlaste

2. **Vytvořte novou aplikaci**
   - V Clerk Dashboard klikněte na "Create Application"
   - Vyberte Next.js jako framework
   - Zvolte autentizační metody (Email, Google, atd.)

3. **Získejte API klíče**
   - V aplikaci přejděte do sekce "API Keys"
   - Zkopírujte **Publishable Key** a **Secret Key**

4. **Přidejte klíče do `.env` souboru**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

5. **Nastavte redirect URL v Clerk Dashboard**
   - Development: `http://localhost:3000`
   - Production: vaše produkční URL

## Struktura

### Middleware (`middleware.ts`)
- Chrání routy vyžadující autentizaci
- Automaticky přesměrovává nepřihlášené uživatele na přihlášení
- Chráněné routy:
  - `/chat` - Chat stránka
  - `/api/chat` - Chat API
  - `/api/create-checkout-session` - Stripe checkout
  - `/api/upload` - Upload souborů

### Layout (`app/layout.tsx`)
- Obsahuje `ClerkProvider` pro poskytnutí Clerk kontextu celé aplikaci

### Helper funkce (`lib/clerk.ts`)
- `getCurrentUser()` - Získá kompletní informace o uživateli
- `getCurrentUserId()` - Získá pouze ID uživatele
- `isAuthenticated()` - Ověří, zda je uživatel přihlášen
- `getAuth()` - Získá auth objekt s userId a sessionId

## Použití v API Routes

```typescript
import { getCurrentUser, getCurrentUserId } from "@/lib/clerk";

export async function POST(req: Request) {
  // Získat aktuálního uživatele
  const user = await getCurrentUser();
  const userId = await getCurrentUserId();
  
  // Použít informace o uživateli
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // user.id, user.emailAddresses[0].emailAddress, atd.
}
```

## Použití v Client Components

```typescript
'use client';

import { useUser, useAuth } from '@clerk/nextjs';

export default function MyComponent() {
  const { isSignedIn, user } = useUser();
  const { userId } = useAuth();
  
  if (!isSignedIn) {
    return <div>Prosím přihlaste se</div>;
  }
  
  return <div>Vítejte, {user.firstName}!</div>;
}
```

## Použití v Server Components

```typescript
import { currentUser } from '@clerk/nextjs/server';

export default async function MyPage() {
  const user = await currentUser();
  
  if (!user) {
    return <div>Prosím přihlaste se</div>;
  }
  
  return <div>Vítejte, {user.firstName}!</div>;
}
```

## Přihlášení a Registrace

Clerk poskytuje předpřipravené komponenty pro přihlášení a registraci:

```typescript
import { SignIn, SignUp } from '@clerk/nextjs';

// Přihlášení
<SignIn />

// Registrace
<SignUp />
```

Můžete také použít vlastní komponenty s Clerk hooks:
- `useSignIn()`
- `useSignUp()`
- `useUser()`
- `useAuth()`

## Webhooky (volitelné)

Pro produkci můžete nastavit webhooky pro zpracování událostí:
1. V Clerk Dashboard přejděte do Webhooks
2. Vytvořte nový webhook endpoint
3. Přidejte `CLERK_WEBHOOK_SECRET` do `.env`

## Další zdroje

- [Clerk Dokumentace](https://clerk.com/docs)
- [Next.js Integrace](https://clerk.com/docs/quickstarts/nextjs)
- [API Reference](https://clerk.com/docs/reference/backend-api)
