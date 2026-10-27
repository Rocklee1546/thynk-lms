import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getEnrollmentRequestByRefId } from '../services/enrollmentService';
import {
  CheckCircle2,
  Clock,
  Copy,
  ShieldCheck,
  MessageSquare,
  Phone,
  ArrowRight,
  Search,
  UserCheck,
  BookOpen
} from 'lucide-react';

export default function EnrollmentConfirmation() {
  const [searchParams] = useSearchParams();
  const refId = searchParams.get('ref');

  const request = useMemo(() => {
    if (!refId) return null;
    return getEnrollmentRequestByRefId(refId);
  }, [refId]);

  const copyRefId = () => {
    navigator.clipboard.writeText(refId || '');
  };

  if (!request) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-md w-full shadow-sm space-y-4">
          <Search className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-extrabold text-slate-900">Request Not Found</h2>
          <p className="text-sm text-slate-500">
            We couldn't find an enrollment request with the reference ID provided.
          </p>
          <Link
            to="/courses"
            className="inline-block bg-electric-600 hover:bg-electric-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  const submittedDate = new Date(request.submittedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
  const submittedTime = new Date(request.submittedAt).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  const statusConfig = {
    pending_verification: {
      label: 'PENDING VERIFICATION',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <Clock className="w-4 h-4 text-amber-600" />
    },
    approved: {
      label: 'APPROVED',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />
    },
    rejected: {
      label: 'REJECTED',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: <Clock className="w-4 h-4 text-red-600" />
    }
  };

  const status = statusConfig[request.status] || statusConfig.pending_verification;

  const supportPhone = '8098791513';
  const whatsappSupportUrl = `https://wa.me/91${supportPhone}?text=${encodeURIComponent(
    `Hi, I submitted an enrollment request (Ref: ${request.refId}) for ${request.itemName}. Can you please check the payment verification status?`
  )}`;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Success Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 sm:p-10 text-center space-y-4">
            {/* Green check icon */}
            <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Thank You!
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Your enrollment request has been submitted successfully.
            </p>
          </div>

          {/* Reference ID + Status Bar */}
          <div className="bg-emerald-50/60 border-t border-emerald-100 px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Reference ID</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-lg font-black text-slate-900 font-mono tracking-wide">
                  {request.refId}
                </span>
                <button
                  onClick={copyRefId}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Copy Reference ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payment Status</p>
              <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border mt-1 ${status.bg} ${status.text} ${status.border}`}>
                {status.icon}
                <span>{status.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          <h2 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
            Submission Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Student Name:</p>
              <p className="font-semibold text-slate-900 mt-0.5">{request.studentName}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Email Address:</p>
              <p className="font-semibold text-slate-900 mt-0.5">{request.email}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">WhatsApp Number:</p>
              <p className="font-semibold text-slate-900 mt-0.5">{request.phone}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Location:</p>
              <p className="font-semibold text-slate-900 mt-0.5">
                {request.billingAddress?.city || '—'}{request.billingAddress?.state ? `, ${request.billingAddress.state}` : ''}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Course:</p>
              <p className="font-bold text-slate-900 mt-0.5">{request.itemName}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Amount Paid:</p>
              <p className="font-bold text-slate-900 mt-0.5">₹{Number(request.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Payment Method:</p>
              <p className="font-semibold text-slate-900 mt-0.5">Manual UPI (MANUAL_UPI)</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Submission Date:</p>
              <p className="font-semibold text-slate-900 mt-0.5">{submittedDate}, {submittedTime}</p>
            </div>
          </div>
        </div>

        {/* What Happens Next Card */}
        <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-6 sm:p-8 space-y-5">
          <h2 className="font-extrabold text-slate-900 text-base">What Happens Next?</h2>

          <p className="text-sm text-slate-700 leading-relaxed">
            Your payment screenshot and enrollment details have been received and are awaiting verification. Our team will review the submitted information and payment evidence. Once the payment has been verified, your course access will be approved.
          </p>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-electric-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Payment Verification</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Our admin team verifies your UPI transaction within 2–3 hours.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-electric-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Course Access Approval</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Once your payment is verified, our admin team will approve access to the exact course or value pack you purchased.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-electric-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Start Learning</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  After approval, you will receive a WhatsApp message with your course access confirmation and instructions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Time + Support */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2 text-sm text-slate-700">
            <Clock className="w-5 h-5 text-electric-600 shrink-0" />
            <span className="font-bold">
              Course access is usually approved within 2–3 hours during our working hours.
            </span>
          </div>

          <div className="text-xs text-slate-500 space-y-1.5 pl-7">
            <p><strong>Working hours:</strong> Monday–Sunday, 9:00 AM – 9:00 PM</p>
            <p><strong>Emergency support:</strong> {supportPhone}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={whatsappSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Support on WhatsApp</span>
            </a>
            <Link
              to="/dashboard"
              className="flex items-center justify-center space-x-2 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Go to My Learnings</span>
            </Link>
          </div>
        </div>

        {/* Approved status — show start learning link */}
        {request.status === 'approved' && (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-emerald-900 text-base">Your Course Access Has Been Approved!</h3>
            <p className="text-xs text-emerald-700">You can now access your course from the dashboard.</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
