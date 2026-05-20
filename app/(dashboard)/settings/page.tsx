import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Scissors, Package } from "lucide-react"

// Estrutura de dados separada por categorias (igual à imagem)
const settingsSections = [
  {
    title: "Gerenciamento",
    items: [
      {
        title: "Usuários",
        description: "Adições, permissões e informações de usuários do sistema.",
        icon: Users,
        href: "/settings/users", // Rota futura para gerenciar a equipe
      },
    ],
  },
  {
    title: "Catálogo",
    items: [
      {
        title: "Serviços",
        description: "Gerenciamento dos cortes e serviços disponíveis para agendamento.",
        icon: Scissors,
        href: "/settings/services", // Rota futura para os serviços
      },
      {
        title: "Produtos",
        description: "Controle de itens, valores e produtos para venda na barbearia.",
        icon: Package,
        href: "/settings/products", // Rota futura para os produtos
      },
    ],
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configurações</h1>
        <p className="text-slate-500 mt-1">Gerencie as preferências e cadastros base do sistema</p>
      </div>

      <div className="space-y-10">
        {settingsSections.map((section) => (
          <section key={section.title} className="space-y-4">
            {/* Título da Categoria (ex: Gerenciamento) */}
            <h2 className="text-lg font-medium text-slate-600">
              {section.title}
            </h2>
            
            {/* Grid dos Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item) => (
                <Link key={item.title} href={item.href} className="block group">
                  <Card className="h-full border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 cursor-pointer bg-white">
                    <CardContent className="p-6 flex flex-col items-start text-left">
                      {/* Ícone no topo esquerdo */}
                      <div className="mb-4 text-slate-500 group-hover:text-slate-900 transition-colors">
                        <item.icon className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      
                      {/* Título */}
                      <h3 className="text-base font-semibold text-slate-900 mb-1">
                        {item.title}
                      </h3>
                      
                      {/* Descrição */}
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}