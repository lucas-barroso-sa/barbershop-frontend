"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import api from "@/lib/api" // Ajuste o caminho da sua instância do Axios se necessário
import { Plus, MoreVertical, Landmark, Wallet, X, Loader2 } from "lucide-react"
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

// Interface espelhando exatamente o seu BankAccountDTO do Java
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
  
  // Estados para o Modal e Formulário
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [accountName, setAccountName] = useState("")
  const [initialBalance, setInitialBalance] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Busca inicial das contas (GET /bank)
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

  // 2. Envio do Formulário para o Back-end (POST /bank)
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountName || !initialBalance) return

    setIsSubmitting(true)
    try {
      const response = await api.post("/bank", { 
        name: accountName, 
        balance: parseFloat(initialBalance.replace(",", "."))
      })
      
      // Atualiza a lista na tela com o retorno do Java
      setAccounts((prevAccounts) => [...prevAccounts, response.data])

      // Limpa e fecha o modal
      setAccountName("")
      setInitialBalance("")
      setIsAddModalOpen(false)
      
    } catch (error) {
      console.error("Erro ao criar conta bancária:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-8 bg-slate-50/50 min-h-screen relative">
      
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configuração do Financeiro</h1>
        <p className="text-sm text-slate-500 mt-1">
          Nesta seção você pode configurar os principais parâmetros para utilização do módulo financeiro.
        </p>
      </div>

      {/* NAVEGAÇÃO DE ABAS PRINCIPAIS */}
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

      {/* CONTEÚDO DA ABA: CONTAS BANCÁRIAS */}
      {mainTab === "CONTAS" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          
          {/* BARRA DE FERRAMENTAS (Apenas com o botão de adicionar alinhado à direita) */}
          <div className="flex justify-end p-4 border-b border-slate-100">
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar conta
            </Button>
          </div>

          {/* TABELA DE DADOS */}
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
                            {account.name.toLowerCase().includes("gaveta") || account.name.toLowerCase().includes("caixa") ? (
                              <Wallet className="w-4 h-4" />
                            ) : (
                              <Landmark className="w-4 h-4" />
                            )}
                          </div>
                          {account.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-slate-600">
                        R$ {account.balance.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                          <MoreVertical className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                  {isSubmitting ? "Salvando..." : "Salvar conta"}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}