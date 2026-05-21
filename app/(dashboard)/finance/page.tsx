"use client"

import * as React from "react"
import { useState } from "react"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText,
  CheckCircle2,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// 1. Tipagem atualizada com o Status para a conciliação
interface FinancialMovementMock {
  id: number
  eventType: "SERVICE_PAYMENT" | "PRODUCT_SALE" | "COST_CENTER" | "PAYROLL"
  movementType: "INCOME" | "EXPENSE"
  status: "PENDING" | "SETTLED" // 🚨 O novo status que criamos no Back-end
  netAmount: number
  movementDate: string
  description: string
  costCenterName: string | null
}

// 2. Dados de mentira (Mock) misturando pendentes e efetivados
const mockMovements: FinancialMovementMock[] = [
  { id: 101, eventType: "SERVICE_PAYMENT", movementType: "INCOME", status: "SETTLED", netAmount: 45.00, movementDate: "20/05/2026 14:30", description: "Corte Degradê - Cliente: João", costCenterName: "Serviços" },
  { id: 102, eventType: "PRODUCT_SALE", movementType: "INCOME", status: "SETTLED", netAmount: 35.00, movementDate: "20/05/2026 15:00", description: "Pomada Modeladora Matte", costCenterName: "Produtos" },
  { id: 103, eventType: "COST_CENTER", movementType: "EXPENSE", status: "PENDING", netAmount: 250.00, movementDate: "25/05/2026 09:00", description: "Conta de Energia (Enel)", costCenterName: "Despesas Fixas" },
  { id: 104, eventType: "SERVICE_PAYMENT", movementType: "INCOME", status: "PENDING", netAmount: 60.00, movementDate: "22/05/2026 18:45", description: "Barba e Cabelo - Cliente: Marcos", costCenterName: "Serviços" },
  { id: 105, eventType: "PAYROLL", movementType: "EXPENSE", status: "SETTLED", netAmount: 1200.00, movementDate: "15/05/2026 10:00", description: "Repasse Quinzenal - Barbeiro: Carlos", costCenterName: "Salários e Comissões" },
]

