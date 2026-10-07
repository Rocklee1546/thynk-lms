// ====================================================================
// THYNK LMS — AUTHENTICATION SERVICE
// Handles 4-digit OTP generation/verification, password policies,
// multi-device session management, and role-based access control.
// ====================================================================

import { logAuditEvent } from './auditService';

const USERS_DB_KEY = 'THYNK_REGISTERED_USERS_V2';
const SESSIONS_DB_KEY = 'THYNK_ACTIVE_SESSIONS_V2';
const OTP_STORE_KEY = 'THYNK_ACTIVE_OTPS_V2';

// Helper: Validate email address
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Helper: Validate Indian mobile number (10 digits) or international E.164
export const isValidMobile = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  return /^[6-9]\d{9}$/.test(cleaned) || /^\d{10,13}$/.test(cleaned);
};

// Format phone standard
export const formatPhone = (phone) => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return cleaned.startsWith('+') ? cleaned : `+91${cleaned.replace(/^0+/, '')}`;
};

// Get registered users
export const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) {
      // Default seed users
      const defaultUsers = [
        {
          id: 'usr-student-1',
          name: 'Karthik Raja',
          email: 'student@thynk.com',
          phone: '+919876512345',
          passwordHash: 'thynk2026', // Simulated hash
          role: 'student',
          emailVerified: true,
          phoneVerified: true,
          authMethod: 'phone_otp',
          createdAt: '2026-08-01T10:00:00Z',
          lastLogin: new Date().toISOString(),
          enrolledCourseIds: ['dm-career-pack'],
          communicationPreferences: {
            emailConsent: true,
            whatsappConsent: true,
            unsubscribed: false
          }
        },
        {
          id: 'usr-admin-1',
          name: 'THYNK Master Admin',
          email: 'admin@thynk.com',
          phone: '+919876500000',
          passwordHash: 'admin2026',
          role: 'admin',
          emailVerified: true,
          phoneVerified: true,
          authMethod: 'password',
          createdAt: '2026-01-01T00:00:00Z',
          lastLogin: new Date().toISOString(),
          enrolledCourseIds: [],
          communicationPreferences: {
            emailConsent: true,
            whatsappConsent: true,
            unsubscribed: false
          }
        }
      ];
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveUsers = (users) => {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

// --------------------------------------------------------------------
// OTP SERVICE (4-Digit Server Simulation with 5-minute expiry & rate limits)
// --------------------------------------------------------------------
export const requestOtp = async (target, purpose = 'signup') => {
  const isEmail = target.includes('@');
  const normalizedTarget = isEmail ? target.toLowerCase().trim() : formatPhone(target);

  if (isEmail && !isValidEmail(normalizedTarget)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!isEmail && !isValidMobile(target)) {
    return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
  }

  // Check if account already exists when performing signup
  if (purpose === 'signup') {
    const users = getStoredUsers();
    const existing = users.find(u => 
      (u.email && u.email.toLowerCase() === normalizedTarget) || 
      (u.phone && u.phone === normalizedTarget)
    );
    if (existing) {
      return { 
        success: false, 
        error: 'An account with this email/mobile already exists. Please Log In.',
        isExisting: true
      };
    }
  }

  // Generate strict 4-digit numeric OTP
  const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  // Save OTP store
  const otpStore = JSON.parse(localStorage.getItem(OTP_STORE_KEY) || '{}');
  
  // Rate limiting: Check if user requested more than 5 times in last 10 mins
  const previous = otpStore[normalizedTarget];
  if (previous && previous.requestsCount >= 5 && Date.now() - previous.firstRequestTime < 10 * 60 * 1000) {
    return { success: false, error: 'Too many OTP requests. Please wait a few minutes before trying again.' };
  }

  otpStore[normalizedTarget] = {
    code: otpCode,
    expiresAt,
    attempts: 0,
    requestsCount: (previous?.requestsCount || 0) + 1,
    firstRequestTime: previous?.firstRequestTime || Date.now(),
    purpose
  };

  localStorage.setItem(OTP_STORE_KEY, JSON.stringify(otpStore));

  logAuditEvent('otp_requested', {
    actorId: normalizedTarget,
    entityType: 'otp',
    entityId: purpose,
    metadata: { isEmail, target: normalizedTarget, expiresAt }
  });

  return {
    success: true,
    message: `A 4-digit verification OTP has been sent to ${isEmail ? 'your email' : 'your mobile number'}.`,
    target: normalizedTarget,
    isEmail,
    demoCode: otpCode
  };
};

export const verifyOtp = async (target, inputOtp) => {
  if (!inputOtp || inputOtp.trim().length !== 4) {
    return { success: false, error: 'Please enter the 4-digit OTP.' };
  }

  const isEmail = target.includes('@');
  const normalizedTarget = isEmail ? target.toLowerCase().trim() : formatPhone(target);

  const otpStore = JSON.parse(localStorage.getItem(OTP_STORE_KEY) || '{}');
  const record = otpStore[normalizedTarget];

  if (!record) {
    return { success: false, error: 'No OTP request found. Please request a new OTP.' };
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[normalizedTarget];
    localStorage.setItem(OTP_STORE_KEY, JSON.stringify(otpStore));
    return { success: false, error: 'OTP has expired. Please request a new OTP.' };
  }

  if (record.attempts >= 4) {
    delete otpStore[normalizedTarget];
    localStorage.setItem(OTP_STORE_KEY, JSON.stringify(otpStore));
    return { success: false, error: 'Too many incorrect attempts. This OTP has been invalidated. Please request a new one.' };
  }

  if (record.code !== inputOtp.trim()) {
    record.attempts += 1;
    localStorage.setItem(OTP_STORE_KEY, JSON.stringify(otpStore));
    return { success: false, error: 'Incorrect OTP. Please enter the correct OTP.' };
  }

  // OTP verified successfully
  delete otpStore[normalizedTarget];
  localStorage.setItem(OTP_STORE_KEY, JSON.stringify(otpStore));

  logAuditEvent('otp_verified', {
    actorId: normalizedTarget,
    entityType: 'otp',
    entityId: record.purpose,
    metadata: { target: normalizedTarget }
  });

  return {
    success: true,
    message: 'OTP verified successfully.',
    target: normalizedTarget,
    isEmail
  };
};

// --------------------------------------------------------------------
// USER REGISTRATION & SIGN IN
// --------------------------------------------------------------------
export const registerNewUser = async ({ name, target, password, confirmPassword, whatsappConsent = true, emailConsent = true }) => {
  if (!name || name.trim().length < 2) {
    return { success: false, error: 'Please enter your full name.' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match. Please enter the password again.' };
  }

  const isEmail = target.includes('@');
  const normalizedTarget = isEmail ? target.toLowerCase().trim() : formatPhone(target);

  const users = getStoredUsers();
  const existing = users.find(u => 
    (u.email && u.email.toLowerCase() === normalizedTarget) || 
    (u.phone && u.phone === normalizedTarget)
  );

  if (existing) {
    return { 
      success: false, 
      error: 'An account already exists with these details. Please log in.',
      isExisting: true
    };
  }

  const newUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: name.trim(),
    email: isEmail ? normalizedTarget : '',
    phone: isEmail ? '' : normalizedTarget,
    passwordHash: password,
    role: 'student',
    emailVerified: isEmail,
    phoneVerified: !isEmail,
    authMethod: isEmail ? 'email_otp' : 'phone_otp',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    enrolledCourseIds: [],
    communicationPreferences: {
      emailConsent: !!emailConsent,
      whatsappConsent: !!whatsappConsent,
      unsubscribed: false,
      updatedAt: new Date().toISOString()
    }
  };

  users.push(newUser);
  saveUsers(users);

  const session = createSession(newUser);

  logAuditEvent('account_created', {
    actorId: newUser.id,
    actorRole: newUser.role,
    entityType: 'user',
    entityId: newUser.id,
    metadata: { name: newUser.name, email: newUser.email, phone: newUser.phone }
  });

  return {
    success: true,
    user: newUser,
    session,
    message: 'Account created successfully! Welcome to THYNK LMS.'
  };
};

export const loginWithPassword = async (target, password) => {
  if (!target || !password) {
    return { success: false, error: 'Please enter your registered email/mobile and password.' };
  }

  const isEmail = target.includes('@');
  const normalizedTarget = isEmail ? target.toLowerCase().trim() : formatPhone(target);

  const users = getStoredUsers();
  const user = users.find(u => 
    (u.email && u.email.toLowerCase() === normalizedTarget) || 
    (u.phone && u.phone === normalizedTarget) ||
    u.phone === target ||
    u.email === target
  );

  if (!user || user.passwordHash !== password) {
    // Security Requirement 8: Generic error message for security reasons
    return { success: false, error: 'Incorrect email/mobile number or password.' };
  }

  user.lastLogin = new Date().toISOString();
  saveUsers(users);

  const session = createSession(user);

  logAuditEvent('login_password', {
    actorId: user.id,
    actorRole: user.role,
    entityType: 'session',
    entityId: session.token,
    metadata: { email: user.email, phone: user.phone }
  });

  return {
    success: true,
    user,
    session,
    message: `Welcome back, ${user.name}!`
  };
};

export const loginWithGoogleAccount = async (googleUser) => {
  const users = getStoredUsers();
  let existing = users.find(u => u.email && u.email.toLowerCase() === googleUser.email.toLowerCase());

  if (existing) {
    existing.lastLogin = new Date().toISOString();
    saveUsers(users);
    const session = createSession(existing);
    return { success: true, user: existing, session, message: `Welcome back, ${existing.name}!` };
  }

  const newUser = {
    id: `usr-g-${Date.now()}`,
    name: googleUser.name || 'Google Student',
    email: googleUser.email.toLowerCase(),
    phone: '',
    passwordHash: null,
    role: 'student',
    emailVerified: true,
    phoneVerified: false,
    authMethod: 'google',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    enrolledCourseIds: [],
    communicationPreferences: {
      emailConsent: true,
      whatsappConsent: false,
      unsubscribed: false
    }
  };

  users.push(newUser);
  saveUsers(users);
  const session = createSession(newUser);
  return { success: true, user: newUser, session, message: 'Google Sign-In successful!' };
};

export const loginWithVerifiedOtp = async (target) => {
  const isEmail = target.includes('@');
  const normalizedTarget = isEmail ? target.toLowerCase().trim() : formatPhone(target);

  const users = getStoredUsers();
  let user = users.find(u => 
    (u.email && u.email.toLowerCase() === normalizedTarget) || 
    (u.phone && u.phone === normalizedTarget) ||
    u.phone === target ||
    u.email === target
  );

  if (!user) {
    return { 
      success: false, 
      isNewUser: true,
      error: 'No registered account found. Please Sign Up to create your account.' 
    };
  }

  if (isEmail) user.emailVerified = true;
  if (!isEmail) user.phoneVerified = true;
  user.lastLogin = new Date().toISOString();
  saveUsers(users);

  const session = createSession(user);

  logAuditEvent('login_otp', {
    actorId: user.id,
    actorRole: user.role,
    entityType: 'session',
    entityId: session.token,
    metadata: { target: normalizedTarget }
  });

  return {
    success: true,
    user,
    session,
    message: `Welcome back, ${user.name}!`
  };
};

export const changeUserPassword = async (userId, oldPassword, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters.' };
  }

  const users = getStoredUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    return { success: false, error: 'User account not found.' };
  }

  if (user.passwordHash && user.passwordHash !== oldPassword) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  user.passwordHash = newPassword;
  user.updatedAt = new Date().toISOString();
  saveUsers(users);

  logAuditEvent('password_changed', {
    actorId: user.id,
    actorRole: user.role,
    entityType: 'user',
    entityId: user.id
  });

  return {
    success: true,
    message: 'Password updated successfully.'
  };
};

