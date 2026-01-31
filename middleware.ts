import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Definice chráněných rout - tyto vyžadují autentizaci
const isProtectedRoute = createRouteMatcher([
  '/chat(.*)',
  '/account(.*)',
  '/api/create-checkout-session(.*)',
  '/api/subscription(.*)',
  '/api/upload(.*)',
  '/api/documents(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Ochrana chráněných rout
  if (isProtectedRoute(req)) {
    // Povolit přístup k /chat s parametrem q pro nepřihlášené uživatele (guest mode)
    if (req.nextUrl.pathname.startsWith('/chat') && req.nextUrl.searchParams.has('q')) {
      // Povolit přístup bez autentizace pro guest mode
      return;
    }
    
    // Povolit přístup k /api/chat pro guest mode (omezeno na jeden dotaz v endpointu)
    if (req.nextUrl.pathname === '/api/chat') {
      // Povolit přístup bez autentizace pro guest mode
      return;
    }
    
    await auth.protect({
      unauthenticatedUrl: '/sign-in',
    });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
