"use client"

import { 
  Search, 
  ChevronDown, 
  MoreVertical,
  ArrowUpDown
} from "lucide-react"
import AdminGuard from "@/components/ui/AdminGuard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Dados mockados baseados na imagem
const commissionRules = [
  { id: 1, name: "TESTE CONF", startDate: "01/11/2024", endDate: "Indeterminado", status: "active" },
  { id: 2, name: "Teste", startDate: "20/09/2024", endDate: "22/09/2024", status: "expired" },
  { id: 3, name: "TESTE LUCAS NOG", startDate: "01/09/2024", endDate: "Indeterminado", status: "active" },
  { id: 4, name: "Formula exemplo", startDate: "01/08/2024", endDate: "Indeterminado", status: "active" },
  { id: 5, name: "teste baixa", startDate: "01/07/2024", endDate: "Indeterminado", status: "active" },
  { id: 6, name: "exemplo", startDate: "03/06/2024", endDate: "Indeterminado", status: "active" },
  { id: 7, name: "Repasse Corte Clássico", startDate: "28/01/2024", endDate: "Indeterminado", status: "active" },
]

export default function CommissionRulesPage() {
  return (
    <AdminGuard>
      <div className="max-w-[1200px] mx-auto p-4 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
        
        {/* CABEÇALHO */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Configuração de repasse
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Configure os repasses dos profissionais da sua barbearia.
          </p>
        </div>

        {/* NAVEGAÇÃO DE ABAS (TABS) */}
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            <button className="border-b-2 border-blue-600 py-4 px-1 text-sm font-medium text-blue-600">
              Atendimento
            </button>
            {/* Aba "Regras Por Profissional" removida conforme solicitado */}
          </nav>
        </div>

        {/* ÁREA DE CONTEÚDO (BRANCA) */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          
          {/* BARRA DE FERRAMENTAS (BUSCA E ADICIONAR) */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Buscar por nome" 
                className="pl-9 h-10 w-full"
              />
            </div>
            
            <Button className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium">
              Adicionar
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* TABELA DE REGRAS */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Nome</th>
                  <th className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
                      Início da vigência
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-medium">Fim da vigência</th>
                  <th className="px-6 py-4 font-medium"></th> {/* Coluna para os Badges */}
                  <th className="px-6 py-4 font-medium"></th> {/* Coluna para Ações */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissionRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-slate-700">{rule.name}</td>
                    
                    <td className="px-6 py-4 text-slate-700">{rule.startDate}</td>
                    
                    <td className="px-6 py-4 text-slate-700 italic">
                      {rule.endDate}
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      {rule.status === 'active' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-green-300 text-green-700 bg-green-50">
                          Em vigência
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-slate-300 text-slate-600 bg-slate-100">
                          Expirado
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </AdminGuard>
  )
}