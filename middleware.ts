import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Adicionamos o "default" aqui na exportação
export default function middleware(request: NextRequest) {
  // 1. Busca o cookie de autenticação
  const token = request.cookies.get('barbershop.token')?.value
  
  // 2. Verifica se a rota atual é pública
  const isPublicRoute = request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/register'

  // 3. Se NÃO TEM token e a rota NÃO é pública -> Manda para o Login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 4. Se TEM token e tenta acessar Login/Register -> Manda para a Agenda
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/agenda', request.url))
  }

  // 5. Se estiver tudo certo, continua a requisição
  return NextResponse.next()
}

// Configuração do matcher (mantém-se igual)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}