'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Profile {
    id: string;
    username: string;
    email: string;
    displayName?: string;
    bio?: string;
    pronouns?: string;
    profileImage?: string;
    githubUrl?: string;
    youtubeUrl?: string;
    discordUrl?: string;
    teamMembers: Array<{
        id: string;
        role?: string;
        team: {
            id: string;
            name: string;
            number: string;
        }
    }>;
}

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        pronouns: '',
        githubUrl: '',
        youtubeUrl: '',
        discordUrl: '',
    });

    const [teams, setTeams] = useState<Array<{ teamId: string; role: string }>>([]);
    const [newTeam, setNewTeam] = useState({ teamId: '', role: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/user/profile', {
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/auth');
                    return;
                }
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            setProfile(data.profile);

            setFormData({
                displayName: data.profile.displayName || '',
                bio: data.profile.bio || '',
                pronouns: data.profile.pronouns || '',
                githubUrl: data.profile.githubUrl || '',
                youtubeUrl: data.profile.youtubeUrl || '',
                discordUrl: data.profile.discordUrl || '',
            });

            setTeams(data.profile.teamMembers.map((member: any) => ({
                teamId: member.team.id,
                role: member.role || ''
            })));
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddTeam = () => {
        if (newTeam.teamId && !teams.some(t => t.teamId === newTeam.teamId)) {
            setTeams([...teams, newTeam]);
            setNewTeam({ teamId: '', role: '' });
        }
    };

    const handleRemoveTeam = (teamId: string) => {
        setTeams(teams.filter(t => t.teamId !== teamId));
    };

    const handleTeamRoleChange = (teamId: string, role: string) => {
        setTeams(teams.map(t => t.teamId === teamId ? { ...t, role } : t));
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const teamRoles: Record<string, string> = {};
            teams.forEach(t => {
                teamRoles[t.teamId] = t.role;
            });

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    teamIds: teams.map(t => t.teamId),
                    teamRoles,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const data = await response.json();
            setProfile(data.profile);
            setSuccess('Profile updated successfully!');

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving profile:', err);
            setError('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            router.push('/');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-600">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-700">{success}</p>
                    </div>
                )}

                {profile && (
                    <div className="space-y-8">
                        {/* Account Info */}
                        <section className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Username</label>
                                    <input
                                        type="text"
                                        value={profile.username}
                                        disabled
                                        className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Profile Information */}
                        <section className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        id="displayName"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleInputChange}
                                        placeholder="Your display name"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                                        Bio
                                    </label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        placeholder="Tell us about yourself"
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700">
                                        Pronouns
                                    </label>
                                    <input
                                        type="text"
                                        id="pronouns"
                                        name="pronouns"
                                        value={formData.pronouns}
                                        onChange={handleInputChange}
                                        placeholder="e.g., he/him, she/her, they/them"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* External Links */}
                        <section className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">External Links</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700">
                                        GitHub URL
                                    </label>
                                    <input
                                        type="url"
                                        id="githubUrl"
                                        name="githubUrl"
                                        value={formData.githubUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://github.com/username"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700">
                                        YouTube URL
                                    </label>
                                    <input
                                        type="url"
                                        id="youtubeUrl"
                                        name="youtubeUrl"
                                        value={formData.youtubeUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://youtube.com/channel/..."
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="discordUrl" className="block text-sm font-medium text-gray-700">
                                        Discord URL
                                    </label>
                                    <input
                                        type="url"
                                        id="discordUrl"
                                        name="discordUrl"
                                        value={formData.discordUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://discord.gg/..."
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* FTC Teams */}
                        <section className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">FTC Teams</h2>
                            
                            {teams.length > 0 && (
                                <div className="mb-6 space-y-2">
                                    {teams.map((team, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">Team {team.teamId}</p>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Drive Team, Programmer, Builder"
                                                    value={team.role}
                                                    onChange={(e) => handleTeamRoleChange(team.teamId, e.target.value)}
                                                    className="mt-1 text-sm border border-gray-300 rounded px-2 py-1 w-full"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleRemoveTeam(team.teamId)}
                                                className="ml-3 px-3 py-1 text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Team ID or Number"
                                    value={newTeam.teamId}
                                    onChange={(e) => setNewTeam({ ...newTeam, teamId: e.target.value })}
                                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Role (optional)"
                                    value={newTeam.role}
                                    onChange={(e) => setNewTeam({ ...newTeam, role: e.target.value })}
                                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                                />
                                <button
                                    onClick={handleAddTeam}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                                >
                                    Add Team
                                </button>
                            </div>
                        </section>

                        {/* Save Button */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Save Profile'}
                            </button>
                            <Link
                                href="/"
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 font-medium text-center"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
