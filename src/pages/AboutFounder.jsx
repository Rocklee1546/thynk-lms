import React from 'react';
import FounderPoster from '../components/FounderPoster';
import { User, CheckCircle, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutFounder() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 space-y-16">
      
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-navy text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <span className="bg-electric-600 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-full">
              MEET THE FOUNDER & BRAND VISION
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Making Practical Digital Skills Accessible in Tamil.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              THYNK DIGITAL SOLUTIONS was created to solve a real problem: removing expensive barriers so South Indian students can acquire high-value digital marketing skills without paying a fortune.
            </p>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <img
              src="/founder.png"
              alt="THYNK Founder"
              className="w-full max-w-xs rounded-3xl object-cover border-4 border-electric-500 shadow-2xl"
            />
          </div>

        </div>
      </div>

      {/* Founder Poster Showcase Component */}
      <FounderPoster />

      {/* Philosophy Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-900">Why THYNK LMS Exists</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-700">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-900 text-base">Affordable Practical Education</h3>
              <p className="text-slate-600">Premium digital marketing training should not require ₹30,000 corporate fees.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-900 text-base">Native Language Clarity</h3>
              <p className="text-slate-600">Teaching concepts in Tamil eliminates language confusion so students learn faster.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-900 text-base">Career Experience Focus</h3>
              <p className="text-slate-600">Focusing on hands-on practical projects, live QA, and merit-based internship opportunities.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
