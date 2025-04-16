import stripe from "@/app/lib/stripe";
import { handleStripeCancelSubscription } from "@/app/server/stripe/handle-cancel";
import { handleStripePayment } from "@/app/server/stripe/handle-payment";
import { handleStripeSubscription } from "@/app/server/stripe/handle-subscription";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
    try {
        const body = await req.text()
        const headersList = await headers()
        const signature = headersList.get("stripe-signature")

        if (!secret || !signature)
            return NextResponse.json({ error: "Sem Assinatura ou Secret" }, { status: 400 })

        const event = stripe.webhooks.constructEvent(body, signature, secret)

        switch (event.type) {
            case 'checkout.session.completed': // pagamento realizado
                const metadata = event.data.object.metadata

                if (metadata?.price === process.env.STRIPE_PRODUCT_PRICE_ID) await handleStripePayment(event)

                if (metadata?.price === process.env.STRIPE_SUBSCRIPTION_PRICE_ID) await handleStripeSubscription(event)

                break;
            case 'checkout.session.expired': // Expirou o tempo de pagamento
                console.log('Enviar um email para o usuário avisando que o pagamento expirou.');
                break;
            case 'checkout.session.async_payment_succeeded': // Boleto pago
                console.log('Enviar um email para o usuário avisando que o pagamento foi realizado');
                break;
            case 'checkout.session.async_payment_failed': // Boleto falhou
                console.log('Enviar um email para o usuário avisando que o pagamento falhou.');
                break;
            case 'customer.subscription.created': // Criou assinatura
                console.log('Mensagem de boas vindas porque acabou de assinar');
                break;
            case 'customer.subscription.deleted': // Cancelou a assinatura
                await handleStripeCancelSubscription(event);
                break;
            default:
                console.log(`Evento ${event.type} não listado`)
        }

        return NextResponse.json({ message: "WebHook recebido" }, { status: 200 })

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Erro Interno no Servidor" }, { status: 500 })
    }
}