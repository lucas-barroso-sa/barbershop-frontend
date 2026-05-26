import Sidebar from "@/components/ui/Sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Aqui entra a nossa barra lateral retrátil */}
      <Sidebar />
      
      {/* O pl-20 (padding-left: 80px) garante que o conteúdo principal não fique escondido embaixo da barra fechada */}
      <main className="pl-20 transition-all duration-300">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}