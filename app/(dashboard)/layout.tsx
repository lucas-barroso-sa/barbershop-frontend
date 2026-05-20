"use client" // Necessário para usar eventos de clique e o useRouter

import { ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { destroyCookie } from "nookies" // Certifique-se de ter instalado: npm install nookies
import { 
  Users, 
  CalendarDays, 
  DollarSign, 
  Settings,
  LogOut,
  Scissors
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()

  const menuItems = [
    { name: "Agenda", href: "/agenda", icon: CalendarDays },
    { name: "Clientes", href: "/clients", icon: Users },
    { name: "Financeiro", href: "/finance", icon: DollarSign },
    { name: "Configurações", href: "/settings", icon: Settings },
  ]

  // Função para deslogar de verdade
  const handleLogout = () => {
    // 1. Destrói o cookie que contém o seu Token JWT
    destroyCookie(undefined, 'barbershop.token')
    
    // 2. Redireciona para a raiz (onde agora está o seu Login)
    router.push('/')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Barra Lateral */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b">
          <div className="bg-slate-900 p-2 rounded-lg text-white">
            <Scissors className="w-6 h-6" />
          </div>
          <span className="font-bold text-lg tracking-tight">BarberShop</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-slate-100 font-medium"
              >
                <item.icon className="w-5 h-5 text-slate-500" />
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          {/* 🚨 Substituímos o <Link> por um botão com onClick */}
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col">
        {/* Header Superior */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <div className="md:hidden flex items-center gap-2">
             <Scissors className="w-5 h-5 text-slate-900" />
             <span className="font-bold">BarberShop</span>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">Lucas Barroso</p>
              <p className="text-xs text-slate-500">Administrador</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border flex items-center justify-center font-bold text-slate-600">
              LB
            </div>
          </div>
        </header>

        {/* Área da Página */}
        <div className="p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}