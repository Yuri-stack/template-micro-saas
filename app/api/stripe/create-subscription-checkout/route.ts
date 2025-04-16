import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import stripe from "@/app/lib/stripe";
import { getOrCreateCustomer } from "@/app/server/stripe/get-customer-id";

export async function POST(req: NextRequest) {
    const { testeId } = await req.json()

    const price = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

    if (!price)
        return NextResponse.json({ error: "Preço não encontrado" }, { status: 500 })

    const session = await auth()
    const userId = session?.user?.id
    const userEmail = session?.user?.email

    if (!userId || !userEmail)
        return NextResponse.json({ error: "Não Autorizado" }, { status: 401 })

    const customerId = await getOrCreateCustomer(userId, userEmail)

    const metadata = { testeId, price, userId }

    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [{ price, quantity: 1 }],
            mode: "subscription",
            payment_method_types: ["card"],
            success_url: `${req.headers.get("origin")}/success`,    // forma para evitar o domínio e/ou localhost
            cancel_url: `${req.headers.get("origin")}/`,
            metadata,
            customer: customerId
        })

        if (!session.url)
            return NextResponse.json({ error: "URL da Sessão não encontrada" }, { status: 500 })

        return NextResponse.json({ sessionId: session.id }, { status: 200 })

    } catch (error) {
        console.log(error)
        return NextResponse.error()
    }

}