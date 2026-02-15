'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:3000';

interface User {
    id: string;
    username?: string;
    email?: string;
    displayName?: string;
    googleId?: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showToken, setShowToken] = useState(false);
    const [token, setToken] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            const storedToken = localStorage.getItem('token');

            if (!storedToken) {
                router.push('/login');
                return;
            }

            setToken(storedToken);

            try {
                const response = await fetch(`${API_URL}/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`,
                    },
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    } else {
                        router.push('/login');
                    }
                }
            } catch (error) {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    router.push('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-900">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                        Login Successful!
                    </h1>

                    {user && (
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">User Information</h2>
                            <div className="space-y-3">
                                <div>
                                    <span className="font-medium text-gray-700">User ID:</span>
                                    <span className="ml-2 text-gray-600">{user.id}</span>
                                </div>
                                {user.username && (
                                    <div>
                                        <span className="font-medium text-gray-700">Username:</span>
                                        <span className="ml-2 text-gray-600">{user.username}</span>
                                    </div>
                                )}
                                {user.email && (
                                    <div>
                                        <span className="font-medium text-gray-700">Email:</span>
                                        <span className="ml-2 text-gray-600">{user.email}</span>
                                    </div>
                                )}
                                {user.displayName && (
                                    <div>
                                        <span className="font-medium text-gray-700">Display Name:</span>
                                        <span className="ml-2 text-gray-600">{user.displayName}</span>
                                    </div>
                                )}
                                {user.googleId && (
                                    <div>
                                        <span className="font-medium text-gray-700">Google ID:</span>
                                        <span className="ml-2 text-gray-600">{user.googleId}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {showToken && (
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">Your Token</h2>
                            <div className="bg-white p-4 rounded border border-gray-200 break-all font-mono text-sm text-gray-600">
                                {token}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => setShowToken(!showToken)}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                        >
                            {showToken ? 'Hide Token' : 'Show Token'}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}