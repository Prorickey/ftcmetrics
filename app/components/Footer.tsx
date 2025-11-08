'use client';
import React from 'react';
import { BarChart3, Github, Twitter, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className='mt-auto border-t border-slate-200 bg-slate-50'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
          {/* Brand Section */}
          <div className='md:col-span-1'>
            <div className='mb-4 flex items-center gap-2'>
              <div className='rounded-lg bg-blue-600 p-2'>
                <BarChart3 className='h-5 w-5 text-white' />
              </div>
              <div className='flex flex-col'>
                <h3 className='text-lg font-bold text-slate-900'>
                  FTC Metrics
                </h3>
                <span className='text-xs font-medium text-slate-500'>
                  Performance Analytics
                </span>
              </div>
            </div>
            <p className='mb-4 text-sm leading-relaxed text-slate-600'>
              Comprehensive analytics and insights for FIRST Tech Challenge
              teams worldwide. Track performance, analyze trends, and discover
              top-performing teams.
            </p>
            <div className='flex items-center gap-3'>
              <a
                href='#'
                className='rounded-lg p-2 text-slate-500 transition-colors hover:bg-white hover:text-blue-600'
                aria-label='GitHub'
              >
                <Github className='h-5 w-5' />
              </a>
              <a
                href='#'
                className='rounded-lg p-2 text-slate-500 transition-colors hover:bg-white hover:text-blue-600'
                aria-label='Twitter'
              >
                <Twitter className='h-5 w-5' />
              </a>
              <a
                href='#'
                className='rounded-lg p-2 text-slate-500 transition-colors hover:bg-white hover:text-blue-600'
                aria-label='Email'
              >
                <Mail className='h-5 w-5' />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className='mb-4 text-sm font-semibold text-slate-900'>
              Platform
            </h4>
            <ul className='space-y-3'>
              <li>
                <a
                  href='#'
                  className='text-sm text-slate-600 transition-colors hover:text-blue-600'
                >
                  Teams Directory
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-sm text-slate-600 transition-colors hover:text-blue-600'
                >
                  Event Calendar
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-sm text-slate-600 transition-colors hover:text-blue-600'
                >
                  Rankings
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-sm text-slate-600 transition-colors hover:text-blue-600'
                >
                  Analytics Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className='mb-4 text-sm font-semibold text-slate-900'>
              Resources
            </h4>
            <ul className='space-y-3'>
              <li>
                <a
                  href='#'
                  className='inline-flex items-center gap-1 text-sm text-slate-600 transition-colors hover:text-blue-600'
                >
                  FTC Documentation
                  <ExternalLink className='h-3 w-3' />
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='inline-flex items-center gap-1 text-sm text-slate-600 transition-colors hover:text-blue-600'
                >
                  FIRST Website
                  <ExternalLink className='h-3 w-3' />
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-sm text-slate-600 transition-colors hover:text-blue-600'
                >
                  API Documentation
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-sm text-slate-600 transition-colors hover:text-blue-600'
                >
                  Data Sources
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className='mb-4 text-sm font-semibold text-slate-900'>
              Support
            </h4>
            <ul className='space-y-3'>
              <li>
                <a
                  href='#'
                  className='text-sm text-slate-600 transition-colors hover:text-blue-600'
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-sm text-slate-600 transition-colors hover:text-blue-600'
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-sm text-slate-600 transition-colors hover:text-blue-600'
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-sm text-slate-600 transition-colors hover:text-blue-600'
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row'>
          <div className='text-sm text-slate-600'>
            © {new Date().getFullYear()} FTC Metrics. All rights reserved.
          </div>
          <div className='flex items-center gap-6 text-sm'>
            <a
              href='#'
              className='text-slate-600 transition-colors hover:text-blue-600'
            >
              Status
            </a>
            <a
              href='#'
              className='text-slate-600 transition-colors hover:text-blue-600'
            >
              Changelog
            </a>
            <div className='flex items-center gap-2 text-slate-500'>
              <div className='h-2 w-2 animate-pulse rounded-full bg-emerald-500'></div>
              <span className='text-xs'>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
