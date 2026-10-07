import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin, Award, CheckCircle, Heart, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-slate-300 border-t border-slate-800">
      {/* Top Value Bar */}
      <div className="border-b border-slate-800 py-8 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-electric-600/20 text-electric-500 border border-electric-500/30 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Practical</h4>
              <p className="text-xs text-slate-400">Real client case studies</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Tamil</h4>
              <p className="text-xs text-slate-400">Clear native explanations</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Verified Certificate</h4>
              <p className="text-xs text-slate-400">Shareable online link</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Affordable Pricing</h4>
              <p className="text-xs text-slate-400">Designed for students</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand Info */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-electric-600 flex items-center justify-center font-black text-xl text-white">
              T
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">THYNK LMS</span>
              <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase">THYNK DIGITAL SOLUTIONS</p>
            </div>
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
