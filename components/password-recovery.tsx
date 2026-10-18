"use client"

import { useState, type FormEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react"

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

type PasswordRecoveryProps = {
  mode?: "request" | "reset"
}

export default function PasswordRecovery(
  props: PasswordRecoveryProps
) {
  const router = useRouter()
  const pathname = usePathname()

  // A URL determina a etapa, mantendo compatibilidade com a prop mode.
  const isReset =
    pathname === "/redifine-password"
      ? true
      : pathname === "/change-password"
        ? false
        : props.mode === "reset"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  function clearMessages() {
    setError("")
    setMessage("")
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearMessages()

    if (!isReset) {
      // Simula o envio do e-mail e avança para a próxima página.
      router.push("/redifine-password")
      return
    }

    if (password !== confirmation) {
      setError("As senhas não coincidem. Confira os dois campos.")
      return
    }

    // A alteração real será integrada ao backend posteriormente.
    setMessage(
      "Validação concluída! Nesta simulação, sua senha não foi alterada."
    )
    setPassword("")
    setConfirmation("")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <p className="text-sm font-semibold tracking-wide text-slate-500">
            BarberShop Manager
          </p>

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            {isReset ? (
              <LockKeyhole className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Mail className="h-6 w-6" aria-hidden="true" />
            )}
          </div>

          <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900">
            {isReset ? "Redefinir senha" : "Alterar senha"}
          </CardTitle>

          <CardDescription className="text-base text-slate-500">
            {isReset
              ? "Digite e confirme sua nova senha."
              : "Informe o e-mail cadastrado para solicitar a alteração da sua senha."}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <CardContent className="space-y-4">
            {!isReset ? (
              <div className="space-y-2">
                <Label htmlFor="recovery-email">E-mail cadastrado</Label>

                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />

                  <Input
                    id="recovery-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    className="h-11 pl-10"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova senha</Label>

                  <Input
                    id="new-password"
                    name="new-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Digite sua nova senha"
                    className="h-11"
                    required
                    minLength={8}
                    aria-describedby="password-help"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      clearMessages()
                    }}
                  />

                  <p
                    id="password-help"
                    className="text-xs text-slate-500"
                  >
                    Use pelo menos 8 caracteres.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    Repetir nova senha
                  </Label>

                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Digite novamente sua nova senha"
                    className="h-11"
                    required
                    minLength={8}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                      error ? "password-error" : undefined
                    }
                    value={confirmation}
                    onChange={(event) => {
                      setConfirmation(event.target.value)
                      clearMessages()
                    }}
                  />
                </div>
              </>
            )}

            {error && (
              <p
                id="password-error"
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"
              >
                {message}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-5">
            <Button
              type="submit"
              className="h-11 w-full text-base font-bold shadow-md transition-all hover:shadow-lg"
            >
              {isReset ? "Alterar senha" : "Enviar email"}
            </Button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar para o login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}