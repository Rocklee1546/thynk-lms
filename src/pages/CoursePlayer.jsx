import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLMS } from '../context/LMSContext';
import { 
  PlayCircle, 
  CheckCircle2, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  BookOpen, 
  Award, 
  Download,
  HelpCircle,
  Menu,
  X,
  AlertTriangle,
  Calendar,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

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

  const course = courses.find(c => c.id === id) || courses[0];

  // All lessons flattened
  const allLessons = [];
  course?.modules?.forEach(mod => {
    mod.lessons?.forEach(les => {
      allLessons.push({ ...les, moduleTitle: mod.title, moduleId: mod.id });
    });
  });

  const [activeLessonId, setActiveLessonId] = useState(allLessons[0]?.id || 'les-1-1');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');

  const access = checkCourseAccess(course?.id);
  const isEnrolled = access.hasAccess;

  const activeLesson = allLessons.find(l => l.id === activeLessonId) || allLessons[0];
  const activeLessonIdx = allLessons.findIndex(l => l.id === activeLessonId);

  const userProg = currentUser?.progress?.[course?.id] || { completedLessonIds: [] };
  const isCompleted = userProg.completedLessonIds?.includes(activeLesson?.id);

  // Next / Prev handler
  const goToNext = () => {
    if (activeLessonIdx < allLessons.length - 1) {
      setActiveLessonId(allLessons[activeLessonIdx + 1].id);
    }
  };

  const goToPrev = () => {
    if (activeLessonIdx > 0) {
      setActiveLessonId(allLessons[activeLessonIdx - 1].id);
    }
  };

  // If user is not logged in at all
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-electric-600/20 border border-electric-500/30 flex items-center justify-center text-electric-400">
          <Lock className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-black">Sign In to Access Player</h2>
          <p className="text-xs text-slate-400">Please authenticate with your mobile OTP or email to view course contents.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openAuthModal(`/player/${course.id}`, 'signin')}
            className="bg-electric-600 hover:bg-electric-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg"
          >
            Sign In with OTP / Password
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

  // If course access expired (6-Month calendar limit reached)
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
            Your course access has expired. Please purchase the course again to continue learning.
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
            className="w-full bg-electric-600 hover:bg-electric-700 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all block"
          >
            <span>RENEW 6-MONTH ACCESS</span>
            <ArrowRight className="w-4 h-4 inline" />
          </Link>
        </div>
      </div>
    );
  }

  const canPlayActiveLesson = isEnrolled || activeLesson?.isPreview;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      
      {/* Top Player Header */}
      <header className="bg-brand-navy border-b border-slate-800 px-4 py-3 flex items-center justify-between z-30">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard" className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-extrabold text-sm text-white line-clamp-1">{course.title}</h1>
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="text-sky-400">Tamil (தமிழ்)</span>
              {access.daysRemaining !== null && (
                <span className="text-emerald-400 font-semibold">• {access.daysRemaining} days left in 6-month access</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            to="/dashboard"
            className="hidden sm:inline-block text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main LMS Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Drawer / Module Sidebar */}
        <aside className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-80 lg:w-96 bg-brand-navy border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto z-20`}>
          
          <div className="p-4 border-b border-slate-800 font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Course Content ({allLessons.length} Lessons)</span>
            <span className="text-emerald-400">
              {userProg.completedLessonIds?.length || 0} / {allLessons.length} Done
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {course.modules?.map((mod, modIdx) => (
              <div key={mod.id || modIdx} className="p-3">
                <h4 className="font-extrabold text-xs text-sky-300 uppercase tracking-wide mb-2">
                  {mod.title}
                </h4>

                <div className="space-y-1">
                  {mod.lessons?.map(les => {
                    const isLesCompleted = userProg.completedLessonIds?.includes(les.id);
                    const isSelected = les.id === activeLessonId;
                    const canAccess = isEnrolled || les.isPreview;

                    return (
                      <button
                        key={les.id}
                        onClick={() => {
                          setActiveLessonId(les.id);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-electric-600 text-white font-bold'
                            : canAccess
                            ? 'hover:bg-slate-800/80 text-slate-300'
                            : 'text-slate-500 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 pr-2 line-clamp-1">
                          {isLesCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : canAccess ? (
                            <PlayCircle className="w-4 h-4 text-sky-400 shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span className="line-clamp-1">{les.title}</span>
                        </div>
                        <span className="text-[10px] font-mono opacity-80 shrink-0">{les.duration}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </aside>

        {/* Center Canvas / Video Screen & Controls */}
        <main className="flex-1 bg-slate-950 overflow-y-auto flex flex-col justify-between">
          
          <div className="space-y-4">
            
            {/* Video Player or Locked Screen */}
            <div className="relative aspect-video bg-black max-h-[600px] flex items-center justify-center">
              {canPlayActiveLesson ? (
                activeLesson?.videoUrl ? (
                  <iframe
                    src={activeLesson.videoUrl}
                    title={activeLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <PlayCircle className="w-16 h-16 text-electric-500 mx-auto animate-bounce" />
                    <h3 className="font-bold text-lg text-white">Lesson Tamil Video Stream</h3>
                    <p className="text-xs text-slate-400">{activeLesson?.title}</p>
                  </div>
                )
              ) : (
                <div className="text-center p-8 max-w-md space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-white">Enrollment Required</h3>
                    <p className="text-xs text-slate-400">This lesson is locked. Enroll in the 6-Month course package to unlock full Tamil video training and resources.</p>
                  </div>
                  <Link
                    to={`/checkout?course=${course.id}`}
                    className="inline-block bg-electric-600 hover:bg-electric-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg"
                  >
                    Enroll Now (₹{course.price})
                  </Link>
                </div>
              )}
            </div>

            {/* Controls Row */}
            <div className="px-4 sm:px-6 py-3 bg-brand-navy border-y border-slate-800 flex flex-wrap items-center justify-between gap-4">
              
              <div>
                <h3 className="font-extrabold text-base text-white">{activeLesson?.title}</h3>
                <p className="text-xs text-slate-400 font-medium">{activeLesson?.moduleTitle}</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={goToPrev}
                  disabled={activeLessonIdx === 0}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 disabled:opacity-40"
                >
                  Previous
                </button>

                {isEnrolled && (
                  <button
                    onClick={() => toggleLessonCompletion(course.id, activeLesson.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCompleted ? 'Completed ✓' : 'Mark Complete'}</span>
                  </button>
                )}

                <button
                  onClick={goToNext}
                  disabled={activeLessonIdx === allLessons.length - 1}
                  className="px-3.5 py-2 rounded-xl bg-electric-600 hover:bg-electric-700 text-xs font-bold text-white disabled:opacity-40"
                >
                  Next Lesson
                </button>
              </div>

            </div>

            {/* Tabs for Notes / Resources / Assignments */}
            <div className="px-4 sm:px-6 py-4 space-y-4">
              <div className="flex border-b border-slate-800 space-x-6 text-xs font-bold text-slate-400">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-2 ${activeTab === 'notes' ? 'text-sky-400 border-b-2 border-sky-400' : ''}`}
                >
                  Tamil Lesson Overview
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`pb-2 ${activeTab === 'resources' ? 'text-sky-400 border-b-2 border-sky-400' : ''}`}
                >
                  PDF Resources & Cheat Sheets
                </button>
                <button
                  onClick={() => setActiveTab('assignment')}
                  className={`pb-2 ${activeTab === 'assignment' ? 'text-sky-400 border-b-2 border-sky-400' : ''}`}
                >
                  Assignments & Submissions
                </button>
              </div>

              {activeTab === 'notes' && (
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-3 leading-relaxed">
                  <h4 className="font-extrabold text-white text-sm">Key Takeaways in Tamil:</h4>
                  <ul className="list-disc pl-4 space-y-1.5">
                    <li>Watch carefully how search engines crawl and index pages.</li>
                    <li>Always optimize your H1, Meta Title, and Description in Tamil & English terms.</li>
                    <li>Use clean URL slugs and optimize image ALT tags for speed.</li>
                  </ul>
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-3">
                  <h4 className="font-extrabold text-white text-sm">Downloads:</h4>
                  <div className="flex items-center justify-between bg-slate-800 p-3 rounded-xl">
                    <span className="font-semibold text-white">01. SEO & Keywords Cheat Sheet (PDF)</span>
                    <button className="bg-electric-600 text-white font-bold text-[11px] px-3 py-1 rounded-lg flex items-center space-x-1">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'assignment' && (
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-3">
                  <h4 className="font-extrabold text-white text-sm">Practical Assignment Task:</h4>
                  <p>Conduct a keyword audit for a local business in Tamil Nadu and paste your Google Sheets share link below.</p>
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <button className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
                    Submit Assignment Work
                  </button>
                </div>
              )}

            </div>

          </div>

        </main>

      </div>
    </div>
  );
}
