import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Globe, Award, Briefcase, ArrowRight, PlayCircle } from 'lucide-react';
import { useLMS } from '../context/LMSContext';

export default function CourseCard({ course, onPreviewClick }) {
  const navigate = useNavigate();
  const { currentUser, openAuthModal } = useLMS();

  const discountPercent = course.originalPrice 
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  const handleCourseClick = (e) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal(`/course/${course.id}`, 'signin');
    } else {
      navigate(`/course/${course.id}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      
      {/* Thumbnail Header */}
      <div className="relative aspect-video overflow-hidden bg-slate-900 cursor-pointer" onClick={handleCourseClick}>
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {course.badge && (
            <span className="bg-electric-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md">
              {course.badge}
            </span>
          )}
          <span className="bg-emerald-600/95 text-white font-bold text-[10px] px-2.5 py-1 rounded-md shadow-md flex items-center space-x-1">
            <Globe className="w-3 h-3 inline" />
            <span>தமிழ் (Tamil)</span>
          </span>
        </div>

        {/* Free Preview Button overlay */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onPreviewClick) onPreviewClick(course);
          }}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-brand-navy/60 backdrop-blur-xs text-white font-bold text-xs space-x-2"
        >
          <PlayCircle className="w-8 h-8 text-sky-400 animate-pulse" />
          <span>WATCH FREE PREVIEW</span>
        </button>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Metadata Row */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <div className="flex items-center space-x-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{course.rating || 4.9}</span>
              <span className="text-slate-400 font-normal">({course.reviewCount || 120})</span>
            </div>
            <div className="flex items-center space-x-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.duration}</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            onClick={handleCourseClick}
            className="font-extrabold text-slate-800 text-base group-hover:text-electric-600 transition-colors line-clamp-2 leading-snug cursor-pointer"
          >
            {course.title}
          </h3>

          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {course.shortDesc || course.description}
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center space-x-1">
              <Award className="w-3 h-3 text-electric-600" />
              <span>Certificate</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center space-x-1">
              <Briefcase className="w-3 h-3 text-emerald-600" />
              <span>Internship Opportunity</span>
            </span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-black text-slate-900">₹{course.price.toLocaleString()}</span>
              {course.originalPrice && (
                <span className="text-xs text-slate-400 line-through">₹{course.originalPrice.toLocaleString()}</span>
              )}
            </div>
            {discountPercent > 0 && (
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase">
                Save {discountPercent}% Instant
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleCourseClick}
            className="bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-electric-600/20 flex items-center space-x-1.5"
          >
            <span>VIEW COURSE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
