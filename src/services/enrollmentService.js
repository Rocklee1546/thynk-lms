// ====================================================================
// THYNK LMS — MANUAL UPI ENROLLMENT SERVICE
// Handles enrollment requests with screenshot upload verification,
// admin approval workflow, and course-level access control.
// ====================================================================

import { logAuditEvent } from './auditService';
import { getStoredEnrollments, saveEnrollments, calculateSixCalendarMonthsExpiry } from './paymentService';
import { cancelRemindersOnPurchase } from './reminderService';

const ENROLLMENT_REQUESTS_KEY = 'THYNK_ENROLLMENT_REQUESTS_V1';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateRefId = () => {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `REF-THYNK-${num}`;
};

const getRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(ENROLLMENT_REQUESTS_KEY) || '[]');
  } catch { return []; }
};

const saveRequests = (requests) => {
  localStorage.setItem(ENROLLMENT_REQUESTS_KEY, JSON.stringify(requests));
};

// ─── Submit Enrollment Request ───────────────────────────────────────────────

/**
 * Submit a new enrollment request with payment screenshot.
 * Status starts as 'pending_verification'. No course access is granted.
 */
export const submitEnrollmentRequest = ({
  userId,
  studentName,
  email,
  phone,
  itemId,
  itemType, // 'course' or 'value_pack'
  itemName,
  courseIds, // array of course IDs to enroll (for value packs, all included)
  amount,
  couponCode,
  discountAmount,
  screenshotDataUrl, // base64 data URL of the uploaded screenshot
  billingAddress
}) => {
  if (!userId || !itemId || !amount || !screenshotDataUrl) {
    return { success: false, error: 'Missing required enrollment details or payment screenshot.' };
  }

  // Prevent duplicate pending requests for the same item by the same user
  const existing = getRequests();
  const hasPending = existing.find(
    r => r.userId === userId && r.itemId === itemId && r.status === 'pending_verification'
  );
  if (hasPending) {
    return {
      success: false,
      error: 'You already have a pending enrollment request for this course. Please wait for admin verification.',
      existingRefId: hasPending.refId
    };
  }

  const refId = generateRefId();
  const now = new Date().toISOString();

  const request = {
    id: `enr-req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    refId,
    userId,
    studentName,
    email,
    phone,
    itemId,
    itemType,
    itemName,
    courseIds: courseIds || [itemId],
    amount,
    couponCode: couponCode || null,
    discountAmount: discountAmount || 0,
    screenshotDataUrl,
    billingAddress: billingAddress || null,
    paymentMethod: 'Manual UPI',
    status: 'pending_verification', // pending_verification | approved | rejected
    accessStatus: 'locked',         // locked | granted
    adminNotes: '',
    rejectionReason: '',
    submittedAt: now,
    reviewedAt: null,
    approvedBy: null,
    whatsappSentAt: null
  };

  existing.push(request);
  saveRequests(existing);

  logAuditEvent('enrollment_request_submitted', {
    actorId: userId,
    entityType: 'enrollment_request',
    entityId: refId,
    metadata: { itemId, itemType, amount, itemName }
  });

  return { success: true, request };
};

// ─── Get Requests ────────────────────────────────────────────────────────────

/** Get all enrollment requests (admin use) */
export const getAllEnrollmentRequests = () => getRequests();

/** Get requests for a specific user */
export const getUserEnrollmentRequests = (userId) => {
  return getRequests().filter(r => r.userId === userId);
};

/** Get a single request by refId */
export const getEnrollmentRequestByRefId = (refId) => {
  return getRequests().find(r => r.refId === refId) || null;
};

// ─── Admin: Approve Request ──────────────────────────────────────────────────

/**
 * Approve an enrollment request and grant course access.
 * Creates real enrollment records in the existing enrollment system.
 */
export const approveEnrollmentRequest = (refId, adminId, adminNotes = '') => {
  const requests = getRequests();
  const idx = requests.findIndex(r => r.refId === refId);
  if (idx < 0) return { success: false, error: 'Request not found.' };

  const req = requests[idx];

  // Prevent double-approval
  if (req.status === 'approved' && req.accessStatus === 'granted') {
    return { success: false, error: 'This request has already been approved.', alreadyApproved: true };
  }

  const now = new Date().toISOString();

  // Update request record
  requests[idx] = {
    ...req,
    status: 'approved',
    accessStatus: 'granted',
    adminNotes: adminNotes || req.adminNotes,
    reviewedAt: now,
    approvedBy: adminId
  };
  saveRequests(requests);

  // Create actual enrollments in the existing system
  const enrollments = getStoredEnrollments();
  const startedAt = now;
  const expiresAt = calculateSixCalendarMonthsExpiry(new Date());
  const courseIdsToEnroll = req.courseIds || [req.itemId];

  for (const cId of courseIdsToEnroll) {
    const existingIdx = enrollments.findIndex(e => e.userId === req.userId && e.courseId === cId);
    if (existingIdx >= 0) {
      // Renew existing enrollment
      enrollments[existingIdx].expiresAt = expiresAt;
      enrollments[existingIdx].status = 'active';
      enrollments[existingIdx].orderId = req.refId;
      enrollments[existingIdx].paymentId = `manual_upi_${req.refId}`;
    } else {
      // Create new enrollment
      enrollments.push({
        id: `enr-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        userId: req.userId,
        courseId: cId,
        orderId: req.refId,
        paymentId: `manual_upi_${req.refId}`,
        startedAt,
        expiresAt,
        status: 'active'
      });
    }
    cancelRemindersOnPurchase(req.userId, cId);
  }

  saveEnrollments(enrollments);

  // Also update student's enrolledCourseIds in database and session
  try {
    const dbStr = localStorage.getItem('THYNK_LMS_DATABASE_V3');
    if (dbStr) {
      const db = JSON.parse(dbStr);
      if (Array.isArray(db.students)) {
        const studentIdx = db.students.findIndex(s => s.id === req.userId);
        if (studentIdx >= 0) {
          const currentEnrolled = db.students[studentIdx].enrolledCourseIds || [];
          db.students[studentIdx].enrolledCourseIds = Array.from(new Set([...currentEnrolled, ...courseIdsToEnroll]));
          localStorage.setItem('THYNK_LMS_DATABASE_V3', JSON.stringify(db));
        }
      }
    }
    const sessionStr = localStorage.getItem('THYNK_USER_SESSION');
    if (sessionStr) {
      const sessionUser = JSON.parse(sessionStr);
      if (sessionUser && sessionUser.id === req.userId) {
        const currentEnrolled = sessionUser.enrolledCourseIds || [];
        sessionUser.enrolledCourseIds = Array.from(new Set([...currentEnrolled, ...courseIdsToEnroll]));
        localStorage.setItem('THYNK_USER_SESSION', JSON.stringify(sessionUser));
      }
    }
  } catch (err) {
    console.warn('Could not update user session enrolled courses:', err);
  }

  logAuditEvent('enrollment_approved', {
    actorId: adminId,
    entityType: 'enrollment_request',
    entityId: refId,
    metadata: { userId: req.userId, courseIds: courseIdsToEnroll, amount: req.amount }
  });

  return { success: true, message: 'Enrollment approved and course access granted.' };
};