export const resetPasswordWithOtp = async (target, newPassword, confirmPassword) => {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Passwords do not match. Please enter the password again.' };
  }

  const isEmail = target.includes('@');
  const normalizedTarget = isEmail ? target.toLowerCase().trim() : formatPhone(target);

  const users = getStoredUsers();
  const user = users.find(u => 
    (u.email && u.email.toLowerCase() === normalizedTarget) || 
    (u.phone && u.phone === normalizedTarget)
  );

  if (!user) {
    return { success: false, error: 'User account not found.' };
  }

  user.passwordHash = newPassword;
  user.updatedAt = new Date().toISOString();
  saveUsers(users);

  logAuditEvent('password_reset', {
    actorId: user.id,
    actorRole: user.role,
    entityType: 'user',
    entityId: user.id
  });

  return {
    success: true,
    message: 'Password reset successfully! Please log in with your new password.'
  };
};

// --------------------------------------------------------------------
// MULTI-DEVICE SESSIONS & LOGOUT
// --------------------------------------------------------------------
export const createSession = (user) => {
  try {
    const sessions = JSON.parse(localStorage.getItem(SESSIONS_DB_KEY) || '[]');
    const newSession = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: user.id,
      token: `thynk_tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser',
      userAgent: navigator.userAgent,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true
    };

    sessions.push(newSession);
    localStorage.setItem(SESSIONS_DB_KEY, JSON.stringify(sessions));
    return newSession;
  } catch {
    return { token: `thynk_local_${Date.now()}`, userId: user.id };
  }
};

export const logoutAllDevices = (userId) => {
  try {
    const sessions = JSON.parse(localStorage.getItem(SESSIONS_DB_KEY) || '[]');
    const updated = sessions.map(s => s.userId === userId ? { ...s, isActive: false } : s);
    localStorage.setItem(SESSIONS_DB_KEY, JSON.stringify(updated));

    logAuditEvent('logout_all_devices', {
      actorId: userId,
      entityType: 'session'
    });

    return { success: true, message: 'All active sessions on all devices have been revoked.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