export default function FinancialPage() {
  const [searchTerm, setSearchTerm] = useState("")
  
  // 🚨 Estado para controlar as Abas
  const [activeTab, setActiveTab] = useState<"CAIXA" | "RECEBER" | "PAGAR">("CAIXA")

  // 3. Matemática do Dashboard (Calculando apenas o que já está efetivado no Caixa)
  const settledMovements = mockMovements.filter(m => m.status === "SETTLED")
  
  const totalIncome = settledMovements
    .filter(m => m.movementType === "INCOME")
    .reduce((acc, curr) => acc + curr.netAmount, 0)

  const totalExpense = settledMovements
    .filter(m => m.movementType === "EXPENSE")
    .reduce((acc, curr) => acc + curr.netAmount, 0)

  const balance = totalIncome - totalExpense

  // 4. Lógica de Filtro Inteligente (Aba + Busca em Texto)
  const filteredMovements = mockMovements.filter(m => {
    // Primeiro filtra pelo texto digitado
    const matchesSearch = 
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.costCenterName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false

    // Depois filtra pela Aba selecionada
    if (activeTab === "CAIXA") return m.status === "SETTLED"
    if (activeTab === "RECEBER") return m.movementType === "INCOME" && m.status === "PENDING"
    if (activeTab === "PAGAR") return m.movementType === "EXPENSE" && m.status === "PENDING"
    
    return true
  })

  // Tradução do Tipo de Evento
  const translateEventType = (type: string) => {
    switch(type) {
      case "SERVICE_PAYMENT": return "Serviço";
      case "PRODUCT_SALE": return "Produto";
      case "COST_CENTER": return "Custo/Despesa";
      case "PAYROLL": return "Repasse";
      default: return type;
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 lg:p-8">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão Financeira</h1>
          <p className="text-slate-500">Acompanhe o fluxo de caixa e as pendências do seu negócio.</p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white flex gap-2 shadow-md">
          <Plus className="w-4 h-4" /> Nova Movimentação
        </Button>
      </div>

      {/* CARDS DE RESUMO (Efetivados) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Entradas Efetivadas</CardTitle>
            <div className="p-2 bg-green-100 text-green-700 rounded-full">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ {totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Saídas Efetivadas</CardTitle>
            <div className="p-2 bg-red-100 text-red-700 rounded-full">
              <TrendingDown className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ {totalExpense.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Saldo em Conta</CardTitle>
            <div className="p-2 bg-slate-800 text-slate-300 rounded-full">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {balance.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* ÁREA DA TABELA COM ABAS */}
      <Card className="shadow-sm border-slate-200">
        
        {/* 🚨 Navegação das Abas */}
        <div className="flex border-b border-slate-100 px-6 pt-4">
          <button 
            onClick={() => setActiveTab("CAIXA")}
            className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === "CAIXA" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            Extrato de Caixa
          </button>
          <button 
            onClick={() => setActiveTab("RECEBER")}
            className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === "RECEBER" ? "border-green-600 text-green-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            Contas a Receber
            {/* Um badge mostrando a quantidade de pendentes pode ser interessante no futuro */}
          </button>
          <button 
            onClick={() => setActiveTab("PAGAR")}
            className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === "PAGAR" ? "border-red-600 text-red-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            Contas a Pagar
          </button>
        </div>

        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold">
              {activeTab === "CAIXA" && "Movimentações Efetivadas"}
              {activeTab === "RECEBER" && "Valores Pendentes de Recebimento"}
              {activeTab === "PAGAR" && "Valores Pendentes de Pagamento"}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input 
                  placeholder="Buscar descrição..." 
                  className="pl-9 h-10 w-[250px]" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="flex gap-2 text-slate-600">
                <Filter className="w-4 h-4" /> Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold w-[180px]">
                  {activeTab === "CAIXA" ? "Data do Pagamento" : "Data de Vencimento"}
                </TableHead>
                <TableHead className="font-semibold">Descrição</TableHead>
                <TableHead className="font-semibold">Categoria</TableHead>
                <TableHead className="font-semibold text-right">Valor</TableHead>
                {/* Cabeçalho da ação só aparece se tiver nas abas de pendentes */}
                {activeTab !== "CAIXA" && <TableHead className="font-semibold text-center w-[120px]">Ação</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.length > 0 ? (
                filteredMovements.map((movement) => (
                  <TableRow key={movement.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        {movement.status === "PENDING" ? <Clock className="w-3 h-3 text-orange-500" /> : <CheckCircle2 className="w-3 h-3 text-green-500" />}
                        {movement.movementDate}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <p className="text-slate-900 font-semibold">{movement.description}</p>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Registro #{movement.id}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant="outline" className="text-[11px] bg-white">
                          {translateEventType(movement.eventType)}
                        </Badge>
                        <span className="text-xs text-slate-500">{movement.costCenterName}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className={`inline-flex items-center justify-end gap-1 font-bold ${
                        movement.movementType === "INCOME" ? "text-green-700" : "text-red-600"
                      }`}>
                        {movement.movementType === "INCOME" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        R$ {movement.netAmount.toFixed(2)}
                      </div>
                    </TableCell>

                    {/* 🚨 Botão de Conciliação para as abas de pendentes */}
                    {activeTab !== "CAIXA" && (
                      <TableCell className="text-center">
                        <Button 
                          size="sm" 
                          variant={movement.movementType === "INCOME" ? "default" : "destructive"}
                          className={movement.movementType === "INCOME" ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          Efetivar
                        </Button>
                      </TableCell>
                    )}

                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={activeTab === "CAIXA" ? 4 : 5} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText className="w-12 h-12 mb-3 opacity-20" />
                      <p className="font-medium">Nenhuma movimentação {activeTab === "CAIXA" ? "efetivada" : "pendente"} encontrada.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}