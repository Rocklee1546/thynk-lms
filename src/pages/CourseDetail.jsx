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
  ShieldAlert, 
  Lock, 
  Users, 
  ArrowRight,
  BookOpen,
  User,
  Check,
  Smartphone,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  X,
  Edit3,
  AlertCircle,
  ChevronRight,
  BookMarked
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
function ReviewModal({ isOpen, onClose, onSubmit, existingReview, courseName }) {
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
        {/* Close */}
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-xl font-extrabold text-[#0F172A] mb-1">
          {existingReview ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        <p className="text-sm text-slate-500 mb-6">{courseName}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">Your Rating *</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">Your Review *</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience with this course. What did you learn? What did you like most? How has it helped you?"
              rows={5}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0F172A] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">{comment.length} characters (minimum 20)</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
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
// MAIN COURSE DETAIL PAGE
// ─────────────────────────────────────────────────────────────
export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    courses,
    currentUser,
    trackCourseView,
    openAuthModal,
    checkCourseAccess,
    reviews,
    addReview,
    updateReview,
    toggleHelpfulReview
  } = useLMS();

  const toSlug = (text) => (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const course = courses.find(c => 
    c.id === id || 
    (c.slug && c.slug === id) || 
    toSlug(c.title) === id || 
    toSlug(c.id) === id
  );

  const [openModuleId, setOpenModuleId] = useState(course?.modules?.[0]?.id || null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showBioFull, setShowBioFull] = useState(false);
  const [reviewSort, setReviewSort] = useState('recent');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const REVIEWS_PER_PAGE = 4;

  // Reset scroll and state when switching between courses
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (course) {
      setOpenModuleId(course.modules?.[0]?.id || null);
      setShowBioFull(false);
      setShowAllReviews(false);
      setShowPreviewModal(false);
      setShowReviewModal(false);
    }
  }, [id, course?.id]);

  useEffect(() => {
    if (course?.id) {
      trackCourseView(course.id);
    }
  }, [course?.id, trackCourseView]);

  if (!course) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Course Not Found</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            We couldn't find the requested course "{id}". It may have been moved, renamed, or unpublished.
          </p>
          <div className="pt-2">
            <Link
              to="/courses"
              className="inline-flex items-center space-x-2 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Browse All Courses</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const discountPercent = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  const accessStatus = checkCourseAccess(course.id);
  const isEnrolled = accessStatus.hasAccess;

  const totalLessonsCount = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 18;

  const handleEnrollClick = (e) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal(`/checkout?course=${course.id}`, 'signup');
    } else {
      navigate(`/checkout?course=${course.id}`);
    }
  };

  // ── Reviews logic ──
  const courseReviews = (reviews || []).filter(r => r.courseId === course.id && r.status === 'approved');
  const myReview = currentUser ? courseReviews.find(r => r.studentId === currentUser.id) : null;

  const sortedReviews = [...courseReviews].sort((a, b) => {
    if (reviewSort === 'highest') return b.rating - a.rating;
    if (reviewSort === 'lowest') return a.rating - b.rating;
    return new Date(b.date) - new Date(a.date); // most recent
  });
  const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, REVIEWS_PER_PAGE);

  const avgRating = courseReviews.length
    ? courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length
    : 0;

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: courseReviews.filter(r => r.rating === star).length,
    percent: courseReviews.length
      ? Math.round((courseReviews.filter(r => r.rating === star).length / courseReviews.length) * 100)
      : 0
  }));

  const handleSubmitReview = ({ rating: r, comment }) => {
    if (myReview) {
      updateReview(myReview.id, { rating: r, comment });
    } else {
      addReview({ courseId: course.id, rating: r, comment });
    }
  };

  const handleHelpful = (reviewId) => {
    toggleHelpfulReview(reviewId);
  };

  // Related courses (same category, different id)
  const relatedCourses = courses
    .filter(c => c.id !== course.id && c.category === course.category && c.isPublished)
    .slice(0, 3);

  // Instructor
  const instructor = course.instructor || {
    name: 'THYNK DIGITAL SOLUTIONS',
    title: 'Lead Mentor & Founder',
    photo: '/founder.png',
    rating: 4.9,
    reviewCount: 1099,
    studentCount: 1400,
    courseCount: 5,
    bio: 'Practical Tamil digital marketing training focused on enabling South Indian students to build client portfolios and real skills.'
  };

  const bioParagraphs = (instructor.bio || '').split('\n\n').filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ==================================================================== */}
      {/* 1. TOP HERO BANNER (NAVY BACKGROUND)                                 */}
      {/* ==================================================================== */}
      <section className="bg-[#0F172A] text-white py-10 sm:py-14 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Hero Content (~68%) */}
            <div className="lg:col-span-8 space-y-5">

              {/* Category & Language Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-[#2563EB] text-white font-extrabold text-xs uppercase px-3.5 py-1 rounded-md tracking-wider">
                  {course.category}
                </span>
                {course.badge && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs uppercase px-3 py-1 rounded-md">
                    {course.badge}
                  </span>
                )}
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-md flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Taught in Tamil (தமிழ்)</span>
                </span>
              </div>

              {/* Main Course Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-white tracking-tight leading-[1.2]">
                {course.title}
              </h1>

              {/* Short Course Description */}
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl font-normal">
                {course.description}
              </p>

              {/* Course Meta Row */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-1 font-medium">
                <div className="flex items-center space-x-1 text-amber-400 font-bold">
                  <span className="text-base">{(avgRating || course.rating || 4.9).toFixed(1)}</span>
                  <StarRating rating={avgRating || course.rating || 4.9} size="sm" />
                  <span className="text-slate-400 font-normal">({courseReviews.length || course.reviewCount || 0} ratings)</span>
                </div>
                <span className="text-slate-600">•</span>
                <div className="flex items-center space-x-1 text-slate-300">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold text-white">1,400+ Students Enrolled</span>
                </div>
                <span className="text-slate-600">•</span>
                <div className="text-slate-300">
                  Created by <strong className="text-white font-semibold">{instructor.name}</strong>
                </div>
              </div>

              {/* Quick Metadata Bar */}
              <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Tamil</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{course.duration} Recorded Lessons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Shareable Certificate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Internship Opportunity</span>
                </div>
              </div>

            </div>

            {/* Spacer for sticky sidebar alignment */}
            <div className="hidden lg:block lg:col-span-4" />

          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. MAIN PAGE LAYOUT GRID                                             */}
      {/* ==================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 relative">

          {/* ================================================================ */}
          {/* LEFT COLUMN CONTENT                                               */}
          {/* ================================================================ */}
          <div className="lg:col-span-8 space-y-9">

            {/* A. WHAT YOU'LL LEARN SECTION */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center space-x-3">
                <CheckCircle className="w-7 h-7 text-[#2563EB] shrink-0" />
                <span>WHAT YOU'LL LEARN</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {course.learningBenefits ? (
                  course.learningBenefits.map((b, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-base sm:text-lg text-[#0F172A] leading-[1.6] font-medium">
                      <Check className="w-5 h-5 text-[#10B981] shrink-0 mt-1 font-bold" />
                      <span>{b}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start space-x-3 text-base sm:text-lg text-[#0F172A] leading-[1.6] font-medium">
                      <Check className="w-5 h-5 text-[#10B981] shrink-0 mt-1" />
                      <span>100% Recorded Tamil Video Sessions with Lifetime Access</span>
                    </div>
                    <div className="flex items-start space-x-3 text-base sm:text-lg text-[#0F172A] leading-[1.6] font-medium">
                      <Check className="w-5 h-5 text-[#10B981] shrink-0 mt-1" />
                      <span>Weekly Live Doubt Solving Sessions with Industry Experts</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* B. THIS COURSE INCLUDES */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-5">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">
                THIS COURSE INCLUDES
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base sm:text-[17px] text-[#475569] font-medium">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-[#2563EB] shrink-0" />
                  <span>{course.duration} on-demand video lessons</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-[#2563EB] shrink-0" />
                  <span>Taught in clear native Tamil language</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-[#2563EB] shrink-0" />
                  <span>Access on Mobile, Tablet & Desktop</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-[#2563EB] shrink-0" />
                  <span>5+ Practical client case study assignments</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-[#10B981] shrink-0" />
                  <span>Shareable official Certificate of Completion</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>Internship application eligibility</span>
                </div>
              </div>
            </div>

            {/* C. COURSE SYLLABUS */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Course Syllabus</h3>
                  <p className="text-sm sm:text-base text-[#475569] mt-1 font-normal">
                    {course.modules?.length || 5} modules • {totalLessonsCount} lessons • {course.duration} total duration
                  </p>
                </div>
                <button
                  onClick={() => setOpenModuleId(openModuleId ? null : course.modules?.[0]?.id)}
                  className="text-xs sm:text-sm font-bold text-[#2563EB] hover:underline shrink-0"
                >
                  {openModuleId ? 'Collapse all' : 'Expand all'}
                </button>
              </div>

              <div className="space-y-4">
                {course.modules?.map((mod, modIdx) => (
                  <div key={mod.id || modIdx} className="border border-[#E2E8F0] rounded-2xl overflow-hidden transition-all">

                    {/* Module Accordion Header */}
                    <button
                      onClick={() => setOpenModuleId(openModuleId === mod.id ? null : mod.id)}
                      className="w-full text-left p-5 sm:p-6 bg-[#F8FAFC] hover:bg-slate-100/80 font-bold text-[#0F172A] text-base sm:text-lg flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3.5 pr-4">
                        <BookOpen className="w-5 h-5 text-[#2563EB] shrink-0" />
                        <span>{mod.title}</span>
                      </div>
                      <div className="flex items-center space-x-4 shrink-0">
                        <span className="text-sm text-[#475569] font-medium hidden sm:inline">
                          {mod.lessons?.length || 0} lessons • {mod.duration}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openModuleId === mod.id ? 'rotate-180 text-[#2563EB]' : ''}`} />
                      </div>
                    </button>

                    {/* Expandable Lessons */}
                    {openModuleId === mod.id && (
                      <div className="p-5 sm:p-6 bg-white divide-y divide-slate-100">
                        {mod.lessons?.map((les, lesIdx) => (
                          <div key={les.id || lesIdx} className="py-3.5 sm:py-4 flex items-center justify-between text-base sm:text-[17px] leading-relaxed">
                            <div className="flex items-center space-x-3 pr-3">
                              {les.isPreview ? (
                                <button
                                  onClick={() => setShowPreviewModal(true)}
                                  className="text-[#10B981] hover:text-emerald-700 flex items-center space-x-1.5 font-extrabold text-xs sm:text-sm bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg shrink-0 cursor-pointer"
                                >
                                  <PlayCircle className="w-4 h-4 text-[#10B981]" />
                                  <span>FREE PREVIEW</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (!currentUser) {
                                      openAuthModal(`/player/${course.id}`, 'signup');
                                    } else {
                                      navigate(`/player/${course.id}`);
                                    }
                                  }}
                                  className="flex items-center space-x-2 text-[#0F172A] hover:text-[#2563EB] font-medium cursor-pointer text-left group"
                                  title="Protected lesson — login required"
                                >
                                  <Lock className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-[#2563EB]" />
                                  <span className="group-hover:underline">{les.title}</span>
                                </button>
                              )}
                              {les.isPreview && (
                                <span className="font-semibold text-[#0F172A] text-base sm:text-[17px]">{les.title}</span>
                              )}
                            </div>
                            <span className="text-sm font-mono text-slate-500 shrink-0 font-medium">{les.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* D. REQUIREMENTS SECTION */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-6">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Requirements</h3>
              <ul className="space-y-3">
                {course.requirements && course.requirements.length > 0 ? (
                  course.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start space-x-3 text-base sm:text-[17px] text-[#0F172A] leading-[1.7]">
                      <span className="w-2 h-2 rounded-full bg-[#0F172A] mt-2.5 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-base sm:text-[17px] text-[#475569] leading-relaxed">
                    No specific prerequisites required. This course is suitable for complete beginners.
                  </li>
                )}
              </ul>
            </div>

            {/* E. DESCRIPTION SECTION */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-6">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Description</h3>
              <div className="space-y-4 text-base sm:text-[17px] text-[#0F172A] leading-[1.75]">
                {course.fullDescription ? (
                  course.fullDescription.split('\n\n').map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))
                ) : (
                  <p className="text-[#475569]">{course.description}</p>
                )}
              </div>
            </div>

            {/* F. INSTRUCTOR SECTION */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-7">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Your Instructor</h3>

              {/* Instructor Card */}
              <div className="flex flex-col sm:flex-row items-start gap-6">

                {/* Photo */}
                <img
                  src={instructor.photo || '/founder.png'}
                  alt={instructor.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#E2E8F0] shadow-md shrink-0"
                />

                {/* Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">{instructor.name}</h4>
                    <p className="text-[#2563EB] font-semibold text-sm sm:text-base mt-0.5">{instructor.title}</p>
                  </div>

                  {/* Instructor Stats Row */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#475569] font-medium">
                    <div className="flex items-center space-x-1.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="font-bold text-[#0F172A]">{instructor.rating}</span>
                      <span>Instructor Rating</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center space-x-1.5">
                      <MessageSquare className="w-4 h-4 text-[#2563EB] shrink-0" />
                      <span className="font-bold text-[#0F172A]">{(instructor.reviewCount || 0).toLocaleString()}</span>
                      <span>Reviews</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span className="font-bold text-[#0F172A]">{(instructor.studentCount || 0).toLocaleString()}+</span>
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

              {/* Bio */}
              <div className="space-y-3">
                <div className={`text-base sm:text-[17px] text-[#0F172A] leading-[1.75] space-y-4 ${!showBioFull ? 'line-clamp-4 overflow-hidden' : ''}`}
                  style={!showBioFull ? { WebkitLineClamp: 4, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}}>
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
                {/* Write Review Button */}
                {isEnrolled ? (
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
                        openAuthModal(`/course/${course.id}`, 'signup');
                      }
                    }}
                    className="flex items-center space-x-2 bg-slate-100 text-slate-400 font-semibold text-sm px-5 py-2.5 rounded-xl cursor-not-allowed border border-slate-200 shrink-0"
                    title={!currentUser ? 'Login to write a review' : 'Enroll in this course to write a review'}
                  >
                    <Lock className="w-4 h-4" />
                    <span>{!currentUser ? 'Login to Review' : 'Enroll to Review'}</span>
                  </button>
                )}
              </div>

              {courseReviews.length === 0 ? (
                /* Empty State */
                <div className="text-center py-12 space-y-3">
                  <MessageSquare className="w-14 h-14 text-slate-200 mx-auto" />
                  <p className="text-lg font-bold text-[#0F172A]">No reviews yet</p>
                  <p className="text-sm text-[#475569]">Be the first student to review this course.</p>
                </div>
              ) : (
                <>
                  {/* Rating Summary */}
                  <div className="flex flex-col sm:flex-row gap-8 p-6 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                    {/* Average */}
                    <div className="flex flex-col items-center justify-center min-w-[120px] space-y-2">
                      <span className="text-6xl font-black text-[#0F172A]">{avgRating.toFixed(1)}</span>
                      <StarRating rating={avgRating} size="md" />
                      <span className="text-xs text-[#475569] font-semibold uppercase tracking-wide">Course Rating</span>
                    </div>

                    {/* Distribution Bars */}
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
                      {courseReviews.length} review{courseReviews.length !== 1 ? 's' : ''}
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

                  {/* Review Cards — 2 col desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {displayedReviews.map(review => (
                      <div key={review.id} className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] space-y-3 flex flex-col">
                        {/* Reviewer Header */}
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

                        {/* Review Text */}
                        <p className="text-sm sm:text-[15px] text-[#0F172A] leading-[1.7] flex-1">{review.comment}</p>

                        {/* Helpful */}
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

                  {/* Show More / Less */}
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

            {/* H. RELATED COURSES */}
            {relatedCourses.length > 0 && (
              <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-6">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Related Courses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {relatedCourses.map(rc => {
                    const rcDiscount = rc.originalPrice
                      ? Math.round(((rc.originalPrice - rc.price) / rc.originalPrice) * 100)
                      : 0;
                    return (
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
                            {rcDiscount > 0 && (
                              <span className="text-xs font-bold text-[#10B981]">{rcDiscount}% OFF</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-amber-500">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="font-bold">{rc.rating}</span>
                            <span className="text-slate-400">({rc.reviewCount})</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* ================================================================ */}
          {/* RIGHT COLUMN — STICKY ENROLLMENT CARD                            */}
          {/* ================================================================ */}
          <div className="lg:col-span-4">
            <div className="lg:-mt-48 lg:sticky lg:top-24 space-y-6">

              {/* Enrollment Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xl space-y-6 overflow-hidden">

                {/* Video Preview Thumbnail */}
                <div className="relative aspect-video rounded-2xl overflow-hidden group bg-black shadow-inner">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 hover:bg-black/40 transition-colors text-white font-bold text-xs space-y-2 cursor-pointer"
                  >
                    <PlayCircle className="w-14 h-14 text-sky-400 animate-pulse" />
                    <span className="bg-slate-900/90 px-3.5 py-1.5 rounded-full text-xs font-extrabold border border-slate-700 tracking-wide">
                      WATCH FREE TAMIL PREVIEW
                    </span>
                  </button>
                </div>

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl sm:text-4xl font-black text-[#0F172A]">₹{course.price.toLocaleString()}</span>
                      {course.originalPrice && (
                        <span className="text-base text-slate-400 line-through ml-2 font-medium">₹{course.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    {discountPercent > 0 && (
                      <span className="bg-emerald-50 text-[#10B981] font-extrabold text-xs sm:text-sm px-3 py-1 rounded-full border border-emerald-200">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Full course access • 6 Calendar Months validity</p>
                </div>

                {/* CTA Button */}
                {isEnrolled ? (
                  <Link
                    to={`/player/${course.id}`}
                    className="w-full bg-[#10B981] hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base py-4 rounded-xl shadow-md transition-all text-center block"
                  >
                    CONTINUE LEARNING IN PLAYER
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleEnrollClick}
                    className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-black text-sm sm:text-base py-4 rounded-xl shadow-lg shadow-blue-600/25 transition-all text-center flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>ENROLL NOW</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}

                {/* Benefits Checklist */}
                <div className="pt-4 border-t border-slate-100 space-y-3 text-sm text-[#0F172A] font-semibold">
                  <p className="text-xs font-black uppercase text-slate-400 tracking-wider">This course includes:</p>
                  <ul className="space-y-3">
                    {[
                      '100% Tamil Recorded Video Lessons',
                      '6-Month Access with Updates',
                      'Weekly Live Doubt Solving Sessions',
                      'Official Shareable Certificate',
                      'Practical Case Study Projects',
                      'Internship Eligibility for Students'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2.5">
                        <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Policy Note */}
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

      {/* Free Video Modal */}
      {showPreviewModal && (
        <VideoPreviewModal
          course={course}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        existingReview={myReview}
        courseName={course.title}
      />
    </div>
  );
}
