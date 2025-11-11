// src/pages/SignUp.tsx
import React, { JSX } from 'react';
import { useForm } from 'react-hook-form';
import { signup } from '../api';
import { useNavigate, Link } from 'react-router-dom';

type FormData = {
    name?: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export default function SignUp(): JSX.Element {
    const { register, handleSubmit, watch, formState: {errors, isSubmitting } } = useForm<FormData>();
    const navigate = useNavigate();

    const onSubmit = async (data: FormData) => {
        if (data.password != data.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        try {
            const res = await signup({ name: data.name, email: data.email, password: data.password });
            // Example if backend returns token
            if (res.data?.accessToken) {
                localStorage.setItem('token', res.data.accessToken);
            }
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            alert(err?.response?.data?.message || 'Sign up failed !');
        }
    };

    return (
        <div style={{maxWidth: 420, margin: '40px auto', padding: 20, border: '1px solid #eee', borderRadius: 8}}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>
                    Name
                    <input {...register('name')} placeholder="Optional"/>
                </label>
                <br/>
                <label>
                    Email
                    <input
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email'}
                        })}
                        type="email"
                    />
                </label>
                <div style={{ color: 'red' }}>{errors.email?.message}</div>

                <label>
                    Password
                    <input {...register('password', {required: 'Password required', minLength: {value: 8, message: 'Minimum 8 chars'} })}
                        type="password" />
                </label>
                <div style={{ color: 'red' }}>{errors.password?.message}</div>

                <label>
                    Confirm Password
                    <input {...register('confirmPassword', { required: 'Confirm password' })} type="password" />
                </label>

                <div style={{ marginTop: 12 }}>
                    <button type="submit" disabled={isSubmitting}>Sign Up</button>
                    <div style={{ marginTop: 8 }}>
                        Already have an account ? <Link to="/signin">Sign in</Link>
                    </div>
                </div>
            </form>
        </div>
    );
}