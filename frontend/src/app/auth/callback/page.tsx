'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Exchange the code for a session
        const code = searchParams.get('code');

        if (code) {
          console.log('🔐 Processing OAuth callback with code...');

          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('❌ Error exchanging code:', exchangeError);
            setError(exchangeError.message);
            setStatus('error');
            return;
          }

          if (data?.session) {
            console.log('✅ OAuth session established:', data.session.user.id);

            // Sync user with backend
            try {
              const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
              const response = await fetch(`${API_BASE_URL}/auth/oauth-callback`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${data.session.access_token}`,
                },
                body: JSON.stringify({
                  userId: data.session.user.id,
                  email: data.session.user.email,
                  name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name,
                  avatar: data.session.user.user_metadata?.avatar_url || data.session.user.user_metadata?.picture,
                }),
              });

              if (!response.ok) {
                console.warn('⚠️ Backend sync failed, but user is authenticated');
              } else {
                const backendData = await response.json();
                console.log('✅ User synced with backend', backendData);

                // Check if this is a new user who needs to select a role
                if (backendData.data?.isNewUser) {
                  console.log('🆕 New user detected, redirecting to role selection');
                  setStatus('success');
                  // Redirect to role selection page
                  setTimeout(() => {
                    router.push('/auth/select-role');
                  }, 1000);
                  return;
                }
              }
            } catch (syncError) {
              console.warn('⚠️ Backend sync error:', syncError);
              // Continue anyway - user is authenticated in Supabase
            }

            setStatus('success');

            // Redirect to home page
            setTimeout(() => {
              router.push('/');
            }, 1000);
          }
        } else {
          // Check if there's an error in the URL
          const errorParam = searchParams.get('error');
          const errorDescription = searchParams.get('error_description');

          if (errorParam) {
            console.error('❌ OAuth error:', errorParam, errorDescription);
            setError(errorDescription || errorParam);
            setStatus('error');
          } else {
            setError('No authorization code found');
            setStatus('error');
          }
        }
      } catch (err) {
        console.error('❌ Callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');
      }
    };

    handleOAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Completing sign in...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we set up your account
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Sign in successful!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting you to the home page...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Authentication failed
            </h2>
            <p className="mt-2 text-sm text-red-600">
              {error || 'Something went wrong'}
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
            >
              Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
