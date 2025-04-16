import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/firebase";
import stripe from "@/app/lib/stripe";

export async function POST(req: NextRequest) {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId)
        return NextResponse.json({ error: 'Não Autorizado' }, { status: 401 })

    try {
        const userRef = db.collection("users").doc(userId)
        const userDoc = await userRef.get()

        if (!userDoc.exists)
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

        const costumerId = userDoc.data()?.stripeCustomerId;

        if (!costumerId)
            return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: costumerId,
            return_url: `${req.headers.get("origin")}/`
        })

        return NextResponse.json({ url: portalSession.url }, { status: 200 })

    } catch (error) {
        console.log(error)
        return NextResponse.error()
    }
}