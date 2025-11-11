// src/api.ts

import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
    baseURL,
    headers: {'Content-Type': 'application/json'},
});

// Add a request interceptor to include token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    console.log('Sending token:', token);
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export type SignUpPayload = { name?: string; email: string; password: string };
export type SignInPayLoad = { email: string; password: string };

export async function signup(payload: SignUpPayload) {
    return api.post('/api/auth/signup', payload);
}

export async function signin(payload: SignInPayLoad) {
    return api.post('/api/auth/signin', payload);
}

export async function getMe() {
    return api.get('/api/auth/me');
}

export default api;