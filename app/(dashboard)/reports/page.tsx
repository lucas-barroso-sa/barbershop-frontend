"use client" // Adicione caso precise por conta de hooks internos dos componentes UI, mas pelo layout pode ser server também.

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, Percent } from "lucide-react"
import AdminGuard from "@/components/ui/AdminGuard" // Ajuste o caminho de importação conforme sua estrutura

// Estrutura de dados separada por categorias
const reportSections = [
  {
    title: "Visão Geral",
    items: [
      {
        title: "Repasse",
        description: "Gerencie repasse dos barbeiros.",
        icon: Percent, // Ícone de porcentagem remete bem a comissões/repasses
        href: "/reports/commissions", // Ajuste a rota conforme o seu padrão
      },
      {
        title: "Atendimento",
        description: "Gere relatórios de atendimento.",
        icon: BarChart3, // Ícone clássico de gráficos de performance
        href: "/reports/attendance", // Ajuste a rota conforme o seu padrão
      },
    ],
  },
]

export default function ReportsPage() {
  return (
    <AdminGuard>
      <div className="space-y-10 max-w-6xl mx-auto p-4 lg:p-8 pb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Relatórios</h1>
          <p className="text-slate-500 mt-1">
            Acompanhe o desempenho, métricas e o financeiro da barbearia
          </p>
        </div>

        <div className="space-y-10">
          {reportSections.map((section) => (
            <section key={section.title} className="space-y-4">
              {/* Título da Categoria */}
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
                        <div className="mb-4 text-slate-500 group-hover:text-blue-600 transition-colors">
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
    </AdminGuard>
  )
}