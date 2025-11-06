import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const code = searchParams.get('code');

        if(!code) return Response.json({ error: "Missing code from query params" }, { status: 401 })

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_OAUTH_CLIENT_ID,
            process.env.GOOGLE_OAUTH_CLIENT_SECRET,
            "http://localhost:3000/api/auth/google/callback"
        );

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });

        let email = null
        const userinfo = await oauth2.userinfo.get();
        if(userinfo.data.verified_email) email = userinfo.data.email

        if(!email) return Response.json({ error: "Could not retrieve verified account" }, { status: 401 })

        email = email.toLowerCase()

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        // If user exists, create session and redirect to home
        if (existingUser) {
            const sessionToken = randomBytes(32).toString('hex');
            const session = await prisma.session.create({
                data: {
                    userId: existingUser.id,
                    token: sessionToken,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                }
            });

            const response = NextResponse.redirect('http://localhost:3000/', { status: 302 });
            
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

            await prisma.$disconnect();
            return response;
        }

        // User doesn't exist, proceed to account creation
        const jwtToken = jwt.sign({
            tokens,
            email
        }, Buffer.from(process.env.GOOGLE_OAUTH_JWT_SECRET as string, 'hex'))
        
        // Redirect to account creation page with email and identity in query params
        const response = NextResponse.redirect(`http://localhost:3000/account/create?email=${encodeURIComponent(email)}&identity=google`, { status: 302 })
        response.cookies.set('oauth_token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 10 * 60, // 10 minutes
            path: '/'
        })
        
        await prisma.$disconnect();
        return response;
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        return Response.json({ error: "Authentication failed" }, { status: 500 })
    }
}