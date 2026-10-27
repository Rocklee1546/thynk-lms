import React from 'react';
import { useLMS } from '../context/LMSContext';
import ValuePackCard from '../components/ValuePackCard';
import { Tag } from 'lucide-react';

export default function ValuePacks() {
  const { valuePacks } = useLMS();

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Header Box — matches Courses page style */}
        <div className="bg-brand-navy text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric-600/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="max-w-2xl space-y-3 relative z-10">
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5" />
              <span>OFFICIAL COMBOS &amp; VALUE PACKS</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Build Your Skill Stack &amp; Save Big
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Combine SEO, Google Ads, Meta Ads and WordPress to accelerate your career at student-friendly bundle prices.
            </p>
          </div>
        </div>

        {/* Cards Grid on white/slate-50 background */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {valuePacks.filter(v => v.isPublished).map(pack => (
            <ValuePackCard key={pack.id} pack={pack} />
          ))}
        </div>

      </div>
    </div>
  );
}
