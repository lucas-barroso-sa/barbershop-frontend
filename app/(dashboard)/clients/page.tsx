"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import api from "@/lib/api"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Loader2, UserCircle } from "lucide-react"

// 1. Interface atualizada: Sem o campo 'cpf'
interface Client {
  id: number
  name: string
  phone: string
  email: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients')
      setClients(response.data)
    } catch (error) {
      console.error("Erro ao buscar clientes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 2. Filtro seguro e focado apenas no nome
  const filteredClients = clients.filter(client => {
    // Fallback: se o nome vier null do banco, tratamos como string vazia
    const safeName = client.name ?? ""
    return safeName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Clientes</h1>
          <p className="text-slate-500">Visualize e gerencie as informações dos seus clientes</p>
        </div>
        
        <Link href="/clients/new" passHref>
          <Button asChild className="flex gap-2 shadow-md hover:scale-[1.02] transition-transform bg-slate-900">
            <span>
              <UserPlus className="w-4 h-4" /> Novo Cliente
            </span>
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm border-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">Listagem de Clientes</CardTitle>
          <div className="flex items-center gap-2 max-w-sm mt-4 relative">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            {/* 3. Placeholder atualizado */}
            <Input 
              placeholder="Buscar por nome..." 
              className="pl-10 h-10 focus-visible:ring-slate-400" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-2" />
              <p className="font-medium animate-pulse">Carregando base de clientes...</p>
            </div>
          ) : (
            <Table>
              <TableCaption>Total de {clients.length} clientes cadastrados.</TableCaption>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[300px] font-bold text-slate-900">Nome</TableHead>
                  {/* 4. Coluna de CPF removida do Header */}
                  <TableHead className="font-bold text-slate-900">Telefone</TableHead>
                  <TableHead className="font-bold text-slate-900">E-mail</TableHead>
                  <TableHead className="text-right font-bold text-slate-900">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-semibold text-slate-700 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                           <UserCircle className="w-5 h-5" />
                        </div>
                        {client.name}
                      </TableCell>
                      {/* 5. Célula de CPF removida do Body */}
                      <TableCell className="text-slate-600">{client.phone}</TableCell>
                      <TableCell className="text-slate-600">{client.email}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm" className="hover:bg-slate-900 hover:text-white transition-colors font-bold">
                          <Link href={`/clients/${client.id}`}>
                          Detalhes
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    {/* 6. colSpan ajustado de 5 para 4, já que temos uma coluna a menos */}
                    <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                      Nenhum cliente encontrado com esses termos.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}