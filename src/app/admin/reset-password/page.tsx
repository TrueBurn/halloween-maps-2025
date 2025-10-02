'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '~/lib/supabase/client';
import { Loader2 } from 'lucide-react';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we have a valid token/session
    const checkToken = async () => {
      const supabase = createClient();

      // First check if there's a token_hash in the URL (from Supabase email links)
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (tokenHash && type) {
        // Supabase automatically exchanges the token for a session
        // Just wait a moment for the auth state to update
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Now check for session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setValidToken(true);
      } else {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    };

    checkToken();
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push('/admin');
    }, 2000);
  };

  const handleRequestReset = async () => {
    const email = prompt('Enter your email address:');
    if (!email) return;

    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    alert('Password reset email sent! Check your inbox.');
    setLoading(false);
  };

  if (!validToken && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-text-primary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Verifying reset link...</span>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md px-4">
          <div className="bg-surface rounded-lg shadow-md border border-gray-800 p-8 text-center">
            <div className="text-success text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Password Updated!
            </h1>
            <p className="text-text-secondary mb-4">
              Redirecting to admin panel...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="bg-surface rounded-lg shadow-md border border-gray-800 p-8">
          <h1 className="text-2xl font-bold text-text-primary mb-6 text-center">
            {validToken ? 'Set New Password' : 'Password Reset'}
          </h1>

          {validToken ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-background border border-gray-700 rounded-lg text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-background border border-gray-700 rounded-lg text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Confirm new password"
                />
              </div>

              {error && (
                <div className="bg-red-950/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-950/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>

              <button
                onClick={handleRequestReset}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Request New Reset Link'
                )}
              </button>

              <div className="text-center">
                <button
                  onClick={() => router.push('/admin/login')}
                  className="text-primary hover:underline text-sm"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex items-center gap-2 text-text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