// ─── Admin: Reject Request ───────────────────────────────────────────────────

export const rejectEnrollmentRequest = (refId, adminId, rejectionReason = '') => {
  const requests = getRequests();
  const idx = requests.findIndex(r => r.refId === refId);
  if (idx < 0) return { success: false, error: 'Request not found.' };

  requests[idx] = {
    ...requests[idx],
    status: 'rejected',
    accessStatus: 'locked',
    rejectionReason,
    reviewedAt: new Date().toISOString(),
    approvedBy: adminId
  };
  saveRequests(requests);

  logAuditEvent('enrollment_rejected', {
    actorId: adminId,
    entityType: 'enrollment_request',
    entityId: refId,
    metadata: { userId: requests[idx].userId, reason: rejectionReason }
  });

  return { success: true, message: 'Enrollment request rejected.' };
};

// ─── Admin: Record WhatsApp Action ───────────────────────────────────────────

export const recordWhatsAppSent = (refId) => {
  const requests = getRequests();
  const idx = requests.findIndex(r => r.refId === refId);
  if (idx < 0) return;
  requests[idx].whatsappSentAt = new Date().toISOString();
  saveRequests(requests);
};

// ─── Generate WhatsApp Approval Message URL ──────────────────────────────────

/**
 * Generates a WhatsApp click-to-chat URL with the approval message pre-filled.
 * The link opens in the admin's WhatsApp, addressed to the student's phone number.
 */
export const generateWhatsAppApprovalUrl = (request) => {
  const studentPhone = (request.phone || '').replace(/\D/g, '').slice(-10);
  if (!studentPhone || studentPhone.length !== 10) return null;

  const phoneWithCountry = `91${studentPhone}`;
  const courseName = request.itemName || 'your purchased course';
  const studentName = request.studentName || 'Student';
  const dashboardUrl = `${window.location.origin}/dashboard`;

  const message = `Hi ${studentName} 👋,

Great news! 🎉

Your payment has been verified, and your enrollment for *${courseName}* at THYNK Digital Academy has been approved successfully. ✅

🎓 Your course access is now ready!

Please log in to your THYNK Digital Academy account using your registered email address and visit *My Learnings* to access your approved course.
${dashboardUrl}

Remember, your access is for *${courseName}*.

If you need any assistance, contact our support team at 8098791513 during our working hours, Monday–Sunday, 9:00 AM–9:00 PM.

All the best with your learning journey! 🚀 Keep learning, keep growing, and keep achieving your goals.

Best wishes,
Team THYNK Digital Academy`;

  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
};
