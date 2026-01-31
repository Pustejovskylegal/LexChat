import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUser } from "@/lib/clerk";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

// Mapování tarifů na ceny
const PRICE_MAP: Record<string, { price: number; priceText: string }> = {
  Basic: { price: 199, priceText: "199 Kč / měsíc" },
  Pro: { price: 349, priceText: "349 Kč / měsíc" },
  Enterprise: { price: 1899, priceText: "1899 Kč / měsíc" },
};

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 400 }
      );
    }

    // Najít customer podle emailu
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({
        hasSubscription: false,
        plan: null,
        price: null,
        nextPaymentDate: null,
      });
    }

    const customer = customers.data[0];

    // Najít aktivní subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        hasSubscription: false,
        plan: null,
        price: null,
        nextPaymentDate: null,
      });
    }

    const subscription = subscriptions.data[0];
    const planName = subscription.metadata?.planName || 'Unknown';
    const priceInfo = PRICE_MAP[planName] || { price: 0, priceText: "Neznámá cena" };
    
    // Datum další platby (current_period_end)
    const nextPaymentDate = new Date(subscription.current_period_end * 1000);

    return NextResponse.json({
      hasSubscription: true,
      plan: planName,
      price: priceInfo.price,
      priceText: priceInfo.priceText,
      nextPaymentDate: nextPaymentDate.toISOString(),
      status: subscription.status,
    });
  } catch (err: any) {
    console.error("Subscription error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to get subscription" },
      { status: 500 }
    );
  }
}
