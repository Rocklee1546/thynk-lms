import React, { useEffect, useRef, useState } from 'react';
import { Play, Star, CheckCircle, Search, ShieldCheck } from 'lucide-react';

export default function LaptopMockupShowcase({ onPreviewClick, defaultCourse }) {
  const viewportRef = useRef(null);
  const cursorRef = useRef(null);
  const rippleRef = useRef(null);
  
  const [searchText, setSearchText] = useState('Search courses...');
  const [isSearching, setIsSearching] = useState(false);
  const [activeMod, setActiveMod] = useState(2);

  useEffect(() => {
    let isMounted = true;

    const triggerClick = () => {
      if (rippleRef.current) {
        rippleRef.current.classList.remove('hidden');
        rippleRef.current.classList.add('animate-ping');
        setTimeout(() => {
          if (rippleRef.current) {
            rippleRef.current.classList.remove('animate-ping');
            rippleRef.current.classList.add('hidden');
          }
        }, 600);
      }
    };

    const moveCursor = (xPercent, yPercent, duration = 800) => {
      return new Promise(resolve => {
        if (!cursorRef.current || !isMounted) return resolve();
        cursorRef.current.style.transition = `top ${duration}ms ease-in-out, left ${duration}ms ease-in-out`;
        cursorRef.current.style.top = `${yPercent}%`;
        cursorRef.current.style.left = `${xPercent}%`;
        setTimeout(resolve, duration);
      });
    };

    const typeText = (text, durationPerChar = 100) => {
      return new Promise(resolve => {
        if (!isMounted) return resolve();
        setSearchText('');
        setIsSearching(true);
        let i = 0;
        const interval = setInterval(() => {
          if (!isMounted) {
            clearInterval(interval);
            return resolve();
          }
          if (i < text.length) {
            setSearchText(prev => prev + text[i]);
            i++;
          } else {
            clearInterval(interval);
            setIsSearching(false);
            resolve();
          }
        }, durationPerChar);
      });
    };

    const scrollViewport = (targetTop, duration = 1000) => {
      return new Promise(resolve => {
        if (!viewportRef.current || !isMounted) return resolve();
        viewportRef.current.scrollTo({ top: targetTop, behavior: 'smooth' });
        setTimeout(resolve, duration);
      });
    };

    const runSimulationLoop = async () => {
      if (!isMounted) return;

      // Reset to top
      if (viewportRef.current) viewportRef.current.scrollTo({ top: 0, behavior: 'instant' });
      await moveCursor(20, 15, 400);

      // Move to search bar & type query
      await moveCursor(50, 7, 800);
      triggerClick();
      await typeText('Google Ads & Meta Ads', 90);
      await new Promise(r => setTimeout(r, 600));

      // Move to hero program card
      await moveCursor(45, 30, 700);
      triggerClick();
      await new Promise(r => setTimeout(r, 500));

      // Hover features
      await moveCursor(30, 42, 500);
      await new Promise(r => setTimeout(r, 400));
      await moveCursor(70, 42, 500);
      await new Promise(r => setTimeout(r, 400));

      // Scroll down to video player
      await scrollViewport(280, 1000);
      await moveCursor(50, 45, 700);
      triggerClick();
      await new Promise(r => setTimeout(r, 700));

      // Scroll down to curriculum
      await scrollViewport(580, 1000);
      await moveCursor(40, 55, 600);
      setActiveMod(2);
      await new Promise(r => setTimeout(r, 700));

      // Scroll down to verified certificate
      await scrollViewport(880, 1000);
      await moveCursor(75, 75, 700);
      await new Promise(r => setTimeout(r, 700));

      // Scroll back to top & click Enroll
      await scrollViewport(0, 1000);
      await moveCursor(82, 48, 800);
      triggerClick();
      await new Promise(r => setTimeout(r, 800));

      // Reset search text for next loop
      setSearchText('Search courses...');

      // Loop infinitely
      if (isMounted) {
        setTimeout(runSimulationLoop, 1500);
      }
    };

    const timer = setTimeout(runSimulationLoop, 800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative w-full max-w-xl lg:max-w-none flex flex-col items-center">
      
      {/* 3D Laptop Display Screen */}
      <div className="relative w-full aspect-[16/10] bg-[#0B132B] rounded-t-2xl sm:rounded-t-3xl p-2.5 sm:p-4 border-[4px] sm:border-[5px] border-slate-700/90 shadow-2xl shadow-electric-600/20 overflow-hidden group">
        
        {/* Camera Lens Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-30">
          <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-600"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
        </div>

        {/* Glass Glare Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none z-20"></div>

        {/* Animated Mouse Cursor Overlay */}
        <div 
          ref={cursorRef} 
          className="absolute z-40 transition-all duration-700 ease-in-out pointer-events-none top-8 left-8"
        >
          <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3l7 18 3-7 7-3L3 3z" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <div ref={rippleRef} className="hidden absolute -top-2 -left-2 w-9 h-9 rounded-full border-2 border-sky-400 bg-sky-400/40 pointer-events-none"></div>
        </div>

        {/* Inner LMS Viewport */}
        <div 
          ref={viewportRef}
          className="w-full h-full bg-[#0F172A] rounded-lg sm:rounded-xl overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] text-white relative font-sans p-3 sm:p-5 space-y-5 border border-slate-800"
        >
          
          {/* LMS Top Navigation Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-3 border-b border-slate-800 sticky top-0 bg-[#0F172A]/95 backdrop-blur-md z-10">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="flex items-center space-x-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              </div>
              <span className="text-[11px] font-bold text-sky-400 font-mono">thynklms.com</span>
            </div>

            {/* Animated Search Bar */}
            <div className="w-full sm:w-64 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 flex items-center space-x-1.5 text-[11px] text-slate-200 shadow-inner">
              <Search className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="font-mono text-sky-300 font-semibold truncate">{searchText}</span>
              <span className="w-0.5 h-3 bg-sky-400 animate-pulse shrink-0"></span>
            </div>

            <div className="hidden md:block">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                100% Tamil
              </span>
            </div>
          </div>

          {/* SECTION 1: Flagship Program Box */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl relative">
            
            <div className="flex items-center justify-between">
              <span className="bg-[#2563EB] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded tracking-wide shadow-md">
                FLAGSHIP PROGRAM
              </span>
              <span className="text-amber-400 text-xs font-black flex items-center space-x-1 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>4.9 / 5.0</span>
              </span>
            </div>

            <h3 className="text-base sm:text-xl font-black text-white leading-tight">
              Digital Marketing Complete Career Program
            </h3>

            <p className="text-xs text-slate-300 font-semibold">
              SEO + Google Ads + Meta Ads + WordPress
            </p>

            <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs font-semibold text-slate-200 pt-1">
              <div className="bg-slate-800/80 border border-slate-700/60 p-2 rounded-lg flex items-center space-x-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>45+ Hours Video</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 p-2 rounded-lg flex items-center space-x-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Live QA Access</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 p-2 rounded-lg flex items-center space-x-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Verified Certificate</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 p-2 rounded-lg flex items-center space-x-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Internship Eligibility</span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <div>
                <span className="text-slate-400 text-xs line-through block">₹9,999</span>
                <span className="text-white font-black text-2xl sm:text-3xl">₹2,999</span>
              </div>
              <button 
                onClick={() => onPreviewClick && onPreviewClick(defaultCourse)}
                className="bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/40 transition-transform active:scale-95"
              >
                Enroll Now
              </button>
            </div>

          </div>

          {/* SECTION 2: Interactive Video Player Mockup */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-extrabold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Play className="w-3.5 h-3.5 fill-sky-400" />
                <span>LESSON PLAYER — WATCHING LESSON 4</span>
              </h4>
              <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                65% Completed
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 shadow-xl">
              <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex flex-col justify-between p-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">TAMIL</span>
                  <span className="text-slate-300 font-mono">18:45 / 32:10</span>
                </div>

                <div className="text-center space-y-1">
                  <button 
                    onClick={() => onPreviewClick && onPreviewClick(defaultCourse)}
                    className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto shadow-lg shadow-blue-600/50 hover:scale-110 transition-transform"
                  >
                    ▶
                  </button>
                  <h5 className="text-xs sm:text-sm font-extrabold text-white">
                    Module 2: Google Ads & Meta Ads Live Setup
                  </h5>
                </div>

                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[62%] h-full bg-blue-500 rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                <div>Mentor: <span className="text-white font-bold">THYNK Expert</span></div>
                <div className="text-sky-400 font-bold">💬 Live QA Access</div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Curriculum Modules */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Included Modules (Tamil)
            </h4>
            
            <div className="space-y-1.5 text-xs font-semibold">
              <div className="bg-slate-900 border border-emerald-500/40 p-2.5 rounded-lg flex items-center justify-between text-slate-200">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Module 1: SEO Mastery (Rank #1 on Google)</span>
                </div>
                <span className="text-emerald-400 text-[10px] font-bold">Completed</span>
              </div>

              <div className="bg-slate-900 border border-blue-500/60 p-2.5 rounded-lg flex items-center justify-between text-white bg-blue-900/20">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400 font-bold">▶</span>
                  <span className="font-bold">Module 2: Google Ads & PPC Specialist</span>
                </div>
                <span className="text-blue-400 text-[10px] font-bold">In Progress</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: Verified Certificate */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1 text-xs">
            <div className="text-emerald-400 font-bold text-[10px] uppercase flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>VERIFIED CERTIFICATE CREDENTIAL</span>
            </div>
            <div className="font-extrabold text-white">ID: THYNK-DM-2026-00128</div>
            <p className="text-[11px] text-slate-400">Verifiable online with unique QR & verification link.</p>
          </div>

        </div>

      </div>

      {/* Laptop Keyboard Frame Base */}
      <div className="relative w-full h-4 sm:h-5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 rounded-b-2xl shadow-xl flex justify-center items-center border-t border-slate-600/70">
        <div className="w-20 h-1.5 bg-slate-900 rounded-b-sm border-t border-slate-600"></div>
      </div>

      {/* Desk Glow Shadow */}
      <div className="w-[96%] h-6 bg-black/70 blur-xl rounded-full mt-1"></div>

    </div>
  );
}
