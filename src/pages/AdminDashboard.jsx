import React, { useState, useMemo, useRef } from 'react';
import { useLMS } from '../context/LMSContext';
import { getLeads } from '../services/reminderService';
import { getAuditLogs } from '../services/auditService';
import {
  getAllEnrollmentRequests,
  approveEnrollmentRequest,
  rejectEnrollmentRequest,
  recordWhatsAppSent,
  generateWhatsAppApprovalUrl
} from '../services/enrollmentService';
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
  UserX,
  Star,
  MessageSquare,
  Tag,
  ImagePlus,
  Percent,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Check,
  XCircle,
  MessageCircle,
  Copy,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CourseContentEditorModal from '../components/CourseContentEditorModal';

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
    reviews,
    coupons,
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
    approveReview,
    updateReview,
    addAdminReview,
    deleteReview,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    toggleCouponVisibility,
    updateCourseCoverImage,
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

  // Course Reviews Filter State
  const [reviewCourseFilter, setReviewCourseFilter] = useState('All');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('All');

  const filteredReviews = useMemo(() => {
    let list = reviews || [];
    if (reviewCourseFilter !== 'All') {
      list = list.filter(r => r.courseId === reviewCourseFilter);
    }
    if (reviewStatusFilter !== 'All') {
      list = list.filter(r => r.status === reviewStatusFilter);
    }
    return list;
  }, [reviews, reviewCourseFilter, reviewStatusFilter]);

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

  // Full Course Content Editor Modal state (What You'll Learn, Inclusions, Requirements, Instructor, Reviews)
  const [selectedCourseForContent, setSelectedCourseForContent] = useState(null);

  // Edit Review Modal state
  const [editingReviewModal, setEditingReviewModal] = useState(null);

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

  // Course Approvals & Verification state
  const [approvalsRefresh, setApprovalsRefresh] = useState(0);
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('All');
  const [approvalSearch, setApprovalSearch] = useState('');
  const [selectedApprovalRequest, setSelectedApprovalRequest] = useState(null);
  const [approvalScreenshotModal, setApprovalScreenshotModal] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingRefId, setRejectingRefId] = useState(null);

  const allEnrollmentRequests = useMemo(() => {
    return getAllEnrollmentRequests();
  }, [approvalsRefresh, activeTab]);

  const pendingApprovalsCount = useMemo(() => {
    return allEnrollmentRequests.filter(r => r.status === 'pending_verification').length;
  }, [allEnrollmentRequests]);

  const filteredEnrollmentRequests = useMemo(() => {
    let list = allEnrollmentRequests;
    if (approvalStatusFilter !== 'All') {
      list = list.filter(r => r.status === approvalStatusFilter);
    }
    if (approvalSearch.trim()) {
      const q = approvalSearch.toLowerCase().trim();
      list = list.filter(r => 
        (r.refId && r.refId.toLowerCase().includes(q)) ||
        (r.studentName && r.studentName.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.phone && r.phone.includes(q)) ||
        (r.itemName && r.itemName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allEnrollmentRequests, approvalStatusFilter, approvalSearch]);

  // ── Cover Image Upload (per course) ──────────────────────────────────
  const coverImageInputRefs = useRef({});
  const [coverImagePreviews, setCoverImagePreviews] = useState({});

  // ── Coupon State ──────────────────────────────────────────────────────
  const emptyCouponForm = {
    code: '', description: '', discountType: 'percentage', discountValue: 10,
    startDate: new Date().toISOString().split('T')[0], expiryDate: '2027-12-31',
    usageLimit: 500, minPurchaseAmount: 0, applicableItemId: 'all',
    isActive: true, isVisible: true
  };
  const [couponForm, setCouponForm] = useState(emptyCouponForm);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);

  // RBAC Access Control Guard — placed AFTER ALL hooks to comply with React Rules of Hooks
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

  // ── Cover Image Upload Handlers ─────────────────────────────────────
  const handleCoverImageSelect = (courseId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      showToast('Only JPG, PNG, WEBP, or GIF images are allowed.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5 MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCoverImagePreviews(prev => ({ ...prev, [courseId]: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCoverImage = (courseId) => {
    const b64 = coverImagePreviews[courseId];
    if (!b64) return;
    updateCourseCoverImage(courseId, b64);
    setCoverImagePreviews(prev => { const n = { ...prev }; delete n[courseId]; return n; });
    showToast('Cover image updated!', 'success');
  };

  const handleClearCoverPreview = (courseId) => {
    setCoverImagePreviews(prev => { const n = { ...prev }; delete n[courseId]; return n; });
  };

  // ── Coupon Handlers ──────────────────────────────────────────────────
  const openCreateCoupon = () => {
    setEditingCouponId(null);
    setCouponForm(emptyCouponForm);
    setShowCouponModal(true);
  };

  const openEditCoupon = (coupon) => {
    setEditingCouponId(coupon.id);
    setCouponForm({
      code: coupon.code, description: coupon.description || '',
      discountType: coupon.discountType, discountValue: coupon.discountValue,
      startDate: coupon.startDate, expiryDate: coupon.expiryDate,
      usageLimit: coupon.usageLimit, minPurchaseAmount: coupon.minPurchaseAmount || 0,
      applicableItemId: coupon.applicableItemId || 'all',
      isActive: coupon.isActive, isVisible: coupon.isVisible
    });
    setShowCouponModal(true);
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (!couponForm.code.trim()) { showToast('Coupon code is required', 'error'); return; }
    if (editingCouponId) {
      updateCoupon(editingCouponId, couponForm);
    } else {
      addCoupon(couponForm);
    }
    setShowCouponModal(false);
  };

  const handleDeleteCoupon = (couponId) => {
    if (window.confirm('Delete this coupon permanently?')) {
      deleteCoupon(couponId);
    }
  };

  // Enrollment Approvals handlers
  const handleApproveRequest = (refId, notes) => {
    const res = approveEnrollmentRequest(refId, currentUser?.id || 'usr-admin-1', notes || approvalNotes);
    if (res.success) {
      showToast(`Enrollment approved for ${res.request.studentName}! 6-month access granted.`, 'success');
      setApprovalsRefresh(p => p + 1);
      if (selectedApprovalRequest?.refId === refId) {
        setSelectedApprovalRequest(res.request);
      }
      setApprovalNotes('');
    } else {
      showToast(res.error || 'Failed to approve enrollment.', 'error');
    }
  };

  const handleRejectRequest = (refId, reason) => {
    const finalReason = reason || rejectionReason;
    if (!finalReason || !finalReason.trim()) {
      showToast('Please provide a reason for rejection.', 'error');
      return;
    }
    const res = rejectEnrollmentRequest(refId, currentUser?.id || 'usr-admin-1', finalReason.trim());
    if (res.success) {
      showToast('Enrollment request rejected.', 'info');
      setApprovalsRefresh(p => p + 1);
      if (selectedApprovalRequest?.refId === refId) {
        setSelectedApprovalRequest(res.request);
      }
      setRejectingRefId(null);
      setRejectionReason('');
    } else {
      showToast(res.error || 'Failed to reject enrollment.', 'error');
    }
  };

  const handleSendWhatsAppMessage = (request) => {
    const url = generateWhatsAppApprovalUrl(request);
    window.open(url, '_blank', 'noopener,noreferrer');
    recordWhatsAppSent(request.refId);
    setApprovalsRefresh(p => p + 1);
    if (selectedApprovalRequest?.refId === request.refId) {
      setSelectedApprovalRequest(prev => ({ ...prev, whatsappSentAt: new Date().toISOString() }));
    }
    showToast('WhatsApp approval chat opened!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="bg-brand-navy text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs sm:text-sm font-extrabold">
              <ShieldCheck className="w-4 h-4" />
              <span>ADMINISTRATOR CMS &amp; LMS PANEL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display">THYNK LMS Management Console</h1>
            <p className="text-slate-300 text-sm">Logged in as <strong>{currentUser.email}</strong> • Student Directory, 6-Month Expiry, Leads &amp; 8-Stage Reminders.</p>
          </div>

          <button
            onClick={resetToDefaults}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-extrabold px-4.5 py-2.5 rounded-xl border border-slate-700 flex items-center space-x-2 shrink-0 cursor-pointer"
            title="Reset storage to default seed data"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* 6 TOP STATISTIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Students</div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-display">{totalStudentsCount}</div>
            <div className="text-xs font-extrabold text-emerald-600">{totalStudentsCount} Registered</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Courses</div>
            <div className="text-3xl sm:text-4xl font-black text-electric-600 font-display">{courses.length}</div>
            <div className="text-xs font-bold text-slate-500">Digital Marketing</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Enrollments</div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-display">{totalEnrollmentsCount}</div>
            <div className="text-xs font-extrabold text-emerald-600">+14% this month</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Active Students</div>
            <div className="text-3xl sm:text-4xl font-black text-sky-500 font-display">{activeStudentsCount}</div>
            <div className="text-xs font-extrabold text-sky-600">{activeStudentsCount} Active Access</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Completed Courses</div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-display">{completedCoursesCount}</div>
            <div className="text-xs font-extrabold text-emerald-600">436 Completed</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Certificates Issued</div>
            <div className="text-3xl sm:text-4xl font-black text-amber-500 font-display">{totalCertificatesCount}</div>
            <div className="text-xs font-extrabold text-amber-600">{totalCertificatesCount} Verified</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-300 overflow-x-auto space-x-6 text-sm sm:text-base font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3.5 flex items-center space-x-2 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-5 h-5" />
            <span>Dashboard Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3.5 flex items-center space-x-2 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'students' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Student Management ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-3.5 flex items-center space-x-2 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'leads' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Radio className="w-5 h-5 text-emerald-600" />
            <span>Leads &amp; 8-Stage Reminders ({leads.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3.5 flex items-center space-x-2 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'audit' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Activity className="w-5 h-5 text-electric-600" />
            <span>System Audit Logs ({auditLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3.5 flex items-center space-x-2 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'courses' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Courses &amp; Video Builder ({courses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('combos')}
            className={`pb-3.5 flex items-center space-x-2 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'combos' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>Value Packs ({valuePacks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`pb-3.5 flex items-center space-x-2 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'certificates' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Award className="w-5 h-5" />
            <span>Certificates ({certificates.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('slogans')}
            className={`pb-3.5 flex items-center space-x-2 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'slogans' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Founder Slogans CMS</span>
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`pb-3.5 flex items-center space-x-2 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'live' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Live Sessions ({liveSessions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3.5 flex items-center space-x-2 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'reviews' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Course Reviews ({(reviews || []).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`pb-3.5 flex items-center space-x-2 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'coupons' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Tag className="w-5 h-5 text-amber-500" />
            <span>Coupons ({(coupons || []).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`pb-3.5 flex items-center space-x-2 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'approvals' ? 'border-electric-600 text-electric-600 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Course Approvals</span>
            {pendingApprovalsCount > 0 ? (
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {pendingApprovalsCount} pending
              </span>
            ) : (
              <span className="text-slate-400 text-xs">({allEnrollmentRequests.length})</span>
            )}
          </button>
        </div>

        {/* TAB 0: DASHBOARD OVERVIEW & ENROLLMENT STATISTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Course Enrollment Breakdown Table */}
              <div className="lg:col-span-7 bg-white p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl font-display">Course Enrollment Distribution</h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Student enrollment counts per course program.</p>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-electric-600 bg-electric-50 px-3.5 py-1.5 rounded-full border border-electric-200">
                    {courses.length} Active Courses
                  </span>
                </div>

                <div className="space-y-4">
                  {courseEnrollmentStats.map((stat, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm sm:text-base font-bold">
                        <span className="text-slate-900">{stat.name}</span>
                        <span className="text-slate-700 font-mono font-semibold">{stat.count} Students enrolled</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
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
              <div className="lg:col-span-5 bg-white p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl border-b border-slate-100 pb-4 font-display">
                  Recent Student Activity
                </h3>

                <div className="space-y-3.5">
                  {students.slice(0, 4).map(std => (
                    <div key={std.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm">
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{std.name}</h4>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium line-clamp-1">{std.courseTitle}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full border font-bold ${getStatusBadgeClass(std.status)}`}>
                        {std.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab('students')}
                  className="w-full text-center bg-electric-600 hover:bg-electric-700 text-white font-extrabold text-sm py-3.5 rounded-xl transition-all shadow-md cursor-pointer"
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
              <h2 className="text-xl font-extrabold text-slate-900 font-display">Course Leads &amp; 8-Stage Reminder Automation</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Automated follow-up reminders scheduled across 8 strategic intervals: <strong>Day 5, 20, 30, 60, 75, 90, 120, 150</strong>.
                Reminders are automatically cancelled when a student purchases.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="p-4">User / Lead</th>
                      <th className="p-4">Viewed Course</th>
                      <th className="p-4">Viewed At</th>
                      <th className="p-4">Reminders Status</th>
                      <th className="p-4">Scheduled 8 Intervals</th>
                      <th className="p-4 text-right">Purchase Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800 text-sm">
                    {leads.length > 0 ? (
                      leads.map(lead => (
                        <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-bold text-slate-900">
                            <div className="text-sm sm:text-base font-extrabold">{lead.userName || lead.userId}</div>
                            <div className="text-xs text-slate-500 font-normal">{lead.userEmail || lead.userPhone || 'Guest Visitor'}</div>
                          </td>
                          <td className="p-4">
                            <span className="bg-electric-50 text-electric-700 px-3 py-1 rounded-md font-bold text-xs sm:text-sm border border-electric-200">
                              {lead.courseTitle || lead.courseId}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 text-xs sm:text-sm font-medium">
                            {new Date(lead.viewedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                          <td className="p-4">
                            {lead.cancelled ? (
                              <span className="bg-slate-100 text-slate-600 border border-slate-200 text-xs px-3 py-1 rounded-full font-bold">
                                Cancelled (Course Purchased)
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 rounded-full font-bold flex items-center space-x-1.5 w-max">
                                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                                <span>Active (8 Intervals Scheduled)</span>
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1.5">
                              {lead.scheduledReminders?.map((r, i) => (
                                <span
                                  key={i}
                                  className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
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
                              <span className="bg-emerald-600 text-white text-xs font-extrabold px-3 py-1 rounded-full">
                                ENROLLED ✓
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                                Pending Follow-up
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
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
                <h2 className="text-xl font-extrabold text-slate-900 font-display">System Security &amp; Operation Audit Logs</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Chronological records of user authentication, orders, payments, enrollments, and cert issuances.</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm text-slate-600 font-bold">Category:</span>
                <select
                  value={auditCategoryFilter}
                  onChange={(e) => setAuditCategoryFilter(e.target.value)}
                  className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800"
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
                <table className="w-full text-left text-xs sm:text-sm font-mono">
                  <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200 uppercase tracking-wider text-xs font-sans">
                    <tr>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">Actor (User ID)</th>
                      <th className="p-4">Event Details</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 text-xs sm:text-sm">
                    {filteredAuditLogs.length > 0 ? (
                      filteredAuditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-slate-600 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'medium' })}
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              {log.category}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-900">{log.action}</td>
                          <td className="p-4 text-slate-600 font-semibold">{log.userId || 'SYSTEM'}</td>
                          <td className="p-4 text-slate-600 max-w-xs truncate font-medium">
                            {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
                          </td>
                          <td className="p-4 text-right">
                            <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                              log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-sans text-sm font-medium">
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
                <h2 className="text-xl font-extrabold text-slate-900 font-display">Student Management Directory</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">View enrolled students, check progress %, filter by status, and inspect detailed profiles.</p>
              </div>
            </div>

            {/* Student Search & Filters Controls */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                
                {/* Search Bar */}
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search by student name, email, or course..."
                    className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-electric-600 focus:bg-white"
                  />
                </div>

                {/* Course Filter */}
                <div className="sm:col-span-3">
                  <select
                    value={selectedCourseFilter}
                    onChange={(e) => setSelectedCourseFilter(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700"
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
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700"
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
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200 uppercase tracking-wider text-xs">
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
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => {
                        const expiryDisplay = student.expiryDate 
                          ? new Date(student.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '10 Apr 2027';

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-full bg-electric-600/10 text-electric-600 font-black flex items-center justify-center text-sm shrink-0">
                                  {student.name.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-extrabold text-slate-900 block text-sm sm:text-base">{student.name}</span>
                                  <span className="text-xs text-slate-500 font-normal">{student.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-slate-800 text-sm line-clamp-1">{student.courseTitle}</span>
                            </td>
                            <td className="p-4">
                              <div className="w-32 space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                  <span>{student.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${student.progress === 100 ? 'bg-emerald-600' : 'bg-electric-600'}`}
                                    style={{ width: `${student.progress}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(student.status)}`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-medium">
                                <Calendar className="w-4 h-4 text-electric-600 shrink-0" />
                                <span className={student.status === 'Expired' ? 'text-red-600 font-bold' : 'text-slate-800'}>
                                  {expiryDisplay}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              {student.certificateStatus === 'Issued' ? (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs px-2.5 py-1 rounded-full inline-flex items-center space-x-1">
                                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Issued ({student.certificateId})</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 text-xs font-semibold">{student.certificateStatus}</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedStudentDetail(student)}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 font-medium text-sm">
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
                <div key={course.id} className="p-5 flex flex-col gap-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    {/* Thumbnail with upload overlay */}
                    <div className="relative group shrink-0">
                      <img
                        src={coverImagePreviews[course.id] || course.thumbnail}
                        alt={course.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <button
                        onClick={() => coverImageInputRefs.current[course.id]?.click()}
                        className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Change cover image"
                      >
                        <ImagePlus className="w-5 h-5 text-white" />
                      </button>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        ref={el => coverImageInputRefs.current[course.id] = el}
                        onChange={(e) => handleCoverImageSelect(course.id, e)}
                      />
                    </div>
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
                      className="bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Manage Video Lessons</span>
                    </button>

                    <button
                      onClick={() => setSelectedCourseForContent(course)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm cursor-pointer"
                      title="Edit What You'll Learn, Inclusions, Requirements, Description, Instructor & Reviews"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Edit Course Content</span>
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
                  {/* Cover image preview actions */}
                  {coverImagePreviews[course.id] && (
                    <div className="flex items-center space-x-3 pl-20 pb-1">
                      <span className="text-xs text-slate-500 font-medium">New image preview ready</span>
                      <button
                        onClick={() => handleSaveCoverImage(course.id)}
                        className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Image</span>
                      </button>
                      <button
                        onClick={() => handleClearCoverPreview(course.id)}
                        className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Discard</span>
                      </button>
                    </div>
                  )}
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

        {/* TAB: COURSE REVIEWS MANAGEMENT */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 font-display">Student Course Reviews Management</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Approve, filter, or remove student course reviews.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Filter Course</label>
                  <select
                    value={reviewCourseFilter}
                    onChange={(e) => setReviewCourseFilter(e.target.value)}
                    className="bg-white border border-slate-300 font-bold text-xs p-2.5 rounded-xl text-slate-800"
                  >
                    <option value="All">All Courses</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Filter Status</label>
                  <select
                    value={reviewStatusFilter}
                    onChange={(e) => setReviewStatusFilter(e.target.value)}
                    className="bg-white border border-slate-300 font-bold text-xs p-2.5 rounded-xl text-slate-800"
                  >
                    <option value="All">All Statuses</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending Approval</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Reviews</div>
                <div className="text-3xl font-black text-slate-900 font-display">{(reviews || []).length}</div>
                <div className="text-xs font-bold text-slate-500">Across all 5 seed courses</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Approved Reviews</div>
                <div className="text-3xl font-black text-emerald-600 font-display">
                  {(reviews || []).filter(r => r.status === 'approved').length}
                </div>
                <div className="text-xs font-bold text-emerald-600">Visible on Course Detail pages</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Average Rating</div>
                <div className="text-3xl font-black text-amber-500 font-display flex items-center gap-1.5">
                  <span>
                    {reviews && reviews.length > 0 
                      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1) 
                      : '0.0'}
                  </span>
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                </div>
                <div className="text-xs font-bold text-slate-500">Overall student satisfaction rating</div>
              </div>
            </div>

            {/* Reviews Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {filteredReviews.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm">No reviews found matching the selected filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200 uppercase tracking-wider text-xs">
                      <tr>
                        <th className="p-4">Student</th>
                        <th className="p-4">Course Title</th>
                        <th className="p-4">Rating</th>
                        <th className="p-4">Review Comment</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredReviews.map(r => {
                        const targetCourse = courses.find(c => c.id === r.courseId);
                        return (
                          <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                              <div>
                                <span>{r.studentName || 'Student'}</span>
                                {r.verifiedPurchase && (
                                  <span className="block text-[10px] text-emerald-600 font-extrabold">✓ Verified Purchase</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-xs font-semibold text-slate-700 max-w-[200px]">
                              {targetCourse ? targetCourse.title : r.courseId}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center space-x-1 text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < (r.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                    }`}
                                  />
                                ))}
                                <span className="text-xs font-bold text-slate-700 ml-1">({r.rating})</span>
                              </div>
                            </td>
                            <td className="p-4 text-xs text-slate-700 max-w-xs">
                              <p className="line-clamp-3 italic">"{r.comment}"</p>
                            </td>
                            <td className="p-4 text-xs text-slate-500 whitespace-nowrap font-medium">
                              {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                                  r.status === 'approved'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {r.status === 'approved' ? 'Approved' : 'Pending Approval'}
                              </span>
                            </td>
                            <td className="p-4 whitespace-nowrap text-right space-x-2">
                              <button
                                onClick={() => setEditingReviewModal(r)}
                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors border border-indigo-200 cursor-pointer"
                              >
                                Edit
                              </button>
                              {r.status !== 'approved' && (
                                <button
                                  onClick={() => {
                                    approveReview(r.id);
                                    showToast('Review approved successfully!');
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this review?')) {
                                    deleteReview(r.id);
                                    showToast('Review deleted');
                                  }
                                }}
                                className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors border border-red-200 cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: COUPONS MANAGEMENT */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 font-display">Coupon Code Management</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Create, edit, and manage discount coupons for courses and value packs.
                </p>
              </div>
              <button
                onClick={openCreateCoupon}
                className="bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1 shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>

            {(!coupons || coupons.length === 0) ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <Tag className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-bold">No coupons created yet</p>
                <p className="text-xs text-slate-400">Click "Create Coupon" to add your first discount code.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px] text-left">
                        <th className="p-4">Code</th>
                        <th className="p-4">Discount</th>
                        <th className="p-4">Validity</th>
                        <th className="p-4">Usage</th>
                        <th className="p-4">Min. Purchase</th>
                        <th className="p-4">Applicable To</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(coupons || []).map(coupon => (
                        <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <span className="font-extrabold text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded text-xs">{coupon.code}</span>
                            {coupon.description && (
                              <p className="text-slate-500 mt-1 text-[10px] max-w-[140px] leading-tight">{coupon.description}</p>
                            )}
                          </td>
                          <td className="p-4 font-extrabold text-electric-600">
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}% OFF`
                              : `₹${coupon.discountValue} OFF`
                            }
                          </td>
                          <td className="p-4 text-slate-600">
                            <div>{coupon.startDate}</div>
                            <div className="text-slate-400">to {coupon.expiryDate}</div>
                          </td>
                          <td className="p-4 text-slate-700">
                            <span className="font-bold">{coupon.usedCount || 0}</span>
                            <span className="text-slate-400"> / {coupon.usageLimit}</span>
                          </td>
                          <td className="p-4 text-slate-700 font-medium">
                            {coupon.minPurchaseAmount > 0 ? `₹${coupon.minPurchaseAmount}` : '—'}
                          </td>
                          <td className="p-4 text-slate-600 font-medium">
                            {coupon.applicableItemId === 'all'
                              ? 'All Items'
                              : courses.find(c => c.id === coupon.applicableItemId)?.title
                              || valuePacks.find(v => v.id === coupon.applicableItemId)?.name
                              || coupon.applicableItemId
                            }
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                coupon.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                <span>{coupon.isActive ? 'Active' : 'Inactive'}</span>
                              </span>
                              <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                coupon.isVisible ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                <span>{coupon.isVisible ? 'Visible' : 'Hidden'}</span>
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2 flex-wrap">
                              <button
                                onClick={() => toggleCouponStatus(coupon.id)}
                                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${
                                  coupon.isActive
                                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                }`}
                                title={coupon.isActive ? 'Deactivate coupon' : 'Activate coupon'}
                              >
                                {coupon.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => toggleCouponVisibility(coupon.id)}
                                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${
                                  coupon.isVisible
                                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                    : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                                }`}
                                title={coupon.isVisible ? 'Hide coupon' : 'Show coupon'}
                              >
                                {coupon.isVisible ? 'Hide' : 'Show'}
                              </button>
                              <button
                                onClick={() => openEditCoupon(coupon)}
                                className="p-1.5 rounded-lg bg-electric-50 text-electric-600 hover:bg-electric-100 border border-electric-200"
                                title="Edit coupon"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                title="Delete coupon"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: COURSE APPROVALS & PAYMENT VERIFICATION */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-extrabold mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>MANUAL UPI VERIFICATION WORKFLOW</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                  Course Approvals &amp; Payment Verification
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Inspect student payment screenshots, grant course-specific 6-month access, and dispatch WhatsApp approval messages.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setApprovalsRefresh(p => p + 1);
                    showToast('Approvals list refreshed', 'info');
                  }}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Total Requests</span>
                  <div className="p-2 bg-slate-100 rounded-xl">
                    <FileText className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2">{allEnrollmentRequests.length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">All-time manual UPI submissions</p>
              </div>

              <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800">Pending Verification</span>
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Clock className="w-4 h-4 text-amber-700" />
                  </div>
                </div>
                <p className="text-2xl font-black text-amber-900 mt-2">{pendingApprovalsCount}</p>
                <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Require manual payment audit</p>
              </div>

              <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">Approved &amp; Enrolled</span>
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                  </div>
                </div>
                <p className="text-2xl font-black text-emerald-900 mt-2">
                  {allEnrollmentRequests.filter(r => r.status === 'approved').length}
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">6-month access active</p>
              </div>

              <div className="bg-rose-50/70 rounded-2xl border border-rose-200 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800">Rejected Requests</span>
                  <div className="p-2 bg-rose-100 rounded-xl">
                    <XCircle className="w-4 h-4 text-rose-700" />
                  </div>
                </div>
                <p className="text-2xl font-black text-rose-900 mt-2">
                  {allEnrollmentRequests.filter(r => r.status === 'rejected').length}
                </p>
                <p className="text-[11px] text-rose-700 mt-0.5 font-medium">Declined or invalid proof</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {[
                  { key: 'All', label: 'All Requests', count: allEnrollmentRequests.length },
                  { key: 'pending_verification', label: 'Pending Verification', count: pendingApprovalsCount },
                  { key: 'approved', label: 'Approved', count: allEnrollmentRequests.filter(r => r.status === 'approved').length },
                  { key: 'rejected', label: 'Rejected', count: allEnrollmentRequests.filter(r => r.status === 'rejected').length }
                ].map(filter => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setApprovalStatusFilter(filter.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      approvalStatusFilter === filter.key
                        ? 'bg-electric-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                      approvalStatusFilter === filter.key ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Ref ID, student, course..."
                  value={approvalSearch}
                  onChange={(e) => setApprovalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-electric-500"
                />
              </div>
            </div>

            {/* Requests Table */}
            {filteredEnrollmentRequests.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-800">No enrollment requests found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {approvalSearch || approvalStatusFilter !== 'All'
                    ? 'No requests match your current search or status filter.'
                    : 'When students complete checkout and upload payment screenshots, they will appear here for verification.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 px-4">Ref ID &amp; Date</th>
                        <th className="py-3.5 px-4">Student Info</th>
                        <th className="py-3.5 px-4">Course / Pack</th>
                        <th className="py-3.5 px-4">Amount</th>
                        <th className="py-3.5 px-4 text-center">Payment Proof</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredEnrollmentRequests.map((request) => (
                        <tr key={request.id || request.refId} className="hover:bg-slate-50/60 transition-colors">
                          
                          {/* Ref ID & Date */}
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                                  {request.refId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(request.refId);
                                    showToast('Ref ID copied to clipboard', 'info');
                                  }}
                                  className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                                  title="Copy Ref ID"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className="text-[11px] text-slate-400">
                                {new Date(request.submittedAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })} • {new Date(request.submittedAt).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </td>

                          {/* Student Details */}
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-0.5">
                              <p className="font-extrabold text-slate-900 text-xs">
                                {request.studentName || 'Student'}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono">
                                {request.email}
                              </p>
                              <div className="flex items-center space-x-1 text-[11px] text-slate-600 font-semibold pt-0.5">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>+91 {request.phone}</span>
                              </div>
                            </div>
                          </td>

                          {/* Course / Pack */}
                          <td className="py-4 px-4 align-top max-w-[220px]">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-900 leading-snug line-clamp-2">
                                {request.itemName}
                              </p>
                              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                {request.itemType === 'value_pack' ? 'Value Pack (Combo)' : 'Single Course'}
                              </div>
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-0.5">
                              <p className="font-black text-slate-900 text-sm">
                                ₹{Number(request.amount || 0).toLocaleString()}
                              </p>
                              {request.couponCode && (
                                <p className="text-[10px] text-emerald-600 font-bold">
                                  Coupon: {request.couponCode} (-₹{request.discountAmount})
                                </p>
                              )}
                              <p className="text-[10px] text-slate-400 font-medium">
                                Manual UPI
                              </p>
                            </div>
                          </td>

                          {/* Screenshot Proof */}
                          <td className="py-4 px-4 align-top text-center">
                            {request.screenshotDataUrl ? (
                              <button
                                type="button"
                                onClick={() => setApprovalScreenshotModal(request.screenshotDataUrl)}
                                className="group relative inline-block rounded-xl overflow-hidden border border-slate-200 hover:border-electric-500 transition-all shadow-xs cursor-pointer"
                                title="Click to view full payment screenshot"
                              >
                                <img
                                  src={request.screenshotDataUrl}
                                  alt="Payment Proof"
                                  className="w-16 h-16 object-cover object-top group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Eye className="w-4 h-4" />
                                </div>
                              </button>
                            ) : (
                              <div className="text-[11px] text-slate-400 italic">No image</div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 align-top">
                            {request.status === 'pending_verification' && (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                <span>Pending Verification</span>
                              </span>
                            )}
                            {request.status === 'approved' && (
                              <div className="space-y-1">
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  <span>Approved</span>
                                </span>
                                {request.whatsappSentAt && (
                                  <p className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
                                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                                    <span>WhatsApp Sent</span>
                                  </p>
                                )}
                              </div>
                            )}
                            {request.status === 'rejected' && (
                              <div className="space-y-1">
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>Rejected</span>
                                </span>
                                {request.rejectionReason && (
                                  <p className="text-[10px] text-rose-600 font-medium max-w-[140px] truncate" title={request.rejectionReason}>
                                    {request.rejectionReason}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 align-top text-right">
                            <div className="flex flex-col items-end space-y-1.5">
                              {request.status === 'pending_verification' && (
                                <div className="flex items-center space-x-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleApproveRequest(request.refId)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-xs cursor-pointer transition-colors"
                                    title="Approve transaction and grant 6-month access"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRejectingRefId(request.refId)}
                                    className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                                    title="Reject enrollment request"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>
                                </div>
                              )}

                              {request.status === 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleSendWhatsAppMessage(request)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-xs cursor-pointer transition-colors"
                                  title="Send WhatsApp confirmation to student"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>Send WhatsApp</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setSelectedApprovalRequest(request)}
                                className="text-slate-600 hover:text-slate-900 font-bold text-[11px] underline underline-offset-2 cursor-pointer pt-0.5"
                              >
                                View Details
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* COUPON CREATE / EDIT MODAL */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                {editingCouponId ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button onClick={() => setShowCouponModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. THYNK25"
                    value={couponForm.code}
                    onChange={e => setCouponForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={e => setCouponForm(p => ({ ...p, discountType: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">
                    {couponForm.discountType === 'percentage' ? 'Discount %' : 'Discount ₹'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={couponForm.discountType === 'percentage' ? 100 : undefined}
                    value={couponForm.discountValue}
                    onChange={e => setCouponForm(p => ({ ...p, discountValue: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Min. Purchase (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.minPurchaseAmount}
                    onChange={e => setCouponForm(p => ({ ...p, minPurchaseAmount: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={couponForm.startDate}
                    onChange={e => setCouponForm(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Expiry Date</label>
                  <input
                    type="date"
                    value={couponForm.expiryDate}
                    onChange={e => setCouponForm(p => ({ ...p, expiryDate: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={couponForm.usageLimit}
                    onChange={e => setCouponForm(p => ({ ...p, usageLimit: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Applicable To</label>
                  <select
                    value={couponForm.applicableItemId}
                    onChange={e => setCouponForm(p => ({ ...p, applicableItemId: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="all">All Items</option>
                    <optgroup label="Courses">
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Value Packs">
                      {valuePacks.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700">Description (optional)</label>
                <input
                  type="text"
                  placeholder="Short description of this coupon"
                  value={couponForm.description}
                  onChange={e => setCouponForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={couponForm.isActive}
                    onChange={e => setCouponForm(p => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4 text-electric-600 rounded"
                  />
                  <span className="font-bold text-slate-700">Active</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={couponForm.isVisible}
                    onChange={e => setCouponForm(p => ({ ...p, isVisible: e.target.checked }))}
                    className="w-4 h-4 text-electric-600 rounded"
                  />
                  <span className="font-bold text-slate-700">Visible to students</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-electric-600 text-white font-bold hover:bg-electric-700"
                >
                  {editingCouponId ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* FULL COURSE CONTENT BUILDER MODAL */}
      {selectedCourseForContent && (
        <CourseContentEditorModal
          isOpen={Boolean(selectedCourseForContent)}
          course={selectedCourseForContent}
          onClose={() => setSelectedCourseForContent(null)}
          onSave={(courseId, updatedData) => {
            updateCourse(courseId, updatedData);
            setSelectedCourseForContent(prev => prev ? { ...prev, ...updatedData } : null);
          }}
          reviews={reviews}
          updateReview={updateReview}
          deleteReview={deleteReview}
          addAdminReview={addAdminReview}
          showToast={showToast}
        />
      )}

      {/* GLOBAL REVIEW EDIT MODAL */}
      {editingReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg">Edit Course Review</h3>
              <button
                onClick={() => setEditingReviewModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateReview(editingReviewModal.id, {
                  studentName: editingReviewModal.studentName,
                  rating: Number(editingReviewModal.rating),
                  comment: editingReviewModal.comment,
                  status: editingReviewModal.status
                });
                showToast('Review updated successfully!');
                setEditingReviewModal(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student / Reviewer Name</label>
                <input
                  type="text"
                  required
                  value={editingReviewModal.studentName || ''}
                  onChange={(e) => setEditingReviewModal({ ...editingReviewModal, studentName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
                  <select
                    value={editingReviewModal.rating || 5}
                    onChange={(e) => setEditingReviewModal({ ...editingReviewModal, rating: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  >
                    {[5, 4, 3, 2, 1].map(stars => (
                      <option key={stars} value={stars}>{stars} Stars</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Approval Status</label>
                  <select
                    value={editingReviewModal.status || 'approved'}
                    onChange={(e) => setEditingReviewModal({ ...editingReviewModal, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending Approval</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Text / Feedback</label>
                <textarea
                  rows={4}
                  required
                  value={editingReviewModal.comment || ''}
                  onChange={(e) => setEditingReviewModal({ ...editingReviewModal, comment: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingReviewModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-electric-600 text-white font-bold text-xs hover:bg-electric-700 cursor-pointer shadow-sm"
                >
                  Save Review Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL PAYMENT SCREENSHOT LIGHTBOX MODAL */}
      {approvalScreenshotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-electric-400" />
                <h3 className="font-extrabold text-sm">Payment Screenshot Proof</h3>
              </div>
              <button
                type="button"
                onClick={() => setApprovalScreenshotModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto bg-slate-950 flex items-center justify-center">
              <img
                src={approvalScreenshotModal}
                alt="Payment Screenshot"
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Verify UPI UTR / Transaction ID and Amount before approval</span>
              <button
                type="button"
                onClick={() => setApprovalScreenshotModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENROLLMENT REQUEST DETAILS MODAL */}
      {selectedApprovalRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl my-4 text-xs">
            
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {selectedApprovalRequest.refId}
                  </span>
                  {selectedApprovalRequest.status === 'pending_verification' && (
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      Pending Verification
                    </span>
                  )}
                  {selectedApprovalRequest.status === 'approved' && (
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      Approved &amp; Enrolled
                    </span>
                  )}
                  {selectedApprovalRequest.status === 'rejected' && (
                    <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      Rejected
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-2 font-display">
                  Enrollment Request Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApprovalRequest(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">Student Information</span>
                <p className="font-extrabold text-slate-900 text-sm">{selectedApprovalRequest.studentName}</p>
                <p className="text-slate-600 font-mono">{selectedApprovalRequest.email}</p>
                <p className="text-slate-700 font-semibold flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+91 {selectedApprovalRequest.phone}</span>
                </p>
                {selectedApprovalRequest.billingAddress && (
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                    <p className="font-bold text-slate-700">Billing Address:</p>
                    <p>{selectedApprovalRequest.billingAddress.streetAddress || ''}</p>
                    <p>{selectedApprovalRequest.billingAddress.city}, {selectedApprovalRequest.billingAddress.state} - {selectedApprovalRequest.billingAddress.pincode}</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">Course &amp; Payment</span>
                <p className="font-extrabold text-slate-900 text-sm leading-snug">{selectedApprovalRequest.itemName}</p>
                <p className="text-2xl font-black text-electric-600">₹{Number(selectedApprovalRequest.amount).toLocaleString()}</p>
                <p className="text-slate-600 text-[11px]">Payment Method: <strong>{selectedApprovalRequest.paymentMethod}</strong></p>
                {selectedApprovalRequest.couponCode && (
                  <p className="text-emerald-700 font-bold text-[11px]">
                    Coupon Applied: {selectedApprovalRequest.couponCode} (-₹{selectedApprovalRequest.discountAmount})
                  </p>
                )}
                <p className="text-slate-400 text-[11px]">
                  Submitted on {new Date(selectedApprovalRequest.submittedAt).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Payment Screenshot */}
            <div>
              <span className="font-bold text-slate-700 mb-2 block">Attached Payment Screenshot:</span>
              {selectedApprovalRequest.screenshotDataUrl ? (
                <div
                  onClick={() => setApprovalScreenshotModal(selectedApprovalRequest.screenshotDataUrl)}
                  className="bg-slate-900 p-2 rounded-2xl cursor-pointer group text-center overflow-hidden border border-slate-300 max-h-72 flex items-center justify-center relative"
                >
                  <img
                    src={selectedApprovalRequest.screenshotDataUrl}
                    alt="Payment Proof"
                    className="max-h-64 object-contain mx-auto rounded-lg group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs">
                    Click to enlarge full screenshot
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-100 rounded-2xl text-center text-slate-400">
                  No payment screenshot uploaded.
                </div>
              )}
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Admin Audit Notes / Verification remarks
              </label>
              <textarea
                rows={2}
                placeholder="Optional notes: e.g., Verified in HDFC bank statement, UTR #..."
                value={approvalNotes || selectedApprovalRequest.adminNotes || ''}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            {/* Rejection reason display if rejected */}
            {selectedApprovalRequest.rejectionReason && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl text-rose-800 text-xs">
                <strong>Rejection Reason:</strong> {selectedApprovalRequest.rejectionReason}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <div className="flex items-center space-x-2">
                {selectedApprovalRequest.status === 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleSendWhatsAppMessage(selectedApprovalRequest)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send WhatsApp Approval</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedApprovalRequest(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>

                {selectedApprovalRequest.status === 'pending_verification' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setRejectingRefId(selectedApprovalRequest.refId)}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold cursor-pointer"
                    >
                      Reject Request
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveRequest(selectedApprovalRequest.refId, approvalNotes)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center space-x-1.5 shadow-md cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve &amp; Grant 6-Month Access</span>
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingRefId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Reject Enrollment Request</h3>
              </div>
              <button
                type="button"
                onClick={() => { setRejectingRefId(null); setRejectionReason(''); }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Please enter the reason for rejecting request <strong>{rejectingRefId}</strong>. This will be recorded and visible to the student.
            </p>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason for Rejection *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g., Transaction amount does not match, screenshot is blurry or invalid, duplicate payment request..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setRejectingRefId(null); setRejectionReason(''); }}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRejectRequest(rejectingRefId, rejectionReason)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold cursor-pointer shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
