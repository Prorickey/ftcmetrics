'use client';
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Download,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { hello } from 'ftcmetrics-api'

interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
}

const TeamsInsights = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('epa');
  const [selectedYear, setSelectedYear] = useState('2025');

  const metrics = [
    { id: 'epa', label: 'Total EPA', description: 'Expected Points Added' },
    { id: 'auto', label: 'Auto EPA', description: 'Autonomous Performance' },
    {
      id: 'teleop',
      label: 'TeleOp EPA',
      description: 'Driver Control Performance',
    },
    { id: 'endgame', label: 'Endgame EPA', description: 'Endgame Performance' },
  ];

  const years = ['2025', '2024', '2023', '2022'];

  const topTeams = [
    {
      rank: 1,
      team: '19458',
      name: 'Mechanical Paradox',
      epa: 142.8,
      change: 2.4,
      trend: 'up',
      wins: 45,
      losses: 3,
      region: 'California',
      country: 'USA',
    },
    {
      rank: 2,
      team: '18219',
      name: 'Robo Dominators',
      epa: 138.2,
      change: -1.2,
      trend: 'down',
      wins: 42,
      losses: 6,
      region: 'Texas',
      country: 'USA',
    },
    {
      rank: 3,
      team: '16405',
      name: 'Quantum Mechanics',
      epa: 135.6,
      change: 0,
      trend: 'stable',
      wins: 40,
      losses: 5,
      region: 'Michigan',
      country: 'USA',
    },
    {
      rank: 4,
      team: '14320',
      name: 'Circuit Breakers',
      epa: 132.4,
      change: 3.8,
      trend: 'up',
      wins: 38,
      losses: 7,
      region: 'North Carolina',
      country: 'USA',
    },
    {
      rank: 5,
      team: '17225',
      name: 'Gear Heads',
      epa: 129.7,
      change: 1.5,
      trend: 'up',
      wins: 36,
      losses: 8,
      region: 'Ohio',
      country: 'USA',
    },
    {
      rank: 6,
      team: '13579',
      name: 'Robotics Elite',
      epa: 127.3,
      change: -0.8,
      trend: 'down',
      wins: 35,
      losses: 9,
      region: 'New York',
      country: 'USA',
    },
    {
      rank: 7,
      team: '15896',
      name: 'Tech Titans',
      epa: 124.9,
      change: 2.1,
      trend: 'up',
      wins: 34,
      losses: 10,
      region: 'Florida',
      country: 'USA',
    },
    {
      rank: 8,
      team: '12458',
      name: 'Cyber Hawks',
      epa: 122.5,
      change: 0.3,
      trend: 'stable',
      wins: 33,
      losses: 11,
      region: 'Washington',
      country: 'USA',
    },
    {
      rank: 9,
      team: '11234',
      name: 'Steel Soldiers',
      epa: 120.1,
      change: 1.8,
      trend: 'up',
      wins: 32,
      losses: 12,
      region: 'Illinois',
      country: 'USA',
    },
    {
      rank: 10,
      team: '19876',
      name: 'Digital Dynamos',
      epa: 118.4,
      change: -1.5,
      trend: 'down',
      wins: 31,
      losses: 13,
      region: 'Georgia',
      country: 'USA',
    },
    {
      rank: 11,
      team: '16789',
      name: 'Voltage Vikings',
      epa: 116.7,
      change: 0.9,
      trend: 'up',
      wins: 30,
      losses: 14,
      region: 'Pennsylvania',
      country: 'USA',
    },
    {
      rank: 12,
      team: '14567',
      name: 'Binary Blazers',
      epa: 115.2,
      change: -0.4,
      trend: 'down',
      wins: 29,
      losses: 15,
      region: 'Virginia',
      country: 'USA',
    },
    {
      rank: 13,
      team: '18901',
      name: 'Atomic Automation',
      epa: 113.8,
      change: 2.3,
      trend: 'up',
      wins: 28,
      losses: 16,
      region: 'Maryland',
      country: 'USA',
    },
    {
      rank: 14,
      team: '13456',
      name: 'Cyber Cyclones',
      epa: 112.5,
      change: 0.7,
      trend: 'up',
      wins: 27,
      losses: 17,
      region: 'Arizona',
      country: 'USA',
    },
    {
      rank: 15,
      team: '17890',
      name: 'Mega Mechanics',
      epa: 111.1,
      change: -1.1,
      trend: 'down',
      wins: 26,
      losses: 18,
      region: 'Colorado',
      country: 'USA',
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      window.location.reload();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up')
      return <TrendingUp className='h-4 w-4 text-emerald-600' />;
    if (trend === 'down')
      return <TrendingDown className='h-4 w-4 text-rose-600' />;
    return <Minus className='h-4 w-4 text-slate-400' />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-emerald-600';
    if (trend === 'down') return 'text-rose-600';
    return 'text-slate-600';
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-slate-100 text-slate-700 border-slate-300';
    if (rank === 3) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-blue-100 text-blue-700 border-blue-300';
  };

  console.log(hello("test"))

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
      {/* Navigation Header */}
      <div className='border-b border-slate-200 bg-white shadow-sm'>
        <div className='mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3'>
          <Link href='/' className='text-2xl font-bold text-slate-900'>
            FTC Metrics
          </Link>
          <div className='flex items-center gap-4'>
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <span className='text-sm font-medium text-slate-700'>
                      Hi, {user.displayName || user.username}
                    </span>
                    <Link
                      href='/profile'
                      className='rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200'
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className='rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700'
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href='/auth'
                      className='rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200'
                    >
                      Login
                    </Link>
                    <Link
                      href='/auth'
                      className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700'
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className='border-b border-slate-200 bg-white shadow-sm'>
        <div className='mx-auto max-w-[1600px] px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-slate-900'>
                Teams Insights
              </h1>
              <p className='mt-0.5 text-sm text-slate-600'>
                Global FTC team performance rankings and analytics
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className='rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year} Season
                  </option>
                ))}
              </select>
              <button className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-blue-700'>
                <Download className='h-4 w-4' />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-[1600px] px-6 py-6'>
        {/* Metric Selector */}
        <div className='mb-6'>
          <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='mb-4 flex items-center gap-2'>
              <Filter className='h-5 w-5 text-slate-600' />
              <h2 className='text-lg font-semibold text-slate-900'>
                Select Metric
              </h2>
            </div>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
              {metrics.map((metric) => (
                <button
                  key={metric.id}
                  onClick={() => setSelectedMetric(metric.id)}
                  className={`rounded-lg px-4 py-3 text-left transition-all duration-200 ${
                    selectedMetric === metric.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className='text-sm font-semibold'>{metric.label}</div>
                  <div
                    className={`mt-0.5 text-xs ${selectedMetric === metric.id ? 'text-blue-100' : 'text-slate-500'}`}
                  >
                    {metric.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
          {[
            {
              label: 'Total Teams',
              value: '8,247',
              change: '+12%',
              trend: 'up',
              color: 'blue',
            },
            {
              label: 'Active Events',
              value: '342',
              change: '+8%',
              trend: 'up',
              color: 'emerald',
            },
            {
              label: 'Avg EPA',
              value: '68.4',
              change: '-2%',
              trend: 'down',
              color: 'purple',
            },
            {
              label: 'Matches Played',
              value: '24,891',
              change: '+15%',
              trend: 'up',
              color: 'orange',
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md'
            >
              <div className='mb-3 flex items-start justify-between'>
                <span className='text-sm font-medium text-slate-600'>
                  {stat.label}
                </span>
                {getTrendIcon(stat.trend)}
              </div>
              <div className='flex items-end gap-2'>
                <span className='text-3xl font-bold text-slate-900'>
                  {stat.value}
                </span>
                <span
                  className={`mb-1 text-sm font-semibold ${getTrendColor(stat.trend)}`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Top Teams Table */}
        <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
          <div className='border-b border-slate-200 bg-slate-50 px-6 py-4'>
            <h2 className='text-lg font-semibold text-slate-900'>
              Top Performing Teams
            </h2>
            <p className='mt-0.5 text-sm text-slate-600'>
              Based on {metrics.find((m) => m.id === selectedMetric)?.label}{' '}
              rankings
            </p>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-slate-200 bg-slate-50'>
                  <th className='px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-700 uppercase'>
                    Rank
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-700 uppercase'>
                    Team
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-700 uppercase'>
                    Location
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-semibold tracking-wider text-slate-700 uppercase'>
                    EPA
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-semibold tracking-wider text-slate-700 uppercase'>
                    Change
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-semibold tracking-wider text-slate-700 uppercase'>
                    Record
                  </th>
                  <th className='px-6 py-3'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {topTeams.map((team, idx) => (
                  <tr
                    key={team.team}
                    className='cursor-pointer transition-colors hover:bg-blue-50/50'
                  >
                    <td className='px-6 py-4'>
                      <span
                        className={`inline-flex h-8 w-12 items-center justify-center rounded-lg border text-sm font-bold ${getRankBadgeColor(team.rank)}`}
                      >
                        #{team.rank}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <div>
                        <div className='text-base font-bold text-blue-600'>
                          {team.team}
                        </div>
                        <div className='text-sm text-slate-700'>
                          {team.name}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='text-sm text-slate-700'>
                        <div>{team.region}</div>
                        <div className='text-xs text-slate-500'>
                          {team.country}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <span className='text-lg font-bold text-slate-900'>
                        {team.epa}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex items-center justify-end gap-1.5'>
                        {getTrendIcon(team.trend)}
                        <span
                          className={`text-sm font-semibold ${getTrendColor(team.trend)}`}
                        >
                          {team.change > 0 ? '+' : ''}
                          {team.change}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <span className='font-medium text-slate-900'>
                        {team.wins}-{team.losses}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <ChevronRight className='h-5 w-5 text-slate-400 transition-colors group-hover:text-blue-600' />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* View All Button */}
          <div className='border-t border-slate-200 bg-slate-50 px-6 py-4 text-center'>
            <button className='text-sm font-medium text-blue-600 transition-colors hover:text-blue-700'>
              View All Teams →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsInsights;
