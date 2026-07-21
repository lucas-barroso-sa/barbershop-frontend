"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { 
  Plus, 
  Edit2, 
  UserCog, 
  ShieldCheck, 
  Search,
  Loader2,
  X,
  UserPlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // ==========================================
  // ESTADOS DO MODAL DE CRIAÇÃO
  // ==========================================
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    status: "ACTIVE"
  })
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // ==========================================
  // ESTADOS DO MODAL DE EDIÇÃO
  // ==========================================
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: "",
    role: "",
    status: ""
  })

  // Carrega a lista de usuários
  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-none">Ativo</Badge>
      case 'INACTIVE':
        return <Badge className="bg-slate-200 text-slate-600 hover:bg-slate-300 border-none shadow-none">Inativo</Badge>
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none shadow-none">Pendente</Badge>
      default:
        return <Badge className="bg-slate-200 text-slate-600 border-none shadow-none">{status}</Badge>
    }
  }

  // ==========================================
  // FUNÇÕES DE SUBMISSÃO (CRIAÇÃO)
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== confirmPassword) {
      setPasswordError("As senhas não coincidem. Tente novamente.")
      return
    }

    setIsSubmitting(true)
    setPasswordError("")

    try {
      await api.post('/users', formData)
      setIsModalOpen(false)
      setFormData({ name: "", email: "", password: "", role: "", status: "ACTIVE" })
      setConfirmPassword("")
      loadUsers()
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error)
      alert("Ocorreu um erro ao salvar o usuário.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ==========================================
  // FUNÇÕES DE SUBMISSÃO (EDIÇÃO)
  // ==========================================
  const handleOpenEditModal = (user: any) => {
    setEditingUserId(user.id)
    setEditFormData({
      name: user.name,
      role: user.role,
      status: user.status
    })
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUserId) return
    
    setIsSubmittingEdit(true)
    try {
      await api.patch(`/users/${editingUserId}`, editFormData)
      setIsEditModalOpen(false)
      loadUsers() // Recarrega a tabela para mostrar as alterações
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
      alert("Ocorreu um erro ao atualizar o usuário.")
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium animate-pulse">Carregando equipe...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 lg:p-8 bg-slate-50 min-h-screen relative">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UserCog className="w-8 h-8 text-slate-700" />
            Gerenciar Usuários
          </h1>
          <p className="text-slate-500 mt-1">
            Controle os acessos, permissões e perfis da equipe do sistema.
          </p>
        </div>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 font-bold h-11 px-6 shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-800">Equipe Cadastrada</CardTitle>
            <CardDescription>Lista de todos os usuários com acesso ao sistema.</CardDescription>
          </div>
          
          <div className="relative hidden sm:block w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Buscar por nome ou email..." className="pl-9 bg-slate-50" />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-700">Nome do Usuário</TableHead>
                <TableHead className="font-bold text-slate-700 hidden md:table-cell">E-mail</TableHead>
                <TableHead className="font-bold text-slate-700">Nível de Acesso</TableHead>
                <TableHead className="font-bold text-slate-700">Status</TableHead>
                <TableHead className="font-bold text-slate-700 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                  <TableCell className="font-medium text-slate-800">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-slate-500 hidden md:table-cell">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 w-fit px-2.5 py-1 rounded-md">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {user.role}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Botão de Editar agora chama a função que popula e abre o modal */}
                    <Button 
                      onClick={() => handleOpenEditModal(user)}
                      variant="ghost" 
                      size="sm" 
                      className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {users.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400 py-8 text-sm">
                    Nenhum usuário cadastrado no sistema.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ==========================================
          MODAL DE ADICIONAR USUÁRIO 
          ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden transform transition-all">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-slate-700" /> Adicionar Usuário
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false)
                  setConfirmPassword("")
                  setPasswordError("")
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
                  <Input 
                    placeholder="Seu nome" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">E-mail</label>
                  <Input 
                    type="email" 
                    placeholder="exemplo@gmail.com" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Senha</label>
                  <Input 
                    type="password" 
                    placeholder="***" 
                    required
                    value={formData.password}
                    onChange={(e) => {
                      const novaSenha = e.target.value
                      setFormData({...formData, password: novaSenha})
                      if (confirmPassword && novaSenha !== confirmPassword) {
                        setPasswordError("As senhas não coincidem.")
                      } else {
                        setPasswordError("")
                      }
                    }}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 relative">
                  <label className="text-sm font-semibold text-slate-700">Confirmar Senha</label>
                  <Input 
                    type="password" 
                    placeholder="***" 
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      const novaConfirmacao = e.target.value
                      setConfirmPassword(novaConfirmacao)
                      if (novaConfirmacao && formData.password !== novaConfirmacao) {
                        setPasswordError("As senhas não coincidem.")
                      } else {
                        setPasswordError("")
                      }
                    }}
                    className={`h-11 ${passwordError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {passwordError && (
                    <p className="text-[11px] font-semibold text-red-500 mt-1 absolute">{passwordError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tipo de Perfil</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <option value="" disabled>Selecione um perfil...</option>
                    <option value="ADMIN">Administrador / Dono</option>
                    <option value="BARBER">Profissional / Barbeiro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Status do Usuário</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <option value="" disabled>Selecione o status...</option>
                    <option value="ACTIVE">Ativo</option>
                    <option value="INACTIVE">Inativo</option>
                    <option value="PENDING">Pendente (Confirmação)</option>
                  </select>
                </div>

              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false)
                    setConfirmPassword("") 
                    setPasswordError("")   
                  }}
                  disabled={isSubmitting}
                  className="h-11 font-medium"
                >
                  Cancelar
                </Button>
                
                <Button
                  type="submit"
                  disabled={
                    isSubmitting || 
                    !formData.role || 
                    !formData.status || 
                    !formData.password || 
                    formData.password !== confirmPassword
                  }
                  className="bg-slate-900 hover:bg-slate-800 text-white h-11 px-6 font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                  ) : (
                    "Salvar Usuário"
                  )}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ==========================================
          MODAL DE EDITAR USUÁRIO
          ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden transform transition-all">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-slate-700" /> Editar Usuário
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="p-6 space-y-4">
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
                  <Input 
                    placeholder="Nome do usuário" 
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tipo de Perfil</label>
                  <select
                    required
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                    className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <option value="" disabled>Selecione um perfil...</option>
                    <option value="ADMIN">Administrador / Dono</option>
                    <option value="BARBER">Profissional / Barbeiro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Status do Usuário</label>
                  <select
                    required
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                    className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <option value="" disabled>Selecione o status...</option>
                    <option value="ACTIVE">Ativo</option>
                    <option value="INACTIVE">Inativo</option>
                    <option value="PENDING">Pendente (Confirmação)</option>
                  </select>
                </div>

              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmittingEdit}
                  className="h-11 font-medium"
                >
                  Cancelar
                </Button>
                
                <Button
                  type="submit"
                  disabled={isSubmittingEdit || !editFormData.name || !editFormData.role || !editFormData.status}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6 font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingEdit ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Atualizando...</>
                  ) : (
                    "Atualizar Usuário"
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