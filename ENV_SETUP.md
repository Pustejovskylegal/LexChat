# Nastavení prostředí

Vytvořte soubor `.env` v kořenovém adresáři projektu s následujícím obsahem:

## Povinné proměnné

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Qdrant Vector Database Configuration
QDRANT_URL=your_qdrant_url_here
QDRANT_API_KEY=your_qdrant_api_key_here
# Volitelně: název kolekce (default: lexchat_documents)
# QDRANT_COLLECTION_NAME=lexchat_documents

# Supabase (metadata + Storage pro dokumenty)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
# Volitelně: název bucketu pro dokumenty (default: documents)
# SUPABASE_BUCKET_DOCUMENTS=documents

# Stripe Payment Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here

# Clerk Authentication Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

## Volitelné proměnné

```env
# Stripe Webhook (pro produkci)
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Base URL aplikace (pro produkci)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Clerk Webhook (pro produkci)
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here
```

## Jak získat API klíče:

### OpenAI API klíč:
1. Jděte na https://platform.openai.com/
2. Přihlaste se nebo vytvořte účet
3. Přejděte do sekce API Keys
4. Vytvořte nový API klíč
5. Zkopírujte klíč a vložte ho do `.env` souboru

### Qdrant:
1. Vytvořte účet na https://cloud.qdrant.io/ nebo nastavte vlastní instanci
2. Získejte URL a API klíč z dashboardu
3. Přidejte do `.env` souboru

### Stripe:
1. Vytvořte účet na https://stripe.com/
2. Přejděte do Developers > API keys
3. Zkopírujte Secret key (začíná `sk_test_` pro test, `sk_live_` pro produkci)
4. Přidejte do `.env` souboru

### Clerk:
1. Vytvořte účet na https://clerk.com/
2. Vytvořte novou aplikaci v Clerk Dashboard
3. Přejděte do sekce API Keys
4. Zkopírujte **Publishable Key** a přidejte jako `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
5. Zkopírujte **Secret Key** a přidejte jako `CLERK_SECRET_KEY`
6. V produkci můžete také nastavit Webhook Secret pro zpracování událostí

**Důležité:** 
- Nikdy nesdílejte svůj API klíč a nepřidávejte `.env` soubor do gitu!
- Pro produkci použijte produkční API klíče
- `.env.example` obsahuje šablonu pro všechny potřebné proměnné
