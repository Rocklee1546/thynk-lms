import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLMS } from '../context/LMSContext';
import VideoPreviewModal from '../components/VideoPreviewModal';
import { 
  Star, 
  Clock, 
  Globe, 
  Award, 
  Briefcase, 
  CheckCircle, 
  PlayCircle, 
  ChevronDown, 
  Lock, 
  Users, 
  ArrowRight,
  BookOpen,
  User,
  Check,
  Smartphone,
  Sparkles,
  Layers,
  Tag,
  ExternalLink,
  ShieldCheck,
  Info,
  ThumbsUp,
  MessageSquare,
  X,
  Edit3,
  AlertCircle
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// STAR RATING DISPLAY HELPER
// ─────────────────────────────────────────────────────────────
function StarRating({ rating, size = 'sm', showEmpty = true }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : showEmpty ? 'fill-slate-200 text-slate-200' : 'fill-amber-100 text-amber-200'
          }`}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INTERACTIVE STAR PICKER FOR REVIEW MODAL
// ─────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="cursor-pointer"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-200 text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REVIEW MODAL
// ─────────────────────────────────────────────────────────────
function ReviewModal({ isOpen, onClose, onSubmit, existingReview, packName }) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRating(existingReview?.rating || 0);
      setComment(existingReview?.comment || '');
      setError('');
    }
  }, [isOpen, existingReview]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    if (comment.trim().length < 20) { setError('Please write at least 20 characters in your review.'); return; }
    onSubmit({ rating, comment: comment.trim() });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-xl font-extrabold text-[#0F172A] mb-1">
          {existingReview ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        <p className="text-sm text-slate-500 mb-6">{packName}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">Your Rating *</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">Your Review *</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience with this value pack. What did you learn across the courses? How has it helped your career?"
              rows={5}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0F172A] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">{comment.length} characters (minimum 20)</p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm px-7 py-3 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {existingReview ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN VALUE PACK DETAIL PAGE
// ─────────────────────────────────────────────────────────────
export default function ValuePackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    valuePacks, 
    courses, 
    currentUser, 
    openAuthModal, 
    checkCourseAccess, 
    trackCourseView,
    reviews,
    addReview,
    updateReview,
    toggleHelpfulReview
  } = useLMS();

  // Find the selected value pack
  const toSlug = (text) => (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const pack = valuePacks.find(v => 
    v.id === id || 
    (v.slug && v.slug === id) || 
    toSlug(v.name) === id || 
    toSlug(v.id) === id
  );

  // Find all courses included in this pack
  const includedCourses = pack ? courses.filter(c => pack.courseIds?.includes(c.id)) : [];

  // State for open modules across courses
  const [openCourseModuleId, setOpenCourseModuleId] = useState(null);
  const [previewCourse, setPreviewCourse] = useState(null);
  const [showBioFull, setShowBioFull] = useState(false);
  const [reviewSort, setReviewSort] = useState('recent');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const REVIEWS_PER_PAGE = 4;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (pack?.id && trackCourseView) {
      trackCourseView(null, pack.id);
    }
  }, [id, pack?.id, trackCourseView]);

  if (!pack) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Value Pack Not Found</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            We couldn't find the requested value pack "{id}". It may have been moved or unpublished.
          </p>
          <div className="pt-2">
            <Link
              to="/value-packs"
              className="inline-flex items-center space-x-2 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Browse All Value Packs</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pricing & savings calculations
  const computedOriginalTotal = includedCourses.reduce((acc, c) => acc + (c.originalPrice || c.price), 0);
  const computedSavings = computedOriginalTotal > pack.price ? computedOriginalTotal - pack.price : pack.savings;

  // Total modules & lessons count
  const totalModulesCount = includedCourses.reduce((acc, c) => acc + (c.modules?.length || 0), 0);
  const totalLessonsCount = includedCourses.reduce((acc, c) => {
    return acc + (c.modules?.reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0) || 0);
  }, 0);

  // Check enrollment status
  const userOwnedCourseCount = includedCourses.filter(c => checkCourseAccess(c.id).hasAccess).length;
  const allCoursesOwned = includedCourses.length > 0 && userOwnedCourseCount === includedCourses.length;

  const handleEnrollClick = (e) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal(`/checkout?combo=${pack.id}`, 'signup');
    } else {
      navigate(`/checkout?combo=${pack.id}`);
    }
  };

  // Reviews logic (includes reviews for pack.id OR any included course)
  const relevantReviewIds = [pack.id, ...(pack.courseIds || [])];
  const packReviews = (reviews || []).filter(r => relevantReviewIds.includes(r.courseId) && r.status === 'approved');
  const myReview = currentUser ? packReviews.find(r => r.studentId === currentUser.id) : null;

  const sortedReviews = [...packReviews].sort((a, b) => {
    if (reviewSort === 'highest') return b.rating - a.rating;
    if (reviewSort === 'lowest') return a.rating - b.rating;
    return new Date(b.date) - new Date(a.date);
  });
  const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, REVIEWS_PER_PAGE);

  const avgRating = packReviews.length
    ? packReviews.reduce((sum, r) => sum + r.rating, 0) / packReviews.length
    : 4.9;

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: packReviews.filter(r => r.rating === star).length,
    percent: packReviews.length
      ? Math.round((packReviews.filter(r => r.rating === star).length / packReviews.length) * 100)
      : (star === 5 ? 85 : star === 4 ? 15 : 0)
  }));

  const handleSubmitReview = ({ rating: r, comment }) => {
    if (myReview) {
      updateReview(myReview.id, { rating: r, comment });
    } else {
      addReview({ courseId: pack.id, rating: r, comment });
    }
  };

  const handleHelpful = (reviewId) => {
    toggleHelpfulReview(reviewId);
  };

  // Collect all learning benefits across included courses
  const allLearningBenefits = includedCourses.flatMap(c => c.learningBenefits || []);
  const displayBenefits = allLearningBenefits.length > 0 ? Array.from(new Set(allLearningBenefits)) : [
    'Complete access to all included Tamil recorded video courses',
    'Master practical industry skills with step-by-step guidance',
    'Weekly Live Doubt Solving Sessions with mentors',
    '5+ Real-world practical client case study assignments',
    'Shareable Certificate of Completion for every included course',
    'Internship Application Eligibility upon completing project requirements'
  ];

  // Requirements for Value Pack
  const packRequirements = [
    'Basic computer literacy and a computer/smartphone with internet connection.',
    'Dedication of 4–5 hours per week to watch video lessons and practice assignments.',
    'No prior digital marketing background or coding required. Perfect for complete beginners.'
  ];

  // Full Description for Value Pack
  const packFullDescription = `The ${pack.name} is THYNK Digital Academy's all-in-one comprehensive learning package designed to take students from complete beginner to job-ready digital marketing specialist.

By combining ${includedCourses.length} industry-tailored courses into a single structured curriculum, you get step-by-step training covering every major channel of modern online marketing—all taught in clear, native Tamil language.

Whether you are looking to secure a high-paying job, launch your own digital agency, or grow your business, this value pack provides the exact strategies, tools, client templates, and practical exercises you need to achieve tangible results.`;

  // Instructor
  const instructor = {
    name: 'Sriram — THYNK Digital',
    title: 'Founder & Lead Digital Marketing Strategist',
    photo: '/founder.png',
    rating: 4.9,
    reviewCount: 1099,
    studentCount: 1400,
    courseCount: 5,
    bio: `Sriram is the founder and lead instructor at THYNK Digital Academy. With over 8+ years of hands-on experience running high-ROI performance marketing campaigns, SEO strategies, and web platforms for brands across South India, he has trained 1,400+ Tamil students and business owners.

His mission is to make high-quality, practical EdTech education accessible in Tamil, focusing 100% on real-world skills, live campaign setups, and client portfolio building rather than boring theory.`
  };
  const bioParagraphs = instructor.bio.split('\n\n').filter(Boolean);

  // Other Value Packs or Related Courses
  const otherPacks = valuePacks.filter(v => v.id !== pack.id);
  const relatedDisplayCourses = otherPacks.length > 0 ? [] : courses.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* ==================================================================== */}
      {/* 1. TOP HERO BANNER (DARK NAVY BACKGROUND)                            */}
      {/* ==================================================================== */}
      <section className="bg-[#0F172A] text-white py-10 sm:py-14 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Hero Content (~68%) */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-amber-400 text-slate-950 font-black text-xs uppercase px-3.5 py-1 rounded-md tracking-wider flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{pack.badge || 'COMBO VALUE PACK'}</span>
                </span>
                <span className="bg-[#2563EB] text-white font-extrabold text-xs uppercase px-3.5 py-1 rounded-md tracking-wider flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{includedCourses.length} COURSES INCLUDED</span>
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-md flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Taught in Tamil (தமிழ்)</span>
                </span>
              </div>

              {/* Main Pack Name */}
              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-white tracking-tight leading-[1.2]">
                {pack.name}
              </h1>

              {/* Pack Description */}
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl font-normal">
                {pack.description}
              </p>

              {/* Rating & Meta Row */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-1 font-medium">
                <div className="flex items-center space-x-1 text-amber-400 font-bold">
                  <span className="text-base">{avgRating.toFixed(1)}</span>
                  <StarRating rating={avgRating} size="sm" />
                  <span className="text-slate-400 font-normal">({packReviews.length} ratings)</span>
                </div>
                
                <span className="text-slate-600">•</span>

                <div className="flex items-center space-x-1 text-slate-300">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold text-white">1,800+ Students Enrolled</span>
                </div>

                <span className="text-slate-600">•</span>

                <div className="text-slate-300">
                  Created by <strong className="text-white font-semibold">{instructor.name}</strong>
                </div>
              </div>

              {/* Metadata Bar */}
              <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{includedCourses.length} Full Courses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{totalModulesCount} Total Modules</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Tamil Language</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified Certificates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Internship Eligibility</span>
                </div>
              </div>

            </div>

            {/* Spacer for desktop sticky sidebar alignment */}
            <div className="hidden lg:block lg:col-span-4" />

          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. MAIN PAGE LAYOUT GRID (LEFT CONTENT + RIGHT STICKY SIDEBAR)       */}
      {/* ==================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 relative">

          {/* ================================================================ */}
          {/* LEFT COLUMN CONTENT (~68% desktop)                               */}
          {/* ================================================================ */}
          <div className="lg:col-span-8 space-y-9">

            {/* A. THIS VALUE PACK INCLUDES (DETAILED COURSE CARDS) */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center space-x-3">
                  <Layers className="w-7 h-7 text-[#2563EB] shrink-0" />
                  <span>THIS VALUE PACK INCLUDES ({includedCourses.length} COURSES)</span>
                </h2>
              </div>

              <div className="space-y-6">
                {includedCourses.map((course, index) => {
                  const courseModulesCount = course.modules?.length || 0;
                  const courseLessonsCount = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
                  const isOwned = checkCourseAccess(course.id).hasAccess;

                  return (
                    <div 
                      key={course.id} 
                      className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 space-y-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <Link
                            to={`/course/${course.id}`}
                            onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                            className="shrink-0 group/img block overflow-hidden rounded-2xl"
                          >
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200 group-hover/img:scale-105 transition-transform"
                            />
                          </Link>
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-black uppercase bg-[#2563EB] text-white px-2.5 py-0.5 rounded">
                                COURSE 0{index + 1}
                              </span>
                              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                                TAMIL
                              </span>
                              {isOwned && (
                                <span className="text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded">
                                  ENROLLED ✓
                                </span>
                              )}
                            </div>

                            <Link
                              to={`/course/${course.id}`}
                              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                              className="block"
                            >
                              <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug hover:text-[#2563EB] transition-colors">
                                {course.title}
                              </h3>
                            </Link>

                            <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
                              {course.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Course Quick Stats & Action Link */}
                      <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-slate-600 font-semibold">
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="flex items-center space-x-1.5">
                            <BookOpen className="w-4 h-4 text-[#2563EB]" />
                            <span>{courseModulesCount} Modules</span>
                          </span>
                          <span className="flex items-center space-x-1.5">
                            <Clock className="w-4 h-4 text-[#2563EB]" />
                            <span>{courseLessonsCount} Lessons ({course.duration})</span>
                          </span>
                          <span className="flex items-center space-x-1.5">
                            <Award className="w-4 h-4 text-emerald-600" />
                            <span>Certificate Included</span>
                          </span>
                        </div>

                        <Link
                          to={`/course/${course.id}`}
                          onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                          className="inline-flex items-center space-x-1.5 text-[#2563EB] hover:text-blue-700 font-extrabold text-xs sm:text-sm shrink-0 hover:underline cursor-pointer"
                        >
                          <span>View Course Details</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* B. WHAT YOU'LL LEARN SECTION */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center space-x-3">
                <CheckCircle className="w-7 h-7 text-[#2563EB] shrink-0" />
                <span>WHAT YOU'LL LEARN IN THIS VALUE PACK</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayBenefits.map((b, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-base sm:text-lg text-[#0F172A] leading-[1.6] font-medium">
                    <Check className="w-5 h-5 text-[#10B981] shrink-0 mt-1 font-bold" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* C. VALUE PACK CURRICULUM & SYLLABUS */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Value Pack Curriculum</h3>
                  <p className="text-sm sm:text-base text-[#475569] mt-1 font-normal">
                    {includedCourses.length} Courses • {totalModulesCount} Modules • {totalLessonsCount} Lessons
                  </p>
                </div>
              </div>

              {/* Accordion for Courses & Modules */}
              <div className="space-y-6">
                {includedCourses.map((course, cIdx) => (
                  <div key={course.id} className="border border-[#E2E8F0] rounded-2xl p-5 space-y-4 bg-white">
                    
                    <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                      <span className="bg-[#2563EB] text-white font-extrabold text-xs px-2.5 py-1 rounded">
                        COURSE 0{cIdx + 1}
                      </span>
                      <h4 className="font-extrabold text-lg sm:text-xl text-[#0F172A]">
                        {course.title}
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {course.modules?.map((mod, modIdx) => {
                        const uniqueModId = `${course.id}-${mod.id || modIdx}`;
                        const isOpen = openCourseModuleId === uniqueModId;

                        return (
                          <div key={uniqueModId} className="border border-slate-200 rounded-xl overflow-hidden">
                            <button
                              onClick={() => setOpenCourseModuleId(isOpen ? null : uniqueModId)}
                              className="w-full text-left p-4 bg-[#F8FAFC] hover:bg-slate-100 font-bold text-[#0F172A] text-sm sm:text-base flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <div className="flex items-center space-x-3 pr-4">
                                <BookOpen className="w-4 h-4 text-[#2563EB] shrink-0" />
                                <span>Module {modIdx + 1}: {mod.title}</span>
                              </div>
                              <div className="flex items-center space-x-3 shrink-0">
                                <span className="text-xs text-[#475569] font-medium hidden sm:inline">
                                  {mod.lessons?.length || 0} lessons • {mod.duration}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2563EB]' : ''}`} />
                              </div>
                            </button>

                            {isOpen && (
                              <div className="p-4 bg-white divide-y divide-slate-100 text-xs sm:text-sm">
                                {mod.lessons?.map((les, lesIdx) => (
                                  <div key={les.id || lesIdx} className="py-2.5 flex items-center justify-between text-slate-800">
                                    <div className="flex items-center space-x-2 pr-2">
                                      {les.isPreview ? (
                                        <button
                                          onClick={() => setPreviewCourse(course)}
                                          className="text-[#10B981] font-extrabold text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center space-x-1 cursor-pointer"
                                        >
                                          <PlayCircle className="w-3.5 h-3.5 text-[#10B981]" />
                                          <span>FREE PREVIEW</span>
                                        </button>
                                      ) : (
                                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      )}
                                      <span className="font-medium text-[#0F172A]">{les.title}</span>
                                    </div>
                                    <span className="text-xs text-slate-500 font-mono shrink-0">{les.duration}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* D. REQUIREMENTS SECTION */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-6">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Requirements</h3>
              <ul className="space-y-3">
                {packRequirements.map((req, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-base sm:text-[17px] text-[#0F172A] leading-[1.7]">
                    <span className="w-2 h-2 rounded-full bg-[#0F172A] mt-2.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* E. DESCRIPTION SECTION */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-6">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Description</h3>
              <div className="space-y-4 text-base sm:text-[17px] text-[#0F172A] leading-[1.75]">
                {packFullDescription.split('\n\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            {/* F. INSTRUCTOR SECTION */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-7">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Your Instructor</h3>

              <div className="flex flex-col sm:flex-row items-start gap-6">
                <img
                  src={instructor.photo}
                  alt={instructor.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#E2E8F0] shadow-md shrink-0"
                />

                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">{instructor.name}</h4>
                    <p className="text-[#2563EB] font-semibold text-sm sm:text-base mt-0.5">{instructor.title}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#475569] font-medium">
                    <div className="flex items-center space-x-1.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="font-bold text-[#0F172A]">{instructor.rating}</span>
                      <span>Instructor Rating</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center space-x-1.5">
                      <MessageSquare className="w-4 h-4 text-[#2563EB] shrink-0" />
                      <span className="font-bold text-[#0F172A]">{instructor.reviewCount.toLocaleString()}</span>
                      <span>Reviews</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span className="font-bold text-[#0F172A]">{instructor.studentCount.toLocaleString()}+</span>
                      <span>Students</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center space-x-1.5">
                      <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="font-bold text-[#0F172A]">{instructor.courseCount}</span>
                      <span>Courses</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div 
                  className={`text-base sm:text-[17px] text-[#0F172A] leading-[1.75] space-y-4 ${!showBioFull ? 'line-clamp-4 overflow-hidden' : ''}`}
                  style={!showBioFull ? { WebkitLineClamp: 4, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}}
                >
                  {bioParagraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
                {bioParagraphs.length > 1 && (
                  <button
                    onClick={() => setShowBioFull(!showBioFull)}
                    className="text-sm font-bold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    {showBioFull ? 'Show less ▲' : 'Show more ▼'}
                  </button>
                )}
              </div>
            </div>

            {/* G. STUDENT REVIEWS SECTION */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-8">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Student Reviews</h3>
                
                {allCoursesOwned || userOwnedCourseCount > 0 ? (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="flex items-center space-x-2 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{myReview ? 'Edit Your Review' : 'Write a Review'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        openAuthModal(`/value-pack/${pack.id}`, 'signup');
                      }
                    }}
                    className="flex items-center space-x-2 bg-slate-100 text-slate-400 font-semibold text-sm px-5 py-2.5 rounded-xl cursor-not-allowed border border-slate-200 shrink-0"
                    title={!currentUser ? 'Login to write a review' : 'Enroll in this pack to write a review'}
                  >
                    <Lock className="w-4 h-4" />
                    <span>{!currentUser ? 'Login to Review' : 'Enroll to Review'}</span>
                  </button>
                )}
              </div>

              {packReviews.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <MessageSquare className="w-14 h-14 text-slate-200 mx-auto" />
                  <p className="text-lg font-bold text-[#0F172A]">No reviews yet</p>
                  <p className="text-sm text-[#475569]">Be the first student to review this value pack.</p>
                </div>
              ) : (
                <>
                  {/* Rating Summary */}
                  <div className="flex flex-col sm:flex-row gap-8 p-6 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                    <div className="flex flex-col items-center justify-center min-w-[120px] space-y-2">
                      <span className="text-6xl font-black text-[#0F172A]">{avgRating.toFixed(1)}</span>
                      <StarRating rating={avgRating} size="md" />
                      <span className="text-xs text-[#475569] font-semibold uppercase tracking-wide">Value Pack Rating</span>
                    </div>

                    <div className="flex-1 space-y-2">
                      {ratingDist.map(({ star, count, percent }) => (
                        <div key={star} className="flex items-center space-x-3">
                          <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-amber-400 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-[#475569] font-medium w-20 shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{star} star</span>
                          </div>
                          <span className="text-xs font-bold text-[#0F172A] w-8 shrink-0 text-right">{percent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sort Controls */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#475569] font-medium">
                      {packReviews.length} review{packReviews.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-[#475569] font-medium">Sort:</span>
                      <select
                        value={reviewSort}
                        onChange={e => setReviewSort(e.target.value)}
                        className="text-sm font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        <option value="recent">Most Recent</option>
                        <option value="highest">Highest Rated</option>
                        <option value="lowest">Lowest Rated</option>
                      </select>
                    </div>
                  </div>

                  {/* Review Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {displayedReviews.map(review => (
                      <div key={review.id} className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] space-y-3 flex flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                              {review.studentName?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <p className="text-sm font-extrabold text-[#0F172A]">{review.studentName}</p>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <StarRating rating={review.rating} size="sm" />
                                {review.verifiedPurchase && (
                                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-[#10B981] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>VERIFIED</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400 font-medium shrink-0">
                            {new Date(review.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        <p className="text-sm sm:text-[15px] text-[#0F172A] leading-[1.7] flex-1">{review.comment}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                          <span className="text-xs text-slate-400 font-medium">Helpful?</span>
                          <button
                            onClick={() => handleHelpful(review.id)}
                            className="flex items-center space-x-1.5 text-xs font-semibold text-[#475569] hover:text-[#2563EB] transition-colors cursor-pointer"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{review.helpfulCount || 0}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {sortedReviews.length > REVIEWS_PER_PAGE && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="text-sm font-extrabold text-[#2563EB] hover:underline cursor-pointer"
                      >
                        {showAllReviews
                          ? `Show fewer reviews ▲`
                          : `Show all ${sortedReviews.length} reviews ▼`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* H. OTHER VALUE PACKS / RELATED COURSES */}
            {otherPacks.length > 0 ? (
              <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-6">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Other Value Packs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {otherPacks.map(op => (
                    <Link
                      key={op.id}
                      to={`/value-pack/${op.id}`}
                      className="group bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                          {op.badge || 'VALUE PACK'}
                        </span>
                        <span className="text-xs font-bold text-[#2563EB]">
                          {op.courseIds?.length || 0} Courses
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                        {op.name}
                      </h4>
                      <p className="text-xs text-[#475569] line-clamp-2">{op.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <span className="text-base font-black text-[#0F172A]">₹{op.price.toLocaleString()}</span>
                        <span className="text-xs font-extrabold text-[#2563EB] group-hover:underline">Explore Pack →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : relatedDisplayCourses.length > 0 && (
              <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-6">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Related Courses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {relatedDisplayCourses.map(rc => (
                    <Link
                      key={rc.id}
                      to={`/course/${rc.id}`}
                      className="group bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={rc.thumbnail}
                          alt={rc.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="text-sm font-extrabold text-[#0F172A] leading-snug line-clamp-2 group-hover:text-[#2563EB] transition-colors">
                          {rc.title}
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black text-[#0F172A]">₹{rc.price.toLocaleString()}</span>
                          <span className="text-xs font-bold text-[#10B981]">EXPLORE</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ================================================================ */}
          {/* RIGHT COLUMN SIDEBAR (~32% desktop, STICKY ENROLLMENT CARD)      */}
          {/* ================================================================ */}
          <div className="lg:col-span-4">
            
            <div className="lg:-mt-48 lg:sticky lg:top-24 space-y-6">
              
              {/* Sticky Enrollment Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xl space-y-6 overflow-hidden">
                
                {/* Pack Visual / Included Courses Stack Header */}
                <div className="p-5 bg-gradient-to-br from-slate-900 to-[#0F172A] rounded-2xl text-white space-y-3 border border-slate-800 shadow-inner">
                  <div className="flex items-center justify-between text-xs">
                    <span className="bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded uppercase">
                      {pack.badge || 'COMBO PACK'}
                    </span>
                    <span className="text-sky-400 font-bold">
                      {includedCourses.length} COURSES BUNDLE
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-white leading-tight">
                    {pack.name}
                  </h4>
                  <ul className="space-y-1.5 pt-1 text-xs text-slate-300">
                    {includedCourses.map(c => (
                      <li key={c.id} className="flex items-center space-x-2 truncate">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{c.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing Display */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl sm:text-4xl font-black text-[#0F172A]">₹{pack.price.toLocaleString()}</span>
                      {computedOriginalTotal > 0 && (
                        <span className="text-base text-slate-400 line-through ml-2 font-medium">₹{computedOriginalTotal.toLocaleString()}</span>
                      )}
                    </div>
                    {computedSavings > 0 && (
                      <span className="bg-emerald-50 text-[#10B981] font-extrabold text-xs sm:text-sm px-3 py-1 rounded-full border border-emerald-200">
                        SAVE ₹{computedSavings.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Full Value Pack access • 6 Calendar Months validity</p>
                </div>

                {/* Owned Courses Notification */}
                {userOwnedCourseCount > 0 && !allCoursesOwned && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center space-x-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>You already own {userOwnedCourseCount} of {includedCourses.length} courses in this pack.</span>
                  </div>
                )}

                {/* Primary CTA Button */}
                {allCoursesOwned ? (
                  <Link
                    to="/dashboard"
                    className="w-full bg-[#10B981] hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base py-4 rounded-xl shadow-md transition-all text-center block"
                  >
                    ALREADY ENROLLED (GO TO MY LEARNINGS)
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleEnrollClick}
                    className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-black text-sm sm:text-base py-4 rounded-xl shadow-lg shadow-blue-600/25 transition-all text-center flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>ENROLL IN VALUE PACK</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}

                {/* Concise Course Benefits Checklist */}
                <div className="pt-4 border-t border-slate-100 space-y-3 text-sm text-[#0F172A] font-semibold">
                  <p className="text-xs font-black uppercase text-slate-400 tracking-wider">This value pack includes:</p>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-2.5">
                      <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>All {includedCourses.length} Full Courses Included</span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>100% Tamil Recorded Video Lessons</span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>6-Month Access with Updates</span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>Weekly Live Doubt Solving Sessions</span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>Official Shareable Certificate for Each Course</span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>Practical Case Study Assignments</span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>Internship Application Eligibility</span>
                    </li>
                  </ul>
                </div>

                {/* Subtle Policy Note */}
                <div className="pt-2 text-center border-t border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium">
                    Instant Access • 6-Month Validity • No Refund Policy
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Free Video Preview Modal */}
      {previewCourse && (
        <VideoPreviewModal
          course={previewCourse}
          onClose={() => setPreviewCourse(null)}
        />
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        existingReview={myReview}
        packName={pack.name}
      />
    </div>
  );
}
