import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

// Mapování tarifů na ceny v haléřích (CZK)
const PRICE_MAP: Record<string, number> = {
  Basic: 19900,    // 199 Kč = 19900 haléřů
  Pro: 34900,      // 349 Kč = 34900 haléřů
  Enterprise: 189900, // 1899 Kč = 189900 haléřů
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

    // Vytvoření Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "czk",
            product_data: {
              name: `LexChat - ${planName} tarif`,
              description: `Měsíční předplatné ${planName} tarifu`,
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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/chat`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/signup/pricing`,
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
