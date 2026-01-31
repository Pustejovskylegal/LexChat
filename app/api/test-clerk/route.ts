import { NextResponse } from "next/server";

export async function GET() {
  const hasPublishableKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasSecretKey = !!process.env.CLERK_SECRET_KEY;
  
  // Zobrazit pouze začátek klíčů pro bezpečnost
  const publishableKeyPreview = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 
    ? `${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 10)}...` 
    : 'Chybí';
  const secretKeyPreview = process.env.CLERK_SECRET_KEY 
    ? `${process.env.CLERK_SECRET_KEY.substring(0, 10)}...` 
    : 'Chybí';

  return NextResponse.json({
    clerkConfigured: hasPublishableKey && hasSecretKey,
    publishableKey: hasPublishableKey ? publishableKeyPreview : 'Chybí',
    secretKey: hasSecretKey ? secretKeyPreview : 'Chybí',
    message: hasPublishableKey && hasSecretKey 
      ? 'Clerk API klíče jsou správně nastavené!' 
      : 'Chybí některé Clerk API klíče. Zkontrolujte .env soubor.',
  });
}
