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
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

  // Estados do Formulário
  const [date, setDate] = useState(initialDate)
  const [time, setTime] = useState("")
  const [serviceId, setServiceId] = useState("")
  
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

  // Carrega os dados iniciais
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

  const filteredClients = dbClients.filter(c => 
    (c.name || "").toLowerCase().includes(clientSearch.toLowerCase())
  )
  
  const filteredBarbers = dbBarbers.filter(b => 
    (b.name || "").toLowerCase().includes(barberSearch.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedClient || !selectedBarber || !serviceId || !time) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setIsLoading(true)

    try {
      // Payload corrigido para bater com o ScheduleInsertDTO do Java
      const payload = {
        clientId: selectedClient.id,
        userId: selectedBarber.id,           // De acordo com o erro: userId
        servicingIds: [parseInt(serviceId)], // De acordo com o erro: servicingIds (List)
        appointmentTime: `${date}T${time}:00` // De acordo com o erro: appointmentTime
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
    <form onSubmit={handleSubmit}>
      <Card className="shadow-lg border-none">
        <CardHeader className="bg-slate-900 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" /> Detalhes da Reserva
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Campo Cliente */}
            <div className="space-y-2 relative">
              <Label className="text-sm font-bold text-slate-700">Buscar Cliente</Label>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
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

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Serviço</Label>
              <div className="relative">
                <Scissors className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <select 
                  className="flex h-12 w-full items-center rounded-md border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                >
                  <option value="" disabled>Escolha um serviço</option>
                  {dbServices.map(srv => (
                    <option key={srv.id} value={srv.id}>{srv.name} - R$ {srv.price.toFixed(2)}</option>
                  ))}
                </select>
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