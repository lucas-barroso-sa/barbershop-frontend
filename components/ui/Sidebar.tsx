"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation" 
import { 
  CalendarDays, 
  DollarSign, 
  Users, 
  Settings, 
  Scissors,
  LogOut,
  ChevronRight
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  
  // 1. Estado para guardar o perfil do usuário
  const [userRole, setUserRole] = useState<string | null>(null)

  // 2. Busca o perfil no localStorage quando a barra carrega
  useEffect(() => {
    const role = localStorage.getItem('@BarberShop:role')
    setUserRole(role)
  }, [])

  // 3. Adicionamos a propriedade `roles` em cada item para definir quem pode ver
  const navItems = [
    { 
      name: "Agenda", 
      href: "/agenda", 
      icon: CalendarDays, 
      roles: ["ADMIN", "BARBER"] // Todos veem
    },
    { 
      name: "Clientes", 
      href: "/clients", 
      icon: Users,
      roles: ["ADMIN", "BARBER"] // Todos veem
    },
    { 
      name: "Financeiro", 
      href: "/finance", 
      icon: DollarSign,
      roles: ["ADMIN"], // 🚨 APENAS ADMIN
      subItems: [
        { name: "Movimentações", href: "/finance" },
        { name: "Resumo", href: "/finance/summary" }
      ]
    },
    { 
      name: "Configurações", 
      href: "/settings", 
      icon: Settings, 
      roles: ["ADMIN"] // 🚨 APENAS ADMIN (Gerenciar equipe está aqui dentro)
    },
  ]

  // 4. Filtra o menu antes de renderizar
  const filteredNavItems = navItems.filter((item) => {
    if (!userRole) return false // Esconde os botões por 1 milissegundo até carregar a role
    return item.roles.includes(userRole)
  })

  const handleLogout = () => {
    // Limpa os cookies e os dados do localStorage ao sair
    document.cookie = "barbershop.token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    localStorage.removeItem('@BarberShop:role')
    localStorage.removeItem('@BarberShop:name')
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
          Don Victor’s
        </span>
      </div>

      {/* LINKS DE NAVEGAÇÃO */}
      <nav className="flex-1 space-y-2 py-6 px-3 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {/* Usando a lista FILTRADA em vez da lista original */}
        {filteredNavItems.map((item) => {
          const isMainActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <div key={item.name} className="group/navitem relative flex flex-col">
              
              {/* Botão Principal */}
              <Link
                href={item.href}
                className={`flex items-center rounded-lg px-3 py-3 transition-colors ${
                  isMainActive 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-6 w-6 shrink-0" />
                <span className="ml-4 flex-1 flex items-center justify-between whitespace-nowrap font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {item.name}
                  {item.subItems && (
                    <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover/navitem:rotate-90" />
                  )}
                </span>
              </Link>

              {/* SubMenu */}
              {item.subItems && (
                <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-300 ease-in-out group-hover/navitem:grid-rows-[1fr] group-hover/navitem:opacity-100">
                  <div className="overflow-hidden flex flex-col space-y-1 mt-1">
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname === sub.href
                      
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={`ml-12 mr-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            isSubActive
                              ? "bg-slate-800 text-blue-400"
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <span className="whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            {sub.name}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>
          )
        })}
      </nav>

      {/* BOTÃO DE SAÍDA */}
      <div className="p-3 border-t border-slate-800 bg-slate-900">
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