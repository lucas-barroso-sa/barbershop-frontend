import axios from 'axios';
import { parseCookies, destroyCookie } from 'nookies';

const api = axios.create({
  baseURL: process.env.backend || 'http://localhost:8080',
});

// O "Porteiro": Interceptor de Requisição
api.interceptors.request.use((config) => {
  // --- NOSSO ESPIÃO DE DEBUG ---
  console.log("🚀 URL BASE:", config.baseURL);
  console.log("🚀 ROTA CHAMADA:", config.url);
  console.log("🚀 URL COMPLETA:", `${config.baseURL}${config.url}`);
  // -----------------------------

  const { 'barbershop.token': token } = parseCookies();
  console.log(token)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// O "Fiscal": Interceptor de Resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Vigia se o token expirou ou se o acesso foi negado pelo Spring Boot
    if (error.response?.status === 401 || error.response?.status === 403) {
      
      // 1. Destrói o cookie com o token inválido
      destroyCookie(undefined, 'barbershop.token', { path: '/' });

      // 2. Limpa a memória do navegador para deslogar 100%
      if (typeof window !== 'undefined') {
        localStorage.removeItem('@BarberShop:role');
        localStorage.removeItem('@BarberShop:name');

        // 3. Redireciona para o Login (a raiz do seu projeto)
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;