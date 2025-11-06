import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getSessionUser(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const identities = await prisma.user.findUnique({
            where: { id: (user as any).id },
            select: {
                email: true,
                digest: true,
                google: {
                    select: {
                        googleEmail: true,
                    }
                }
            }
        });

        return NextResponse.json({
            identities: {
                email: identities?.email,
                hasPassword: !!identities?.digest,
                hasGoogle: !!identities?.google,
                googleEmail: identities?.google?.googleEmail
            }
        });
    } catch (error) {
        console.error('Get identities error:', error);
        return NextResponse.json(
            { error: 'Failed to get identities' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getSessionUser(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = request.nextUrl;
        const identityType = searchParams.get('type'); // 'google' or 'password'
        const userId = (user as any).id;

        if (!identityType || !['google', 'password'].includes(identityType)) {
            return NextResponse.json(
                { error: 'Invalid identity type' },
                { status: 400 }
            );
        }

        if (identityType === 'google') {
            // Check if user has at least one other auth method
            const userAuth = await prisma.user.findUnique({
                where: { id: userId },
                select: { digest: true, google: true }
            });

            if (!userAuth?.digest) {
                return NextResponse.json(
                    { error: 'Cannot remove Google identity without a password' },
                    { status: 400 }
                );
            }

            await prisma.googleIdentity.delete({
                where: { userId }
            });
        } else if (identityType === 'password') {
            // Check if user has at least one other auth method
            const userAuth = await prisma.user.findUnique({
                where: { id: userId },
                select: { digest: true, google: true }
            });

            if (!userAuth?.google) {
                return NextResponse.json(
                    { error: 'Cannot remove password without a Google identity' },
                    { status: 400 }
                );
            }

            await prisma.user.update({
                where: { id: userId },
                data: { digest: null }
            });
        }

        return NextResponse.json({
            message: `${identityType} identity removed successfully`
        });
    } catch (error) {
        console.error('Delete identity error:', error);
        return NextResponse.json(
            { error: 'Failed to remove identity' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
