'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/10 via-background to-destructive/5 p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center space-y-4 pb-2">
                    <div className="mx-auto flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-destructive/10">
                        <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" />
                    </div>
                    <CardTitle className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
                        Authentication Error
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        {errorMessage}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6 pb-6">
                    {error && (
                        <p className="text-xs sm:text-sm text-muted-foreground text-center">
                            Error code: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">{error}</code>
                        </p>
                    )}
                    <div className="space-y-3 pt-2">
                        <Button asChild className="w-full h-10 sm:h-11 font-semibold">
                            <Link href="/login">Back to Login</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full h-10 sm:h-11">
                            <Link href="/">Go to Home</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AuthError() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        }>
            <AuthErrorContent />
        </Suspense>
    );
}
