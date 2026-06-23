"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import api from "@/lib/api"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Plus, 
  Loader2, 
  CalendarIcon, 
  Scissors, 
  User, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Check, 
  ChevronDown,
  X,
  CreditCard,
  DollarSign
} from "lucide-react"

// Interfaces
interface ScheduleMinDTO {
  id: number
  clientName: string
  barberName: string
  serviceNames: string[]
  appointmentTime: any 
  scheduleValue: number
  scheduleStatus: string 
}

interface PaymentMethodDTO {
  id: number
  name: string
  feePercentage: number
  daysToReceive: number
}

// Configuração de Status
const STATUS_CONFIG: Record<string, { label: string, badgeClass: string, iconClass: string, colorClass: string, Icon: any }> = {
  CANCELLED: { 
    label: 'Cancelado', 
    badgeClass: 'bg-red-50 text-red-700 border-red-200', 
    iconClass: 'bg-red-500 text-white hover:bg-red-400',
    colorClass: 'text-red-500', 
    Icon: XCircle 
  },
  PENDING: { 
    label: 'Pendente', 
    badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
    iconClass: 'bg-slate-800 text-white hover:bg-slate-700',
    colorClass: 'text-orange-500', 
    Icon: Clock 
  },
  CONFIRMED: { 
    label: 'Confirmado', 
    badgeClass: 'bg-green-50 text-green-700 border-green-200', 
    iconClass: 'bg-green-600 text-white hover:bg-green-500',
    colorClass: 'text-green-500', 
    Icon: Check 
  },
  COMPLETED: { 
    label: 'Concluído', 
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', 
    iconClass: 'bg-blue-600 text-white hover:bg-blue-500',
    colorClass: 'text-blue-500', 
    Icon: CheckCircle2 
  },
}

