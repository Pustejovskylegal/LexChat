'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";

export default function SignInPage() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Přihlásit uživatele pomocí Clerk
      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      // Zkontrolovat stav přihlášení
      if (result.status === 'complete') {
        // Přihlášení dokončeno - aktivovat session
        await setActive({ session: result.createdSessionId });
        // Přesměrovat na chat
        router.push('/chat');
      } else {
        // Je potřeba další verifikace (2FA, email code, atd.)
        // Zkusit dokončit přihlášení s heslem
        const completeSignIn = await signIn.attemptFirstFactor({
          strategy: 'password',
        });
        
        if (completeSignIn.status === 'complete') {
          await setActive({ session: completeSignIn.createdSessionId });
          router.push('/chat');
        } else if (completeSignIn.status === 'needs_second_factor') {
          // Je potřeba 2FA nebo email verifikace
          setPendingVerification(true);
        } else {
          setError('Přihlášení vyžaduje další ověření. Zkontrolujte svůj email.');
          setPendingVerification(true);
        }
      }
    } catch (err: any) {
      console.error('Chyba při přihlášení:', err);
      setError(err.errors?.[0]?.message || 'Neplatné přihlašovací údaje. Zkuste to prosím znovu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Ověřit kód a dokončit přihlášení
      const completeSignIn = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code,
      });

      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
        // Přesměrovat na chat
        router.push('/chat');
      } else {
        setError('Přihlášení nebylo dokončeno. Zkuste to prosím znovu.');
      }
    } catch (err: any) {
      console.error('Chyba při ověření:', err);
      setError(err.errors?.[0]?.message || 'Neplatný verifikační kód. Zkuste to prosím znovu.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              href="/sign-in"
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

      {/* SIGN IN FORM */}
      <section className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="bg-white rounded-2xl shadow-lg border p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">
            {pendingVerification ? 'Ověření' : 'Přihlásit se'}
          </h1>
          <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
            {pendingVerification 
              ? 'Zadej verifikační kód, který jsme ti poslali na email' 
              : 'Vítej zpět! Přihlas se do svého účtu'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {!pendingVerification ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="jan.novak@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Heslo
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isLoaded}
                className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Přihlašuji...' : 'Přihlásit se'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerification} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Verifikační kód
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition text-base disabled:opacity-50 disabled:cursor-not-allowed text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
                <p className="mt-1 text-xs text-gray-500 text-center">
                  Zkontroluj svůj email a zadej 6místný kód
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isLoaded || code.length !== 6}
                className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Ověřuji...' : 'Ověřit a přihlásit se'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPendingVerification(false);
                  setCode('');
                  setError(null);
                }}
                className="w-full px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Zpět
              </button>
            </form>
          )}

          {!pendingVerification && (
            <p className="mt-6 text-center text-sm text-gray-600">
              Nemáš ještě účet?{' '}
              <Link href="/signup" className="text-blue-600 font-medium hover:text-blue-700">
                Zaregistrovat se
              </Link>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
