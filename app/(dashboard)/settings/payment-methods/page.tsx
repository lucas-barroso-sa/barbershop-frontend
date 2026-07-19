"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Plus, MoreVertical, CreditCard, Percent, CalendarClock, Landmark, X, Loader2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// 1. Interfaces baseadas no Back-end
interface BankAccountDTO {
  id: number
  name: string
  balance: number
}

interface PaymentMethodDTO {
  id: number
  name: string
  feePercentage: number
  daysToReceive: number
  defaultBankAccountName: string 
}

export default function PaymentMethodsPage() {
  const [mainTab, setMainTab] = useState<"METODOS">("METODOS")
  
  // Estados da API
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDTO[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccountDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Estados do Modal de Adicionar
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estados do Formulário de Adicionar
  const [name, setName] = useState("")
  const [feePercentage, setFeePercentage] = useState("")
  const [daysToReceive, setDaysToReceive] = useState("")
  const [bankAccountId, setBankAccountId] = useState("")

  // 🚨 Estados do Modal de Editar
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [methodToEdit, setMethodToEdit] = useState<PaymentMethodDTO | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Estados do Formulário de Editar
  const [editName, setEditName] = useState("")
  const [editFeePercentage, setEditFeePercentage] = useState("")
  const [editDaysToReceive, setEditDaysToReceive] = useState("")
  const [editBankAccountId, setEditBankAccountId] = useState("")

  // Carrega os dados iniciais
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [methodsResponse, accountsResponse] = await Promise.all([
          api.get("/payment-methods"),
          api.get("/bank")
        ])
        
        setPaymentMethods(methodsResponse.data)
        setBankAccounts(accountsResponse.data)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Envio do formulário de CRIAÇÃO (POST)
  const handleCreateMethod = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !feePercentage || !daysToReceive || !bankAccountId) return

    setIsSubmitting(true)
    try {
      const payload = {
        name: name,
        feePercentage: parseFloat(feePercentage.replace(",", ".")),
        daysToReceive: parseInt(daysToReceive, 10),
        defaultBankAccountId: parseInt(bankAccountId, 10) 
      }

      const response = await api.post("/payment-methods", payload)
      setPaymentMethods((prev) => [...prev, response.data])

      // Reseta o modal
      setName("")
      setFeePercentage("")
      setDaysToReceive("")
      setBankAccountId("")
      setIsAddModalOpen(false)
      
    } catch (error) {
      console.error("Erro ao criar método de pagamento:", error)
      alert("Erro ao salvar método.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 🚨 Lógica para preencher e abrir o Modal de Edição
  const openEditModal = (method: PaymentMethodDTO) => {
    setMethodToEdit(method)
    setEditName(method.name)
    setEditFeePercentage(method.feePercentage.toString())
    setEditDaysToReceive(method.daysToReceive.toString())
    
    // Truque: Como o DTO só devolve o nome da conta, buscamos o ID dela na lista de contas bancárias para preencher o <select>
    const linkedAccount = bankAccounts.find(acc => acc.name === method.defaultBankAccountName)
    setEditBankAccountId(linkedAccount ? linkedAccount.id.toString() : "")

    setIsEditModalOpen(true)
  }

  // 🚨 Envio do formulário de EDIÇÃO (PATCH)
  const handleUpdateMethod = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!methodToEdit || !editName || !editFeePercentage || !editDaysToReceive || !editBankAccountId) return

    setIsEditing(true)
    try {
      const payload = {
        name: editName,
        feePercentage: parseFloat(editFeePercentage.replace(",", ".")),
        daysToReceive: parseInt(editDaysToReceive, 10),
        defaultBankAccountId: parseInt(editBankAccountId, 10)
      }

      const response = await api.patch(`/payment-methods/${methodToEdit.id}`, payload)
      
      // Atualiza o item na tabela dinamicamente
      setPaymentMethods((prev) => 
        prev.map(m => m.id === methodToEdit.id ? response.data : m)
      )

      setIsEditModalOpen(false)
      setMethodToEdit(null)
    } catch (error) {
      console.error("Erro ao atualizar método de pagamento:", error)
      alert("Erro ao atualizar método.")
    } finally {
      setIsEditing(false)
    }
  }

  // Função auxiliar para renderizar o prazo
  const formatDays = (days: number) => {
    if (days === 0) return "Imediato (D+0)"
    if (days === 1) return "1 dia (D+1)"
    return `${days} dias (D+${days})`
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-8 bg-slate-50/50 min-h-screen relative">
      
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configuração do Financeiro</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie as taxas de maquininhas, prazos de recebimento e chaves Pix.
        </p>
      </div>

      {/* ABAS */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setMainTab("METODOS")}
          className="pb-3 px-4 text-sm font-medium border-b-2 border-blue-500 text-slate-900 transition-colors"
        >
          Métodos de Pagamento
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        
        {/* BARRA DE FERRAMENTAS */}
        <div className="flex justify-end p-4 border-b border-slate-100">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar método
          </Button>
        </div>

        {/* TABELA DE DADOS */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-600">Forma de Pagamento</TableHead>
                <TableHead className="font-semibold text-slate-600 text-center">Taxa (%)</TableHead>
                <TableHead className="font-semibold text-slate-600 text-center">Prazo</TableHead>
                <TableHead className="font-semibold text-slate-600">Conta Destino</TableHead>
                <TableHead className="font-semibold text-slate-600 text-center w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Carregando métodos...
                  </TableCell>
                </TableRow>
              ) : paymentMethods.length > 0 ? (
                paymentMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-md text-slate-500">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        {method.name}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center text-slate-600 font-medium">
                      <div className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded text-sm">
                        {method.feePercentage.toFixed(2)}%
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center text-slate-600">
                      <div className="inline-flex items-center gap-1.5 text-sm">
                        <CalendarClock className="w-4 h-4 text-slate-400" />
                        {formatDays(method.daysToReceive)}
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-600 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-slate-400" />
                        {method.defaultBankAccountName || "Não definida"}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      {/* 🚨 BOTÃO DE EDITAR (LÁPIS) */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEditModal(method)}
                        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Editar Método"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    Nenhum método de pagamento cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* =======================================
          MODAL DE ADICIONAR MÉTODO 
          ======================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Novo Método de Pagamento</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMethod}>
              <div className="p-6 space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nome da Máquina / Serviço
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Ex: Cartão de Crédito - Stone"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Taxa Cobrada
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="Ex: 3.5"
                        value={feePercentage}
                        onChange={(e) => setFeePercentage(e.target.value)}
                        className="pr-9 h-11"
                      />
                      <Percent className="absolute right-3 top-3.5 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Dias p/ Receber
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        required
                        placeholder="Ex: 30"
                        value={daysToReceive}
                        onChange={(e) => setDaysToReceive(e.target.value)}
                        className="pr-9 h-11"
                      />
                      <span className="absolute right-3 top-3 text-sm text-slate-400 font-medium">dias</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Conta de Destino Padrão
                  </label>
                  <select
                    required
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  >
                    <option value="" disabled>Selecione a conta bancária...</option>
                    {bankAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Para onde o dinheiro desta máquina vai quando for efetivado.
                  </p>
                </div>

              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="h-10 text-slate-600"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-5 font-medium shadow-sm"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Salvar método"}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* =======================================
          🚨 MODAL DE EDITAR MÉTODO 
          ======================================= */}
      {isEditModalOpen && methodToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                Editar Método de Pagamento
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMethod}>
              <div className="p-6 space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nome da Máquina / Serviço
                  </label>
                  <Input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-11 font-medium text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Taxa Cobrada
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={editFeePercentage}
                        onChange={(e) => setEditFeePercentage(e.target.value)}
                        className="pr-9 h-11"
                      />
                      <Percent className="absolute right-3 top-3.5 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Dias p/ Receber
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        required
                        value={editDaysToReceive}
                        onChange={(e) => setEditDaysToReceive(e.target.value)}
                        className="pr-9 h-11"
                      />
                      <span className="absolute right-3 top-3 text-sm text-slate-400 font-medium">dias</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Conta de Destino Padrão
                  </label>
                  <select
                    required
                    value={editBankAccountId}
                    onChange={(e) => setEditBankAccountId(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                  >
                    <option value="" disabled>Selecione a conta bancária...</option>
                    {bankAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isEditing}
                  className="h-10 text-slate-600"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isEditing}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-5 font-medium shadow-sm"
                >
                  {isEditing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Salvar Alterações"}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}