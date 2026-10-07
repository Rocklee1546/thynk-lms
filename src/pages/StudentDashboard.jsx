import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLMS } from '../context/LMSContext';
import { changeUserPassword, logoutAllDevices } from '../services/authService';
import { getCommunicationConsent, updateCommunicationConsent } from '../services/reminderService';
import { 
  BookOpen, 
  PlayCircle, 
  Award, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  User, 
  Bell, 
  FileText,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Lock,
  LogOut,
  Smartphone,
  Mail,
  AlertTriangle,
  RefreshCw,
  Sliders
} from 'lucide-react';

export default function StudentDashboard() {
  const { 
    currentUser, 
    courses, 
    liveSessions, 
    certificates, 
    checkCourseAccess, 
    openAuthModal, 
    logout, 
    showToast 
  } = useLMS();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('courses');

  // Security Form State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: '', success: '' });

  // Communication Preferences State
  const initialConsent = currentUser ? getCommunicationConsent(currentUser.id) : { whatsapp: true, email: true };
  const [commPrefs, setCommPrefs] = useState(initialConsent);
  const [prefsSaved, setPrefsSaved] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md space-y-4 shadow-xl">
          <User className="w-12 h-12 text-electric-600 mx-auto" />
          <h2 className="font-extrabold text-slate-900 text-xl">Please Login to Access Student LMS</h2>
          <p className="text-xs text-slate-500">Sign in with your student account to view enrolled courses, progress & certificates.</p>
          <button
            onClick={() => openAuthModal('/dashboard', 'signin')}
            className="bg-electric-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md"
          >
            Sign In with OTP / Password
          </button>
        </div>
      </div>
    );
  }

  // Get enrolled courses objects
  const enrolledCourses = courses.filter(c => currentUser.enrolledCourseIds?.includes(c.id));

  // Compute progress stats
  const computeCourseProgress = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.modules) return 0;
    
    let totalLessons = 0;
    course.modules.forEach(m => {
      totalLessons += m.lessons?.length || 0;
    });

    if (totalLessons === 0) return 0;

    const userProg = currentUser.progress?.[courseId];
    const completedCount = userProg?.completedLessonIds?.length || 0;

    return Math.min(100, Math.round((completedCount / totalLessons) * 100));
  };

  const studentCertificates = certificates.filter(c => c.studentName === currentUser.name || currentUser.role === 'student');

  // Change password handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, error: '', success: '' });

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ loading: false, error: 'New password must be at least 6 characters long', success: '' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ loading: false, error: 'New passwords do not match', success: '' });
      return;
    }

    const res = await changeUserPassword(currentUser.id, passwordForm.oldPassword, passwordForm.newPassword);
    if (res.success) {
      setPasswordStatus({ loading: false, error: '', success: 'Password changed successfully!' });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password updated securely');
    } else {
      setPasswordStatus({ loading: false, error: res.message, success: '' });
    }
  };

  // Logout from all devices handler
  const handleLogoutAllDevices = async () => {
    if (window.confirm('Are you sure you want to log out of all active devices? You will be signed out.')) {
      await logoutAllDevices(currentUser.id);
      showToast('Logged out of all devices');
      logout();
      navigate('/');
    }
  };

  // Save Communication Preferences
  const handleSaveCommPrefs = (e) => {
    e.preventDefault();
    updateCommunicationConsent(currentUser.id, commPrefs);
    setPrefsSaved(true);
    showToast('Communication preferences updated');
    setTimeout(() => setPrefsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Student Welcome Banner */}
        <div className="bg-brand-navy text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-electric-600/15 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="space-y-2 text-center md:text-left relative z-10">
            <div className="inline-flex items-center space-x-1.5 bg-electric-600/30 text-sky-300 border border-electric-500/30 px-3 py-1 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>STUDENT LEARNING PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome Back, {currentUser.name}! 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Language: <strong>Tamil (தமிழ்)</strong> • Enrolled in {enrolledCourses.length} Program(s)
            </p>
          </div>

          <div className="flex items-center space-x-3 relative z-10 shrink-0">
            {enrolledCourses.length > 0 && (
              <Link
                to={`/player/${enrolledCourses[0].id}`}
                className="bg-electric-600 hover:bg-electric-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg shadow-electric-600/30 flex items-center space-x-2 transition-all"
              >
                <PlayCircle className="w-4 h-4" />
                <span>CONTINUE LEARNING</span>
              </Link>
            )}
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto space-x-6 text-sm font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 flex items-center space-x-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'courses' ? 'border-electric-600 text-electric-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>My Courses ({enrolledCourses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('doubt')}
            className={`pb-3 flex items-center space-x-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'doubt' ? 'border-electric-600 text-electric-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Live Doubt Sessions</span>
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`pb-3 flex items-center space-x-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'certificates' ? 'border-electric-600 text-electric-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Certificates ({studentCertificates.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('internship')}
            className={`pb-3 flex items-center space-x-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'internship' ? 'border-electric-600 text-electric-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Internship Portal</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 flex items-center space-x-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'security' ? 'border-electric-600 text-electric-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security & Devices</span>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`pb-3 flex items-center space-x-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'preferences' ? 'border-electric-600 text-electric-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Communications</span>
          </button>
        </div>

        {/* TAB 1: MY COURSES */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900">Enrolled Programs & 6-Month Validity</h2>
            
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledCourses.map(course => {
                  const progPercent = computeCourseProgress(course.id);
                  const access = checkCourseAccess(course.id);

                  return (
                    <div key={course.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
                      
                      <div className="flex items-start space-x-4">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-20 h-20 rounded-2xl object-cover shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-extrabold bg-electric-50 text-electric-600 px-2 py-0.5 rounded uppercase">
                              TAMIL
                            </span>
                            {access.isExpired ? (
                              <span className="text-[10px] font-extrabold bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                EXPIRED
                              </span>
                            ) : (
                              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                                ACTIVE ({access.daysRemaining} DAYS LEFT)
                              </span>
                            )}
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-base line-clamp-1">{course.title}</h3>
                          <p className="text-xs text-slate-500">{course.duration} Recorded Video Training</p>
                        </div>
                      </div>

                      {/* 6 Calendar Months Expiry Banner */}
                      <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                        access.isExpired
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <Calendar className={`w-4 h-4 ${access.isExpired ? 'text-red-600' : 'text-electric-600'}`} />
                          <span>
                            {access.isExpired 
                              ? `Access Expired on: ${access.expiryFormatted}`
                              : `6-Month Access Valid Until: ${access.expiryFormatted}`
                            }
                          </span>
                        </div>
                        {access.isExpired && (
                          <Link
                            to={`/checkout?course=${course.id}`}
                            className="text-red-700 font-extrabold underline text-[11px]"
                          >
                            Renew Access
                          </Link>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600">Course Progress</span>
                          <span className="text-electric-600">{progPercent}% Completed</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-electric-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                        <span className="text-[11px] text-slate-500 font-semibold">
                          Includes Live QA & Certificate
                        </span>
                        <Link
                          to={`/player/${course.id}`}
                          className="bg-electric-600 hover:bg-electric-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-1"
                        >
                          <span>OPEN COURSE PLAYER</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-3">
                <p className="text-sm text-slate-600">You are not enrolled in any courses yet.</p>
                <Link to="/courses" className="bg-electric-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl inline-block">
                  Explore Courses
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE DOUBT SESSIONS */}
        {activeTab === 'doubt' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900">Upcoming Live Doubt Solving Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {liveSessions.map(session => (
                <div key={session.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-50 text-emerald-600 font-extrabold text-[10px] px-2.5 py-0.5 rounded uppercase">
                      {session.status}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{session.date} • {session.time}</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">{session.title}</h3>
                  <p className="text-xs text-slate-600">Mentor: {session.mentorName}</p>

                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors"
                  >
                    <span>JOIN GOOGLE MEET SESSION</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900">Your Shareable Certificates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studentCertificates.map(cert => (
                <div key={cert.certificateId} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-electric-600 bg-electric-50 px-2.5 py-0.5 rounded">
                      ID: {cert.certificateId}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Issued: {cert.issueDate}</span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base">{cert.courseTitle}</h3>
                  <p className="text-xs text-slate-600">Student Name: {cert.studentName}</p>

                  <Link
                    to={`/verify-certificate?id=${cert.certificateId}`}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1 transition-colors"
                  >
                    <span>VIEW & VERIFY CERTIFICATE</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INTERNSHIP & PROJECTS PORTAL */}
        {activeTab === 'internship' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-slate-800">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Internship & Practical Projects Portal</h2>
              <p className="text-xs text-slate-500 mt-1">
                Internship eligibility requires 100% video completion, a submitted practical project, and a passed module quiz (80%+ score).
              </p>
            </div>

            {enrolledCourses.length > 0 ? (
              enrolledCourses.map(course => {
                const eligibility = checkInternshipEligibility ? checkInternshipEligibility(course.id) : { isEligible: false, missing: [] };
                
                return (
                  <div key={course.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-5">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                      <div>
                        <span className="text-[10px] font-extrabold text-electric-600 uppercase bg-electric-50 px-2.5 py-0.5 rounded">
                          {course.category}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-base mt-1">{course.title}</h3>
                      </div>

                      <div>
                        {eligibility.isEligible ? (
                          <span className="bg-emerald-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full inline-flex items-center space-x-1.5 shadow-md">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>INTERNSHIP ELIGIBLE ✓</span>
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 font-extrabold text-xs px-3.5 py-1.5 rounded-full inline-flex items-center space-x-1.5 border border-amber-300">
                            <Clock className="w-4 h-4 text-amber-700" />
                            <span>NOT ELIGIBLE YET ({eligibility.missing?.length} requirement(s) pending)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3 Criteria Progress Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                      
                      {/* Criterion 1: 100% Videos */}
                      <div className={`p-4 rounded-xl border ${eligibility.isVideo100Percent ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-white border-slate-200 text-slate-700'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">REQUIREMENT 1</span>
                          {eligibility.isVideo100Percent ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <h4 className="font-extrabold text-sm">100% Video Lessons</h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {eligibility.isVideo100Percent ? 'All course videos completed at 100%.' : 'Must watch 100% of required videos.'}
                        </p>
                      </div>

                      {/* Criterion 2: Project Submission */}
                      <div className={`p-4 rounded-xl border ${eligibility.isProjectSubmitted ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-white border-slate-200 text-slate-700'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">REQUIREMENT 2</span>
                          {eligibility.isProjectSubmitted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <h4 className="font-extrabold text-sm">Practical Project</h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {eligibility.isProjectSubmitted ? 'Project submitted successfully!' : 'Submit your live audit project below.'}
                        </p>
                      </div>

                      {/* Criterion 3: Passed Quiz */}
                      <div className={`p-4 rounded-xl border ${eligibility.isQuizPassed ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-white border-slate-200 text-slate-700'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">REQUIREMENT 3</span>
                          {eligibility.isQuizPassed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Award className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <h4 className="font-extrabold text-sm">Module Quiz (80%+)</h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {eligibility.isQuizPassed ? 'Quiz passed with 80%+ score.' : 'Must pass final module quiz.'}
                        </p>
                      </div>

                    </div>

                    {/* Action Form / Application Trigger */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                      {eligibility.isEligible ? (
                        <button
                          onClick={() => showToast('🎉 Internship Application Submitted! Our team will contact you within 48 hours.')}
                          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition-all"
                        >
                          APPLY FOR INTERNSHIP NOW
                        </button>
                      ) : (
                        <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 w-full flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Pending requirements: {eligibility.missing?.join(' • ')}</span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="text-center p-8 bg-slate-50 rounded-2xl text-slate-500 text-xs">
                Enroll in a course to view internship requirements & project submission links.
              </div>
            )}

          </div>
        )}

        {/* TAB 5: SECURITY & DEVICES */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Change Password Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-electric-50 text-electric-600 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Change Password</h3>
                  <p className="text-xs text-slate-500">Update your account password for multi-device security.</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
                {passwordStatus.error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
                    {passwordStatus.error}
                  </div>
                )}
                {passwordStatus.success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-medium">
                    {passwordStatus.success}
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    required
                    placeholder="Enter current password"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">New Password (min 6 characters)</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    placeholder="Enter new password"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    placeholder="Repeat new password"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordStatus.loading}
                  className="w-full bg-electric-600 hover:bg-electric-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all"
                >
                  {passwordStatus.loading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            </div>

            {/* Multi-Device Management Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Device & Session Security</h3>
                    <p className="text-xs text-slate-500">Manage your active LMS login sessions across devices.</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Current Active Session</span>
                    <span className="text-emerald-600 text-[10px] bg-emerald-50 px-2 py-0.5 rounded uppercase">Active Now</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Web Browser • Windows / Desktop</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  If you suspect unauthorized access or used a public computer, you can revoke all sessions immediately.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogoutAllDevices}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold text-xs py-3.5 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of All Devices</span>
              </button>
            </div>

          </div>
        )}

        {/* TAB 6: COMMUNICATION & REMINDER PREFERENCES */}
        {activeTab === 'preferences' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl space-y-6 text-xs">
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Communication & Reminder Preferences</h3>
              <p className="text-slate-500">Manage how THYNK LMS contacts you regarding course access, upcoming live QA sessions, and offers.</p>
            </div>

            <form onSubmit={handleSaveCommPrefs} className="space-y-4">
              <label className="flex items-start space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={commPrefs.whatsapp}
                  onChange={(e) => setCommPrefs({ ...commPrefs, whatsapp: e.target.checked })}
                  className="w-4 h-4 text-electric-600 rounded mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900 block text-xs">WhatsApp Updates & Reminders</span>
                  <span className="text-[11px] text-slate-500">Receive instant course link notifications, live doubt session reminders, and important announcements.</span>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={commPrefs.email}
                  onChange={(e) => setCommPrefs({ ...commPrefs, email: e.target.checked })}
                  className="w-4 h-4 text-electric-600 rounded mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Email Notifications & Invoices</span>
                  <span className="text-[11px] text-slate-500">Receive payment receipts, enrollment confirmations, and monthly skill digests.</span>
                </div>
              </label>

              {prefsSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-medium">
                  Preferences updated successfully!
                </div>
              )}

              <button
                type="submit"
                className="bg-electric-600 hover:bg-electric-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all"
              >
                Save Preferences
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
