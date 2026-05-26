"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import api from "@/lib/api" // Ajuste o caminho se a sua instância do Axios ficar em outro lugar
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
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2
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

// 1. Tipagem refletindo o DTO do Java (FinancialMovementGetMinDTO)
interface FinancialMovementDTO {
  id: number
  eventType: "SERVICE_PAYMENT" | "PRODUCT_SALE" | "COST_CENTER" | "PAYROLL"
  movementType: "INCOME" | "EXPENSE"
  movementStatus: "PENDING" | "SETTLED"
  netAmount: number
  paymentDate: string | null
  dueDate: string | null
  description: string
  costCenterName: string | null
}

export default function FinancialPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"CAIXA" | "RECEBER" | "PAGAR">("CAIXA")
  
  // Estados da API
  const [movements, setMovements] = useState<FinancialMovementDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Estados de Paginação e Data
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // Inicializa o mês atual no formato "YYYY-MM" (Ex: "2026-05")
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  })

  // 2. Função para calcular o 1º e o último dia do mês selecionado (Com o TypeScript corrigido)
  const getMonthDateRange = (yyyyMM: string) => {
    const [year, month] = yyyyMM.split('-')
    const startDate = `${year}-${month}-01`
    const endDate = new Date(Number(year), Number(month), 0).toISOString().split('T')[0] 
    return { startDate, endDate }
  }

  // 3. O "Efeito" que busca os dados no Spring Boot
  useEffect(() => {
    async function fetchMovements() {
      setIsLoading(true)
      try {
        const { startDate, endDate } = getMonthDateRange(selectedMonth)
        
        // Define qual URL chamar baseado na aba atual
        let endpoint = ""
        if (activeTab === "CAIXA") endpoint = "/financial-movements/cash-flow"
        if (activeTab === "RECEBER") endpoint = "/financial-movements/receivables"
        if (activeTab === "PAGAR") endpoint = "/financial-movements/payables"

        const response = await api.get(endpoint, {
          params: {
            startDate,
            endDate,
            pagina: currentPage,
            tamanho: 20 // Trazemos 20 itens por página
          }
        })

        // Popula os estados lendo os metadados do Page<T> do Spring
        setMovements(response.data.content)
        setTotalPages(response.data.totalPages)

      } catch (error) {
        console.error("Erro ao buscar movimentações:", error)
        setMovements([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovements()
  }, [activeTab, selectedMonth, currentPage])

  // Resetar a página para 0 sempre que trocar de Aba ou de Mês
  useEffect(() => {
    setCurrentPage(0)
  }, [activeTab, selectedMonth])

  // Lógica de Filtro em Texto (Aplicado sobre os dados da página atual)
  const filteredMovements = movements.filter(m => 
    m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.costCenterName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Dashboard Local (Calcula apenas com os dados carregados na tela)
  const localIncome = movements.filter(m => m.movementType === "INCOME" && m.movementStatus === "SETTLED").reduce((acc, curr) => acc + curr.netAmount, 0)
  const localExpense = movements.filter(m => m.movementType === "EXPENSE" && m.movementStatus === "SETTLED").reduce((acc, curr) => acc + curr.netAmount, 0)
  const localBalance = localIncome - localExpense

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
      
      {/* CABEÇALHO COM SELETOR DE MÊS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão Financeira</h1>
          <p className="text-slate-500">Acompanhe o fluxo de caixa e as pendências do seu negócio.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center bg-white border border-slate-200 rounded-md px-3 h-10 shadow-sm">
            <span className="text-sm font-semibold text-slate-600 mr-2">Período:</span>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-sm text-slate-900 outline-none bg-transparent cursor-pointer"
            />
          </div>

          <Button className="bg-slate-900 hover:bg-slate-800 text-white flex gap-2 shadow-md">
            <Plus className="w-4 h-4" /> Nova Movimentação
          </Button>
        </div>
      </div>

      {/* CARDS DE RESUMO (Aviso: Temporariamente calculando apenas a página atual) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Entradas (Página Atual)</CardTitle>
            <div className="p-2 bg-green-100 text-green-700 rounded-full">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ {localIncome.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Saídas (Página Atual)</CardTitle>
            <div className="p-2 bg-red-100 text-red-700 rounded-full">
              <TrendingDown className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ {localExpense.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Saldo (Página Atual)</CardTitle>
            <div className="p-2 bg-slate-800 text-slate-300 rounded-full">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {localBalance.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* ÁREA DA TABELA COM ABAS */}
      <Card className="shadow-sm border-slate-200">
        
        {/* NAVEGAÇÃO DAS ABAS */}
        <div className="flex border-b border-slate-100 px-6 pt-4">
          <button 
            onClick={() => setActiveTab("CAIXA")}
            className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === "CAIXA" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            Extrato de Caixa
          </button>
          <button 
            onClick={() => setActiveTab("RECEBER")}
            className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === "RECEBER" ? "border-green-600 text-green-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            Contas a Receber
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
                  placeholder="Buscar na página..." 
                  className="pl-9 h-10 w-[250px]" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
                {activeTab !== "CAIXA" && <TableHead className="font-semibold text-center w-[120px]">Ação</TableHead>}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={activeTab === "CAIXA" ? 4 : 5} className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="text-slate-500 font-medium animate-pulse">Buscando dados no servidor...</p>
                  </TableCell>
                </TableRow>
              ) : filteredMovements.length > 0 ? (
                filteredMovements.map((movement) => (
                  <TableRow key={movement.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        {movement.movementStatus === "PENDING" ? <Clock className="w-3 h-3 text-orange-500" /> : <CheckCircle2 className="w-3 h-3 text-green-500" />}
                        {movement.movementStatus === "PENDING" ? movement.dueDate : movement.paymentDate}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <p className="text-slate-900 font-semibold">{movement.description}</p>
                      <span className="text-xs text-slate-500 block mt-0.5">Registro #{movement.id}</span>
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
                      <p className="font-medium">Nenhuma movimentação {activeTab === "CAIXA" ? "efetivada" : "pendente"} encontrada neste mês.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* CONTROLES DE PAGINAÇÃO */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
              <span className="text-sm font-medium text-slate-500">
                Página {currentPage + 1} de {totalPages}
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Próxima <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}