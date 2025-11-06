import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        
        if (!user || typeof user === 'string') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Delete all sessions for this user
        await prisma.session.deleteMany({
            where: { userId: (user as any).id }
        });

        const response = NextResponse.json({
            message: 'Logged out successfully'
        });

        // Clear session cookies
        response.cookies.set('sessionId', '', { maxAge: 0, path: '/' });
        response.cookies.set('sessionToken', '', { maxAge: 0, path: '/' });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Failed to logout' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
