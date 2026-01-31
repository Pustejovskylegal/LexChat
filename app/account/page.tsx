'use client';

import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type SubscriptionInfo = {
  hasSubscription: boolean;
  plan: string | null;
  price: number | null;
  priceText: string | null;
  nextPaymentDate: string | null;
  status?: string;
};

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  // Načíst informace o předplatném
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!isLoaded || !user) return;
      
      try {
        const response = await fetch('/api/subscription');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        }
      } catch (error) {
        console.error('Chyba při načítání předplatného:', error);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, [isLoaded, user]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Chyba při odhlášení:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center">Načítám...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
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
              href="/chat"
              className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-gray-700 text-sm sm:text-base font-medium hover:bg-gray-100 transition"
            >
              Chat
            </Link>
            <Link
              href="/account"
              className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg bg-blue-600 text-white text-sm sm:text-base font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              Účet
            </Link>
          </nav>
        </div>
      </header>

      {/* ACCOUNT SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="bg-white rounded-2xl shadow-lg border p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">Správa účtu</h1>

          {/* USER INFO */}
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profil</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jméno
                  </label>
                  <div className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900">
                    {user.firstName || 'Není nastaveno'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Příjmení
                  </label>
                  <div className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900">
                    {user.lastName || 'Není nastaveno'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900">
                    {user.emailAddresses[0]?.emailAddress || 'Není nastaveno'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID uživatele
                  </label>
                  <div className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 text-sm font-mono">
                    {user.id}
                  </div>
                </div>
              </div>
            </div>

            {/* SUBSCRIPTION INFO */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Předplatné</h2>
              {isLoadingSubscription ? (
                <div className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-500">
                  Načítám informace o předplatném...
                </div>
              ) : subscription?.hasSubscription ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aktuální tarif
                    </label>
                    <div className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 font-semibold">
                      {subscription.plan || 'Neznámý tarif'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cena
                    </label>
                    <div className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900">
                      {subscription.priceText || 'Neznámá cena'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Další platba
                    </label>
                    <div className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900">
                      {subscription.nextPaymentDate
                        ? new Date(subscription.nextPaymentDate).toLocaleDateString('cs-CZ', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Neznámé datum'}
                    </div>
                  </div>

                  {subscription.status && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          subscription.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {subscription.status === 'active' ? 'Aktivní' : subscription.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600">
                  Nemáte aktivní předplatné.{' '}
                  <Link href="/signup/pricing" className="text-blue-600 hover:text-blue-700 font-medium">
                    Vybrat tarif
                  </Link>
                </div>
              )}
            </div>

            {/* ACCOUNT ACTIONS */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Akce</h2>
              <div className="space-y-3">
                <Link
                  href="/chat"
                  className="block w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-sm text-center"
                >
                  Otevřít chat
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full px-6 py-3 rounded-lg border border-red-300 text-red-600 font-semibold hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSigningOut ? 'Odhlašuji...' : 'Odhlásit se'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
