'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthControllerGoogleAuthenticate } from '@/lib/services/authentication/authentication';

export default function GoogleCallbackPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [error, setError] = useState('');
    const googleAuthMutation = useAuthControllerGoogleAuthenticate();

    useEffect(() => {
        const exchangeToken = async () => {
            if (status === 'loading') return;

            if (!session?.user) {
                router.push('/login');
                return;
            }

            // Get the ID token from the session
            const idToken = (session as any).idToken;

            if (!idToken) {
                setError('No ID token found in session');
                return;
            }

            // Send ID token to backend for verification
            googleAuthMutation.mutate(
                {
                    data: {
                        idToken,
                    },
                },
                {
                    onSuccess: (response) => {
                        // Store backend JWT token
                        // defaultMutator returns res.data directly, so response is the auth data
                        const authData = response as unknown as { token: string; user: unknown };
                        localStorage.setItem('authToken', authData.token);
                        localStorage.setItem('authUser', JSON.stringify(authData.user));

                        // Redirect to dashboard
                        router.push('/admin/users');
                    },
                    onError: (err: any) => {
                        console.error('Error exchanging token:', err);
                        setError(err?.response?.data?.message || 'Failed to authenticate with backend');
                    },
                }
            );
        };

        exchangeToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, status]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-900">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
                    <div className="text-red-600 mb-4">{error}</div>
                    <button
                        onClick={() => router.push('/login')}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-900">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-700 text-lg">Completing Google login...</p>
            </div>
        </div>
    );
}
