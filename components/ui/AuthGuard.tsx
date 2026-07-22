"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { parseCookies } from "nookies"
import { Loader2 } from "lucide-react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // 1. Pega os cookies salvos no navegador
    const cookies = parseCookies()
    const token = cookies['barbershop.token']
    
    // 2. Identifica se o usuário está na tela de Login ou Registro
    const isPublicRoute = pathname === '/' || pathname === '/register'

    if (!token && !isPublicRoute) {
      // Sem token tentando acessar área interna -> Expulsa pro Login
      router.replace('/')
    } else if (token && isPublicRoute) {
      // Com token tentando acessar o Login -> Joga de volta pra Agenda
      router.replace('/agenda')
    } else {
      // Tudo certo, libera a tela!
      setIsAuthenticated(true)
    }
  }, [router, pathname])

  // Enquanto valida, mostra um loading (evita que a tela pisque dados sensíveis)
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    )
  }

  return <>{children}</>
}