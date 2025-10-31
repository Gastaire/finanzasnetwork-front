import axios from 'axios';

// 1. Definimos la URL base de nuestro backend
const baseURL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: baseURL,
});

// 2. Aquí está la magia: El "Interceptor"
// Esto se ejecuta ANTES de que cualquier petición sea enviada
api.interceptors.request.use(
  (config) => {
    // Obtenemos el token del localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Si el token existe, lo añadimos a los headers
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Manejamos errores de la petición
    return Promise.reject(error);
  }
);

// (Luego agregaremos un interceptor de 'response' para manejar 401/errores de token)

export default api;