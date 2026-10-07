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
  isValidEmail, isValidMobile
} from '../services/authService';
import { signInWithGoogleOAuth } from '../services/supabaseClient';

export default function AuthModal({ isOpen, onClose, redirectPath = null, initialMode = 'signup' }) {
  const { setCurrentUser, showToast } = useLMS();
  const navigate = useNavigate();

  // Mode: 'signup' (NEW USER) | 'login' (EXISTING USER)
  const [mode, setMode] = useState(initialMode === 'login' ? 'login' : 'signup');

  // Sign up steps: 'input' | 'otp' | 'password'
  const [signupStep, setSignupStep] = useState('input');
  const [fullName, setFullName] = useState('');
  const [signupTarget, setSignupTarget] = useState('');
  const [signupOtp, setSignupOtp] = useState(['', '', '', '']);
  const [createPassword, setCreatePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Login state
  const [loginTarget, setLoginTarget] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [demoCode, setDemoCode] = useState('');
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
      setSignupStep('input');
      setFullName('');
      setSignupTarget('');
      setSignupOtp(['', '', '', '']);
      setCreatePassword('');
      setConfirmPassword('');
      setLoginTarget('');
      setLoginPassword('');
      setError('');
      setLoading(false);
      setDemoCode('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setSignupStep('input');
    setError('');
    setLoading(false);
  };

  const finishAuth = (user) => {
    setCurrentUser(user);
    showToast(`Authenticated as ${user.name}`);
    onClose();
    if (redirectPath) navigate(redirectPath);
    else if (user.role === 'admin') navigate('/admin');
    else navigate('/dashboard');
  };

  // Sign Up: Step 1 Request OTP
  const handleSignupRequestOtp = async (e) => {
    e?.preventDefault();
    setError('');

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
      if (res.demoCode) setDemoCode(res.demoCode);
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

    setLoading(true);
    const res = await verifyOtp(signupTarget, fullOtp);
    setLoading(false);

    if (res.success) {
      setSignupStep('password');
      showToast('OTP verified! Please set your password.');
    } else {
      setError(res.error); // "Incorrect OTP. Please enter the correct OTP."
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
      target: signupTarget,
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
      setError(res.error); // "Incorrect email/mobile number or password."
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
        finishAuth(loginRes.user);
      }
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

        {/* Demo OTP Banner */}
        {demoCode && signupStep === 'otp' && (
          <div className="mb-4 p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 font-semibold flex items-center justify-between">
            <span>Demo OTP Code:</span>
            <span className="font-mono font-black text-base tracking-widest text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-300">
              {demoCode}
            </span>
          </div>
        )}

        {/* ========================================================= */}
        {/* SIGN UP FLOW (NEW USER)                                   */}
        {/* ========================================================= */}
        {mode === 'signup' && (
          <div className="space-y-4">
            
            {/* Step 1: Name & Target */}
            {signupStep === 'input' && (
              <form onSubmit={handleSignupRequestOtp} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Karthik Raja"
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1">
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
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !fullName || !signupTarget}
                  className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>SEND 4-DIGIT OTP</span>}
                </button>
              </form>
            )}

            {/* Step 2: 4-digit OTP */}
            {signupStep === 'otp' && (
              <form onSubmit={handleSignupVerifyOtp} className="space-y-4">
                <p className="text-xs text-slate-500 text-center">
                  Code sent to <strong className="text-slate-800">{signupTarget}</strong>
                </p>
                <div className="flex items-center justify-center space-x-2 py-1">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={signupOtp[idx]}
                      onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                      className="w-12 h-14 text-center font-extrabold text-xl text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || signupOtp.join('').length !== 4}
                  className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>VERIFY OTP</span>}
                </button>
              </form>
            )}

            {/* Step 3: Password creation */}
            {signupStep === 'password' && (
              <form onSubmit={handleSignupCreateAccount} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Create Password</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Re-enter Password</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  {confirmPassword && createPassword !== confirmPassword && (
                    <p className="text-[11px] text-red-600 font-semibold pt-0.5">Passwords do not match. Please enter the password again.</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || createPassword.length < 6 || createPassword !== confirmPassword}
                  className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>CREATE ACCOUNT</span>}
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
