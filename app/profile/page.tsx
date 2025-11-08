'use client';

import { useCallback, useEffect, useState } from 'react';
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
    };
  }>;
}

interface Identities {
  email: string;
  hasPassword: boolean;
  hasGoogle: boolean;
  googleEmail?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [identities, setIdentities] = useState<Identities | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingIdentity, setRemovingIdentity] = useState<string | null>(null);
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

  const [teams, setTeams] = useState<Array<{ teamId: string; role: string }>>(
    []
  );
  const [newTeam, setNewTeam] = useState({ teamId: '', role: '' });

  const fetchIdentities = useCallback(async () => {
    try {
      const response = await fetch('/api/user/identities', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setIdentities(data.identities);
      }
    } catch (err) {
      console.error('Error fetching identities:', err);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include',
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

      setTeams(
        data.profile.teamMembers.map((member: any) => ({
          teamId: member.team.id,
          role: member.role || '',
        }))
      );
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
    fetchIdentities();
  }, [fetchProfile, fetchIdentities]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTeam = () => {
    if (newTeam.teamId && !teams.some((t) => t.teamId === newTeam.teamId)) {
      setTeams([...teams, newTeam]);
      setNewTeam({ teamId: '', role: '' });
    }
  };

  const handleRemoveTeam = (teamId: string) => {
    setTeams(teams.filter((t) => t.teamId !== teamId));
  };

  const handleTeamRoleChange = (teamId: string, role: string) => {
    setTeams(teams.map((t) => (t.teamId === teamId ? { ...t, role } : t)));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const teamRoles: Record<string, string> = {};
      teams.forEach((t) => {
        teamRoles[t.teamId] = t.role;
      });

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          teamIds: teams.map((t) => t.teamId),
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

  const handleRemoveIdentity = async (identityType: 'google' | 'password') => {
    if (
      !confirm(`Are you sure you want to remove your ${identityType} identity?`)
    ) {
      return;
    }

    setRemovingIdentity(identityType);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `/api/user/identities?type=${identityType}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove identity');
      }

      setSuccess(`${identityType} identity removed successfully`);
      await fetchIdentities();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error removing identity:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to remove identity'
      );
    } finally {
      setRemovingIdentity(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-gray-600'>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow'>
        <div className='mx-auto flex max-w-4xl items-center justify-between px-4 py-4'>
          <h1 className='text-2xl font-bold text-gray-900'>Profile</h1>
          <button
            onClick={handleLogout}
            className='px-4 py-2 font-medium text-red-600 hover:text-red-700'
          >
            Logout
          </button>
        </div>
      </header>

      <main className='mx-auto max-w-4xl px-4 py-8'>
        {error && (
          <div className='mb-4 rounded-md border border-red-200 bg-red-50 p-4'>
            <p className='text-red-700'>{error}</p>
          </div>
        )}

        {success && (
          <div className='mb-4 rounded-md border border-green-200 bg-green-50 p-4'>
            <p className='text-green-700'>{success}</p>
          </div>
        )}

        {profile && (
          <div className='space-y-8'>
            {/* Account Info */}
            <section className='rounded-lg bg-white p-6 shadow'>
              <h2 className='mb-4 text-lg font-semibold text-gray-900'>
                Account Information
              </h2>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Username
                  </label>
                  <input
                    type='text'
                    value={profile.username}
                    disabled
                    className='mt-1 block w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Email
                  </label>
                  <input
                    type='email'
                    value={profile.email}
                    disabled
                    className='mt-1 block w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600'
                  />
                </div>
              </div>
            </section>

            {/* Connected Identities */}
            {identities && (
              <section className='rounded-lg bg-white p-6 shadow'>
                <h2 className='mb-4 text-lg font-semibold text-gray-900'>
                  Connected Identities
                </h2>
                <div className='space-y-4'>
                  {/* Email/Password */}
                  <div className='flex items-center justify-between rounded-lg border border-gray-200 p-4'>
                    <div>
                      <p className='font-medium text-gray-900'>
                        Email & Password
                      </p>
                      <p className='text-sm text-gray-600'>
                        {identities.email}
                      </p>
                      {!identities.hasPassword && (
                        <p className='mt-1 text-sm text-amber-600'>
                          No password set
                        </p>
                      )}
                    </div>
                    {identities.hasGoogle && identities.hasPassword && (
                      <button
                        onClick={() => handleRemoveIdentity('password')}
                        disabled={removingIdentity === 'password'}
                        className='px-4 py-2 font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {removingIdentity === 'password'
                          ? 'Removing...'
                          : 'Remove'}
                      </button>
                    )}
                  </div>

                  {/* Google */}
                  {identities.hasGoogle && (
                    <div className='flex items-center justify-between rounded-lg border border-gray-200 p-4'>
                      <div>
                        <p className='font-medium text-gray-900'>
                          Google Account
                        </p>
                        <p className='text-sm text-gray-600'>
                          {identities.googleEmail}
                        </p>
                      </div>
                      {identities.hasPassword && (
                        <button
                          onClick={() => handleRemoveIdentity('google')}
                          disabled={removingIdentity === 'google'}
                          className='px-4 py-2 font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          {removingIdentity === 'google'
                            ? 'Removing...'
                            : 'Remove'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <p className='mt-4 text-sm text-gray-600'>
                  You must have at least one authentication method. You cannot
                  remove your only sign-in method.
                </p>
              </section>
            )}
            <section className='rounded-lg bg-white p-6 shadow'>
              <h2 className='mb-4 text-lg font-semibold text-gray-900'>
                Profile Information
              </h2>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='displayName'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Display Name
                  </label>
                  <input
                    type='text'
                    id='displayName'
                    name='displayName'
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder='Your display name'
                    className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none'
                  />
                </div>

                <div>
                  <label
                    htmlFor='bio'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Bio
                  </label>
                  <textarea
                    id='bio'
                    name='bio'
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder='Tell us about yourself'
                    rows={4}
                    className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none'
                  />
                </div>

                <div>
                  <label
                    htmlFor='pronouns'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Pronouns
                  </label>
                  <input
                    type='text'
                    id='pronouns'
                    name='pronouns'
                    value={formData.pronouns}
                    onChange={handleInputChange}
                    placeholder='e.g., he/him, she/her, they/them'
                    className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none'
                  />
                </div>
              </div>
            </section>

            {/* External Links */}
            <section className='rounded-lg bg-white p-6 shadow'>
              <h2 className='mb-4 text-lg font-semibold text-gray-900'>
                External Links
              </h2>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='githubUrl'
                    className='block text-sm font-medium text-gray-700'
                  >
                    GitHub URL
                  </label>
                  <input
                    type='url'
                    id='githubUrl'
                    name='githubUrl'
                    value={formData.githubUrl}
                    onChange={handleInputChange}
                    placeholder='https://github.com/username'
                    className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none'
                  />
                </div>

                <div>
                  <label
                    htmlFor='youtubeUrl'
                    className='block text-sm font-medium text-gray-700'
                  >
                    YouTube URL
                  </label>
                  <input
                    type='url'
                    id='youtubeUrl'
                    name='youtubeUrl'
                    value={formData.youtubeUrl}
                    onChange={handleInputChange}
                    placeholder='https://youtube.com/channel/...'
                    className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none'
                  />
                </div>

                <div>
                  <label
                    htmlFor='discordUrl'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Discord URL
                  </label>
                  <input
                    type='url'
                    id='discordUrl'
                    name='discordUrl'
                    value={formData.discordUrl}
                    onChange={handleInputChange}
                    placeholder='https://discord.gg/...'
                    className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none'
                  />
                </div>
              </div>
            </section>

            {/* FTC Teams */}
            <section className='rounded-lg bg-white p-6 shadow'>
              <h2 className='mb-4 text-lg font-semibold text-gray-900'>
                FTC Teams
              </h2>

              {teams.length > 0 && (
                <div className='mb-6 space-y-2'>
                  {teams.map((team, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between rounded-md bg-gray-50 p-3'
                    >
                      <div className='flex-1'>
                        <p className='font-medium text-gray-900'>
                          Team {team.teamId}
                        </p>
                        <input
                          type='text'
                          placeholder='e.g., Drive Team, Programmer, Builder'
                          value={team.role}
                          onChange={(e) =>
                            handleTeamRoleChange(team.teamId, e.target.value)
                          }
                          className='mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm'
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveTeam(team.teamId)}
                        className='ml-3 px-3 py-1 font-medium text-red-600 hover:text-red-700'
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className='flex gap-2'>
                <input
                  type='text'
                  placeholder='Team ID or Number'
                  value={newTeam.teamId}
                  onChange={(e) =>
                    setNewTeam({ ...newTeam, teamId: e.target.value })
                  }
                  className='flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none'
                />
                <input
                  type='text'
                  placeholder='Role (optional)'
                  value={newTeam.role}
                  onChange={(e) =>
                    setNewTeam({ ...newTeam, role: e.target.value })
                  }
                  className='flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none'
                />
                <button
                  onClick={handleAddTeam}
                  className='rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700'
                >
                  Add Team
                </button>
              </div>
            </section>

            {/* Save Button */}
            <div className='flex gap-4'>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className='flex-1 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              <Link
                href='/'
                className='flex-1 rounded-md bg-gray-200 px-4 py-2 text-center font-medium text-gray-900 hover:bg-gray-300'
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
