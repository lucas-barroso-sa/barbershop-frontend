"use client"

import * as React from "react"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  Plus, 
  ArrowLeft, 
  Loader2, 
  Pencil, 
  Trash, 
  Scissors, 
  DollarSign, 
  Clock 
} from "lucide-react"
import AdminGuard from "@/components/ui/AdminGuard"

interface Servicing {
  id: number
  name: string
  category?: string 
  price: number
  durationInMinutes?: number 
  createdAt?: string 
}

export default function ServicesPage() {
  const [services, setServices] = useState<Servicing[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // ==========================================
  // ESTADOS DO MODAL DE EDIÇÃO
  // ==========================================
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: "",
    price: "",
    durationInMinutes: ""
  })

  // Busca os serviços ao montar a página
  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/servicings')
      setServices(response.data)
    } catch (error) {
      console.error("Erro ao buscar serviços:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // ==========================================
  // AÇÕES DO GRID E MODAL
  // ==========================================
  
  // 1. Abre o modal e preenche os dados do serviço selecionado
  const handleOpenEdit = (service: Servicing) => {
    setEditingServiceId(service.id)
    setEditFormData({
      name: service.name || "",
      price: service.price ? service.price.toString() : "",
      durationInMinutes: service.durationInMinutes ? service.durationInMinutes.toString() : ""
    })
    setIsEditModalOpen(true)
  }

  // 2. Salva as alterações na API (PATCH)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await api.patch(`/servicings/${editingServiceId}`, {
        name: editFormData.name,
        price: parseFloat(editFormData.price.replace(",", ".")), // Tratamento para vírgula
        durationInMinutes: parseInt(editFormData.durationInMinutes) || 0
      })
      
      setIsEditModalOpen(false)
      fetchServices() // Recarrega a tabela com os novos dados
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error)
      alert("Erro ao salvar as alterações. Verifique os dados e tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  // 3. Exclui o serviço
  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.")) return

    try {
      await api.delete(`/servicings/${id}`)
      setIsEditModalOpen(false)
      fetchServices() 
    } catch (error) {
      console.error("Erro ao excluir serviço:", error)
      alert("Não foi possível excluir o serviço. Ele pode estar vinculado a agendamentos existentes.")
    }
  }

  // ==========================================
  // FILTROS E FORMATAÇÃO
  // ==========================================
  const filteredServices = services.filter(service => {
    const safeName = service.name ?? ""
    return (
      safeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(service.id).includes(searchTerm)
    )
  })

  const formatCurrency = (value: number) => {
    if (value === undefined || value === null) return "R$ 0,00"
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <AdminGuard>
      <div className="space-y-6 max-w-7xl mx-auto pb-10 p-4 lg:p-8">
        
        {/* CABEÇALHO */}
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

        {/* CARD PRINCIPAL (GRID) */}
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
                    <TableHead className="font-semibold text-slate-900 text-center w-[100px]">Ações</TableHead>
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
                          {service.category ?? "-"}
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium">
                          {formatCurrency(service.price)}
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEdit(service)}
                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Editar Serviço"
                          >
                            <Pencil className="w-4 h-4" />
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

      {/* ==========================================
          OVERLAY DO MODAL DE EDIÇÃO
      ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl border-none animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="bg-slate-900 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Pencil className="w-5 h-5" /> Editar Serviço
              </CardTitle>
              <CardDescription className="text-slate-300">
                Altere os valores atuais do serviço
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSaveEdit}>
              <CardContent className="space-y-4 pt-6">
                
                {/* Campo Nome */}
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm font-bold text-slate-700">Nome do Serviço</Label>
                  <div className="relative">
                    <Scissors className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="edit-name" 
                      className="pl-10 h-12 focus-visible:ring-slate-900"
                      required 
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Campo Preço */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-price" className="text-sm font-bold text-slate-700">Preço (R$)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="edit-price" 
                        type="number"
                        step="0.01"
                        className="pl-10 h-12 focus-visible:ring-slate-900"
                        required 
                        value={editFormData.price}
                        onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  {/* Campo Duração */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration" className="text-sm font-bold text-slate-700">Duração (Min)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="edit-duration" 
                        type="number"
                        className="pl-10 h-12 focus-visible:ring-slate-900"
                        required 
                        value={editFormData.durationInMinutes}
                        onChange={(e) => setEditFormData({ ...editFormData, durationInMinutes: e.target.value })}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* RODAPÉ DO MODAL (Com botão excluir na esquerda) */}
              <CardFooter className="bg-slate-50 rounded-b-lg border-t p-4 flex justify-between items-center mt-4">
                
                {/* Lado Esquerdo: Excluir */}
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => editingServiceId && handleDelete(editingServiceId)}
                  disabled={isSaving}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Excluir
                </Button>

                {/* Lado Direito: Cancelar e Salvar */}
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isSaving}
                    className="font-semibold text-slate-600"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    disabled={isSaving || !editFormData.name || !editFormData.price}
                  >
                    {isSaving ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </AdminGuard>
  )
}