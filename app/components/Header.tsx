'use client';
import React from 'react';
import { BarChart3, Search, User, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className='sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo and Brand */}
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-blue-600 p-2'>
              <BarChart3 className='h-6 w-6 text-white' />
            </div>
            <div className='flex flex-col'>
              <h1 className='text-lg leading-tight font-bold text-slate-900'>
                FTC Metrics
              </h1>
              <span className='text-xs leading-none font-medium text-slate-500'>
                Performance Analytics
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className='hidden items-center space-x-1 md:flex'>
            <a
              href='#'
              className='relative px-3 py-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700'
            >
              Teams
              <div className='absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-blue-600'></div>
            </a>
            <a
              href='#'
              className='rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900'
            >
              Events
            </a>
            <a
              href='#'
              className='rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900'
            >
              Rankings
            </a>
            <a
              href='#'
              className='rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900'
            >
              Analytics
            </a>
            <a
              href='#'
              className='rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900'
            >
              About
            </a>
          </nav>

          {/* Search and Profile */}
          <div className='flex items-center gap-2'>
            {/* Search */}
            <div className='relative hidden lg:block'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400' />
              <input
                type='text'
                placeholder='Search teams...'
                className='w-48 rounded-md border border-slate-200 bg-slate-50 py-1.5 pr-4 pl-9 text-sm transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none'
              />
            </div>

            {/* Search Button for smaller screens */}
            <button className='rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden'>
              <Search className='h-4 w-4' />
            </button>

            {/* Profile */}
            <button className='flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900'>
              <User className='h-4 w-4' />
              <span className='hidden sm:inline'>Profile</span>
            </button>

            {/* Mobile Menu Button */}
            <button className='rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden'>
              <Menu className='h-4 w-4' />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className='border-t border-slate-200 py-3 md:hidden'>
          <nav className='flex flex-col space-y-2'>
            <a
              href='#'
              className='rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600'
            >
              Teams
            </a>
            <a
              href='#'
              className='rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100'
            >
              Events
            </a>
            <a
              href='#'
              className='rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100'
            >
              Rankings
            </a>
            <a
              href='#'
              className='rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100'
            >
              Analytics
            </a>
            <a
              href='#'
              className='rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100'
            >
              About
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
