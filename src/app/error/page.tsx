'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get('message');

  const getErrorMessage = () => {
    switch (message) {
      case 'invalid_token':
        return 'Invalid or missing verification token. Please request a new link.';
      case 'verification_failed':
        return 'Email verification failed. The link may have expired.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="bg-surface rounded-lg shadow-md border border-gray-800 p-8">
          <div className="text-center mb-6">
            <div className="text-error text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Something went wrong
            </h1>
            <p className="text-text-secondary">
              {getErrorMessage()}
            </p>
          </div>

          <button
            onClick={() => router.push('/admin/login')}
            className="w-full bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-text-primary">Loading...</p>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
