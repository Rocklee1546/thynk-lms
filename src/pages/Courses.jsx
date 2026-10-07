import React, { useState, useMemo } from 'react';
import { useLMS } from '../context/LMSContext';
import CourseCard from '../components/CourseCard';
import VideoPreviewModal from '../components/VideoPreviewModal';
import { Search, Filter, Globe, Sparkles, BookOpen } from 'lucide-react';

export default function Courses() {
  const { courses } = useLMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [previewCourse, setPreviewCourse] = useState(null);

  // Real-time filtering
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Must be published
      if (!course.isPublished) return false;

      // Search match
      const matchSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (course.includes && course.includes.some(i => i.toLowerCase().includes(searchTerm.toLowerCase())));

      if (!matchSearch) return false;

      // Category filter
      if (selectedCategory !== 'All' && course.category !== selectedCategory) {
        return false;
      }

      // Level filter
      if (selectedLevel !== 'All' && course.level !== selectedLevel) {
        return false;
      }

      // Price filter
      if (selectedPriceFilter === 'under1000' && course.price >= 1000) return false;
      if (selectedPriceFilter === '1000to2000' && (course.price < 1000 || course.price > 2000)) return false;
      if (selectedPriceFilter === 'above2000' && course.price <= 2000) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.reviewCount || 0) - (a.reviewCount || 0); // popular default
    });
  }, [courses, searchTerm, selectedCategory, selectedPriceFilter, selectedLevel, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="bg-brand-navy text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric-600/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="max-w-2xl space-y-3 relative z-10">
            <span className="bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5" />
              <span>100% TAMIL COURSES</span>
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Course Catalog
            </h1>
            <p className="text-slate-300 text-sm sm:text-base">
              Explore practical, career-focused digital marketing courses. Master SEO, Google Ads, Meta Ads and WordPress step-by-step.
            </p>
          </div>
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses, skills or topics (e.g. SEO, Google Ads, WordPress, Tamil)..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric-600 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="All">All Categories</option>
                <option value="Digital Marketing">Digital Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Price Range</label>
              <select
                value={selectedPriceFilter}
                onChange={(e) => setSelectedPriceFilter(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="All">All Prices</option>
                <option value="under1000">Under ₹1,000</option>
                <option value="1000to2000">₹1,000 - ₹2,000</option>
                <option value="above2000">Above ₹2,000</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Beginner to Advanced">Beginner to Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

          </div>

        </div>

        {/* Results Count & Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Showing {filteredCourses.length} Digital Marketing course(s)</span>
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedPriceFilter('All'); }}
                className="text-electric-600 hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onPreviewClick={(c) => setPreviewCourse(c)}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="font-extrabold text-slate-800 text-lg">No courses match your filter criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search query or reset your price and category filters.
              </p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedPriceFilter('All'); setSelectedLevel('All'); }}
                className="bg-electric-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Free Video Preview Modal */}
      {previewCourse && (
        <VideoPreviewModal
          course={previewCourse}
          onClose={() => setPreviewCourse(null)}
        />
      )}
    </div>
  );
}
