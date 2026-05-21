"use client"

import { useState, useEffect, Suspense, use } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { 
  Calendar as CalendarIcon, 
  User, 
  Scissors, 
  Clock, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2,
  Search,
  Save,
  DollarSign, // 🚨 Importado o ícone de dinheiro
  X 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function EditSchedulingForm({ scheduleId }: { scheduleId: string }) {
  const router = useRouter()

  // Estados do Formulário
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  
  // Estados de Serviços e Financeiro
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([])
  const [scheduleValue, setScheduleValue] = useState<string>("0.00") // 🚨 Estado do Valor Cobrado
  
  // Dados vindos da API
  const [dbClients, setDbClients] = useState<any[]>([])
  const [dbBarbers, setDbBarbers] = useState<any[]>([])
  const [dbServices, setDbServices] = useState<any[]>([])
  const [isFetchingData, setIsFetchingData] = useState(true)

  // Estados dos Autocompletes
  const [clientSearch, setClientSearch] = useState("")
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [isClientOpen, setIsClientOpen] = useState(false)

  const [barberSearch, setBarberSearch] = useState("")
  const [selectedBarber, setSelectedBarber] = useState<any>(null)
  const [isBarberOpen, setIsBarberOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    async function loadAllData() {
      try {
        const [clientsRes, usersRes, servicesRes, scheduleRes] = await Promise.all([
          api.get('/clients'),
          api.get('/users'),
          api.get('/servicings'),
          api.get(`/schedules/${scheduleId}`)
        ])

        const schedule = scheduleRes.data

        // Popula os catálogos
        setDbClients(clientsRes.data)
        setDbBarbers(usersRes.data)
        setDbServices(servicesRes.data)
        
        if (schedule.appointmentTime) {
            const [datePart, timePart] = schedule.appointmentTime.split('T')
            setDate(datePart) 
            setTime(timePart.substring(0, 5)) 
        }
        
        setSelectedClient(schedule.client)
        setSelectedBarber(schedule.user) 
        
        // Popula serviços
        if (schedule.servicings && schedule.servicings.length > 0) {
            const loadedServiceIds = schedule.servicings.map((srv: any) => srv.id)
            setSelectedServiceIds(loadedServiceIds)
        }

        // 🚨 Popula o Valor Financeiro (com fallback para agendamentos antigos sem o campo)
        if (schedule.scheduleValue !== undefined && schedule.scheduleValue !== null) {
            setScheduleValue(Number(schedule.scheduleValue).toFixed(2))
        } else if (schedule.servicings) {
            const fallbackSum = schedule.servicings.reduce((acc: number, srv: any) => acc + (srv.price || 0), 0)
            setScheduleValue(fallbackSum.toFixed(2))
        }

      } catch (error) {
        console.error("Erro ao carregar dados do agendamento:", error)
        alert("Não foi possível carregar os dados deste agendamento.")
        router.push('/agenda')
      } finally {
        setIsFetchingData(false)
      }
    }
    
    loadAllData()
  }, [scheduleId, router])

  // 🚨 Adição Inteligente: Soma ao valor atual preservando possíveis descontos
  const handleAddService = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value)
    if (!selectedServiceIds.includes(id)) {
      setSelectedServiceIds([...selectedServiceIds, id])
      
      const srv = dbServices.find(s => s.id === id)
      if (srv) {
        setScheduleValue(prev => (parseFloat(prev || "0") + srv.price).toFixed(2))
      }
    }
  }

  // 🚨 Remoção Inteligente: Subtrai do valor atual
  const handleRemoveService = (idToRemove: number) => {
    setSelectedServiceIds(selectedServiceIds.filter(id => id !== idToRemove))
    
    const srv = dbServices.find(s => s.id === idToRemove)
    if (srv) {
      setScheduleValue(prev => Math.max(0, parseFloat(prev || "0") - srv.price).toFixed(2))
    }
  }

  const filteredClients = dbClients.filter(c => 
    (c.name || "").toLowerCase().includes(clientSearch.toLowerCase())
  )
  
  const filteredBarbers = dbBarbers.filter(b => 
    (b.name || "").toLowerCase().includes(barberSearch.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedClient || !selectedBarber || selectedServiceIds.length === 0 || !time || !scheduleValue) {
      alert("Por favor, preencha todos os campos obrigatórios (incluindo ao menos um serviço e o valor).")
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        clientId: selectedClient.id,
        userId: selectedBarber.id,
        servicingIds: selectedServiceIds, 
        appointmentTime: `${date}T${time}:00`,
        scheduleValue: parseFloat(scheduleValue) // 🚨 Enviando o valor final atualizado para o PUT
      }

      await api.put(`/schedules/${scheduleId}`, payload)
      
      setIsSuccess(true)
      setTimeout(() => router.push('/agenda'), 2000)

    } catch (error) {
      console.error("Erro ao atualizar:", error)
      alert("Erro ao salvar alterações. Verifique os dados.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md text-center p-8 mx-auto border-none shadow-2xl">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-blue-500 animate-bounce" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900">Alterações Salvas!</CardTitle>
        <CardDescription className="text-lg mt-2">
          O agendamento de {selectedClient?.name} foi atualizado.
        </CardDescription>
      </Card>
    )
  }

  if (isFetchingData) {
    return (
      <Card className="shadow-lg border-none py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-600" />
        <p className="font-medium animate-pulse">Recuperando informações do agendamento...</p>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-lg border-none">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" /> Editar Agendamento #{scheduleId}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8 pt-6">
          
          {/* --- BLOCO 1: CLIENTE E PROFISSIONAL --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <Label className="text-sm font-bold text-slate-700">Cliente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Nome do cliente..." 
                  className="pl-10 h-12 focus-visible:ring-blue-600"
                  value={selectedClient ? selectedClient.name : clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value)
                    setSelectedClient(null)
                    setIsClientOpen(true)
                  }}
                  onFocus={() => setIsClientOpen(true)}
                  onBlur={() => setTimeout(() => setIsClientOpen(false), 200)}
                />
              </div>
              {isClientOpen && clientSearch && !selectedClient && (
                <ul className="absolute z-10 w-full bg-white border border-slate-200 shadow-xl rounded-md mt-1 max-h-48 overflow-auto">
                  {filteredClients.map(client => (
                    <li 
                      key={client.id}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setSelectedClient(client)
                        setClientSearch("")
                        setIsClientOpen(false)
                      }}
                      className="p-3 hover:bg-slate-100 cursor-pointer text-sm font-medium text-slate-700 border-b last:border-0"
                    >
                      {client.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2 relative">
              <Label className="text-sm font-bold text-slate-700">Profissional</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Nome do profissional..." 
                  className="pl-10 h-12 focus-visible:ring-blue-600"
                  value={selectedBarber ? selectedBarber.name : barberSearch}
                  onChange={(e) => {
                    setBarberSearch(e.target.value)
                    setSelectedBarber(null)
                    setIsBarberOpen(true)
                  }}
                  onFocus={() => setIsBarberOpen(true)}
                  onBlur={() => setTimeout(() => setIsBarberOpen(false), 200)}
                />
              </div>
              {isBarberOpen && barberSearch && !selectedBarber && (
                <ul className="absolute z-10 w-full bg-white border border-slate-200 shadow-xl rounded-md mt-1 max-h-48 overflow-auto">
                  {filteredBarbers.map(barber => (
                    <li 
                      key={barber.id}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setSelectedBarber(barber)
                        setBarberSearch("")
                        setIsBarberOpen(false)
                      }}
                      className="p-3 hover:bg-slate-100 cursor-pointer text-sm font-medium text-slate-700 border-b last:border-0"
                    >
                      {barber.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* --- BLOCO 2: DATA E HORA --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Data</Label>
              <Input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 focus-visible:ring-blue-600"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Horário</Label>
              <Input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-12 focus-visible:ring-blue-600"
                required
              />
            </div>
          </div>

          {/* 🚨 --- BLOCO 3: SESSÃO FINANCEIRA --- */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 mb-6">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Serviços e Financeiro
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="md:col-span-2 space-y-3">
                <Label className="text-sm font-bold text-slate-700">Serviços Executados</Label>

                {selectedServiceIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-md border border-slate-100 min-h-[48px]">
                    {selectedServiceIds.map(id => {
                      const srv = dbServices.find(s => s.id === id)
                      if (!srv) return null
                      
                      return (
                        <Badge 
                          key={id} 
                          variant="secondary" 
                          className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none flex items-center gap-2 py-1.5 px-3 text-sm"
                        >
                          {srv.name} - R$ {srv.price.toFixed(2)}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveService(id)} 
                            className="hover:bg-blue-300 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                )}

                <div className="relative">
                  <Scissors className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <select 
                    className="flex h-12 w-full items-center rounded-md border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    onChange={handleAddService}
                    value="" 
                  >
                    <option value="" disabled>+ Adicionar outro serviço...</option>
                    {dbServices
                      .filter(srv => !selectedServiceIds.includes(srv.id))
                      .map(srv => (
                        <option key={srv.id} value={srv.id}>{srv.name} - R$ {srv.price.toFixed(2)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700">Valor Cobrado (R$)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-500 font-bold">R$</span>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={scheduleValue}
                    onChange={(e) => setScheduleValue(e.target.value)}
                    className="pl-12 h-12 text-lg font-black text-blue-700 bg-blue-50 border-blue-200 focus-visible:ring-blue-600"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Modifique este valor se houver alguma negociação especial neste atendimento.
                </p>
              </div>

            </div>
          </div>

        </CardContent>

        <CardFooter className="bg-slate-50 rounded-b-lg border-t p-6 flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isLoading}>
            Descartar
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8 h-12 font-bold text-white" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-5 w-5" /> Salvar Alterações</>}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

export default function EditSchedulingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Editar Agendamento</h1>
          <p className="text-slate-500">Modifique as informações do horário reservado</p>
        </div>
      </div>

      <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-400" /></div>}>
        <EditSchedulingForm scheduleId={id} />
      </Suspense>
    </div>
  )
}