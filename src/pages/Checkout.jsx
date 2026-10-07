import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useLMS } from '../context/LMSContext';
import { createRazorpayOrder, verifyAndCompletePayment, calculateSixCalendarMonthsExpiry } from '../services/paymentService';
import { 
  ShieldCheck, 
  Tag, 
  Lock, 
  CheckCircle, 
  ShieldAlert, 
  CreditCard, 
  ArrowLeft,
  Calendar,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    courses, 
    valuePacks, 
    validateCoupon, 
    currentUser, 
    openAuthModal, 
    showToast,
    refreshState
  } = useLMS();

  const courseId = searchParams.get('course');
  const comboId = searchParams.get('combo');

  // Determine item
  const selectedCourse = useMemo(() => courses.find(c => c.id === courseId), [courses, courseId]);
  const selectedCombo = useMemo(() => valuePacks.find(v => v.id === comboId), [valuePacks, comboId]);

  const targetItem = selectedCombo || selectedCourse || courses[0];
  const isCombo = !!selectedCombo;

  const basePrice = targetItem ? targetItem.price : 2999;

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    agreeTerms: false
  });

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone
      }));
    }
  }, [currentUser]);

  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle | processing | success | error
  const [paymentError, setPaymentError] = useState('');

  // Expiry date calculation preview (6 Calendar Months)
  const expiryDatePreview = useMemo(() => {
    const exp = calculateSixCalendarMonthsExpiry();
    return new Date(exp).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }, []);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const res = validateCoupon(couponCode, basePrice);
    if (res.valid) {
      setAppliedCoupon(res);
      showToast(res.message);
    } else {
      setCouponError(res.message);
    }
  };

  const finalAmount = appliedCoupon ? appliedCoupon.finalPrice : basePrice;

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal(window.location.pathname + window.location.search, 'signin');
      return;
    }

    if (!formData.agreeTerms) {
      showToast('You must acknowledge the No-Refund Policy before proceeding', 'error');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      showToast('Please fill in all student details', 'error');
      return;
    }

    setPaymentStatus('processing');
    setPaymentError('');

    try {
      // Step 1: Create simulated Razorpay order on server
      const order = await createRazorpayOrder(
        finalAmount,
        'INR',
        `rcpt_${Date.now()}`,
        { courseId: targetItem.id, isCombo, userId: currentUser.id }
      );

      // Step 2: Simulate Razorpay checkout interaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Simulate Razorpay response tokens
      const simulatedPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const simulatedSignature = `sig_${Date.now()}_razorpay_verified`;

      // Step 4: Idempotent Server Verification & 6-Month Enrollment
      const verification = await verifyAndCompletePayment({
        orderId: order.orderId,
        paymentId: simulatedPaymentId,
        signature: simulatedSignature,
        userId: currentUser.id,
        courseId: targetItem.id,
        isCombo,
        amount: finalAmount,
        studentName: formData.name,
        studentEmail: formData.email,
        studentPhone: formData.phone
      });

      if (verification.success) {
        setPaymentStatus('success');
        showToast('Payment verified! 6-Month LMS Access Activated.', 'success');
        if (refreshState) refreshState();
        setTimeout(() => {
          navigate('/dashboard');
        }, 1600);
      } else {
        setPaymentStatus('error');
        setPaymentError(verification.message || 'Payment verification failed');
        showToast(verification.message || 'Payment failed', 'error');
      }
    } catch (err) {
      setPaymentStatus('error');
      setPaymentError(err.message || 'Error processing payment');
      showToast('Payment processing encountered an error', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <Link to="/courses" className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </Link>

        {/* Auth prompt if not logged in */}
        {!currentUser && (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-xs text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">You are currently checking out as a guest</p>
                <p className="text-amber-700">Please sign in or create an account to link your 6-month access.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal(window.location.pathname + window.location.search, 'signup')}
              className="bg-electric-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shrink-0"
            >
              Sign In / Sign Up
            </button>
          </div>
        )}

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Checkout & Enrollment</h1>
          <p className="text-xs text-slate-500">Complete your details below to activate instant 6-Month LMS access.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form & Payment */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Student Info Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-electric-600" />
                <span>1. Student Information</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter your full name"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address (for LMS Login)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="student@example.com"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">WhatsApp Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="10-digit mobile number"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 6 Calendar Months Access Guarantee Notice */}
            <div className="bg-emerald-50/70 p-5 rounded-3xl border border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-emerald-900 font-extrabold">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>6 CALENDAR MONTHS ACCESS GUARANTEE</span>
              </div>
              <p className="text-emerald-800 leading-relaxed text-[11px]">
                Your enrollment provides unrestricted access to all recorded Tamil video lessons, doubt sessions, and assignments for exactly <strong>6 calendar months</strong> until <strong>{expiryDatePreview}</strong>.
              </p>
            </div>

            {/* No-Refund Policy Acknowledgment */}
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 space-y-3">
              <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>MANDATORY ACKNOWLEDGMENT: NO-REFUND POLICY</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                THYNK LMS maintains a strict <strong>No-Refund Policy</strong>. All digital course video contents, resources, and live doubt session access are made immediately available upon payment.
              </p>
              <label className="flex items-center space-x-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="w-4 h-4 text-electric-600 rounded focus:ring-electric-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  I have read and agree to the No-Refund Policy & Terms of Service.
                </span>
              </label>
            </div>

            {/* Simulated Razorpay Payment Trigger */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-electric-600" />
                <span>2. Payment Gateway Architecture</span>
              </h3>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>256-Bit SSL Encrypted Simulated Razorpay/UPI Payment Gateway</span>
              </div>

              {paymentStatus === 'processing' ? (
                <div className="p-6 bg-slate-900 text-white rounded-2xl text-center space-y-3">
                  <div className="w-8 h-8 border-4 border-electric-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-bold text-sm">Verifying Secure Payment Gateway...</p>
                  <p className="text-xs text-slate-400">Do not refresh or close this browser window.</p>
                </div>
              ) : paymentStatus === 'success' ? (
                <div className="p-6 bg-emerald-600 text-white rounded-2xl text-center space-y-3">
                  <CheckCircle className="w-12 h-12 mx-auto" />
                  <h4 className="font-extrabold text-lg">Payment Verified & 6-Month Access Active!</h4>
                  <p className="text-xs text-emerald-100">Valid until {expiryDatePreview}. Redirecting to your Student Dashboard...</p>
                </div>
              ) : (
                <div>
                  {paymentError && (
                    <p className="text-xs text-red-600 font-bold mb-3">{paymentError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={!formData.agreeTerms}
                    className={`w-full py-4 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center space-x-2 shadow-xl ${
                      formData.agreeTerms
                        ? 'bg-electric-600 hover:bg-electric-700 text-white shadow-electric-600/30'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>PAY NOW (₹{finalAmount.toLocaleString()})</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-brand-navy text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <h3 className="font-extrabold text-lg text-white border-b border-slate-800 pb-3">
                Order Summary
              </h3>

              {/* Item details */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-start font-semibold">
                  <span className="text-slate-200 pr-2">{targetItem.name || targetItem.title}</span>
                  <span className="font-bold text-white shrink-0">₹{basePrice.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-sky-400 font-medium space-y-1">
                  <div>Language: <strong>Tamil (தமிழ்)</strong></div>
                  <div>Access Validity: <strong>6 Calendar Months (until {expiryDatePreview})</strong></div>
                </div>
              </div>

              {/* Coupon Form */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-300 flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Have a Coupon Code?</span>
                </label>

                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code (e.g. THYNK10)"
                    className="flex-1 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </form>

                {couponError && <p className="text-[11px] text-red-400 font-bold">{couponError}</p>}

                {/* Pre-suggested coupon tags */}
                <div className="flex flex-wrap gap-2 text-[10px]">
                  <button type="button" onClick={() => setCouponCode('THYNK10')} className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">THYNK10 (10% OFF)</button>
                  <button type="button" onClick={() => setCouponCode('STUDENT500')} className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">STUDENT500 (₹500 OFF)</button>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{basePrice.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{appliedCoupon.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                  <span>Total Amount</span>
                  <span className="text-sky-400">₹{finalAmount.toLocaleString()}</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
