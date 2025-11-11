// src/components/NavBar.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    return (
        <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
            {!isAuthenticated && (
                <>
                    <Link to="/signup" style={{ marginRight: 12 }}>Sign Up</Link>
                    <Link to="/signin" style={{ marginRight: 12 }}>Sign In</Link>
                </>
            )}
            {isAuthenticated && (
                <>
                    <Link to="/dashboard" style={{ marginRight: 12 }}>Dashboard</Link>
                    <button onClick={handleLogout}>Logout</button>
                </>
            )}
        </nav>
    );
}
