'use client';

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const exampleQuestions = [
    "Jaká je lhůta pro podání odvolání?",
    "Co obsahuje kupní smlouva?",
    "Jaké jsou práva spotřebitele?",
    "Jak postupovat při pracovním sporu?",
    "Co je to promlčení?",
  ];

  const handleExampleClick = (question: string) => {
    setSelectedExample(question);
    // Přesměrovat na chat s předvyplněnou otázkou
    setTimeout(() => {
      window.location.href = `/chat?q=${encodeURIComponent(question)}`;
    }, 300);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <Header />

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-28 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6">
          AI asistent primárně pro studenty práv, korporátní právníky a advokáty.
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 mb-6 sm:mb-10 px-4">
          LexChat je moderní AI nástroj pro právníky. Analyzuje dokumenty,
          odpovídá na dotazy a šetří hodiny práce díky vlastní databázi
          desetitisíců soudních rozhodnutí.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
          <Link
            href="/chat"
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition text-sm sm:text-base"
          >
            Vyzkoušet zdarma
          </Link>
          <a
            href="#pricing"
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl border border-gray-300 font-semibold hover:bg-gray-100 transition text-sm sm:text-base"
          >
            Zobrazit tarify
          </a>
        </div>
      </section>

      {/* INTERACTIVE EXAMPLES */}
      <section className="bg-blue-50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">
            Zkus se zeptat AI právního asistenta
          </h2>
          <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
            Klikni na otázku a získej okamžitou odpověď
          </p>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {exampleQuestions.map((question, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(question)}
                className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${
                  selectedExample === question
                    ? "border-blue-600 bg-blue-600 text-white shadow-lg sm:scale-105"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">💬</span>
                  <span className="font-medium text-sm sm:text-base">{question}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ADVANTAGES / FEATURES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Proč zvolit LexChat?</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Komplexní řešení pro moderní právní praxi — a databáze, která jde nad rámec pouhých rozsudků
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {[
            {
              icon: "📚",
              title: "Databáze, jakou konkurence nemá",
              description:
                "Nejen soudní rozhodnutí — naše databáze zahrnuje i studijní materiály, testy, klauzury, monografie a odbornou literaturu. Ideální pro přípravu na zkoušky i pro každodenní praxi.",
              highlight: true,
            },
            {
              icon: "⚖️",
              title: "Soudní rozhodnutí z celé ČR",
              description:
                "Desetitisíce rozsudků a precedentů. Rychlé vyhledávání podobných případů a spolehlivé citace pro tvou argumentaci.",
            },
            {
              icon: "⚡",
              title: "Rychlá analýza dokumentů",
              description:
                "Analyzuj smlouvy, rozsudky a právní texty během sekund. Identifikuj rizika a nedostatky automaticky.",
            },
            {
              icon: "🤖",
              title: "AI právní asistent 24/7",
              description:
                "Ptej se přirozeným jazykem a získej strukturované odpovědi. Podpora v češtině s právní terminologií.",
            },
            {
              icon: "🔍",
              title: "Semantické vyhledávání",
              description:
                "Najdi relevantní právní informace pomocí významu, ne jen klíčových slov. Pokročilá vektorová databáze.",
            },
            {
              icon: "🔒",
              title: "Maximální bezpečnost",
              description:
                "Data nejsou používána k trénování modelů. End-to-end šifrování a GDPR compliance.",
            },
            {
              icon: "📊",
              title: "Analytika a reporty",
              description:
                "Automatické generování souhrnů, klíčových bodů a doporučení. Export do různých formátů.",
            },
            {
              icon: "🌐",
              title: "Aktuální legislativa",
              description:
                "Pravidelně aktualizovaná databáze zákonů a vyhlášek. Sledování změn v právních předpisech.",
            },
            {
              icon: "👥",
              title: "Týmová spolupráce",
              description:
                "Sdílej analýzy s kolegy, vytvářej poznámky a spolupracuj na projektech v reálném čase.",
            },
            {
              icon: "🎯",
              title: "Přesné citace",
              description:
                "Automatické citování právních předpisů, soudních rozhodnutí i odborných pramenů. Vždy víš, odkud informace pochází.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl p-5 sm:p-6 shadow-sm border transition-all hover:shadow-lg ${
                feature.highlight
                  ? "border-blue-600 border-2"
                  : "border-gray-200"
              }`}
            >
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{feature.icon}</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{feature.title}</h3>
              <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gray-50 py-12 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-16">Jak to funguje</h2>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {[
              {
                step: "01",
                title: "Vytvoříš účet",
                description: "Registrace trvá méně než minutu. Bez zbytečných formalit.",
              },
              {
                step: "02",
                title: "Nahraješ dokument nebo položíš dotaz",
                description:
                  "Nahraj PDF, Word nebo se prostě zeptej. AI rozumí přirozenému jazyku.",
              },
              {
                step: "03",
                title: "Získáš okamžitou AI analýzu",
                description:
                  "Dostaneš strukturovanou odpověď s citacemi a doporučeními.",
              },
            ].map((step, i) => (
              <div key={i} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm">
                <div className="text-blue-600 text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{step.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Nejčastěji pokládané otázky
          </h2>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            Máme odpovědi na vše, co tě zajímá
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              question: "Jak přesné jsou odpovědi AI právního asistenta?",
              answer:
                "LexChat využívá pokročilé AI modely trénované na právních textech a je pravidelně aktualizován. Odpovědi jsou vždy doplněny citacemi zdrojů, takže můžeš ověřit každou informaci. Přesnost je vysoká, ale AI by mělo sloužit jako asistent, ne jako náhrada právního poradenství.",
            },
            {
              question: "Kolik soudních rozhodnutí obsahuje databáze?",
              answer:
                "Naše databáze obsahuje desetitisíce soudních rozhodnutí z celé České republiky. Oproti běžné konkurenci ji navíc tvoří i studijní materiály, testy, klauzury, monografie a odborná literatura — ideální pro přípravu na zkoušky i pro každodenní právní praxi. Pravidelně přidáváme nové zdroje a databáze pokrývá všechny oblasti práva.",
            },
            {
              question: "Jsou moje data v bezpečí?",
              answer:
                "Ano, bezpečnost je naší prioritou. Všechna data jsou šifrována, nejsou používána k trénování modelů a jsou plně v souladu s GDPR. Máš plnou kontrolu nad svými daty a můžeš je kdykoli smazat.",
            },
            {
              question: "Můžu použít LexChat pro firemní účely?",
              answer:
                "Ano, nabízíme Enterprise tarif, který je ideální pro právní kanceláře a firmy. Zahrnuje týmovou spolupráci, API přístup, dedikovanou podporu a pokročilé analytické nástroje.",
            },
            {
              question: "Jak často se databáze aktualizuje?",
              answer:
                "Databáze soudních rozhodnutí a právních předpisů je aktualizována denně. Nová rozhodnutí a změny v legislativě jsou přidávány automaticky, takže máš vždy přístup k nejaktuálnějším informacím.",
            },
            {
              question: "Podporuje LexChat jiné jazyky než češtinu?",
              answer:
                "LexChat je primárně navržen pro české právo a češtinu, což zajišťuje nejvyšší přesnost. Pro mezinárodní právo a další jazyky kontaktuj naši podporu pro individuální řešení.",
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between hover:bg-gray-50 transition"
              >
                <span className="font-semibold text-base sm:text-lg pr-4">{faq.question}</span>
                <span className="text-xl sm:text-2xl text-gray-400 flex-shrink-0">
                  {openFaq === i ? "−" : "+"}
                </span>
              </button>
              {openFaq === i && (
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Připraven začít šetřit čas?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-blue-100 px-4">
            Zaregistruj se ještě dnes a získej přístup k AI právnímu asistentovi
            s databází desetitisíců soudních rozhodnutí.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link
              href="/signup"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white text-blue-600 font-semibold shadow-lg hover:bg-gray-100 transition text-sm sm:text-base"
            >
              Začít zdarma
            </Link>
            <Link
              href="/chat"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 border-white text-white font-semibold hover:bg-white/10 transition text-sm sm:text-base"
            >
              Vyzkoušet demo
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-16">Tarify</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {[
            {
              name: "Basic",
              price: "Zdarma",
              features: ["Omezené dotazy", "Základní analýza"],
            },
            {
              name: "Pro",
              price: "499 Kč / měsíc",
              features: [
                "Neomezené dotazy",
                "Pokročilá analýza",
                "Prioritní odpovědi",
              ],
              highlight: true,
            },
            {
              name: "Enterprise",
              price: "Na míru",
              features: [
                "Firemní nasazení",
                "API přístup",
                "Dedikovaná podpora",
              ],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 sm:p-8 border shadow-sm ${
                plan.highlight
                  ? "border-blue-600 shadow-lg"
                  : "border-gray-200"
              }`}
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{plan.price}</p>

              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                {plan.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>

              <Link
                href={plan.name === "Basic" ? "/chat" : "/signup"}
                className={`block text-center py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition ${
                  plan.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border hover:bg-gray-100"
                }`}
              >
                Vybrat tarif
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-6 sm:py-10 text-center text-gray-500 text-xs sm:text-sm px-4">
        © {new Date().getFullYear()} LexChat. Všechna práva vyhrazena.
      </footer>
    </main>
  );
}
