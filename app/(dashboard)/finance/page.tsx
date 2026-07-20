"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Banknote,
  CalendarDays,
  Landmark,
  Pencil,
  CreditCard
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

// 1. Interface para a Tabela
interface FinancialMovementMinDTO {
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

// 2. Interface para o Modal de Efetivação / Edição 
interface FinancialMovementFullDTO {
  id: number
  grossAmount: number
  netAmount: number
  dueDate: string | null
  paymentDate: string | null
  description: string
  clientName: string | null
  bankName: string | null
  bankAccountId: number | null 
  paymentMethodName: string | null
}

// Interfaces Auxiliares
interface BankAccountDTO {
  id: number
  name: string
}

interface PaymentMethodDTO {
  id: number
  name: string
}

export default function FinancialPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"CAIXA" | "RECEBER" | "PAGAR">("CAIXA")
  
  // Estados da API da Tabela e Configurações
  const [movements, setMovements] = useState<FinancialMovementMinDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [bankAccounts, setBankAccounts] = useState<BankAccountDTO[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDTO[]>([])
  
  // ==========================================
  // ESTADOS: MODAL DE EFETIVAÇÃO (SETTLE)
  // ==========================================
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false)
  const [movementDetails, setMovementDetails] = useState<FinancialMovementFullDTO | null>(null)
  const [modalMovementType, setModalMovementType] = useState<"INCOME" | "EXPENSE">("INCOME")
  const [fetchingDetailsId, setFetchingDetailsId] = useState<number | null>(null)
  const [isSettling, setIsSettling] = useState(false)
  const [selectedPaymentDate, setSelectedPaymentDate] = useState(() => new Date().toISOString().split('T')[0])
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("") 

