'use client';

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function Header() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600">
          LexChat
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {!isLoaded ? (
            // Loading state
            <div className="px-3 sm:px-6 py-1.5 sm:py-2 text-gray-400 text-sm">
              Načítám...
            </div>
          ) : isSignedIn ? (
            // Přihlášený uživatel
            <>
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
                <span className="hidden sm:inline">Účet</span>
                <span className="sm:hidden">Účet</span>
              </Link>
            </>
          ) : (
            // Nepřihlášený uživatel
            <>
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
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
