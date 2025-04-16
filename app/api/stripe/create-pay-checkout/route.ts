import stripe from "@/app/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { testeId, userEmail } = await req.json()

    const price = process.env.STRIPE_PRODUCT_PRICE_ID;

    if (!price)
        return NextResponse.json({ error: "Preço não encontrado" }, { status: 500 })

    const metadata = { testeId }

    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [{ price, quantity: 1 }],
            mode: "payment",
            payment_method_types: ["card", "boleto"],
            success_url: `${req.headers.get("origin")}/success`,    // forma para evitar o domínio e/ou localhost
            cancel_url: `${req.headers.get("origin")}/`,
            ...(userEmail && { customer_email: userEmail }),
            metadata
        })

        if (!session.url)
            return NextResponse.json({ error: "URL da Sessão não encontrada" }, { status: 500 })

        return NextResponse.json({ sessionId: session.id }, { status: 200 })

    } catch (error) {
        console.log(error)
        return NextResponse.error()
    }

}