# Google Authentication Setup

This document explains the secure Google authentication flow implemented in this project.

## Architecture Overview

### Flow Diagram
```
User → NextAuth (Google OAuth) → Get ID Token → Backend Verification → Backend JWT
```

### Security Features
1. **Backend Token Verification**: The backend verifies Google ID tokens using `google-auth-library`
2. **No Trust of Frontend Data**: Backend doesn't trust user data from frontend, only verified Google tokens
3. **Separate JWT**: Backend issues its own JWT token for API authentication

## Backend Implementation

### 1. Google Auth Library
Installed: `google-auth-library`

### 2. Updated DTO ([google-token.dto.ts](../5sport-backend/src/modules/auth/dto/google-token.dto.ts))
```typescript
export class GoogleTokenDto {
  idToken: string; // Google ID token (JWT from Google)
}
```

### 3. Token Verification ([auth.service.ts](../5sport-backend/src/modules/auth/auth.service.ts:151-221))
- Verifies Google ID token using `OAuth2Client.verifyIdToken()`
- Extracts verified user data from token payload (email, name, picture, etc.)
- Creates or updates user in database
- Returns backend JWT token

### 4. API Endpoint
**POST** `/auth/google/authenticate`

**Request:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY4YTE1MmU0..."
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "username": null
  },
  "token": "backend-jwt-token"
}
```

## Frontend Implementation

### 1. NextAuth Configuration ([pages/api/auth/[...nextauth].ts](pages/api/auth/[...nextauth].ts))

Updated to capture and store the Google ID token:

```typescript
callbacks: {
  async jwt({ token, account }) {
    if (account) {
      token.idToken = account.id_token; // Capture ID token
    }
    return token;
  },
  async session({ session, token }) {
    session.idToken = token.idToken; // Include in session
    return session;
  },
}
```

### 2. Google Callback Page ([app/auth/google-callback/page.tsx](app/auth/google-callback/page.tsx))

Uses Orval-generated API client to send ID token to backend:

```typescript
import { useAuthControllerGoogleAuthenticate } from '@/lib/services/authentication/authentication';

const googleAuthMutation = useAuthControllerGoogleAuthenticate();

googleAuthMutation.mutate(
  {
    data: {
      idToken: session.idToken,
    },
  },
  {
    onSuccess: (response) => {
      localStorage.setItem('authToken', response.token);
      router.push('/dashboard');
    },
  }
);
```

### 3. Orval API Client

Auto-generated from backend Swagger spec:
- **Service**: [lib/services/authentication/authentication.ts](lib/services/authentication/authentication.ts)
- **Schema**: [lib/schemas/googleTokenDto.ts](lib/schemas/googleTokenDto.ts)

Regenerate after backend changes:
```bash
pnpm generate:api
```

## Authentication Flow

### Step-by-Step Process

1. **User Clicks "Login with Google"**
   - NextAuth redirects to Google OAuth consent screen

2. **User Authorizes**
   - Google redirects back with authorization code
   - NextAuth exchanges code for tokens (access_token, id_token)

3. **NextAuth Callback**
   - Stores id_token in session
   - Redirects to `/auth/google-callback`

4. **Frontend Verification Request**
   - Extracts `id_token` from session
   - Sends to backend at `POST /auth/google/authenticate`

5. **Backend Verification**
   - Verifies id_token with Google using `google-auth-library`
   - Extracts verified user info (email, name, picture)
   - Creates/updates user in database
   - Generates backend JWT token

6. **Frontend Receives JWT**
   - Stores backend JWT in localStorage as `authToken`
   - Redirects to dashboard

7. **Subsequent API Calls**
   - Axios interceptor automatically adds `Authorization: Bearer {authToken}` header
   - Backend validates JWT on protected routes

## Environment Variables

### Backend (.env)
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret
```

### Frontend (.env.local)
```env
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3001

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Security Benefits

### Why This Approach is Secure

1. **Token Verification**: Backend verifies the Google ID token cryptographically, ensuring it was issued by Google
2. **No User Data Spoofing**: Frontend cannot fake user data because backend only trusts verified token payload
3. **Backend Control**: Backend maintains full control over user creation and authentication
4. **Separate Sessions**: NextAuth session is separate from backend JWT, allowing independent session management
5. **Token Rotation**: Google tokens are short-lived; backend issues its own long-lived JWT

### Security Checklist

- ✅ Backend verifies Google ID tokens
- ✅ Backend doesn't trust frontend-provided user data
- ✅ HTTPS in production (required for OAuth)
- ✅ Secure token storage (httpOnly cookies recommended for production)
- ✅ CORS configured properly
- ✅ JWT secret is secure and random

## API Usage Examples

### Using Generated API Client

```typescript
import { useAuthControllerGoogleAuthenticate } from '@/lib/services/authentication/authentication';

function MyComponent() {
  const mutation = useAuthControllerGoogleAuthenticate();

  const handleAuth = (idToken: string) => {
    mutation.mutate({
      data: { idToken }
    }, {
      onSuccess: (response) => {
        console.log('User:', response.user);
        console.log('JWT:', response.token);
      }
    });
  };
}
```

### Manual API Call (Not Recommended)

```typescript
const response = await fetch('/api/auth/google/authenticate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken: 'your-google-id-token' })
});
```

## Troubleshooting

### "Invalid Google token" Error
- Check that `GOOGLE_CLIENT_ID` matches in both frontend and backend
- Ensure id_token is being passed, not access_token
- Verify Google OAuth consent screen is configured correctly

### "No ID token found in session"
- Check NextAuth callback is storing `account.id_token`
- Verify session callback is returning `idToken`
- Check [types/next-auth.d.ts](types/next-auth.d.ts) type declarations

### 404 on /api/auth/*
- Verify [next.config.ts](next.config.ts) excludes `/api/auth/*` from backend proxy
- Check that pages/api/auth/[...nextauth].ts exists

## Testing

### Test the Flow

1. Start backend: `cd 5sport-backend && pnpm dev`
2. Start frontend: `cd 5sport-fe && pnpm dev`
3. Navigate to http://localhost:3001/login
4. Click "Login with Google"
5. Complete Google OAuth flow
6. Should redirect to dashboard with backend JWT stored

### Verify Token
```bash
# Check if backend JWT is stored
# Open browser console:
localStorage.getItem('authToken')
```

## Production Considerations

1. **Use httpOnly Cookies**: Store JWT in httpOnly cookies instead of localStorage
2. **HTTPS Only**: OAuth requires HTTPS in production
3. **Rotate Secrets**: Regularly rotate JWT_SECRET and NEXTAUTH_SECRET
4. **Token Expiration**: Implement refresh token flow
5. **Rate Limiting**: Add rate limiting to prevent abuse
6. **Logging**: Log authentication attempts for security monitoring
