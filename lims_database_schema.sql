-- ===========================================================================
-- DLabs LIMS (Laboratory Information Management System) Database Schema
-- Dialect: PostgreSQL (Version 12+)
-- Purpose: Complete database initialization including modules, tables, 
--          constraints, indexes, and seed data.
-- ===========================================================================

-- SECTION 1: CLEANUP / PREPARATION
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS clinical_patient_cases CASCADE;
DROP TABLE IF EXISTS result_parameters CASCADE;
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS sample_required_tests CASCADE;
DROP TABLE IF EXISTS samples CASCADE;
DROP TABLE IF EXISTS report_print_tracking CASCADE;
DROP TABLE IF EXISTS bill_settlements CASCADE;
DROP TABLE IF EXISTS encounter_tests CASCADE;
DROP TABLE IF EXISTS encounters CASCADE;
DROP TABLE IF EXISTS patient_medical_histories CASCADE;
DROP TABLE IF EXISTS patient_addresses CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS system_integrations CASCADE;
DROP TABLE IF EXISTS system_users CASCADE;
DROP TABLE IF EXISTS center_resources CASCADE;
DROP TABLE IF EXISTS center_details CASCADE;
DROP TABLE IF EXISTS price_lists CASCADE;
DROP TABLE IF EXISTS financial_dashboard CASCADE;
DROP TABLE IF EXISTS invoice_settings CASCADE;
DROP TABLE IF EXISTS bill_settings CASCADE;
DROP TABLE IF EXISTS test_configs CASCADE;
DROP TABLE IF EXISTS b2b_partners CASCADE;
DROP TABLE IF EXISTS test_catalog CASCADE;
DROP TABLE IF EXISTS lab_profiles CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS referring_doctors CASCADE;
DROP TABLE IF EXISTS satellite_centers CASCADE;
DROP TABLE IF EXISTS sample_vial_settings CASCADE;

-- SECTION 2: ADMIN CONFIGURATION & MASTER TABLES
-- ---------------------------------------------------------------------------

CREATE TABLE lab_profiles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL
);
COMMENT ON TABLE lab_profiles IS 'Stores the primary lab metadata used across headers, bills, and report prints.';

CREATE TABLE test_catalog (
    test_code VARCHAR(50) PRIMARY KEY,
    test_name VARCHAR(255) NOT NULL,
    sample_type VARCHAR(100) NOT NULL,
    container_type VARCHAR(100) NOT NULL,
    retail_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    list_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    department VARCHAR(100) NOT NULL,
    average_tat VARCHAR(50) NOT NULL,
    outsource_status VARCHAR(20) NOT NULL CHECK (outsource_status IN ('In-House', 'Outsourced')),
    outsource_center VARCHAR(255) DEFAULT NULL
);
COMMENT ON TABLE test_catalog IS 'Master catalog of diagnostic tests and baseline pricing managed via AdminModule -> Test Master.';

CREATE TABLE test_configs (
    test_code VARCHAR(50) PRIMARY KEY REFERENCES test_catalog(test_code) ON DELETE CASCADE,
    verification_status VARCHAR(20) NOT NULL CHECK (verification_status IN ('Pending', 'Verified', 'Rejected')),
    auto_approval BOOLEAN NOT NULL DEFAULT FALSE
);
COMMENT ON TABLE test_configs IS 'Operations rules for verification status and approval logic associated with test codes.';

CREATE TABLE b2b_partners (
    partner_id VARCHAR(50) PRIMARY KEY,
    partner_name VARCHAR(255) NOT NULL,
    discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (discount_percentage BETWEEN 0.00 AND 100.00),
    billing_type VARCHAR(20) NOT NULL CHECK (billing_type IN ('Prepaid', 'Postpaid')),
    partner_type VARCHAR(20) CHECK (partner_type IN ('Corporate', 'Insurance', 'Franchise', 'Government')),
    partner_code VARCHAR(50) UNIQUE,
    contact_number VARCHAR(50),
    email VARCHAR(255),
    billing_address TEXT,
    credit_limit NUMERIC(12, 2) DEFAULT 0.00,
    outstanding_balance NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive'))
);
COMMENT ON TABLE b2b_partners IS 'Client organization details for corporate billing, discount rates, and outstanding balances.';

