// ====================================================================
// THYNK LMS — FULL SCREEN AUTHENTICATION PAGE
// Dedicated full-screen authentication panel with Left Visual Section
// and Right Authentication Section featuring distinct Sign Up and Log In flows.
// ====================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useLMS } from '../context/LMSContext';
import {
  ArrowLeft, X, ShieldCheck, Sparkles, ArrowRight,
  Mail, Phone, Lock, RefreshCw, AlertCircle,
  CheckCircle2, Eye, EyeOff, User, Globe
} from 'lucide-react';
import {
  requestOtp, verifyOtp, registerNewUser,
  loginWithPassword, resetPasswordWithOtp,
  loginWithGoogleAccount, isValidEmail, isValidIndianMobile,
  sanitizeMobile10, completeUserProfilePhone,
  maskPhone, maskEmail,
  getPendingSignupSession, setPendingSignupSession, clearPendingSignupSession
} from '../services/authService';
import { signInWithGoogleOAuth } from '../services/supabaseClient';

const QUOTES = [
  { text: "Learn the skills. Build the experience.", sub: "Practical Digital Marketing in Tamil" },
  { text: "Don't just watch tutorials. Build real skills.", sub: "Real Client Projects & Ad Spend Simulations" },
  { text: "Your skills shouldn't cost a fortune.", sub: "High quality career programs for South Indian students" },
  { text: "From student to career digital marketer.", sub: "Verifiable certificates & merit internships" }
];

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCurrentUser, showToast } = useLMS();

  const redirectPath = searchParams.get('redirect') || null;
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  // Active Flow: 'signup' (NEW USER) | 'login' (EXISTING USER) | 'forgot_password'
  const [flow, setFlow] = useState(initialMode);

  // ── SIGN UP STATE ──────────────────────────────────────
  const [signupStep, setSignupStep] = useState('details'); // 'details' | 'password' | 'google-phone'
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [passTouched, setPassTouched] = useState(false);
  const [confirmPassTouched, setConfirmPassTouched] = useState(false);
  const [signupOtp, setSignupOtp] = useState(['', '', '', '']);
  const [createPassword, setCreatePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Pending Google user needing phone number completion
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [googlePhone, setGooglePhone] = useState('');
  const [googlePhoneTouched, setGooglePhoneTouched] = useState(false);

  // ── LOG IN STATE ───────────────────────────────────────
  const [loginTarget, setLoginTarget] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // ── FORGOT PASSWORD STATE ──────────────────────────────
  const [forgotStep, setForgotStep] = useState('input'); // 'input' | 'otp' | 'password'
  const [forgotTarget, setForgotTarget] = useState('');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // ── COMMON UI STATES ───────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [activeChallengeId, setActiveChallengeId] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);

  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Clear any leftover pending signup session to ensure clean direct signup
  useEffect(() => {
    if (initialMode === 'signup') {
      clearPendingSignupSession();
    }
  }, [initialMode]);

  // Quote Carousel Timer
  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % QUOTES.length), 4500);
    return () => clearInterval(t);
  }, []);

  // Resend OTP Cooldown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const resetFormState = () => {
    setError('');
    setLoading(false);
    setResendCooldown(0);
    setShowPass(false);
    setShowSignupPass(false);
    setShowConfirmPass(false);
  };

  const handleFlowSwitch = (newFlow) => {
    setFlow(newFlow);
    setSignupStep('details');
    setForgotStep('input');
    setNameTouched(false);
    setEmailTouched(false);
    setPhoneTouched(false);
    setPassTouched(false);
    setConfirmPassTouched(false);
    resetFormState();
  };

  const finishLoginSuccess = (user) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}!`);
    if (redirectPath) navigate(redirectPath);
    else if (user.role === 'admin') navigate('/admin');
    else navigate('/dashboard');
  };

  // --------------------------------------------------------------------
  // TWO-STEP DIRECT SIGN UP FLOW (NO OTP REQUIRED)
  // --------------------------------------------------------------------
  
  // Step 1: Validate Personal Details and Proceed to Step 2
  const handleProceedToStep2 = (e) => {
    e?.preventDefault();
    setError('');
    setNameTouched(true);
    setEmailTouched(true);
    setPhoneTouched(true);

    if (!fullName || fullName.trim().length < 2) {
      setError('Full name must contain at least 2 characters.');
      return;
    }

    const cleanEmail = (signupEmail || '').trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    const cleanPhone = sanitizeMobile10(signupPhone);
    if (!cleanPhone || !isValidIndianMobile(cleanPhone)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }

    // Step 1 validated — move to Step 2 preserving all details
    setError('');
    setSignupStep('password');
  };

  // Step 2: Return to Step 1 preserving all details
  const handleBackToDetails = () => {
    setError('');
    setSignupStep('details');
  };

  // Step 2: Validate Password & Create Account
  const handleDirectSignup = async (e) => {
    e?.preventDefault();
    setError('');
    setPassTouched(true);
    setConfirmPassTouched(true);

    // Validate Step 1 details
    if (!fullName || fullName.trim().length < 2) {
      setError('Full name must contain at least 2 characters.');
      setSignupStep('details');
      return;
    }

    const cleanEmail = (signupEmail || '').trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      setSignupStep('details');
      return;
    }

    const cleanPhone = sanitizeMobile10(signupPhone);
    if (!cleanPhone || !isValidIndianMobile(cleanPhone)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      setSignupStep('details');
      return;
    }

    // Validate Step 2 details
    if (!createPassword || createPassword.length < 8) {
      setError('Password is required and must contain at least 8 characters.');
      return;
    }

    if (createPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    const regRes = await registerNewUser({
      name: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      phoneCountryCode: '+91',
      password: createPassword,
      confirmPassword,
      whatsappConsent: true,
      emailConsent: true
    });
    setLoading(false);

    if (regRes.success) {
      clearPendingSignupSession();
      setCurrentUser(regRes.user);
      showToast(regRes.message || 'Account created successfully! Welcome to THYNK LMS.');
      if (redirectPath) navigate(redirectPath);
      else navigate('/dashboard');
    } else {
      setError(regRes.error);
    }
  };

  // --------------------------------------------------------------------
  // LEGACY/REUSABLE OTP SIGN UP FLOW (Preserved for future configuration)
  // --------------------------------------------------------------------
  const handleSignupRequestOtp = async (e) => {
    e?.preventDefault();
    resetFormState();
    setEmailTouched(true);
    setPhoneTouched(true);

    if (!fullName || fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    const cleanEmail = signupEmail.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    const cleanPhone = sanitizeMobile10(signupPhone);
    if (!cleanPhone || !isValidIndianMobile(cleanPhone)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    const res = await requestOtp(cleanPhone, 'signup', {
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone
    });
    setLoading(false);

    if (res.success) {
      setActiveChallengeId(res.challengeId);
      setPendingSignupSession({
        challengeId: res.challengeId,
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        resendAvailableAt: Date.now() + 45 * 1000,
        expiresAt: Date.now() + 5 * 60 * 1000
      });
      setSignupStep('otp');
      setResendCooldown(res.resendCooldown || 45);
      showToast(res.message);
    } else {
      setError(res.error);
    }
  };

  const handleSignupVerifyOtp = async (e) => {
    e?.preventDefault();
    resetFormState();

    const fullOtp = signupOtp.join('');
    if (fullOtp.length !== 4) {
      setError('Please enter the 4-digit OTP.');
      return;
    }

    const cleanPhone = sanitizeMobile10(signupPhone);
    const identifier = activeChallengeId || cleanPhone || signupEmail.trim().toLowerCase();

    setLoading(true);
    const res = await verifyOtp(identifier, fullOtp);
    setLoading(false);

    if (res.success) {
      setSignupStep('password');
      showToast('OTP verified! Please create your password.');
    } else {
      setError(res.error);
    }
  };

  const handleSignupCreateAccount = async (e) => {
    e?.preventDefault();
    resetFormState();

    if (!createPassword || createPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (createPassword !== confirmPassword) {
      setError('Passwords do not match. Please enter the password again.');
      return;
    }

    setLoading(true);
    const regRes = await registerNewUser({
      name: fullName.trim(),
      email: signupEmail.trim().toLowerCase(),
      phone: sanitizeMobile10(signupPhone),
      phoneCountryCode: '+91',
      password: createPassword,
      confirmPassword,
      challengeId: activeChallengeId,
      whatsappConsent: true,
      emailConsent: true
    });
    setLoading(false);

    if (regRes.success) {
      clearPendingSignupSession();
      setCurrentUser(regRes.user);
      showToast(regRes.message);
      if (redirectPath) navigate(redirectPath);
      else navigate('/dashboard');
    } else {
      setError(regRes.error);
    }
  };

  // --------------------------------------------------------------------
  // LOG IN FLOW (EXISTING USER)
  // --------------------------------------------------------------------
  const handleExistingUserLogin = async (e) => {
    e?.preventDefault();
    resetFormState();

    if (!loginTarget || !loginPassword) {
      setError('Please enter your email/mobile and password.');
      return;
    }

    setLoading(true);
    const res = await loginWithPassword(loginTarget, loginPassword);
    setLoading(false);

    if (res.success) {
      finishLoginSuccess(res.user);
    } else {
      setError(res.error);
    }
  };

  // --------------------------------------------------------------------
  // GOOGLE OAUTH SIGN IN
  // --------------------------------------------------------------------
  const handleGoogleSignIn = async () => {
    resetFormState();
    setLoading(true);
    const res = await signInWithGoogleOAuth();
    setLoading(false);

    if (res.error) {
      setError(res.error.message || 'Google sign-in failed.');
      return;
    }

    if (res.data?.user) {
      const gUser = res.data.user;
      const loginRes = await loginWithGoogleAccount({
        email: gUser.email,
        name: gUser.user_metadata?.full_name || 'Google Student'
      });
      if (loginRes.success) {
        if (loginRes.needsPhone) {
          setPendingGoogleUser(loginRes.user);
          setSignupStep('google-phone');
          setFlow('signup');
        } else {
          finishLoginSuccess(loginRes.user);
        }
      } else {
        setError(loginRes.error || 'Google Sign-In failed.');
      }
    }
  };

  const handleCompleteGooglePhone = async (e) => {
    e?.preventDefault();
    resetFormState();
    setGooglePhoneTouched(true);

    const cleanPhone = sanitizeMobile10(googlePhone);
    if (!isValidIndianMobile(cleanPhone)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!pendingGoogleUser) {
      setError('Session expired. Please sign in again.');
      return;
    }

    setLoading(true);
    const updateRes = await completeUserProfilePhone(pendingGoogleUser.id, cleanPhone);
    setLoading(false);

    if (updateRes.success) {
      showToast('Profile completed!');
      finishLoginSuccess(updateRes.user);
    } else {
      setError(updateRes.error);
    }
  };

  // --------------------------------------------------------------------
  // FORGOT PASSWORD FLOW
  // --------------------------------------------------------------------
  const handleForgotRequestOtp = async (e) => {
    e?.preventDefault();
    resetFormState();

    if (!forgotTarget) {
      setError('Please enter your registered email or mobile number.');
      return;
    }

    setLoading(true);
    const res = await requestOtp(forgotTarget, 'reset_password');
    setLoading(false);

    if (res.success) {
      setForgotStep('otp');
      setResendCooldown(res.resendCooldown || 45);
      showToast(res.message);
    } else {
      setError(res.error);
    }
  };

  const handleForgotVerifyOtp = async (e) => {
    e?.preventDefault();
    resetFormState();

    const fullOtp = forgotOtp.join('');
    if (fullOtp.length !== 4) {
      setError('Please enter the 4-digit OTP.');
      return;
    }

    setLoading(true);
    const res = await verifyOtp(forgotTarget, fullOtp);
    setLoading(false);

    if (res.success) {
      setForgotStep('password');
      showToast('OTP verified! Please set your new password.');
    } else {
      setError(res.error);
    }
  };

  const handleForgotResetSubmit = async (e) => {
    e?.preventDefault();
    resetFormState();

    setLoading(true);
    const resetRes = await resetPasswordWithOtp(forgotTarget, newPassword, confirmNewPassword);
    setLoading(false);

    if (resetRes.success) {
      showToast(resetRes.message);
      handleFlowSwitch('login');
    } else {
      setError(resetRes.error);
    }
  };

  // OTP Box Keydown helper
  const handleOtpBoxChange = (idx, val, stateArr, setArr) => {
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').slice(0, 4);
      const next = ['', '', '', ''];
      digits.split('').forEach((d, i) => { next[i] = d; });
      setArr(next);
      if (digits.length === 4) otpRefs[3]?.current?.focus();
      return;
    }
    const next = [...stateArr];
    next[idx] = val.replace(/\D/g, '');
    setArr(next);
    if (val && idx < 3) otpRefs[idx + 1]?.current?.focus();
  };

  const handleOtpBoxKeyDown = (idx, e, stateArr) => {
    if (e.key === 'Backspace' && !stateArr[idx] && idx > 0) {
      otpRefs[idx - 1]?.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-white font-sans relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-electric-600/15 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-sky-400/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <img src="/thynk-logo.svg" alt="THYNK LMS" className="h-14 w-auto object-contain" style={{ minWidth: '120px', maxWidth: '140px' }} />
        </Link>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-800 transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Main Full-Screen Layout Container */}
      <main className="relative z-20 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">

          {/* ════════════════════════════════════════════════════════════ */}
          {/* LEFT SECTION: Visual Branding & Quotes                      */}
          {/* ════════════════════════════════════════════════════════════ */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#07152B] via-[#0E2243] to-[#17386B] p-10 text-white flex-col justify-between relative overflow-hidden">
            
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center space-x-2 bg-electric-600/30 text-sky-300 border border-electric-500/40 px-3.5 py-1.5 rounded-full text-xs font-bold">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>AUTHENTICATION GATEWAY</span>
              </div>
              <h2 className="text-2xl font-black text-white leading-tight">
                Master Practical Digital Marketing in Tamil
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Join 1,400+ students building client portfolios in SEO, Google Ads, Meta Ads, and WordPress.
              </p>
            </div>

            {/* Quote Carousel */}
            <div className="space-y-3 relative z-10 py-8">
              <div className="text-4xl text-sky-400 font-serif leading-none">“</div>
              <p className="text-lg font-bold leading-snug text-white transition-all duration-500 min-h-[56px]">
                {QUOTES[quoteIdx].text}
              </p>
              <p className="text-xs text-sky-200 font-medium">
                {QUOTES[quoteIdx].sub}
              </p>
              <div className="flex items-center space-x-1.5 pt-2">
                {QUOTES.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === quoteIdx ? 'w-6 bg-sky-400' : 'w-1.5 bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Trust Badge */}
            <div className="border-t border-slate-700/80 pt-4 relative z-10 text-xs text-slate-300 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>100% Practical Tamil LMS</span>
              </div>
              <p className="text-[11px] text-slate-400">
                6-Month Course Access • Verifiable Certificates • Weekly Live Mentorship
              </p>
            </div>

          </div>

          {/* ════════════════════════════════════════════════════════════ */}
          {/* RIGHT SECTION: Dedicated Authentication Forms               */}
          {/* ════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 p-6 sm:p-10 bg-white text-slate-900 flex flex-col justify-center min-h-[520px]">
            
            {/* Flow Switcher Header (Button 1: Sign Up, Button 2: Log In) */}
            {flow !== 'forgot_password' && (
              <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5 mb-8">
                <button
                  onClick={() => handleFlowSwitch('signup')}
                  className={`py-3 text-xs sm:text-sm font-extrabold rounded-xl transition-all ${
                    flow === 'signup'
                      ? 'bg-[#2563EB] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign Up (New User)
                </button>
                <button
                  onClick={() => handleFlowSwitch('login')}
                  className={`py-3 text-xs sm:text-sm font-extrabold rounded-xl transition-all ${
                    flow === 'login'
                      ? 'bg-[#2563EB] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Log In (Existing User)
                </button>
              </div>
            )}

            {/* Error Notification Banner */}
            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold flex items-start space-x-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ========================================================= */}
            {/* FLOW 1: SIGN UP (NEW USER)                                */}
            {/* ========================================================= */}
            {flow === 'signup' && (
              <div className="space-y-5">
                
                {/* ========================================================= */}
                {/* STEP 1: PERSONAL DETAILS                                  */}
                {/* ========================================================= */}
                {signupStep === 'details' && (
                  <form onSubmit={handleProceedToStep2} className="space-y-4" noValidate>
                    {/* Step Indicator */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Step 1 of 2 — Your Details
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Create New Account</h3>
                      <p className="text-xs text-slate-500 mt-1">Enter your details to get started.</p>
                    </div>

                    {/* 1. Full Name */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Full Name *</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          onBlur={() => setNameTouched(true)}
                          placeholder="e.g. Karthik Raja"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                          required
                          autoFocus
                        />
                      </div>
                      {nameTouched && (!fullName || fullName.trim().length < 2) && (
                        <p className="text-[11px] text-red-600 font-semibold pt-0.5">Full name must contain at least 2 characters.</p>
                      )}
                    </div>

                    {/* 2. Email Address */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Email Address *</span>
                        <span className="text-[10px] text-slate-400 font-normal">Compulsory</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          onBlur={() => setEmailTouched(true)}
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                          required
                        />
                      </div>
                      {emailTouched && (!signupEmail.trim() || !isValidEmail(signupEmail)) && (
                        <p className="text-[11px] text-red-600 font-semibold pt-0.5">Please enter a valid email address.</p>
                      )}
                    </div>

                    {/* 3. Mobile Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Mobile Number *</span>
                        <span className="text-[10px] text-slate-400 font-normal">10 Digits (India)</span>
                      </label>
                      <div className="flex rounded-xl overflow-hidden border border-slate-300 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-600 focus-within:bg-white focus-within:border-transparent">
                        <div className="px-3.5 py-3 bg-slate-100 border-r border-slate-300 text-xs font-bold text-slate-700 flex items-center space-x-1 shrink-0 select-none">
                          <span>🇮🇳 +91</span>
                        </div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          onBlur={() => setPhoneTouched(true)}
                          placeholder="9876543210"
                          className="w-full px-4 py-3 bg-transparent text-sm font-medium text-slate-900 focus:outline-none"
                          required
                        />
                      </div>
                      {phoneTouched && (!signupPhone || signupPhone.length !== 10 || !isValidIndianMobile(signupPhone)) && (
                        <p className="text-[11px] text-red-600 font-semibold pt-0.5">Enter a valid 10-digit Indian mobile number.</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
                    >
                      <span>SET PASSWORD →</span>
                    </button>
                  </form>
                )}

                {/* ========================================================= */}
                {/* STEP 2: SET PASSWORD                                      */}
                {/* ========================================================= */}
                {signupStep === 'password' && (
                  <form onSubmit={handleDirectSignup} className="space-y-4" noValidate>
                    {/* Top Navigation Bar: Back Button & Step Indicator */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleBackToDetails}
                        className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer py-1"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>← Back to Details</span>
                      </button>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Step 2 of 2 — Set Password
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Set Your Password</h3>
                      <p className="text-xs text-slate-500 mt-1">Create a secure password to complete your registration.</p>
                    </div>

                    {/* Preserved Details Mini-Summary */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                      <div className="truncate pr-2">
                        <span className="font-bold text-slate-800">{fullName}</span> &bull; <span className="text-slate-500">{signupEmail}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleBackToDetails}
                        className="text-[11px] font-bold text-blue-600 hover:underline shrink-0 cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Password *</span>
                        <span className="text-[10px] text-slate-400 font-normal">Min. 8 characters</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showSignupPass ? 'text' : 'password'}
                          value={createPassword}
                          onChange={(e) => setCreatePassword(e.target.value)}
                          onBlur={() => setPassTouched(true)}
                          placeholder="At least 8 characters"
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                          required
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPass(!showSignupPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          tabIndex={-1}
                          aria-label={showSignupPass ? "Hide password" : "Show password"}
                        >
                          {showSignupPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passTouched && (!createPassword || createPassword.length < 8) && (
                        <p className="text-[11px] text-red-600 font-semibold pt-0.5">Password is required and must contain at least 8 characters.</p>
                      )}
                    </div>

                    {/* Re-enter Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Re-enter Password *</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onBlur={() => setConfirmPassTouched(true)}
                          placeholder="Re-enter password"
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          tabIndex={-1}
                          aria-label={showConfirmPass ? "Hide password" : "Show password"}
                        >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassTouched && (createPassword !== confirmPassword) && (
                        <p className="text-[11px] text-red-600 font-semibold pt-0.5">Passwords do not match. Please re-enter your password.</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-2"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>CREATE ACCOUNT</span>
                      )}
                    </button>
                  </form>
                )}

                {/* STEP: Google Phone Completion */}
                {signupStep === 'google-phone' && (
                  <form onSubmit={handleCompleteGooglePhone} className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                      <h4 className="text-base font-extrabold text-blue-950">Almost Done, {pendingGoogleUser?.name || 'Student'}!</h4>
                      <p className="text-slate-600">Please provide your 10-digit Indian mobile number to complete registration.</p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Mobile Number *</span>
                        <span className="text-[10px] text-slate-400 font-normal">10 Digits</span>
                      </label>
                      <div className="flex rounded-xl overflow-hidden border border-slate-300 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-600 focus-within:bg-white focus-within:border-transparent">
                        <div className="px-3.5 py-3 bg-slate-100 border-r border-slate-300 text-xs font-bold text-slate-700 flex items-center space-x-1 shrink-0 select-none">
                          <span>🇮🇳 +91</span>
                        </div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={googlePhone}
                          onChange={(e) => setGooglePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          onBlur={() => setGooglePhoneTouched(true)}
                          placeholder="9876543210"
                          className="w-full px-4 py-3 bg-transparent text-sm font-medium text-slate-900 focus:outline-none"
                          required
                          autoFocus
                        />
                      </div>
                      {googlePhoneTouched && (!googlePhone || googlePhone.length !== 10 || !isValidIndianMobile(googlePhone)) && (
                        <p className="text-[11px] text-red-600 font-semibold pt-0.5">Enter a valid 10-digit Indian mobile number.</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !isValidIndianMobile(googlePhone)}
                      className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>FINISH REGISTRATION</span>}
                    </button>
                  </form>
                )}

                {/* Google Sign Up Alternative */}
                <div className="pt-4 border-t border-slate-200 text-center space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Sign up with Google</span>
                  </button>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* FLOW 2: LOG IN (EXISTING REGISTERED USER)                 */}
            {/* ========================================================= */}
            {flow === 'login' && (
              <form onSubmit={handleExistingUserLogin} className="space-y-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Welcome Back</h3>
                  <p className="text-xs text-slate-500 mt-1">Log in using your registered email or mobile number.</p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-700">Registered Email or Mobile Number</label>
                  <div className="relative">
                    {loginTarget.includes('@') ? (
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    ) : (
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    )}
                    <input
                      type="text"
                      value={loginTarget}
                      onChange={(e) => setLoginTarget(e.target.value)}
                      placeholder="e.g. 9876543210 or name@example.com"
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => handleFlowSwitch('forgot_password')}
                      className="text-xs font-bold text-[#2563EB] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !loginTarget || !loginPassword}
                  className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>LOG IN</span>}
                </button>

                {/* Google Sign In Option */}
                <div className="pt-4 border-t border-slate-200 text-center space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* FORGOT PASSWORD FLOW                                      */}
            {/* ========================================================= */}
            {flow === 'forgot_password' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Reset Password</h3>
                  <p className="text-xs text-slate-500 mt-1">Enter your registered email or mobile to receive a reset OTP.</p>
                </div>

                {forgotStep === 'input' && (
                  <form onSubmit={handleForgotRequestOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Registered Email or Mobile Number</label>
                      <input
                        type="text"
                        value={forgotTarget}
                        onChange={(e) => setForgotTarget(e.target.value)}
                        placeholder="e.g. 9876543210 or name@example.com"
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        required
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !forgotTarget}
                      className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>SEND RESET OTP</span>}
                    </button>
                  </form>
                )}

                {forgotStep === 'otp' && (
                  <form onSubmit={handleForgotVerifyOtp} className="space-y-5">
                    <p className="text-xs text-slate-500 text-center leading-relaxed">
                      We sent a 4-digit verification code to <strong className="text-slate-800">{forgotTarget.includes('@') ? maskEmail(forgotTarget) : `+91 ${maskPhone(forgotTarget)}`}</strong>.
                    </p>
                    <div className="flex items-center justify-center space-x-3 py-2">
                      {[0, 1, 2, 3].map((idx) => (
                        <input
                          key={idx}
                          ref={otpRefs[idx]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={forgotOtp[idx]}
                          onChange={(e) => handleOtpBoxChange(idx, e.target.value, forgotOtp, setForgotOtp)}
                          onKeyDown={(e) => handleOtpBoxKeyDown(idx, e, forgotOtp)}
                          className="w-14 h-16 text-center font-extrabold text-2xl text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                        />
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={loading || forgotOtp.join('').length !== 4}
                      className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>VERIFY OTP</span>}
                    </button>
                  </form>
                )}

                {forgotStep === 'password' && (
                  <form onSubmit={handleForgotResetSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Re-enter New Password</label>
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        required
                      />
                      {confirmNewPassword && newPassword !== confirmNewPassword && (
                        <p className="text-xs text-red-600 font-semibold pt-0.5">Passwords do not match. Please enter the password again.</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={loading || newPassword.length < 6 || newPassword !== confirmNewPassword}
                      className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>UPDATE PASSWORD & LOG IN</span>}
                    </button>
                  </form>
                )}

                <button
                  type="button"
                  onClick={() => handleFlowSwitch('login')}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 text-center block w-full pt-2"
                >
                  ← Back to Log In
                </button>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        <p>© 2026 THYNK DIGITAL SOLUTIONS. All rights reserved. Secured by THYNK LMS.</p>
      </footer>

    </div>
  );
}
