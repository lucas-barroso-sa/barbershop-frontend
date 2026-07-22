"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import api from "@/lib/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, MoreVertical, ArrowLeft, Loader2 } from "lucide-react"
import AdminGuard from "@/components/ui/AdminGuard"

// Interface espelhando o seu ServicingDTO do Java
// Se o seu DTO não tiver "category" ou "createdAt", não tem problema,
// o TypeScript aceita o "? " como opcional, mas você pode ajustar depois.
interface Servicing {
  id: number
  name: string
  category?: string 
  price: number
  createdAt?: string 
}

export default function ServicesPage() {
  const [services, setServices] = useState<Servicing[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Dispara a busca quando a página carrega
  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      // Consumindo o endpoint GET /servicings do seu controller
      const response = await api.get('/servicings')
      setServices(response.data)
    } catch (error) {
      console.error("Erro ao buscar serviços:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filtro de busca focado no nome e no código
  const filteredServices = services.filter(service => {
    const safeName = service.name ?? ""
    return (
      safeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(service.id).includes(searchTerm)
    )
  })

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    if (value === undefined || value === null) return "R$ 0,00"
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <AdminGuard>
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/settings">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Serviços</h1>
          <p className="text-slate-500">Gerencie os serviços oferecidos na barbearia</p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-b">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Filtrar por nome/código"
                className="pl-9 bg-slate-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Link href="/settings/services/new" passHref>
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex gap-2 font-medium">
                Adicionar
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="font-semibold text-slate-900 py-4 pl-6">Código</TableHead>
                  <TableHead className="font-semibold text-slate-900">Nome de exibição</TableHead>
                  <TableHead className="font-semibold text-slate-900">Categoria</TableHead>
                  <TableHead className="font-semibold text-slate-900">Valor</TableHead>
                  <TableHead className="font-semibold text-slate-900 text-center pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p>Carregando serviços...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <TableRow key={service.id} className="hover:bg-slate-50 transition-colors group">
                      <TableCell className="pl-6 text-slate-500 font-medium">
                        {service.id}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700">
                        {service.name}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {/* Fallback caso não tenha categoria no seu DTO */}
                        {service.category ?? "-"}
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {formatCurrency(service.price)}
                      </TableCell>
                      <TableCell className="text-center pr-6">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-200 border border-transparent group-hover:border-slate-200"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                      Nenhum serviço encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminGuard>
  )
}