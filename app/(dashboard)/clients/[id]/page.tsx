"use client"

import * as React from "react"
import { useState, useEffect, use } from "react"
import api from "@/lib/api"
import { Calendar, History, DollarSign, Settings, Plus, FileText, Loader2, Clock, Scissors, UserCheck, Edit2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input" // 🚨 Importamos o Input

interface ClientMinDTO {
  id: number
  name: string
  phone?: string
  email?: string
}

interface ScheduleMinDTO {
  id: number
  clientName: string
  barberName: string
  serviceNames: string[]
  appointmentTime: any
  scheduleValue: number
  scheduleStatus: string
}

export default function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [activeTab, setActiveTab] = useState("cadastro") // Mudei o padrão temporariamente para você testar
  const [client, setClient] = useState<ClientMinDTO | null>(null)
  const [schedules, setSchedules] = useState<ScheduleMinDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // --- NOVOS ESTADOS PARA EDIÇÃO ---
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" })

  useEffect(() => {
    const fetchClientData = async () => {
      setIsLoading(true)
      try {
        const [clientResponse, schedulesResponse] = await Promise.all([
          api.get(`/clients/${id}`),
          api.get(`/schedules/client/${id}`)
        ])
        
        setClient(clientResponse.data)
        setSchedules(schedulesResponse.data)
      } catch (error) {
        console.error("Erro ao carregar dados do cliente:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClientData()
  }, [id])

  // --- FUNÇÕES DE CONTROLE DE FORMULÁRIO ---
  const handleEditClick = () => {
    if (client) {
      setFormData({
        name: client.name,
        phone: client.phone || "",
        email: client.email || ""
      })
      setIsEditing(true)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Bate no endpoint PUT que você criou no Java
      const response = await api.put(`/clients/${id}`, formData)
      
      // Atualiza o estado da tela com os novos dados devolvidos pelo Spring Boot
      setClient(response.data)
      setIsEditing(false)
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error)
      // Aqui no futuro você pode colocar um toast/alerta de erro
    } finally {
      setIsSaving(false)
    }
  }

  const formatDateTime = (dataDoBanco: any) => {
    if (!dataDoBanco) return { date: "--/--/----", time: "--:--" }
    let year, month, day, hour, minute
    if (Array.isArray(dataDoBanco)) {
      [year, month, day, hour, minute] = dataDoBanco
      minute = minute || 0 
    } else {
      const d = new Date(dataDoBanco)
      year = d.getFullYear(); month = d.getMonth() + 1; day = d.getDate(); hour = d.getHours(); minute = d.getMinutes()
    }
    const dateStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    return { date: dateStr, time: timeStr }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-600" />
        <p className="font-medium animate-pulse text-lg">Carregando prontuário...</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <UserCheck className="w-16 h-16 mb-4 opacity-20" />
        <p className="font-medium text-lg">Cliente não encontrado.</p>
      </div>
    )
  }

  const lastAppointmentStr = schedules.length > 0 
    ? formatDateTime(schedules[schedules.length - 1].appointmentTime).date 
    : "Nunca agendado"

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4 lg:p-8">
      
      {/* Header Dinâmico */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-4xl font-bold shadow-inner">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 capitalize">
                  {client.name} <span className="text-sm text-slate-400 font-normal">#{client.id}</span>
                </h1>
                <button className="text-orange-400 hover:text-orange-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Último agendamento: <span className="text-slate-800">{lastAppointmentStr}</span>
              </p>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6">
            <Calendar className="w-4 h-4" />
            Agendar
          </Button>
        </CardContent>
      </Card>

      {/* Abas */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-8 px-2" aria-label="Tabs">
          <button onClick={() => setActiveTab("historico")} className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-semibold text-sm transition-colors ${activeTab === "historico" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            <History className="w-4 h-4" /> Histórico
          </button>
          
          <button onClick={() => setActiveTab("cadastro")} className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-semibold text-sm transition-colors ${activeTab === "cadastro" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            <Settings className="w-4 h-4" /> Cadastro
          </button>
        </nav>
      </div>

      <div className="pt-2">
        {/* ABA: HISTÓRICO (Ocultado por brevidade, código idêntico ao anterior) */}
        {activeTab === "historico" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Atendimentos</h2>
                <Badge variant="secondary" className="font-bold">{schedules.length} registros</Badge>
              </div>
  
              {schedules.length > 0 ? (
                <div className="grid gap-3">
                  {schedules.map((schedule) => {
                    const { date, time } = formatDateTime(schedule.appointmentTime)
                    return (
                      <Card key={schedule.id} className="hover:border-slate-300 transition-all shadow-sm border-l-4 border-l-slate-800">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-start gap-4">
                            <div className="bg-slate-100 text-slate-600 p-3 rounded-lg mt-1">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-slate-900">{date}</span>
                                <span className="text-sm text-slate-500 font-medium">às {time}</span>
                              </div>
                              <p className="text-sm text-slate-600 flex items-center gap-1 mb-2">
                                <UserCheck className="w-3 h-3" /> Profissional: {schedule.barberName}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {schedule.serviceNames.map((service, idx) => (
                                  <Badge key={idx} variant="outline" className="text-[10px] bg-slate-50">
                                    <Scissors className="w-3 h-3 mr-1" /> {service}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-700">R$ {schedule.scheduleValue.toFixed(2)}</p>
                            <span className="text-xs text-slate-400">Concluído</span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-medium text-slate-500">Não há agendamentos registrados para este cliente.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

        

        {/* 🚨 ABA: CADASTRO COM EDIÇÃO HABILITADA */}
        {activeTab === "cadastro" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Dados do Cliente</h2>
              {!isEditing && (
                <Button onClick={handleEditClick} variant="outline" size="sm" className="flex gap-2">
                  <Edit2 className="w-4 h-4" /> Editar
                </Button>
              )}
            </div>
            
            <Card className="shadow-sm">
              <CardContent className="p-6">
                
                {isEditing ? (
                  // MODO DE EDIÇÃO
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Nome Completo</label>
                        <Input 
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ex: João Silva"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Telefone</label>
                        <Input 
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-slate-700">E-mail</label>
                        <Input 
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="joao@email.com"
                          type="email"
                        />
                      </div>
                    </div>
                    
                    {/* Botões de Ação */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <Button onClick={handleCancelEdit} variant="ghost" className="flex gap-2 text-slate-600" disabled={isSaving}>
                        <X className="w-4 h-4" /> Cancelar
                      </Button>
                      <Button onClick={handleSave} className="flex gap-2 bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? "Salvando..." : "Salvar Alterações"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // MODO DE VISUALIZAÇÃO
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Nome Completo</p>
                      <p className="font-semibold text-slate-900">{client.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Telefone</p>
                      <p className="font-semibold text-slate-900">{client.phone || "Não informado"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-slate-500 mb-1">E-mail</p>
                      <p className="font-semibold text-slate-900">{client.email || "Não informado"}</p>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  )
}