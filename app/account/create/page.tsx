'use client'

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function CreateAccount() {
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
                    email: email || userEmail,
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
    const emailRequired = isGoogleSignup;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isGoogleSignup ? 'Complete Your Account' : 'Create Account'}
                    </h2>
                    {isGoogleSignup && (
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Signing up with Google: {email}
                        </p>
                    )}
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Email Field - Locked for Google Identity, Editable for credentials */}
                    {emailRequired && (
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email || ''}
                                disabled
                                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 cursor-not-allowed"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Email is locked when signing up with Google
                            </p>
                        </div>
                    )}

                    {!emailRequired && (
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                required
                                placeholder="your@email.com"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                            />
                        </div>
                    )}

                    {/* Username Field */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username *
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Choose a username"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        />
                    </div>

                    {/* Display Name Field */}
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                            Display Name (optional)
                        </label>
                        <input
                            type="text"
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your display name"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        />
                    </div>

                    {/* Password Field */}
                    {!isGoogleSignup && (
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password *
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter a password"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                            />
                        </div>
                    )}

                    {isGoogleSignup && (
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password (optional)
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Add a password for extra security"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                            />
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !username || (!isGoogleSignup && (!userEmail || !password))}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                {!isGoogleSignup && (
                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <a href="/login" className="text-indigo-600 hover:text-indigo-500">
                            Sign in
                        </a>
                    </p>
                )}
            </div>
        </div>
    );
}