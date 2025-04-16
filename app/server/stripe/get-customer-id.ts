import { db } from '@/app/lib/firebase'
import stripe from '@/app/lib/stripe'
import 'server-only'

export async function getOrCreateCustomer(userId: string, userEmail: string) {
    try {
        const userRef = db.collection("users").doc(userId)  // busca no banco de dados
        const userDoc = await userRef.get() // pega as info do usuário

        if (!userDoc.exists) throw new Error("Usuário não encontrado")

        const stripeCustomerId = userDoc.data()?.stripeCustomerId   // verifica se já tem o usuário cadastrado no banco

        if (stripeCustomerId) return stripeCustomerId   // se sim, já retorna

        const userName = userDoc.data()?.name   // verifica se o usuário tem um name no banco e pega

        const stripeCustomer = await stripe.customers.create({  // cria o usuário no stripe
            email: userEmail,
            ...(userName && { name: userName }),
            metadata: { userId }
        })

        await userRef.update({  // atualiza no banco
            stripeCustomerId: stripeCustomer.id
        })

        return stripeCustomer.id

    } catch (error) {
        console.log(error)
        throw new Error("Falha ao recuparar e/ou criar o usuário")
    }

}