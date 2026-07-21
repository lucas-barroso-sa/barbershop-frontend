"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { 
  ArrowDown, 
  ArrowUp, 
  HelpCircle,
  Loader2
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

export default function FinancialSummaryPage() {
  const [summaryData, setSummaryData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Busca os dados do nosso novo endpoint BFF
  useEffect(() => {
    async function loadFinancialSummary() {
      try {
        const response = await api.get('/financial/summary')
        setSummaryData(response.data)
      } catch (error) {
        console.error("Erro ao carregar resumo financeiro:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFinancialSummary()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium animate-pulse">Carregando métricas financeiras...</p>
      </div>
    )
  }

  // Fallback caso venha vazio
  const currentMonthYear = summaryData?.currentMonthYear || "Julho/2026"
  const payables = summaryData?.payables || { total: 0, overdue: 0, today: 0, thisWeek: 0 }
  const receivables = summaryData?.receivables || { total: 0, overdue: 0, today: 0, thisWeek: 0 }
  const availabilities = summaryData?.availabilities || { totalBalance: 0, accounts: [] }
  const chartData = summaryData?.chartData || []

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
              <p className="text-3xl font-black text-red-600">
                R$ {payables.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500 mb-1">Em atraso</p>
                <p className="text-sm font-semibold text-slate-800">
                  R$ {payables.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Hoje</p>
                <p className="text-sm font-semibold text-slate-800">
                  R$ {payables.today.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Esta semana</p>
                <p className="text-sm font-semibold text-slate-800">
                  R$ {payables.thisWeek.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
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
              <p className="text-3xl font-black text-green-500">
                R$ {receivables.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500 mb-1">Em atraso</p>
                <p className="text-sm font-semibold text-slate-800">
                  R$ {receivables.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Hoje</p>
                <p className="text-sm font-semibold text-slate-800">
                  R$ {receivables.today.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Esta semana</p>
                <p className="text-sm font-semibold text-slate-800">
                  R$ {receivables.thisWeek.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CARD 3: DISPONIBILIDADES (Simplificado sem limite) */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Disponibilidades <HelpCircle className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-xs text-slate-400 font-semibold">{currentMonthYear}</span>
              <p className="text-3xl font-black text-green-500">
                R$ {availabilities.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Total em Contas Bancárias / Caixa</p>
              <p className="text-sm font-semibold text-slate-800">
                {availabilities.accounts.length} conta(s) ativa(s) mapeada(s)
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* =======================================
          LINHA 2: GRÁFICO E TABELA DE SALDOS
          ======================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* GRÁFICO: RESUMO POR SEMANA */}
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

        {/* TABELA: SALDOS EM CONTA DINÂMICA */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-slate-800">Saldos em conta</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-slate-800 text-xs">Conta bancária</TableHead>
                  <TableHead className="font-bold text-slate-800 text-xs text-right">Saldo R$</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availabilities.accounts.map((acc: any, index: number) => (
                  <TableRow key={index} className="border-b border-slate-100">
                    <TableCell className="font-medium text-slate-600 text-sm">{acc.name}</TableCell>
                    <TableCell className="text-right text-green-500 font-semibold text-sm">
                      {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
                {availabilities.accounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-slate-400 py-6 text-sm">
                      Nenhuma conta cadastrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}