  // ==========================================
  // ESTADOS: MODAL DE CRIAÇÃO (MANUAL)
  // ==========================================
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [newDescription, setNewDescription] = useState("")
  const [newValue, setNewValue] = useState("")
  const [newDueDate, setNewDueDate] = useState(() => new Date().toISOString().split('T')[0])
  const [newPaymentMethodId, setNewPaymentMethodId] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // ==========================================
  // ESTADOS: MODAL DE EDIÇÃO COMPLETA
  // ==========================================
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [movementToEdit, setMovementToEdit] = useState<FinancialMovementFullDTO | null>(null)
  const [editMovementType, setEditMovementType] = useState<"INCOME" | "EXPENSE">("INCOME")
  const [editDescription, setEditDescription] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [editDueDate, setEditDueDate] = useState("")
  const [editPaymentDate, setEditPaymentDate] = useState("")
  const [editPaymentMethodId, setEditPaymentMethodId] = useState("")
  const [editBankAccountId, setEditBankAccountId] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // ESTADOS DE DATA
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    return firstDay.toISOString().split('T')[0]
  })
  
  const [endDate, setEndDate] = useState(() => {
    const today = new Date()
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return lastDay.toISOString().split('T')[0]
  })

  useEffect(() => {
    Promise.all([
      api.get('/bank'),
      api.get('/payment-methods')
    ]).then(([bankRes, methodsRes]) => {
      setBankAccounts(bankRes.data)
      setPaymentMethods(methodsRes.data)
    }).catch(err => console.error("Erro ao carregar configurações financeiras:", err))
  }, [])

  const fetchMovements = async () => {
    setIsLoading(true)
    try {
      let endpoint = ""
      if (activeTab === "CAIXA") endpoint = "/financial-movements/cash-flow"
      if (activeTab === "RECEBER") endpoint = "/financial-movements/receivables"
      if (activeTab === "PAGAR") endpoint = "/financial-movements/payables"

      const response = await api.get(endpoint, {
        params: {
          startDate: startDate,
          endDate: endDate,
          pagina: currentPage,
          tamanho: 20 
        }
      })

      setMovements(response.data.content)
      setTotalPages(response.data.totalPages)

    } catch (error) {
      console.error("Erro ao buscar movimentações:", error)
      setMovements([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMovements()
  }, [activeTab, startDate, endDate, currentPage])

  useEffect(() => {
    setCurrentPage(0)
  }, [activeTab, startDate, endDate])

  // Lógica de Abertura do Modal de Efetivação
  const handleOpenSettleModal = async (movementMin: FinancialMovementMinDTO) => {
    setFetchingDetailsId(movementMin.id)
    setModalMovementType(movementMin.movementType)
    setSelectedPaymentDate(new Date().toISOString().split('T')[0])
    
    try {
      const response = await api.get(`/financial-movements/${movementMin.id}`)
      setMovementDetails(response.data)
      
      if (response.data.bankAccountId) {
        setSelectedBankAccountId(response.data.bankAccountId.toString())
      } else {
        setSelectedBankAccountId("")
      }
      
      setIsSettleModalOpen(true)
    } catch (error) {
      console.error("Erro ao buscar detalhes da movimentação:", error)
      alert("Não foi possível carregar os detalhes. Tente novamente.")
    } finally {
      setFetchingDetailsId(null)
    }
  }

  const handleSettleSubmit = async () => {
    if (!movementDetails || !selectedPaymentDate || !selectedBankAccountId) return

    setIsSettling(true)
    try {
      await api.patch(`/financial-movements/${movementDetails.id}/settle`, {
        paymentDate: selectedPaymentDate,
        bankAccountId: parseInt(selectedBankAccountId, 10)
      })
      
      setIsSettleModalOpen(false)
      setMovementDetails(null)
      setSelectedBankAccountId("")
      fetchMovements() 
    } catch (error) {
      console.error("Erro ao efetivar baixa:", error)
      alert("Ocorreu um erro ao tentar efetivar a movimentação.")
    } finally {
      setIsSettling(false)
    }
  }

  // 🚨 Lógica de Criação Manual (Formatada para o FinancialMovementManualInsertDTO)
  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const payload = {
        description: newDescription,
        grossAmount: parseFloat(newValue.replace(",", ".")), // Mapeado para grossAmount
        dueDate: newDueDate,
        paymentMethodId: newPaymentMethodId ? parseInt(newPaymentMethodId, 10) : null,
        movementType: activeTab === "RECEBER" ? "INCOME" : "EXPENSE" 
      }

      await api.post('/financial-movements', payload)
      
      setIsNewModalOpen(false)
      setNewDescription("")
      setNewValue("")
      setNewPaymentMethodId("")
      fetchMovements() 
    } catch (error) {
      console.error("Erro ao criar movimentação:", error)
      alert("Erro ao salvar a nova movimentação.")
    } finally {
      setIsCreating(false)
    }
  }

  // Lógica de Abertura do Modal de Edição (Cruzando o Nome com o ID)
  const handleOpenEditModal = async (movementMin: FinancialMovementMinDTO) => {
    setFetchingDetailsId(movementMin.id)
    setEditMovementType(movementMin.movementType)
    
    try {
      const response = await api.get(`/financial-movements/${movementMin.id}`)
      const data: FinancialMovementFullDTO = response.data

      setMovementToEdit(data)
      setEditDescription(data.description)
      setEditAmount(data.grossAmount ? data.grossAmount.toString() : data.netAmount.toString())
      setEditDueDate(data.dueDate || "")
      setEditPaymentDate(data.paymentDate || "")
      setEditBankAccountId(data.bankAccountId ? data.bankAccountId.toString() : "")
      
      const linkedMethod = paymentMethods.find(m => m.name === data.paymentMethodName)
      setEditPaymentMethodId(linkedMethod ? linkedMethod.id.toString() : "")

      setIsEditModalOpen(true)
    } catch (error) {
      console.error("Erro ao buscar detalhes para edição:", error)
      alert("Não foi possível carregar os detalhes da movimentação.")
    } finally {
      setFetchingDetailsId(null)
    }
  }

  // Lógica de Envio da Edição (PATCH com paymentMethodId)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!movementToEdit || !editDescription || !editDueDate || !editAmount) return

    setIsEditing(true)
    try {
      const payload = {
        description: editDescription,
        amount: parseFloat(editAmount.toString().replace(",", ".")),
        dueDate: editDueDate,
        paymentDate: editPaymentDate || null,
        paymentMethodId: editPaymentMethodId ? parseInt(editPaymentMethodId, 10) : null,
        bankAccountId: editBankAccountId ? parseInt(editBankAccountId, 10) : null
      }

      await api.patch(`/financial-movements/${movementToEdit.id}`, payload)
      
      setIsEditModalOpen(false)
      setMovementToEdit(null)
      fetchMovements() 
    } catch (error) {
      console.error("Erro ao editar movimentação:", error)
      alert("Ocorreu um erro ao tentar salvar as alterações.")
    } finally {
      setIsEditing(false)
    }
  }

  const filteredMovements = movements.filter(m => 
    m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.costCenterName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const localIncome = movements.filter(m => m.movementType === "INCOME").reduce((acc, curr) => acc + curr.netAmount, 0)
  const localExpense = movements.filter(m => m.movementType === "EXPENSE").reduce((acc, curr) => acc + curr.netAmount, 0)
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
      
      {/* CABEÇALHO */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão Financeira</h1>
          <p className="text-slate-500">Acompanhe o fluxo de caixa e as pendências do seu negócio.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          
          <div className="flex items-center bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden h-10">
            <div className="bg-slate-50 px-3 border-r border-slate-200 flex items-center justify-center h-full">
              <CalendarDays className="w-4 h-4 text-slate-500" />
            </div>
            
            <div className="flex items-center px-2">
              <span className="text-xs font-semibold text-slate-500 mr-2 uppercase">De:</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm text-slate-900 outline-none bg-transparent cursor-pointer font-medium"
              />
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            <div className="flex items-center px-2">
              <span className="text-xs font-semibold text-slate-500 mr-2 uppercase">Até:</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm text-slate-900 outline-none bg-transparent cursor-pointer font-medium"
              />
            </div>
          </div>

          {activeTab !== "CAIXA" && (
            <Button 
              onClick={() => setIsNewModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white flex gap-2 shadow-md h-10"
            >
              <Plus className="w-4 h-4" /> Nova Movimentação
            </Button>
          )}
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(activeTab === "CAIXA" || activeTab === "RECEBER") && (
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Entradas</CardTitle>
              <div className="p-2 bg-green-100 text-green-700 rounded-full">
                <TrendingUp className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">R$ {localIncome.toFixed(2)}</div>
            </CardContent>
          </Card>
        )}

        {(activeTab === "CAIXA" || activeTab === "PAGAR") && (
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Saídas</CardTitle>
              <div className="p-2 bg-red-100 text-red-700 rounded-full">
                <TrendingDown className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">R$ {localExpense.toFixed(2)}</div>
            </CardContent>
          </Card>
        )}

        {activeTab === "CAIXA" && (
          <Card className="border-none shadow-sm bg-slate-900 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Saldo</CardTitle>
              <div className="p-2 bg-slate-800 text-slate-300 rounded-full">
                <DollarSign className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {localBalance.toFixed(2)}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ÁREA DA TABELA */}
      <Card className="shadow-sm border-slate-200">
        
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
                {activeTab !== "CAIXA" && <TableHead className="font-semibold text-center w-[160px]">Ações</TableHead>}
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
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                            onClick={() => handleOpenEditModal(movement)}
                            disabled={fetchingDetailsId === movement.id}
                            title="Editar movimentação"
                          >
                            {fetchingDetailsId === movement.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                          </Button>

                          <Button 
                            size="sm" 
                            variant={movement.movementType === "INCOME" ? "default" : "destructive"}
                            className={movement.movementType === "INCOME" ? "bg-green-600 hover:bg-green-700" : ""}
                            onClick={() => handleOpenSettleModal(movement)}
                            disabled={fetchingDetailsId === movement.id}
                          >
                            {fetchingDetailsId === movement.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Efetivar"}
                          </Button>
                        </div>
                      </TableCell>
                    )}

                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={activeTab === "CAIXA" ? 4 : 5} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText className="w-12 h-12 mb-3 opacity-20" />
                      <p className="font-medium">Nenhuma movimentação {activeTab === "CAIXA" ? "efetivada" : "pendente"} encontrada neste período.</p>
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

      {/* =========================================
          🚨 MODAL 1: CRIAÇÃO DE NOVA MOVIMENTAÇÃO (AJUSTADO)
          ========================================= */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all">
            
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Plus className={`w-6 h-6 ${activeTab === "RECEBER" ? "text-green-500" : "text-red-500"}`} />
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                  {activeTab === "RECEBER" ? "Nova Conta a Receber" : "Nova Conta a Pagar"}
                </h3>
              </div>
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateMovement}>
              <div className="p-8 space-y-8">
                
                {/* INFORMAÇÕES DE CONTEXTO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Tipo de Movimentação
                    </label>
                    <span className={`text-lg font-medium ${activeTab === "RECEBER" ? "text-green-600" : "text-red-600"}`}>
                      {activeTab === "RECEBER" ? "Entrada (Receita)" : "Saída (Despesa)"}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Status Inicial
                    </label>
                    <span className="text-lg text-slate-800 font-medium">
                      Pendente
                    </span>
                  </div>
                </div>

                {/* FORMULÁRIO DE CRIAÇÃO */}
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 relative overflow-hidden">
                  <h4 className="text-sm font-bold text-slate-600 mb-4">DADOS DA MOVIMENTAÇÃO</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                    
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-600 block mb-1.5">Descrição</label>
                      <Input 
                        required 
                        value={newDescription} 
                        onChange={e => setNewDescription(e.target.value)} 
                        placeholder={activeTab === "RECEBER" ? "Ex: Venda Avulsa..." : "Ex: Conta de Luz..."} 
                        className="bg-white font-medium text-slate-900 border-slate-300 shadow-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5">Valor Bruto (R$)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-sm text-slate-500 font-bold">R$</span>
                        <Input 
                          required 
                          type="number" 
                          step="0.01" 
                          min="0.01"
                          value={newValue} 
                          onChange={e => setNewValue(e.target.value)} 
                          placeholder="0.00"
                          className="bg-white font-medium text-slate-900 border-slate-300 shadow-sm pl-9" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5">Data de Vencimento</label>
                      <Input 
                        required 
                        type="date" 
                        value={newDueDate} 
                        onChange={e => setNewDueDate(e.target.value)} 
                        className="bg-white font-medium text-slate-900 border-slate-300 shadow-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-600 flex items-center gap-1 mb-1.5">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        Forma de Pagamento (Define a Taxa)
                      </label>
                      <select
                        required
                        value={newPaymentMethodId}
                        onChange={(e) => setNewPaymentMethodId(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm"
                      >
                        <option value="">Selecione...</option>
                        {paymentMethods.map((method) => (
                          <option key={method.id} value={method.id}>
                            {method.name}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>
                </div>

              </div>

              <div className="px-8 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNewModalOpen(false)}
                  disabled={isCreating}
                  className="h-10 text-slate-600 px-6"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isCreating || !newPaymentMethodId} 
                  className={`h-10 px-8 font-bold shadow-sm text-white ${activeTab === "RECEBER" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                >
                  {isCreating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</> : "Salvar Registro"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL 2: EFETIVAÇÃO DE BAIXA (SETTLE)
          ========================================= */}
      {isSettleModalOpen && movementDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all">
            
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {modalMovementType === "INCOME" ? (
                  <ArrowUpRight className="w-6 h-6 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-6 h-6 text-red-500" />
                )}
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                  {movementDetails.description}
                </h3>
              </div>
              <button 
                onClick={() => setIsSettleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {modalMovementType === "INCOME" ? "Receber de" : "Pagar para"}
                  </label>
                  <span className="text-lg text-slate-800 font-medium">
                    {movementDetails.clientName || "Não informado"}
                  </span>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Vencimento
                  </label>
                  <span className="text-lg text-slate-800 font-medium">
                    {movementDetails.dueDate || "--/--/----"}
                  </span>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Valor original R$
                  </label>
                  <span className="text-lg text-slate-800 font-medium">
                    {movementDetails.grossAmount.toFixed(2)}
                  </span>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {modalMovementType === "INCOME" ? "Saldo a receber R$" : "Saldo a pagar R$"}
                  </label>
                  <span className="text-lg text-slate-800 font-medium">
                    {movementDetails.netAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 flex flex-col sm:flex-row gap-6 relative overflow-hidden">
                <Banknote className="absolute -right-6 -bottom-6 w-48 h-48 text-slate-200/50 -rotate-12 pointer-events-none" />

                <div className="flex-1 space-y-2 relative z-10">
                  <h4 className="text-sm font-bold text-slate-600 mb-4">DADOS DA BAIXA</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5">
                        {modalMovementType === "INCOME" ? "Data de recebimento" : "Data de pagamento"}
                      </label>
                      <Input 
                        type="date" 
                        required
                        value={selectedPaymentDate} 
                        onChange={(e) => setSelectedPaymentDate(e.target.value)}
                        className="bg-white text-slate-900 border-slate-300 focus-visible:ring-blue-500 font-medium shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5">Forma de Pagamento</label>
                      <div className="flex h-10 w-full rounded-md border border-slate-200 bg-white/50 px-3 py-2 text-sm text-slate-600 cursor-not-allowed">
                        {movementDetails.paymentMethodName || "Padrão"}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 flex items-center gap-1 mb-1.5">
                        <Landmark className="w-3 h-3 text-slate-400" />
                        {modalMovementType === "INCOME" ? "Recebido via" : "Pago via"}
                      </label>
                      <select
                        required
                        value={selectedBankAccountId}
                        onChange={(e) => setSelectedBankAccountId(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <option value="" disabled>Selecione a conta...</option>
                        {bankAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="px-8 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSettleModalOpen(false)}
                disabled={isSettling}
                className="h-10 text-slate-600 px-6"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSettleSubmit}
                disabled={isSettling || !selectedPaymentDate || !selectedBankAccountId}
                className="bg-[#2A85FF] hover:bg-[#1f6bdb] text-white h-10 px-8 font-bold shadow-sm"
              >
                {isSettling ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Efetuando baixa...</>
                ) : (
                  "Baixa total"
                )}
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================
          MODAL 3: EDIÇÃO COMPLETA DE MOVIMENTAÇÃO
          ========================================= */}
      {isEditModalOpen && movementToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all">
            
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Pencil className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                  Editar Movimentação
                </h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              
              {/* INFORMAÇÕES DE CONTEXTO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {editMovementType === "INCOME" ? "Receber de" : "Pagar para"}
                  </label>
                  <span className="text-lg text-slate-800 font-medium">
                    {movementToEdit.clientName || "Não informado"}
                  </span>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Forma de Pagamento
                  </label>
                  <span className="text-lg text-slate-800 font-medium">
                    {movementToEdit.paymentMethodName || "Padrão"}
                  </span>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Status Atual
                  </label>
                  <span className="text-lg text-slate-800 font-medium">
                    {movementToEdit.paymentDate ? "Efetivada" : "Pendente"}
                  </span>
                </div>
              </div>

              {/* FORMULÁRIO DE EDIÇÃO */}
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 relative overflow-hidden">
                <h4 className="text-sm font-bold text-slate-600 mb-4">DADOS EDITÁVEIS</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                  
                  {/* Descrição - Ocupa 2 colunas em telas grandes */}
                  <div className="lg:col-span-2">
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Descrição</label>
                    <Input 
                      required 
                      value={editDescription} 
                      onChange={e => setEditDescription(e.target.value)} 
                      className="bg-white font-medium text-slate-900 border-slate-300 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Valor (R$)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm text-slate-500 font-bold">R$</span>
                      <Input 
                        required 
                        type="number" 
                        step="0.01"
                        value={editAmount} 
                        onChange={e => setEditAmount(e.target.value)} 
                        className="bg-white font-medium text-slate-900 border-slate-300 shadow-sm pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Data de Vencimento</label>
                    <Input 
                      required 
                      type="date" 
                      value={editDueDate} 
                      onChange={e => setEditDueDate(e.target.value)} 
                      className="bg-white font-medium text-slate-900 border-slate-300 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Data de Pagamento</label>
                    <Input 
                      type="date" 
                      value={editPaymentDate} 
                      onChange={e => setEditPaymentDate(e.target.value)} 
                      className="bg-white font-medium text-slate-900 border-slate-300 shadow-sm"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Deixe vazio se ainda não pagou/recebeu.</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1 mb-1.5">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      Forma de Pagamento
                    </label>
                    <select
                      value={editPaymentMethodId}
                      onChange={(e) => setEditPaymentMethodId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm"
                    >
                      <option value="">Selecione...</option>
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1 mb-1.5">
                      <Landmark className="w-3 h-3 text-slate-400" />
                      Conta Bancária
                    </label>
                    <select
                      value={editBankAccountId}
                      onChange={(e) => setEditBankAccountId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm"
                    >
                      <option value="">Selecione...</option>
                      {bankAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
              </div>

            </div>

            <div className="px-8 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isEditing}
                className="h-10 text-slate-600 px-6"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEditSubmit}
                disabled={isEditing || !editDescription || !editDueDate || !editAmount}
                className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-8 font-bold shadow-sm"
              >
                {isEditing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}