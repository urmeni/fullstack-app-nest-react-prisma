import { useState, useEffect } from 'react';

// This hook tells you if the user is logged in and gives you a logout function.
export function useAuth() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, []);

    const signin = (accessToken: string) => {
        localStorage.setItem('token', accessToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    return { token, isAuthenticated: !!token, signin, logout };
}