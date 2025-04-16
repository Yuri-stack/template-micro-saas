import { db } from "@/app/lib/firebase"
import "server-only"

import Stripe from "stripe"

export async function handleStripePayment(event: Stripe.CheckoutSessionCompletedEvent) {
    if (event.data.object.payment_status === "paid") {
        console.log("Enviar um email confirmando o pagamento")

        const metadata = event.data.object.metadata

        const userId = metadata?.userId

        if (!userId) {
            console.error("Id do Usuário não encontrado")
            return
        }

        await db.collection("users").doc(userId).update({
            stripeSubscriptionId: event.data.object.subscription,
            subscriptionStatus: "active"
        })

    }
}