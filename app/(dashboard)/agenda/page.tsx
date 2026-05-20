"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import api from "@/lib/api"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Plus, Loader2, CalendarIcon, Scissors, User, UserCheck } from "lucide-react"

interface ScheduleMinDTO {
  id: number
  clientName: string
  barberName: string
  serviceNames: string[]
  appointmentTime: any 
  price: number
}

export default function HomePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [schedules, setSchedules] = useState<ScheduleMinDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSchedules()
  }, [date])

  const formatDateToUrl = (d?: Date) => {
    if (!d) return ""
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const loadSchedules = async () => {
    setIsLoading(true)
    try {
      const selectedDateStr = formatDateToUrl(date)
      
      // 🚨 Chamada direta ao método findByDate passando a data como parâmetro
      // Ajuste o caminho '/daily' se o seu @RequestMapping for diferente
      const response = await api.get('/schedules', {
        params: { date: selectedDateStr }
      })
      
      // Como o Back-end já traz filtrado, apenas setamos o estado
      setSchedules(response.data)
      
    } catch (error) {
      console.error("Erro ao carregar agenda:", error)
      setSchedules([]) // Limpa a lista em caso de erro
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dataDoBanco: any) => {
    if (!dataDoBanco) return "--:--"
    if (Array.isArray(dataDoBanco)) {
      const hour = String(dataDoBanco[3]).padStart(2, '0')
      const minute = String(dataDoBanco[4] || 0).padStart(2, '0') 
      return `${hour}:${minute}`
    }
    try {
      const dateString = String(dataDoBanco)
      return dateString.includes('T') 
        ? dateString.split('T')[1].substring(0, 5) 
        : dateString.split(' ')[1].substring(0, 5)
    } catch (e) {
      return "--:--"
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-80 space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> Selecionar Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow-none"
            />
          </CardContent>
        </Card>

        <Button asChild className="w-full flex gap-2 font-bold py-6 shadow-md transition-all hover:scale-[1.02]">
          <Link href={`/agenda/new?date=${formatDateToUrl(date)}`}>
            <Plus className="w-5 h-5" /> Novo Agendamento
          </Link>
        </Button>
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Agenda: {date?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
          </h2>
          <Badge variant="secondary" className="px-3 py-1 font-bold">
            {schedules.length} Atendimentos
          </Badge>
        </div>

        <div className="grid gap-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-2" />
              <p className="font-medium animate-pulse">Sincronizando com o banco de dados...</p>
            </div>
          ) : schedules.length > 0 ? (
            schedules.map((appointment, index) => (
              <Card 
                key={appointment.id || `schedule-${index}`} 
                className="hover:border-slate-400 transition-all shadow-sm group border-l-4 border-l-slate-900"
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-start gap-5">
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-inner group-hover:bg-blue-600 transition-colors mt-1">
                      <Clock className="w-6 h-6" />
                    </div>
                    
                    <div>
                      <p className="text-xl font-black text-slate-900 mb-1">
                        {formatTime(appointment.appointmentTime)}
                      </p>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                          <User className="w-4 h-4 text-slate-400" />
                          {appointment.clientName}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                          <UserCheck className="w-4 h-4 text-slate-400" />
                          Profissional: {appointment.barberName}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {appointment.serviceNames?.map((service, srvIndex) => (
                          <Badge 
                            key={`service-${appointment.id}-${srvIndex}`} 
                            variant="secondary" 
                            className="text-[10px] uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200"
                          >
                            <Scissors className="w-3 h-3 mr-1" />
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-xl font-bold text-green-600">
                      R$ {appointment.price.toFixed(2)}
                    </p>
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      Confirmado
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed py-20">
              <CardContent className="flex flex-col items-center justify-center text-slate-400">
                <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium">Nenhum agendamento para este dia.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}