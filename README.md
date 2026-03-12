# LexChat - AI Právní Asistent

Moderní AI právní asistent postavený na Next.js s pokročilými funkcemi pro analýzu dokumentů, vyhledávání v databázi soudních rozhodnutí a integrovanou platební bránou.

## 🚀 Funkce

- 🤖 **AI Právní Asistent** - Chat s AI pomocí OpenAI GPT-4o mini
- 📚 **Databáze soudních rozhodnutí** - Přístup k desetitisícům soudních rozhodnutí
- 📄 **Analýza dokumentů** - Nahrávání a analýza PDF, DOC, DOCX a TXT souborů
- 🔍 **Semantické vyhledávání** - Pokročilé vyhledávání pomocí vektorové databáze (Qdrant)
- 💳 **Stripe integrace** - Měsíční předplatné s automatickým zpracováním plateb
- 💬 **Historie chatů** - Archivace a vyhledávání v historii konverzací
- 📱 **Responzivní design** - Plně kompatibilní s mobilními zařízeními
- 🔒 **Bezpečnost** - GDPR compliance a end-to-end šifrování

## 📋 Požadavky

- Node.js 18+ 
- npm nebo yarn
- OpenAI API klíč
- Qdrant vektorová databáze (cloud nebo self-hosted)
- Stripe účet (pro platební funkce)

## 🛠️ Instalace

1. **Klonujte repozitář:**
   ```bash
   git clone https://github.com/yourusername/lexchat.git
   cd lexchat
   ```

2. **Nainstalujte závislosti:**
   ```bash
   npm install
   ```

3. **Nastavte environment proměnné:**
   ```bash
   cp .env.example .env
   ```
   
   Upravte `.env` soubor a přidejte své API klíče:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   QDRANT_URL=your_qdrant_url_here
   QDRANT_API_KEY=your_qdrant_api_key_here
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Spusťte vývojový server:**
   ```bash
   npm run dev
   ```

   Aplikace poběží na [http://localhost:3000](http://localhost:3000)

## 📖 Použití

### Registrace a výběr tarifu

1. Klikněte na "Registrovat se" na hlavní stránce
2. Vyplňte formulář (jméno, příjmení, email)
3. Vyberte tarif (Student, Pro, Enterprise)
4. Dokončete platbu přes Stripe checkout

### Chat s AI asistentem

1. Přejděte na stránku `/chat`
2. Vyberte režim vyhledávání:
   - 🌐 Internetové vyhledávání
   - 📚 Interní databáze
   - 🔄 Kombinace obou
3. Nahrajte dokument nebo se zeptejte
4. Získejte okamžitou AI analýzu s citacemi

### Historie chatů

- Všechny chaty jsou automaticky ukládány
- Vyhledávejte v historii pomocí vyhledávací lišty
- Načtěte starý chat kliknutím na něj
- Smažte chat pomocí ikony koše

## 🏗️ Struktura projektu

```
.
├── app/
│   ├── api/
│   │   ├── chat/                    # API endpoint pro chat
│   │   ├── create-checkout-session/ # Stripe checkout endpoint
│   │   ├── init/                    # Inicializace Qdrant kolekce
│   │   └── upload/                  # API endpoint pro nahrání souborů
│   ├── chat/                        # Chat stránka
│   ├── signup/                      # Registrace a výběr tarifu
│   │   ├── page.tsx                # Registrační formulář
│   │   └── pricing/                # Stránka s tarify
│   ├── page.tsx                     # Landing page
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # Globální styly
├── components/                      # React komponenty
├── lib/
│   ├── vector-db.ts                 # Práce s Qdrant vektorovou databází
│   └── file-parser.ts               # Parsování PDF a TXT souborů
├── .env.example                     # Šablona pro environment proměnné
└── package.json
```

## 🛠️ Technologie

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes
- **Vector Database:** Qdrant
- **AI Model:** OpenAI GPT-4o mini
- **Payments:** Stripe
- **File Parsing:** pdf-parse, mammoth

## 🔐 Environment Proměnné

| Proměnná | Popis | Povinné |
|----------|-------|---------|
| `OPENAI_API_KEY` | OpenAI API klíč | Ano |
| `QDRANT_URL` | URL Qdrant instance | Ano |
| `QDRANT_API_KEY` | Qdrant API klíč | Ano |
| `STRIPE_SECRET_KEY` | Stripe secret key | Ano (pro platby) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Ne |
| `NEXT_PUBLIC_BASE_URL` | Base URL aplikace | Ne (default: localhost:3000) |

## 📝 Build pro produkci

```bash
npm run build
npm start
```

## 🤝 Přispívání

Pull requesty jsou vítány! Pro větší změny prosím nejprve otevřete issue pro diskusi.

## 📄 Licence

Tento projekt je soukromý a není určen pro veřejné použití.

## ⚠️ Bezpečnost

- **Nikdy** necommitněte `.env` soubory do gitu
- Všechny API klíče musí být uloženy v environment proměnných
- Pro produkci použijte bezpečné metody pro správu secrets

## 📞 Podpora

Pro otázky a problémy otevřete issue v GitHub repozitáři.

---

© 2026 LexChat. Všechna práva vyhrazena.