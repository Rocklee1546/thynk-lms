// ====================================================================
// THYNK LMS — NAVIGATION BAR
// Shows public navigation links and distinct Sign Up / Log In buttons before login.
// Shows My Learnings / Admin Panel link and Log Out after login.
// ====================================================================

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLMS } from '../context/LMSContext';
import { 
  BookOpen, Menu, X, User, LogOut, ShieldCheck, 
  Globe, Layers, Award, UserPlus, LogIn
} from 'lucide-react';

import ThynkLogo from './ThynkLogo';

export default function Navbar() {
  const { currentUser, logout } = useLMS();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-brand-navy/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      {/* Top Value Banner */}
      <div className="bg-gradient-to-r from-electric-600 via-blue-700 to-brand-navy py-1.5 px-4 text-xs font-medium text-center flex items-center justify-center space-x-2">
        <span className="bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">NEW</span>
        <span>Tamil Digital Marketing Programs Now Live • Admissions Open!</span>
        <span className="hidden sm:inline-block border-l border-white/20 pl-2 text-sky-300">100% Practical &amp; Affordable</span>
      </div>

      <nav className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[30px] h-[72px] flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center shrink-0 mr-6 lg:mr-[30px]" title="THYNK DIGITAL ACADEMY">
          <ThynkLogo className="h-9 sm:h-10 lg:h-11 w-auto" />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-5 lg:space-x-7 text-sm font-semibold flex-1">
          <Link to="/" className={`transition-colors ${isActive('/') ? 'text-sky-400 border-b-2 border-sky-400 pb-1' : 'text-slate-300 hover:text-white'}`}>
            Home
          </Link>
          <Link to="/courses" className={`transition-colors ${isActive('/courses') ? 'text-sky-400 border-b-2 border-sky-400 pb-1' : 'text-slate-300 hover:text-white'}`}>
            Courses
          </Link>
          <Link to="/value-packs" className={`flex items-center space-x-1 transition-colors ${isActive('/value-packs') ? 'text-sky-400 border-b-2 border-sky-400 pb-1' : 'text-slate-300 hover:text-white'}`}>
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Value Packs</span>
          </Link>
          <Link to="/about" className={`transition-colors ${isActive('/about') ? 'text-sky-400 border-b-2 border-sky-400 pb-1' : 'text-slate-300 hover:text-white'}`}>
            Meet Founder
          </Link>
          <Link to="/verify-certificate" className={`flex items-center space-x-1 transition-colors ${isActive('/verify-certificate') ? 'text-sky-400' : 'text-slate-300 hover:text-white'}`}>
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Verify Certificate</span>
          </Link>
          <Link to="/faq" className={`transition-colors ${isActive('/faq') ? 'text-sky-400 border-b-2 border-sky-400 pb-1' : 'text-slate-300 hover:text-white'}`}>
            FAQ
          </Link>
        </div>

        {/* Right CTA / Auth Controls */}
        <div className="hidden md:flex items-center space-x-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center space-x-3">
              {currentUser.role === 'admin' ? (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs px-4 py-2 rounded-xl shadow transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1.5 bg-electric-600 hover:bg-electric-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>My Learnings</span>
                </Link>
              )}

              <div className="text-right">
                <p className="text-xs font-bold text-white leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-sky-400 capitalize">{currentUser.role || 'student'}</p>
              </div>

              <button
                onClick={() => logout()}
                title="Log Out"
                className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            /* Unauthenticated: Button 1 (Sign Up), Button 2 (Log In) */
            <div className="flex items-center space-x-2.5">
              <Link
                to="/auth?mode=login"
                className="flex items-center space-x-1.5 text-xs font-bold px-4 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800/80 transition-all border border-slate-700"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-400" />
                <span>Log In</span>
              </Link>
              <Link
                to="/auth?mode=signup"
                className="flex items-center space-x-1.5 bg-electric-600 hover:bg-electric-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-electric-600/30 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center space-x-2">
          {currentUser && (
            <Link
              to={currentUser.role === 'admin' ? '/admin' : '/dashboard'}
              className="px-3 py-1.5 rounded-lg bg-electric-600 text-white text-xs font-bold"
            >
              {currentUser.role === 'admin' ? 'Admin' : 'Learnings'}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-navy border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 font-semibold text-sm">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-white">Home</Link>
          <Link to="/courses" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-white">Courses</Link>
          <Link to="/value-packs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-white">Value Packs</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-white">Meet Founder</Link>
          <Link to="/verify-certificate" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-emerald-400 hover:text-emerald-300">Verify Certificate</Link>
          <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-white">FAQ</Link>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            {currentUser ? (
              <>
                <Link
                  to={currentUser.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 rounded-xl bg-electric-600 text-white font-bold text-xs"
                >
                  {currentUser.role === 'admin' ? 'Open Admin Panel' : 'My Learnings'}
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 text-center rounded-xl bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out ({currentUser.name})</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/auth?mode=login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xs text-center block"
                >
                  Log In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl bg-electric-600 text-white font-extrabold text-xs text-center shadow-md block"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
