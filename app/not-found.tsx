import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 px-4">
      <h1 className="text-2xl font-bold mb-2">Stránka nenalezena</h1>
      <p className="text-gray-600 mb-6">Požadovaná stránka neexistuje.</p>
      <Link
        href="/"
        className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        Zpět na úvod
      </Link>
    </main>
  );
}
