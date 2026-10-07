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
  User
} from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, currentUser, trackCourseView, openAuthModal, checkCourseAccess } = useLMS();

  const course = courses.find(c => c.id === id) || courses[0];
  const [openModuleId, setOpenModuleId] = useState(course.modules?.[0]?.id || null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    if (course?.id) {
      trackCourseView(course.id);
    }
  }, [course?.id, trackCourseView]);

  const discountPercent = course.originalPrice 
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  const accessStatus = checkCourseAccess(course.id);
  const isEnrolled = accessStatus.hasAccess;

  const handleEnrollClick = (e) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal(`/checkout?course=${course.id}`, 'signin');
    } else {
      navigate(`/checkout?course=${course.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      
      {/* ABOVE THE FOLD HERO HEADER */}
      <section className="bg-brand-navy text-white border-b border-slate-800 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-electric-600 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-md">
                {course.category}
              </span>
              <span className="bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-3 py-0.5 rounded-md flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Taught in Tamil (தமிழ்)</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {course.description}
            </p>

            {/* Quick Metadata Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                <div className="text-amber-400 font-bold text-sm flex items-center justify-center space-x-1">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{course.rating || 4.9}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">({course.reviewCount || 120} reviews)</div>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                <div className="text-white font-bold text-sm flex items-center justify-center space-x-1">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>{course.duration}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Recorded Lessons</div>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                <div className="text-white font-bold text-sm flex items-center justify-center space-x-1">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Certificate</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Included</div>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                <div className="text-white font-bold text-sm flex items-center justify-center space-x-1">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <span>Internship</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Opportunity</div>
              </div>
            </div>

          </div>

          {/* Right Column: Video Preview Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl w-full max-w-md space-y-4">
              
              <div className="relative aspect-video rounded-2xl overflow-hidden group bg-black">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-brand-navy/60 hover:bg-brand-navy/40 transition-colors text-white font-bold text-xs space-y-2"
                >
                  <PlayCircle className="w-14 h-14 text-sky-400 animate-pulse" />
                  <span className="bg-slate-900/90 px-3 py-1 rounded-full text-[11px] border border-slate-700">
                    WATCH FREE TAMIL PREVIEW
                  </span>
                </button>
              </div>

              {/* Price & Enrollment Card */}
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black text-white">₹{course.price.toLocaleString()}</span>
                    {course.originalPrice && (
                      <span className="text-sm text-slate-400 line-through ml-2">₹{course.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  {discountPercent > 0 && (
                    <span className="bg-emerald-500/20 text-emerald-400 font-extrabold text-xs px-2.5 py-1 rounded-full border border-emerald-500/30">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {isEnrolled ? (
                  <Link
                    to={`/player/${course.id}`}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition-all text-center block"
                  >
                    CONTINUE LEARNING IN PLAYER
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleEnrollClick}
                    className="w-full bg-electric-600 hover:bg-electric-700 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-electric-600/30 transition-all text-center flex items-center justify-center space-x-2"
                  >
                    <span>ENROLL NOW (6 MONTH ACCESS)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* Policy reminder */}
                <p className="text-[11px] text-amber-300 font-semibold text-center flex items-center justify-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Strict No-Refund Policy Applies</span>
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* DETAILED CONTENT SECTIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-8 space-y-10">
          
          {/* What You'll Learn */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-electric-600" />
              <span>What You'll Learn in this Program</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
              {course.learningBenefits ? (
                course.learningBenefits.map((b, idx) => (
                  <div key={idx} className="flex items-start space-x-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start space-x-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Keyword Research & Competitor Analysis in Tamil</span>
                  </div>
                  <div className="flex items-start space-x-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Google Search & Display Ads Setup</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SYLLABUS BREAKDOWN ACCORDION */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Course Syllabus</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Structured modules covering SEO, Google Ads, Meta Ads & WordPress.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {course.modules?.length || 5} Modules
              </span>
            </div>

            <div className="space-y-4">
              {course.modules?.map((mod, modIdx) => (
                <div key={mod.id || modIdx} className="border border-slate-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenModuleId(openModuleId === mod.id ? null : mod.id)}
                    className="w-full text-left p-4 sm:p-5 bg-slate-50 hover:bg-slate-100/80 font-bold text-slate-800 text-sm flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-4 h-4 text-electric-600" />
                      <span>{mod.title}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-slate-500 font-normal hidden sm:inline">{mod.duration}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openModuleId === mod.id ? 'rotate-180 text-electric-600' : ''}`} />
                    </div>
                  </button>

                  {openModuleId === mod.id && (
                    <div className="p-4 sm:p-5 bg-white divide-y divide-slate-100">
                      {mod.lessons?.map((les, lesIdx) => (
                        <div key={les.id || lesIdx} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-3 pr-2">
                            {les.isPreview ? (
                              <button
                                onClick={() => setShowPreviewModal(true)}
                                className="text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 font-bold bg-emerald-50 px-2 py-0.5 rounded"
                              >
                                <PlayCircle className="w-3.5 h-3.5" />
                                <span>FREE PREVIEW</span>
                              </button>
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span className="font-medium text-slate-800">{les.title}</span>
                          </div>
                          <span className="text-slate-400 font-mono text-[11px] shrink-0">{les.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructor / Founder Info */}
          <div className="bg-gradient-to-r from-brand-navy to-slate-900 p-8 rounded-3xl border border-slate-800 text-white flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <img
              src="/founder.png"
              alt="THYNK Founder"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-electric-500 shrink-0"
            />
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center space-x-1 text-xs text-sky-400 font-bold">
                <User className="w-3.5 h-3.5" />
                <span>LEAD MENTOR & FOUNDER</span>
              </div>
              <h4 className="font-extrabold text-white text-lg">THYNK DIGITAL SOLUTIONS</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Practical Tamil digital marketing training focused on enabling South Indian students to build client portfolios and real skills.
              </p>
            </div>
          </div>

        </div>

        {/* Right Sidebar: Perks & Policy */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
              This Program Includes:
            </h4>
            <ul className="space-y-3 font-semibold text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>100% Tamil Language Lessons</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Recorded Video Lifetime Access</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Live Doubt Solving Sessions</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Official Shareable Certificate</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Internship Eligibility</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 text-amber-900 space-y-3 text-xs">
            <div className="flex items-center space-x-2 text-amber-800 font-extrabold">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>NO REFUND POLICY</span>
            </div>
            <p className="leading-relaxed">
              THYNK LMS strictly maintains a <strong>No Refund Policy</strong> for all digital courses and combo packs. Please watch our free preview lessons before purchasing.
            </p>
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
    </div>
  );
}
