"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Plus, Pencil, Landmark, Wallet, X, Loader2 } from "lucide-react"
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

interface BankAccountDTO {
  id: number
  name: string
  balance: number
}

export default function BankAccountsPage() {
  const [mainTab, setMainTab] = useState<"CONTAS" | "CENTRO_CUSTOS">("CONTAS")
  
  // Estados da API
  const [accounts, setAccounts] = useState<BankAccountDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Estados para o Modal de Adicionar
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [accountName, setAccountName] = useState("")
  const [initialBalance, setInitialBalance] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 🚨 Estados para o Modal de Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [accountToEdit, setAccountToEdit] = useState<BankAccountDTO | null>(null)
  const [editAccountName, setEditAccountName] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const response = await api.get("/bank")
        setAccounts(response.data)
      } catch (error) {
        console.error("Erro ao buscar contas bancárias:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAccounts()
  }, [])

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountName || !initialBalance) return

    setIsSubmitting(true)
    try {
      const response = await api.post("/bank", { 
        name: accountName, 
        balance: parseFloat(initialBalance.replace(",", "."))
      })
      
      setAccounts((prevAccounts) => [...prevAccounts, response.data])

      setAccountName("")
      setInitialBalance("")
      setIsAddModalOpen(false)
    } catch (error) {
      console.error("Erro ao criar conta bancária:", error)
      alert("Não foi possível criar a conta bancária.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 🚨 Lógica para abrir o Modal de Edição já preenchido
  const openEditModal = (account: BankAccountDTO) => {
    setAccountToEdit(account)
    setEditAccountName(account.name)
    setIsEditModalOpen(true)
  }

  // 🚨 Função que envia o PATCH para o Java
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountToEdit || !editAccountName) return

    setIsEditing(true)
    try {
      // O Spring/Jackson vai mapear "bankAccountName" para o seu "BankAccountName" do DTO
      const response = await api.patch(`/bank/${accountToEdit.id}`, {
        bankAccountName: editAccountName
      })
      
      // Atualiza apenas a conta editada na lista atual da tela
      setAccounts((prevAccounts) => 
        prevAccounts.map(acc => acc.id === accountToEdit.id ? response.data : acc)
      )

      setIsEditModalOpen(false)
      setAccountToEdit(null)
      setEditAccountName("")
    } catch (error) {
      console.error("Erro ao atualizar conta bancária:", error)
      alert("Não foi possível atualizar o nome da conta.")
    } finally {
      setIsEditing(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-8 bg-slate-50/50 min-h-screen relative">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configuração do Financeiro</h1>
        <p className="text-sm text-slate-500 mt-1">
          Nesta seção você pode configurar os principais parâmetros para utilização do módulo financeiro.
        </p>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setMainTab("CONTAS")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            mainTab === "CONTAS" 
              ? "border-blue-500 text-slate-900" 
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Contas Bancárias
        </button>
      </div>

      {mainTab === "CONTAS" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          
          <div className="flex justify-end p-4 border-b border-slate-100">
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar conta
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-600">Nome da Conta / Banco</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right">Saldo Atual</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-center w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                      Carregando contas...
                    </TableCell>
                  </TableRow>
                ) : accounts.length > 0 ? (
                  accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-md text-slate-500">
                            {account.name?.toLowerCase().includes("gaveta") || account.name?.toLowerCase().includes("caixa") ? (
                              <Wallet className="w-4 h-4" />
                            ) : (
                              <Landmark className="w-4 h-4" />
                            )}
                          </div>
                          {account.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-slate-600 font-medium">
                        R$ {account.balance.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {/* 🚨 Botão Edit chamando a função */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEditModal(account)}
                          className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar nome da conta"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-slate-500">
                      Nenhuma conta cadastrada ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* MODAL DE ADICIONAR CONTA BANCÁRIA */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Nova Conta Bancária</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount}>
              <div className="p-6 space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nome da conta / Banco
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Ex: Nubank PJ, Caixa Físico"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Valor Inicial (Saldo)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-sm text-slate-400 font-medium">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(e.target.value)}
                      className="pl-9 h-11"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">O saldo inicial não poderá ser alterado depois.</p>
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
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar conta"}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 🚨 MODAL DE EDITAR NOME DA CONTA BANCÁRIA */}
      {isEditModalOpen && accountToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                Editar Conta
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAccount}>
              <div className="p-6 space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nome da conta / Banco
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Ex: Nubank PJ, Caixa Físico"
                    value={editAccountName}
                    onChange={(e) => setEditAccountName(e.target.value)}
                    className="h-11 font-medium text-slate-900"
                  />
                </div>

                {/* Exibindo o saldo atual apenas como informativo (read-only) */}
                <div className="bg-slate-50 p-3 rounded-md border border-slate-100 flex justify-between items-center mt-4">
                  <span className="text-sm font-medium text-slate-500">Saldo Atual (Bloqueado)</span>
                  <span className="text-sm font-bold text-slate-700">R$ {accountToEdit.balance.toFixed(2)}</span>
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
                  disabled={isEditing || editAccountName === accountToEdit.name}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-5 font-medium shadow-sm"
                >
                  {isEditing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}