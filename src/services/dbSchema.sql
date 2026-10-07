-- ====================================================================
-- THYNK DIGITAL SOLUTIONS — LMS PRODUCTION DATABASE SCHEMA
-- PostgreSQL / Supabase Relational Architecture
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE auth_provider_type AS ENUM ('email_otp', 'phone_otp', 'password', 'google');
CREATE TYPE payment_status_type AS ENUM ('pending', 'paid', 'failed', 'cancelled', 'refunded');
CREATE TYPE enrollment_status_type AS ENUM ('active', 'expired', 'cancelled', 'revoked');
CREATE TYPE reminder_status_type AS ENUM ('scheduled', 'sent', 'cancelled', 'failed');
CREATE TYPE certificate_status_type AS ENUM ('not_started', 'in_progress', 'eligible', 'issued', 'revoked');
CREATE TYPE project_status_type AS ENUM ('not_started', 'submitted', 'under_review', 'passed', 'failed');

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    role user_role NOT NULL DEFAULT 'student',
    auth_method auth_provider_type NOT NULL DEFAULT 'phone_otp',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- 4. SESSIONS (Multi-device management & Revocation)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(255),
    ip_address VARCHAR(100),
    user_agent TEXT,
    session_token VARCHAR(500) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 5. OTP VERIFICATION TABLE (Server-side OTP records)
CREATE TABLE IF NOT EXISTS auth_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target VARCHAR(255) NOT NULL, -- Email or Phone number
    otp_hash VARCHAR(255) NOT NULL, -- Never store plaintext in DB
    purpose VARCHAR(50) NOT NULL, -- 'signup', 'login', 'reset_password'
    attempts_count INT NOT NULL DEFAULT 0,
    is_consumed BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    language VARCHAR(50) NOT NULL DEFAULT 'Tamil',
    level VARCHAR(50) NOT NULL DEFAULT 'Beginner',
    duration VARCHAR(50) NOT NULL,
    price INT NOT NULL DEFAULT 0,
    original_price INT NOT NULL DEFAULT 0,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
    review_count INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    badge VARCHAR(50),
    thumbnail_url TEXT,
    description TEXT NOT NULL,
    short_desc TEXT,
    learning_benefits JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. VALUE PACKS / COMBOS
CREATE TABLE IF NOT EXISTS value_packs (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    original_price INT NOT NULL,
    savings INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    badge VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. VALUE PACK COURSES (Junction)
CREATE TABLE IF NOT EXISTS value_pack_courses (
    value_pack_id VARCHAR(100) REFERENCES value_packs(id) ON DELETE CASCADE,
    course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
    PRIMARY KEY (value_pack_id, course_id)
);

-- 9. MODULES
CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(100) PRIMARY KEY,
    course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(50),
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. LESSONS
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(100) PRIMARY KEY,
    module_id VARCHAR(100) NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    is_preview BOOLEAN NOT NULL DEFAULT FALSE,
    video_provider VARCHAR(50) DEFAULT 'cloudflare_stream',
    video_asset_id VARCHAR(255),
    video_url TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    item_type VARCHAR(50) NOT NULL, -- 'course' | 'value_pack'
    item_id VARCHAR(100) NOT NULL,
    amount INT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    razorpay_order_id VARCHAR(255) UNIQUE,
    status payment_status_type NOT NULL DEFAULT 'pending',
    coupon_code VARCHAR(50),
    discount_amount INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    razorpay_payment_id VARCHAR(255) UNIQUE NOT NULL,
    razorpay_signature VARCHAR(500) NOT NULL,
    amount INT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status payment_status_type NOT NULL DEFAULT 'paid',
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    idempotency_key VARCHAR(255) UNIQUE
);

-- 13. ENROLLMENTS (6 Calendar Month Expiry Engine)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    order_id UUID REFERENCES orders(id),
    payment_id UUID REFERENCES payments(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Exactly 6 calendar months
    status enrollment_status_type NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 14. STUDENT PROGRESS (Server-side & Cross-device)
CREATE TABLE IF NOT EXISTS student_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id VARCHAR(100) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    watch_position_seconds INT DEFAULT 0,
    watch_percentage INT DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id, lesson_id)
);

-- 15. CERTIFICATES
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    student_name VARCHAR(255) NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    status certificate_status_type NOT NULL DEFAULT 'issued',
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verification_url TEXT NOT NULL
);

-- 16. PROJECTS & SUBMISSIONS
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(100) PRIMARY KEY,
    course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submission_url TEXT,
    notes TEXT,
    status project_status_type NOT NULL DEFAULT 'submitted',
    admin_feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 17. QUIZZES & ATTEMPTS
CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(100) PRIMARY KEY,
    course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    pass_mark_percentage INT NOT NULL DEFAULT 80,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id VARCHAR(100) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score_percentage INT NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. INTERNSHIP APPLICATIONS
CREATE TABLE IF NOT EXISTS internship_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'applied', -- 'applied', 'under_review', 'accepted', 'rejected'
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. COURSE VIEWS / LEADS
CREATE TABLE IF NOT EXISTS course_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    target_type VARCHAR(50) NOT NULL, -- 'course' | 'value_pack'
    target_id VARCHAR(100) NOT NULL,
    user_email VARCHAR(255),
    user_phone VARCHAR(50),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_purchased BOOLEAN NOT NULL DEFAULT FALSE,
    source VARCHAR(100) DEFAULT 'website'
);

-- 20. REMINDER JOBS (Automated Day 5, 20, 30, 60, 75, 90, 120, 150 Engine)
CREATE TABLE IF NOT EXISTS reminder_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES course_views(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(100) REFERENCES courses(id),
    reminder_day INT NOT NULL, -- 5, 20, 30, 60, 75, 90, 120, 150
    channel VARCHAR(50) NOT NULL, -- 'whatsapp', 'email'
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status reminder_status_type NOT NULL DEFAULT 'scheduled',
    sent_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. COMMUNICATION PREFERENCES & CONSENT
CREATE TABLE IF NOT EXISTS communication_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
    whatsapp_marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    consent_ip VARCHAR(100),
    consent_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_role VARCHAR(50),
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 23. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update their own profile" 
ON users FOR ALL USING (auth.uid() = id);

CREATE POLICY "Students can view their own enrollments" 
ON enrollments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can view and update their own progress" 
ON student_progress FOR ALL USING (auth.uid() = user_id);

-- 24. INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_expiry ON enrollments(expires_at);
CREATE INDEX IF NOT EXISTS idx_progress_user_course ON student_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status_scheduled ON reminder_jobs(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_course_views_user ON course_views(user_id, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event_type, created_at DESC);
