"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation" 
import { 
  CalendarDays, 
  DollarSign, 
  Users, 
  Settings, 
  Scissors,
  LogOut
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { name: "Agenda", href: "/agenda", icon: CalendarDays },
    { name: "Financeiro", href: "/finance", icon: DollarSign },
    { name: "Clientes", href: "/clients", icon: Users },
    { name: "Configurações", href: "/settings", icon: Settings },
  ]

  const handleLogout = () => {
    // 🚨 1. Matamos o cookie sobrescrevendo a data de expiração para o ano de 1970
    // O 'path=/' garante que ele seja apagado em toda a aplicação, não apenas na rota atual
    document.cookie = "barbershop.token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    

    router.push("/")
  }

  return (
    <aside 
      className="group fixed left-0 top-0 z-50 flex h-screen flex-col bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out w-20 hover:w-64 shadow-2xl overflow-hidden"
    >
      {/* LOGO AREA */}
      <div className="flex h-20 items-center justify-start px-6 bg-slate-950 border-b border-slate-800">
        <Scissors className="h-8 w-8 shrink-0 text-blue-500" />
        <span className="ml-4 whitespace-nowrap text-xl font-black text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Barber Manager
        </span>
      </div>

      {/* LINKS DE NAVEGAÇÃO */}
      <nav className="flex-1 space-y-2 py-6 px-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-lg px-3 py-3 transition-colors ${
                isActive 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-6 w-6 shrink-0" />
              <span className="ml-4 whitespace-nowrap font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* BOTÃO DE SAÍDA */}
      <div className="p-3 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center rounded-lg px-3 py-3 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
        >
          <LogOut className="h-6 w-6 shrink-0" />
          <span className="ml-4 whitespace-nowrap font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Sair do Sistema
          </span>
        </button>
      </div>
    </aside>
  )
}