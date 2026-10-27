import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useLMS } from '../context/LMSContext';
import { createUPIOrder, calculateSixCalendarMonthsExpiry } from '../services/paymentService';
import { submitEnrollmentRequest } from '../services/enrollmentService';
import { isValidEmail, isValidIndianMobile, sanitizeMobile10 } from '../services/authService';
import {
  ShieldCheck,
  Tag,
  Lock,
  CheckCircle,
  ShieldAlert,
  Smartphone,
  ArrowLeft,
  Calendar,
  AlertCircle,
  QrCode,
  Clock,
  RefreshCw,
  X,
  Copy,
  BadgeCheck,
  Check,
  HelpCircle,
  ChevronDown,
  Upload,
  Image,
  FileUp
} from 'lucide-react';

// ─── Indian States & Union Territories ────────────────────────────────────────
const INDIAN_STATES_AND_UTS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'OTHER', name: 'Other Country' }
];

// ─── QR Payment Modal with Screenshot Upload ─────────────────────────────────
function UPIPaymentModal({ order, onClose, onSubmitEnrollment, submitResult }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Initialise countdown from order's expiresAtMs
  useEffect(() => {
    if (!order) return;
    const tick = () => {
      const remaining = Math.max(0, Math.floor((order.expiresAtMs - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        setExpired(true);
        clearInterval(intervalRef.current);
      }
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [order]);

  const formatTime = (secs) => {
    if (secs === null) return '05:00';
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(order.upiId);
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

  const handleFileSelect = (file) => {
    setUploadError('');
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Please upload a JPG, JPEG, or PNG image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size must be under 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshotPreview(e.target.result);
      setScreenshotDataUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotPreview(null);
    setScreenshotDataUrl(null);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!screenshotDataUrl) {
      setUploadError('Please upload your payment screenshot before submitting.');
      return;
    }
    setIsSubmitting(true);
    await onSubmitEnrollment(screenshotDataUrl);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden my-4">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-electric-600 p-2 rounded-xl">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">UPI Payment — Scan &amp; Pay</h3>
              <p className="text-slate-400 text-[11px]">Scan with GPay, PhonePe, Paytm, or any UPI app</p>
            </div>
          </div>
          {!isSubmitting && !submitResult?.success && (
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">

          {/* Success State — Redirect to Thank You */}
          {submitResult?.success && (
            <div className="text-center space-y-4 py-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <BadgeCheck className="w-12 h-12 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-900">Enrollment Request Submitted!</h4>
                <p className="text-sm text-slate-500 mt-1">Redirecting to confirmation page…</p>
              </div>
            </div>
          )}

          {/* Submitting State */}
          {isSubmitting && !submitResult && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 border-4 border-electric-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <p className="font-bold text-slate-900 text-sm">Submitting your enrollment request…</p>
                <p className="text-xs text-slate-500 mt-1">Please do not close this window.</p>
              </div>
            </div>
          )}

          {/* QR + Screenshot Upload State */}
          {!isSubmitting && !submitResult?.success && (
            <>
              {/* Order Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-xs">
                <div>
                  <p className="text-slate-500 font-medium">Paying for</p>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5 leading-tight max-w-[200px] line-clamp-2">
                    {order.title}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 font-medium">Total Amount</p>
                  <p className="text-2xl font-black text-electric-600">₹{order.amount.toLocaleString()}</p>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                expired 
                  ? 'bg-red-50 text-red-600 border border-red-200' 
                  : timeLeft !== null && timeLeft < 60 
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' 
                    : 'bg-sky-50 text-sky-700 border border-sky-200'
              }`}>
                <Clock className="w-4 h-4 shrink-0" />
                {expired 
                  ? <span>QR expired. Cancel and click Pay Now for a fresh QR.</span>
                  : <span>QR code expires in <strong>{formatTime(timeLeft)}</strong></span>
                }
              </div>

              {/* QR Code */}
              {!expired ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 shadow-inner">
                    <img
                      src={order.qrUrl}
                      alt="UPI QR Code"
                      className="w-44 h-44 object-contain"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">
                    Open <strong>PhonePe, Google Pay, Paytm</strong> or any UPI app → Scan QR → Pay
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center space-y-2">
                  <p className="text-sm font-bold text-red-700">QR Session Expired</p>
                  <p className="text-xs text-red-600">
                    Click <strong>Cancel</strong> and then <strong>Pay Now</strong> to generate a fresh QR.
                  </p>
                </div>
              )}

              {/* UPI ID Copy */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">UPI ID</p>
                  <p className="text-sm font-extrabold text-slate-900 font-mono">{order.upiId}</p>
                </div>
                <button
                  type="button"
                  onClick={copyUPI}
                  className="flex items-center space-x-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              {/* ─── SCREENSHOT UPLOAD SECTION ─── */}
              {!expired && (
                <div className="border-t border-slate-200 pt-5 space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-1.5">
                    <Upload className="w-4 h-4 text-electric-600" />
                    <span>Upload Payment Screenshot <span className="text-red-500">*</span></span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    After completing payment, take a screenshot of the successful transaction and upload it below.
                  </p>

                  {/* Screenshot Preview */}
                  {screenshotPreview ? (
                    <div className="relative">
                      <img
                        src={screenshotPreview}
                        alt="Payment screenshot preview"
                        className="w-full max-h-48 object-contain rounded-xl border border-slate-200 bg-slate-50"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveScreenshot}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow cursor-pointer"
                        title="Remove screenshot"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Screenshot ready for submission</span>
                      </p>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                        dragOver
                          ? 'border-electric-500 bg-electric-50/50'
                          : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                      }`}
                    >
                      <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">
                        Drag &amp; drop or click to upload screenshot
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Accepted formats: JPG, PNG, JPEG (Max 5MB)
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />

                  {uploadError && (
                    <p className="text-[11px] text-red-500 font-bold">{uploadError}</p>
                  )}

                  {/* Submit Enrollment Button */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!screenshotDataUrl || isSubmitting}
                    className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer ${
                      screenshotDataUrl
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Submit Enrollment Request</span>
                  </button>
                </div>
              )}

              {/* Cancel Link */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel Payment
                </button>
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Secure manual UPI verification</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Checkout Component ──────────────────────────────────────────────────
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

  // Resolve target course or combo pack
  const selectedCourse = useMemo(() => {
    if (!courseId) return null;
    return courses.find(c => c.id === courseId || c.slug === courseId);
  }, [courses, courseId]);

  const selectedCombo = useMemo(() => {
    if (!comboId) return null;
    return valuePacks.find(v => v.id === comboId);
  }, [valuePacks, comboId]);

  const targetItem = selectedCombo || selectedCourse || courses[0];
  const isCombo = !!selectedCombo;

  const basePrice = targetItem ? targetItem.price : 2999;
  const originalPrice = targetItem?.originalPrice || (basePrice + 2000);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Student form state
  const [studentForm, setStudentForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone ? sanitizeMobile10(currentUser.phone) : ''
  });

  // Billing address state (persisted in localStorage for repeat checkout)
  const [billingAddress, setBillingAddress] = useState(() => {
    try {
      const saved = localStorage.getItem('THYNK_BILLING_ADDRESS_V1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      country: 'India',
      state: 'Tamil Nadu',
      address1: '',
      address2: '',
      city: '',
      postalCode: '',
      gstin: ''
    };
  });

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Prefill details from currentUser
  useEffect(() => {
    if (currentUser) {
      setStudentForm(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone ? sanitizeMobile10(currentUser.phone) : prev.phone
      }));
    } else {
      openAuthModal(window.location.pathname + window.location.search, 'signup');
    }
  }, [currentUser, openAuthModal]);

  // QR Modal state
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  const expiryDatePreview = useMemo(() => {
    const exp = calculateSixCalendarMonthsExpiry();
    return new Date(exp).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }, []);

  // Coupon Handlers
  const handleApplyCoupon = (e) => {
    if (e) e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    const res = validateCoupon(couponCode.trim(), basePrice);
    if (res.valid) {
      setAppliedCoupon(res);
      setCouponError('');
      showToast(res.message || 'Coupon applied successfully!');
    } else {
      setAppliedCoupon(null);
      setCouponError(res.message || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    showToast('Coupon removed');
  };

  const finalAmount = appliedCoupon ? appliedCoupon.finalPrice : basePrice;

  // Determine course IDs to enroll
  const courseIdsToEnroll = useMemo(() => {
    if (isCombo && targetItem?.courseIds) return targetItem.courseIds;
    if (isCombo && targetItem?.courses) return targetItem.courses.map(c => c.id || c);
    return targetItem ? [targetItem.id] : [];
  }, [isCombo, targetItem]);

  // Comprehensive Form Validation
  const validateForm = () => {
    const errors = {};

    // 1. Student info
    if (!studentForm.name || studentForm.name.trim().length < 2) {
      errors.name = 'Full name is required';
    }
    if (!studentForm.email || !isValidEmail(studentForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!studentForm.phone || !isValidIndianMobile(studentForm.phone)) {
      errors.phone = 'Enter a valid 10-digit Indian mobile number';
    }

    // 2. Billing address
    if (!billingAddress.country) {
      errors.country = 'Country is required';
    }
    if (!billingAddress.state) {
      errors.state = 'State / Union Territory is required';
    }
    if (!billingAddress.address1 || billingAddress.address1.trim().length < 3) {
      errors.address1 = 'Address Line 1 is required';
    }
    if (!billingAddress.city || billingAddress.city.trim().length < 2) {
      errors.city = 'City is required';
    }

    if (billingAddress.country === 'India') {
      const pinRegex = /^[1-9][0-9]{5}$/;
      if (!billingAddress.postalCode || !pinRegex.test(billingAddress.postalCode.trim())) {
        errors.postalCode = 'Enter a valid 6-digit PIN code';
      }
    } else {
      if (!billingAddress.postalCode || billingAddress.postalCode.trim().length < 3) {
        errors.postalCode = 'Postal Code is required';
      }
    }

    // 3. Terms
    if (!agreeTerms) {
      errors.terms = 'You must acknowledge the No-Refund Policy before proceeding';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Pay Now button click
  const handlePayNow = async (e) => {
    if (e) e.preventDefault();

    if (!currentUser) {
      openAuthModal(window.location.pathname + window.location.search, 'signin');
      return;
    }

    if (!validateForm()) {
      showToast('Please correct the highlighted errors before paying.', 'error');
      // Scroll to top or first error
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    // Save billing address to localStorage
    try {
      localStorage.setItem('THYNK_BILLING_ADDRESS_V1', JSON.stringify(billingAddress));
    } catch {
      // ignore
    }

    // Generate unique UPI order with QR code
    const result = await createUPIOrder({
      userId: currentUser.id,
      itemId: targetItem.id,
      itemType: isCombo ? 'value_pack' : 'course',
      amount: finalAmount,
      couponCode: appliedCoupon?.code || null,
      discountAmount: appliedCoupon?.discount || 0,
      title: targetItem.name || targetItem.title || 'THYNK Digital Course',
      billingAddress,
      studentInfo: studentForm
    });

    if (!result.success) {
      showToast('Failed to generate payment order. Please try again.', 'error');
      return;
    }

    setActiveOrder(result.order);
    setSubmitResult(null);
    setShowQRModal(true);
  };

  // Submit Enrollment Request with Screenshot
  const handleSubmitEnrollment = useCallback(async (screenshotDataUrl) => {
    if (!activeOrder || !currentUser) return;

    const result = submitEnrollmentRequest({
      userId: currentUser.id,
      studentName: studentForm.name || currentUser.name || 'Student',
      email: studentForm.email || currentUser.email,
      phone: studentForm.phone || currentUser.phone || '',
      itemId: activeOrder.itemId,
      itemType: activeOrder.itemType,
      itemName: activeOrder.title || targetItem?.name || targetItem?.title || 'THYNK Digital Course',
      courseIds: courseIdsToEnroll,
      amount: activeOrder.amount || finalAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      discountAmount: appliedCoupon?.discount || 0,
      screenshotDataUrl,
      billingAddress
    });

    setSubmitResult(result);

    if (result.success) {
      showToast('Enrollment request submitted successfully!', 'success');
      setTimeout(() => {
        setShowQRModal(false);
        navigate(`/enrollment-confirmation?ref=${result.request.refId}`);
      }, 1500);
    } else {
      showToast(result.error || 'Failed to submit enrollment request.', 'error');
      if (result.existingRefId) {
        setTimeout(() => {
          setShowQRModal(false);
          navigate(`/enrollment-confirmation?ref=${result.existingRefId}`);
        }, 1500);
      }
    }
  }, [activeOrder, currentUser, studentForm, targetItem, courseIdsToEnroll, finalAmount, appliedCoupon, billingAddress, showToast, navigate]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-8 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Back Link */}
        <div>
          <Link
            to={isCombo ? '/value-packs' : '/courses'}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isCombo ? 'Back to Value Packs' : 'Back to Courses'}</span>
          </Link>
        </div>

        {/* Guest alert if not logged in */}
        {!currentUser && (
          <div className="bg-amber-50 border border-amber-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
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
              className="bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm shrink-0 cursor-pointer"
            >
              Sign In / Sign Up
            </button>
          </div>
        )}

        {/* Page Title (Udemy reference style) */}
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
            Checkout to start learning
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            One-time payment for 6 calendar months unrestricted course access.
          </p>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ════ LEFT COLUMN: Course Card, Student Info, Billing Address, Payment Method ════ */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. SELECTED PRODUCT CARD (Udemy style: thumbnail + title + summary + included badge) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={targetItem.thumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80'}
                  alt={targetItem.name || targetItem.title}
                  className="w-full sm:w-28 h-28 object-cover rounded-xl border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-electric-50 text-electric-700 border border-electric-200">
                      {isCombo ? 'Combo Value Pack' : (targetItem.badge || 'Individual Course')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      One-Time Purchase
                    </span>
                  </div>
                  <h2 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
                    {targetItem.name || targetItem.title}
                  </h2>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {targetItem.shortDesc || targetItem.description || 'Full practical training in Tamil with hands-on projects, assignments, and verified certification.'}
                  </p>
                  <div className="text-xs text-slate-600 flex items-center space-x-3 pt-1">
                    <span>Language: <strong className="text-slate-800">Tamil (தமிழ்)</strong></span>
                    <span>•</span>
                    <span>Validity: <strong className="text-slate-800">6 Months</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. STUDENT INFORMATION */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-electric-600" />
                  <span>Student Information</span>
                </h3>
                {currentUser && (
                  <span className="text-[11px] font-bold text-slate-400">
                    Logged in as {currentUser.email}
                  </span>
                )}
              </div>

              <div className="space-y-4 text-xs">
                {/* Full Name */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentForm.name}
                    onChange={(e) => {
                      setStudentForm({ ...studentForm, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                    }}
                    placeholder="e.g. Karthik Raja"
                    className={`w-full p-3 bg-slate-50 border rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-electric-500 ${
                      formErrors.name ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-red-500 font-bold mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => {
                      setStudentForm({ ...studentForm, email: e.target.value });
                      if (formErrors.email) setFormErrors({ ...formErrors, email: null });
                    }}
                    placeholder="student@example.com"
                    className={`w-full p-3 bg-slate-50 border rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-electric-500 ${
                      formErrors.email ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-red-500 font-bold mt-1">{formErrors.email}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">Course access and completion certificate will be sent to this email.</p>
                </div>

                {/* Mobile Number with fixed +91 */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Indian Mobile Number / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs font-bold text-slate-700">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={studentForm.phone}
                      onChange={(e) => {
                        const cleaned = sanitizeMobile10(e.target.value);
                        setStudentForm({ ...studentForm, phone: cleaned });
                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: null });
                      }}
                      placeholder="9876543210 (10 digits)"
                      className={`flex-1 p-3 bg-slate-50 border rounded-r-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-electric-500 ${
                        formErrors.phone ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-[11px] text-red-500 font-bold mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. BILLING ADDRESS (Udemy reference images 3 & 4) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base">Billing address</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Required for issuing your digital tax invoice and payment verification.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Row 1: Country & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={billingAddress.country}
                      onChange={(e) => {
                        setBillingAddress({ ...billingAddress, country: e.target.value });
                        if (formErrors.country) setFormErrors({ ...formErrors, country: null });
                      }}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-electric-500"
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      State / Union Territory <span className="text-red-500">*</span>
                    </label>
                    {billingAddress.country === 'India' ? (
                      <select
                        value={billingAddress.state}
                        onChange={(e) => {
                          setBillingAddress({ ...billingAddress, state: e.target.value });
                          if (formErrors.state) setFormErrors({ ...formErrors, state: null });
                        }}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-electric-500"
                      >
                        {INDIAN_STATES_AND_UTS.map(stateName => (
                          <option key={stateName} value={stateName}>{stateName}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={billingAddress.state}
                        onChange={(e) => {
                          setBillingAddress({ ...billingAddress, state: e.target.value });
                          if (formErrors.state) setFormErrors({ ...formErrors, state: null });
                        }}
                        placeholder="State / Province"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-electric-500"
                      />
                    )}
                    {formErrors.state && (
                      <p className="text-[11px] text-red-500 font-bold mt-1">{formErrors.state}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Address Line 1 */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={billingAddress.address1}
                    onChange={(e) => {
                      setBillingAddress({ ...billingAddress, address1: e.target.value });
                      if (formErrors.address1) setFormErrors({ ...formErrors, address1: null });
                    }}
                    placeholder="House / Flat No., Street, Area"
                    className={`w-full p-3 bg-slate-50 border rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-electric-500 ${
                      formErrors.address1 ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.address1 && (
                    <p className="text-[11px] text-red-500 font-bold mt-1">{formErrors.address1}</p>
                  )}
                </div>

                {/* Row 3: Address Line 2 (Optional) */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Address Line 2 / Landmark <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={billingAddress.address2}
                    onChange={(e) => setBillingAddress({ ...billingAddress, address2: e.target.value })}
                    placeholder="Apartment, suite, unit, landmark"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-electric-500"
                  />
                </div>

                {/* Row 4: City & PIN Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={billingAddress.city}
                      onChange={(e) => {
                        setBillingAddress({ ...billingAddress, city: e.target.value });
                        if (formErrors.city) setFormErrors({ ...formErrors, city: null });
                      }}
                      placeholder="e.g. Chennai, Coimbatore, Madurai"
                      className={`w-full p-3 bg-slate-50 border rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-electric-500 ${
                        formErrors.city ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.city && (
                      <p className="text-[11px] text-red-500 font-bold mt-1">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      PIN Code / Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={billingAddress.postalCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setBillingAddress({ ...billingAddress, postalCode: val });
                        if (formErrors.postalCode) setFormErrors({ ...formErrors, postalCode: null });
                      }}
                      placeholder="600001 (6 digits)"
                      className={`w-full p-3 bg-slate-50 border rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-electric-500 ${
                        formErrors.postalCode ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.postalCode && (
                      <p className="text-[11px] text-red-500 font-bold mt-1">{formErrors.postalCode}</p>
                    )}
                  </div>
                </div>

                {/* Optional GSTIN */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    GSTIN / Tax ID <span className="text-slate-400 font-normal">(Optional — for business invoice)</span>
                  </label>
                  <input
                    type="text"
                    value={billingAddress.gstin}
                    onChange={(e) => setBillingAddress({ ...billingAddress, gstin: e.target.value.toUpperCase() })}
                    placeholder="e.g. 33AAAAA0000A1Z5"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs uppercase focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-electric-500"
                  />
                </div>
              </div>
            </div>

            {/* 4. PAYMENT METHOD — UPI ONLY (Udemy reference image 4 style) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base">Payment Method</h3>
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                  <span>Secure and encrypted</span>
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>

              {/* UPI Radio Box (matching Udemy selection UI) */}
              <div className="border-2 border-electric-600 rounded-2xl overflow-hidden bg-electric-50/30">
                <div className="p-4 flex items-center justify-between border-b border-electric-100 bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full border-2 border-electric-600 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-electric-600" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 text-sm">UPI</span>
                      <span className="text-xs text-slate-500">— Scan and Pay</span>
                    </div>
                  </div>

                  {/* UPI Badge */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-black tracking-wider text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 font-mono">
                      UPI
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3 text-xs text-slate-600">
                  <p>
                    Scan the QR code using your preferred UPI app, such as <strong>Google Pay, PhonePe, Paytm, BHIM, or CRED</strong>, and complete your payment.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Click the <strong>"Pay Now"</strong> button in the summary to generate a QR code for UPI payment.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {['Google Pay', 'PhonePe', 'Paytm', 'CRED', 'BHIM UPI'].map(app => (
                      <span key={app} className="text-[10px] font-bold bg-white text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. 6-Calendar-Months Access Notice */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 space-y-1.5 text-xs">
              <div className="flex items-center space-x-2 text-emerald-900 font-extrabold">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>6 CALENDAR MONTHS ACCESS GUARANTEE</span>
              </div>
              <p className="text-emerald-800 leading-relaxed text-[11px]">
                Your enrollment provides unrestricted access to all recorded Tamil video lessons, doubt sessions, and assignments for exactly <strong>6 calendar months</strong> until <strong>{expiryDatePreview}</strong>.
              </p>
            </div>

          </div>

          {/* ════ RIGHT COLUMN: Summary Panel (Udemy Reference Images 3 & 4) ════ */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">

            {/* Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-extrabold text-slate-900 font-display">Summary</h3>
                <div className="flex items-baseline justify-between mt-3">
                  <span className="text-sm font-bold text-slate-600">Total due today:</span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                    ₹{finalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Course Item Line */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-start text-slate-700 font-medium">
                  <span className="pr-2 leading-relaxed font-semibold text-slate-900">
                    {targetItem.name || targetItem.title}
                  </span>
                  <span className="font-bold text-slate-900 shrink-0">
                    ₹{basePrice.toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Original value: <span className="line-through">₹{originalPrice.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-emerald-600 font-bold pt-1">
                    <span>Promotional coupon:</span>
                    <span>- ₹{appliedCoupon.discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Promotions / Coupons Area (matching Udemy "Promotions") */}
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-xs">Promotions</h4>
                  {appliedCoupon && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Applied
                    </span>
                  )}
                </div>

                {/* If coupon is applied */}
                {appliedCoupon ? (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-emerald-900 font-mono text-xs">
                        {appliedCoupon.code} <span className="font-normal font-sans text-emerald-700">is applied</span>
                      </p>
                      <p className="text-[10px] text-emerald-600 mt-0.5">
                        {appliedCoupon.discountType === 'percentage'
                          ? `${appliedCoupon.discountValue}% off for your purchase`
                          : `₹${appliedCoupon.discountValue} off for your purchase`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          if (couponError) setCouponError('');
                        }}
                        placeholder="Enter coupon code"
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-electric-500"
                      />
                      <button
                        type="submit"
                        className="bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-2xs cursor-pointer"
                      >
                        Apply Coupon
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-red-500 font-bold">{couponError}</p>
                    )}
                  </form>
                )}

                {/* Quick available codes */}
                {!appliedCoupon && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => { setCouponCode('THYNK10'); setCouponError(''); }}
                      className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      THYNK10 (10% OFF)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCouponCode('STUDENT500'); setCouponError(''); }}
                      className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      STUDENT500 (₹500 OFF)
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{basePrice.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>- ₹{appliedCoupon.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-100">
                  <span>Total Amount Payable</span>
                  <span className="text-electric-600 font-display">₹{finalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* No-Refund Policy Acknowledgment */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (formErrors.terms) setFormErrors({ ...formErrors, terms: null });
                    }}
                    className="w-4 h-4 mt-0.5 text-electric-600 rounded border-slate-300 focus:ring-electric-500"
                  />
                  <span className="text-xs text-slate-600 font-medium leading-relaxed">
                    I acknowledge that THYNK LMS maintains a strict <strong>No-Refund Policy</strong> for immediate digital video course and doubt session access.
                  </span>
                </label>
                {formErrors.terms && (
                  <p className="text-[11px] text-red-500 font-bold pl-6">{formErrors.terms}</p>
                )}
              </div>

              {/* Pay Now Button (Udemy style prominent action) */}
              <button
                type="button"
                onClick={handlePayNow}
                id="checkout-pay-now-btn"
                className={`w-full py-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg cursor-pointer ${
                  agreeTerms
                    ? 'bg-electric-600 hover:bg-electric-700 text-white shadow-electric-600/25 active:scale-[0.99]'
                    : 'bg-electric-600/70 hover:bg-electric-600 text-white shadow-electric-600/15'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Pay Now (₹{finalAmount.toLocaleString()})</span>
              </button>

              <p className="text-[10px] text-center text-slate-400 leading-normal">
                By clicking "Pay Now", you authorize THYNK Digital Academy to generate a secure UPI QR payment session.
              </p>

            </div>

            {/* Why THYNK Trust Badges */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Why learn with THYNK Digital Academy?
              </p>
              <div className="space-y-2.5">
                {[
                  { icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />, title: '100% Secure UPI Payment', desc: 'Direct verification with bank UPI protocols' },
                  { icon: <Calendar className="w-4 h-4 text-electric-600" />, title: '6 Calendar Months Access', desc: 'Recorded lessons & live Tamil doubt sessions' },
                  { icon: <CheckCircle className="w-4 h-4 text-sky-600" />, title: 'Instant LMS Activation', desc: 'Immediate access upon QR payment verification' },
                  { icon: <BadgeCheck className="w-4 h-4 text-amber-500" />, title: 'Official Certificate', desc: 'Verifiable completion certificate for your resume' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3 text-xs">
                    <div className="p-1 rounded-lg bg-slate-50 border border-slate-100 shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">{item.title}</span>
                      <span className="text-[11px] text-slate-500">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* UPI QR Payment Modal */}
      {showQRModal && activeOrder && (
        <UPIPaymentModal
          order={activeOrder}
          onClose={() => setShowQRModal(false)}
          onSubmitEnrollment={handleSubmitEnrollment}
          submitResult={submitResult}
        />
      )}
    </div>
  );
}
