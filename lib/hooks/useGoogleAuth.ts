import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAuthControllerGoogleAuthenticate } from '../services/authentication/authentication';

/**
 * Custom hook to handle Google authentication flow
 *
 * This hook:
 * 1. Gets the user session from NextAuth (includes Google ID token)
 * 2. Sends the ID token to backend for verification
 * 3. Receives backend JWT token
 * 4. Stores the JWT token for subsequent API calls
 */
export function useGoogleAuth() {
  const { data: session, status } = useSession();
  const googleAuthMutation = useAuthControllerGoogleAuthenticate();

  useEffect(() => {
    // When user signs in with NextAuth and we have a Google access token
    if (session?.accessToken && status === 'authenticated') {
      // Get the ID token from the session
      // Note: You need to ensure NextAuth provides the id_token in the session
      const idToken = (session as any).idToken;

      if (idToken && !localStorage.getItem('authToken')) {
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
              const authData = response.data as { token: string; user: unknown };
              localStorage.setItem('authToken', authData.token);
              console.log('Backend authentication successful:', authData.user);
            },
            onError: (error) => {
              console.error('Failed to authenticate with backend:', error);
            },
          }
        );
      }
    }
  }, [session, status]);

  const handleGoogleSignIn = async () => {
    await signIn('google', {
      callbackUrl: '/dashboard',
    });
  };

  return {
    handleGoogleSignIn,
    session,
    isLoading: status === 'loading' || googleAuthMutation.isPending,
    isAuthenticated: !!localStorage.getItem('authToken'),
    backendUser: (googleAuthMutation.data?.data as { user: unknown } | undefined)?.user,
  };
}
