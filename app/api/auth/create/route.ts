import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import argon2 from 'argon2';

interface CreateAccountBody {
    username: string;
    displayName?: string;
    password?: string;
    email: string;
    googleEmail?: string; // Original Google email
    identity?: 'google' | 'credentials';
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateAccountBody = await request.json();
        const { username, displayName, password, email, googleEmail, identity } = body;

        // Get token from cookies (if Google identity)
        const token = request.cookies.get('oauth_token')?.value;

        // Validate required fields
        if (!username || !email) {
            return NextResponse.json(
                { error: 'Missing required fields (username, email)' },
                { status: 400 }
            );
        }

        // If Google identity, verify the token
        if (identity === 'google') {
            if (!token) {
                return NextResponse.json(
                    { error: 'Token required for Google identity' },
                    { status: 400 }
                );
            }

            // Verify and decode the JWT token
            let decodedToken: any;
            try {
                decodedToken = jwt.verify(
                    token,
                    Buffer.from(process.env.GOOGLE_OAUTH_JWT_SECRET as string, 'hex')
                );
            } catch (err) {
                return NextResponse.json(
                    { error: 'Invalid or expired token' },
                    { status: 401 }
                );
            }

            // Verify the Google email from token matches the googleEmail parameter
            // This ensures the token wasn't tampered with
            if (decodedToken.email.toLowerCase() !== googleEmail?.toLowerCase()) {
                return NextResponse.json(
                    { error: 'Google email mismatch - token invalid' },
                    { status: 400 }
                );
            }
        } else {
            // For credentials auth, password is required
            if (!password) {
                return NextResponse.json(
                    { error: 'Password required for credentials authentication' },
                    { status: 400 }
                );
            }
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email: email.toLowerCase() }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username or email already taken' },
                { status: 409 }
            );
        }

        // Hash password if provided
        let digest: string | null = null;
        if (password) digest = await argon2.hash(password);

        // Create user account with the account email (not Google email)
        const user = await prisma.user.create({
            data: {
                username,
                email: email.toLowerCase(),
                displayName: displayName || undefined,
                digest,
            }
        });

        // Handle Google Identity
        if (identity === 'google' && token) {
            let decodedToken: any;
            try {
                decodedToken = jwt.verify(
                    token,
                    Buffer.from(process.env.GOOGLE_OAUTH_JWT_SECRET as string, 'hex')
                );
            } catch (err) {
                // Token already verified above, but decode again for tokens
                throw err;
            }

            if (decodedToken.tokens) {
                await prisma.googleIdentity.create({
                    data: {
                        userId: user.id,
                        googleEmail: googleEmail || decodedToken.email,
                        idToken: decodedToken.tokens.id_token,
                        accessToken: decodedToken.tokens.access_token,
                        refreshToken: decodedToken.tokens.refresh_token || '',
                        expiry: decodedToken.tokens.expiry_date 
                            ? new Date(decodedToken.tokens.expiry_date)
                            : new Date(Date.now() + 3600000), // 1 hour default
                    }
                });
            }
        }

        // Create session
        const sessionToken = randomBytes(32).toString('hex');
        const session = await prisma.session.create({
            data: {
                userId: user.id,
                token: sessionToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            }
        });

        // Set session cookie
        const response = NextResponse.json({
            message: 'Account created successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
            }
        }, { status: 201 });

        response.cookies.set('sessionId', session.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/'
        });

        response.cookies.set('sessionToken', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/'
        });

        // Clear oauth token
        response.cookies.set('oauth_token', '', { maxAge: 0, path: '/' });

        return response;
    } catch (error) {
        console.error('Account creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}