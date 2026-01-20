// app/(auth)/login/page.tsx
import LoginForm from "./login-form"
import Image from "next/image"

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-muted">
            <div className="w-full flex max-w-4xl px-4 items-center justify-center">
                <LoginForm />
                <div className="w-96 h-120 rounded-r-xl flex items-center justify-center bg-slate-200">
                    <Image src="https://aneto.com.br/wp-content/uploads/2025/05/logo.svg" alt="Logo" width={200} height={100} />
                </div>
            </div>
        </main>
    )
}
