"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { setCookie } from "nookies"
import { Loader2, Lock, Mail } from "lucide-react"

import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await api.post('/auth/login', {
        login: email,
        password: password
      })

      const { token } = response.data

      setCookie(undefined, 'barbershop.token', token, {
        maxAge: 60 * 60 * 2,
        path: '/',
      })

      router.push('/agenda')
      
    } catch (err: any) {
      console.error("Erro na autenticação:", err)
      setError("Credenciais inválidas. Verifique seu e-mail e senha.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-center text-slate-900">
            BarberShop Manager
          </CardTitle>
          <CardDescription className="text-center text-base text-slate-500">
            Acesse sua conta para gerenciar os agendamentos
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm text-center font-medium animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail do Profissional</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="lucas@barbershop.com" 
                  className="pl-10"
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="pl-10"
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-6">
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-bold shadow-md hover:shadow-lg transition-all" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Autenticando...
                </>
              ) : (
                "Entrar no Painel"
              )}
            </Button>

            <div className="text-sm text-center text-slate-500">
              Ainda não possui acesso?{" "}
              <Link 
                href="/register" 
                className="text-primary font-bold hover:underline underline-offset-4"
              >
                Cadastre sua barbearia
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}