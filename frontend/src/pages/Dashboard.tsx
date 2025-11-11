// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { getMe } from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type ServerUser = { id: number; email: string; name?: string };

export default function Dashboard() {
    const [serverUser, setServerUser] = useState<ServerUser | null>(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await getMe();
                setServerUser(res.data);
            } catch (err: any) {
                console.error(err);
                if (err?.response?.status === 401) {
                    logout();
                    navigate('/signin');
                }
            }
        })();
    }, [navigate, logout]);

    // Pick a friendly display name:
    const displayName =
        serverUser?.name?.trim() ||
        user?.email ||
        serverUser?.email ||
        "User";

    return (
        <div style={{ padding: 20 }}>
            <h2>Dashboard</h2>

            <p>Welcome, <b>{displayName}</b>!</p>

            {serverUser ? (
                <>
                    <p>Verified from API: {serverUser.email}</p>
                    <pre>{JSON.stringify(serverUser, null, 2)}</pre>
                </>
            ) : (
                <p>Loading server data...</p>
            )}

            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}
