import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

export const api = axios.create({
    baseURL,
    // La sesión viaja en una cookie httpOnly gestionada por Better Auth.
    // El navegador debe incluirla en cada petición cross-origin.
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});
