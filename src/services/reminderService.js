// ====================================================================
// THYNK LMS — LEAD CAPTURE & REMINDER AUTOMATION SERVICE
// Schedules Day 5, 20, 30, 60, 75, 90, 120, 150 reminders upon course view
// and instantly cancels ALL pending reminders when purchase occurs.
// ====================================================================

import { logAuditEvent } from './auditService';

const LEADS_DB_KEY = 'THYNK_LEADS_V2';
const REMINDERS_DB_KEY = 'THYNK_REMINDERS_V2';
const CONSENT_DB_KEY = 'THYNK_COMMUNICATION_CONSENT_V2';

// 8 Mandatory reminder day intervals
export const REMINDER_DAYS = [5, 20, 30, 60, 75, 90, 120, 150];

// Capture course view / lead event
export const recordCourseViewLead = ({ userId, courseId, valuePackId, userEmail, userPhone, source = 'website' }) => {
  try {
    const leads = JSON.parse(localStorage.getItem(LEADS_DB_KEY) || '[]');
    const targetId = courseId || valuePackId;
    const targetType = courseId ? 'course' : 'value_pack';

    // Avoid excessive duplicate leads for the same user & course within 24 hours
    const recentDuplicate = leads.find(l => 
      ((userId && l.userId === userId) || (userEmail && l.userEmail === userEmail)) &&
      l.targetId === targetId &&
      Date.now() - new Date(l.viewedAt).getTime() < 24 * 60 * 60 * 1000
    );

    if (recentDuplicate) {
      return recentDuplicate;
    }

    const newLead = {
      id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: userId || null,
      targetType,
      targetId,
      userEmail: userEmail || '',
      userPhone: userPhone || '',
      viewedAt: new Date().toISOString(),
      isPurchased: false,
      source
    };

    leads.push(newLead);
    localStorage.setItem(LEADS_DB_KEY, JSON.stringify(leads));

    // Schedule the 8 automated reminders
    scheduleRemindersForLead(newLead);

    logAuditEvent('course_viewed', {
      actorId: userId || userEmail || 'visitor',
      entityType: targetType,
      entityId: targetId,
      metadata: { leadId: newLead.id }
    });

    return newLead;
  } catch (err) {
    console.error('Failed to record course view lead:', err);
    return null;
  }
};

// Schedule Day 5, 20, 30, 60, 75, 90, 120, 150 reminders
export const scheduleRemindersForLead = (lead) => {
  try {
    const reminders = JSON.parse(localStorage.getItem(REMINDERS_DB_KEY) || '[]');
    const baseTime = new Date(lead.viewedAt).getTime();

    REMINDER_DAYS.forEach(day => {
      const scheduledAt = new Date(baseTime + day * 24 * 60 * 60 * 1000).toISOString();

      // Schedule for WhatsApp if phone exists
      if (lead.userPhone) {
        reminders.push({
          id: `rem-wa-${lead.id}-d${day}`,
          leadId: lead.id,
          userId: lead.userId,
          targetId: lead.targetId,
          targetType: lead.targetType,
          reminderDay: day,
          channel: 'whatsapp',
          recipient: lead.userPhone,
          scheduledAt,
          status: 'scheduled',
          sentAt: null,
          cancelledAt: null
        });
      }

      // Schedule for Email if email exists
      if (lead.userEmail) {
        reminders.push({
          id: `rem-em-${lead.id}-d${day}`,
          leadId: lead.id,
          userId: lead.userId,
          targetId: lead.targetId,
          targetType: lead.targetType,
          reminderDay: day,
          channel: 'email',
          recipient: lead.userEmail,
          scheduledAt,
          status: 'scheduled',
          sentAt: null,
          cancelledAt: null
        });
      }
    });

    localStorage.setItem(REMINDERS_DB_KEY, JSON.stringify(reminders));
  } catch (err) {
    console.error('Failed to schedule reminders for lead:', err);
  }
};

