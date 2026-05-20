"use client"

import * as React from "react"
import { useState } from "react"
import { Calendar, History, DollarSign, Settings, Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// O Next.js injeta os 'params' automaticamente aqui.
// Se a URL for /clients/15, o params.id será "15".
export default function ClientDetailsPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("historico")

  // Aqui no futuro você usará o params.id para buscar os dados reais na sua API:
  // ex: const response = await api.get(`/clients/${params.id}`)
  
  // Por enquanto, usamos o mock e injetamos o ID da URL nele
  const mockClient = {
    id: params.id,
    name: "Dayanara",
    lastAppointment: "12/04/2026",
    status: "Ativo",
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4 lg:p-8">
      
      {/* Header do Cliente */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-3xl font-bold shadow-inner">
              {mockClient.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 capitalize">
                  {mockClient.name} <span className="text-sm text-slate-400 font-normal">#{mockClient.id}</span>
                </h1>
                <button className="text-orange-400 hover:text-orange-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </button>
              </div>
              
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Último agendamento: <span className="text-slate-800">{mockClient.lastAppointment}</span>
              </p>
            </div>
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6">
            <Calendar className="w-4 h-4" />
            Agendar
          </Button>
        </CardContent>
      </Card>

      {/* Navegação de Abas (Tabs) */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-8 px-2" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("historico")}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === "historico"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <History className="w-4 h-4" />
            Histórico
          </button>
          
          <button
            onClick={() => setActiveTab("contas")}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === "contas"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Contas
          </button>

          <button
            onClick={() => setActiveTab("cadastro")}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === "cadastro"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Settings className="w-4 h-4" />
            Cadastro
          </button>
        </nav>
      </div>

      {/* Área de Conteúdo */}
      <div className="pt-2">
        {activeTab === "historico" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Atendimentos</h2>
            <Card className="border-dashed border-2 border-slate-200 bg-slate-50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
                <FileText className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium text-slate-500">Não há agendamentos registrados para este cliente.</p>
                <Button variant="outline" className="mt-4 flex gap-2">
                  <Plus className="w-4 h-4" />
                  Criar primeiro agendamento
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "contas" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Histórico Financeiro</h2>
            <Card className="border-dashed border-2 border-slate-200 bg-slate-50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
                <p className="font-medium text-slate-500">Nenhuma movimentação financeira encontrada.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "cadastro" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Dados do Cliente</h2>
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <p className="text-slate-500">Formulário de edição de cadastro entrará aqui.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}