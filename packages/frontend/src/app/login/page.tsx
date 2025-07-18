"use client"

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { RegisterInput } from 'shared';
import { login, register } from '@/lib/api';

export default function Login() {
    const [form, setForm] = useState<RegisterInput>({
        username: '',
        password: ''
    });
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await register(form);
        if (response.ok) {
            const { token } = await response.json();
            localStorage.setItem('token', token);
            router.push('/');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await login(form);
        if (response.ok) {
            const { token } = await response.json();
            localStorage.setItem('token', token);
            router.push('/');
        }
    };

    return (
        <form  className="max-w-sm mx-auto mt-10" >
            <input
                type="text"
                placeholder="Логин"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })
                }
                className="w-full p-2 mb-3 border"
            />
            <input
                type="password"
                placeholder="Пароль"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full p-2 mb-3 border"
            />
            <div className='flex flex-row justify-between'>
                <button
                    type="button"
                    className="ml-2 p-2 bg-blue-500 text-white"
                    onClick={handleLogin}
                >
                    Войти
                </button>
                <button
                    type="button"
                    className="mr-2 p-2 bg-blue-500 text-white"
                    onClick={handleRegister}
                >
                    Зарегистрироваться
                </button>
            </div>
            
        </form>
    );
}