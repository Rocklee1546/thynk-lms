import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Layers, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useLMS } from '../context/LMSContext';

export default function ValuePackCard({ pack }) {
  const navigate = useNavigate();
  const { courses, currentUser, openAuthModal } = useLMS();

  // Find matching courses
  const includedCourseObjs = courses.filter(c => pack.courseIds.includes(c.id));
  
  // Dynamic individual total calculation
  const computedOriginalTotal = includedCourseObjs.reduce((acc, curr) => acc + (curr.originalPrice || curr.price), 0);
  const actualSavings = computedOriginalTotal > pack.price ? computedOriginalTotal - pack.price : pack.savings;

  const handleCheckoutClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'instant' });
    navigate(`/value-pack/${pack.id}`);
  };

  return (
    <div className="h-full min-h-[560px] bg-gradient-to-b from-slate-900 to-brand-navy rounded-3xl border border-electric-500/30 p-6 md:p-8 text-white shadow-xl hover:shadow-2xl hover:border-electric-500/60 transition-all flex flex-col justify-between relative overflow-hidden group">
      
      {/* Background Accent Pill */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-electric-600/10 blur-2xl rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full flex items-center space-x-1">
            <Tag className="w-3 h-3" />
            <span>{pack.badge || 'COMBO VALUE PACK'}</span>
          </span>
          <span className="text-xs font-bold text-sky-400 bg-sky-400/10 border border-sky-400/20 px-2.5 py-0.5 rounded-full shrink-0">
            SAVE ₹{actualSavings.toLocaleString()}
          </span>
        </div>

        {/* Name & Description */}
        <Link
          to={`/value-pack/${pack.id}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
          className="block"
        >
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-white group-hover:text-sky-300 transition-colors">
            {pack.name}
          </h3>
        </Link>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          {pack.description}
        </p>

        {/* Included Courses Checklist */}
        <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-electric-400" />
            <span>INCLUDED COURSES ({includedCourseObjs.length}):</span>
          </p>

          <ul className="space-y-2">
            {includedCourseObjs.length > 0 ? (
              includedCourseObjs.map(course => (
                <li key={course.id}>
                  <Link
                    to={`/course/${course.id}`}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                    className="flex items-center justify-between text-xs font-semibold bg-slate-800/60 hover:bg-slate-800 p-2.5 rounded-xl border border-slate-700/50 hover:border-sky-500/50 transition-colors group/item"
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200 group-hover/item:text-sky-300 truncate transition-colors">{course.title}</span>
                    </div>
                    <span className="text-slate-400 text-[11px] line-through font-normal shrink-0">
                      ₹{course.originalPrice || course.price}
                    </span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400">Custom Combo Stack</li>
            )}
          </ul>
        </div>
      </div>

      {/* Pricing & Checkout Link - Always Fixed at Bottom */}
      <div className="mt-auto pt-6 border-t border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block font-medium">Combo Package Price</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl md:text-3xl font-black text-white">₹{pack.price.toLocaleString()}</span>
            {computedOriginalTotal > 0 && (
              <span className="text-xs text-slate-400 line-through">₹{computedOriginalTotal.toLocaleString()}</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheckoutClick}
          className="bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs px-4 sm:px-5 py-3 rounded-xl transition-all shadow-lg shadow-electric-600/30 flex items-center space-x-2 shrink-0 group-hover:scale-105"
        >
          <span>GET VALUE PACK</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
