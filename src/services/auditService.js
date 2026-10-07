// ====================================================================
// THYNK LMS — AUDIT LOG SERVICE
// Tracks critical business & user security events without logging secrets
// ====================================================================

const AUDIT_STORAGE_KEY = 'THYNK_AUDIT_LOGS_V1';

export const logAuditEvent = (eventType, { actorId, actorRole = 'student', entityType, entityId, metadata = {} }) => {
  try {
    const existing = JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '[]');
    const newEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      eventType,
      actorId: actorId || 'anonymous',
      actorRole,
      entityType: entityType || 'system',
      entityId: entityId || 'none',
      metadata: {
        ...metadata,
        // Ensure sensitive information is never captured in logs
        password: undefined,
        confirmPassword: undefined,
        otp: undefined,
        secret: undefined
      },
      timestamp: new Date().toISOString()
    };

    const updated = [newEntry, ...existing.slice(0, 199)]; // Keep latest 200 logs
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  } catch (err) {
    console.error('Failed to log audit event:', err);
    return null;
  }
};

export const getAuditLogs = () => {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};
