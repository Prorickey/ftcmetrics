'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function CreateAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email');
  const identity = searchParams.get('identity');

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If coming from Google callback, email should be present
    // Otherwise, this is a regular signup page
    if (!email && identity === 'google') {
      router.push('/');
    }
  }, [email, identity, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // For non-Google identity, password is required
      if (identity !== 'google' && !password) {
        setError('Password is required');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies (oauth_token, oauth_email)
        body: JSON.stringify({
          username,
          displayName: displayName || undefined,
          password: password || undefined,
          email: userEmail || email, // Use account email, fallback to Google email
          googleEmail: email, // Store the original Google email
          identity: identity || 'credentials',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        return;
      }

      // Redirect to dashboard or home page on success
      router.push('/');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isGoogleSignup = identity === 'google';

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            {isGoogleSignup ? 'Complete Your Account' : 'Create Account'}
          </h2>
          {isGoogleSignup && (
            <p className='mt-2 text-center text-sm text-gray-600'>
              Google account: {email}
            </p>
          )}
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          {error && (
            <div className='rounded-md bg-red-50 p-4'>
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          )}

          {/* Google Email (Read-only, informational) */}
          {isGoogleSignup && (
            <div>
              <label
                htmlFor='googleEmail'
                className='block text-sm font-medium text-gray-700'
              >
                Google Email
              </label>
              <input
                type='email'
                id='googleEmail'
                value={email || ''}
                disabled
                className='mt-1 block w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500'
              />
              <p className='mt-1 text-sm text-gray-500'>
                Your Google account email (cannot be changed)
              </p>
            </div>
          )}

          {/* Account Email - Editable for all users */}
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'
            >
              Account Email{' '}
              {isGoogleSignup && '(optional, can differ from Google email)'}*
            </label>
            <input
              type='email'
              id='email'
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required={!isGoogleSignup}
              placeholder={
                isGoogleSignup
                  ? 'Leave blank to use Google email'
                  : 'your@email.com'
              }
              className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none'
            />
            {isGoogleSignup && (
              <p className='mt-1 text-sm text-gray-500'>
                You can use a different email for your account, or leave this
                blank to use your Google email
              </p>
            )}
          </div>

          {/* Username Field */}
          <div>
            <label
              htmlFor='username'
              className='block text-sm font-medium text-gray-700'
            >
              Username *
            </label>
            <input
              type='text'
              id='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder='Choose a username'
              className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none'
            />
          </div>

          {/* Display Name Field */}
          <div>
            <label
              htmlFor='displayName'
              className='block text-sm font-medium text-gray-700'
            >
              Display Name (optional)
            </label>
            <input
              type='text'
              id='displayName'
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder='Your display name'
              className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none'
            />
          </div>

          {/* Password Field */}
          {!isGoogleSignup && (
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                Password *
              </label>
              <input
                type='password'
                id='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder='Enter a password'
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none'
              />
            </div>
          )}

          {isGoogleSignup && (
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                Password (optional)
              </label>
              <input
                type='password'
                id='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Add a password for password sign in'
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none'
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type='submit'
            disabled={
              loading ||
              !username ||
              (!isGoogleSignup && (!userEmail || !password))
            }
            className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {!isGoogleSignup && (
          <p className='text-center text-sm text-gray-600'>
            Already have an account?{' '}
            <a href='/login' className='text-indigo-600 hover:text-indigo-500'>
              Sign in
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

function CreateAccountLoading() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <p className='text-gray-600'>Loading...</p>
      </div>
    </div>
  );
}

export default function CreateAccount() {
  return (
    <Suspense fallback={<CreateAccountLoading />}>
      <CreateAccountForm />
    </Suspense>
  );
}