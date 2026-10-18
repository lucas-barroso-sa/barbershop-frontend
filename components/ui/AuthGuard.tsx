"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { parseCookies } from "nookies"
import { Loader2 } from "lucide-react"

const publicRoutes = [
  "/",
  "/register",
  "/change-password",
  "/redifine-password",
]

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorizedPath, setAuthorizedPath] = useState<string | null>(null)

  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    const token = parseCookies()["barbershop.token"]

    if (isPublicRoute) {
      return
    }

    if (!token) {
      router.replace("/")
      return
    }

    setAuthorizedPath(pathname)
  }, [pathname, isPublicRoute, router])

  // Login, cadastro e recuperação de senha não exigem autenticação.
  if (isPublicRoute) {
    return <>{children}</>
  }

  // Só libera a página protegida após conferir a sessão.
  if (authorizedPath !== pathname) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2
          className="h-10 w-10 animate-spin text-slate-700"
          aria-label="Verificando sessão"
        />
      </div>
    )
  }

  return <>{children}</>
}