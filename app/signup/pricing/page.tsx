'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [signupData, setSignupData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Načíst data z registrace
    const data = sessionStorage.getItem('signupData');
    if (data) {
      setSignupData(JSON.parse(data));
    } else {
      // Pokud nejsou data, přesměrovat zpět na registraci
      router.push('/signup');
    }
  }, [router]);

  const plans = [
    {
      name: "Basic",
      price: "199",
      priceText: "199 Kč / měsíc",
      features: ["Omezené dotazy", "Základní analýza"],
    },
    {
      name: "Pro",
      price: "349",
      priceText: "349 Kč / měsíc",
      features: [
        "Neomezené dotazy",
        "Pokročilá analýza",
        "Prioritní odpovědi",
      ],
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "1899",
      priceText: "1899 Kč / měsíc",
      features: [
        "Firemní nasazení",
        "API přístup",
        "Dedikovaná podpora",
      ],
    },
  ];

  const handleSelectPlan = async (planName: string) => {
    if (isLoading) return;
    
    setSelectedPlan(planName);
    setIsLoading(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName,
          email: signupData?.email,
          firstName: signupData?.firstName,
          lastName: signupData?.lastName,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Přesměrovat na Stripe checkout
        window.location.href = data.url;
      } else {
        alert('Chyba při vytváření platby. Zkus to prosím znovu.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      alert('Něco se pokazilo. Zkus to prosím znovu.');
      setIsLoading(false);
    }
  };

  if (!signupData) {
    return null; // Nebo loading spinner
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      {/* HEADER */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600">
            LexChat
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-gray-700 text-sm sm:text-base font-medium hover:bg-gray-100 transition"
            >
              <span className="hidden sm:inline">Přihlásit se</span>
              <span className="sm:hidden">Přihlásit</span>
            </Link>
            <Link
              href="/signup"
              className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg bg-blue-600 text-white text-sm sm:text-base font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              <span className="hidden sm:inline">Registrovat se</span>
              <span className="sm:hidden">Registrace</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* PRICING SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Vyber si tarif</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 px-4">
            Dokonči registraci výběrem tarifu, který ti nejlépe vyhovuje
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 sm:p-8 border shadow-sm transition-all cursor-pointer ${
                plan.highlight
                  ? "border-blue-600 shadow-lg sm:scale-105"
                  : "border-gray-200 hover:border-blue-300"
              } ${
                selectedPlan === plan.name
                  ? "ring-2 ring-blue-600"
                  : ""
              }`}
              onClick={() => handleSelectPlan(plan.name)}
            >
              {plan.highlight && (
                <div className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                  Doporučeno
                </div>
              )}
              <h3 className="text-xl sm:text-2xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-2xl sm:text-3xl font-bold mb-1">{plan.priceText}</p>
              <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">měsíčně</p>

              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPlan(plan.name);
                }}
                disabled={isLoading}
                className={`w-full py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition ${
                  plan.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border border-gray-300 hover:bg-gray-100"
                } ${
                  selectedPlan === plan.name
                    ? "bg-blue-600 text-white border-blue-600"
                    : ""
                } ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading && selectedPlan === plan.name
                  ? "Přesměrovávám..."
                  : selectedPlan === plan.name
                  ? "Vybraný tarif"
                  : "Vybrat tarif"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 text-center px-4">
          <Link
            href="/signup"
            className="text-sm sm:text-base text-blue-600 font-medium hover:text-blue-700 inline-flex items-center gap-2"
          >
            <span>←</span>
            <span>Zpět na registraci</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
