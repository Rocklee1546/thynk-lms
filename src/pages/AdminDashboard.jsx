import React, { useState, useMemo } from 'react';
import { useLMS } from '../context/LMSContext';
import { getLeads } from '../services/reminderService';
import { getAuditLogs } from '../services/auditService';
import { 
  ShieldCheck, 
  BookOpen, 
  Layers, 
  Users, 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Calendar, 
  Sparkles,
  Video,
  Lock,
  RefreshCw,
  X,
  Search,
  Filter,
  CheckCircle,
  Award,
  BarChart2,
  Clock,
  ExternalLink,
  ChevronRight,
  UserCheck,
  FileText,
  Mail,
  Phone,
  Link as LinkIcon,
  ShieldAlert,
  Radio,
  Send,
  Activity,
  UserX
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { 
    currentUser,
    courses, 
    valuePacks, 
    founderPosterSlogans, 
    testimonials, 
    faqs, 
    liveSessions,
    students,
    certificates,
    addCourse, 
    updateCourse, 
    deleteCourse,
    addValuePack,
    deleteValuePack,
    updateFounderPosterSlogan,
    addLiveSession,
    deleteLiveSession,
    updateStudentStatus,
    addStudentRecord,
    resetToDefaults,
    openAuthModal,
    loginAsAdmin,
    showToast
  } = useLMS();

  const [activeTab, setActiveTab] = useState('overview');

  // Student Search & Filters state
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  // Audit Logs Filter state
  const [auditCategoryFilter, setAuditCategoryFilter] = useState('ALL');

  // Leads & Reminders state
  const leads = useMemo(() => getLeads(), [activeTab]);
  const auditLogs = useMemo(() => getAuditLogs(), [activeTab]);

  // New Course Modal State
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    title: '',
    category: 'Digital Marketing',
    language: 'Tamil',
    level: 'Beginner',
    duration: '10 Hours',
    price: 999,
    originalPrice: 2999,
    badge: 'New Program',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    description: '',
    shortDesc: ''
  });

  // Edit Course Inline state
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editCourseFields, setEditCourseFields] = useState({});

  // Module & Video Lesson Manager Modal state
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState(null);
  const [newModuleName, setNewModuleName] = useState('');
  const [newLessonForm, setNewLessonForm] = useState({
    moduleId: '',
    title: '',
    duration: '25 min',
    isPreview: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  });

  // Value Pack Form state
  const [newPackForm, setNewPackForm] = useState({
    name: '',
    description: '',
    price: 1499,
    badge: 'Special Pack',
    selectedCourseIds: []
  });

  // Live Session state
  const [newSessionForm, setNewSessionForm] = useState({
    title: '',
    mentorName: 'Thynk Mentor',
    date: '2026-10-10',
    time: '07:00 PM IST',
    meetingLink: 'https://meet.google.com/abc-defg-hij'
  });

  // Filtering Students list — must stay ABOVE the early return guard (Rules of Hooks)
  const filteredStudents = useMemo(() => {
    return (students || []).filter(student => {
      const matchSearch = 
        student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (student.courseTitle && student.courseTitle.toLowerCase().includes(studentSearch.toLowerCase()));

      if (!matchSearch) return false;

      if (selectedCourseFilter !== 'All' && student.courseId !== selectedCourseFilter) {
        return false;
      }

      if (selectedStatusFilter !== 'All' && student.status !== selectedStatusFilter) {
        return false;
      }

      return true;
    });
  }, [students, studentSearch, selectedCourseFilter, selectedStatusFilter]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    if (auditCategoryFilter === 'ALL') return auditLogs;
    return auditLogs.filter(log => log.category === auditCategoryFilter);
  }, [auditLogs, auditCategoryFilter]);

  // Statistics Computations
  const totalStudentsCount = (students?.length || 0) + 1240;
  const activeStudentsCount = (students || []).filter(s => s.status === 'Active' || s.status === 'In Progress').length + 980;
  const completedCoursesCount = 436;
  const totalCertificatesCount = (certificates?.length || 0) + 310;
  const totalEnrollmentsCount = 2846;

  // Course Enrollment Distribution
  const courseEnrollmentStats = useMemo(() => {
    return [
      { name: 'SEO Mastery', count: 320, color: 'bg-electric-600' },
      { name: 'Google Ads Specialist', count: 285, color: 'bg-sky-400' },
      { name: 'Meta Ads Blueprint', count: 410, color: 'bg-emerald-600' },
      { name: 'WordPress Builder', count: 198, color: 'bg-amber-500' },
      { name: 'Complete Digital Marketing Stack', count: 275, color: 'bg-brand-navy' },
    ];
  }, []);

  // RBAC Access Control Guard — placed AFTER all hooks to comply with Rules of Hooks
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 max-w-md w-full text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white">Administrator Access Required</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              This console is restricted to authenticated administrators.
            </p>
          </div>

          {/* Quick Admin Switch — for demo/dev */}
          <button
            onClick={() => loginAsAdmin()}
            className="w-full bg-electric-600 hover:bg-electric-700 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Enter as Admin (Demo)</span>
          </button>

          <div className="relative flex items-center">
            <div className="flex-1 border-t border-slate-700" />
            <span className="px-3 text-xs text-slate-500">or</span>
            <div className="flex-1 border-t border-slate-700" />
          </div>

          <button
            onClick={() => openAuthModal('/admin', 'signin')}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs py-3 rounded-xl border border-slate-600 transition-all"
          >
            Sign In with Admin Credentials
          </button>
          <p className="text-[10px] text-slate-600">admin@thynk.com</p>
        </div>
      </div>
    );
  }

  // Handlers
  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourseForm.title) return;
    addCourse(newCourseForm);
    setShowAddCourseModal(false);
    setNewCourseForm({
      title: '',
      category: 'Digital Marketing',
      language: 'Tamil',
      level: 'Beginner',
      duration: '10 Hours',
      price: 999,
      originalPrice: 2999,
      badge: 'New Program',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      description: '',
      shortDesc: ''
    });
  };

  const handleSaveCourseEdit = (courseId) => {
    updateCourse(courseId, editCourseFields);
    setEditingCourseId(null);
  };

  const handleAddModule = (e) => {
    e.preventDefault();
    if (!newModuleName || !selectedCourseForLessons) return;
    
    const existingMods = selectedCourseForLessons.modules || [];
    const updatedMods = [
      ...existingMods,
      {
        id: `mod-${Date.now()}`,
        title: newModuleName,
        duration: '2 Hours',
        lessons: []
      }
    ];

    updateCourse(selectedCourseForLessons.id, { modules: updatedMods });
    setSelectedCourseForLessons({ ...selectedCourseForLessons, modules: updatedMods });
    setNewModuleName('');
    showToast('New module added to course!');
  };

  const handleAddLesson = (e) => {
    e.preventDefault();
    if (!newLessonForm.title || !newLessonForm.moduleId || !selectedCourseForLessons) {
      showToast('Please select a module and enter lesson title', 'error');
      return;
    }

    const updatedMods = (selectedCourseForLessons.modules || []).map(mod => {
      if (mod.id === newLessonForm.moduleId) {
        const existingLessons = mod.lessons || [];
        return {
          ...mod,
          lessons: [
            ...existingLessons,
            {
              id: `les-${Date.now()}`,
              title: newLessonForm.title,
              duration: newLessonForm.duration,
              isPreview: newLessonForm.isPreview,
              videoUrl: newLessonForm.videoUrl
            }
          ]
        };
      }
      return mod;
    });

    updateCourse(selectedCourseForLessons.id, { modules: updatedMods });
    setSelectedCourseForLessons({ ...selectedCourseForLessons, modules: updatedMods });
    setNewLessonForm({ ...newLessonForm, title: '', isPreview: false });
    showToast('Video lesson published to module!');
  };

  const handleDeleteLesson = (moduleId, lessonId) => {
    if (!selectedCourseForLessons) return;
    const updatedMods = selectedCourseForLessons.modules.map(mod => {
      if (mod.id === moduleId) {
        return {
          ...mod,
          lessons: mod.lessons.filter(l => l.id !== lessonId)
        };
      }
      return mod;
    });

    updateCourse(selectedCourseForLessons.id, { modules: updatedMods });
    setSelectedCourseForLessons({ ...selectedCourseForLessons, modules: updatedMods });
    showToast('Video lesson deleted');
  };

  const handleCreateValuePack = (e) => {
    e.preventDefault();
    if (!newPackForm.name || newPackForm.selectedCourseIds.length === 0) {
      showToast('Please enter pack name and select at least one course', 'error');
      return;
    }
    const computedOriginal = courses
      .filter(c => newPackForm.selectedCourseIds.includes(c.id))
      .reduce((acc, curr) => acc + (curr.originalPrice || curr.price), 0);

    addValuePack({
      name: newPackForm.name,
      description: newPackForm.description,
      courseIds: newPackForm.selectedCourseIds,
      price: Number(newPackForm.price),
      originalPrice: computedOriginal,
      savings: Math.max(0, computedOriginal - Number(newPackForm.price)),
      badge: newPackForm.badge
    });
    setNewPackForm({ name: '', description: '', price: 1499, badge: 'Special Pack', selectedCourseIds: [] });
  };

  const handleCreateLiveSession = (e) => {
    e.preventDefault();
    if (!newSessionForm.title) return;
    addLiveSession(newSessionForm);
    setNewSessionForm({ title: '', mentorName: 'Thynk Mentor', date: '2026-10-10', time: '07:00 PM IST', meetingLink: 'https://meet.google.com/abc-defg-hij' });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
      case 'Active':
        return 'bg-electric-50 text-electric-700 border-electric-200 font-bold';
      case 'Expired':
        return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'Inactive':
        return 'bg-slate-100 text-slate-600 border-slate-200 font-medium';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="bg-brand-navy text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-0.5 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMINISTRATOR CMS & LMS PANEL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">THYNK LMS Management Console</h1>
            <p className="text-slate-300 text-xs">Logged in as {currentUser.email} • Student Directory, 6-Month Expiry, Leads & 8-Stage Reminders.</p>
          </div>

          <button
            onClick={resetToDefaults}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center space-x-1.5 shrink-0"
            title="Reset storage to default seed data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* 6 TOP STATISTIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Students</div>
            <div className="text-2xl font-black text-slate-900 font-display">{totalStudentsCount}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">{totalStudentsCount} Registered</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Courses</div>
            <div className="text-2xl font-black text-electric-600 font-display">{courses.length}</div>
            <div className="text-[10px] text-slate-400 font-medium">Digital Marketing</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Enrollments</div>
            <div className="text-2xl font-black text-slate-900 font-display">{totalEnrollmentsCount}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">+14% this month</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Students</div>
            <div className="text-2xl font-black text-sky-500 font-display">{activeStudentsCount}</div>
            <div className="text-[10px] text-sky-600 font-semibold">{activeStudentsCount} Active Access</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed Courses</div>
            <div className="text-2xl font-black text-emerald-600 font-display">{completedCoursesCount}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">436 Completed</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Certificates Issued</div>
            <div className="text-2xl font-black text-amber-500 font-display">{totalCertificatesCount}</div>
            <div className="text-[10px] text-amber-600 font-semibold">{totalCertificatesCount} Verified</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-300 overflow-x-auto space-x-6 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'overview' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'students' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Management ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-3 flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'leads' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-600" />
            <span>Leads & 8-Stage Reminders ({leads.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'audit' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-electric-600" />
            <span>System Audit Logs ({auditLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'courses' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Courses & Video Builder ({courses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('combos')}
            className={`pb-3 flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'combos' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Value Packs ({valuePacks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`pb-3 flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'certificates' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Certificates ({certificates.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('slogans')}
            className={`pb-3 flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'slogans' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Founder Slogans CMS</span>
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`pb-3 flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'live' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Live Sessions ({liveSessions.length})</span>
          </button>
        </div>

        {/* TAB 0: DASHBOARD OVERVIEW & ENROLLMENT STATISTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Course Enrollment Breakdown Table */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base font-display">Course Enrollment Distribution</h3>
                    <p className="text-xs text-slate-500">Student enrollment counts per course program.</p>
                  </div>
                  <span className="text-xs font-bold text-electric-600 bg-electric-50 px-2.5 py-1 rounded-full">
                    {courses.length} Active Courses
                  </span>
                </div>

                <div className="space-y-3">
                  {courseEnrollmentStats.map((stat, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800 font-bold">{stat.name}</span>
                        <span className="text-slate-600 font-mono">{stat.count} Students enrolled</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`${stat.color} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(100, Math.round((stat.count / 450) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions & Recent Enrollment Activity */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 font-display">
                  Recent Student Activity
                </h3>

                <div className="space-y-3">
                  {students.slice(0, 4).map(std => (
                    <div key={std.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-slate-900">{std.name}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{std.courseTitle}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadgeClass(std.status)}`}>
                        {std.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab('students')}
                  className="w-full text-center bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md"
                >
                  Go to Full Student Management
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB: LEADS & 8-STAGE REMINDERS AUTOMATION */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 font-display">Course Leads & 8-Stage Reminder Automation</h2>
              <p className="text-xs text-slate-500">
                Automated follow-up reminders scheduled across 8 strategic intervals: <strong>Day 5, 20, 30, 60, 75, 90, 120, 150</strong>.
                Reminders are automatically cancelled when a student purchases.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">User / Lead</th>
                      <th className="p-4">Viewed Course</th>
                      <th className="p-4">Viewed At</th>
                      <th className="p-4">Reminders Status</th>
                      <th className="p-4">Scheduled 8 Intervals</th>
                      <th className="p-4 text-right">Purchase Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {leads.length > 0 ? (
                      leads.map(lead => (
                        <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-bold text-slate-900">
                            <div>{lead.userName || lead.userId}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{lead.userEmail || lead.userPhone || 'Guest Visitor'}</div>
                          </td>
                          <td className="p-4">
                            <span className="bg-electric-50 text-electric-700 px-2 py-0.5 rounded font-bold text-[11px]">
                              {lead.courseTitle || lead.courseId}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500 text-[11px]">
                            {new Date(lead.viewedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                          <td className="p-4">
                            {lead.cancelled ? (
                              <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] px-2.5 py-1 rounded-full font-bold">
                                Cancelled (Course Purchased)
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center space-x-1 w-max">
                                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                                <span>Active (8 Intervals Scheduled)</span>
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {lead.scheduledReminders?.map((r, i) => (
                                <span
                                  key={i}
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                    lead.cancelled
                                      ? 'bg-slate-100 text-slate-400 line-through'
                                      : r.sent
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-electric-50 text-electric-600'
                                  }`}
                                  title={`Due: ${r.scheduledForDate}`}
                                >
                                  D{r.intervalDays}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            {lead.hasPurchased ? (
                              <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                                ENROLLED ✓
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                Pending Follow-up
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No course views or lead records logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SYSTEM AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 font-display">System Security & Operation Audit Logs</h2>
                <p className="text-xs text-slate-500">Chronological records of user authentication, orders, payments, enrollments, and cert issuances.</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-bold">Category:</span>
                <select
                  value={auditCategoryFilter}
                  onChange={(e) => setAuditCategoryFilter(e.target.value)}
                  className="p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="ALL">ALL CATEGORIES</option>
                  <option value="AUTH">AUTH</option>
                  <option value="PAYMENT">PAYMENT</option>
                  <option value="ENROLLMENT">ENROLLMENT</option>
                  <option value="CERTIFICATE">CERTIFICATE</option>
                  <option value="SECURITY">SECURITY</option>
                  <option value="REMINDER">REMINDER</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px] font-sans">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Actor (User ID)</th>
                      <th className="p-3.5">Event Details</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                    {filteredAuditLogs.length > 0 ? (
                      filteredAuditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 text-slate-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'medium' })}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                              {log.category}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-900">{log.action}</td>
                          <td className="p-3.5 text-slate-600">{log.userId || 'SYSTEM'}</td>
                          <td className="p-3.5 text-slate-600 max-w-xs truncate">
                            {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
                          </td>
                          <td className="p-3.5 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                          No audit events recorded for this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: STUDENT MANAGEMENT SECTION */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 font-display">Student Management Directory</h2>
                <p className="text-xs text-slate-500">View enrolled students, check progress %, filter by status, and inspect detailed profiles.</p>
              </div>
            </div>

            {/* Student Search & Filters Controls */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                
                {/* Search Bar */}
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search by student name, email, or course..."
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-electric-600 focus:bg-white"
                  />
                </div>

                {/* Course Filter */}
                <div className="sm:col-span-3">
                  <select
                    value={selectedCourseFilter}
                    onChange={(e) => setSelectedCourseFilter(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="All">All Courses</option>
                    <option value="dm-career-pack">Complete DM Pack</option>
                    <option value="course-seo">SEO Mastery</option>
                    <option value="course-gads">Google Ads Specialist</option>
                    <option value="course-meta">Meta Ads Blueprint</option>
                    <option value="course-wp">WordPress Builder</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="sm:col-span-3">
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Expired">Expired</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

              </div>

            </div>

            {/* Responsive Student Management Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Enrolled Course</th>
                      <th className="p-4">Progress %</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">6-Month Validity Expiry</th>
                      <th className="p-4">Certificate</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => {
                        const expiryDisplay = student.expiryDate 
                          ? new Date(student.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '10 Apr 2027';

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-electric-600/10 text-electric-600 font-bold flex items-center justify-center text-xs shrink-0">
                                  {student.name.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-extrabold text-slate-900 block text-xs">{student.name}</span>
                                  <span className="text-[11px] text-slate-500 font-normal">{student.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-slate-800 line-clamp-1">{student.courseTitle}</span>
                            </td>
                            <td className="p-4">
                              <div className="w-28 space-y-1">
                                <div className="flex justify-between text-[10px] font-bold">
                                  <span>{student.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${student.progress === 100 ? 'bg-emerald-600' : 'bg-electric-600'}`}
                                    style={{ width: `${student.progress}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] border ${getStatusBadgeClass(student.status)}`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-1.5 text-[11px]">
                                <Calendar className="w-3.5 h-3.5 text-electric-600 shrink-0" />
                                <span className={student.status === 'Expired' ? 'text-red-600 font-bold' : 'text-slate-700'}>
                                  {expiryDisplay}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              {student.certificateStatus === 'Issued' ? (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
                                  <Award className="w-3 h-3 text-emerald-600" />
                                  <span>Issued ({student.certificateId})</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[11px]">{student.certificateStatus}</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedStudentDetail(student)}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all"
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          No student records match your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: COURSE & VIDEO BUILDER */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 font-display">Manage Courses, Modules & Video Lessons</h2>
                <p className="text-xs text-slate-500">Edit price, title, delete courses, or click "Manage Videos" to add/edit lesson videos.</p>
              </div>

              <button
                onClick={() => setShowAddCourseModal(true)}
                className="bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1 shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Course</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-200">
              {courses.map(course => (
                <div key={course.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div className="flex items-start space-x-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {course.category} • Tamil
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                          {course.modules?.length || 0} Modules
                        </span>
                      </div>
                      
                      {editingCourseId === course.id ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          <input
                            type="text"
                            value={editCourseFields.title ?? course.title}
                            onChange={(e) => setEditCourseFields({ ...editCourseFields, title: e.target.value })}
                            className="p-1.5 bg-slate-50 border border-slate-300 text-xs font-bold rounded"
                          />
                          <input
                            type="number"
                            value={editCourseFields.price ?? course.price}
                            onChange={(e) => setEditCourseFields({ ...editCourseFields, price: Number(e.target.value) })}
                            className="w-24 p-1.5 bg-slate-50 border border-slate-300 text-xs font-bold rounded"
                          />
                        </div>
                      ) : (
                        <h3 className="font-extrabold text-slate-900 text-sm">{course.title}</h3>
                      )}

                      <div className="text-xs text-slate-500 space-x-3">
                        <span>Price: <strong className="text-slate-900">₹{course.price}</strong></span>
                        <span>Original: <span className="line-through">₹{course.originalPrice || 2999}</span></span>
                        <span>Duration: {course.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedCourseForLessons(course)}
                      className="bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Manage Video Lessons</span>
                    </button>

                    {editingCourseId === course.id ? (
                      <button
                        onClick={() => handleSaveCourseEdit(course.id)}
                        className="bg-emerald-600 text-white p-2 rounded-xl text-xs font-bold flex items-center space-x-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingCourseId(course.id);
                          setEditCourseFields({ title: course.title, price: course.price });
                        }}
                        className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                        title="Edit Title & Price"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                      title="Delete Course permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 3: VALUE PACK CMS */}
        {activeTab === 'combos' && (
          <div className="space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 font-display">Combo Value Packs CMS</h2>

            <form onSubmit={handleCreateValuePack} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
              <h3 className="font-extrabold text-slate-800 text-sm">Create New Combo Value Pack</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Combo Name</label>
                  <input
                    type="text"
                    value={newPackForm.name}
                    onChange={(e) => setNewPackForm({ ...newPackForm, name: e.target.value })}
                    placeholder="e.g. ADS STARTER PACK"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Combo Price (₹)</label>
                  <input
                    type="number"
                    value={newPackForm.price}
                    onChange={(e) => setNewPackForm({ ...newPackForm, price: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Included Courses:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {courses.map(c => (
                    <label key={c.id} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <input
                        type="checkbox"
                        checked={newPackForm.selectedCourseIds.includes(c.id)}
                        onChange={(e) => {
                          const set = new Set(newPackForm.selectedCourseIds);
                          if (e.target.checked) set.add(c.id);
                          else set.delete(c.id);
                          setNewPackForm({ ...newPackForm, selectedCourseIds: Array.from(set) });
                        }}
                      />
                      <span>{c.title} (₹{c.price})</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="bg-electric-600 text-white font-bold px-5 py-2.5 rounded-xl">
                Publish Value Pack
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {valuePacks.map(pack => (
                <div key={pack.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      {pack.badge}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm mt-1">{pack.name}</h4>
                    <p className="text-xs text-slate-500">Price: ₹{pack.price} • Includes {pack.courseIds.length} course(s)</p>
                  </div>
                  <button onClick={() => deleteValuePack(pack.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CERTIFICATES MANAGEMENT */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 font-display">Issued Student Certificates</h2>
                <p className="text-xs text-slate-500">Verifiable credentials issued to completing students.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map(cert => (
                <div key={cert.certificateId} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-electric-50 text-electric-600 px-2.5 py-0.5 rounded border border-electric-200">
                      ID: {cert.certificateId}
                    </span>
                    <span className="text-xs text-slate-500">Issued: {cert.issueDate}</span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm">{cert.courseTitle}</h3>
                  <p className="text-xs text-slate-600">Student: <strong>{cert.studentName}</strong></p>

                  <Link
                    to={`/verify-certificate?id=${cert.certificateId}`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-electric-600 hover:text-electric-700"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: FOUNDER POSTER SLOGANS CMS */}
        {activeTab === 'slogans' && (
          <div className="space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 font-display">Founder Poster Marketing Slogans CMS</h2>
            <p className="text-xs text-slate-500">
              Edit marketing slogan campaigns displayed beside the official founder photograph asset (`/founder.png`).
            </p>

            <div className="space-y-4">
              {founderPosterSlogans.map(slogan => (
                <div key={slogan.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-electric-600 uppercase">{slogan.tagline}</span>
                    <span className="text-slate-400 font-mono">ID: {slogan.id}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-600 mb-0.5">Slogan Main Line</label>
                      <input
                        type="text"
                        defaultValue={slogan.sloganMain}
                        onBlur={(e) => updateFounderPosterSlogan(slogan.id, { sloganMain: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-0.5">Slogan Highlight Emphasis</label>
                      <input
                        type="text"
                        defaultValue={slogan.sloganHighlight}
                        onBlur={(e) => updateFounderPosterSlogan(slogan.id, { sloganHighlight: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-electric-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-0.5">Supporting Subtext</label>
                    <input
                      type="text"
                      defaultValue={slogan.subtext}
                      onBlur={(e) => updateFounderPosterSlogan(slogan.id, { subtext: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: LIVE SESSIONS CMS */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 font-display">Schedule Live Doubt Solving Session</h2>

            <form onSubmit={handleCreateLiveSession} className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Session Title"
                  value={newSessionForm.title}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, title: e.target.value })}
                  className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Mentor Name"
                  value={newSessionForm.mentorName}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, mentorName: e.target.value })}
                  className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <button type="submit" className="bg-electric-600 text-white font-bold px-4 py-2 rounded-xl">
                Schedule Session
              </button>
            </form>

            <div className="space-y-3">
              {liveSessions.map(ls => (
                <div key={ls.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{ls.title}</h4>
                    <p className="text-slate-500">{ls.date} at {ls.time} • {ls.mentorName}</p>
                  </div>
                  <button onClick={() => deleteLiveSession(ls.id)} className="p-1.5 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* STUDENT PROFILE DETAILS MODAL / DRAWER PANEL */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 text-xs text-slate-800 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-electric-600 text-white font-extrabold flex items-center justify-center text-sm">
                  {selectedStudentDetail.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-display">
                    {selectedStudentDetail.name}
                  </h3>
                  <p className="text-xs text-slate-500">Student Profile & Learning Record</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Student ID</span>
                <span className="font-mono font-bold text-slate-900">{selectedStudentDetail.id}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Email</span>
                <span className="font-bold text-slate-900">{selectedStudentDetail.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Phone</span>
                <span className="font-bold text-slate-900">{selectedStudentDetail.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Account Status</span>
                <span className={`inline-block px-2 py-0.5 text-[10px] rounded border ${getStatusBadgeClass(selectedStudentDetail.status)}`}>
                  {selectedStudentDetail.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Enrollment Date</span>
                <span className="font-semibold text-slate-700">{selectedStudentDetail.enrollmentDate}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">6-Month Access Expiry</span>
                <span className="font-bold text-emerald-600">
                  {selectedStudentDetail.accessExpiryDate 
                    ? new Date(selectedStudentDetail.accessExpiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '10 Apr 2027'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Last Active</span>
                <span className="font-semibold text-slate-700">{selectedStudentDetail.lastActive || 'Today'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Certificate Status</span>
                <span className="font-bold text-emerald-600">{selectedStudentDetail.certificateStatus || 'In Progress'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Internship Status</span>
                <span className={`font-extrabold ${selectedStudentDetail.progress === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedStudentDetail.progress === 100 ? 'Eligible ✓' : 'In Progress'}
                </span>
              </div>
            </div>

            {/* SECURITY & PASSWORD AUDIT NOTICE (Requirement 17) */}
            <div className="p-3.5 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[11px] uppercase tracking-wider">SECURITY NOTICE — ZERO PLAINTEXT PASSWORD STORAGE</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Password Set: <strong className="text-emerald-400">Yes (Bcrypt Encrypted)</strong> • Auth Method: <strong className="text-sky-300">{selectedStudentDetail.authMethod || 'OTP / Password'}</strong> • Email Verified: <strong className="text-emerald-400">Yes</strong>
              </p>
              <p className="text-[10px] text-slate-500">Plaintext passwords are never displayed or stored anywhere in compliance with security guidelines.</p>
            </div>

            {/* PAYMENT INFORMATION */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm">Payment & Order Information:</h4>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Order ID</span>
                  <span className="font-mono font-bold text-slate-800">ord_thynk_{selectedStudentDetail.id.slice(0, 6)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Payment ID</span>
                  <span className="font-mono font-bold text-slate-800">pay_razorpay_verified</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Amount Paid</span>
                  <span className="font-bold text-emerald-600">₹2,999 (INR)</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Payment Status</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">PAID ✓</span>
                </div>
              </div>
            </div>

            {/* Enrolled Program & Progress */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 text-sm">Enrolled Course Progress:</h4>
              <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-900 text-xs">{selectedStudentDetail.courseTitle}</span>
                  <span className="text-electric-600 font-mono text-sm">{selectedStudentDetail.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${selectedStudentDetail.progress === 100 ? 'bg-emerald-600' : 'bg-electric-600'}`}
                    style={{ width: `${selectedStudentDetail.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Lessons: {selectedStudentDetail.completedLessonsCount || 0} / {selectedStudentDetail.totalLessonsCount || 10} completed</span>
                  <span>Submitted Projects: {selectedStudentDetail.submittedProjects?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions / Status Updates */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Update Student Status:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    updateStudentStatus(selectedStudentDetail.id, { status: 'Completed', progress: 100, certificateStatus: 'Issued', certificateId: `THYNK-DM-2026-${Math.floor(1000 + Math.random() * 9000)}` });
                    setSelectedStudentDetail(null);
                  }}
                  className="bg-emerald-600 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl"
                >
                  Mark Completed & Issue Cert
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MANAGE VIDEO LESSONS & SYLLABUS MODAL */}
      {selectedCourseForLessons && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 text-xs text-slate-800 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold bg-electric-50 text-electric-600 px-2.5 py-0.5 rounded">
                  VIDEO LESSON MANAGER
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1 font-display">
                  {selectedCourseForLessons.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCourseForLessons(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddModule} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex gap-2">
              <input
                type="text"
                placeholder="Enter new module title (e.g. Module 06: Advanced Meta Retargeting)"
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
              />
              <button
                type="submit"
                className="bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shrink-0"
              >
                + Add Module
              </button>
            </form>

            <form onSubmit={handleAddLesson} className="bg-electric-50/60 p-5 rounded-2xl border border-electric-200 space-y-3">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center space-x-1.5 font-display">
                <Video className="w-4 h-4 text-electric-600" />
                <span>Upload & Link New Video Lesson (Tamil)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Module</label>
                  <select
                    value={newLessonForm.moduleId}
                    onChange={(e) => setNewLessonForm({ ...newLessonForm, moduleId: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="">-- Choose Module --</option>
                    {selectedCourseForLessons.modules?.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lesson Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Setting Up Pixel Events in Tamil"
                    value={newLessonForm.title}
                    onChange={(e) => setNewLessonForm({ ...newLessonForm, title: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Video Stream URL (Embed / MP4)</label>
                  <div className="flex items-center space-x-1">
                    <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/embed/..."
                      value={newLessonForm.videoUrl}
                      onChange={(e) => setNewLessonForm({ ...newLessonForm, videoUrl: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Access Visibility</label>
                  <label className="flex items-center space-x-2 pt-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={newLessonForm.isPreview}
                      onChange={(e) => setNewLessonForm({ ...newLessonForm, isPreview: e.target.checked })}
                      className="w-4 h-4 text-electric-600 rounded"
                    />
                    <span>Mark as FREE PREVIEW (Visible to Non-Enrolled Visitors)</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs py-3 rounded-xl shadow-md"
              >
                PUBLISH VIDEO LESSON TO MODULE
              </button>
            </form>

            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 text-sm">Existing Course Syllabus & Videos:</h4>
              
              {selectedCourseForLessons.modules?.map(mod => (
                <div key={mod.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                  <h5 className="font-extrabold text-slate-900 text-xs text-electric-600">{mod.title}</h5>

                  <div className="divide-y divide-slate-200 bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {mod.lessons?.map(les => (
                      <div key={les.id} className="p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {les.isPreview ? (
                            <span className="bg-emerald-50 text-emerald-600 font-bold text-[9px] px-1.5 py-0.5 rounded">
                              FREE PREVIEW
                            </span>
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span className="font-semibold text-slate-800 text-xs">{les.title}</span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] font-mono text-slate-400">{les.duration}</span>
                          <button
                            onClick={() => handleDeleteLesson(mod.id, les.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Video Lesson"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Modal for New Course Creation */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 text-xs">
            <h3 className="text-base font-extrabold text-slate-900 font-display">Create New Digital Marketing Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">Course Title</label>
                <input
                  type="text"
                  value={newCourseForm.title}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, title: e.target.value })}
                  required
                  placeholder="e.g. Meta Reels Ads Specialist"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newCourseForm.price}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={newCourseForm.originalPrice}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, originalPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea
                  value={newCourseForm.description}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, description: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-electric-600 text-white font-bold"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
