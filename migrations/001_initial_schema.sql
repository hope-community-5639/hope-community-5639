-- ============================================================================
-- HOPE COMMUNITY SUPPORT (Hands On Personal Empowerment - Est. 2008)
-- Migration 001: Initial Relational Database Schema & Row-Level Security (RLS)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Roles & Permissions
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  module VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
  permission_id VARCHAR(50) REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 2. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) REFERENCES roles(id) NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_verification')),
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  failed_login_attempts INT DEFAULT 0,
  lockout_until TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Profiles
CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender_identity VARCHAR(50),
  preferred_pronouns VARCHAR(50),
  address TEXT,
  emergency_contact_name VARCHAR(150),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relation VARCHAR(50),
  preferred_language VARCHAR(50) DEFAULT 'English',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  credentials VARCHAR(100) NOT NULL,
  role_title VARCHAR(100) NOT NULL,
  license_number VARCHAR(100),
  license_state VARCHAR(20),
  areas_of_focus TEXT[],
  specialties TEXT[],
  languages TEXT[] DEFAULT ARRAY['English'],
  short_bio TEXT,
  is_accepting_new_clients BOOLEAN DEFAULT TRUE,
  available_days TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Services & Locations
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(50) PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  tagline VARCHAR(255),
  short_description TEXT,
  full_description TEXT,
  duration_minutes INT DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(20) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE
);

-- 5. Appointments & Scheduling
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES users(id) ON DELETE SET NULL,
  service_id VARCHAR(50) REFERENCES services(id) NOT NULL,
  delivery_method VARCHAR(30) CHECK (delivery_method IN ('office', 'in_home', 'telehealth')) NOT NULL,
  participant_type VARCHAR(30) CHECK (participant_type IN ('individual', 'couple', 'family', 'group')) NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot VARCHAR(10) NOT NULL,
  duration_minutes INT DEFAULT 50,
  status VARCHAR(30) DEFAULT 'requested' CHECK (status IN (
    'requested', 'under_review', 'confirmed', 'rescheduled', 
    'checked_in', 'completed', 'client_canceled', 'staff_canceled', 'no_show'
  )),
  notes TEXT,
  internal_staff_notes TEXT,
  telehealth_link TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  changed_by UUID REFERENCES users(id) NOT NULL,
  from_status VARCHAR(30),
  to_status VARCHAR(30) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Intake & Consent Management
CREATE TABLE IF NOT EXISTS intake_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date_of_birth DATE,
  phone VARCHAR(50),
  address TEXT,
  emergency_contact JSONB,
  preferred_language VARCHAR(50) DEFAULT 'English',
  service_requested VARCHAR(100),
  preferred_delivery VARCHAR(30),
  insurance_type VARCHAR(50),
  insurance_provider VARCHAR(150),
  policy_number VARCHAR(100),
  primary_concerns TEXT[],
  symptom_severity VARCHAR(30),
  current_medications TEXT,
  prior_mental_health_care BOOLEAN DEFAULT FALSE,
  prior_care_details TEXT,
  consent_treatment_signed BOOLEAN DEFAULT FALSE,
  consent_telehealth_signed BOOLEAN DEFAULT FALSE,
  hipaa_acknowledged BOOLEAN DEFAULT FALSE,
  signature_data_url TEXT,
  signature_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(30) DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'additional_info_needed')),
  staff_reviewer_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 7. Service Requests & Referrals
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  preferred_delivery VARCHAR(30) NOT NULL,
  urgency VARCHAR(30) DEFAULT 'routine',
  details TEXT NOT NULL,
  preferred_times TEXT[],
  status VARCHAR(30) DEFAULT 'submitted' CHECK (status IN (
    'draft', 'submitted', 'under_review', 'more_info_required', 
    'assigned', 'scheduled', 'completed', 'closed', 'declined', 'referred_elsewhere'
  )),
  assigned_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  response_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_source_type VARCHAR(50) NOT NULL,
  referrer_name VARCHAR(150) NOT NULL,
  referrer_organization VARCHAR(150),
  referrer_email VARCHAR(255),
  referrer_phone VARCHAR(50),
  client_name VARCHAR(150) NOT NULL,
  client_phone VARCHAR(50),
  client_email VARCHAR(255),
  services_needed TEXT[],
  urgency VARCHAR(30) DEFAULT 'routine',
  status VARCHAR(30) DEFAULT 'received',
  assigned_to UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Care Plans
CREATE TABLE IF NOT EXISTS care_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  diagnosis_or_focus TEXT NOT NULL,
  primary_goals TEXT[] NOT NULL,
  intervention_strategies TEXT[] NOT NULL,
  review_date DATE,
  status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'under_review', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Secure Messaging
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  attachment_name VARCHAR(255),
  attachment_size VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Documents & Clinical Uploads
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  uploader_id UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size VARCHAR(50),
  file_type VARCHAR(100),
  category VARCHAR(50) NOT NULL,
  is_shared_with_client BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Audit Logs & Security Incidents
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(150),
  user_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100),
  ip_address VARCHAR(50),
  details TEXT,
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS security_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_name VARCHAR(150),
  type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'investigating' CHECK (status IN ('investigating', 'mitigated', 'resolved', 'closed')),
  resolution_notes TEXT,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Row-Level Security (RLS) policies
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider ON appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(created_at DESC);