// CRITICAL REQUIREMENT: Stop all pending reminders for this user & course upon purchase
export const cancelRemindersOnPurchase = (userId, courseId) => {
  try {
    const reminders = JSON.parse(localStorage.getItem(REMINDERS_DB_KEY) || '[]');
    let cancelledCount = 0;

    const updated = reminders.map(r => {
      if ((r.userId === userId || r.targetId === courseId) && r.status === 'scheduled') {
        cancelledCount += 1;
        return {
          ...r,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancellationReason: 'Course purchased by user'
        };
      }
      return r;
    });

    localStorage.setItem(REMINDERS_DB_KEY, JSON.stringify(updated));

    // Also mark lead records as purchased
    const leads = JSON.parse(localStorage.getItem(LEADS_DB_KEY) || '[]');
    const updatedLeads = leads.map(l => {
      if (l.userId === userId || l.targetId === courseId) {
        return { ...l, isPurchased: true };
      }
      return l;
    });
    localStorage.setItem(LEADS_DB_KEY, JSON.stringify(updatedLeads));

    logAuditEvent('reminders_cancelled_purchase', {
      actorId: userId,
      entityType: 'course',
      entityId: courseId,
      metadata: { cancelledCount }
    });

    return { success: true, cancelledCount };
  } catch (err) {
    console.error('Failed to cancel reminders on purchase:', err);
    return { success: false, error: err.message };
  }
};

// Communication Consent Management
export const getCommunicationConsent = (userId) => {
  try {
    const consentStore = JSON.parse(localStorage.getItem(CONSENT_DB_KEY) || '{}');
    return consentStore[userId] || {
      emailConsent: true,
      whatsappConsent: true,
      unsubscribed: false
    };
  } catch {
    return { emailConsent: true, whatsappConsent: true, unsubscribed: false };
  }
};

export const updateCommunicationConsent = (userId, { emailConsent, whatsappConsent, unsubscribed = false }) => {
  try {
    const consentStore = JSON.parse(localStorage.getItem(CONSENT_DB_KEY) || '{}');
    consentStore[userId] = {
      emailConsent: !!emailConsent,
      whatsappConsent: !!whatsappConsent,
      unsubscribed: !!unsubscribed,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(CONSENT_DB_KEY, JSON.stringify(consentStore));

    // If unsubscribed or opted out, cancel future marketing reminders
    if (unsubscribed || (!emailConsent && !whatsappConsent)) {
      const reminders = JSON.parse(localStorage.getItem(REMINDERS_DB_KEY) || '[]');
      const updatedReminders = reminders.map(r => {
        if (r.userId === userId && r.status === 'scheduled') {
          return {
            ...r,
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
            cancellationReason: 'User opted out of marketing communications'
          };
        }
        return r;
      });
      localStorage.setItem(REMINDERS_DB_KEY, JSON.stringify(updatedReminders));
    }

    logAuditEvent('communication_preferences_updated', {
      actorId: userId,
      metadata: { emailConsent, whatsappConsent, unsubscribed }
    });

    return { success: true, message: 'Communication preferences updated successfully.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Get all leads and reminders for Admin Panel
export const getAdminLeadsAndReminders = () => {
  try {
    const leads = JSON.parse(localStorage.getItem(LEADS_DB_KEY) || '[]');
    const reminders = JSON.parse(localStorage.getItem(REMINDERS_DB_KEY) || '[]');
    return { leads, reminders };
  } catch {
    return { leads: [], reminders: [] };
  }
};

export const getLeads = () => {
  try {
    const leads = JSON.parse(localStorage.getItem(LEADS_DB_KEY) || '[]');
    const reminders = JSON.parse(localStorage.getItem(REMINDERS_DB_KEY) || '[]');

    return leads.map(l => {
      const leadReminders = reminders.filter(r => r.leadId === l.id);
      const isCancelled = leadReminders.some(r => r.status === 'cancelled');

      return {
        ...l,
        courseTitle: l.targetId,
        cancelled: isCancelled || l.isPurchased,
        hasPurchased: l.isPurchased,
        scheduledReminders: leadReminders.map(r => ({
          intervalDays: r.reminderDay,
          scheduledForDate: new Date(r.scheduledAt).toLocaleDateString('en-IN'),
          sent: r.status === 'sent',
          status: r.status
        }))
      };
    });
  } catch {
    return [];
  }
};
