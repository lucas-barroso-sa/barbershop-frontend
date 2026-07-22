"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem('@BarberShop:role')
    
    if (role !== 'ADMIN') {
      // Se não for admin, chuta pra agenda
      router.replace('/agenda')
    } else {
      // Se for admin, libera a renderização
      setIsAuthorized(true)
    }
  }, [router])

  // Enquanto verifica a role (fração de segundo), não renderiza NADA da página restrita.
  // Você pode retornar null ou um loading simpático.
  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Se passou no teste, renderiza o conteúdo da página que foi "abraçada"
  return <>{children}</>
}