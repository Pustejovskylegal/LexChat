import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2025-12-15.clover" });
}

// Mapování tarifů na ceny v haléřích (CZK)
const PRICE_MAP: Record<string, number> = {
  Student: 19900,     // 199 Kč
  Pro: 59900,         // 599 Kč
  Enterprise: 189900, // 1899 Kč
};

export async function POST(req: Request) {
  try {
    const { planName, email, firstName, lastName } = await req.json();

    if (!planName || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const priceAmount = PRICE_MAP[planName];
    if (!priceAmount) {
      return NextResponse.json(
        { error: "Invalid plan name" },
        { status: 400 }
      );
    }

    // Base URL pro redirecty: z env, z requestu (produkce), nebo localhost
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof req.url === "string" ? new URL(req.url).origin : null) ||
      "http://localhost:3000";

    // Vytvoření Stripe checkout session
// Popisy tarifů pro Stripe (zobrazení v checkoutu)
const PLAN_DESCRIPTIONS: Record<string, string> = {
  Student:
    "Měsíční předplatné pro studenty práv: databáze soudních rozhodnutí, monografie, studentské materiály, státnicové otázky, testy, klauzury a vyhledávání.",
  Pro: "Měsíční předplatné Pro: vše z tarifu Student + kombinace více AI modelů, primárně pro právní praxi, pokročilá analýza.",
  Enterprise: "Měsíční předplatné Enterprise: firemní nasazení, API přístup, dedikovaná podpora.",
};

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "czk",
            product_data: {
              name: `LexChat - ${planName}`,
              description: PLAN_DESCRIPTIONS[planName] ?? `Měsíční předplatné tarifu ${planName}.`,
            },
            recurring: {
              interval: "month",
            },
            unit_amount: priceAmount,
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: email,
      metadata: {
        planName,
        firstName: firstName || "",
        lastName: lastName || "",
      },
      success_url: `${baseUrl}/chat`,
      cancel_url: `${baseUrl}/signup/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