export default function HomePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [schedules, setSchedules] = useState<ScheduleMinDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)

  // Estados do Checkout
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDTO[]>([])
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<ScheduleMinDTO | null>(null)
  
  // 🚨 Novos estados do Formulário de Checkout
  const [selectedPaymentId, setSelectedPaymentId] = useState("")
  const [amountPaid, setAmountPaid] = useState("")
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false)

  // Carrega agendamentos quando a data muda
  useEffect(() => {
    loadSchedules()
  }, [date])

  // Carrega os métodos de pagamento uma única vez para o modal
  useEffect(() => {
    api.get('/payment-methods')
      .then(res => setPaymentMethods(res.data))
      .catch(err => console.error("Erro ao carregar métodos de pagamento:", err))
  }, [])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

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
      const response = await api.get('/schedules', { params: { date: selectedDateStr } })
      setSchedules(response.data)
    } catch (error) {
      console.error("Erro ao carregar agenda:", error)
      setSchedules([]) 
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangeStatus = async (e: React.MouseEvent, appointment: ScheduleMinDTO, newStatus: string) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenDropdownId(null)

    if (appointment.scheduleStatus === newStatus) return

    // Se for concluir, prepara os dados e abre o Modal
    if (newStatus === 'COMPLETED') {
      setSelectedAppointment(appointment)
      // 🚨 Pré-preenche o campo "Valor Pago" com o valor original do agendamento
      setAmountPaid(appointment.scheduleValue.toFixed(2)) 
      setIsCheckoutModalOpen(true)
      return
    }

    try {
      await api.patch(`/schedules/${appointment.id}/status`, { status: newStatus })
      loadSchedules() 
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      alert("Não foi possível atualizar o status do agendamento.")
    }
  }

  // 🚨 Integração com a rota /financial-movements/checkout
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAppointment || !selectedPaymentId || !amountPaid) return

    setIsSubmittingCheckout(true)
    try {
      // Monta o payload exatamente como o CheckOutDTO no Java espera
      const payload = {
        scheduleId: selectedAppointment.id,
        paymentMethodId: parseInt(selectedPaymentId, 10),
        value: parseFloat(amountPaid.replace(",", ".")) // Valor real que o cliente passou no cartão
      }

      await api.post('/financial-movements/checkout', payload)
      
      // Sucesso: fecha o modal, limpa a seleção e recarrega a agenda
      setIsCheckoutModalOpen(false)
      setSelectedAppointment(null)
      setSelectedPaymentId("")
      setAmountPaid("")
      loadSchedules()
    } catch (error) {
      console.error("Erro no checkout:", error)
      alert("Erro ao finalizar o atendimento.")
    } finally {
      setIsSubmittingCheckout(false)
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
    <div className="flex flex-col lg:flex-row gap-6 relative">
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
            schedules.map((appointment, index) => {
              
              const currentStatus = STATUS_CONFIG[appointment.scheduleStatus] || STATUS_CONFIG['PENDING']
              const CurrentIcon = currentStatus.Icon

              return (
                <Link 
                  href={`/agenda/${appointment.id}`} 
                  key={appointment.id || `schedule-${index}`}
                  className="block"
                >
                  <Card className="hover:border-slate-400 transition-all shadow-sm group border-l-4 border-l-slate-900 cursor-pointer h-full overflow-visible">
                    <CardContent className="p-5 flex items-center justify-between">
                      
                      <div className="flex items-start gap-5">
                        <div className="relative mt-1">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              e.nativeEvent.stopImmediatePropagation()
                              setOpenDropdownId(openDropdownId === appointment.id ? null : appointment.id)
                            }}
                            title="Alterar Status"
                            className={`p-3 rounded-xl shadow-inner transition-colors flex items-center gap-1 hover:scale-105 active:scale-95 ${currentStatus.iconClass}`}
                          >
                            <CurrentIcon className="w-6 h-6" />
                            <ChevronDown className="w-3 h-3 opacity-70" />
                          </button>

                          {openDropdownId === appointment.id && (
                            <div className="absolute top-14 left-0 w-56 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl z-50 flex flex-col py-2 animate-in fade-in zoom-in-95 duration-100">
                              {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => (
                                <button
                                  key={statusKey}
                                  onClick={(e) => handleChangeStatus(e, appointment, statusKey)}
                                  className={`flex items-center gap-3 px-4 py-3 text-[15px] transition-colors w-full text-left
                                    ${appointment.scheduleStatus === statusKey ? 'bg-slate-50 font-bold text-slate-900' : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                  `}
                                >
                                  <config.Icon className={`w-5 h-5 ${config.colorClass}`} />
                                  {config.label}
                                </button>
                              ))}
                            </div>
                          )}
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
                        <p className={`text-xl font-bold ${appointment.scheduleStatus === 'COMPLETED' ? 'text-blue-600' : 'text-slate-600'}`}>
                          R$ {(appointment.scheduleValue || 0).toFixed(2)}
                        </p>
                        
                        <Badge className={currentStatus.badgeClass}>
                          {currentStatus.label}
                        </Badge>
                      </div>

                    </CardContent>
                  </Card>
                </Link>
              )
            })
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

      {/* 🚨 MODAL DE CHECKOUT FINANCEIRO */}
      {isCheckoutModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden transform transition-all">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" /> Finalizar Atendimento
              </h3>
              <button 
                onClick={() => {
                  setIsCheckoutModalOpen(false)
                  setSelectedPaymentId("")
                  setAmountPaid("")
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit}>
              <div className="p-6 space-y-6">
                
                {/* Resumo do Atendimento */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Cliente:</span>
                    <span className="text-slate-900 font-bold">{selectedAppointment.clientName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Serviços:</span>
                    <span className="text-slate-900 font-medium text-right max-w-[200px] truncate">
                      {selectedAppointment.serviceNames.join(", ")}
                    </span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-slate-700 font-bold">Valor de Tabela:</span>
                    <span className="text-lg text-slate-900 font-black">
                      R$ {selectedAppointment.scheduleValue.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Seleção do Método de Pagamento */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Forma de Pagamento Utilizada
                    </label>
                    <select
                      required
                      value={selectedPaymentId}
                      onChange={(e) => setSelectedPaymentId(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <option value="" disabled>Selecione como o cliente pagou...</option>
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name} {method.feePercentage > 0 ? `(Taxa: ${method.feePercentage}%)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 🚨 Campo de Valor Pago (Com permissão para descontos comerciais) */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Valor Efetivamente Pago
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-sm text-slate-500 font-bold">R$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        className="pl-9 h-11 border-slate-300 font-medium"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Altere o valor apenas se concedeu algum desconto especial ao cliente.
                    </p>
                  </div>
                </div>

              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCheckoutModalOpen(false)
                    setSelectedPaymentId("")
                    setAmountPaid("")
                  }}
                  disabled={isSubmittingCheckout}
                  className="h-11 font-medium"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingCheckout || !selectedPaymentId || !amountPaid}
                  className="bg-green-600 hover:bg-green-700 text-white h-11 px-6 font-bold shadow-sm"
                >
                  {isSubmittingCheckout ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
                  ) : (
                    "Confirmar Checkout"
                  )}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}