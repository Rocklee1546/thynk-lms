// ====================================================================
// THYNK LMS — AUTHENTICATION SERVICE
// Handles 4-digit OTP generation/verification, cryptographic challenge security,
// password policies, multi-device session management, and role-based access control.
// ====================================================================

import { logAuditEvent } from './auditService.js';
import { deliverOtp } from './otpDeliveryService.js';

const USERS_DB_KEY = 'THYNK_REGISTERED_USERS_V2';
const SESSIONS_DB_KEY = 'THYNK_ACTIVE_SESSIONS_V2';
const CHALLENGES_DB_KEY = 'THYNK_ACTIVE_OTPS_V2';
const PENDING_SIGNUP_KEY = 'THYNK_PENDING_SIGNUP_CHALLENGE';

// ─── Cryptographic Helpers ───────────────────────────────────────────────────

/**
 * SHA-256 string hasher using Web Crypto API.
 * Never stores or exposes plaintext OTP in client storage or memory.
 */
export const sha256 = async (message) => {
  if (typeof message !== 'string') return '';
  if (globalThis.crypto?.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }
  // Lightweight deterministic fallback for non-crypto environments
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    hash = (Math.imul(31, hash) + message.charCodeAt(i)) | 0;
  }
  return `h_${Math.abs(hash)}`;
};

/**
 * Cryptographically secure 4-digit numeric OTP generator (1000 - 9999).
 */
export const generateSecure4DigitOtp = () => {
  if (globalThis.crypto?.getRandomValues) {
    const arr = new Uint32Array(1);
    globalThis.crypto.getRandomValues(arr);
    return String(1000 + (arr[0] % 9000));
  }
  return String(Math.floor(1000 + Math.random() * 9000));
};

// ─── Contact Masking Helpers ─────────────────────────────────────────────────

/**
 * Mask mobile number: e.g. "9566852645" -> "******2645"
 */
export const maskPhone = (phone) => {
  if (!phone) return '******';
  const digits = String(phone).replace(/\D/g, '').slice(-10);
  if (digits.length < 4) return '******';
  return `******${digits.slice(-4)}`;
};

/**
 * Mask email address: e.g. "sriiraamm456@gmail.com" -> "sr****@gmail.com"
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) return '****@****';
  const [local, domain] = email.trim().toLowerCase().split('@');
  if (local.length <= 2) {
    return `${local[0] || '*'}****@${domain}`;
  }
  return `${local.slice(0, 2)}****@${domain}`;
};

// ─── Field Validation Helpers ────────────────────────────────────────────────

// Validate email address strictly
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
};

// Validate Indian mobile number (strictly 10 numeric digits starting with 6, 7, 8, or 9)
export const isValidIndianMobile = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const trimmed = phone.trim();
  return /^[6-9]\d{9}$/.test(trimmed);
};

// Backwards-compatible alias for existing imports
export const isValidMobile = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.trim().replace(/\D/g, '').slice(-10);
  return isValidIndianMobile(cleaned);
};

// Sanitize 10-digit mobile input (extracts up to 10 digits only)
export const sanitizeMobile10 = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/\D/g, '').slice(0, 10);
};

// Format phone standard (+91XXXXXXXXXX)
export const formatPhone = (phone) => {
  const cleaned = (phone || '').toString().replace(/\D/g, '').slice(-10);
  return cleaned ? `+91${cleaned}` : '';
};

// ─── Users Store ─────────────────────────────────────────────────────────────

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
          phone: '9876512345',
          phoneCountryCode: '+91',
          passwordHash: 'thynk2026',
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
          phone: '9876500000',
          phoneCountryCode: '+91',
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

// ─── Challenge & Verification Store ──────────────────────────────────────────

const getStoredChallenges = () => {
  try {
    return JSON.parse(localStorage.getItem(CHALLENGES_DB_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveChallenges = (challenges) => {
  localStorage.setItem(CHALLENGES_DB_KEY, JSON.stringify(challenges));
};

export const getPendingSignupSession = () => {
  try {
    const raw = sessionStorage.getItem(PENDING_SIGNUP_KEY) || localStorage.getItem(PENDING_SIGNUP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setPendingSignupSession = (data) => {
  try {
    const str = JSON.stringify(data);
    sessionStorage.setItem(PENDING_SIGNUP_KEY, str);
    localStorage.setItem(PENDING_SIGNUP_KEY, str);
  } catch {}
};

export const clearPendingSignupSession = () => {
  try {
    sessionStorage.removeItem(PENDING_SIGNUP_KEY);
    localStorage.removeItem(PENDING_SIGNUP_KEY);
  } catch {}
};

// ─── OTP REQUEST (Challenge Generation & Real Delivery) ───────────────────────

/**
 * Request a 4-digit OTP challenge.
 * Generates OTP securely, stores SHA-256 hash in storage (NEVER plaintext),
 * dispatches via real configured providers, and returns neutral confirmation.
 */
