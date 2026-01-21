# Nastavení prostředí

Vytvořte soubor `.env` v kořenovém adresáři projektu s následujícím obsahem:

## Povinné proměnné

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Qdrant Vector Database Configuration
QDRANT_URL=your_qdrant_url_here
QDRANT_API_KEY=your_qdrant_api_key_here

# Stripe Payment Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

## Volitelné proměnné

```env
# Stripe Webhook (pro produkci)
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Base URL aplikace (pro produkci)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
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

**Důležité:** 
- Nikdy nesdílejte svůj API klíč a nepřidávejte `.env` soubor do gitu!
- Pro produkci použijte produkční API klíče
- `.env.example` obsahuje šablonu pro všechny potřebné proměnné
