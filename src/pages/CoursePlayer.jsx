import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLMS } from '../context/LMSContext';
import {
  PlayCircle,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  BookOpen,
  Download,
  Menu,
  X,
  AlertTriangle,
  ArrowRight,
  Check
} from 'lucide-react';
import ThynkLogo from '../components/ThynkLogo';

export default function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    courses,
    currentUser,
    toggleLessonCompletion,
    checkCourseAccess,
    openAuthModal
  } = useLMS();

  // Course resolution
  const course = courses.find(c => c.id === id) || courses[0];

  // Flatten all lessons
  const allLessons = [];
  course?.modules?.forEach(mod => {
    mod.lessons?.forEach(les => {
      allLessons.push({ ...les, moduleTitle: mod.title, moduleId: mod.id });
    });
  });

  const [activeLessonId, setActiveLessonId] = useState(allLessons[0]?.id || 'les-1-1');
  const [sidebarOpen, setSidebarOpen] = useState(true); // mobile sidebar toggle
  const [activeTab, setActiveTab] = useState('overview');
  // Track which modules are expanded in sidebar (all expanded by default)
  const [expandedModules, setExpandedModules] = useState(
    () => Object.fromEntries((course?.modules || []).map(m => [m.id, true]))
  );

  const access = checkCourseAccess(course?.id);
  const isEnrolled = access.hasAccess;

  const activeLesson = allLessons.find(l => l.id === activeLessonId) || allLessons[0];
  const activeLessonIdx = allLessons.findIndex(l => l.id === activeLessonId);

  const userProg = currentUser?.progress?.[course?.id] || { completedLessonIds: [] };
  const completedCount = userProg.completedLessonIds?.length || 0;
  const isCompleted = userProg.completedLessonIds?.includes(activeLesson?.id);

  const goToNext = () => {
    if (activeLessonIdx < allLessons.length - 1) {
      setActiveLessonId(allLessons[activeLessonIdx + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrev = () => {
    if (activeLessonIdx > 0) {
      setActiveLessonId(allLessons[activeLessonIdx - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const canPlayActiveLesson = isEnrolled || activeLesson?.isPreview;

  // ─── Access Guards ─────────────────────────────────────────────────────────

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-electric-600/20 border border-electric-500/30 flex items-center justify-center text-electric-400">
          <Lock className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-black">Sign In to Access Player</h2>
          <p className="text-xs text-slate-400">Please sign in to view course contents and track your progress.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openAuthModal(`/player/${course.id}`, 'signup')}
            className="bg-electric-600 hover:bg-electric-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg cursor-pointer"
          >
            Sign Up / Log In to View Course
          </button>
          <Link
            to={`/course/${course.id}`}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-5 py-3 rounded-xl"
          >
            View Course Overview
          </Link>
        </div>
      </div>
    );
  }

  if (access.isExpired) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div className="max-w-lg space-y-3">
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            6-Month Access Expired
          </span>
          <h2 className="text-3xl font-black">Your Course Access Has Expired</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your course access period has ended. Please purchase the course again to continue learning.
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 text-xs text-slate-400">
          <div className="flex justify-between items-center text-slate-300">
            <span>Course:</span>
            <span className="font-bold text-white">{course.title}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Expired On:</span>
            <span className="font-bold text-amber-400">{access.expiryFormatted}</span>
          </div>
          <Link
            to={`/checkout?course=${course.id}`}
            className="w-full bg-electric-600 hover:bg-electric-700 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all"
          >
            <span>RENEW 6-MONTH ACCESS</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ─── Main Player Layout ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>

      {/* ═══ COMPACT DARK HEADER (Udemy-style) ═══ */}
      <header className="sticky top-0 z-40 bg-[#1c1d1f] text-white flex-shrink-0" style={{ minHeight: '56px' }}>
        <div className="flex items-center justify-between px-4 h-14">

          {/* Left: Logo + Course Title */}
          <div className="flex items-center space-x-4 min-w-0">
            {/* THYNK Logo compact */}
            <Link to="/" className="shrink-0">
              <ThynkLogo className="h-7 w-auto" />
            </Link>

            {/* Divider */}
            <div className="hidden sm:block w-px h-5 bg-slate-700" />

            {/* Course title */}
            <div className="hidden sm:block min-w-0">
              <p className="font-semibold text-[13px] text-white leading-tight truncate max-w-xs lg:max-w-xl">
                {course.title}
              </p>
              {access.daysRemaining !== null && (
                <p className="text-[10px] text-emerald-400 font-medium">
                  {access.daysRemaining} days left in 6-month access
                </p>
              )}
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center space-x-2 shrink-0">

            {/* Mark Complete button (desktop) */}
            {isEnrolled && (
              <button
                onClick={() => toggleLessonCompletion(course.id, activeLesson.id)}
                className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold border transition-colors cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-400 text-slate-300 hover:border-white hover:text-white'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isCompleted ? 'Completed' : 'Mark complete'}</span>
              </button>
            )}

            {/* Dashboard Link */}
            <Link
              to="/dashboard"
              className="hidden sm:inline-block text-xs font-bold px-3 py-1.5 rounded border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white transition-colors"
            >
              My Learnings
            </Link>

            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle course content"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </button>

            {/* Back to course detail */}
            <Link
              to={`/course/${course.id}`}
              className="p-2 rounded text-slate-400 hover:text-white transition-colors"
              title="Back to course overview"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </header>

      {/* ═══ PLAYER ROW: Video LEFT + Sidebar RIGHT ═══ */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 'calc(100vh - 56px)' }}>

        {/* ── Left: Video Area + Tabs below ── */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-white min-w-0">

          {/* Video Player */}
          <div className="w-full bg-black" style={{ aspectRatio: '16/9', maxHeight: '75vh' }}>
            {canPlayActiveLesson ? (
              activeLesson?.videoUrl ? (
                <iframe
                  key={activeLesson.id}
                  src={activeLesson.videoUrl}
                  title={activeLesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white space-y-3 bg-black">
                  <PlayCircle className="w-16 h-16 text-electric-500" />
                  <p className="font-bold text-sm">{activeLesson?.title}</p>
                  <p className="text-xs text-slate-400">Video lesson will be available shortly.</p>
                </div>
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white space-y-4 bg-black p-6">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-slate-400" />
                </div>
                <div className="text-center space-y-2 max-w-sm">
                  <h3 className="font-bold text-lg">Enrollment Required</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This lesson is locked. Enroll to unlock full Tamil video training and resources.
                  </p>
                </div>
                <Link
                  to={`/checkout?course=${course.id}`}
                  className="inline-block bg-electric-600 hover:bg-electric-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition-colors"
                >
                  Enroll Now — ₹{course.price}
                </Link>
              </div>
            )}
          </div>

          {/* Below-Video: Lesson Title + Navigation */}
          <div className="border-b border-[#D1D7DC] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-bold text-[15px] text-[#2D2F31] leading-tight truncate">
                {activeLesson?.title}
              </h1>
              <p className="text-xs text-[#6A6F73] mt-0.5 font-medium">
                {activeLesson?.moduleTitle}
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={goToPrev}
                disabled={activeLessonIdx === 0}
                className="flex items-center space-x-1 px-3.5 py-2 rounded border border-[#D1D7DC] hover:border-[#2D2F31] text-xs font-bold text-[#2D2F31] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {isEnrolled && (
                <button
                  onClick={() => toggleLessonCompletion(course.id, activeLesson.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded text-xs font-bold transition-colors cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-600 text-white border border-emerald-600'
                      : 'border border-[#D1D7DC] hover:border-[#2D2F31] text-[#2D2F31]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{isCompleted ? 'Completed' : 'Mark complete'}</span>
                </button>
              )}

              <button
                onClick={goToNext}
                disabled={activeLessonIdx === allLessons.length - 1}
                className="flex items-center space-x-1 px-3.5 py-2 rounded bg-[#2D2F31] hover:bg-black text-white text-xs font-bold disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation (Udemy: Overview, Q&A, Notes, etc.) */}
          <div className="border-b border-[#D1D7DC] px-5">
            <div className="flex space-x-0 text-sm font-semibold text-[#6A6F73]">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'resources', label: 'Resources' },
                { key: 'assignment', label: 'Assignments' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-3.5 px-4 border-b-2 text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === tab.key
                      ? 'border-[#2D2F31] text-[#2D2F31]'
                      : 'border-transparent hover:text-[#2D2F31]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-5 py-6 text-sm text-[#2D2F31] max-w-3xl">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <h2 className="font-bold text-base text-[#2D2F31]">
                  {course.title}
                </h2>
                <p className="text-[13px] text-[#6A6F73] leading-relaxed">
                  {course.overview || course.description || 
                    'This practical Tamil-language course guides you step-by-step through proven techniques used by real professionals. Each lesson is designed for maximum clarity, with hands-on projects and assignments.'}
                </p>

                {course.learningBenefits && course.learningBenefits.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <h3 className="font-bold text-sm text-[#2D2F31]">What you'll learn</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {course.learningBenefits.slice(0, 8).map((benefit, i) => (
                        <li key={i} className="flex items-start space-x-2 text-[12px] text-[#6A6F73]">
                          <Check className="w-3.5 h-3.5 text-[#2D2F31] shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lesson key takeaways */}
                <div className="border border-[#D1D7DC] rounded-lg p-4 space-y-2">
                  <h3 className="font-bold text-sm text-[#2D2F31]">Key Takeaways — {activeLesson?.title}</h3>
                  <ul className="space-y-1.5 text-[12px] text-[#6A6F73]">
                    <li className="flex items-start space-x-2">
                      <span className="text-[#2D2F31] font-bold shrink-0">•</span>
                      <span>Watch carefully and apply the concepts in a real-world Tamil Nadu business scenario.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#2D2F31] font-bold shrink-0">•</span>
                      <span>Take notes on key terminology — both in Tamil and standard industry English.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#2D2F31] font-bold shrink-0">•</span>
                      <span>Revisit this lesson before attending live doubt sessions for maximum benefit.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-3">
                <h2 className="font-bold text-sm text-[#2D2F31]">PDF Resources &amp; Cheat Sheets</h2>
                <div className="border border-[#D1D7DC] rounded-lg divide-y divide-[#D1D7DC]">
                  {[
                    '01. SEO & Keywords Cheat Sheet',
                    '02. Meta Ads Campaign Blueprint',
                    '03. Tamil Marketing Strategy Template'
                  ].map((res, i) => (
                    <div key={i} className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-[#6A6F73]" />
                        <span className="text-[13px] font-medium text-[#2D2F31]">{res} (PDF)</span>
                      </div>
                      <button className="text-electric-600 hover:text-electric-700 text-xs font-bold flex items-center space-x-1 cursor-pointer">
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'assignment' && (
              <div className="space-y-4">
                <h2 className="font-bold text-sm text-[#2D2F31]">Assignments &amp; Submissions</h2>
                <div className="border border-[#D1D7DC] rounded-lg p-5 space-y-4">
                  <h3 className="font-bold text-[13px] text-[#2D2F31]">Practical Assignment Task</h3>
                  <p className="text-[12px] text-[#6A6F73] leading-relaxed">
                    Apply the concepts from this lesson by conducting a practical exercise for a real or hypothetical Tamil Nadu business. Submit your Google Sheets share link or Google Docs link below.
                  </p>
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full p-3 border border-[#D1D7DC] rounded-lg text-xs text-[#2D2F31] placeholder:text-[#6A6F73] focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-transparent"
                  />
                  <button className="bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer">
                    Submit Assignment
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── Right: Course Content Sidebar (Udemy-style) ── */}
        <aside
          className={`
            ${sidebarOpen ? 'flex' : 'hidden'} 
            md:flex flex-col
            bg-white border-l border-[#D1D7DC]
            overflow-y-auto
          `}
          style={{
            width: '380px',
            minWidth: '320px',
            maxWidth: '420px',
            flexShrink: 0,
            position: 'sticky',
            top: '56px',
            maxHeight: 'calc(100vh - 56px)',
          }}
        >
          {/* Sidebar Header */}
          <div className="px-4 py-4 border-b border-[#D1D7DC] flex items-center justify-between shrink-0">
            <div>
              <h2 className="font-bold text-sm text-[#2D2F31]">Course content</h2>
              <p className="text-[11px] text-[#6A6F73] mt-0.5 font-medium">
                {completedCount}/{allLessons.length} completed
              </p>
            </div>
            {/* Progress bar */}
            <div className="flex items-center space-x-2">
              <div className="w-20 h-1.5 bg-[#D1D7DC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-electric-600 rounded-full transition-all"
                  style={{ width: `${allLessons.length > 0 ? (completedCount / allLessons.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-[#6A6F73]">
                {allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Module List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#D1D7DC]">
            {course.modules?.map((mod, modIdx) => {
              const modLessons = mod.lessons || [];
              const modCompleted = modLessons.filter(l =>
                userProg.completedLessonIds?.includes(l.id)
              ).length;
              const isModExpanded = expandedModules[mod.id] !== false;

              return (
                <div key={mod.id || modIdx}>
                  {/* Module Header (collapsible) */}
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full text-left px-4 py-3.5 flex items-start justify-between hover:bg-[#F7F9FA] transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-[13px] text-[#2D2F31] leading-snug">
                        {mod.title}
                      </p>
                      <p className="text-[11px] text-[#6A6F73] mt-0.5">
                        {modCompleted}/{modLessons.length} | {mod.totalDuration || modLessons.reduce((acc, l) => acc + parseInt(l.duration || 0), 0) + ' min'}
                      </p>
                    </div>
                    <div className="shrink-0 mt-0.5">
                      {isModExpanded
                        ? <ChevronUp className="w-4 h-4 text-[#6A6F73]" />
                        : <ChevronDown className="w-4 h-4 text-[#6A6F73]" />
                      }
                    </div>
                  </button>

                  {/* Lesson List */}
                  {isModExpanded && (
                    <div className="divide-y divide-[#F0F0F0]">
                      {modLessons.map((les, lesIdx) => {
                        const isLesCompleted = userProg.completedLessonIds?.includes(les.id);
                        const isSelected = les.id === activeLessonId;
                        const canAccess = isEnrolled || les.isPreview;

                        return (
                          <button
                            key={les.id}
                            onClick={() => {
                              setActiveLessonId(les.id);
                              if (window.innerWidth < 768) setSidebarOpen(false);
                            }}
                            disabled={!canAccess}
                            className={`w-full text-left px-4 py-3 flex items-start space-x-3 transition-colors ${
                              isSelected
                                ? 'bg-[#EEF0F3]'
                                : canAccess
                                ? 'hover:bg-[#F7F9FA] cursor-pointer'
                                : 'cursor-not-allowed opacity-60'
                            }`}
                          >
                            {/* Completion indicator */}
                            <div className="shrink-0 mt-0.5">
                              {isLesCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-electric-600" />
                              ) : canAccess ? (
                                <PlayCircle className={`w-4 h-4 ${isSelected ? 'text-electric-600' : 'text-[#6A6F73]'}`} />
                              ) : (
                                <Lock className="w-4 h-4 text-[#6A6F73]" />
                              )}
                            </div>

                            {/* Lesson text */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-[13px] leading-snug line-clamp-2 ${
                                isSelected ? 'font-bold text-[#2D2F31]' : 'font-medium text-[#2D2F31]'
                              }`}>
                                {les.title}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-[11px] text-[#6A6F73]">{les.duration || '—'}</span>
                                {les.isPreview && !isEnrolled && (
                                  <span className="text-[10px] font-bold text-electric-600 bg-electric-50 px-1.5 py-0.5 rounded">
                                    Preview
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>



        </aside>

      </div>
    </div>
  );
}
