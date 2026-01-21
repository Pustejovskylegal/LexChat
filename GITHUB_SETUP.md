# Instrukce pro nahrání na GitHub

## ✅ Co bylo připraveno

1. **`.gitignore`** - Aktualizován s kompletním seznamem souborů, které by neměly být v gitu
2. **`.env.example`** - Šablona pro environment proměnné
3. **`README.md`** - Kompletní dokumentace projektu
4. **`LICENSE`** - MIT License
5. **`CONTRIBUTING.md`** - Pokyny pro přispěvatele
6. **`ENV_SETUP.md`** - Instrukce pro nastavení environment proměnných
7. **`package.json`** - Aktualizován název projektu

## 🚀 Postup pro nahrání na GitHub

### 1. Vytvořte nový repozitář na GitHub

1. Přejděte na https://github.com/new
2. Zadejte název repozitáře (např. `lexchat`)
3. Vyberte, zda má být repozitář veřejný nebo soukromý
4. **NEOZNAČUJTE** "Initialize this repository with a README" (už máme README)
5. Klikněte na "Create repository"

### 2. Inicializujte git v projektu

```bash
cd "c:\Projekty\Open Lex"
git init
git add .
git commit -m "Initial commit: LexChat AI právní asistent"
```

### 3. Připojte vzdálený repozitář

```bash
git remote add origin https://github.com/VASE_UZIVATELSKE_JMENO/lexchat.git
git branch -M main
git push -u origin main
```

## ⚠️ Důležité před commitem

### Zkontrolujte, že tyto soubory NEJSOU v gitu:

- `.env` - obsahuje citlivé API klíče
- `.env.local` - lokální environment proměnné
- `node_modules/` - závislosti
- `.next/` - build soubory
- `vector-db.json` - databázová data
- `uploads/` - nahrané soubory

### Ověření:

```bash
git status
```

Měli byste vidět pouze:
- Zdrojové soubory (`.ts`, `.tsx`, `.js`, `.jsx`)
- Konfigurační soubory (`package.json`, `tsconfig.json`, atd.)
- Dokumentaci (`.md` soubory)
- `.env.example` (šablona, ne skutečný `.env`)

## 📝 Checklist před pushnutím

- [ ] Všechny API klíče jsou v `.env` (ne v kódu)
- [ ] `.env` je v `.gitignore`
- [ ] `.env.example` obsahuje šablonu
- [ ] README.md je aktualizovaný
- [ ] Žádné hardcodované secrets v kódu
- [ ] Všechny funkce fungují
- [ ] Projekt se buildí bez chyb (`npm run build`)

## 🔐 Bezpečnost

**NIKDY necommitněte:**
- `.env` soubory
- API klíče
- Stripe secret keys
- Qdrant API keys
- OpenAI API keys

Pokud jste omylem commitnuli citlivé informace:
1. Okamžitě změňte všechny API klíče
2. Odstraňte soubor z git historie pomocí `git filter-branch` nebo `git-filter-repo`
3. Force push (pouze pokud jste jediný přispěvatel!)

## 📦 Co bude v repozitáři

- ✅ Zdrojový kód aplikace
- ✅ Konfigurační soubory
- ✅ Dokumentace
- ✅ `.env.example` (šablona)
- ❌ `.env` (skutečné klíče)
- ❌ `node_modules/`
- ❌ Build soubory
- ❌ Databázová data

## 🎯 Další kroky

Po nahrání na GitHub můžete:
1. Nastavit GitHub Actions pro CI/CD
2. Přidat GitHub Pages pro dokumentaci
3. Nastavit branch protection rules
4. Přidat issue templates
5. Nastavit webhooky pro automatické deployment

---

**Poznámka:** Pokud používáte GitHub Desktop nebo jiný git klient, postupujte podle jejich dokumentace pro nahrání repozitáře.
