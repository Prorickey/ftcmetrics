import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'

export async function getSessionUser(request: NextRequest) {
    try {
        const sessionId = request.cookies.get('sessionId')?.value;
        const sessionToken = request.cookies.get('sessionToken')?.value;

        if (!sessionId || !sessionToken) {
            return null;
        }

        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: { user: true }
        });

        if (!session || session.token !== sessionToken) {
            return null;
        }

        // Check if session is expired
        if (session.expiresAt < new Date()) {
            await prisma.session.delete({ where: { id: sessionId } });
            return null;
        }

        return session.user;
    } catch (error) {
        console.error('Session validation error:', error);
        return null;
    }
}

export async function requireAuth(request: NextRequest) {
    const user = await getSessionUser(request);
    
    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    return user;
}
