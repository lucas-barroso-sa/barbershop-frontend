"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  DollarSign,
  X,
  UserPlus, // Importados para o Modal
  Phone,    // Importados para o Modal
  Mail      // Importados para o Modal
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

function SchedulingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialDate = searchParams.get("date") || new Date().toISOString().split('T')[0]

  // Estados do Formulário Principal
  const [date, setDate] = useState(initialDate)
  const [time, setTime] = useState("")
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([])
  const [scheduleValue, setScheduleValue] = useState<string>("0.00")
  
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

  // 🚨 Estados do Modal de Novo Cliente
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [newClientName, setNewClientName] = useState("")
  const [newClientPhone, setNewClientPhone] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [isCreatingClient, setIsCreatingClient] = useState(false)

  useEffect(() => {
    async function loadFormData() {
      try {
        const [clientsRes, usersRes, servicesRes] = await Promise.all([
          api.get('/clients'),
          api.get('/users'),
          api.get('/servicings')
        ])

        setDbClients(clientsRes.data)
        setDbBarbers(usersRes.data)
        setDbServices(servicesRes.data)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsFetchingData(false)
      }
    }
    loadFormData()
  }, [])

  useEffect(() => {
    const sum = selectedServiceIds.reduce((acc, id) => {
      const srv = dbServices.find(s => s.id === id)
      return acc + (srv ? srv.price : 0)
    }, 0)
    setScheduleValue(sum.toFixed(2))
  }, [selectedServiceIds, dbServices])

  const handleAddService = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value)
    if (!selectedServiceIds.includes(id)) {
      setSelectedServiceIds([...selectedServiceIds, id])
    }
  }

  const handleRemoveService = (idToRemove: number) => {
    setSelectedServiceIds(selectedServiceIds.filter(id => id !== idToRemove))
  }

  const filteredClients = dbClients.filter(c => 
    (c.name || "").toLowerCase().includes(clientSearch.toLowerCase())
  )
  
  const filteredBarbers = dbBarbers.filter(b => 
    (b.name || "").toLowerCase().includes(barberSearch.toLowerCase())
  )

  // Submissão do Agendamento Principal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedClient || !selectedBarber || selectedServiceIds.length === 0 || !time || !scheduleValue) {
      alert("Por favor, preencha todos os campos obrigatórios (incluindo pelo menos um serviço e o valor).")
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        clientId: selectedClient.id,
        userId: selectedBarber.id,           
        servicingIds: selectedServiceIds, 
        appointmentTime: `${date}T${time}:00`,
        scheduleValue: parseFloat(scheduleValue)
      }

      await api.post('/schedules', payload)
      setIsSuccess(true)
      setTimeout(() => router.push('/agenda'), 2000)

    } catch (error) {
      console.error("Erro ao agendar:", error)
      alert("Erro ao salvar agendamento. Verifique se o horário está disponível.")
    } finally {
      setIsLoading(false)
    }
  }

  // 🚨 Função para Criar o Novo Cliente via Modal
  const handleCreateClient = async () => {
    if (!newClientName || !newClientPhone) {
      alert("Nome e telefone são obrigatórios para cadastrar o cliente.")
      return
    }

    setIsCreatingClient(true)

    try {
      const response = await api.post('/clients', {
        name: newClientName,
        phone: newClientPhone,
        email: newClientEmail
      })

      const createdClient = response.data

      // Atualiza a lista, seleciona o cliente criado e limpa o modal
      setDbClients(prev => [...prev, createdClient])
      setSelectedClient(createdClient)
      setClientSearch(createdClient.name)
      
      setIsClientModalOpen(false)
      setNewClientName("")
      setNewClientPhone("")
      setNewClientEmail("")

    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error)
      alert("Erro ao cadastrar cliente. Verifique os dados.")
    } finally {
      setIsCreatingClient(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md text-center p-8 mx-auto border-none shadow-2xl">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900">Agendamento Confirmado!</CardTitle>
        <CardDescription className="text-lg mt-2">
          Horário reservado com sucesso para {selectedClient?.name}.
        </CardDescription>
      </Card>
    )
  }

  if (isFetchingData) {
    return (
      <Card className="shadow-lg border-none py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium animate-pulse">Sincronizando com o banco de dados...</p>
      </Card>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Card className="shadow-lg border-none">
          <CardHeader className="bg-slate-900 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" /> Detalhes da Reserva
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-8 pt-6">
            
            {/* --- BLOCO 1: CLIENTE E PROFISSIONAL --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Campo Cliente */}
              <div className="space-y-2 relative">
                {/* 🚨 Aqui está a alteração (Label + Botão de Modal) */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-slate-700">Buscar Cliente</Label>
                  <button 
                    type="button" 
                    onClick={() => setIsClientModalOpen(true)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-all"
                  >
                    + Novo Cliente
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Nome do cliente..." 
                    className="pl-10 h-12 focus-visible:ring-slate-900"
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
                    {filteredClients.length === 0 && (
                      <li className="p-3 text-sm text-slate-500 text-center">
                        Nenhum cliente encontrado.
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Campo Barbeiro */}
              <div className="space-y-2 relative">
                <Label className="text-sm font-bold text-slate-700">Selecionar Profissional</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Nome do profissional..." 
                    className="pl-10 h-12 focus-visible:ring-slate-900"
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
                  className="h-12 focus-visible:ring-slate-900"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Horário</Label>
                <Input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-12 focus-visible:ring-slate-900"
                  required
                />
              </div>
            </div>

            {/* --- BLOCO 3: SESSÃO FINANCEIRA --- */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 mb-6">
                <DollarSign className="w-5 h-5 text-green-600" />
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
                            className="bg-slate-200 text-slate-800 hover:bg-slate-300 border-none flex items-center gap-2 py-1.5 px-3 text-sm"
                          >
                            {srv.name} - R$ {srv.price.toFixed(2)}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveService(id)} 
                              className="hover:bg-slate-400 rounded-full p-0.5 transition-colors"
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
                      className="flex h-12 w-full items-center rounded-md border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      onChange={handleAddService}
                      value="" 
                    >
                      <option value="" disabled>+ Adicionar serviço...</option>
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
                      className="pl-12 h-12 text-lg font-black text-green-700 bg-green-50 border-green-200 focus-visible:ring-green-600"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Você pode editar este valor para aplicar descontos ou acréscimos.
                  </p>
                </div>
              </div>
            </div>

          </CardContent>

          <CardFooter className="bg-slate-50 rounded-b-lg border-t p-6 flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800 px-8 h-12 font-bold" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...</> : "Confirmar Reserva"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* 🚨 MODAL DE NOVO CLIENTE (Fora da tag form principal) */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl border-none animate-in fade-in zoom-in duration-200">
            <CardHeader className="bg-slate-900 text-white rounded-t-lg flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" /> Novo Cliente
                </CardTitle>
                <CardDescription className="text-slate-300 mt-1">
                  Cadastro rápido para o agendamento
                </CardDescription>
              </div>
              <button 
                onClick={() => setIsClientModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="name" 
                    placeholder="Ex: João Silva" 
                    className="pl-10 h-11"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    disabled={isCreatingClient}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold">Telefone / WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="phone" 
                    placeholder="(85) 99999-9999" 
                    className="pl-10 h-11"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    disabled={isCreatingClient}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">E-mail (Opcional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="joao@email.com" 
                    className="pl-10 h-11"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    disabled={isCreatingClient}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50 rounded-b-lg border-t p-4 flex justify-end gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsClientModalOpen(false)}
                disabled={isCreatingClient}
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                onClick={handleCreateClient}
                className="bg-slate-900 hover:bg-slate-800 font-bold"
                disabled={isCreatingClient}
              >
                {isCreatingClient ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                ) : (
                  "Cadastrar e Selecionar"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  )
}

export default function NewSchedulingPage() {
  const router = useRouter()

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Novo Agendamento</h1>
          <p className="text-slate-500">Configure os detalhes do novo horário</p>
        </div>
      </div>

      <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-400" /></div>}>
        <SchedulingForm />
      </Suspense>
    </div>
  )
}