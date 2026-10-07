import React, { useState, useEffect, useRef } from 'react';
import { useLMS } from '../context/LMSContext';
import { Sparkles, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, User, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FounderPoster() {
  const { founderPosterSlogans } = useLMS();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const activeSlogan = founderPosterSlogans[activeIdx] || founderPosterSlogans[0];

  const nextSlogan = () => {
    setActiveIdx((prev) => (prev + 1) % founderPosterSlogans.length);
  };

  const prevSlogan = () => {
    setActiveIdx((prev) => (prev - 1 + founderPosterSlogans.length) % founderPosterSlogans.length);
  };

  // Auto-scrolling / auto-play effect every 4.5 seconds
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        nextSlogan();
      }, 4500);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, founderPosterSlogans.length]);

  return (
    <section 
      className="py-16 md:py-24 text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #07152B 0%, #0E2243 18%, #17386B 42%, #225297 70%, #3572CA 100%)' }}
    >
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-electric-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-400/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Poster Container Card with Auto-Scroll Pause on Hover */}
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="bg-gradient-to-r from-slate-900/90 via-brand-navy to-slate-900/90 border border-electric-500/30 rounded-3xl p-6 sm:p-10 lg:p-14 shadow-2xl relative overflow-hidden backdrop-blur-md group"
        >
          
          {/* Top Tag & Slogan Auto + Manual Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-electric-500 animate-ping" />
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                {activeSlogan.tagline || 'FOUNDER VISION'}
              </span>
            </div>
            
            {/* Auto & Manual Controller */}
            <div className="flex items-center space-x-2 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700 shadow-md">
              <button 
                onClick={prevSlogan}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Previous Slogan (Manual)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-xs font-mono font-bold text-sky-300 px-2">
                0{activeIdx + 1} / 0{founderPosterSlogans.length}
              </span>

              <button 
                onClick={nextSlogan}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Next Slogan (Manual)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 rounded-lg bg-slate-700/80 text-sky-400 hover:text-white transition-colors border border-slate-600 ml-1"
                title={isPaused ? "Resume Auto Scroll" : "Pause Auto Scroll"}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Side: Slogan & Copy */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Dynamic Oversized Slogan */}
              <div className="space-y-2 transition-all duration-300">
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                  <span className="block text-white uppercase">{activeSlogan.sloganMain}</span>
                  <span className="block text-gradient uppercase mt-1 drop-shadow-md">
                    {activeSlogan.sloganHighlight}
                  </span>
                </h2>
              </div>

              {/* Supporting Subtext */}
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
                {activeSlogan.subtext}
              </p>

              {/* Highlights Pill list */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center space-x-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200">Explained in Tamil</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200">Live Doubt Solving</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200">Real Client Projects</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200">Internship Program</span>
                </div>
              </div>

              {/* Slide Indicator Dots Bar */}
              <div className="flex items-center space-x-2 pt-2">
                {founderPosterSlogans.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === activeIdx 
                        ? 'w-8 bg-electric-500' 
                        : 'w-2 bg-slate-700 hover:bg-slate-600'
                    }`}
                    title={`Go to slogan ${idx + 1}`}
                  />
                ))}
              </div>

              {/* CTA Row */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/courses"
                  className="bg-electric-600 hover:bg-electric-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-electric-600/30 transition-all flex items-center space-x-2 group-hover:scale-105"
                >
                  <span>START PRACTICAL LEARNING</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/about"
                  className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm px-5 py-3.5 rounded-xl border border-slate-700 transition-all"
                >
                  Learn About Founder Story
                </Link>
              </div>

            </div>

            {/* Right Side: Professional Founder Photograph */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md">
                
                {/* Glowing border ring */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-electric-600 via-sky-400 to-electric-600 rounded-3xl blur opacity-75 animate-pulse" />
                
                <div className="relative rounded-3xl overflow-hidden bg-brand-navy border border-slate-700 shadow-2xl">
                  <img
                    src="/founder.png"
                    alt="THYNK LMS Founder"
                    className="w-full h-auto object-cover object-center max-h-[460px] transform hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Bottom Founder Overlay Banner */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-brand-navy via-brand-navy/90 to-transparent p-5 text-center">
                    <div className="inline-flex items-center space-x-1.5 bg-electric-600/30 text-sky-300 border border-electric-500/40 px-3 py-1 rounded-full text-xs font-bold mb-1">
                      <User className="w-3.5 h-3.5" />
                      <span>FOUNDER & HEAD MENTOR</span>
                    </div>
                    <h3 className="font-extrabold text-white text-lg tracking-tight">THYNK DIGITAL SOLUTIONS</h3>
                    <p className="text-xs text-slate-300 font-medium">Empowering 1,400+ Tamil Nadu Students</p>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
