// ====================================================================
// THYNK LMS — SMALL CENTERED ENROLLMENT AUTHENTICATION MODAL
// Used when visitor clicks Enroll/Purchase or views gated course content.
// Compact, centered modal over the current page (no large left quote panel).
// ====================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLMS } from '../context/LMSContext';
import {
  X, ShieldCheck, Sparkles, ArrowRight,
  Mail, Phone, Lock, RefreshCw, AlertCircle,
  CheckCircle2, Eye, EyeOff, User
} from 'lucide-react';
import {
  requestOtp, verifyOtp, loginWithPassword,
  registerNewUser, loginWithGoogleAccount,
  isValidEmail, isValidIndianMobile, sanitizeMobile10,
  completeUserProfilePhone, maskPhone, maskEmail
} from '../services/authService';
import { signInWithGoogleOAuth } from '../services/supabaseClient';

export default function AuthModal({ isOpen, onClose, redirectPath = null, initialMode = 'signup' }) {
  const { setCurrentUser, showToast } = useLMS();
  const navigate = useNavigate();

  // Mode: 'signup' (NEW USER) | 'login' (EXISTING USER)
  const [mode, setMode] = useState(initialMode === 'login' ? 'login' : 'signup');

  // Sign up steps: 'details' | 'password' | 'google-phone'
  const [signupStep, setSignupStep] = useState('details');
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

  // Login state
  const [loginTarget, setLoginTarget] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [activeChallengeId, setActiveChallengeId] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // Reset modal on open
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode === 'login' ? 'login' : 'signup');
      setSignupStep('details');
      setFullName('');
      setSignupEmail('');
      setSignupPhone('');
      setNameTouched(false);
      setEmailTouched(false);
      setPhoneTouched(false);
      setPassTouched(false);
      setConfirmPassTouched(false);
      setSignupOtp(['', '', '', '']);
      setCreatePassword('');
      setConfirmPassword('');
      setShowSignupPass(false);
      setShowConfirmPass(false);
      setLoginTarget('');
      setLoginPassword('');
      setPendingGoogleUser(null);
      setGooglePhone('');
      setGooglePhoneTouched(false);
      setError('');
      setLoading(false);
      setActiveChallengeId('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setSignupStep('details');
    setError('');
    setLoading(false);
    setNameTouched(false);
    setEmailTouched(false);
    setPhoneTouched(false);
    setPassTouched(false);
    setConfirmPassTouched(false);
    setShowSignupPass(false);
    setShowConfirmPass(false);
    setPendingGoogleUser(null);
  };

  const finishAuth = (user) => {
    setCurrentUser(user);
    showToast(`Authenticated as ${user.name}`);
    onClose();
    if (redirectPath) navigate(redirectPath);
    else if (user.role === 'admin') navigate('/admin');
    else navigate('/dashboard');
  };

  // Two-Step Direct Sign Up without OTP
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

    setError('');
    setSignupStep('password');
  };

  const handleBackToDetails = () => {
    setError('');
    setSignupStep('details');
  };

  const handleDirectSignup = async (e) => {
    e?.preventDefault();
    setError('');
    setPassTouched(true);
    setConfirmPassTouched(true);

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
      finishAuth(regRes.user);
    } else {
      setError(regRes.error);
    }
  };

  // Sign Up: Step 1 Request OTP
  const handleSignupRequestOtp = async (e) => {
    e?.preventDefault();
    setError('');
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
    // Request OTP targeting phone (with email paired validation)
    const res = await requestOtp(cleanPhone, 'signup', {
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone
    });
    setLoading(false);

    if (res.success) {
      setActiveChallengeId(res.challengeId);
      setSignupStep('otp');
      setResendCooldown(res.resendCooldown || 45);
      showToast(res.message);
    } else {
      setError(res.error);
    }
  };

  // Sign Up: Step 2 Verify OTP
  const handleSignupVerifyOtp = async (e) => {
    e?.preventDefault();
    setError('');

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
      showToast('OTP verified! Please set your password.');
    } else {
      setError(res.error);
    }
  };

  // Sign Up: Step 3 Create Password & Submit
  const handleSignupCreateAccount = async (e) => {
    e?.preventDefault();
    setError('');

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
      finishAuth(regRes.user);
    } else {
      setError(regRes.error);
    }
  };

  // Existing Login
  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!loginTarget || !loginPassword) {
      setError('Please enter your email/mobile and password.');
      return;
    }

    setLoading(true);
    const res = await loginWithPassword(loginTarget, loginPassword);
    setLoading(false);

    if (res.success) {
      finishAuth(res.user);
    } else {
      setError(res.error);
    }
  };

  // Google OAuth
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const res = await signInWithGoogleOAuth();
    setLoading(false);

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
          setMode('signup');
        } else {
          finishAuth(loginRes.user);
        }
      } else {
        setError(loginRes.error || 'Google Sign-In failed.');
      }
    }
  };

  // Google Phone Completion
  const handleCompleteGooglePhone = async (e) => {
    e?.preventDefault();
    setError('');
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
      finishAuth(updateRes.user);
    } else {
      setError(updateRes.error);
    }
  };

  const handleOtpBoxChange = (idx, val) => {
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').slice(0, 4);
      const next = ['', '', '', ''];
      digits.split('').forEach((d, i) => { next[i] = d; });
      setSignupOtp(next);
      if (digits.length === 4) otpRefs[3]?.current?.focus();
      return;
    }
    const next = [...signupOtp];
    next[idx] = val.replace(/\D/g, '');
    setSignupOtp(next);
    if (val && idx < 3) otpRefs[idx + 1]?.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      
      {/* Compact Centered Modal Window */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-electric-50 text-electric-600 border border-electric-200 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            {mode === 'signup' ? 'Sign Up to Continue' : 'Log In to Continue'}
          </h3>
          <p className="text-xs text-slate-500">
            {redirectPath ? 'Authentication required for course enrollment.' : 'Access your courses & student dashboard.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 mb-5">
          <button
            onClick={() => handleModeSwitch('signup')}
            className={`py-2.5 text-xs font-extrabold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign Up (New User)
          </button>
          <button
            onClick={() => handleModeSwitch('login')}
            className={`py-2.5 text-xs font-extrabold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Log In (Existing User)
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* SIGN UP FLOW (NEW USER)                                   */}
        {/* ========================================================= */}
        {mode === 'signup' && (
          <div className="space-y-4">
            
            {/* ========================================================= */}
            {/* STEP 1: PERSONAL DETAILS                                  */}
            {/* ========================================================= */}
            {signupStep === 'details' && (
              <form onSubmit={handleProceedToStep2} className="space-y-3.5" noValidate>
                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Step 1 of 2 — Your Details
                  </span>
                </div>

                {/* 1. Full Name */}
                <div className="space-y-1">
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
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      required
                      autoFocus
                    />
                  </div>
                  {nameTouched && (!fullName || fullName.trim().length < 2) && (
                    <p className="text-[11px] text-red-600 font-semibold pt-0.5">Full name must contain at least 2 characters.</p>
                  )}
                </div>

                {/* 2. Email Address */}
                <div className="space-y-1">
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
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      required
                    />
                  </div>
                  {emailTouched && (!signupEmail.trim() || !isValidEmail(signupEmail)) && (
                    <p className="text-[11px] text-red-600 font-semibold pt-0.5">Please enter a valid email address.</p>
                  )}
                </div>

                {/* 3. Mobile Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Mobile Number *</span>
                    <span className="text-[10px] text-slate-400 font-normal">10 Digits (India)</span>
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-slate-300 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-600 focus-within:bg-white focus-within:border-transparent">
                    <div className="px-3 py-2.5 bg-slate-100 border-r border-slate-300 text-xs font-bold text-slate-700 flex items-center space-x-1 shrink-0 select-none">
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
                      className="w-full px-3 py-2.5 bg-transparent text-sm font-medium text-slate-900 focus:outline-none"
                      required
                    />
                  </div>
                  {phoneTouched && (!signupPhone || signupPhone.length !== 10 || !isValidIndianMobile(signupPhone)) && (
                    <p className="text-[11px] text-red-600 font-semibold pt-0.5">Enter a valid 10-digit Indian mobile number.</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
                >
                  <span>SET PASSWORD →</span>
                </button>
              </form>
            )}

            {/* ========================================================= */}
            {/* STEP 2: SET PASSWORD                                      */}
            {/* ========================================================= */}
            {signupStep === 'password' && (
              <form onSubmit={handleDirectSignup} className="space-y-3.5" noValidate>
                {/* Top Navigation Bar: Back Button & Step Indicator */}
                <div className="flex items-center justify-between mb-0.5">
                  <button
                    type="button"
                    onClick={handleBackToDetails}
                    className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer py-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>← Back to Details</span>
                  </button>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Step 2 of 2 — Set Password
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-900">Set Your Password</h4>
                  <p className="text-xs text-slate-500">Create a secure password to complete your registration.</p>
                </div>

                {/* Preserved Details Mini-Summary */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
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
                <div className="space-y-1">
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
                      className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPass(!showSignupPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
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
                <div className="space-y-1">
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
                      className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
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

                {/* Create Account Primary Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>CREATE ACCOUNT</span>
                  )}
                </button>
              </form>
            )}

            {/* Step: Google Mobile Completion */}
            {signupStep === 'google-phone' && (
              <form onSubmit={handleCompleteGooglePhone} className="space-y-4">
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                  <p className="font-extrabold text-sm">Almost Done, {pendingGoogleUser?.name || 'Student'}!</p>
                  <p className="text-slate-600">Please enter your 10-digit Indian mobile number to complete your registration.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Mobile Number *</span>
                    <span className="text-[10px] text-slate-400 font-normal">10 Digits</span>
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-slate-300 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-600 focus-within:bg-white focus-within:border-transparent">
                    <div className="px-3 py-2.5 bg-slate-100 border-r border-slate-300 text-xs font-bold text-slate-700 flex items-center space-x-1 shrink-0 select-none">
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
                      className="w-full px-3 py-2.5 bg-transparent text-sm font-medium text-slate-900 focus:outline-none"
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
                  className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>FINISH REGISTRATION</span>}
                </button>
              </form>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* LOG IN FLOW (EXISTING USER)                               */}
        {/* ========================================================= */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Registered Email or Mobile Number</label>
              <input
                type="text"
                value={loginTarget}
                onChange={(e) => setLoginTarget(e.target.value)}
                placeholder="e.g. 9876543210 or name@example.com"
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !loginTarget || !loginPassword}
              className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>LOG IN</span>}
            </button>
          </form>
        )}

        {/* Google OAuth Option */}
        <div className="pt-3 mt-4 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center space-x-2 shadow-xs"
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

      </div>
    </div>
  );
}
