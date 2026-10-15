"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { 
  UserPlus, 
  Phone, 
  Mail, 
  ArrowLeft, 
  Loader2, 
  User,
  CheckCircle2,
  AlertCircle // 🚨 Ícone importado para o aviso de erro
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

export default function NewClientPage() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // 🚨 Estado para gerir erros de formulário e da API
  const [clientFormError, setClientFormError] = useState<string | null>(null)

  const router = useRouter()

  // Função para aplicar a máscara no input do telefone
  const formatPhoneMask = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "")
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "").slice(0, 15)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Limpa mensagens de erro antigas
    setClientFormError(null)

    // 🚨 1. Limpa a máscara (Pega só os números)
    const digitsOnly = phone.replace(/\D/g, "")
    
    // 🚨 2. Valida ANTES de chamar o back-end
    if (digitsOnly.length !== 10 && digitsOnly.length !== 11) {
      setClientFormError("O telefone deve conter o DDD e ter 10 ou 11 dígitos.")
      return
    }

    if (digitsOnly.length === 11 && digitsOnly[2] !== '9') {
      setClientFormError("Atenção: Celulares devem iniciar com o dígito 9 após o DDD.")
      return
    }

    setIsLoading(true)

    try {
      // 🚨 3. Envia APENAS os números (digitsOnly)
      await api.post('/clients', {
        name,
        phone: digitsOnly,
        email
      })

      setIsSuccess(true)
      
      // Pequeno delay para o usuário ver a mensagem de sucesso
      setTimeout(() => {
        router.push('/clients')
      }, 2000)

    } catch (error: any) {
      console.error("Detalhes completos do erro:", error.response);
      
      const status = error.response?.status;
      const errorDataString = JSON.stringify(error.response?.data || "").toLowerCase();

      // 🚨 4. Procura ativamente pelas palavras de erro ou pelo status 400
      if (errorDataString.includes("exist") || errorDataString.includes("already")) {
        setClientFormError("Já existe um cliente registado com este número de telefone.");
      } else if (status === 400) {
        const backendMessage = error.response?.data?.message || error.response?.data?.detail;
        setClientFormError(backendMessage ? backendMessage : "Dados inválidos. Verifique os campos e tente novamente.");
      } else {
        setClientFormError("Erro ao registar cliente. Verifique se os dados estão corretos.");
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center p-8">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Cliente Cadastrado!</CardTitle>
          <CardDescription className="text-lg mt-2">
            {name} foi adicionado à sua base com sucesso.
          </CardDescription>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Cabeçalho com Voltar */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Novo Cliente</h1>
          <p className="text-slate-500">Adicione um novo cliente para realizar agendamentos</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-lg border-none">
          <CardHeader className="bg-slate-900 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" /> Dados Pessoais
            </CardTitle>
            <CardDescription className="text-slate-300">
              Preencha as informações de contato do cliente
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            
            {/* 🚨 CAIXA DE ERRO NA INTERFACE */}
            {clientFormError && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm font-medium flex items-start gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{clientFormError}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="name" 
                  placeholder="Ex: João Silva" 
                  className="pl-10 h-11"
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-semibold">Telefone / WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="phone" 
                    placeholder="(85) 99999-9999" 
                    className="pl-10 h-11"
                    required 
                    value={phone}
                    // 🚨 Aplica a máscara enquanto digita
                    onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">E-mail (Opcional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="joao@email.com" 
                    className="pl-10 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-slate-900 hover:bg-slate-800 px-8 h-11 font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...</>
              ) : (
                "Cadastrar Cliente"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}