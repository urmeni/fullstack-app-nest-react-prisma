// src/pages/SignIn.tsx
import React, {JSX} from 'react';
import { useForm } from 'react-hook-form';
import { signin } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

type FormData = {email: string; password: string };

export default function SignIn(): JSX.Element {
    const {register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
    const navigate = useNavigate();
    const { login } = useAuth();

    const onSubmit = async (data: FormData) => {
        try {
            const res = await signin(data);
            if (res.data?.accessToken) {
                login(res.data.accessToken);
            }
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            alert(err?.response?.data?.message || 'Sign in failed');
        }
    };

    return (
        <div style={{ maxWidth: 420, margin: '40px auto', padding: 20 }}>
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>
                    Email
                    <input {...register('email', { required: 'Email required' })} type="email" />
                </label>
                <div style={{ color: 'red'}}>{errors.email?.message}</div>

                <label>
                    Password
                    <input {...register('password', { required: 'Password required' })} type="password" />
                </label>
                <div style={{ marginTop: 12 }}>
                    <button type="submit" disabled={isSubmitting}>Sign In</button>
                </div>

                <div style={{ marginTop: 8 }} >
                    New here? <Link to="/signup">Create an account</Link>
                </div>
            </form>
        </div>
    );
}