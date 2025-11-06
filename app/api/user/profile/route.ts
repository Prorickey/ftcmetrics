import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 
import { getSessionUser } from '@/lib/auth';

interface UpdateProfileBody {
    displayName?: string;
    bio?: string;
    pronouns?: string;
    githubUrl?: string;
    youtubeUrl?: string;
    discordUrl?: string;
    profileImage?: string;
    teamIds?: string[];
    teamRoles?: Record<string, string>; // teamId -> role mapping
}

export async function GET(request: NextRequest) {
    try {
        const user = await getSessionUser(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const profile = await prisma.user.findUnique({
            where: { id: (user as any).id },
            include: {
                teamMembers: {
                    include: {
                        team: true
                    }
                }
            }
        });

        return NextResponse.json({
            profile
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: 'Failed to get profile' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getSessionUser(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body: UpdateProfileBody = await request.json();
        const userId = (user as any).id;

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                displayName: body.displayName,
                bio: body.bio,
                pronouns: body.pronouns,
                githubUrl: body.githubUrl,
                youtubeUrl: body.youtubeUrl,
                discordUrl: body.discordUrl,
                profileImage: body.profileImage,
            },
            include: {
                teamMembers: {
                    include: {
                        team: true
                    }
                }
            }
        });

        // Handle team updates if provided
        if (body.teamIds) {
            // Delete existing team memberships
            await prisma.teamMember.deleteMany({
                where: { userId }
            });

            // Create new team memberships
            for (const teamId of body.teamIds) {
                const role = body.teamRoles?.[teamId] || null;
                await prisma.teamMember.create({
                    data: {
                        userId,
                        teamId,
                        role
                    }
                });
            }

            // Re-fetch user with updated teams
            const finalUser = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    teamMembers: {
                        include: {
                            team: true
                        }
                    }
                }
            });

            return NextResponse.json({
                message: 'Profile updated successfully',
                profile: finalUser
            });
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            profile: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
