import axios from 'axios';
import { parseCookies } from 'nookies'; // Sugestão para lidar com cookies no Next.js

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080', // Usa a variável da Vercel ou o local por padrão
});

// O "Porteiro": Interceptor de Requisição
api.interceptors.request.use((config) => {
  // Tentamos buscar o token nos cookies (ou localStorage)
  const { 'barbershop.token': token } = parseCookies();

  // Se o token existir, ele é injetado no cabeçalho Authorization
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// O "Fiscal": Interceptor de Resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o backend retornar 401, o token não vale mais
    if (error.response?.status === 401) {
      // Aqui você poderia forçar um logout ou redirecionar
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;