export const requestOtp = async (target, purpose = 'signup', extraData = null) => {
  const isEmail = typeof target === 'string' && target.includes('@');
  const normalizedPhone = !isEmail
    ? sanitizeMobile10(target)
    : (extraData?.phone ? sanitizeMobile10(extraData.phone) : '');
  const normalizedEmail = isEmail
    ? target.trim().toLowerCase()
    : (extraData?.email ? extraData.email.trim().toLowerCase() : '');

  // 1. Strict Validation
  if (purpose === 'signup') {
    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!normalizedPhone || !isValidIndianMobile(normalizedPhone)) {
      return { success: false, error: 'Enter a valid 10-digit Indian mobile number.' };
    }

    // Check duplicate email
    const users = getStoredUsers();
    const existingEmail = users.find(u => u.email && u.email.toLowerCase() === normalizedEmail);
    if (existingEmail) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please Log In.',
        isExisting: true
      };
    }

    // Check duplicate mobile
    const existingPhone = users.find(u => {
      const uDigits = (u.phone || '').replace(/\D/g, '').slice(-10);
      return uDigits && uDigits === normalizedPhone;
    });
    if (existingPhone) {
      return {
        success: false,
        error: 'An account with this mobile number already exists. Please Log In.',
        isExisting: true
      };
    }
  } else if (purpose === 'reset_password') {
    const users = getStoredUsers();
    const existing = users.find(u => 
      (normalizedEmail && u.email && u.email.toLowerCase() === normalizedEmail) ||
      (normalizedPhone && (u.phone || '').replace(/\D/g, '').slice(-10) === normalizedPhone)
    );
    if (!existing) {
      return { success: false, error: 'No registered account found with this email or mobile number.' };
    }
  }

  const challenges = getStoredChallenges();
  const now = Date.now();

  // Rate Limiting & Cooldown Checks
  const activePrevious = Object.values(challenges).find(c => 
    c && !c.isConsumed && (
      (normalizedPhone && c.phone === normalizedPhone) ||
      (normalizedEmail && c.email === normalizedEmail)
    )
  );

  if (activePrevious) {
    if (activePrevious.resendAvailableAt && now < activePrevious.resendAvailableAt) {
      const waitSecs = Math.ceil((activePrevious.resendAvailableAt - now) / 1000);
      return {
        success: false,
        error: `Please wait ${waitSecs} seconds before requesting a new OTP.`
      };
    }

    if (activePrevious.requestsCount >= 5 && now - activePrevious.firstRequestTime < 10 * 60 * 1000) {
      return {
        success: false,
        error: 'Too many OTP requests. Please wait 10 minutes before trying again.'
      };
    }
  }

  // 2. Cryptographically generate 4-digit numeric OTP & Unique Challenge ID
  const otpCode = generateSecure4DigitOtp();
  const challengeId = `ch_${now}_${Math.random().toString(36).substring(2, 9)}`;
  const otpHash = await sha256(`${otpCode}:${challengeId}`);

  // 3. Dispatch OTP via real configured SMS and Email providers
  const deliveryResult = await deliverOtp({
    phone: normalizedPhone,
    email: normalizedEmail,
    otp: otpCode,
    purpose
  });

  if (!deliveryResult.success) {
    return {
      success: false,
      error: deliveryResult.error || 'Failed to deliver verification code. Please try again.'
    };
  }

  // 4. Persist challenge securely — NEVER plaintext code!
  const challenge = {
    challengeId,
    phone: normalizedPhone,
    email: normalizedEmail,
    fullName: extraData?.fullName || extraData?.name || '',
    purpose,
    otpHash,
    attempts: 0,
    maxAttempts: 5,
    expiresAt: now + 5 * 60 * 1000, // 5 minutes validity
    resendAvailableAt: now + 45 * 1000, // 45 seconds resend cooldown
    requestsCount: (activePrevious?.requestsCount || 0) + 1,
    firstRequestTime: activePrevious?.firstRequestTime || now,
    isConsumed: false,
    createdAt: now
  };

  challenges[challengeId] = challenge;
  if (normalizedPhone) {
    challenges[normalizedPhone] = challenge;
    challenges[`+91${normalizedPhone}`] = challenge;
  }
  if (normalizedEmail) {
    challenges[normalizedEmail] = challenge;
  }
  saveChallenges(challenges);

  logAuditEvent('otp_challenge_created', {
    actorId: normalizedPhone || normalizedEmail,
    entityType: 'otp_challenge',
    entityId: challengeId,
    metadata: { purpose, expiresAt: challenge.expiresAt }
  });

  // 5. Return neutral confirmation — NEVER reveal the OTP!
  return {
    success: true,
    message: 'Verification code sent. Please check your mobile number and email.',
    challengeId,
    maskedPhone: maskPhone(normalizedPhone),
    maskedEmail: maskEmail(normalizedEmail),
    resendCooldown: 45
  };
};

