import React from 'react';
import { useLMS } from '../context/LMSContext';
import ValuePackCard from '../components/ValuePackCard';
import { Tag, Sparkles, Layers } from 'lucide-react';

export default function ValuePacks() {
  const { valuePacks } = useLMS();

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="bg-amber-400 text-slate-950 font-black text-xs uppercase px-3.5 py-1 rounded-full inline-flex items-center space-x-1">
            <Tag className="w-3.5 h-3.5" />
            <span>OFFICIAL COMBOS & VALUE PACKS</span>
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Build Your Skill Stack & Save Big
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Combine SEO, Google Ads, Meta Ads and WordPress to accelerate your career at student-friendly bundle prices.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {valuePacks.filter(v => v.isPublished).map(pack => (
            <ValuePackCard key={pack.id} pack={pack} />
          ))}
        </div>

      </div>
    </div>
  );
}
