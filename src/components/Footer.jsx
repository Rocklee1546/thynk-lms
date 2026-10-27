import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin, Award, CheckCircle, Heart, Globe } from 'lucide-react';
import ThynkLogo from './ThynkLogo';

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-slate-300 border-t border-slate-800">
      {/* Top Value Bar — Vibrant Lighter Blue Gradient with Colorful Feature Icons */}
      <div className="border-b border-blue-900/60 py-8 bg-gradient-to-r from-[#0D2B52] via-[#1E40AF] to-[#2563EB] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-400/20 text-sky-200 border border-sky-300/40 flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Practical</h4>
              <p className="text-xs text-sky-100/90">Real client case studies</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-200 border border-emerald-300/40 flex items-center justify-center shrink-0 shadow-sm">
              <Globe className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Tamil</h4>
              <p className="text-xs text-sky-100/90">Clear native explanations</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/25 text-amber-200 border border-amber-300/40 flex items-center justify-center shrink-0 shadow-sm">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Verified Certificate</h4>
              <p className="text-xs text-sky-100/90">Shareable online link</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-400/25 text-purple-200 border border-purple-300/40 flex items-center justify-center shrink-0 shadow-sm">
              <Shield className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Affordable Pricing</h4>
              <p className="text-xs text-sky-100/90">Designed for students</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand Info */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="inline-block">
            <ThynkLogo className="h-9 w-auto" />
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed pr-4">
            THYNK LMS is a career-focused EdTech platform empowering Tamil Nadu and South Indian students with practical, high-income digital skills at student-friendly affordable prices.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
            <p className="font-bold text-amber-400 uppercase tracking-wide text-[10px]">NOTICE OF POLICY:</p>
            <p className="text-slate-300">THYNK LMS strictly operates under a <strong>No-Refund Policy</strong>. Free preview lessons are accessible on all course pages prior to enrollment.</p>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4 border-l-2 border-electric-600 pl-2">Quick Links</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><Link to="/" className="hover:text-white transition-colors">Home Page</Link></li>
            <li><Link to="/courses" className="hover:text-white transition-colors">Digital Marketing Courses</Link></li>
            <li><Link to="/value-packs" className="hover:text-white transition-colors">Combo Value Packs</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">Meet the Founder</Link></li>
            <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
          </ul>
        </div>

        {/* Student Portal */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4 border-l-2 border-electric-600 pl-2">Student Portal</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><Link to="/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link></li>
            <li><Link to="/dashboard" className="hover:text-white transition-colors">My Enrolled Courses</Link></li>
            <li><Link to="/dashboard" className="hover:text-white transition-colors">Live Doubt Sessions</Link></li>
            <li><Link to="/dashboard" className="hover:text-white transition-colors">Internship Application</Link></li>
            <li><Link to="/verify-certificate" className="hover:text-white transition-colors">Verify Certificate</Link></li>
          </ul>
        </div>

        {/* Legal & Contact */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4 border-l-2 border-electric-600 pl-2">Legal & Contact</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/refund-policy" className="hover:text-white transition-colors text-amber-400 font-semibold">No Refund Policy</Link></li>
          </ul>
          <div className="mt-4 space-y-2 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-electric-500" />
              <span>support@thynksolutions.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-electric-500" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-start space-x-2">
              <MapPin className="w-3.5 h-3.5 text-electric-500 shrink-0 mt-0.5" />
              <span>Tamil Nadu, India</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 py-6 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 THYNK DIGITAL SOLUTIONS. All rights reserved. Brand: THYNK LMS.</p>
          <div className="flex items-center space-x-2">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>for South Indian Students</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
