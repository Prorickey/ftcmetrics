"use client";
import React from 'react';
import { BarChart3, Search, User, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg text-slate-900 leading-tight">FTC Metrics</h1>
              <span className="text-xs text-slate-500 font-medium leading-none">Performance Analytics</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <a 
              href="#" 
              className="relative px-3 py-2 text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
            >
              Teams
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            </a>
            <a 
              href="#" 
              className="px-3 py-2 text-slate-600 font-medium text-sm hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              Events
            </a>
            <a 
              href="#" 
              className="px-3 py-2 text-slate-600 font-medium text-sm hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              Rankings
            </a>
            <a 
              href="#" 
              className="px-3 py-2 text-slate-600 font-medium text-sm hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              Analytics
            </a>
            <a 
              href="#" 
              className="px-3 py-2 text-slate-600 font-medium text-sm hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              About
            </a>
          </nav>

          {/* Search and Profile */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search teams..."
                className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 transition-all"
              />
            </div>

            {/* Search Button for smaller screens */}
            <button className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
              <Search className="w-4 h-4" />
            </button>

            {/* Profile */}
            <button className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </button>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-slate-200 py-3">
          <nav className="flex flex-col space-y-2">
            <a 
              href="#" 
              className="text-blue-600 font-semibold text-sm px-3 py-2 rounded-lg bg-blue-50"
            >
              Teams
            </a>
            <a 
              href="#" 
              className="text-slate-600 font-medium text-sm px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Events
            </a>
            <a 
              href="#" 
              className="text-slate-600 font-medium text-sm px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Rankings
            </a>
            <a 
              href="#" 
              className="text-slate-600 font-medium text-sm px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Analytics
            </a>
            <a 
              href="#" 
              className="text-slate-600 font-medium text-sm px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"
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