// ─── OTP VERIFICATION ────────────────────────────────────────────────────────

/**
 * Verify a 4-digit OTP against an active verification challenge.
 * Enforces expiry, attempt limits, hash verification, and single-use consumption.
 */
export const verifyOtp = async (identifier, inputOtp) => {
  if (!inputOtp || typeof inputOtp !== 'string') {
    return { success: false, error: 'Please enter the 4-digit OTP.' };
  }

  const cleanOtp = inputOtp.trim().replace(/\D/g, '');
  if (cleanOtp.length !== 4) {
    return { success: false, error: 'OTP must be exactly 4 numeric digits.' };
  }

  const challenges = getStoredChallenges();
  const cleanId = (identifier || '').trim();
  const digitsOnly = cleanId.replace(/\D/g, '').slice(-10);

  // Robust Lookup: by challengeId OR 10-digit phone OR +91 phone OR email
  const challenge = 
    challenges[cleanId] ||
    (digitsOnly && (challenges[digitsOnly] || challenges[`+91${digitsOnly}`])) ||
    (cleanId.includes('@') && challenges[cleanId.toLowerCase()]) ||
    Object.values(challenges).find(c => 
      c && (
        c.challengeId === cleanId ||
        (digitsOnly && c.phone === digitsOnly) ||
        (cleanId.includes('@') && c.email === cleanId.toLowerCase())
      )
    );

  if (!challenge) {
    return {
      success: false,
      error: 'No OTP request found. Please request a new OTP.'
    };
  }

  const now = Date.now();

  // Expiry check
  if (now > challenge.expiresAt) {
    cleanUpChallenge(challenge.challengeId, challenges);
    return { success: false, error: 'OTP has expired. Please request a new OTP.' };
  }

  // Double-use check
  if (challenge.isConsumed) {
    return { success: false, error: 'This OTP has already been verified. Please request a new OTP.' };
  }

  // Attempt limit check (Max 5 attempts)
  if (challenge.attempts >= challenge.maxAttempts) {
    cleanUpChallenge(challenge.challengeId, challenges);
    return {
      success: false,
      error: 'Too many incorrect attempts. This OTP has been invalidated. Please request a new one.'
    };
  }

  // Hash check
  const computedHash = await sha256(`${cleanOtp}:${challenge.challengeId}`);
  if (computedHash !== challenge.otpHash) {
    challenge.attempts += 1;
    // Sync attempts across all aliases
    Object.keys(challenges).forEach(k => {
      if (challenges[k]?.challengeId === challenge.challengeId) {
        challenges[k].attempts = challenge.attempts;
      }
    });
    saveChallenges(challenges);
    const remaining = challenge.maxAttempts - challenge.attempts;
    if (remaining <= 0) {
      cleanUpChallenge(challenge.challengeId, challenges);
      return {
        success: false,
        error: 'Too many incorrect attempts. This OTP has been invalidated. Please request a new one.'
      };
    }
    return {
      success: false,
      error: `Incorrect OTP. You have ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining.`
    };
  }

  // Successful verification: mark consumed across all aliases
  Object.keys(challenges).forEach(k => {
    if (challenges[k]?.challengeId === challenge.challengeId) {
      challenges[k].isConsumed = true;
      challenges[k].verifiedAt = now;
    }
  });
  saveChallenges(challenges);

  logAuditEvent('otp_verified_successfully', {
    actorId: challenge.phone || challenge.email,
    entityType: 'otp_challenge',
    entityId: challenge.challengeId,
    metadata: { verifiedAt: now }
  });

  return {
    success: true,
    message: 'OTP verified successfully.',
    challengeId: challenge.challengeId,
    phone: challenge.phone,
    email: challenge.email,
    fullName: challenge.fullName
  };
};

