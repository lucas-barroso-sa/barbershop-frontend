import axios from 'axios';
import { parseCookies } from 'nookies';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
});

// O "Porteiro": Interceptor de Requisição
api.interceptors.request.use((config) => {
  // --- NOSSO ESPIÃO DE DEBUG ---
  console.log("🚀 URL BASE:", config.baseURL);
  console.log("🚀 ROTA CHAMADA:", config.url);
  console.log("🚀 URL COMPLETA:", `${config.baseURL}${config.url}`);
  // -----------------------------

  const { 'barbershop.token': token } = parseCookies();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// O "Fiscal": Interceptor de Resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;