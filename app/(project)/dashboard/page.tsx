import { handleAuth } from "@/app/actions/handle-auth"
import { auth } from "@/app/lib/auth"
import { redirect } from "next/navigation"

export default async function Dashboard() {
    const session = await auth()

    if (!session)
        redirect('/login')

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p>{session?.user?.email ? session.user.email : 'Não está logado'}</p>
            <form action={handleAuth}>
                <button type="submit">Logout</button>
            </form>
        </div >
    )
}