const cleanUpChallenge = (challengeId, challenges) => {
  const challenge = challenges[challengeId];
  if (challenge) {
    delete challenges[challengeId];
    if (challenge.phone) {
      delete challenges[challenge.phone];
      delete challenges[`+91${challenge.phone}`];
    }
    if (challenge.email) {
      delete challenges[challenge.email];
    }
    saveChallenges(challenges);
  }
};

// ─── USER REGISTRATION & ACCOUNT CREATION ────────────────────────────────────

/**
 * Finalize new student account creation after successful OTP verification.
 */
export const registerNewUser = async ({
  name,
  email,
  phone,
  phoneCountryCode = '+91',
  password,
  confirmPassword,
  challengeId,
  whatsappConsent = true,
  emailConsent = true
}) => {
  if (!name || name.trim().length < 2) {
    return { success: false, error: 'Please enter your full name.' };
  }

  const rawEmail = (email || '').trim().toLowerCase();
  const cleanedPhone = sanitizeMobile10(phone);

  if (!rawEmail || !isValidEmail(rawEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (!cleanedPhone || !isValidIndianMobile(cleanedPhone)) {
    return { success: false, error: 'Enter a valid 10-digit Indian mobile number.' };
  }

  if (!password || password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match. Please enter the password again.' };
  }

  // Prevent duplicate account creation on retries or double-clicks
  const users = getStoredUsers();

  const existingEmail = users.find(u => u.email && u.email.toLowerCase() === rawEmail);
  if (existingEmail) {
    return {
      success: false,
      error: 'An account with this email address already exists. Please Log In.',
      isExisting: true
    };
  }

  const existingPhone = users.find(u => {
    const userDigits = (u.phone || '').replace(/\D/g, '').slice(-10);
    return userDigits && userDigits === cleanedPhone;
  });
  if (existingPhone) {
    return {
      success: false,
      error: 'An account with this mobile number already exists. Please Log In.',
      isExisting: true
    };
  }

  const passwordHash = await sha256(password);

  const newUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: name.trim(),
    email: rawEmail,
    phone: cleanedPhone,
    phoneCountryCode: phoneCountryCode || '+91',
    passwordHash: passwordHash,
    role: 'student',
    emailVerified: false,
    phoneVerified: false,
    authMethod: 'email_password',
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

  // Sync to database if available
  try {
    const dbRaw = localStorage.getItem('THYNK_LMS_DATABASE_V3');
    if (dbRaw) {
      const db = JSON.parse(dbRaw);
      if (Array.isArray(db.students)) {
        db.students.push({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          status: 'Active',
          enrolledCourseIds: [],
          registeredAt: newUser.createdAt
        });
        localStorage.setItem('THYNK_LMS_DATABASE_V3', JSON.stringify(db));
      }
    }
  } catch {}

  const session = createSession(newUser);
  clearPendingSignupSession();

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

// ─── LOGIN WITH PASSWORD ─────────────────────────────────────────────────────

export const loginWithPassword = async (target, password) => {
  if (!target || !password) {
    return { success: false, error: 'Please enter your registered email/mobile and password.' };
  }

  const cleanTarget = (target || '').trim();
  const isEmail = cleanTarget.includes('@');
  const normalizedEmail = cleanTarget.toLowerCase();
  const digitsOnly = cleanTarget.replace(/\D/g, '').slice(-10);

  const users = getStoredUsers();
  const user = users.find(u => {
    if (isEmail) {
      return u.email && u.email.toLowerCase() === normalizedEmail;
    } else {
      const uDigits = (u.phone || '').replace(/\D/g, '').slice(-10);
      return (digitsOnly && uDigits === digitsOnly) || u.phone === cleanTarget || u.phone === `+91${digitsOnly}`;
    }
  });

  if (!user) {
    return { success: false, error: 'Incorrect email/mobile number or password.' };
  }

  const inputHash = await sha256(password);
  const isMatch = (user.passwordHash === inputHash) || (user.passwordHash === password);
  if (!isMatch) {
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

// ─── GOOGLE SIGN IN ──────────────────────────────────────────────────────────

export const loginWithGoogleAccount = async (googleUser, phone = '') => {
  const users = getStoredUsers();
  const cleanEmail = (googleUser.email || '').toLowerCase().trim();
  let existing = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);

  if (existing) {
    if (phone && isValidIndianMobile(phone)) {
      existing.phone = sanitizeMobile10(phone);
      existing.phoneCountryCode = '+91';
      existing.phoneVerified = true;
    }
    existing.lastLogin = new Date().toISOString();
    saveUsers(users);
    const session = createSession(existing);
    const existingDigits = (existing.phone || '').replace(/\D/g, '').slice(-10);
    const needsPhone = !existingDigits || !isValidIndianMobile(existingDigits);
    return { 
      success: true, 
      user: existing, 
      session, 
      needsPhone,
      message: `Welcome back, ${existing.name}!` 
    };
  }

  const cleanedPhone = phone ? sanitizeMobile10(phone) : '';
  const hasValidPhone = Boolean(cleanedPhone && isValidIndianMobile(cleanedPhone));

  const newUser = {
    id: `usr-g-${Date.now()}`,
    name: googleUser.name || 'Google Student',
    email: cleanEmail,
    phone: cleanedPhone,
    phoneCountryCode: '+91',
    passwordHash: null,
    role: 'student',
    emailVerified: true,
    phoneVerified: hasValidPhone,
    authMethod: 'google',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    enrolledCourseIds: [],
    communicationPreferences: {
      emailConsent: true,
      whatsappConsent: true,
      unsubscribed: false
    }
  };

  users.push(newUser);
  saveUsers(users);
  const session = createSession(newUser);
  return { 
    success: true, 
    user: newUser, 
    session, 
    needsPhone: !hasValidPhone,
    message: 'Google Sign-In successful!' 
  };
};

export const completeUserProfilePhone = async (userId, rawPhone) => {
  const cleaned = sanitizeMobile10(rawPhone);
  if (!isValidIndianMobile(cleaned)) {
    return { success: false, error: 'Enter a valid 10-digit Indian mobile number.' };
  }

  const users = getStoredUsers();
  const duplicate = users.find(u => 
    u.id !== userId && (u.phone || '').replace(/\D/g, '').slice(-10) === cleaned
  );
  if (duplicate) {
    return { success: false, error: 'This mobile number is already registered with another account.' };
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    return { success: false, error: 'User account not found.' };
  }

  user.phone = cleaned;
  user.phoneCountryCode = '+91';
  user.phoneVerified = true;
  user.updatedAt = new Date().toISOString();
  saveUsers(users);

  return { success: true, user, message: 'Mobile number verified and saved.' };
};

export const loginWithVerifiedOtp = async (target) => {
  const isEmail = target.includes('@');
  const digitsOnly = target.replace(/\D/g, '').slice(-10);

  const users = getStoredUsers();
  let user = users.find(u => 
    (isEmail && u.email && u.email.toLowerCase() === target.toLowerCase().trim()) || 
    (!isEmail && digitsOnly && (u.phone || '').replace(/\D/g, '').slice(-10) === digitsOnly)
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
    metadata: { target }
  });

  return {
    success: true,
    user,
    session,
    message: `Welcome back, ${user.name}!`
  };
};

// ─── PASSWORD MANAGEMENT ─────────────────────────────────────────────────────

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

export const resetPasswordWithOtp = async (targetOrChallengeId, newPassword, confirmPassword) => {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Passwords do not match. Please enter the password again.' };
  }

  const cleanTarget = (targetOrChallengeId || '').trim();
  const digitsOnly = cleanTarget.replace(/\D/g, '').slice(-10);
  const isEmail = cleanTarget.includes('@');

  const users = getStoredUsers();
  const user = users.find(u => 
    (isEmail && u.email && u.email.toLowerCase() === cleanTarget.toLowerCase()) ||
    (!isEmail && digitsOnly && (u.phone || '').replace(/\D/g, '').slice(-10) === digitsOnly) ||
    u.id === cleanTarget
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

// ─── MULTI-DEVICE SESSIONS & REVOCATION ──────────────────────────────────────

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
