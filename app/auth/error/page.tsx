'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams?.get('error');

    const errorMessages: Record<string, string> = {
        Configuration: 'There is a problem with the server configuration.',
        AccessDenied: 'You do not have permission to sign in.',
        Verification: 'The verification token has expired or has already been used.',
        OAuthSignin: 'Error in constructing an OAuth sign in request.',
        OAuthCallback: 'Error in handling the response from the OAuth provider.',
        OAuthCreateAccount: 'Could not create OAuth provider user in the database.',
        EmailCreateAccount: 'Could not create email provider user in the database.',
        Callback: 'Error in the OAuth callback handler route.',
        OAuthAccountNotLinked: 'Email already associated with another account.',
        EmailSignin: 'Sending the email with the verification link failed.',
        CredentialsSignin: 'Sign in failed. Check the details you provided are correct.',
        SessionRequired: 'Please sign in to access this page.',
        Default: 'Unable to sign in.',
    };

    const errorMessage = error
        ? errorMessages[error] || errorMessages.Default
        : errorMessages.Default;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg
                            className="h-6 w-6 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Authentication Error
                    </h1>
                    <p className="text-gray-600 mb-6">{errorMessage}</p>
                    {error && (
                        <p className="text-sm text-gray-500 mb-6">Error code: {error}</p>
                    )}
                    <div className="space-y-3">
                        <Link
                            href="/login"
                            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Back to Login
                        </Link>
                        <Link
                            href="/"
                            className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Go to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthError() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        }>
            <AuthErrorContent />
        </Suspense>
    );
}
