'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Implementovat registraci
    console.log('Registrace:', formData);
    
    // Simulace odeslání a přesměrování na výběr tarifu
    setTimeout(() => {
      setIsSubmitting(false);
      // Uložit data do sessionStorage pro pozdější použití
      sessionStorage.setItem('signupData', JSON.stringify(formData));
      router.push('/signup/pricing');
    }, 1000);
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

      {/* SIGN UP FORM */}
      <section className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="bg-white rounded-2xl shadow-lg border p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Vytvořit účet</h1>
          <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
            Zaregistruj se a začni používat LexChat
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Jméno
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition text-base"
                placeholder="Jan"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Příjmení
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition text-base"
                placeholder="Novák"
              />
            </div>

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
                className="w-full px-4 py-3.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition text-base"
                placeholder="jan.novak@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Registruji...' : 'Zaregistrovat se'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Už máš účet?{' '}
            <Link href="/login" className="text-blue-600 font-medium hover:text-blue-700">
              Přihlásit se
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
