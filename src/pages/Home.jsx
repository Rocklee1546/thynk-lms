import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLMS } from '../context/LMSContext';
import FounderPoster from '../components/FounderPoster';
import CourseCard from '../components/CourseCard';
import ValuePackCard from '../components/ValuePackCard';
import VideoPreviewModal from '../components/VideoPreviewModal';
import AnimatedCounter from '../components/AnimatedCounter';
import LaptopMockupShowcase from '../components/LaptopMockupShowcase';
import ToolsMarqueeBanner from '../components/ToolsMarqueeBanner';
import { 
  CheckCircle, 
  Sparkles, 
  ArrowRight, 
  Star, 
  Play, 
  ShieldAlert, 
  Globe, 
  HelpCircle,
  Briefcase,
  Award,
  Video,
  Layers,
  BookOpen,
  Users,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function Home() {
  const { courses, valuePacks, testimonials, faqs, currentUser, openAuthModal } = useLMS();
  const [selectedPreviewCourse, setSelectedPreviewCourse] = useState(null);
  const [openFaqId, setOpenFaqId] = useState(null);

  const valuePackScrollRef = useRef(null);
  const [activePackIndex, setActivePackIndex] = useState(0);

  const scrollValuePacks = (direction) => {
    if (valuePackScrollRef.current) {
      const scrollAmount = valuePackScrollRef.current.clientWidth * 0.8;
      valuePackScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handlePackScroll = () => {
    if (valuePackScrollRef.current) {
      const { scrollLeft, clientWidth } = valuePackScrollRef.current;
      const index = Math.round(scrollLeft / (clientWidth * 0.75));
      setActivePackIndex(index);
    }
  };

  const featuredCourses = courses.filter(c => c.isPublished);

  return (
    <div className="min-h-screen bg-white">

      {/* HERO SECTION — 100% seamlessly integrated hero image */}
      <section className="relative bg-white text-slate-900 overflow-hidden pb-16 md:pb-24 border-b border-slate-200">

        {/* Clean Hero Banner Image — 100% edge-free merging into pure white landing page background */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
          <div className="relative bg-white">
            <img
              src="/hero-students-clean.jpg"
              alt="THYNK Digital Academy Students"
              className="w-full h-auto max-h-[600px] object-contain object-center block mx-auto transition-all"
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10 md:pt-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Language & Category Pill */}
              <div className="inline-flex items-center space-x-2 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-slate-700">
                <Globe className="w-4 h-4 text-electric-600" />
                <span>தமிழ் (Tamil) Digital Marketing Academy</span>
              </div>

              {/* Main Emphasized Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-[#0F172A]">
                DON'T JUST <br className="hidden sm:inline" />
                <span className="text-[#0F172A]">LEARN DIGITAL MARKETING.</span> <br />
                <span className="text-[#2563EB]">BUILD THE SKILLS</span> <br className="hidden sm:inline" />
                THAT MOVE YOUR CAREER.
              </h1>

              {/* Supporting Copy */}
              <p className="text-[#475569] text-base sm:text-lg lg:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Learn <strong className="font-semibold text-slate-900">SEO, Google Ads, Meta Ads, and WordPress</strong> in clear Tamil through practical, project-driven training designed specifically for South Indian students.
              </p>

              {/* Primary Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/courses"
                  className="w-full sm:w-auto bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-base px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 group"
                >
                  <span>EXPLORE COURSES</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/value-packs"
                  className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#0F172A] font-bold text-base px-7 py-4 rounded-2xl border-2 border-blue-600/30 hover:border-[#2563EB] shadow-sm transition-all flex items-center justify-center space-x-2"
                >
                  <Layers className="w-5 h-5 text-amber-500" />
                  <span>VIEW VALUE PACKS</span>
                </Link>
              </div>

              {/* Quick Trust Signals */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-slate-600 font-medium border-t border-slate-200">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Recorded Tamil Lessons</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Live Doubt Sessions</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Shareable Certificate</span>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Visual Feature Box */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg lg:max-w-none">
                <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                  
                  {/* Top Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">THYNK LMS // CAREER STACK</span>
                  </div>

                  {/* Highlight Course Box */}
                  <div className="bg-slate-800/80 rounded-2xl p-5 sm:p-6 border border-electric-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="bg-[#2563EB] text-white text-xs font-bold uppercase px-3 py-1 rounded-md tracking-wide">
                        FLAGSHIP PROGRAM
                      </span>
                      <span className="text-amber-400 text-sm font-bold flex items-center space-x-1.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>4.9 / 5.0</span>
                      </span>
                    </div>

                    <h3 className="font-extrabold text-white text-xl sm:text-2xl leading-tight">
                      Digital Marketing Complete Career Program
                    </h3>
                    
                    <p className="text-sm sm:text-base text-slate-300 font-medium">
                      SEO + Google Ads + Meta Ads + WordPress
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-slate-200 pt-2">
                      <div className="bg-slate-900/80 border border-slate-700/60 p-3 rounded-xl flex items-center space-x-1.5">
                        <span className="text-emerald-400 font-bold">✓</span> <span>45+ Hours Video</span>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-700/60 p-3 rounded-xl flex items-center space-x-1.5">
                        <span className="text-emerald-400 font-bold">✓</span> <span>Live QA Access</span>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-700/60 p-3 rounded-xl flex items-center space-x-1.5">
                        <span className="text-emerald-400 font-bold">✓</span> <span>Verified Certificate</span>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-700/60 p-3 rounded-xl flex items-center space-x-1.5">
                        <span className="text-emerald-400 font-bold">✓</span> <span>Internship Eligibility</span>
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-between border-t border-slate-700/60">
                      <div>
                        <span className="text-slate-400 text-sm line-through block">₹9,999</span>
                        <span className="text-white font-black text-3xl sm:text-4xl">₹2,999</span>
                      </div>
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            openAuthModal('/checkout?course=dm-career-pack', 'signup');
                          } else {
                            window.location.href = '/checkout?course=dm-career-pack';
                          }
                        }}
                        className="bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold text-base px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-colors cursor-pointer"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>

                  {/* Free Preview Trigger Banner */}
                  <button
                    onClick={() => setSelectedPreviewCourse(courses[0])}
                    className="w-full bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 p-4 rounded-2xl text-sm font-bold text-[#38BDF8] flex items-center justify-between transition-colors group shadow-sm"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Play className="w-4 h-4 fill-[#38BDF8] text-[#38BDF8]" />
                      <span>Watch Free Sample Lesson in Tamil</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. TRUST & METRICS BAR WITH ANIMATED COUNTING EFFECTS */}
      <section className="bg-white border-t border-b border-[#E2E8F0] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 text-center items-center">
            
            {/* Metric 1 */}
            <div className="md:border-r border-[#E2E8F0] md:px-4">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight">
                <AnimatedCounter end={1400} suffix="+" />
              </div>
              <div className="text-xs sm:text-sm text-[#64748B] font-bold uppercase tracking-wider mt-2">
                Students Trained
              </div>
            </div>

            {/* Metric 2 */}
            <div className="md:border-r border-[#E2E8F0] md:px-4">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2563EB] tracking-tight">
                <AnimatedCounter end={100} suffix="%" />
              </div>
              <div className="text-xs sm:text-sm text-[#64748B] font-bold uppercase tracking-wider mt-2">
                Tamil Explanation
              </div>
            </div>

            {/* Metric 3 */}
            <div className="md:border-r border-[#E2E8F0] md:px-4">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#38BDF8] tracking-tight flex items-center justify-center space-x-1">
                <AnimatedCounter end={4.9} decimals={1} suffix="" />
                <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-[#38BDF8] text-[#38BDF8] inline ml-1" />
              </div>
              <div className="text-xs sm:text-sm text-[#64748B] font-bold uppercase tracking-wider mt-2">
                Student Rating
              </div>
            </div>

            {/* Metric 4 */}
            <div className="md:px-4">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2563EB] tracking-tight">
                <AnimatedCounter end={2999} prefix="₹" />
              </div>
              <div className="text-xs sm:text-sm text-[#64748B] font-bold uppercase tracking-wider mt-2">
                Complete Career Stack
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4 & 5. PROBLEM VS SOLUTION SECTION */}
      <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-electric-600 uppercase tracking-widest bg-electric-50 px-3 py-1 rounded-full">
              WHY TRADITIONAL COURSES FAIL
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Stop Paying ₹30,000 for Theoretical Digital Marketing Coaching
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Most online programs waste your time with outdated slides, expensive fees, and complicated English jargon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Problem Card */}
            <div className="bg-white p-8 rounded-3xl border border-red-200 shadow-sm space-y-4">
              <div className="inline-flex items-center space-x-2 text-red-600 font-bold text-sm bg-red-50 px-3 py-1 rounded-lg">
                <ShieldAlert className="w-4 h-4" />
                <span>The Traditional Problem</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Exorbitant fees (₹20,000 – ₹50,000) out of reach for students</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Complex English lectures hard to absorb for Tamil background</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Only theory slides — zero live ad accounts or real website practice</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Fake job guarantee promises that leave students empty-handed</span>
                </li>
              </ul>
            </div>

            {/* Solution Card - THYNK */}
            <div className="bg-brand-navy text-white p-8 rounded-3xl border border-electric-500/40 shadow-xl space-y-4 relative overflow-hidden">
              <div className="inline-flex items-center space-x-2 text-sky-300 font-bold text-sm bg-electric-600/30 border border-electric-500/40 px-3 py-1 rounded-lg">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>The THYNK LMS Solution</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Affordable Pricing:</strong> Complete career program for just ₹2,999</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>100% Tamil Explanation:</strong> Concepts explained in clear, friendly Tamil</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Practical Projects:</strong> Hands-on Google & Meta Ads setup + WordPress design</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Real Internship Eligibility:</strong> Merit-based internship opportunities for top achievers</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* 6. FEATURED COURSES CATALOG */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-electric-600 uppercase tracking-widest bg-electric-50 px-3 py-1 rounded-full">
                EXPLORE CATALOG
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
                Digital Marketing Programs (Tamil)
              </h2>
            </div>
            <Link
              to="/courses"
              className="text-xs font-bold text-electric-600 hover:text-electric-700 flex items-center space-x-1"
            >
              <span>SEE ALL COURSES & SYLLABUS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.slice(0, 4).map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onPreviewClick={(c) => setSelectedPreviewCourse(c)}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 7. VALUE PACKS SECTION */}
      <section 
        style={{ background: 'linear-gradient(180deg, #020817 0%, #071A3A 35%, #123B70 65%, #6FA8D8 100%)' }} 
        className="py-16 md:py-24 text-white border-b border-slate-800 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 rounded-full inline-block">
                BUILD YOUR SKILL STACK
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Combo Value Packs — Maximize Savings
              </h2>
              <p className="text-slate-300 text-sm sm:text-base">
                Bundle SEO, Google Ads, Meta Ads and WordPress together for maximum career impact.
              </p>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center space-x-3 shrink-0 self-end md:self-auto">
              <button
                onClick={() => scrollValuePacks('left')}
                className="w-11 h-11 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5 text-sky-400" />
              </button>
              <button
                onClick={() => scrollValuePacks('right')}
                className="w-11 h-11 rounded-full bg-electric-600 hover:bg-blue-600 border border-electric-400 text-white flex items-center justify-center transition-all shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95"
                aria-label="Scroll Right"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Horizontal Carousel Track */}
          <div 
            ref={valuePackScrollRef}
            onScroll={handlePackScroll}
            className="flex flex-nowrap items-stretch overflow-x-auto gap-6 scroll-smooth pb-6 pt-2 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {valuePacks.map(pack => (
              <div 
                key={pack.id} 
                className="w-[85vw] max-w-[340px] sm:w-[365px] md:w-[385px] lg:w-[400px] shrink-0 flex-none h-[560px] flex flex-col"
              >
                <ValuePackCard pack={pack} />
              </div>
            ))}
          </div>

          {/* Carousel Slide Indicators */}
          <div className="flex items-center justify-center space-x-2 pt-2">
            {valuePacks.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (valuePackScrollRef.current) {
                    const scrollAmount = valuePackScrollRef.current.clientWidth * 0.75 * idx;
                    valuePackScrollRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                  }
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activePackIndex === idx 
                    ? 'w-8 bg-sky-400' 
                    : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 8 & 9. WHY THYNK & LEARNING MODEL */}
      <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-sm sm:text-base font-extrabold text-electric-600 uppercase tracking-widest bg-electric-50 border border-electric-200/60 px-4 py-1.5 rounded-full inline-block">
              WHY CHOOSE THYNK LMS?
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-slate-900 tracking-tight leading-tight">
              The 5 Core Student Benefits
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-start">
              <div className="w-12 h-12 rounded-xl bg-electric-50 text-electric-600 flex items-center justify-center font-bold shrink-0">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl lg:text-[21px] leading-snug">Recorded Sessions</h3>
              <p className="text-base sm:text-[17px] text-slate-600 leading-[1.6]">
                Watch high quality Tamil lessons anytime, anywhere with lifetime access.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-start">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl lg:text-[21px] leading-snug">Live Doubt Solving</h3>
              <p className="text-base sm:text-[17px] text-slate-600 leading-[1.6]">
                Attend scheduled live QA sessions with mentors so you never get stuck alone.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-start">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl lg:text-[21px] leading-snug">Practical Projects</h3>
              <p className="text-base sm:text-[17px] text-slate-600 leading-[1.6]">
                Build real SEO reports, Meta campaign setups & WordPress sites to show clients.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-start">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl lg:text-[21px] leading-snug">Internship Opportunity</h3>
              <p className="text-base sm:text-[17px] text-slate-600 leading-[1.6]">
                Eligible students who complete 80%+ of course can apply for practical experience.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-start">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl lg:text-[21px] leading-snug">Shareable Certificate</h3>
              <p className="text-base sm:text-[17px] text-slate-600 leading-[1.6]">
                Earn a verifiable certificate with unique Certificate ID to showcase on LinkedIn.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 10. FOUNDER / BRAND POSTER SECTION WITH AUTO + MANUAL SCROLL */}
      <FounderPoster />

      {/* 11. ENHANCED CERTIFICATION SECTION — WITH LARGE PREMIUM VISUAL CERTIFICATE TEMPLATE PREVIEW */}
      <section 
        className="py-16 md:py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #3572CA 0%, #4D86D8 18%, #72A4E6 42%, #A2C7F5 68%, #D4E6FC 88%, #F8FAFC 100%)' }}
      >
        
        {/* Ambient Glow Effects */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-electric-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-400/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="bg-white/20 text-white border border-white/30 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-widest inline-flex items-center space-x-1.5 shadow-sm">
              <Award className="w-4 h-4 text-amber-300" />
              <span>OFFICIAL STUDENT CREDENTIAL</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Earn a Verifiable Industry Certificate
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed font-medium">
              Complete your practical course modules to receive an official, shareable THYNK Digital Solutions Certificate of Completion with a unique Certificate ID.
            </p>
          </div>

          {/* Large Premium Certificate Mockup Display */}
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              
              {/* Outer Glow Halo */}
              <div className="absolute -inset-1 bg-gradient-to-r from-electric-600 via-sky-400 to-electric-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-500" />

              {/* Certificate Template Canvas Card */}
              <div className="relative bg-white text-slate-900 rounded-3xl p-6 sm:p-10 lg:p-12 border-4 border-slate-900 shadow-2xl transition-all duration-300 group-hover:-translate-y-1 overflow-hidden">
                
                {/* Top Corner Preview Tag */}
                <div className="absolute top-4 right-4 bg-electric-600 text-white font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                  CERTIFICATE PREVIEW
                </div>

                {/* Certificate Inner Border Frame */}
                <div className="border-2 border-electric-600/30 rounded-2xl p-6 sm:p-8 space-y-6 relative bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50">
                  
                  {/* Decorative Background Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none font-black text-9xl text-slate-900 tracking-tighter">
                    THYNK
                  </div>

                  {/* Header Branding */}
                  <div className="text-center space-y-2 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-electric-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md shadow-electric-600/30">
                      T
                    </div>
                    <h3 className="font-black text-2xl sm:text-3xl tracking-tight text-slate-900">
                      THYNK DIGITAL SOLUTIONS
                    </h3>
                    <p className="text-[11px] font-extrabold text-electric-600 uppercase tracking-widest">
                      ACADEMY CERTIFICATE OF COMPLETION
                    </p>
                  </div>

                  {/* Recipient & Program Description */}
                  <div className="text-center space-y-3 py-4 border-y border-slate-200/80 relative z-10 max-w-2xl mx-auto">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                      This certificate is proudly presented to
                    </p>

                    <h4 className="text-3xl sm:text-4xl font-extrabold text-electric-600 underline decoration-sky-400 decoration-2 underline-offset-8">
                      ALEX JOHN
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-600 pt-2 leading-relaxed font-medium">
                      for successfully completing the practical learning program in
                    </p>

                    <h5 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                      DIGITAL MARKETING
                    </h5>

                    <p className="text-xs text-slate-500 italic font-medium">
                      A practical learning program covering: SEO • Google Ads • Meta Ads • WordPress
                    </p>
                  </div>

                  {/* Footer Metadata & Signature Block */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2 relative z-10 text-xs">
                    
                    <div className="text-center sm:text-left space-y-1">
                      <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-slate-700 font-mono text-[11px] font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Certificate ID: THYNK-DM-2026-00128</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">Date of Completion: 28 September 2026</p>
                      <div className="inline-flex items-center space-x-1 text-[10px] text-electric-600 font-bold bg-electric-50 px-2.5 py-0.5 rounded-md border border-electric-200">
                        <span>Verifiable online at thynklms.com/verify-certificate</span>
                      </div>
                    </div>

                    <div className="text-center sm:text-right space-y-1">
                      <div className="w-36 h-0.5 bg-slate-900 mx-auto sm:ml-auto" />
                      <p className="font-extrabold text-slate-900 text-xs">Founder / Authorized Signatory</p>
                      <p className="text-[10px] text-slate-500 font-semibold">THYNK DIGITAL SOLUTIONS</p>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          </div>

          {/* Action CTA Link */}
          <div className="text-center pt-2">
            <Link
              to="/verify-certificate?id=THYNK-DM-2026-8841"
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors bg-white/95 hover:bg-white px-5 py-2.5 rounded-xl border border-blue-200/80 shadow-md"
            >
              <ExternalLink className="w-4 h-4 text-emerald-600" />
              <span>Test Online Certificate Verification Search Tool</span>
            </Link>
          </div>

        </div>
      </section>

      {/* TOOLS SHOWCASE MARQUEE BANNER — REAL TOOLS. PRACTICAL SKILLS. */}
      <ToolsMarqueeBanner />

      {/* 12. INTERNSHIP OPPORTUNITY SECTION */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-sm sm:text-base font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-200/60 px-4 py-1.5 rounded-full inline-block">
              CAREER EXPOSURE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Internship Opportunity for Eligible Students
            </h2>
            <p className="text-slate-600 text-base sm:text-lg lg:text-[19px] leading-[1.6] max-w-[700px]">
              We believe in real experience. Eligible students who complete their course modules and submit required practical projects receive an opportunity to gain hands-on digital marketing agency exposure.
            </p>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg uppercase tracking-wider">
                Eligibility Criteria:
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 text-slate-700 text-base sm:text-[17px] leading-[1.6]">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                  <span>Complete at least 80% of course video modules</span>
                </div>
                <div className="flex items-start space-x-3 text-slate-700 text-base sm:text-[17px] leading-[1.6]">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                  <span>Submit 2 practical client projects (SEO audit & Meta ad draft)</span>
                </div>
                <div className="flex items-start space-x-3 text-slate-700 text-base sm:text-[17px] leading-[1.6]">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                  <span>Pass the practical review assessment</span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm lg:text-[15px] text-slate-500 italic leading-[1.5]">
              *Note: Internship opportunities are merit-based for eligible students to gain practical experience and are subject to availability. We do not make false job guarantees.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-brand-navy p-7 sm:p-9 rounded-3xl text-white border border-slate-800 shadow-xl space-y-6">
              <h3 className="text-xl sm:text-2xl lg:text-[25px] font-extrabold text-sky-400">
                Internship Application Process
              </h3>
              <div className="space-y-5">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-electric-600 font-extrabold text-base sm:text-lg text-white flex items-center justify-center shrink-0 border border-electric-400/30">1</div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-base sm:text-lg lg:text-[19px]">Enroll & Watch Modules</h4>
                    <p className="text-slate-300 text-sm sm:text-base lg:text-[16px] leading-[1.5]">Complete recorded Tamil video sessions in your LMS dashboard.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-electric-600 font-extrabold text-base sm:text-lg text-white flex items-center justify-center shrink-0 border border-electric-400/30">2</div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-base sm:text-lg lg:text-[19px]">Submit Practical Work</h4>
                    <p className="text-slate-300 text-sm sm:text-base lg:text-[16px] leading-[1.5]">Submit assignments & project links directly from the student dashboard.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 font-extrabold text-base sm:text-lg text-white flex items-center justify-center shrink-0 border border-emerald-400/30">3</div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-base sm:text-lg lg:text-[19px]">Unlock Internship Portal</h4>
                    <p className="text-slate-300 text-sm sm:text-base lg:text-[16px] leading-[1.5]">Once eligible, submit your application for review.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 13. STUDENT TESTIMONIALS */}
      <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-electric-600 uppercase tracking-widest bg-electric-50 px-3 py-1 rounded-full">
              STUDENT REVIEWS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Don't Just Take Our Word For It.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Hear from students across Tamil Nadu who transformed their skills with THYNK LMS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(t => (
              <div key={t.id} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{t.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center space-x-3">
                  <img
                    src={t.avatar}
                    alt={t.studentName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{t.studentName}</h4>
                    <p className="text-[11px] text-slate-500">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 15. FAQ SECTION */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-4">
            <span className="text-sm sm:text-base font-extrabold text-electric-600 uppercase tracking-widest bg-electric-50 border border-electric-200/60 px-4 py-1.5 rounded-full inline-block">
              GOT QUESTIONS?
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map(faq => (
              <div key={faq.id} className="border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-sm">
                <button
                  onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                  className="w-full text-left py-5 sm:py-6 px-6 sm:px-8 bg-slate-50 hover:bg-slate-100/80 font-bold text-slate-900 text-base sm:text-lg lg:text-[19px] leading-[1.4] flex items-center justify-between gap-4 transition-colors"
                >
                  <span className="pr-2">{faq.question}</span>
                  <ChevronDown className={`w-6 h-6 text-slate-400 shrink-0 transition-transform ${openFaqId === faq.id ? 'rotate-180 text-electric-600' : ''}`} />
                </button>
                {openFaqId === faq.id && (
                  <div className="py-5 sm:py-6 px-6 sm:px-8 bg-white text-base sm:text-[17px] text-slate-600 leading-[1.65] border-t border-slate-200 font-normal">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 16. STRONG FINAL CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-brand-navy via-slate-900 to-brand-navy text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <span className="bg-electric-600 text-white font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
            START YOUR JOURNEY TODAY
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Learn Digital Marketing in Tamil. <br />
            <span className="text-gradient">Build Practical Skills.</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Join 1,400+ students mastering SEO, Google Ads, Meta Ads & WordPress on THYNK LMS.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/course/dm-career-pack"
              className="w-full sm:w-auto bg-electric-600 hover:bg-electric-700 text-white font-extrabold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-electric-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>ENROLL IN CAREER PROGRAM (₹2,999)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/courses"
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm px-7 py-4 rounded-2xl border border-slate-700 transition-all"
            >
              Browse Individual Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Free Preview Video Modal */}
      {selectedPreviewCourse && (
        <VideoPreviewModal
          course={selectedPreviewCourse}
          onClose={() => setSelectedPreviewCourse(null)}
        />
      )}

    </div>
  );
}
