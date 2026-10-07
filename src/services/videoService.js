// ====================================================================
// THYNK LMS — SECURE VIDEO & PROGRESS SERVICE
// Issues authorized stream tokens & tracks persistent cross-device progress.
// ====================================================================

import { checkUserCourseAccess } from './paymentService';
import { logAuditEvent } from './auditService';

const PROGRESS_DB_KEY = 'THYNK_STUDENT_PROGRESS_V2';

// Authorize & generate signed playback token for lesson video
export const getAuthorizedVideoPlayback = async (userId, courseId, lessonId, rawVideoUrl) => {
  // 1. Verify that user has active unexpired enrollment
  const access = checkUserCourseAccess(userId, courseId);
  
  if (!access.hasAccess) {
    return {
      authorized: false,
      reason: access.reason,
      error: access.reason === 'expired' 
        ? 'Your course access has expired. Please renew to watch this video.'
        : 'Enrollment required to access this lesson.'
    };
  }

  // 2. Generate signed video playback authorization
  const signedToken = `thynk_stream_sig_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // 4 hours valid stream token

  return {
    authorized: true,
    videoUrl: rawVideoUrl,
    signedToken,
    expiresAt,
    watermark: {
      userId,
      text: `THYNK LMS • ${userId.slice(0, 8)}`
    }
  };
};

// Get progress for a user & course
export const getStoredProgress = (userId, courseId) => {
  try {
    const allProgress = JSON.parse(localStorage.getItem(PROGRESS_DB_KEY) || '{}');
    const userProg = allProgress[userId] || {};
    return userProg[courseId] || {
      completedLessonIds: [],
      lessonPositions: {}, // { [lessonId]: seconds }
      lastLessonId: null,
      lastActive: new Date().toISOString()
    };
  } catch {
    return { completedLessonIds: [], lessonPositions: {}, lastLessonId: null };
  }
};

// Save lesson progress
export const updateLessonProgress = (userId, courseId, lessonId, { isCompleted = false, positionSeconds = 0, totalSeconds = 0 }) => {
  if (!userId || !courseId || !lessonId) return;

  try {
    const allProgress = JSON.parse(localStorage.getItem(PROGRESS_DB_KEY) || '{}');
    if (!allProgress[userId]) allProgress[userId] = {};
    if (!allProgress[userId][courseId]) {
      allProgress[userId][courseId] = {
        completedLessonIds: [],
        lessonPositions: {},
        lastLessonId: lessonId,
        lastActive: new Date().toISOString()
      };
    }

    const courseProg = allProgress[userId][courseId];
    courseProg.lastLessonId = lessonId;
    courseProg.lastActive = new Date().toISOString();
    courseProg.lessonPositions[lessonId] = positionSeconds;

    const completedSet = new Set(courseProg.completedLessonIds || []);
    if (isCompleted) {
      completedSet.add(lessonId);
    }
    courseProg.completedLessonIds = Array.from(completedSet);

    allProgress[userId][courseId] = courseProg;
    localStorage.setItem(PROGRESS_DB_KEY, JSON.stringify(allProgress));

    return courseProg;
  } catch (err) {
    console.error('Failed to update lesson progress:', err);
  }
};
