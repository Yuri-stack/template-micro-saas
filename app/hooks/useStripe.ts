import { loadStripe, Stripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";

export function useStripe() {
    const [stripe, setStripe] = useState<Stripe | null>(null)

    useEffect(() => {
        async function loadStripeAsync() {
            const stripeInstance = await loadStripe(
                process.env.NEXT_PUBLIC_STRIPE_PUB_KEY!
            )
            setStripe(stripeInstance)
        }

        loadStripeAsync()
    }, [])

    // Função para pagamentos únicos
    async function createPaymentStripeCheckout(checkoutData: { testeId: string }) {
        if (!stripe) return

        try {
            const response = await fetch('/api/stripe/create-pay-checkout', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(checkoutData)
            })

            const data = await response.json()

            await stripe.redirectToCheckout({ sessionId: data.sessionId })

        } catch (error) {
            console.log(error)
        }
    }

    // Função para pagamentos consecutivos (plano mensal ou anual)
    async function createSubscriptionStripeCheckout(checkoutData: { testeId: string }) {
        if (!stripe) return

        try {
            const response = await fetch('/api/stripe/create-subscription-checkout', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(checkoutData)
            })

            const data = await response.json()

            await stripe.redirectToCheckout({ sessionId: data.sessionId })

        } catch (error) {
            console.log(error)
        }
    }

    // Função para construir um portal de gerenciamento das assinaturas
    async function handleCreateStripePortal() {
        try {
            const response = await fetch('/api/stripe/create-portal', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
            })

            const data = await response.json()

            window.location.href = data.url

        } catch (error) {
            console.log(error)
        }
    }

    return {
        createPaymentStripeCheckout,
        createSubscriptionStripeCheckout,
        handleCreateStripePortal
    }

}