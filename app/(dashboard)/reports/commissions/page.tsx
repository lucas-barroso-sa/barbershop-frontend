"use client"

import { 
  Calendar, 
  Search, 
  SlidersHorizontal, 
  ChevronDown,
  Pin
} from "lucide-react"
import AdminGuard from "@/components/ui/AdminGuard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function CommissionsReportPage() {
  return (
    <AdminGuard>
      <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
        
        {/* CABEÇALHO */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Relatório de Repasse
            </h1>
            <button className="flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors">
              <Pin className="w-4 h-4 mr-1" />
              Destacar relatório
            </button>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Nesta seção você pode acessar todos os relatórios de repasse financeiro da sua barbearia
          </p>
        </div>

        {/* BARRA DE FERRAMENTAS E FILTROS */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Filtro de Data */}
            <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white h-10">
              <div className="flex items-center px-3 text-slate-500 border-r border-slate-200">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">26/07/2026</span>
              </div>
              <div className="flex items-center px-3 text-slate-500 border-r border-slate-200">
                <span className="text-sm">01/08/2026</span>
              </div>
              <button className="px-4 text-sm font-medium hover:bg-slate-50 transition-colors h-full">Hoje</button>
              <button className="px-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 h-full">Semana</button>
              <button className="px-4 text-sm font-medium hover:bg-slate-50 transition-colors h-full">Mês</button>
            </div>

            {/* Tipo de Filtro (Baixa / Produção) */}
            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="tipo" className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600" defaultChecked />
                <span>Baixa</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="tipo" className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600" />
                <span>Produção</span>
              </label>
            </div>

            {/* Botão de Filtros Extras */}
            <Button variant="outline" className="h-10 text-slate-600">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtros (0)
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* Busca */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Pesquisar" className="pl-9 h-10 w-64" />
            </div>
            
            {/* Exportar */}
            <Button variant="outline" className="h-10 text-slate-600">
              Exportar
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            
            {/* Gerar Contas */}
            <Button className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium">
              Gerar contas
            </Button>
          </div>
        </div>

        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Baixas */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Baixas no período com regras de repasse</h3>
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center justify-between p-5 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Valor baixado</p>
                    <p className="font-medium text-slate-900">R$150,00</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Glosa</p>
                    <p className="font-medium text-slate-900">R$0,00</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Descontos</p>
                    <p className="font-medium text-slate-900">R$0,00</p>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <p className="text-slate-500 mb-1">Baixado líquido</p>
                    <p className="font-bold text-slate-900">R$150,00</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Valor barbearia</p>
                    <p className="font-bold text-slate-900">R$48,00</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card 2: Repasse */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Repasse para os profissionais</h3>
            <Card className="shadow-sm border-blue-100 bg-blue-50/50">
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center justify-between p-5 text-sm">
                  <div>
                    <p className="text-slate-600 mb-1">Total repasse</p>
                    <p className="font-medium text-slate-900">R$102,00</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Pago</p>
                    <p className="font-medium text-slate-900">R$0,00</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Aguardando</p>
                    <p className="font-medium text-slate-900">R$0,00</p>
                  </div>
                  <div className="border-l border-blue-200 pl-4">
                    <p className="text-slate-600 mb-1">Saldo a pagar</p>
                    <p className="font-bold text-slate-900">R$102,00</p>
                  </div>
                  <div className="w-16">
                    {/* Espaçamento extra para manter proporção do grid da imagem */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* TABELA DE DETALHAMENTO */}
        <div className="mt-8">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Detalhamento do repasse</h3>
          
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-medium">Profissional</th>
                    <th className="px-6 py-4 font-medium text-right">Rep. Exec.</th>
                    <th className="px-6 py-4 font-medium text-right">Total repasse</th>
                    <th className="px-6 py-4 font-medium text-right">Pago</th>
                    <th className="px-6 py-4 font-medium text-right">Aguardando</th>
                    <th className="px-6 py-4 font-medium text-right">A pagar</th>
                    <th className="px-6 py-4 font-medium text-right">Barbearia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">Lucas</td>
                    <td className="px-6 py-4 text-right text-slate-600">102,00</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">102,00</td>
                    <td className="px-6 py-4 text-right text-slate-600">0,00</td>
                    <td className="px-6 py-4 text-right text-slate-600">0,00</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">102,00</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">48,00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </AdminGuard>
  )
}