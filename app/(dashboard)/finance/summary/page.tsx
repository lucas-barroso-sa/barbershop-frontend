"use client"

import * as React from "react"
import { 
  ArrowDown, 
  ArrowUp, 
  HelpCircle,
  TrendingUp
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts"

// --- DADOS MOCKADOS PARA O GRÁFICO ---
const chartData = [
  { name: "31/05 a 06/06", recebimentos: 0, pagamentos: 0 },
  { name: "07/06 a 13/06", recebimentos: 0, pagamentos: 0 },
  { name: "14/06 a 20/06", recebimentos: 300, pagamentos: 0 },
  { name: "21/06 a 27/06", recebimentos: 0, pagamentos: 0 },
  { name: "28/06 a 04/07", recebimentos: 0, pagamentos: 0 },
  { name: "05/07 a 11/07", recebimentos: 0, pagamentos: 0 },
  { name: "12/07 a 18/07", recebimentos: 0, pagamentos: 0 },
  { name: "19/07 a 25/07", recebimentos: 0, pagamentos: 0 },
  { name: "26/07 a 01/08", recebimentos: 0, pagamentos: 0 },
  { name: "02/08 a 08/08", recebimentos: 0, pagamentos: 0 },
  { name: "09/08 a 15/08", recebimentos: 0, pagamentos: 0 },
  { name: "16/08 a 22/08", recebimentos: 0, pagamentos: 0 },
  { name: "23/08 a 29/08", recebimentos: 0, pagamentos: 0 },
]

export default function FinancialSummaryPage() {
  const currentMonthYear = "Julho/2026"

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 lg:p-8 bg-slate-50 min-h-screen">
      
      {/* =======================================
          LINHA 1: CARDS DE RESUMO (KPIs)
          ======================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: CONTAS A PAGAR */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Contas a pagar <ArrowDown className="w-5 h-5 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-xs text-slate-400 font-semibold">{currentMonthYear}</span>
              <p className="text-3xl font-black text-red-600">R$ 0,00</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500 mb-1">Em atraso</p>
                <p className="text-sm font-semibold text-slate-800">R$ 0,00</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Hoje</p>
                <p className="text-sm font-semibold text-slate-800">R$ 0,00</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Esta semana</p>
                <p className="text-sm font-semibold text-slate-800">R$ 0,00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: CONTAS A RECEBER */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Contas a receber <ArrowUp className="w-5 h-5 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-xs text-slate-400 font-semibold">{currentMonthYear}</span>
              <p className="text-3xl font-black text-green-500">R$ 0,00</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500 mb-1">Em atraso</p>
                <p className="text-sm font-semibold text-slate-800">R$ 0,00</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Hoje</p>
                <p className="text-sm font-semibold text-slate-800">R$ 0,00</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Esta semana</p>
                <p className="text-sm font-semibold text-slate-800">R$ 0,00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CARD 3: DISPONIBILIDADES */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Disponibilidades <HelpCircle className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-xs text-slate-400 font-semibold">{currentMonthYear}</span>
              <p className="text-3xl font-black text-green-500">R$ 33.739,05</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500 mb-1">Limite</p>
                <p className="text-sm font-semibold text-slate-800">R$ 2.000,00</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Saldo+Limite</p>
                <p className="text-sm font-semibold text-slate-800">R$ 35.739,05</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* =======================================
          LINHA 2: GRÁFICO E TABELA DE SALDOS
          ======================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* GRÁFICO: RESUMO POR SEMANA (Ocupa 2 colunas) */}
        <Card className="xl:col-span-2 bg-white shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Resumo por semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    iconType="square" 
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Bar dataKey="recebimentos" name="Recebimentos" fill="#22c55e" radius={[2, 2, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="pagamentos" name="Pagamentos" fill="#ef4444" radius={[2, 2, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* TABELA: SALDOS EM CONTA (Ocupa 1 coluna) */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-slate-800">Saldos em conta</CardTitle>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="show-inactive" className="rounded border-slate-300" />
              <label htmlFor="show-inactive" className="text-xs text-slate-500 cursor-pointer">
                Exibir contas inativas
              </label>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-slate-800 text-xs">Conta bancária</TableHead>
                  <TableHead className="font-bold text-slate-800 text-xs text-right">Saldo R$</TableHead>
                  <TableHead className="font-bold text-slate-800 text-xs text-right">Limite R$</TableHead>
                  <TableHead className="font-bold text-slate-800 text-xs text-right">Disponível R$</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                
                <TableRow className="border-b border-slate-100">
                  <TableCell className="font-medium text-slate-600 text-sm">Disponível em caixa</TableCell>
                  <TableCell className="text-right text-green-500 font-semibold text-sm">6.000,00</TableCell>
                  <TableCell className="text-right text-slate-600 font-semibold text-sm">0,00</TableCell>
                  <TableCell className="text-right text-green-500 font-semibold text-sm">6.000,00</TableCell>
                </TableRow>
                
                <TableRow className="border-b border-slate-100">
                  <TableCell className="font-medium text-slate-600 text-sm">Brasil</TableCell>
                  <TableCell className="text-right text-green-500 font-semibold text-sm">27.739,05</TableCell>
                  <TableCell className="text-right text-slate-600 font-semibold text-sm">2.000,00</TableCell>
                  <TableCell className="text-right text-green-500 font-semibold text-sm">29.739,05</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}