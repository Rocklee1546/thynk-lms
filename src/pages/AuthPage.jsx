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
  loginWithGoogleAccount, isValidEmail, isValidMobile
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
  const [signupStep, setSignupStep] = useState('input'); // 'input' | 'otp' | 'password'
  const [fullName, setFullName] = useState('');
  const [signupTarget, setSignupTarget] = useState('');
  const [signupOtp, setSignupOtp] = useState(['', '', '', '']);
  const [createPassword, setCreatePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
  const [demoOtpHint, setDemoOtpHint] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);

  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

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
    setDemoOtpHint('');
    setResendCooldown(0);
    setShowPass(false);
  };

  const handleFlowSwitch = (newFlow) => {
    setFlow(newFlow);
    setSignupStep('input');
    setForgotStep('input');
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
  // SIGN UP FLOW (NEW USER)
  // --------------------------------------------------------------------
  const handleSignupRequestOtp = async (e) => {
    e?.preventDefault();
    resetFormState();

    if (!fullName || fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    const isEmail = signupTarget.includes('@');
    if (isEmail && !isValidEmail(signupTarget)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isEmail && !isValidMobile(signupTarget)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    const res = await requestOtp(signupTarget, 'signup');
    setLoading(false);

    if (res.success) {
      setSignupStep('otp');
      setResendCooldown(45);
      if (res.demoCode) setDemoOtpHint(res.demoCode);
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

    setLoading(true);
    const res = await verifyOtp(signupTarget, fullOtp);
    setLoading(false);

    if (res.success) {
      setSignupStep('password');
      showToast('OTP verified! Please create your password.');
    } else {
      setError(res.error); // "Incorrect OTP. Please enter the correct OTP."
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
      target: signupTarget,
      password: createPassword,
      confirmPassword,
      whatsappConsent: true,
      emailConsent: true
    });
    setLoading(false);

    if (regRes.success) {
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
      setError(res.error); // "Incorrect email/mobile number or password."
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
        finishLoginSuccess(loginRes.user);
      }
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
      setResendCooldown(45);
      if (res.demoCode) setDemoOtpHint(res.demoCode);
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
          <img src="/thynk-logo.png" alt="THYNK LMS" className="h-10 w-auto object-contain brightness-0 invert" />
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

            {/* Demo OTP Hint Banner */}
            {demoOtpHint && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 font-semibold flex items-center justify-between">
                <span>Verification OTP Code:</span>
                <span className="font-mono font-black text-base tracking-widest text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-300">
                  {demoOtpHint}
                </span>
              </div>
            )}

            {/* ========================================================= */}
            {/* FLOW 1: SIGN UP (NEW USER)                                */}
            {/* ========================================================= */}
            {flow === 'signup' && (
              <div className="space-y-5">
                
                {/* STEP 1: Enter Name & Target */}
                {signupStep === 'input' && (
                  <form onSubmit={handleSignupRequestOtp} className="space-y-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Create New Account</h3>
                      <p className="text-xs text-slate-500 mt-1">Enter your details to register and verify your 4-digit OTP.</p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-bold text-slate-700">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Karthik Raja"
                          className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Email Address or Mobile Number</label>
                      <div className="relative">
                        {signupTarget.includes('@') ? (
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        ) : (
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        )}
                        <input
                          type="text"
                          value={signupTarget}
                          onChange={(e) => setSignupTarget(e.target.value)}
                          placeholder="e.g. name@example.com or 9876543210"
                          className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !fullName || !signupTarget}
                      className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>SEND 4-DIGIT OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* STEP 2: Verify OTP */}
                {signupStep === 'otp' && (
                  <form onSubmit={handleSignupVerifyOtp} className="space-y-5">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Enter 4-Digit OTP</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        We sent a 4-digit code to <strong className="text-slate-800">{signupTarget}</strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-center space-x-3 py-2">
                      {[0, 1, 2, 3].map((idx) => (
                        <input
                          key={idx}
                          ref={otpRefs[idx]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={signupOtp[idx]}
                          onChange={(e) => handleOtpBoxChange(idx, e.target.value, signupOtp, setSignupOtp)}
                          onKeyDown={(e) => handleOtpBoxKeyDown(idx, e, signupOtp)}
                          className="w-14 h-16 sm:w-16 sm:h-18 text-center font-extrabold text-2xl text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => { setSignupStep('input'); resetFormState(); }}
                        className="font-bold text-slate-500 hover:text-slate-800"
                      >
                        Change Details
                      </button>

                      {resendCooldown > 0 ? (
                        <span className="text-slate-400 font-medium">
                          Resend in <strong className="text-slate-700">{resendCooldown}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSignupRequestOtp}
                          className="font-extrabold text-[#2563EB] hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || signupOtp.join('').length !== 4}
                      className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>VERIFY OTP</span>}
                    </button>
                  </form>
                )}

                {/* STEP 3: Create & Confirm Password */}
                {signupStep === 'password' && (
                  <form onSubmit={handleSignupCreateAccount} className="space-y-4">
                    <div>
                      <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>OTP Verified Successfully</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Create Password</h3>
                      <p className="text-xs text-slate-500">Set a password for your account (minimum 6 characters).</p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-bold text-slate-700">Create Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={createPassword}
                          onChange={(e) => setCreatePassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                          required
                          autoFocus
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

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Re-enter Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                          required
                        />
                      </div>
                      {confirmPassword && createPassword !== confirmPassword && (
                        <p className="text-xs text-red-600 font-semibold pt-0.5">Passwords do not match. Please enter the password again.</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || createPassword.length < 6 || createPassword !== confirmPassword}
                      className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>CREATE ACCOUNT & START LEARNING</span>}
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
