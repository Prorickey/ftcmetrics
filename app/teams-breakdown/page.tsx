'use client';
import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Download,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
} from 'lucide-react';

const TeamsBreakdown = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [sortColumn, setSortColumn] = useState('epa');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const countries = ['All', 'USA', 'Canada', 'Mexico', 'International'];
  const states = [
    'All',
    'California',
    'Texas',
    'Michigan',
    'North Carolina',
    'Ohio',
    'New York',
    'Florida',
    'Washington',
    'Illinois',
    'Georgia',
  ];
  const districts = [
    'All',
    'None',
    'CHS',
    'FIM',
    'FIT',
    'FMA',
    'ISR',
    'NE',
    'ONT',
    'PCH',
    'PNW',
  ];

  const teams = Array.from({ length: 250 }, (_, i) => {
    const baseNum = 10000 + i * 47;
    // Create deterministic variation based on index to avoid hydration mismatch
    const variation = ((i * 7) % 40) - 20;
    return {
      team: baseNum.toString(),
      name: [
        'Mechanical Paradox',
        'Robo Dominators',
        'Quantum Mechanics',
        'Circuit Breakers',
        'Gear Heads',
        'Robotics Elite',
        'Tech Titans',
        'Cyber Hawks',
        'Digital Dragons',
        'Metal Mavericks',
        'Code Crusaders',
        'Binary Bots',
        'Atomic Atoms',
        'Power Players',
        'Silicon Soldiers',
        'Voltage Vanguards',
        'Electric Eagles',
        'Turbo Techs',
      ][i % 18],
      country: ['USA', 'USA', 'USA', 'USA', 'Canada', 'USA', 'USA', 'USA'][
        i % 8
      ],
      state: states[((i * 3) % (states.length - 1)) + 1],
      district: districts[(i * 5) % districts.length],
      epa: parseFloat((140 - i * 0.5 + variation).toFixed(1)),
      autoEpa: parseFloat((45 - i * 0.15 + variation * 0.3).toFixed(1)),
      teleopEpa: parseFloat((70 - i * 0.25 + variation * 0.5).toFixed(1)),
      endgameEpa: parseFloat((25 - i * 0.1 + variation * 0.2).toFixed(1)),
      record: {
        wins: Math.floor(45 - i * 0.15),
        losses: Math.floor(3 + i * 0.1),
        ties: (i * 2) % 3,
      },
      opr: parseFloat((155 - i * 0.6 + variation).toFixed(1)),
      ils: parseFloat((15 + ((i * 11) % 5)).toFixed(1)),
      totalEpa: parseFloat((140 - i * 0.5 + variation).toFixed(1)),
    };
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const filteredTeams = teams
    .filter((team) => {
      const matchesSearch =
        team.team.includes(searchTerm) ||
        team.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry =
        selectedCountry === 'All' || team.country === selectedCountry;
      const matchesState =
        selectedState === 'All' || team.state === selectedState;
      const matchesDistrict =
        selectedDistrict === 'All' || team.district === selectedDistrict;
      return matchesSearch && matchesCountry && matchesState && matchesDistrict;
    })
    .sort((a, b) => {
      let aVal, bVal;

      if (sortColumn === 'team') {
        aVal = parseInt(a.team);
        bVal = parseInt(b.team);
      } else if (sortColumn === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else if (sortColumn === 'winrate') {
        aVal =
          a.record.wins / (a.record.wins + a.record.losses + a.record.ties);
        bVal =
          b.record.wins / (b.record.wins + b.record.losses + b.record.ties);
      } else {
        aVal = a[sortColumn as keyof typeof a];
        bVal = b[sortColumn as keyof typeof b];
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className='min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50'>
      {/* Header */}
      <div className='sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm'>
        <div className='mx-auto max-w-[1600px] px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-slate-900'>
                Teams Breakdown
              </h1>
              <p className='mt-0.5 text-sm text-slate-600'>
                Comprehensive team statistics and performance data
              </p>
            </div>
            <button className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-blue-700'>
              <Download className='h-4 w-4' />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-[1600px] px-6 py-6'>
        {/* Filters */}
        <div className='mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='mb-4 flex items-center gap-2'>
            <SlidersHorizontal className='h-5 w-5 text-slate-600' />
            <h2 className='text-lg font-semibold text-slate-900'>Filters</h2>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-slate-700'>
                Search
              </label>
              <div className='relative'>
                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400' />
                <input
                  type='text'
                  placeholder='Team number or name...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-10 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
                />
              </div>
            </div>

            <div>
              <label className='mb-1.5 block text-sm font-medium text-slate-700'>
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='mb-1.5 block text-sm font-medium text-slate-700'>
                State/Province
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
              >
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='mb-1.5 block text-sm font-medium text-slate-700'>
                District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
              >
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='mt-4 flex items-center justify-between border-t border-slate-200 pt-4'>
            <p className='text-sm text-slate-600'>
              Showing{' '}
              <span className='font-semibold text-slate-900'>
                {paginatedTeams.length}
              </span>{' '}
              of{' '}
              <span className='font-semibold text-slate-900'>
                {filteredTeams.length}
              </span>{' '}
              teams
            </p>
            <button className='text-sm font-medium text-blue-600 hover:text-blue-700'>
              Reset Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-slate-200 bg-slate-50'>
                  <th
                    className='cursor-pointer px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-700 uppercase transition-colors hover:bg-slate-100'
                    onClick={() => handleSort('team')}
                  >
                    <div className='flex items-center gap-2'>
                      Team
                      <SortIcon
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        column='team'
                      />
                    </div>
                  </th>
                  <th
                    className='cursor-pointer px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-700 uppercase transition-colors hover:bg-slate-100'
                    onClick={() => handleSort('name')}
                  >
                    <div className='flex items-center gap-2'>
                      Name
                      <SortIcon
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        column='name'
                      />
                    </div>
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-700 uppercase'>
                    Country
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-700 uppercase'>
                    State
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-700 uppercase'>
                    District
                  </th>
                  <th
                    className='cursor-pointer px-4 py-3 text-right text-xs font-semibold tracking-wider text-slate-700 uppercase transition-colors hover:bg-slate-100'
                    onClick={() => handleSort('totalEpa')}
                  >
                    <div className='flex items-center justify-end gap-2'>
                      Total EPA
                      <SortIcon
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        column='totalEpa'
                      />
                    </div>
                  </th>
                  <th
                    className='cursor-pointer px-4 py-3 text-right text-xs font-semibold tracking-wider text-slate-700 uppercase transition-colors hover:bg-slate-100'
                    onClick={() => handleSort('autoEpa')}
                  >
                    <div className='flex items-center justify-end gap-2'>
                      Auto
                      <SortIcon
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        column='autoEpa'
                      />
                    </div>
                  </th>
                  <th
                    className='cursor-pointer px-4 py-3 text-right text-xs font-semibold tracking-wider text-slate-700 uppercase transition-colors hover:bg-slate-100'
                    onClick={() => handleSort('teleopEpa')}
                  >
                    <div className='flex items-center justify-end gap-2'>
                      TeleOp
                      <SortIcon
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        column='teleopEpa'
                      />
                    </div>
                  </th>
                  <th
                    className='cursor-pointer px-4 py-3 text-right text-xs font-semibold tracking-wider text-slate-700 uppercase transition-colors hover:bg-slate-100'
                    onClick={() => handleSort('endgameEpa')}
                  >
                    <div className='flex items-center justify-end gap-2'>
                      Endgame
                      <SortIcon
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        column='endgameEpa'
                      />
                    </div>
                  </th>
                  <th
                    className='cursor-pointer px-4 py-3 text-right text-xs font-semibold tracking-wider text-slate-700 uppercase transition-colors hover:bg-slate-100'
                    onClick={() => handleSort('winrate')}
                  >
                    <div className='flex items-center justify-end gap-2'>
                      Record
                      <SortIcon
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        column='winrate'
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {paginatedTeams.map((team) => (
                  <tr
                    key={team.team}
                    className='cursor-pointer transition-colors hover:bg-blue-50/50'
                  >
                    <td className='px-4 py-3'>
                      <span className='font-bold text-blue-600'>
                        {team.team}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='font-medium text-slate-900'>
                        {team.name}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='text-slate-700'>{team.country}</span>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='text-slate-700'>{team.state}</span>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700'>
                        {team.district}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <span className='font-bold text-slate-900'>
                        {team.totalEpa}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <span className='text-slate-700'>{team.autoEpa}</span>
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <span className='text-slate-700'>{team.teleopEpa}</span>
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <span className='text-slate-700'>{team.endgameEpa}</span>
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <span className='font-medium text-slate-900'>
                        {team.record.wins}-{team.record.losses}-
                        {team.record.ties}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className='flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4'>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className='rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Previous
            </button>

            <div className='flex items-center gap-2'>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className='text-slate-400'>...</span>
                  <button className='rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100'>
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className='rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SortIcon = ({
  sortColumn,
  sortDirection,
  column,
}: {
  sortColumn: string;
  sortDirection: string;
  column: string;
}) => {
  if (sortColumn !== column) {
    return <ArrowUpDown className='h-4 w-4 text-slate-400' />;
  }
  return sortDirection === 'asc' ? (
    <ChevronUp className='h-4 w-4 text-blue-600' />
  ) : (
    <ChevronDown className='h-4 w-4 text-blue-600' />
  );
};

export default TeamsBreakdown;
