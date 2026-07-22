"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { 
  Scissors, 
  DollarSign, 
  Clock, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2,
  PlusCircle
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
import AdminGuard from "@/components/ui/AdminGuard"

export default function NewServicePage() {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [durationInMinutes, setDurationInMinutes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Enviando para o endpoint /servicings conforme seu Controller
      await api.post('/servicings', {
        name,
        price: parseFloat(price),
        durationInMinutes: parseInt(durationInMinutes)
      })

      setIsSuccess(true)
      
      setTimeout(() => {
        router.push('/settings/services')
      }, 2000)

    } catch (error) {
      console.error("Erro ao cadastrar serviço:", error)
      alert("Erro ao cadastrar o serviço. Verifique se os campos estão preenchidos corretamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center p-8 border-none shadow-2xl">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Serviço Criado!</CardTitle>
          <CardDescription className="text-lg mt-2">
            O serviço "{name}" já está disponível para agendamentos.
          </CardDescription>
        </Card>
      </div>
    )
  }

  return (
    <AdminGuard>
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Novo Serviço</h1>
          <p className="text-slate-500">Configure os detalhes do serviço oferecido</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-lg border-none">
          <CardHeader className="bg-slate-900 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5" /> Detalhes do Serviço
            </CardTitle>
            <CardDescription className="text-slate-300">
              Defina o nome, valor e o tempo médio de execução
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            {/* Nome do Serviço */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold text-slate-700">Nome do Serviço</Label>
              <div className="relative">
                <Scissors className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="name" 
                  placeholder="Ex: Corte Degradê + Barba" 
                  className="pl-10 h-12 text-base focus-visible:ring-slate-900"
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preço */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-bold text-slate-700">Preço (R$)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="price" 
                    type="number"
                    step="0.01"
                    placeholder="0,00" 
                    className="pl-10 h-12 text-base focus-visible:ring-slate-900"
                    required 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Duração */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-bold text-slate-700">Duração (Minutos)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="duration" 
                    type="number"
                    placeholder="Ex: 45" 
                    className="pl-10 h-12 text-base focus-visible:ring-slate-900"
                    required 
                    value={durationInMinutes}
                    onChange={(e) => setDurationInMinutes(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50 rounded-b-lg border-t p-6 flex justify-end gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => router.back()}
              disabled={isLoading}
              className="font-semibold"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-slate-900 hover:bg-slate-800 px-8 h-12 font-bold shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...</>
              ) : (
                "Cadastrar Serviço"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
    </AdminGuard>
  )
}