CREATE TABLE price_lists (
    list_name VARCHAR(255) PRIMARY KEY,
    list_type VARCHAR(100) NOT NULL,
    list_category VARCHAR(20) NOT NULL CHECK (list_category IN ('Corporate', 'Govt', 'Retail', 'Special')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Inactive')),
    created_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE price_lists IS 'Price tariff schemes for specific categories of patients or corporate clients.';

CREATE TABLE center_details (
    lab_name VARCHAR(255) PRIMARY KEY,
    auth_id VARCHAR(50) NOT NULL,
    report_sharing_key VARCHAR(100) NOT NULL,
    lab_address TEXT NOT NULL,
    area VARCHAR(100),
    city VARCHAR(100),
    type_of_functioning VARCHAR(100),
    website VARCHAR(255),
    primary_contact_number VARCHAR(50) NOT NULL,
    secondary_contact_number VARCHAR(50),
    lab_email VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255),
    timings_from TIME,
    timings_to TIME,
    is_24x7 BOOLEAN NOT NULL DEFAULT FALSE
);
COMMENT ON TABLE center_details IS 'Configuration of lab branch endpoints, timings, contact credentials, and sharing keys.';

CREATE TABLE center_resources (
    lab_name VARCHAR(255) PRIMARY KEY REFERENCES center_details(lab_name) ON DELETE CASCADE,
    center_logo VARCHAR(512),
    mobile_header VARCHAR(255),
    pdf_header TEXT,
    pdf_footer TEXT,
    bill_header TEXT
);
COMMENT ON TABLE center_resources IS 'Storage for static media links, logo paths, and headers/footers for prints.';

CREATE TABLE bill_settings (
    id SERIAL PRIMARY KEY,
    pre_set_additional_amount NUMERIC(10, 2) DEFAULT 0.00,
    bill_header_flag BOOLEAN DEFAULT TRUE,
    bill_footer_flag BOOLEAN DEFAULT TRUE,
    bill_signature_flag BOOLEAN DEFAULT TRUE,
    barcode_flag BOOLEAN DEFAULT TRUE,
    sample_type_on_barcode BOOLEAN DEFAULT TRUE,
    collection_date BOOLEAN DEFAULT TRUE,
    bill_receipt_qrcode BOOLEAN DEFAULT TRUE,
    test_name BOOLEAN DEFAULT TRUE,
    short_test_names BOOLEAN DEFAULT FALSE,
    manual_accession_number_mandatory BOOLEAN DEFAULT FALSE,
    duplicate_accession_number VARCHAR(10) NOT NULL CHECK (duplicate_accession_number IN ('Allow', 'Reject', 'Warn')),
    patient_print_card VARCHAR(10) NOT NULL CHECK (patient_print_card IN ('Detailed', 'Compact', 'None')),
    helper_comment TEXT
);
COMMENT ON TABLE bill_settings IS 'System flags for thermal printer receipts, accession numbers, and formats.';

CREATE TABLE invoice_settings (
    id SERIAL PRIMARY KEY,
    header_height INTEGER DEFAULT 120,
    footer_height INTEGER DEFAULT 80,
    header_image VARCHAR(512),
    footer_image VARCHAR(512),
    invoice_header_flag BOOLEAN DEFAULT TRUE,
    invoice_footer_flag BOOLEAN DEFAULT TRUE,
    use_bill_level_vat_in_qrcode BOOLEAN DEFAULT TRUE,
    helper_comment TEXT
);
COMMENT ON TABLE invoice_settings IS 'Invoicing configuration for PDF dimensions, tax details, and branding headers.';

CREATE TABLE system_users (
    username VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_role VARCHAR(100) NOT NULL,
    default_login_section VARCHAR(100),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE system_users IS 'Users registered on LIMS with their assigned roles and last login tracking.';

CREATE TABLE system_integrations (
    id SERIAL PRIMARY KEY,
    api_requests_count INTEGER DEFAULT 0,
    webhook_triggers_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    api_endpoint_filter VARCHAR(255)
);
COMMENT ON TABLE system_integrations IS 'Telemetry logs showing active external integrations and webhook throughput.';

CREATE TABLE financial_dashboard (
    id SERIAL PRIMARY KEY,
    total_revenue NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    amount_due NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    cash_collection NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    online_collection NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    others_collection NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    average_patient_rating NUMERIC(3, 2) DEFAULT 0.00,
    total_logins INTEGER DEFAULT 0
);
COMMENT ON TABLE financial_dashboard IS 'Real-time billing counter aggregations displayed in DashboardView.';

CREATE TABLE referring_doctors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    speciality VARCHAR(100) NOT NULL,
    clinic VARCHAR(255) NOT NULL,
    contact VARCHAR(50) NOT NULL,
    commission NUMERIC(5, 2) NOT NULL DEFAULT 10.00
);
COMMENT ON TABLE referring_doctors IS 'List of referring doctors along with their contact info and commission percentage.';

CREATE TABLE satellite_centers (
    center_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    head VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive'))
);
COMMENT ON TABLE satellite_centers IS 'Network of branch intake locations and their heads.';

CREATE TABLE sample_vial_settings (
    sr_no SERIAL PRIMARY KEY,
    sample_name VARCHAR(255) NOT NULL,
    sample_type VARCHAR(20) NOT NULL CHECK (sample_type IN ('Serum', 'EDTA', 'Urine', 'Blood', 'Plasma', 'Swab')),
    container_type VARCHAR(255) NOT NULL
);
COMMENT ON TABLE sample_vial_settings IS 'Preconfigured sample vial and container types for specimen accession check-in.';


-- SECTION 3: PATIENT REGISTRATION & INTAKE MODULE
-- ---------------------------------------------------------------------------

CREATE TABLE patients (
    patient_id VARCHAR(50) PRIMARY KEY,
    patient_type VARCHAR(20) NOT NULL CHECK (patient_type IN ('Regular', 'Corporate', 'VIP', 'Staff', 'Referral')),
    mrn VARCHAR(50) UNIQUE NOT NULL,
    national_id VARCHAR(50),
    designation VARCHAR(10) CHECK (designation IN ('Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Master', 'Mx.')),
    patient_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    date_of_birth DATE NOT NULL,
    age INTEGER NOT NULL,
    contact_number VARCHAR(50) NOT NULL,
    phone_belongs_to VARCHAR(20) NOT NULL CHECK (phone_belongs_to IN ('Patient', 'Relative/Guardian')),
    email VARCHAR(255),
    organisation VARCHAR(255),
    referral VARCHAR(255)
);
COMMENT ON TABLE patients IS 'Core master table storing basic demographics populated during Patient Registration.';

CREATE TABLE patient_addresses (
    patient_id VARCHAR(50) PRIMARY KEY REFERENCES patients(patient_id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    pincode VARCHAR(15) NOT NULL,
    location_area VARCHAR(100),
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    ward_number VARCHAR(50)
);
COMMENT ON TABLE patient_addresses IS 'Detailed residential address fields corresponding to registered patients.';

CREATE TABLE patient_medical_histories (
    patient_id VARCHAR(50) PRIMARY KEY REFERENCES patients(patient_id) ON DELETE CASCADE,
    covid_vaccine_received BOOLEAN DEFAULT FALSE,
    arogya_setu_app BOOLEAN DEFAULT FALSE,
    is_hospitalized BOOLEAN DEFAULT FALSE,
    type_of_vaccine VARCHAR(100),
    patient_category VARCHAR(100),
    patient_occupation VARCHAR(100),
    vaccination_date DATE,
    date_of_dose_2 DATE,
    vaccination_status VARCHAR(30) CHECK (vaccination_status IN ('Unvaccinated', 'Partially Vaccinated', 'Fully Vaccinated')),
    body_temperature VARCHAR(20) CHECK (body_temperature IN ('Normal', 'Mild Fever', 'High Fever')),
    symptom_progress VARCHAR(20) CHECK (symptom_progress IN ('Improving', 'Stable', 'Worsening', 'None')),
    cowin_beneficiary VARCHAR(50),
    country_state_travelled VARCHAR(255),
    isolation_location VARCHAR(255),
    passenger_locator_id VARCHAR(50),
    travel_history TEXT[], -- Tracks list of recently visited locations
    symptoms TEXT[], -- Array of clinical symptoms e.g., {'Fever', 'Cough'}
    medical_conditions TEXT[] -- Array of persistent conditions e.g., {'Hypertension'}
);
COMMENT ON TABLE patient_medical_histories IS 'Clinical screening fields collected during intakes, stored as 1-1 child table.';

CREATE TABLE appointments (
    appt_id VARCHAR(50) PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    test_code VARCHAR(50) REFERENCES test_catalog(test_code) ON DELETE RESTRICT,
    appt_time TIMESTAMP WITH TIME ZONE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In-Progress', 'Completed', 'Cancelled'))
);
COMMENT ON TABLE appointments IS 'Scheduled appointments from the intake calendar before standard patient folder registration.';


-- SECTION 4: ENCOUNTERS, ORDER LOGISTICS & BILLINGS
-- ---------------------------------------------------------------------------

CREATE TABLE encounters (
    encounter_id VARCHAR(50) PRIMARY KEY,
    accession_no VARCHAR(50) UNIQUE NOT NULL,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
    partner_id VARCHAR(50) REFERENCES b2b_partners(partner_id) ON DELETE SET NULL,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL CHECK (status IN ('Pending Accession', 'Sample Collected', 'Processing', 'Approved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE encounters IS 'A single laboratory visit/encounter ordering a series of tests under an Accession Number.';

CREATE TABLE encounter_tests (
    encounter_id VARCHAR(50) REFERENCES encounters(encounter_id) ON DELETE CASCADE,
    test_code VARCHAR(50) REFERENCES test_catalog(test_code) ON DELETE RESTRICT,
    PRIMARY KEY (encounter_id, test_code)
);
COMMENT ON TABLE encounter_tests IS 'Junction table linking ordered assays (from test catalog) to an encounter.';

CREATE TABLE bill_settlements (
    bill_id VARCHAR(50) PRIMARY KEY,
    encounter_id VARCHAR(50) REFERENCES encounters(encounter_id) ON DELETE CASCADE,
    bill_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    patient_id VARCHAR(50) REFERENCES patients(patient_id) ON DELETE RESTRICT,
    referral VARCHAR(255),
    bill_source VARCHAR(100),
    organisation VARCHAR(255),
    bill_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    due_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pending', 'Paid', 'Cancelled'))
);
COMMENT ON TABLE bill_settlements IS 'Billing ledger transaction records tracking paid vs due amounts.';

CREATE TABLE report_print_tracking (
    report_id VARCHAR(50) PRIMARY KEY,
    encounter_id VARCHAR(50) REFERENCES encounters(encounter_id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    org_name VARCHAR(255),
    referral VARCHAR(255),
    tests TEXT[] NOT NULL,
    report_date TIMESTAMP WITH TIME ZONE,
    bill_date TIMESTAMP WITH TIME ZONE NOT NULL,
    print_status BOOLEAN NOT NULL DEFAULT FALSE
);
COMMENT ON TABLE report_print_tracking IS 'Log tracking printed report outputs, verifying validation dates.';


-- SECTION 5: ACCESSIONING MODULE (SAMPLES & DRAW DESK)
-- ---------------------------------------------------------------------------

CREATE TABLE samples (
    sample_id VARCHAR(50) PRIMARY KEY,
    accession_no VARCHAR(50) NOT NULL REFERENCES encounters(accession_no) ON DELETE CASCADE,
    barcode_number VARCHAR(100) UNIQUE,
    sample_type VARCHAR(20) NOT NULL CHECK (sample_type IN ('Serum', 'EDTA', 'Urine', 'Blood', 'Plasma', 'Swab')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pending Collection', 'Accessed', 'Rejected')),
    rejection_reason TEXT,
    collected_at TIMESTAMP WITH TIME ZONE
);
COMMENT ON TABLE samples IS 'Individual vacuum tubes/specimens collected under an accession file.';

CREATE TABLE sample_required_tests (
    sample_id VARCHAR(50) REFERENCES samples(sample_id) ON DELETE CASCADE,
    test_code VARCHAR(50) REFERENCES test_catalog(test_code) ON DELETE RESTRICT,
    PRIMARY KEY (sample_id, test_code)
);
COMMENT ON TABLE sample_required_tests IS 'Junction table detailing which test codes require parsing from this specific vial.';


-- SECTION 6: OPERATIONS & RESULTS VERIFICATION MODULE
-- ---------------------------------------------------------------------------

CREATE TABLE test_results (
    result_id VARCHAR(50) PRIMARY KEY,
    accession_no VARCHAR(50) NOT NULL
        REFERENCES encounters(accession_no) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL CHECK (
        status IN (
            'Incomplete',
            'Partially Completed',
            'Rerun',
            'Completed',
            'Signed'
        )
    ),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE test_results IS 'Main laboratory result files containing observations linked to accessions.';

CREATE TABLE result_parameters (
    parameter_id VARCHAR(50) PRIMARY KEY,
    result_id VARCHAR(50) NOT NULL REFERENCES test_results(result_id) ON DELETE CASCADE,
    parameter_name VARCHAR(255) NOT NULL,
    observed_value VARCHAR(50) DEFAULT NULL,
    is_abnormal BOOLEAN NOT NULL DEFAULT FALSE,
    reference_range VARCHAR(100) NOT NULL,
    unit VARCHAR(50),
    min_value NUMERIC(10, 4),
    max_value NUMERIC(10, 4)
);
COMMENT ON TABLE result_parameters IS 'Observed values for biochemical indices, flagged against configured normal limits.';

CREATE TABLE clinical_patient_cases (
    result_id VARCHAR(50) PRIMARY KEY REFERENCES test_results(result_id) ON DELETE CASCADE,
    category VARCHAR(30) NOT NULL CHECK (category IN (
        'Incomplete', 'Partially Completed', 'Active Reruns', 'Completed', 
        'Partially Signed', 'Signed', 'Emergency Reports', 'Critical Reports', 
        'TAT Exceeded', 'Outsourced', 'Cancelled Reports'
    )),
    notes TEXT,
    tat_exceeded_hours INTEGER DEFAULT NULL,
    outsource_center VARCHAR(255) DEFAULT NULL
);
COMMENT ON TABLE clinical_patient_cases IS 'Queue dashboard states linking pathy verification notes and outsource locations.';


-- SECTION 7: ACCESS INDEXES FOR PERFORMANCE
-- ---------------------------------------------------------------------------
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_patients_name ON patients(patient_name);
CREATE INDEX idx_encounters_accession ON encounters(accession_no);
CREATE INDEX idx_encounters_patient ON encounters(patient_id);
CREATE INDEX idx_samples_accession ON samples(accession_no);
CREATE INDEX idx_samples_barcode ON samples(barcode_number);
CREATE INDEX idx_results_accession ON test_results(accession_no);
CREATE INDEX idx_parameters_result ON result_parameters(result_id);


-- SECTION 8: INITIAL SEED DATA FOR TESTING
-- ---------------------------------------------------------------------------

-- 8.1 Admin Configuration & Lab Profile
INSERT INTO lab_profiles (name, address, email, phone) VALUES 
('DLabs Diagnostics Pvt Ltd', 'S-21, Block A, Okhla Industrial Area, Phase-III, New Delhi, Delhi 110020', 'ops@dlabsfield.in', '011-45091211');

INSERT INTO test_catalog (test_code, test_name, sample_type, container_type, retail_price, list_price, department, average_tat, outsource_status, outsource_center) VALUES 
('CBC', 'Complete Blood Count', 'Blood', 'Purple EDTA Tube', 450.00, 450.00, 'Hematology', '4 Hours', 'In-House', NULL),
('HBA1C', 'Glycated Haemoglobin (HbA1c)', 'Blood', 'Purple EDTA Tube', 650.00, 650.00, 'Biochemistry', '6 Hours', 'In-House', NULL),
('TSH', 'Thyroid Stimulating Hormone (Ultra-sensitive)', 'Serum', 'Yellow SST Tube', 750.00, 750.00, 'Immunology', '8 Hours', 'In-House', NULL),
('LIPID', 'Lipid Profile (Cholesterol Spectrum)', 'Serum', 'Yellow SST Tube', 1200.00, 1200.00, 'Biochemistry', '5 Hours', 'In-House', NULL),
('LFT', 'Liver Function Panel', 'Serum', 'Yellow SST Tube', 950.00, 950.00, 'Biochemistry', '6 Hours', 'In-House', NULL),
('KFT', 'Kidney / Renal Function Panel', 'Serum', 'Yellow SST Tube', 850.00, 850.00, 'Biochemistry', '6 Hours', 'In-House', NULL),
('URINE', 'Urine Routine & Examination', 'Urine', 'Sterile Specimen Cup', 350.00, 350.00, 'Clinical Pathology', '2 Hours', 'In-House', NULL),
('VITD3', 'Vitamin D3 (25-Hydroxy)', 'Serum', 'Yellow SST Tube', 1500.00, 1500.00, 'Special Chemistry', '24 Hours', 'Outsourced', 'National Superlabs Inc.');

INSERT INTO test_configs (test_code, verification_status, auto_approval) VALUES 
('CBC', 'Verified', TRUE),
('HBA1C', 'Verified', TRUE),
('TSH', 'Verified', FALSE),
('KFT', 'Pending', TRUE);

INSERT INTO b2b_partners (partner_id, partner_name, discount_percentage, billing_type, partner_type, partner_code, contact_number, email, billing_address, credit_limit, outstanding_balance, status) VALUES 
('B2B-1', 'Apollo Corporate Wellness', 15.00, 'Postpaid', 'Corporate', 'AP-CORP-01', '9890123456', 'billing@apollo.com', 'Chennai HQ', 50000.00, 1020.00, 'Active'),
('B2B-2', 'CareMax Health Checkups', 20.00, 'Prepaid', 'Franchise', 'CM-FRAN-02', '9890123457', 'ops@caremax.com', 'Delhi East', 20000.00, 0.00, 'Active'),
('B2B-3', 'MaxFit Diagnostic Alliances', 12.00, 'Postpaid', 'Insurance', 'MF-INS-03', '9890123458', 'claims@maxfit.com', 'Mumbai South', 100000.00, 0.00, 'Active'),
('B2B-4', 'Hindustan Labs Referral Group', 25.00, 'Prepaid', 'Corporate', 'HL-REF-04', '9890123459', 'info@hindlabs.com', 'Kolkata West', 0.00, 0.00, 'Active');

INSERT INTO price_lists (list_name, list_type, list_category, status, created_time) VALUES 
('Corporate Special Care Tariff', 'Corporate', 'Corporate', 'Active', '2026-01-10 00:00:00+00'),
('Seniors CGHS CG Scheme', 'Government Benefit', 'Govt', 'Active', '2026-02-15 00:00:00+00'),
('Retail Standard Tariff Directory', 'Standard Walk-In', 'Retail', 'Active', '2026-01-01 00:00:00+00');

INSERT INTO center_details (lab_name, auth_id, report_sharing_key, lab_address, area, city, type_of_functioning, website, primary_contact_number, secondary_contact_number, lab_email, admin_email, timings_from, timings_to, is_24x7) VALUES 
('DLabs Diagnostics Pvt Ltd (Main HQ)', 'AUTH-DEL-09921', 'KEY-DLABS-X82110', 'S-21, Block A, Okhla Industrial Area, Phase-III', 'Okhla Phase-III', 'New Delhi', 'Reference Pathology Lab', 'www.dlabsdiagnostics.com', '011-45091211', '9876543210', 'ops@dlabsfield.in', 'director@dlabsfield.in', '07:00:00', '22:00:00', TRUE);

INSERT INTO center_resources (lab_name, center_logo, mobile_header, pdf_header, pdf_footer, bill_header) VALUES 
('DLabs Diagnostics Pvt Ltd (Main HQ)', 'https://images.unsplash.com/photo-1516841273335-e39b37888115?w=120&auto=format&fit=crop', 'DLabs Diagnostics', 'DLabs Diagnostics Pvt Ltd, ISO 9001:2015 Accredited Center', 'Strictly confidential - compiled by automated LIMS analyser systems', 'DLabs Diagnostics GST: 07AAAAD8829F1ZS');

INSERT INTO bill_settings (pre_set_additional_amount, bill_header_flag, bill_footer_flag, bill_signature_flag, barcode_flag, sample_type_on_barcode, collection_date, bill_receipt_qrcode, test_name, short_test_names, manual_accession_number_mandatory, duplicate_accession_number, patient_print_card, helper_comment) VALUES 
(50.00, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, 'Warn', 'Detailed', 'Requires standard clinical test code mapping for GST ledger reporting.');

INSERT INTO invoice_settings (header_height, footer_height, header_image, footer_image, invoice_header_flag, invoice_footer_flag, use_bill_level_vat_in_qrcode, helper_comment) VALUES 
(120, 80, 'https://images.unsplash.com/photo-1516841273335-e39b37888115?w=150&auto=format&fit=crop', '', TRUE, TRUE, TRUE, 'Tax calculations integrated strictly using IGST/CGST guidelines.');

INSERT INTO system_users (username, name, user_role, default_login_section, last_activity) VALUES 
('ops_lab_admin', 'Suresh Chandra', 'Super Administrator', 'Registration', NOW() - INTERVAL '1 hour'),
('lab_tech_r', 'Ruchi Aggarwal', 'Clinical Biochemist Technician', 'Analyzer Desk', NOW() - INTERVAL '2 hours'),
('b2b_spoc_desk', 'Gopal Kishan', 'Desk Operator', 'Registration', NOW() - INTERVAL '15 minutes');

INSERT INTO system_integrations (api_requests_count, webhook_triggers_count, error_count, api_endpoint_filter) VALUES 
(15410, 3205, 14, '/api/v1/patient-intake');

INSERT INTO financial_dashboard (total_revenue, amount_due, amount_paid, cash_collection, online_collection, others_collection, average_patient_rating, total_logins) VALUES 
(245000.00, 45000.00, 200000.00, 85000.00, 110000.00, 5000.00, 4.8, 452);

INSERT INTO referring_doctors (id, name, speciality, clinic, contact, commission) VALUES 
('DR-01', 'Dr. Alok Sen', 'Cardiology', 'Max Healthcare', '9811223344', 15.00),
('DR-02', 'Dr. Sunita Mehta', 'Endocrinology', 'Indraprastha Apollo', '9122334455', 10.00),
('DR-03', 'Dr. Joseph Kurian', 'General Physician', 'Fortis Escorts', '8877112233', 12.00);

INSERT INTO satellite_centers (center_id, name, location, head, status) VALUES 
('CTR-101', 'DLabs Main Pathology Hub', 'South Delhi Centre', 'Dr. Meena Saxena', 'Active'),
('CTR-102', 'DLabs Satellite Intake Point', 'West Delhi Regional Hub', 'Admin Suresh', 'Active'),
('CTR-103', 'DLabs Diagnostics Sub-Desk', 'Swasthya Vihar Circle', 'Rider Supervisor Prem', 'Inactive');

INSERT INTO sample_vial_settings (sample_name, sample_type, container_type) VALUES 
('EDTA Whole Blood', 'EDTA', 'Lavender Vacuum Tube'),
('Serum Separator SST', 'Serum', 'Gold/Yellow Vacuum Tube'),
('Sterile Midstream Urine', 'Urine', 'Sterile Collector Container'),
('Sodium Citrate Coagulation', 'Plasma', 'Light Blue Vacuum Tube'),
('Heparinised Plasma', 'Plasma', 'Green Tube'),
('Nasopharyngeal Swab', 'Swab', 'Transport Media Swab');

INSERT INTO appointments (appt_id, patient_name, age, gender, test_code, appt_time, phone, status) VALUES 
('APP-501', 'Komal Malhotra', 29, 'Female', 'TSH', '2026-06-18 10:00:00+05:30', '9818299101', 'In-Progress'),
('APP-502', 'Rajesh Kumar', 52, 'Male', 'LFT', '2026-06-18 11:30:00+05:30', '9122391029', 'Scheduled'),
('APP-503', 'Ananya Deshmukh', 31, 'Female', 'CBC', '2026-06-18 14:00:00+05:30', '8872109882', 'Scheduled');

-- 8.2 Patients
INSERT INTO patients (patient_id, patient_type, mrn, national_id, designation, patient_name, gender, date_of_birth, age, contact_number, phone_belongs_to, email, organisation, referral) VALUES 
('P-1001', 'Regular', 'MRN-882190', '9901-2291-8812', 'Mr.', 'Amit Kumar Sharma', 'Male', '1985-06-15', 41, '9876543210', 'Patient', 'amit.sharma@gmail.com', 'Direct Walk-In', 'Dr. Alok Sen, Fortis'),
('P-1002', 'Corporate', 'MRN-102911', '4412-8892-0012', 'Mrs.', 'Priya Sundaram', 'Female', '1992-09-24', 33, '8765432109', 'Patient', 'priya.sundaram@yahoo.com', 'Apollo Corporate Wellness', 'Dr. K. Raghavan, Apollo'),
('P-1011', 'Regular', 'MRN-99412', '1122-3344-5566', 'Mr.', 'Harold Jenkins', 'Male', '1974-04-12', 52, '9890123001', 'Patient', 'harold@gmail.com', 'Mercy Health', 'Dr. Gregory House'),
('P-1012', 'Corporate', 'MRN-99413', '1122-3344-5567', 'Ms.', 'Sophia Patel', 'Female', '1997-11-03', 29, '9890123002', 'Patient', 'sophia@yahoo.com', 'Downtown Clinic', 'Dr. Allison Cameron'),
('P-1013', 'Regular', 'MRN-33012', '1122-3344-5568', 'Mr.', 'Marcus Aurelius', 'Male', '1963-08-19', 63, '9890123003', 'Patient', 'marcus@outlook.com', 'Referral Clinic', 'Dr. Eric Foreman'),
('P-1014', 'VIP', 'MRN-10123', '1122-3344-5569', 'Mrs.', 'Theresa Miller', 'Female', '1985-02-14', 41, '9890123004', 'Relative/Guardian', 'theresa@gmail.com', 'Walk-in', 'Dr. Lisa Cuddy'),
('P-1015', 'Regular', 'MRN-84523', '1122-3344-5570', 'Mrs.', 'Elena Rostova', 'Female', '1992-01-29', 34, '9890123005', 'Patient', 'elena@gmail.com', 'Walk-in', 'Dr. Robert Chase'),
('P-1016', 'Corporate', 'MRN-66731', '1122-3344-5571', 'Mr.', 'Li Wei', 'Male', '1979-05-18', 47, '9890123006', 'Patient', 'li.wei@gmail.com', 'Corporate Partner', 'Dr. James Wilson'),
('P-1017', 'VIP', 'MRN-11001', '1122-3344-5572', 'Mr.', 'Arthur Pendragon', 'Male', '1988-10-31', 38, '9890123007', 'Patient', 'king.arthur@camelot.com', 'Emergency Ward', 'Dr. Michael John'),
('P-1018', 'Regular', 'MRN-55409', '1122-3344-5573', 'Ms.', 'Amira Al-Farsi', 'Female', '1982-06-25', 44, '9890123008', 'Patient', 'amira@gmail.com', 'Downtown Clinic', 'Dr. Sarah Connor'),
('P-1019', 'Referral', 'MRN-44910', '1122-3344-5574', 'Mrs.', 'Evelyn Sterling', 'Female', '1954-12-05', 72, '9890123009', 'Relative/Guardian', 'evelyn@sterling.com', 'Referral Clinic', 'Dr. Allison Cameron'),
('P-1020', 'Corporate', 'MRN-22312', '1122-3344-5575', 'Mr.', 'Xavier Dupont', 'Male', '1971-03-22', 55, '9890123010', 'Patient', 'xavier@dupont.fr', 'Corporate Partner', 'Dr. House'),
('P-1021', 'Referral', 'MRN-00666', '1122-3344-5576', 'Mr.', 'Jonathan Harker', 'Male', '1987-07-09', 39, '9890123011', 'Patient', 'harker@harker.com', 'Transylvania Ward', 'Dr. Van Helsing');

-- 8.3 Addresses
INSERT INTO patient_addresses (patient_id, address, city, district, pincode, location_area, state, country, ward_number) VALUES 
('P-1001', 'H.No. 42B, Pocket 1, Sector 15', 'Dwarka', 'South West Delhi', '110075', 'Sector 15', 'Delhi', 'India', ''),
('P-1002', 'Flat 403, Serene Enclave, Road 12', 'Chennai', 'Chennai', '600018', 'Alwarpet', 'Tamil Nadu', 'India', ''),
('P-1011', '89 Park Lane', 'New Delhi', 'South Delhi', '110024', 'Lajpat Nagar', 'Delhi', 'India', 'Ward 12'),
('P-1012', 'Flat 102, Orchid Apartments', 'Mumbai', 'Mumbai City', '400001', 'Colaba', 'Maharashtra', 'India', 'Ward 4'),
('P-1013', 'Forum Romanum 5', 'Rome', 'Rome', '00100', 'Capitol', 'Lazio', 'Italy', 'VIII'),
('P-1014', '742 Evergreen Terrace', 'Springfield', 'Springfield', '58008', 'Sector 7G', 'Oregon', 'United States', ''),
('P-1015', '12 Red Square', 'Moscow', 'Central', '101000', 'Kremlevsky', 'Moscow', 'Russia', ''),
('P-1016', '88 Beijing Road', 'Shanghai', 'Pudong', '200120', 'Lujiazui', 'Shanghai', 'China', ''),
('P-1017', 'Camelot Castle High St', 'Cardiff', 'Glamorgan', 'CF10', 'Castle District', 'Wales', 'United Kingdom', ''),
('P-1018', 'Villa 45, Al Barsha', 'Dubai', 'Al Barsha', '00000', 'Al Barsha 1', 'Dubai', 'UAE', ''),
('P-1019', '221B Baker Street', 'London', 'Westminster', 'NW1 6XE', 'Marylebone', 'England', 'United Kingdom', ''),
('P-1020', '5 Rue de la Paix', 'Paris', 'Paris', '75002', 'Opera', 'Ile-de-France', 'France', ''),
('P-1021', 'Bran Castle Drive 1', 'Brasov', 'Brasov', '500001', 'Bran', 'Transylvania', 'Romania', '');

-- 8.4 Medical Histories
INSERT INTO patient_medical_histories (patient_id, covid_vaccine_received, arogya_setu_app, is_hospitalized, type_of_vaccine, patient_category, patient_occupation, vaccination_date, date_of_dose_2, vaccination_status, body_temperature, symptom_progress, cowin_beneficiary, country_state_travelled, isolation_location, passenger_locator_id, travel_history, symptoms, medical_conditions) VALUES 
('P-1001', TRUE, TRUE, FALSE, 'Covishield', 'General Category', 'Corporate Professional', '2021-08-14', '2021-11-20', 'Fully Vaccinated', 'Normal', 'None', 'COW-8810291', '', '', '', '{}', '{}', '{"Mild hypertension"}'),
('P-1002', TRUE, TRUE, FALSE, 'Covaxin', 'B2B Executive', 'Consultant', '2021-06-10', '2021-07-15', 'Fully Vaccinated', 'Normal', 'None', 'COW-9201928', 'United Kingdom', '', 'PL-UK-9921', '{"London"}', '{}', '{}'),
('P-1011', TRUE, FALSE, FALSE, 'Pfizer', 'General', 'Retired', '2021-03-01', '2021-04-01', 'Fully Vaccinated', 'Normal', 'None', '', '', '', '', '{}', '{}', '{}'),
('P-1012', TRUE, TRUE, FALSE, 'Moderna', 'Corporate', 'Engineer', '2021-05-12', '2021-06-12', 'Fully Vaccinated', 'Normal', 'None', '', '', '', '', '{}', '{}', '{}'),
('P-1013', FALSE, FALSE, TRUE, NULL, 'Vulnerable', 'Senator', NULL, NULL, 'Unvaccinated', 'Normal', 'Stable', '', '', 'Roman Forum Hospital', '', '{}', '{}', '{"Chronic Fatigue"}'),
('P-1014', TRUE, TRUE, FALSE, 'Johnson & Johnson', 'General', 'Homemaker', '2021-09-09', NULL, 'Fully Vaccinated', 'Normal', 'None', '', '', '', '', '{}', '{}', '{}'),
('P-1015', TRUE, FALSE, FALSE, 'Sputnik V', 'General', 'Physicist', '2021-01-20', '2021-02-18', 'Fully Vaccinated', 'Normal', 'None', '', '', '', '', '{}', '{}', '{}'),
('P-1016', TRUE, FALSE, FALSE, 'Sinovac', 'Corporate', 'Director', '2021-04-10', '2021-05-10', 'Fully Vaccinated', 'Normal', 'None', '', '', '', '', '{}', '{}', '{}'),
('P-1017', TRUE, FALSE, TRUE, 'AstraZeneca', 'VIP', 'Commander', '2021-07-20', '2021-10-15', 'Fully Vaccinated', 'High Fever', 'Worsening', '', 'France', 'Field Ward 1', 'PL-CAM-1102', '{"Paris"}', '{"Fever", "Fatigue"}', '{"Anemia"}'),
('P-1018', TRUE, FALSE, FALSE, 'Sinopharm', 'General', 'Scientist', '2021-08-01', '2021-09-01', 'Fully Vaccinated', 'Normal', 'None', '', '', '', '', '{}', '{}', '{"Asthma"}'),
('P-1019', TRUE, FALSE, FALSE, 'AstraZeneca', 'Elderly', 'Writer', '2021-02-15', '2021-05-15', 'Fully Vaccinated', 'Normal', 'None', '', '', '', '', '{}', '{}', '{"Osteoarthritis"}'),
('P-1020', TRUE, FALSE, FALSE, 'Pfizer', 'Corporate', 'Manager', '2021-11-01', '2021-12-01', 'Fully Vaccinated', 'Normal', 'None', '', '', '', '', '{}', '{}', '{}'),
('P-1021', FALSE, FALSE, FALSE, NULL, 'Suspect', 'Clerk', NULL, NULL, 'Unvaccinated', 'Normal', 'Improving', '', 'Transylvania', '', '', '{}', '{"Insomnia"}', '{"Anxiety"}');

-- 8.5 Encounters (Orders)
INSERT INTO encounters (encounter_id, accession_no, patient_id, partner_id, total_amount, status, created_at) VALUES 
('ENC-20001', 'ACC-10020', 'P-1001', 'B2B-1', 1020.00, 'Pending Accession', '2026-06-14 10:30:00+05:30'),
('ENC-20002', 'ACC-10021', 'P-1002', 'B2B-1', 552.50, 'Sample Collected', '2026-06-15 14:15:00+05:30'),
('ENC-20041', 'ACC-10041', 'P-1011', 'B2B-1', 1402.50, 'Processing', '2026-06-16 12:10:00+05:30'), -- CBC + LIPID
('ENC-20042', 'ACC-10042', 'P-1012', NULL, 750.00, 'Processing', '2026-06-16 13:02:00+05:30'), -- TSH
('ENC-20043', 'ACC-10043', 'P-1013', NULL, 450.00, 'Processing', '2026-06-16 10:45:00+05:30'), -- CBC
('ENC-20044', 'ACC-10044', 'P-1014', NULL, 650.00, 'Processing', '2026-06-15 11:20:00+05:30'), -- HBA1C
('ENC-20045', 'ACC-10045', 'P-1015', NULL, 450.00, 'Processing', '2026-06-16 14:00:00+05:30'), -- CBC
('ENC-20046', 'ACC-10046', 'P-1016', 'B2B-1', 1020.00, 'Processing', '2026-06-15 16:40:00+05:30'), -- TSH + CBC
('ENC-20047', 'ACC-10047', 'P-1017', NULL, 450.00, 'Processing', '2026-06-16 14:45:00+05:30'), -- CBC
('ENC-20048', 'ACC-10048', 'P-1018', NULL, 350.00, 'Processing', '2026-06-16 11:30:00+05:30'), -- URINE
('ENC-20049', 'ACC-10049', 'P-1019', NULL, 450.00, 'Processing', '2026-06-14 09:15:00+05:30'), -- CBC
('ENC-20050', 'ACC-10050', 'P-1020', 'B2B-1', 637.50, 'Processing', '2026-06-15 08:30:00+05:30'), -- TSH
('ENC-20051', 'ACC-10051', 'P-1021', NULL, 450.00, 'Approved', '2026-06-16 01:20:00+05:30'); -- CBC (Cancelled)

-- 8.6 Encounter Tests Mapping
INSERT INTO encounter_tests (encounter_id, test_code) VALUES 
('ENC-20001', 'CBC'),
('ENC-20001', 'TSH'),
('ENC-20002', 'HBA1C'),
('ENC-20041', 'CBC'),
('ENC-20041', 'LIPID'),
('ENC-20042', 'TSH'),
('ENC-20043', 'CBC'),
('ENC-20044', 'HBA1C'),
('ENC-20045', 'CBC'),
('ENC-20046', 'TSH'),
('ENC-20046', 'CBC'),
('ENC-20047', 'CBC'),
('ENC-20048', 'URINE'),
('ENC-20049', 'CBC'),
('ENC-20050', 'TSH'),
('ENC-20051', 'CBC');

-- 8.7 Bill Settlements
INSERT INTO bill_settlements (bill_id, encounter_id, bill_date, patient_id, referral, bill_source, organisation, bill_amount, due_amount, status) VALUES 
('BIL-99201', 'ENC-20001', '2026-06-14 10:30:00+05:30', 'P-1001', 'Dr. Alok Sen, Fortis', 'Walk-in Desk', 'Apollo Corporate Wellness', 1020.00, 0.00, 'Paid'),
('BIL-99202', 'ENC-20002', '2026-06-15 14:15:00+05:30', 'P-1002', 'Dr. K. Raghavan, Apollo', 'B2B Pre-Booking', 'Apollo Corporate Wellness', 552.50, 552.50, 'Pending');

-- 8.8 Report Print Tracking
INSERT INTO report_print_tracking (report_id, encounter_id, patient_name, org_name, referral, tests, report_date, bill_date, print_status) VALUES 
('RPT-55201', 'ENC-20001', 'Amit Kumar Sharma', 'Apollo Corporate Wellness', 'Dr. Alok Sen, Fortis', '{"CBC","TSH"}', '2026-06-15 18:00:00+05:30', '2026-06-14 10:30:00+05:30', TRUE),
('RPT-55202', 'ENC-20002', 'Priya Sundaram', 'Apollo Corporate Wellness', 'Dr. K. Raghavan, Apollo', '{"HBA1C"}', NULL, '2026-06-15 14:15:00+05:30', FALSE);

-- 8.9 Samples Accessioning
INSERT INTO samples (sample_id, accession_no, barcode_number, sample_type, status, rejection_reason, collected_at) VALUES 
('SMP-30001', 'ACC-10020', NULL, 'EDTA', 'Pending Collection', NULL, NULL),
('SMP-30002', 'ACC-10020', NULL, 'Serum', 'Pending Collection', NULL, NULL),
('SMP-30003', 'ACC-10021', 'BAR-10021-EDTA', 'EDTA', 'Accessed', NULL, '2026-06-15 14:30:00+05:30'),
('SMP-30041', 'ACC-10041', 'BAR-10041-EDTA', 'EDTA', 'Accessed', NULL, '2026-06-16 12:15:00+05:30'),
('SMP-30042', 'ACC-10041', 'BAR-10041-SERUM', 'Serum', 'Accessed', NULL, '2026-06-16 12:15:00+05:30'),
('SMP-30043', 'ACC-10042', 'BAR-10042-SERUM', 'Serum', 'Accessed', NULL, '2026-06-16 13:10:00+05:30'),
('SMP-30044', 'ACC-10043', 'BAR-10043-EDTA', 'EDTA', 'Accessed', NULL, '2026-06-16 10:55:00+05:30'),
('SMP-30045', 'ACC-10044', 'BAR-10044-EDTA', 'EDTA', 'Accessed', NULL, '2026-06-15 11:35:00+05:30'),
('SMP-30046', 'ACC-10045', 'BAR-10045-EDTA', 'EDTA', 'Accessed', NULL, '2026-06-16 14:10:00+05:30'),
('SMP-30047', 'ACC-10046', 'BAR-10046-SERUM', 'Serum', 'Accessed', NULL, '2026-06-15 16:50:00+05:30'),
('SMP-30048', 'ACC-10046', 'BAR-10046-EDTA', 'EDTA', 'Accessed', NULL, '2026-06-15 16:50:00+05:30'),
('SMP-30049', 'ACC-10047', 'BAR-10047-EDTA', 'EDTA', 'Accessed', NULL, '2026-06-16 14:50:00+05:30'),
('SMP-30050', 'ACC-10048', 'BAR-10048-URINE', 'Urine', 'Accessed', NULL, '2026-06-16 11:40:00+05:30'),
('SMP-30051', 'ACC-10049', 'BAR-10049-EDTA', 'EDTA', 'Accessed', NULL, '2026-06-14 09:30:00+05:30'),
('SMP-30052', 'ACC-10050', 'BAR-10050-SERUM', 'Serum', 'Accessed', NULL, '2026-06-15 08:45:00+05:30'),
('SMP-30053', 'ACC-10051', 'BAR-10051-EDTA', 'EDTA', 'Rejected', 'Hemolyzed specimen rejected by tech thrice. No redraw possible.', '2026-06-16 01:30:00+05:30');

INSERT INTO sample_required_tests (sample_id, test_code) VALUES 
('SMP-30001', 'CBC'),
('SMP-30002', 'TSH'),
('SMP-30003', 'HBA1C'),
('SMP-30041', 'CBC'),
('SMP-30042', 'LIPID'),
('SMP-30043', 'TSH'),
('SMP-30044', 'CBC'),
('SMP-30045', 'HBA1C'),
('SMP-30046', 'CBC'),
('SMP-30047', 'TSH'),
('SMP-30048', 'CBC'),
('SMP-30049', 'CBC'),
('SMP-30050', 'URINE'),
('SMP-30051', 'CBC'),
('SMP-30052', 'TSH'),
('SMP-30053', 'CBC');

-- 8.10 Test Results
INSERT INTO test_results (result_id, accession_no, status, updated_at) VALUES 
('RES-40001', 'ACC-10020', 'Incomplete', '2026-06-14 10:30:00+05:30'),
('RES-40002', 'ACC-10021', 'Incomplete', '2026-06-15 14:15:00+05:30'),
('RES-40201', 'ACC-10041', 'Incomplete', '2026-06-16 12:10:00+05:30'),
('RES-40202', 'ACC-10042', 'Incomplete', '2026-06-16 13:02:00+05:30'),
('RES-40203', 'ACC-10043', 'Partially Completed', '2026-06-16 10:45:00+05:30'),
('RES-40204', 'ACC-10044', 'Rerun', '2026-06-15 11:20:00+05:30'),
('RES-40205', 'ACC-10045', 'Completed', '2026-06-16 14:00:00+05:30'),
('RES-40206', 'ACC-10046', 'Completed', '2026-06-15 16:40:00+05:30'),
('RES-40207', 'ACC-10047', 'Completed', '2026-06-16 14:45:00+05:30'),
('RES-40208', 'ACC-10048', 'Completed', '2026-06-16 11:30:00+05:30'),
('RES-40209', 'ACC-10049', 'Completed', '2026-06-14 09:15:00+05:30'),
('RES-40210', 'ACC-10050', 'Completed', '2026-06-15 08:30:00+05:30'),
('RES-40211', 'ACC-10051', 'Signed', '2026-06-16 01:50:00+05:30');

-- 8.11 Result Parameters Observations
INSERT INTO result_parameters (parameter_id, result_id, parameter_name, observed_value, is_abnormal, reference_range, unit, min_value, max_value) VALUES 
('PAR-50001', 'RES-40001', 'Hemoglobin', '', FALSE, '13.0 - 17.0', 'g/dL', 13.0, 17.0),
('PAR-50002', 'RES-40001', 'WBC Count', '', FALSE, '4000 - 11000', '/cumm', 4000, 11000),
('PAR-50003', 'RES-40001', 'Platelet Count', '', FALSE, '1.5 - 4.5', 'Lakhs/cumm', 1.5, 4.5),
('PAR-50004', 'RES-40001', 'TSH (Thyroid Stimulating Hormone)', '', FALSE, '0.45 - 4.50', 'uIU/mL', 0.45, 4.50),
('PAR-50005', 'RES-40002', 'HbA1c', '', FALSE, '4.0 - 5.6', '%', 4.0, 5.6),
('PAR-50006', 'RES-40002', 'Average Blood Glucose', '', FALSE, '70 - 110', 'mg/dL', 70, 110),
-- P1-P3 (RES-40201)
('PAR-50101', 'RES-40201', 'Hemoglobin', '', FALSE, '13.0 - 17.5', 'g/dL', 13.0, 17.5),
('PAR-50102', 'RES-40201', 'WBC Count', '', FALSE, '4000 - 11000', '/cumm', 4000, 11000),
('PAR-50103', 'RES-40201', 'Total Cholesterol', '', FALSE, '100 - 200', 'mg/dL', 100, 200),
-- P4 (RES-40202)
('PAR-50104', 'RES-40202', 'Thyroid Stimulating Hormone (TSH)', '3.4', FALSE, '0.45 - 4.50', 'uIU/mL', 0.45, 4.50),
-- P5-P6 (RES-40203)
('PAR-50105', 'RES-40203', 'Hemoglobin', '14.2', FALSE, '13.0 - 17.5', 'g/dL', 13.0, 17.5),
('PAR-50106', 'RES-40203', 'WBC Count', '', FALSE, '4000 - 11000', '/cumm', 4000, 11000),
-- P7 (RES-40204)
('PAR-50107', 'RES-40204', 'HbA1c', '8.4', TRUE, '4.0 - 5.6', '%', 4.0, 5.6),
-- P8-P9 (RES-40205)
('PAR-50108', 'RES-40205', 'Hemoglobin', '12.8', FALSE, '12.0 - 16.0', 'g/dL', 12.0, 16.0),
('PAR-50109', 'RES-40205', 'WBC Count', '6200', FALSE, '4000 - 11000', '/cumm', 4000, 11000),
-- P10-P11 (RES-40206)
('PAR-50110', 'RES-40206', 'Thyroid Stimulating Hormone (TSH)', '2.1', FALSE, '0.45 - 4.50', 'uIU/mL', 0.45, 4.50),
('PAR-50111', 'RES-40206', 'Hemoglobin', '14.5', FALSE, '13.0 - 17.5', 'g/dL', 13.0, 17.5),
-- P12-P13 (RES-40207)
('PAR-50112', 'RES-40207', 'Hemoglobin', '7.8', TRUE, '13.0 - 17.5', 'g/dL', 13.0, 17.5),
('PAR-50113', 'RES-40207', 'WBC Count', '24500', TRUE, '4000 - 11000', '/cumm', 4000, 11000),
-- P14 (RES-40208)
('PAR-50114', 'RES-40208', 'Urine Protein', '300', TRUE, '0 - 30', 'mg/dL', 0, 30),
-- P15 (RES-40209)
('PAR-50115', 'RES-40209', 'Hemoglobin', '11.2', TRUE, '12.0 - 16.0', 'g/dL', 12.0, 16.0),
-- P16 (RES-40210)
('PAR-50116', 'RES-40210', 'Ultra-Sensitive TSH', '4.2', TRUE, '0.40 - 4.00', 'uIU/mL', 0.40, 4.00),
-- P17 (RES-40211)
('PAR-50117', 'RES-40211', 'Hemoglobin', '0.0', TRUE, '13.0 - 17.5', 'g/dL', 13.0, 17.5);

-- 8.12 Clinical Queue dashboard states
INSERT INTO clinical_patient_cases (result_id, category, notes, tat_exceeded_hours, outsource_center) VALUES 
('RES-40201', 'Incomplete', NULL, NULL, NULL),
('RES-40202', 'Incomplete', NULL, NULL, NULL),
('RES-40203', 'Partially Completed', NULL, NULL, NULL),
('RES-40204', 'Active Reruns', 'Instrument flags high CV%. Rerunning on backup Beckman Coulter DxC analyzer.', NULL, NULL),
('RES-40205', 'Completed', NULL, NULL, NULL),
('RES-40206', 'Partially Signed', 'TSH parameters confirmed by Registrar. Hemoglobin awaiting Pathologist countersign.', NULL, NULL),
('RES-40207', 'Emergency Reports', 'EMERGENCY STAT: Severe leukocytosis and acute anemia. Redraw confirmed on critical alert.', NULL, NULL),
('RES-40208', 'Critical Reports', 'Critical value panic threshold: Severe proteinuria noted. Pathologist notified directly.', NULL, NULL),
('RES-40209', 'TAT Exceeded', 'TAT Breach Warning: Specimen clotted initially, delay in physical floor redraw.', 14, NULL),
('RES-40210', 'Outsourced', NULL, NULL, 'Mayo Clinic Specialty Reference'),
('RES-40211', 'Cancelled Reports', 'ORDER CANCELLED: Hemolyzed specimen rejected by tech thrice. No redraw possible.', NULL, NULL);

-- ===========================================================================
-- SCHEMA INITIALIZATION COMPLETE
-- ===========================================================================
