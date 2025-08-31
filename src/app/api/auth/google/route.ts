
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const provider = new GoogleAuthProvider();
        // The signInWithRedirect function will handle the redirect to Google's sign-in page.
        // Firebase handles the session and redirect logic. After signing in, Google will
        // redirect back to your app at a location that Firebase Auth determines.
        // We set up the callback page to catch this redirect.
        await signInWithRedirect(auth, provider);
        
        // This response is mainly for the server log, as the user will be redirected.
        return NextResponse.json({ message: 'Redirecting to Google for authentication...' });

    } catch (error: any) {
        console.error('Error during Google sign-in initiation:', error);
        // If there's an error before redirect, redirect to the login page with an error.
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('error', 'google_signin_failed');
        return NextResponse.redirect(loginUrl);
    }
}
