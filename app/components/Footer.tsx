"use client";
import React from 'react';
import { BarChart3, Github, Twitter, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-lg text-slate-900">FTC Metrics</h3>
                <span className="text-xs text-slate-500 font-medium">Performance Analytics</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Comprehensive analytics and insights for FIRST Tech Challenge teams worldwide. 
              Track performance, analyze trends, and discover top-performing teams.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-4">Platform</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-slate-600 text-sm hover:text-blue-600 transition-colors"
                >
                  Teams Directory
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-slate-600 text-sm hover:text-blue-600 transition-colors"
                >
                  Event Calendar
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-slate-600 text-sm hover:text-blue-600 transition-colors"
                >
                  Rankings
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-slate-600 text-sm hover:text-blue-600 transition-colors"
                >
                  Analytics Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-slate-600 text-sm hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                >
                  FTC Documentation
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-slate-600 text-sm hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                >
                  FIRST Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-slate-600 text-sm hover:text-blue-600 transition-colors"
                >
                  API Documentation
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-slate-600 text-sm hover:text-blue-600 transition-colors"
                >
                  Data Sources
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-slate-600 text-sm hover:text-blue-600 transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-slate-600 text-sm hover:text-blue-600 transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-slate-600 text-sm hover:text-blue-600 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-slate-600 text-sm hover:text-blue-600 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-slate-600 text-sm">
            © {new Date().getFullYear()} FTC Metrics. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a 
              href="#" 
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              Status
            </a>
            <a 
              href="#" 
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              Changelog
            </a>
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;