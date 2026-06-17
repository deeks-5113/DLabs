import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { 
  TestCatalog, 
  B2B_Partner, 
  Patient, 
  Encounter, 
  LabProfile,
  BillSettlement,
  ReportPrintTracking,
  TestConfig,
  BillSettings,
  InvoiceSettings,
  FinancialDashboard,
  PriceList,
  CenterDetails,
  CenterResources,
  SystemUser,
  SystemIntegrations,
  Sample,
  TestResult,
  ResultParameter,
  ClinicalPatientCase,
  Appointment,
  ReferringDoctor,
  SatelliteCenter,
  SampleSetting
} from '../types';

interface AppContextType {
  labProfile: LabProfile;
  testCatalog: TestCatalog[];
  b2bPartners: B2B_Partner[];
  patients: Patient[];
  encounters: Encounter[];
  billSettlements: BillSettlement[];
  reportPrints: ReportPrintTracking[];
  testConfigs: TestConfig[];
  billSettings: BillSettings;
  invoiceSettings: InvoiceSettings;
  financialDashboard: FinancialDashboard;
  priceLists: PriceList[];
  centerDetails: CenterDetails;
  centerResources: CenterResources;
  systemUsers: SystemUser[];
  systemIntegrations: SystemIntegrations;

  // Phase 2 structures
  samples: Sample[];
  testResults: TestResult[];
  resultParameters: ResultParameter[];
  patientCases: ClinicalPatientCase[];
  setPatientCases: React.Dispatch<React.SetStateAction<ClinicalPatientCase[]>>;

  // Newly Synced structures
  appointments: Appointment[];
  referringDoctors: ReferringDoctor[];
  satelliteCenters: SatelliteCenter[];
  sampleVialSettings: SampleSetting[];
  archivedPatientIds: string[];

  activeSubView: string;
  setActiveSubView: (view: string) => void;

  isLoading: boolean;

  updateLabProfile: (profile: LabProfile) => void;
  addTest: (test: TestCatalog) => void;
  addPartner: (partner: B2B_Partner) => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (patient: Patient) => void;
  createEncounter: (
    patientId: string,
    partnerId: string | null,
    tests: string[],
    totalAmount: number,
    referral?: string,
    organisation?: string,
    customLogistics?: any,
    customMedHistory?: any
  ) => Encounter;
  updateEncounterStatus: (id: string, status: 'Pending Accession' | 'Sample Collected' | 'Processing' | 'Approved') => void;
  
  // Phase 2 action handlers
  collectSample: (sampleId: string, barcode: string) => void;
  bulkCollectSamplesForAccession: (accessionNo: string) => void;
  rejectSample: (sampleId: string, reason: string) => void;
  resetRejectedSampleToPending: (sampleId: string) => void;
  saveDraftParameters: (resultId: string, parameters: ResultParameter[]) => void;
  signAndApproveResult: (resultId: string, parameters: ResultParameter[]) => void;

  addBillSettlement: (bill: BillSettlement) => void;
  updateBillStatus: (id: string, status: 'Pending' | 'Paid' | 'Cancelled') => void;
  addReportPrint: (report: ReportPrintTracking) => void;
  updateReportPrintStatus: (id: string, status: boolean) => void;
  addTestConfig: (config: TestConfig) => void;
  updateBillSettings: (settings: BillSettings) => void;
  updateInvoiceSettings: (settings: InvoiceSettings) => void;
  updateFinancialDashboard: (stats: FinancialDashboard) => void;
  addPriceList: (list: PriceList) => void;
  updateCenterDetails: (details: CenterDetails) => void;
  updateCenterResources: (resources: CenterResources) => void;
  addSystemUser: (user: SystemUser) => void;
  updateSystemIntegrations: (integrations: SystemIntegrations) => void;

  // Sync methods for new tables
  addAppointment: (appt: Appointment) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  addReferringDoctor: (doc: ReferringDoctor) => Promise<void>;
  addSatelliteCenter: (center: SatelliteCenter) => Promise<void>;
  addSampleVialSetting: (setting: SampleSetting) => Promise<void>;
  updateSampleVialSetting: (setting: SampleSetting) => Promise<void>;
  deleteSampleVialSetting: (srNo: number) => Promise<void>;
  toggleArchivePatient: (id: string) => Promise<void>;

  searchGlobal: (query: string) => Array<{
    type: 'patient' | 'accession' | 'partner' | 'test' | 'bill';
    id: string;
    title: string;
    subtitle: string;
    targetModule: 'registration' | 'admin' | 'dashboard';
    payload?: any;
  }>;
  currentLanguage: 'en' | 'te' | 'hi';
  setLanguage: (lang: 'en' | 'te' | 'hi') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialAppointments: Appointment[] = [
  { appt_id: "APP-501", patient_name: "Komal Malhotra", age: 29, gender: "Female", test_code: "TSH", appt_time: new Date().toISOString(), phone: "9818299101", status: "In-Progress" },
  { appt_id: "APP-502", patient_name: "Rajesh Kumar", age: 52, gender: "Male", test_code: "LFT", appt_time: new Date().toISOString(), phone: "9122391029", status: "Scheduled" },
  { appt_id: "APP-503", patient_name: "Ananya Deshmukh", age: 31, gender: "Female", test_code: "CBC", appt_time: new Date().toISOString(), phone: "8872109882", status: "Scheduled" }
];

const initialReferringDoctors: ReferringDoctor[] = [
  { id: 'DR-01', name: 'Dr. Alok Sen', speciality: 'Cardiology', clinic: 'Max Healthcare', contact: '9811223344', commission: 15 },
  { id: 'DR-02', name: 'Dr. Sunita Mehta', speciality: 'Endocrinology', clinic: 'Indraprastha Apollo', contact: '9122334455', commission: 10 },
  { id: 'DR-03', name: 'Dr. Joseph Kurian', speciality: 'General Physician', clinic: 'Fortis Escorts', contact: '8877112233', commission: 12 }
];

const initialSatelliteCenters: SatelliteCenter[] = [
  { center_id: 'CTR-101', name: 'DLabs Main Pathology Hub', location: 'South Delhi Centre', head: 'Dr. Meena Saxena', status: 'Active' },
  { center_id: 'CTR-102', name: 'DLabs Satellite Intake Point', location: 'West Delhi Regional Hub', head: 'Admin Suresh', status: 'Active' },
  { center_id: 'CTR-103', name: 'DLabs Diagnostics Sub-Desk', location: 'Swasthya Vihar Circle', head: 'Rider Supervisor Prem', status: 'Inactive' }
];

const initialSampleVialSettings: SampleSetting[] = [
  { sr_no: 1, sample_name: "EDTA Whole Blood", sample_type: "EDTA", container_type: "Lavender Vacuum Tube" },
  { sr_no: 2, sample_name: "Serum Separator SST", sample_type: "Serum", container_type: "Gold/Yellow Vacuum Tube" },
  { sr_no: 3, sample_name: "Sterile Midstream Urine", sample_type: "Urine", container_type: "Sterile Collector Container" },
  { sr_no: 4, sample_name: "Sodium Citrate Coagulation", sample_type: "Plasma", container_type: "Light Blue Vacuum Tube" },
  { sr_no: 5, sample_name: "Heparinised Plasma", sample_type: "Plasma", container_type: "Green Tube" },
  { sr_no: 6, sample_name: "Nasopharyngeal Swab", sample_type: "Swab", container_type: "Transport Media Swab" }
];

// Initial Static Seeding Data based on re-did structures
const initialLabProfile: LabProfile = {
  name: "DLabs Diagnostics Pvt Ltd",
  address: "S-21, Block A, Okhla Industrial Area, Phase-III, New Delhi, Delhi 110020",
  email: "ops@dlabsfield.in",
  phone: "011-45091211",
};

const initialTestCatalog: TestCatalog[] = [
  { test_code: "CBC", test_name: "Complete Blood Count", sample_type: "Blood", container_type: "Purple EDTA Tube", retail_price: 450, department: "Hematology", average_tat: "4 Hours", outsource_status: "In-House", outsource_center: "", list_price: 450 },
  { test_code: "HBA1C", test_name: "Glycated Haemoglobin (HbA1c)", sample_type: "Blood", container_type: "Purple EDTA Tube", retail_price: 650, department: "Biochemistry", average_tat: "6 Hours", outsource_status: "In-House", outsource_center: "", list_price: 650 },
  { test_code: "TSH", test_name: "Thyroid Stimulating Hormone (Ultra-sensitive)", sample_type: "Serum", container_type: "Yellow SST Tube", retail_price: 750, department: "Immunology", average_tat: "8 Hours", outsource_status: "In-House", outsource_center: "", list_price: 750 },
  { test_code: "LIPID", test_name: "Lipid Profile (Cholesterol Spectrum)", sample_type: "Serum", container_type: "Yellow SST Tube", retail_price: 1200, department: "Biochemistry", average_tat: "5 Hours", outsource_status: "In-House", outsource_center: "", list_price: 1200 },
  { test_code: "LFT", test_name: "Liver Function Panel", sample_type: "Serum", container_type: "Yellow SST Tube", retail_price: 950, department: "Biochemistry", average_tat: "6 Hours", outsource_status: "In-House", outsource_center: "", list_price: 950 },
  { test_code: "KFT", test_name: "Kidney / Renal Function Panel", sample_type: "Serum", container_type: "Yellow SST Tube", retail_price: 850, department: "Biochemistry", average_tat: "6 Hours", outsource_status: "In-House", outsource_center: "", list_price: 850 },
  { test_code: "URINE", test_name: "Urine Routine & Examination", sample_type: "Urine", container_type: "Sterile Specimen Cup", retail_price: 350, department: "Clinical Pathology", average_tat: "2 Hours", outsource_status: "In-House", outsource_center: "", list_price: 350 },
  { test_code: "VITD3", test_name: "Vitamin D3 (25-Hydroxy)", sample_type: "Serum", container_type: "Yellow SST Tube", retail_price: 1500, department: "Special Chemistry", average_tat: "24 Hours", outsource_status: "Outsourced", outsource_center: "National Superlabs Inc.", list_price: 1500 },
];

const initialB2BPartners: B2B_Partner[] = [
  { partner_id: "B2B-1", partner_name: "Apollo Corporate Wellness", discount_percentage: 15, billing_type: "Postpaid" },
  { partner_id: "B2B-2", partner_name: "CareMax Health Checkups", discount_percentage: 20, billing_type: "Prepaid" },
  { partner_id: "B2B-3", partner_name: "MaxFit Diagnostic Alliances", discount_percentage: 12, billing_type: "Postpaid" },
  { partner_id: "B2B-4", partner_name: "Hindustan Labs Referral Group", discount_percentage: 25, billing_type: "Prepaid" },
];

const initialPatients: Patient[] = [
  {
    patient_id: "P-1001",
    patient_type: "Regular",
    mrn: "MRN-882190",
    national_id: "9901-2291-8812",
    designation: "Mr.",
    patient_name: "Amit Kumar Sharma",
    gender: "Male",
    date_of_birth: "1985-06-15",
    age: 41,
    contact_number: "9876543210",
    phone_belongs_to: "Patient",
    email: "amit.sharma@gmail.com",
    organisation: "Direct Walk-In",
    referral: "Dr. Alok Sen, Fortis",
    address_details: {
      address: "H.No. 42B, Pocket 1, Sector 15",
      city: "Dwarka",
      district: "South West Delhi",
      pincode: "110075",
      location_area: "Sector 15",
      state: "Delhi",
      country: "India",
      ward_number: ""
    },
    medical_history: {
      covid_vaccine_received: true,
      arogya_setu_app: true,
      is_hospitalized: false,
      type_of_vaccine: "Covishield",
      patient_category: "General Category",
      patient_occupation: "Corporate Professional",
      vaccination_date: "2021-08-14",
      date_of_dose_2: "2021-11-20",
      vaccination_status: "Fully Vaccinated",
      body_temperature: "Normal",
      symptom_progress: "None",
      cowin_beneficiary: "COW-8810291",
      country_state_travelled: "",
      isolation_location: "",
      passenger_locator_id: "",
      travel_history: [],
      symptoms: [],
      medical_conditions: ["Mild hypertension"]
    },
    logistics: {
      sample_collected_from: "Lab Center",
      mode_of_transport: "Self-delivered"
    }
  },
  {
    patient_id: "P-1002",
    patient_type: "Corporate",
    mrn: "MRN-102911",
    national_id: "4412-8892-0012",
    designation: "Mrs.",
    patient_name: "Priya Sundaram",
    gender: "Female",
    date_of_birth: "1992-09-24",
    age: 33,
    contact_number: "8765432109",
    phone_belongs_to: "Patient",
    email: "priya.sundaram@yahoo.com",
    organisation: "Apollo Corporate Wellness",
    referral: "Dr. K. Raghavan, Apollo",
    address_details: {
      address: "Flat 403, Serene Enclave, Road 12",
      city: "Chennai",
      district: "Chennai",
      pincode: "600018",
      location_area: "Alwarpet",
      state: "Tamil Nadu",
      country: "India",
      ward_number: ""
    },
    medical_history: {
      covid_vaccine_received: true,
      arogya_setu_app: true,
      is_hospitalized: false,
      type_of_vaccine: "Covaxin",
      patient_category: "B2B Executive",
      patient_occupation: "Consultant",
      vaccination_date: "2021-06-10",
      date_of_dose_2: "2021-07-15",
      vaccination_status: "Fully Vaccinated",
      body_temperature: "Normal",
      symptom_progress: "None",
      cowin_beneficiary: "COW-9201928",
      country_state_travelled: "United Kingdom",
      isolation_location: "",
      passenger_locator_id: "PL-UK-9921",
      travel_history: ["London"],
      symptoms: [],
      medical_conditions: []
    },
    logistics: {
      sample_collected_from: "Home",
      mode_of_transport: "Lab Rider"
    }
  }
];

const initialEncounters: Encounter[] = [
  {
    encounter_id: "ENC-20001",
    accession_no: "ACC-10020",
    patient_id: "P-1001",
    partner_id: "B2B-1",
    total_amount: 1020, // (450 + 750) = 1200 * 0.85 = 1020
    status: "Pending Accession",
    tests_ordered: ["CBC", "TSH"],
    created_at: "14/06/2026 10:30"
  },
  {
    encounter_id: "ENC-20002",
    accession_no: "ACC-10021",
    patient_id: "P-1002",
    partner_id: "B2B-1",
    total_amount: 552.5, // 650 * 0.85 = 552.5
    status: "Sample Collected",
    tests_ordered: ["HBA1C"],
    created_at: "15/06/2026 14:15"
  }
];

const initialSamples: Sample[] = [
  {
    sample_id: "SMP-30001",
    accession_no: "ACC-10020",
    barcode_number: null,
    sample_type: "EDTA",
    status: "Pending Collection",
    required_test_codes: ["CBC"]
  },
  {
    sample_id: "SMP-30002",
    accession_no: "ACC-10020",
    barcode_number: null,
    sample_type: "Serum",
    status: "Pending Collection",
    required_test_codes: ["TSH"]
  },
  {
    sample_id: "SMP-30003",
    accession_no: "ACC-10021",
    barcode_number: "BAR-10021-EDTA",
    sample_type: "EDTA",
    status: "Accessed",
    required_test_codes: ["HBA1C"],
    collected_at: "15/06/2026 14:30"
  }
];

const initialTestResults: TestResult[] = [
  {
    result_id: "RES-40001",
    accession_no: "ACC-10020",
    status: "Incomplete"
  },
  {
    result_id: "RES-40002",
    accession_no: "ACC-10021",
    status: "Incomplete"
  }
];

const initialResultParameters: ResultParameter[] = [
  {
    parameter_id: "PAR-50001",
    result_id: "RES-40001",
    parameter_name: "Hemoglobin",
    observed_value: "",
    is_abnormal: false,
    reference_range: "13.0 - 17.0",
    unit: "g/dL",
    min_value: 13.0,
    max_value: 17.0
  },
  {
    parameter_id: "PAR-50002",
    result_id: "RES-40001",
    parameter_name: "WBC Count",
    observed_value: "",
    is_abnormal: false,
    reference_range: "4000 - 11000",
    unit: "/cumm",
    min_value: 4000,
    max_value: 11000
  },
  {
    parameter_id: "PAR-50003",
    result_id: "RES-40001",
    parameter_name: "Platelet Count",
    observed_value: "",
    is_abnormal: false,
    reference_range: "1.5 - 4.5",
    unit: "Lakhs/cumm",
    min_value: 1.5,
    max_value: 4.5
  },
  {
    parameter_id: "PAR-50004",
    result_id: "RES-40001",
    parameter_name: "TSH (Thyroid Stimulating Hormone)",
    observed_value: "",
    is_abnormal: false,
    reference_range: "0.45 - 4.50",
    unit: "uIU/mL",
    min_value: 0.45,
    max_value: 4.50
  },
  {
    parameter_id: "PAR-50005",
    result_id: "RES-40002",
    parameter_name: "HbA1c",
    observed_value: "",
    is_abnormal: false,
    reference_range: "4.0 - 5.6",
    unit: "%",
    min_value: 4.0,
    max_value: 5.6
  },
  {
    parameter_id: "PAR-50006",
    result_id: "RES-40002",
    parameter_name: "Average Blood Glucose",
    observed_value: "",
    is_abnormal: false,
    reference_range: "70 - 110",
    unit: "mg/dL",
    min_value: 70,
    max_value: 110
  }
];

const initialBillSettlements: BillSettlement[] = [
  {
    bill_id: "BIL-99201",
    bill_date: "14/06/2026 10:30",
    patient_details: {
      name: "Amit Kumar Sharma",
      gender: "Male",
      age: 41,
      patient_id: "P-1001"
    },
    referral: "Dr. Alok Sen, Fortis",
    bill_source: "Walk-in Desk",
    organisation: "Apollo Corporate Wellness",
    bill_amount: 1020,
    due_amount: 0,
    status: "Paid"
  },
  {
    bill_id: "BIL-99202",
    bill_date: "15/06/2026 14:15",
    patient_details: {
      name: "Priya Sundaram",
      gender: "Female",
      age: 33,
      patient_id: "P-1002"
    },
    referral: "Dr. K. Raghavan, Apollo",
    bill_source: "B2B Pre-Booking",
    organisation: "Apollo Corporate Wellness",
    bill_amount: 552.5,
    due_amount: 552.5,
    status: "Pending"
  }
];

const initialReportPrints: ReportPrintTracking[] = [
  {
    report_id: "RPT-55201",
    patient_name: "Amit Kumar Sharma",
    org_name: "Apollo Corporate Wellness",
    referral: "Dr. Alok Sen, Fortis",
    tests: ["CBC", "TSH"],
    report_date: "15/06/2026 18:00",
    bill_date: "14/06/2026 10:30",
    print_status: true
  },
  {
    report_id: "RPT-55202",
    patient_name: "Priya Sundaram",
    org_name: "Apollo Corporate Wellness",
    referral: "Dr. K. Raghavan, Apollo",
    tests: ["HBA1C"],
    report_date: "",
    bill_date: "15/06/2026 14:15",
    print_status: false
  }
];

const initialTestConfigs: TestConfig[] = [
  { testName: "Complete Blood Count", testCode: "CBC", sampleType: "Blood", department: "Hematology", outsourceCenter: "", verificationStatus: "Verified", price: 450, isOutsourced: false, autoApproval: true },
  { testName: "Glycated Haemoglobin (HbA1c)", testCode: "HBA1C", sampleType: "Blood", department: "Biochemistry", outsourceCenter: "", verificationStatus: "Verified", price: 650, isOutsourced: false, autoApproval: true },
  { testName: "Thyroid Stimulating Hormone (Ultra-sensitive)", testCode: "TSH", sampleType: "Serum", department: "Immunology", outsourceCenter: "", verificationStatus: "Verified", price: 750, isOutsourced: false, autoApproval: false },
  { testName: "Kidney / Renal Function Panel", testCode: "KFT", sampleType: "Serum", department: "Biochemistry", outsourceCenter: "", verificationStatus: "Pending", price: 850, isOutsourced: false, autoApproval: true }
];

const initialBillSettings: BillSettings = {
  preSetAdditionalAmount: 50, // Registration processing fee
  billHeaderFlag: true,
  billFooterFlag: true,
  billSignatureFlag: true,
  barcodeFlag: true,
  sampleTypeOnBarcode: true,
  collectionDate: true,
  billReceiptQRCode: true,
  testName: true,
  shortTestNames: false,
  manualAccessionNumberMandatory: false,
  duplicateAccessionNumber: "Warn",
  patientPrintCard: "Detailed",
  helperComment: "Requires standard clinical test code mapping for GST ledger reporting."
};

const initialInvoiceSettings: InvoiceSettings = {
  headerHeight: 120,
  footerHeight: 80,
  headerImage: "https://images.unsplash.com/photo-1516841273335-e39b37888115?w=150&auto=format&fit=crop",
  footerImage: "",
  invoiceHeaderFlag: true,
  invoiceFooterFlag: true,
  useBillLevelVATInQRCode: true,
  helperComment: "Tax calculations integrated strictly using IGST/CGST guidelines."
};

const initialFinancialDashboard: FinancialDashboard = {
  totalRevenue: 245000,
  amountDue: 45000,
  amountPaid: 200000,
  cashCollection: 85000,
  onlineCollection: 110000,
  othersCollection: 5000,
  averagePatientRating: 4.8,
  totalLogins: 452
};

const initialPriceLists: PriceList[] = [
  { listName: "Corporate Special Care Tariff", listType: "Corporate", listCategory: "Corporate", status: "Active", createdTime: "2026-01-10" },
  { listName: "Seniors CGHS CG Scheme", listType: "Government Benefit", listCategory: "Govt", status: "Active", createdTime: "2026-02-15" },
  { listName: "Retail Standard Tariff Directory", listType: "Standard Walk-In", listCategory: "Retail", status: "Active", createdTime: "2026-01-01" }
];

const initialCenterDetails: CenterDetails = {
  labName: "DLabs Diagnostics Pvt Ltd (Main HQ)",
  authID: "AUTH-DEL-09921",
  reportSharingKey: "KEY-DLABS-X82110",
  labAddress: "S-21, Block A, Okhla Industrial Area, Phase-III",
  area: "Okhla Phase-III",
  city: "New Delhi",
  typeOfFunctioning: "Reference Pathology Lab",
  website: "www.dlabsdiagnostics.com",
  primaryContactNumber: "011-45091211",
  secondaryContactNumber: "9876543210",
  labEmail: "ops@dlabsfield.in",
  adminEmail: "director@dlabsfield.in",
  timingsFrom: "07:00",
  timingsTo: "22:00",
  is24x7: true
};

const initialCenterResources: CenterResources = {
  centerLogo: "https://images.unsplash.com/photo-1516841273335-e39b37888115?w=120&auto=format&fit=crop",
  mobileHeader: "DLabs Diagnostics",
  pdfHeader: "DLabs Diagnostics Pvt Ltd, ISO 9001:2015 Accredited Center",
  pdfFooter: "Strictly confidential - compiled by automated LIMS analyser systems",
  billHeader: "DLabs Diagnostics GST: 07AAAAD8829F1ZS"
};

const initialSystemUsers: SystemUser[] = [
  { username: "ops_lab_admin", name: "Suresh Chandra", userRole: "Super Administrator", defaultLoginSection: "Registration", lastActivity: "2026-06-16 10:45" },
  { username: "lab_tech_r", name: "Ruchi Aggarwal", userRole: "Clinical Biochemist Technician", defaultLoginSection: "Analyzer Desk", lastActivity: "2026-06-16 09:12" },
  { username: "b2b_spoc_desk", name: "Gopal Kishan", userRole: "Desk Operator", defaultLoginSection: "Registration", lastActivity: "2026-06-16 10:50" }
];

const initialSystemIntegrations: SystemIntegrations = {
  apiRequestsCount: 15410,
  webhookTriggersCount: 3205,
  errorCount: 14,
  apiEndpointFilter: "/api/v1/patient-intake"
};

const initialPatientCases: ClinicalPatientCase[] = [
  {
    result_id: "RES-40201",
    accession_no: "ACC-10041",
    patient_id: "P-1011",
    patient_name: "Harold Jenkins",
    age: 52,
    gender: 'M',
    mrn: "MRN-99412",
    tests_ordered: ["CBC", "LIPID"],
    organisation: "Mercy Health General Hospital",
    referral_doctor: "Dr. Gregory House",
    order_date: "16/06/2026 12:10",
    category: "Incomplete",
    status: 'Incomplete',
    parameters: [
      { parameter_id: "P1", parameter_name: "Hemoglobin", observed_value: "", unit: "g/dL", min_value: 13.0, max_value: 17.5, reference_range: "13.0 - 17.5", is_abnormal: false },
      { parameter_id: "P2", parameter_name: "WBC Count", observed_value: "", unit: "/cumm", min_value: 4000, max_value: 11000, reference_range: "4000 - 11000", is_abnormal: false },
      { parameter_id: "P3", parameter_name: "Total Cholesterol", observed_value: "", unit: "mg/dL", min_value: 100, max_value: 200, reference_range: "100 - 200", is_abnormal: false }
    ]
  },
  {
    result_id: "RES-40202",
    accession_no: "ACC-10042",
    patient_id: "P-1012",
    patient_name: "Sophia Patel",
    age: 29,
    gender: 'F',
    mrn: "MRN-99413",
    tests_ordered: ["TSH"],
    organisation: "Downtown Clinic Inc",
    referral_doctor: "Dr. Allison Cameron",
    order_date: "16/06/2026 13:02",
    category: "Incomplete",
    status: 'Incomplete',
    parameters: [
      { parameter_id: "P4", parameter_name: "Thyroid Stimulating Hormone (TSH)", observed_value: "3.4", unit: "uIU/mL", min_value: 0.45, max_value: 4.5, reference_range: "0.45 - 4.50", is_abnormal: false }
    ]
  },
  {
    result_id: "RES-40203",
    accession_no: "ACC-10043",
    patient_id: "P-1013",
    patient_name: "Marcus Aurelius",
    age: 63,
    gender: 'M',
    mrn: "MRN-33012",
    tests_ordered: ["CBC"],
    organisation: "Referral Clinic Center",
    referral_doctor: "Dr. Eric Foreman",
    order_date: "16/06/2026 10:45",
    category: "Partially Completed",
    status: 'Partially Completed',
    parameters: [
      { parameter_id: "P5", parameter_name: "Hemoglobin", observed_value: "14.2", unit: "g/dL", min_value: 13.0, max_value: 17.5, reference_range: "13.0 - 17.5", is_abnormal: false },
      { parameter_id: "P6", parameter_name: "WBC Count", observed_value: "", unit: "/cumm", min_value: 4000, max_value: 11000, reference_range: "4000 - 11000", is_abnormal: false }
    ]
  },
  {
    result_id: "RES-40204",
    accession_no: "ACC-10044",
    patient_id: "P-1014",
    patient_name: "Theresa Miller",
    age: 41,
    gender: 'F',
    mrn: "MRN-10123",
    tests_ordered: ["HBA1C"],
    organisation: "Metro Lab Walk-In",
    referral_doctor: "Dr. Lisa Cuddy",
    order_date: "15/06/2026 11:20",
    category: "Active Reruns",
    status: 'Active Rerun',
    parameters: [
      { parameter_id: "P7", parameter_name: "HbA1c", observed_value: "8.4", unit: "%", min_value: 4.0, max_value: 5.6, reference_range: "4.0 - 5.6", is_abnormal: true }
    ],
    notes: "Instrument flags high CV%. Rerunning on backup Beckman Coulter DxC analyzer."
  },
  {
    result_id: "RES-40205",
    accession_no: "ACC-10045",
    patient_id: "P-1015",
    patient_name: "Elena Rostova",
    age: 34,
    gender: 'F',
    mrn: "MRN-84523",
    tests_ordered: ["CBC"],
    organisation: "Walk-In Patient",
    referral_doctor: "Dr. Robert Chase",
    order_date: "16/06/2026 14:00",
    category: "Completed",
    status: 'Completed',
    parameters: [
      { parameter_id: "P8", parameter_name: "Hemoglobin", observed_value: "12.8", unit: "g/dL", min_value: 12.0, max_value: 16.0, reference_range: "12.0 - 16.0", is_abnormal: false },
      { parameter_id: "P9", parameter_name: "WBC Count", observed_value: "6200", unit: "/cumm", min_value: 4000, max_value: 11000, reference_range: "4000 - 11000", is_abnormal: false }
    ]
  },
  {
    result_id: "RES-40206",
    accession_no: "ACC-10046",
    patient_id: "P-1016",
    patient_name: "Li Wei",
    age: 47,
    gender: 'M',
    mrn: "MRN-66731",
    tests_ordered: ["TSH", "CBC"],
    organisation: "Corporate Partner Hospital",
    referral_doctor: "Dr. James Wilson",
    order_date: "15/06/2026 16:40",
    category: "Partially Signed",
    status: 'Partially Signed',
    parameters: [
      { parameter_id: "P10", parameter_name: "Thyroid Stimulating Hormone (TSH)", observed_value: "2.1", unit: "uIU/mL", min_value: 0.45, max_value: 4.5, reference_range: "0.45 - 4.50", is_abnormal: false },
      { parameter_id: "P11", parameter_name: "Hemoglobin", observed_value: "14.5", unit: "g/dL", min_value: 13.0, max_value: 17.5, reference_range: "13.0 - 17.5", is_abnormal: false }
    ],
    notes: "TSH parameters confirmed by Registrar. Hemoglobin awaiting Pathologist countersign."
  },
  {
    result_id: "RES-40207",
    accession_no: "ACC-10047",
    patient_id: "P-1017",
    patient_name: "Arthur Pendragon",
    age: 38,
    gender: 'M',
    mrn: "MRN-11001",
    tests_ordered: ["CBC"],
    organisation: "Emergency Ward Annex",
    referral_doctor: "Dr. Michael John",
    order_date: "16/06/2026 14:45",
    category: "Emergency Reports",
    status: 'Emergency',
    parameters: [
      { parameter_id: "P12", parameter_name: "Hemoglobin", observed_value: "7.8", unit: "g/dL", min_value: 13.0, max_value: 17.5, reference_range: "13.0 - 17.5", is_abnormal: true },
      { parameter_id: "P13", parameter_name: "WBC Count", observed_value: "24500", unit: "/cumm", min_value: 4000, max_value: 11000, reference_range: "4000 - 11000", is_abnormal: true }
    ],
    notes: "EMERGENCY STAT: Severe leukocytosis and acute anemia. Redraw confirmed on critical alert."
  },
  {
    result_id: "RES-40208",
    accession_no: "ACC-10048",
    patient_id: "P-1018",
    patient_name: "Amira Al-Farsi",
    age: 44,
    gender: 'F',
    mrn: "MRN-55409",
    tests_ordered: ["URINE"],
    organisation: "Downtown Clinic Inc",
    referral_doctor: "Dr. Sarah Connor",
    order_date: "16/06/2026 11:30",
    category: "Critical Reports",
    status: 'Critical',
    parameters: [
      { parameter_id: "P14", parameter_name: "Urine Protein", observed_value: "300", unit: "mg/dL", min_value: 0, max_value: 30, reference_range: "0 - 30", is_abnormal: true }
    ],
    notes: "Critical value panic threshold: Severe proteinuria noted. Pathologist notified directly."
  },
  {
    result_id: "RES-40209",
    accession_no: "ACC-10049",
    patient_id: "P-1019",
    patient_name: "Evelyn Sterling",
    age: 72,
    gender: 'F',
    mrn: "MRN-44910",
    tests_ordered: ["CBC"],
    organisation: "Referral Clinic Center",
    referral_doctor: "Dr. Allison Cameron",
    order_date: "14/06/2026 09:15",
    category: "TAT Exceeded",
    status: 'TAT Exceeded',
    parameters: [
      { parameter_id: "P15", parameter_name: "Hemoglobin", observed_value: "11.2", unit: "g/dL", min_value: 12.0, max_value: 16.0, reference_range: "12.0 - 16.0", is_abnormal: true }
    ],
    tat_exceeded_hours: 14,
    notes: "TAT Breach Warning: Specimen clotted initially, delay in physical floor redraw."
  },
  {
    result_id: "RES-40210",
    accession_no: "ACC-10050",
    patient_id: "P-1020",
    patient_name: "Xavier Dupont",
    age: 55,
    gender: 'M',
    mrn: "MRN-22312",
    tests_ordered: ["TSH"],
    organisation: "Corporate Partner Hospital",
    referral_doctor: "Dr. House",
    order_date: "15/06/2026 08:30",
    category: "Outsourced",
    status: 'Outsourced',
    parameters: [
      { parameter_id: "P16", parameter_name: "Ultra-Sensitive TSH", observed_value: "4.2", unit: "uIU/mL", min_value: 0.4, max_value: 4.0, reference_range: "0.40 - 4.00", is_abnormal: true }
    ],
    outsource_center: "Mayo Clinic Specialty Reference"
  },
  {
    result_id: "RES-40211",
    accession_no: "ACC-10051",
    patient_id: "P-1021",
    patient_name: "Jonathan Harker",
    age: 39,
    gender: 'M',
    mrn: "MRN-00666",
    tests_ordered: ["CBC"],
    organisation: "Transylvania Ward",
    referral_doctor: "Dr. Van Helsing",
    order_date: "16/06/2026 01:20",
    category: "Cancelled Reports",
    status: 'Cancelled',
    parameters: [
      { parameter_id: "P17", parameter_name: "Hemoglobin", observed_value: "0.0", unit: "g/dL", min_value: 13.0, max_value: 17.5, reference_range: "13.0 - 17.5", is_abnormal: true }
    ],
    notes: "ORDER CANCELLED: Hemolyzed specimen rejected by tech thrice. No redraw possible."
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [labProfile, setLabProfile] = useState<LabProfile>(initialLabProfile);
  const [testCatalog, setTestCatalog] = useState<TestCatalog[]>(initialTestCatalog);
  const [b2bPartners, setB2BPartners] = useState<B2B_Partner[]>(initialB2BPartners);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [encounters, setEncounters] = useState<Encounter[]>(initialEncounters);
  const [billSettlements, setBillSettlements] = useState<BillSettlement[]>(initialBillSettlements);
  const [reportPrints, setReportPrints] = useState<ReportPrintTracking[]>(initialReportPrints);
  const [testConfigs, setTestConfigs] = useState<TestConfig[]>(initialTestConfigs);
  const [billSettings, setBillSettings] = useState<BillSettings>(initialBillSettings);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(initialInvoiceSettings);
  const [financialDashboard, setFinancialDashboard] = useState<FinancialDashboard>(initialFinancialDashboard);
  const [priceLists, setPriceLists] = useState<PriceList[]>(initialPriceLists);
  const [centerDetails, setCenterDetails] = useState<CenterDetails>(initialCenterDetails);
  const [centerResources, setCenterResources] = useState<CenterResources>(initialCenterResources);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(initialSystemUsers);
  const [systemIntegrations, setSystemIntegrations] = useState<SystemIntegrations>(initialSystemIntegrations);
  
  const [samples, setSamples] = useState<Sample[]>(initialSamples);
  const [testResults, setTestResults] = useState<TestResult[]>(initialTestResults);
  const [resultParameters, setResultParameters] = useState<ResultParameter[]>(initialResultParameters);
  const [patientCases, setPatientCases] = useState<ClinicalPatientCase[]>(initialPatientCases);

  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [referringDoctors, setReferringDoctors] = useState<ReferringDoctor[]>(initialReferringDoctors);
  const [satelliteCenters, setSatelliteCenters] = useState<SatelliteCenter[]>(initialSatelliteCenters);
  const [sampleVialSettings, setSampleVialSettings] = useState<SampleSetting[]>(initialSampleVialSettings);
  const [archivedPatientIds, setArchivedPatientIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dlabs_archived_patients');
    return saved ? JSON.parse(saved) : [];
  });

  const [isLoading, setIsLoading] = useState(true);
  const [activeSubView, setActiveSubView] = useState<string>('registration-billing');

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'te' | 'hi'>(() => {
    const saved = localStorage.getItem('dlabs_language');
    return (saved as 'en' | 'te' | 'hi') || 'en';
  });

  const setLanguage = (lang: 'en' | 'te' | 'hi') => {
    setCurrentLanguage(lang);
    localStorage.setItem('dlabs_language', lang);
  };

  // 1. Initial Load & Seed logic from Supabase
  useEffect(() => {
    async function initSupabase() {
      try {
        // Fetch test catalog first to check if database has been initialized/seeded
        const { data: testCatData, error: catError } = await supabase.from('test_catalog').select('*');
        if (catError) throw catError;

        // Auto-seed the 4 new tables if they are empty
        try {
          const { data: apptsData } = await supabase.from('appointments').select('appt_id').limit(1);
          if (!apptsData || apptsData.length === 0) {
            await supabase.from('appointments').insert(initialAppointments.map(a => ({
              appt_id: a.appt_id,
              patient_name: a.patient_name,
              age: a.age,
              gender: a.gender,
              test_code: a.test_code,
              appt_time: new Date(a.appt_time).toISOString(),
              phone: a.phone,
              status: a.status
            })));
          }
        } catch (e) {
          console.error("Failed to seed appointments table:", e);
        }

        try {
          const { data: docsData } = await supabase.from('referring_doctors').select('id').limit(1);
          if (!docsData || docsData.length === 0) {
            await supabase.from('referring_doctors').insert(initialReferringDoctors);
          }
        } catch (e) {
          console.error("Failed to seed referring_doctors table:", e);
        }

        try {
          const { data: centersData } = await supabase.from('satellite_centers').select('center_id').limit(1);
          if (!centersData || centersData.length === 0) {
            await supabase.from('satellite_centers').insert(initialSatelliteCenters);
          }
        } catch (e) {
          console.error("Failed to seed satellite_centers table:", e);
        }

        try {
          const { data: vialsData } = await supabase.from('sample_vial_settings').select('sr_no').limit(1);
          if (!vialsData || vialsData.length === 0) {
            await supabase.from('sample_vial_settings').insert(initialSampleVialSettings.map(v => ({
              sample_name: v.sample_name,
              sample_type: v.sample_type,
              container_type: v.container_type
            })));
          }
        } catch (e) {
          console.error("Failed to seed sample_vial_settings table:", e);
        }

        let finalTestCatalog = testCatData;

        // If the table is empty, run programmatic seed using mock data
        if (!testCatData || testCatData.length === 0) {
          console.log("Supabase database is empty. Auto-seeding initial LIMS setup...");

          await Promise.all([
            supabase.from('lab_profiles').insert([initialLabProfile]),
            supabase.from('test_catalog').insert(initialTestCatalog),
            supabase.from('b2b_partners').insert(initialB2BPartners),
            supabase.from('price_lists').insert(initialPriceLists),
            supabase.from('center_details').insert([initialCenterDetails]),
            supabase.from('bill_settings').insert([initialBillSettings]),
            supabase.from('invoice_settings').insert([initialInvoiceSettings]),
            supabase.from('financial_dashboard').insert([initialFinancialDashboard]),
            supabase.from('system_users').insert(initialSystemUsers),
            supabase.from('system_integrations').insert([initialSystemIntegrations])
          ]);

          await supabase.from('center_resources').insert([initialCenterResources]);
          await supabase.from('test_configs').insert(initialTestConfigs);

          const patientInserts = initialPatients.map(p => ({
            patient_id: p.patient_id,
            patient_type: p.patient_type,
            mrn: p.mrn,
            national_id: p.national_id,
            designation: p.designation,
            patient_name: p.patient_name,
            gender: p.gender,
            date_of_birth: p.date_of_birth,
            age: p.age,
            contact_number: p.contact_number,
            phone_belongs_to: p.phone_belongs_to,
            email: p.email,
            organisation: p.organisation,
            referral: p.referral,
            sample_collected_from: p.logistics.sample_collected_from,
            mode_of_transport: p.logistics.mode_of_transport
          }));
          await supabase.from('patients').insert(patientInserts);

          const addressInserts = initialPatients.map(p => ({
            patient_id: p.patient_id,
            address: p.address_details.address,
            city: p.address_details.city,
            district: p.address_details.district,
            pincode: p.address_details.pincode,
            location_area: p.address_details.location_area,
            state: p.address_details.state,
            country: p.address_details.country,
            ward_number: p.address_details.ward_number
          }));
          await supabase.from('patient_addresses').insert(addressInserts);

          const medicalInserts = initialPatients.map(p => ({
            patient_id: p.patient_id,
            covid_vaccine_received: p.medical_history.covid_vaccine_received,
            arogya_setu_app: p.medical_history.arogya_setu_app,
            is_hospitalized: p.medical_history.is_hospitalized,
            type_of_vaccine: p.medical_history.type_of_vaccine,
            patient_category: p.medical_history.patient_category,
            patient_occupation: p.medical_history.patient_occupation,
            vaccination_date: p.medical_history.vaccination_date || null,
            date_of_dose_2: p.medical_history.date_of_dose_2 || null,
            vaccination_status: p.medical_history.vaccination_status,
            body_temperature: p.medical_history.body_temperature,
            symptom_progress: p.medical_history.symptom_progress,
            cowin_beneficiary: p.medical_history.cowin_beneficiary,
            country_state_travelled: p.medical_history.country_state_travelled,
            isolation_location: p.medical_history.isolation_location,
            passenger_locator_id: p.medical_history.passenger_locator_id,
            travel_history: p.medical_history.travel_history,
            symptoms: p.medical_history.symptoms,
            medical_conditions: p.medical_history.medical_conditions
          }));
          await supabase.from('patient_medical_histories').insert(medicalInserts);

          const encounterInserts = initialEncounters.map(e => ({
            encounter_id: e.encounter_id,
            accession_no: e.accession_no,
            patient_id: e.patient_id,
            partner_id: e.partner_id,
            total_amount: e.total_amount,
            status: e.status,
            created_at: new Date().toISOString()
          }));
          await supabase.from('encounters').insert(encounterInserts);

          const encounterTestInserts: any[] = [];
          initialEncounters.forEach(e => {
            e.tests_ordered.forEach(tCode => {
              encounterTestInserts.push({ encounter_id: e.encounter_id, test_code: tCode });
            });
          });
          await supabase.from('encounter_tests').insert(encounterTestInserts);

          const billInserts = initialBillSettlements.map(b => {
            const matchedEnc = initialEncounters.find(e => e.patient_id === b.patient_details.patient_id);
            return {
              bill_id: b.bill_id,
              encounter_id: matchedEnc ? matchedEnc.encounter_id : null,
              patient_id: b.patient_details.patient_id,
              referral: b.referral,
              bill_source: b.bill_source,
              organisation: b.organisation,
              bill_amount: b.bill_amount,
              due_amount: b.due_amount,
              status: b.status,
              bill_date: new Date().toISOString()
            };
          });
          await supabase.from('bill_settlements').insert(billInserts);

          const reportInserts = initialReportPrints.map(r => {
            const matchedEnc = initialEncounters.find(e => e.patient_id === (initialPatients.find(p => p.patient_name === r.patient_name)?.patient_id || ''));
            return {
              report_id: r.report_id,
              encounter_id: matchedEnc ? matchedEnc.encounter_id : null,
              patient_name: r.patient_name,
              org_name: r.org_name,
              referral: r.referral,
              tests: r.tests,
              print_status: r.print_status,
              bill_date: new Date().toISOString()
            };
          });
          await supabase.from('report_print_tracking').insert(reportInserts);

          const sampleInserts = initialSamples.map(s => ({
            sample_id: s.sample_id,
            accession_no: s.accession_no,
            barcode_number: s.barcode_number,
            sample_type: s.sample_type,
            status: s.status,
            rejection_reason: s.rejection_reason || null,
            collected_at: s.collected_at ? new Date().toISOString() : null
          }));
          await supabase.from('samples').insert(sampleInserts);

          const sampleRequiredTestInserts: any[] = [];
          initialSamples.forEach(s => {
            s.required_test_codes.forEach(tCode => {
              sampleRequiredTestInserts.push({ sample_id: s.sample_id, test_code: tCode });
            });
          });
          await supabase.from('sample_required_tests').insert(sampleRequiredTestInserts);

          const resultInserts = initialTestResults.map(r => ({
            result_id: r.result_id,
            accession_no: r.accession_no,
            status: r.status,
            updated_at: new Date().toISOString()
          }));
          await supabase.from('test_results').insert(resultInserts);

          const paramInserts = initialResultParameters.map(p => ({
            parameter_id: p.parameter_id,
            result_id: p.result_id,
            parameter_name: p.parameter_name,
            observed_value: p.observed_value,
            is_abnormal: p.is_abnormal,
            reference_range: p.reference_range,
            unit: p.unit,
            min_value: p.min_value,
            max_value: p.max_value
          }));
          await supabase.from('result_parameters').insert(paramInserts);

          const caseInserts = initialPatientCases.map(c => ({
            result_id: c.result_id,
            category: c.category,
            notes: c.notes || null,
            tat_exceeded_hours: c.tat_exceeded_hours || null,
            outsource_center: c.outsource_center || null
          }));
          await supabase.from('clinical_patient_cases').insert(caseInserts);

          const { data: reloadedCat } = await supabase.from('test_catalog').select('*');
          finalTestCatalog = reloadedCat || initialTestCatalog;
        }

        // Fetch all tables to construct frontend client states
        const [
          profilesRes,
          partnersRes,
          patientsRes,
          encountersRes,
          billsRes,
          reportsRes,
          configsRes,
          billSettingsRes,
          invoiceSettingsRes,
          financialRes,
          priceListsRes,
          centerDetailsRes,
          centerResourcesRes,
          usersRes,
          integrationsRes,
          samplesRes,
          resultsRes,
          paramsRes,
          casesRes,
          appointmentsRes,
          referringDoctorsRes,
          satelliteCentersRes,
          sampleVialSettingsRes
        ] = await Promise.all([
          supabase.from('lab_profiles').select('*').single(),
          supabase.from('b2b_partners').select('*'),
          supabase.from('patients').select('*, patient_addresses(*), patient_medical_histories(*)'),
          supabase.from('encounters').select('*, encounter_tests(test_code)'),
          supabase.from('bill_settlements').select('*'),
          supabase.from('report_print_tracking').select('*'),
          supabase.from('test_configs').select('*'),
          supabase.from('bill_settings').select('*').single(),
          supabase.from('invoice_settings').select('*').single(),
          supabase.from('financial_dashboard').select('*').single(),
          supabase.from('price_lists').select('*'),
          supabase.from('center_details').select('*').single(),
          supabase.from('center_resources').select('*').single(),
          supabase.from('system_users').select('*'),
          supabase.from('system_integrations').select('*').single(),
          supabase.from('samples').select('*, sample_required_tests(test_code)'),
          supabase.from('test_results').select('*'),
          supabase.from('result_parameters').select('*'),
          supabase.from('clinical_patient_cases').select('*'),
          supabase.from('appointments').select('*'),
          supabase.from('referring_doctors').select('*'),
          supabase.from('satellite_centers').select('*'),
          supabase.from('sample_vial_settings').select('*')
        ]);

        if (profilesRes.data) setLabProfile(profilesRes.data);
        if (finalTestCatalog) setTestCatalog(finalTestCatalog);
        if (partnersRes.data) setB2BPartners(partnersRes.data);

        if (appointmentsRes.data) {
          setAppointments(appointmentsRes.data.map((a: any) => ({
            appt_id: a.appt_id,
            patient_name: a.patient_name,
            age: Number(a.age),
            gender: a.gender,
            test_code: a.test_code,
            appt_time: a.appt_time,
            phone: a.phone,
            status: a.status
          })));
        }
        if (referringDoctorsRes.data) {
          setReferringDoctors(referringDoctorsRes.data.map((d: any) => ({
            id: d.id,
            name: d.name,
            speciality: d.speciality,
            clinic: d.clinic,
            contact: d.contact,
            commission: Number(d.commission)
          })));
        }
        if (satelliteCentersRes.data) {
          setSatelliteCenters(satelliteCentersRes.data.map((c: any) => ({
            center_id: c.center_id,
            name: c.name,
            location: c.location,
            head: c.head,
            status: c.status
          })));
        }
        if (sampleVialSettingsRes.data) {
          setSampleVialSettings(sampleVialSettingsRes.data.map((v: any) => ({
            sr_no: Number(v.sr_no),
            sample_name: v.sample_name,
            sample_type: v.sample_type,
            container_type: v.container_type
          })));
        }

        if (patientsRes.data) {
          const mappedPatients: Patient[] = patientsRes.data.map((p: any) => {
            const addr = p.patient_addresses;
            const hist = p.patient_medical_histories;
            return {
              patient_id: p.patient_id,
              patient_type: p.patient_type,
              mrn: p.mrn,
              national_id: p.national_id,
              designation: p.designation,
              patient_name: p.patient_name,
              gender: p.gender,
              date_of_birth: p.date_of_birth,
              age: p.age,
              contact_number: p.contact_number,
              phone_belongs_to: p.phone_belongs_to,
              email: p.email,
              organisation: p.organisation,
              referral: p.referral,
              address_details: addr ? {
                address: addr.address,
                city: addr.city,
                district: addr.district,
                pincode: addr.pincode,
                location_area: addr.location_area,
                state: addr.state,
                country: addr.country,
                ward_number: addr.ward_number
              } : { address: '', city: '', district: '', pincode: '', location_area: '', state: '', country: '', ward_number: '' },
              medical_history: hist ? {
                covid_vaccine_received: hist.covid_vaccine_received,
                arogya_setu_app: hist.arogya_setu_app,
                is_hospitalized: hist.is_hospitalized,
                type_of_vaccine: hist.type_of_vaccine || '',
                patient_category: hist.patient_category || '',
                patient_occupation: hist.patient_occupation || '',
                vaccination_date: hist.vaccination_date || '',
                date_of_dose_2: hist.date_of_dose_2 || '',
                vaccination_status: hist.vaccination_status || 'Unvaccinated',
                body_temperature: hist.body_temperature || 'Normal',
                symptom_progress: hist.symptom_progress || 'None',
                cowin_beneficiary: hist.cowin_beneficiary || '',
                country_state_travelled: hist.country_state_travelled || '',
                isolation_location: hist.isolation_location || '',
                passenger_locator_id: hist.passenger_locator_id || '',
                travel_history: hist.travel_history || [],
                symptoms: hist.symptoms || [],
                medical_conditions: hist.medical_conditions || []
              } : {
                covid_vaccine_received: false, arogya_setu_app: false, is_hospitalized: false, type_of_vaccine: '',
                patient_category: '', patient_occupation: '', vaccination_date: '', date_of_dose_2: '',
                vaccination_status: 'Unvaccinated', body_temperature: 'Normal', symptom_progress: 'None',
                cowin_beneficiary: '', country_state_travelled: '', isolation_location: '', passenger_locator_id: '',
                travel_history: [], symptoms: [], medical_conditions: []
              },
              logistics: {
                sample_collected_from: p.sample_collected_from || 'Lab Center',
                mode_of_transport: p.mode_of_transport || 'Self-delivered'
              }
            };
          });
          setPatients(mappedPatients);
        }

        if (encountersRes.data) {
          const mappedEncounters: Encounter[] = encountersRes.data.map((e: any) => ({
            encounter_id: e.encounter_id,
            accession_no: e.accession_no,
            patient_id: e.patient_id,
            partner_id: e.partner_id,
            total_amount: Number(e.total_amount),
            status: e.status,
            tests_ordered: e.encounter_tests ? e.encounter_tests.map((t: any) => t.test_code) : [],
            created_at: e.created_at ? new Date(e.created_at).toLocaleDateString('en-GB') + ' ' + new Date(e.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''
          }));
          setEncounters(mappedEncounters);
        }

        if (billsRes.data) {
          const mappedBills: BillSettlement[] = billsRes.data.map((b: any) => {
            const pt = patientsRes.data?.find((p: any) => p.patient_id === b.patient_id);
            return {
              bill_id: b.bill_id,
              bill_date: b.bill_date ? new Date(b.bill_date).toLocaleDateString('en-GB') + ' ' + new Date(b.bill_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
              patient_details: {
                name: pt ? pt.patient_name : 'Patient',
                gender: pt ? pt.gender : 'Male',
                age: pt ? pt.age : 30,
                patient_id: b.patient_id
              },
              referral: b.referral || 'Self',
              bill_source: b.bill_source || 'Front Desk',
              organisation: b.organisation || 'Direct Walk-In',
              bill_amount: Number(b.bill_amount),
              due_amount: Number(b.due_amount),
              status: b.status
            };
          });
          setBillSettlements(mappedBills);
        }

        if (reportsRes.data) {
          const mappedReports: ReportPrintTracking[] = reportsRes.data.map((r: any) => ({
            report_id: r.report_id,
            patient_name: r.patient_name,
            org_name: r.org_name || '',
            referral: r.referral || '',
            tests: r.tests || [],
            report_date: r.report_date ? new Date(r.report_date).toLocaleDateString('en-GB') + ' ' + new Date(r.report_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
            bill_date: r.bill_date ? new Date(r.bill_date).toLocaleDateString('en-GB') + ' ' + new Date(r.bill_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
            print_status: r.print_status
          }));
          setReportPrints(mappedReports);
        }

        if (configsRes.data) setTestConfigs(configsRes.data);
        if (billSettingsRes.data) setBillSettings(billSettingsRes.data);
        if (invoiceSettingsRes.data) setInvoiceSettings(invoiceSettingsRes.data);
        if (financialRes.data) setFinancialDashboard(financialRes.data);
        if (priceListsRes.data) setPriceLists(priceListsRes.data);
        if (centerDetailsRes.data) setCenterDetails(centerDetailsRes.data);
        if (centerResourcesRes.data) setCenterResources(centerResourcesRes.data);
        if (usersRes.data) setSystemUsers(usersRes.data);
        if (integrationsRes.data) setSystemIntegrations(integrationsRes.data);

        if (samplesRes.data) {
          const mappedSamples: Sample[] = samplesRes.data.map((s: any) => ({
            sample_id: s.sample_id,
            accession_no: s.accession_no,
            barcode_number: s.barcode_number,
            sample_type: s.sample_type,
            status: s.status,
            rejection_reason: s.rejection_reason || undefined,
            collected_at: s.collected_at ? new Date(s.collected_at).toLocaleDateString('en-GB') + ' ' + new Date(s.collected_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : undefined,
            required_test_codes: s.sample_required_tests ? s.sample_required_tests.map((t: any) => t.test_code) : []
          }));
          setSamples(mappedSamples);
        }

        if (resultsRes.data) setTestResults(resultsRes.data);
        if (paramsRes.data) setResultParameters(paramsRes.data);

        if (casesRes.data) {
          const mappedCases: ClinicalPatientCase[] = casesRes.data.map((c: any) => {
            const matchedRes = resultsRes.data?.find((r: any) => r.result_id === c.result_id);
            const matchedEnc = encountersRes.data?.find((e: any) => e.accession_no === matchedRes?.accession_no);
            const matchedPat = patientsRes.data?.find((p: any) => p.patient_id === matchedEnc?.patient_id);
            const matchedParams = paramsRes.data?.filter((p: any) => p.result_id === c.result_id) || [];

            return {
              result_id: c.result_id,
              accession_no: matchedRes ? matchedRes.accession_no : '',
              patient_id: matchedPat ? matchedPat.patient_id : '',
              patient_name: matchedPat ? matchedPat.patient_name : 'Unknown',
              age: matchedPat ? matchedPat.age : 30,
              gender: matchedPat && (matchedPat.gender === 'Female' || matchedPat.gender === 'F') ? 'F' : 'M',
              mrn: matchedPat ? matchedPat.mrn : '',
              tests_ordered: matchedEnc && matchedEnc.encounter_tests ? matchedEnc.encounter_tests.map((t: any) => t.test_code) : [],
              organisation: matchedPat ? matchedPat.organisation || 'Direct Walk-In' : 'Direct Walk-In',
              referral_doctor: matchedPat ? matchedPat.referral || 'Self' : 'Self',
              order_date: matchedEnc ? new Date(matchedEnc.created_at).toLocaleDateString('en-GB') + ' ' + new Date(matchedEnc.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
              category: c.category,
              status: matchedRes ? matchedRes.status : 'Incomplete',
              parameters: matchedParams.map((p: any) => ({
                parameter_id: p.parameter_id,
                parameter_name: p.parameter_name,
                observed_value: p.observed_value || '',
                unit: p.unit || '',
                min_value: Number(p.min_value),
                max_value: Number(p.max_value),
                reference_range: p.reference_range,
                is_abnormal: p.is_abnormal
              })),
              notes: c.notes,
              tat_exceeded_hours: c.tat_exceeded_hours,
              outsource_center: c.outsource_center
            };
          });
          setPatientCases(mappedCases);
        }
      } catch (err) {
        console.error("Failed to initialize LIMS database:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initSupabase();
  }, []);

  const updateLabProfile = async (profile: LabProfile) => {
    setLabProfile(profile);
    await supabase.from('lab_profiles').update({
      name: profile.name,
      address: profile.address,
      email: profile.email,
      phone: profile.phone
    }).eq('id', 1);
  };

  const addTest = async (test: TestCatalog) => {
    setTestCatalog(prev => {
      if (prev.some(t => t.test_code.toUpperCase() === test.test_code.toUpperCase())) {
        return prev;
      }
      return [...prev, test];
    });
    
    const newConfig: TestConfig = {
      testName: test.test_name,
      testCode: test.test_code,
      sampleType: test.sample_type,
      department: test.department || "General",
      outsourceCenter: test.outsource_center,
      verificationStatus: "Verified",
      price: test.retail_price,
      isOutsourced: test.outsource_status === "Outsourced",
      autoApproval: true
    };
    setTestConfigs(prev => [...prev, newConfig]);

    await supabase.from('test_catalog').insert([test]);
    await supabase.from('test_configs').insert([{
      test_code: test.test_code,
      verification_status: 'Verified',
      auto_approval: true
    }]);
  };

  const addPartner = async (partner: B2B_Partner) => {
    setB2BPartners(prev => {
      if (prev.some(p => p.partner_id === partner.partner_id)) return prev;
      return [...prev, partner];
    });
    await supabase.from('b2b_partners').insert([partner]);
  };

  const addPatient = async (patient: Patient) => {
    setPatients(prev => {
      if (prev.some(p => p.patient_id === patient.patient_id)) {
        return prev;
      }
      return [...prev, patient];
    });

    await supabase.from('patients').insert([{
      patient_id: patient.patient_id,
      patient_type: patient.patient_type,
      mrn: patient.mrn,
      national_id: patient.national_id,
      designation: patient.designation,
      patient_name: patient.patient_name,
      gender: patient.gender,
      date_of_birth: patient.date_of_birth,
      age: patient.age,
      contact_number: patient.contact_number,
      phone_belongs_to: patient.phone_belongs_to,
      email: patient.email,
      organisation: patient.organisation,
      referral: patient.referral,
      sample_collected_from: patient.logistics.sample_collected_from,
      mode_of_transport: patient.logistics.mode_of_transport
    }]);

    await supabase.from('patient_addresses').insert([{
      patient_id: patient.patient_id,
      address: patient.address_details.address,
      city: patient.address_details.city,
      district: patient.address_details.district,
      pincode: patient.address_details.pincode,
      location_area: patient.address_details.location_area,
      state: patient.address_details.state,
      country: patient.address_details.country,
      ward_number: patient.address_details.ward_number
    }]);

    await supabase.from('patient_medical_histories').insert([{
      patient_id: patient.patient_id,
      covid_vaccine_received: patient.medical_history.covid_vaccine_received,
      arogya_setu_app: patient.medical_history.arogya_setu_app,
      is_hospitalized: patient.medical_history.is_hospitalized,
      type_of_vaccine: patient.medical_history.type_of_vaccine,
      patient_category: patient.medical_history.patient_category,
      patient_occupation: patient.medical_history.patient_occupation,
      vaccination_date: patient.medical_history.vaccination_date || null,
      date_of_dose_2: patient.medical_history.date_of_dose_2 || null,
      vaccination_status: patient.medical_history.vaccination_status,
      body_temperature: patient.medical_history.body_temperature,
      symptom_progress: patient.medical_history.symptom_progress,
      cowin_beneficiary: patient.medical_history.cowin_beneficiary,
      country_state_travelled: patient.medical_history.country_state_travelled,
      isolation_location: patient.medical_history.isolation_location,
      passenger_locator_id: patient.medical_history.passenger_locator_id,
      travel_history: patient.medical_history.travel_history,
      symptoms: patient.medical_history.symptoms,
      medical_conditions: patient.medical_history.medical_conditions
    }]);
  };

  const updatePatient = async (updated: Patient) => {
    setPatients(prev => prev.map(p => p.patient_id === updated.patient_id ? updated : p));

    await supabase.from('patients').update({
      patient_type: updated.patient_type,
      mrn: updated.mrn,
      national_id: updated.national_id,
      designation: updated.designation,
      patient_name: updated.patient_name,
      gender: updated.gender,
      date_of_birth: updated.date_of_birth,
      age: updated.age,
      contact_number: updated.contact_number,
      phone_belongs_to: updated.phone_belongs_to,
      email: updated.email,
      organisation: updated.organisation,
      referral: updated.referral,
      sample_collected_from: updated.logistics.sample_collected_from,
      mode_of_transport: updated.logistics.mode_of_transport
    }).eq('patient_id', updated.patient_id);

    await supabase.from('patient_addresses').update({
      address: updated.address_details.address,
      city: updated.address_details.city,
      district: updated.address_details.district,
      pincode: updated.address_details.pincode,
      location_area: updated.address_details.location_area,
      state: updated.address_details.state,
      country: updated.address_details.country,
      ward_number: updated.address_details.ward_number
    }).eq('patient_id', updated.patient_id);

    await supabase.from('patient_medical_histories').update({
      covid_vaccine_received: updated.medical_history.covid_vaccine_received,
      arogya_setu_app: updated.medical_history.arogya_setu_app,
      is_hospitalized: updated.medical_history.is_hospitalized,
      type_of_vaccine: updated.medical_history.type_of_vaccine,
      patient_category: updated.medical_history.patient_category,
      patient_occupation: updated.medical_history.patient_occupation,
      vaccination_date: updated.medical_history.vaccination_date || null,
      date_of_dose_2: updated.medical_history.date_of_dose_2 || null,
      vaccination_status: updated.medical_history.vaccination_status,
      body_temperature: updated.medical_history.body_temperature,
      symptom_progress: updated.medical_history.symptom_progress,
      cowin_beneficiary: updated.medical_history.cowin_beneficiary,
      country_state_travelled: updated.medical_history.country_state_travelled,
      isolation_location: updated.medical_history.isolation_location,
      passenger_locator_id: updated.medical_history.passenger_locator_id,
      travel_history: updated.medical_history.travel_history,
      symptoms: updated.medical_history.symptoms,
      medical_conditions: updated.medical_history.medical_conditions
    }).eq('patient_id', updated.patient_id);
  };

  const createEncounter = (
    patientId: string,
    partnerId: string | null,
    tests: string[],
    totalAmount: number,
    referral: string = "Self",
    organisation: string = "Direct Walk-In",
    customLogistics?: any,
    customMedHistory?: any
  ): Encounter => {
    const nextAccNumber = 10020 + encounters.length + 3;
    const accessionNo = `ACC-${nextAccNumber}`;
    const encounterId = `ENC-${20000 + encounters.length + 4}`;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const newEncounter: Encounter = {
      encounter_id: encounterId,
      accession_no: accessionNo,
      patient_id: patientId,
      partner_id: partnerId,
      total_amount: totalAmount,
      status: 'Pending Accession',
      tests_ordered: tests,
      created_at: formattedDate
    };

    setEncounters(prev => [newEncounter, ...prev]);

    const patientObj = patients.find(p => p.patient_id === patientId);
    const billingId = `BIL-${99200 + encounters.length + 5}`;
    const newBill: BillSettlement = {
      bill_id: billingId,
      bill_date: formattedDate,
      patient_details: {
        name: patientObj ? patientObj.patient_name : "Patient",
        gender: patientObj ? patientObj.gender : "Male",
        age: patientObj ? patientObj.age : 30,
        patient_id: patientId
      },
      referral: referral,
      bill_source: "Front Desk Registration",
      organisation: organisation,
      bill_amount: totalAmount,
      due_amount: 0,
      status: "Paid"
    };

    setBillSettlements(prev => [newBill, ...prev]);

    const reportId = `RPT-${55200 + encounters.length + 5}`;
    const newReport: ReportPrintTracking = {
      report_id: reportId,
      patient_name: patientObj ? patientObj.patient_name : "Patient",
      org_name: organisation,
      referral: referral,
      tests: tests,
      report_date: "",
      bill_date: formattedDate,
      print_status: false
    };

    setReportPrints(prev => [newReport, ...prev]);

    setFinancialDashboard(prev => {
      const updatedFin = {
        ...prev,
        totalRevenue: prev.totalRevenue + totalAmount,
        amountPaid: prev.amountPaid + totalAmount,
        cashCollection: prev.cashCollection + totalAmount
      };
      supabase.from('financial_dashboard').update({
        total_revenue: updatedFin.totalRevenue,
        amount_paid: updatedFin.amountPaid,
        cash_collection: updatedFin.cashCollection
      }).eq('id', 1).then();
      return updatedFin;
    });

    const getCleanSampleType = (tSample: string): 'Serum' | 'EDTA' | 'Urine' | 'Blood' | 'Plasma' | 'Swab' => {
      const s = (tSample || '').toLowerCase();
      if (s.includes('blood') || s.includes('edta')) return 'EDTA';
      if (s.includes('serum') || s.includes('sst')) return 'Serum';
      if (s.includes('urine')) return 'Urine';
      if (s.includes('plasma')) return 'Plasma';
      if (s.includes('swab')) return 'Swab';
      return 'Blood';
    };

    const sampleTypeToTestsMap: Record<string, string[]> = {};
    tests.forEach(testCode => {
      const catalogItem = testCatalog.find(tc => tc.test_code.toUpperCase() === testCode.toUpperCase());
      const rawSampleType = catalogItem ? catalogItem.sample_type : 'Blood';
      const cleanType = getCleanSampleType(rawSampleType);
      if (!sampleTypeToTestsMap[cleanType]) {
        sampleTypeToTestsMap[cleanType] = [];
      }
      sampleTypeToTestsMap[cleanType].push(testCode);
    });

    const createdSamples: Sample[] = Object.entries(sampleTypeToTestsMap).map(([smpType, testCodes], idx) => {
      const cleanType = smpType as 'Serum' | 'EDTA' | 'Urine' | 'Blood' | 'Plasma' | 'Swab';
      return {
        sample_id: `SMP-${30100 + samples.length + idx + 1}`,
        accession_no: accessionNo,
        barcode_number: null,
        sample_type: cleanType,
        status: 'Pending Collection',
        required_test_codes: testCodes
      };
    });
    setSamples(prev => [...createdSamples, ...prev]);

    const resultId = `RES-${40100 + testResults.length + 1}`;
    const newTestResult: TestResult = {
      result_id: resultId,
      accession_no: accessionNo,
      status: 'Incomplete'
    };
    setTestResults(prev => [...prev, newTestResult]);

    const newParameters: ResultParameter[] = [];
    tests.forEach((testCode) => {
      let paramsList: Array<{name: string, ref: string, min: number, max: number, unit: string}> = [];
      const codeUpper = testCode.toUpperCase();
      if (codeUpper === 'CBC') {
        paramsList = [
          { name: 'Hemoglobin', ref: '13.0 - 17.0', min: 13.0, max: 17.0, unit: 'g/dL' },
          { name: 'WBC Count', ref: '4000 - 11000', min: 4000, max: 11000, unit: '/cumm' },
          { name: 'Platelet Count', ref: '1.5 - 4.5', min: 1.5, max: 4.5, unit: 'Lakhs/cumm' }
        ];
      } else if (codeUpper === 'HBA1C') {
        paramsList = [
          { name: 'HbA1c (Glycated Haemoglobin)', ref: '4.0 - 5.6', min: 4.0, max: 5.6, unit: '%' },
          { name: 'Average Blood Glucose', ref: '70 - 110', min: 70, max: 110, unit: 'mg/dL' }
        ];
      } else if (codeUpper === 'TSH') {
        paramsList = [
          { name: 'TSH (Thyroid Stimulating Hormone)', ref: '0.45 - 4.50', min: 0.45, max: 4.5, unit: 'uIU/mL' }
        ];
      } else if (codeUpper === 'LIPID') {
        paramsList = [
          { name: 'Total Cholesterol', ref: '125 - 200', min: 125, max: 200, unit: 'mg/dL' },
          { name: 'HDL Cholesterol', ref: '40 - 60', min: 40, max: 60, unit: 'mg/dL' },
          { name: 'LDL Cholesterol', ref: '50 - 100', min: 50, max: 100, unit: 'mg/dL' },
          { name: 'Triglycerides', ref: '50 - 150', min: 50, max: 150, unit: 'mg/dL' }
        ];
      } else if (codeUpper === 'LFT') {
        paramsList = [
          { name: 'Bilirubin Total', ref: '0.2 - 1.2', min: 0.2, max: 1.2, unit: 'mg/dL' },
          { name: 'SGOT (AST)', ref: '5 - 40', min: 5, max: 40, unit: 'U/L' },
          { name: 'SGPT (ALT)', ref: '5 - 40', min: 5, max: 40, unit: 'U/L' }
        ];
      } else if (codeUpper === 'KFT') {
        paramsList = [
          { name: 'Blood Urea', ref: '15 - 45', min: 15, max: 45, unit: 'mg/dL' },
          { name: 'Serum Creatinine', ref: '0.6 - 1.2', min: 0.6, max: 1.2, unit: 'mg/dL' }
        ];
      } else if (codeUpper === 'URINE') {
        paramsList = [
          { name: 'Urine pH', ref: '5.0 - 8.0', min: 5.0, max: 8.0, unit: 'pH' },
          { name: 'Urine Specific Gravity', ref: '1.005 - 1.030', min: 1.005, max: 1.030, unit: 'SG' }
        ];
      } else {
        paramsList = [
          { name: `${testCode} Observation`, ref: '1.0 - 10.0', min: 1.0, max: 10.0, unit: 'units' }
        ];
      }

      paramsList.forEach((p, pIdx) => {
        newParameters.push({
          parameter_id: `PAR-${50100 + resultParameters.length + newParameters.length + pIdx + 1}`,
          result_id: resultId,
          parameter_name: p.name,
          observed_value: "",
          is_abnormal: false,
          reference_range: p.ref,
          unit: p.unit,
          min_value: p.min,
          max_value: p.max
        });
      });
    });

    setResultParameters(prev => [...prev, ...newParameters]);

    const newCase: ClinicalPatientCase = {
      result_id: resultId,
      accession_no: accessionNo,
      patient_id: patientId,
      patient_name: patientObj ? patientObj.patient_name : "Patient",
      age: patientObj ? patientObj.age : 30,
      gender: patientObj && (patientObj.gender === 'Female' || patientObj.gender === 'F') ? 'F' : 'M',
      mrn: patientObj ? patientObj.mrn : '',
      tests_ordered: tests,
      organisation: organisation,
      referral_doctor: referral,
      order_date: formattedDate,
      category: 'Incomplete',
      status: 'Incomplete',
      parameters: newParameters.map(p => ({
        parameter_id: p.parameter_id,
        parameter_name: p.parameter_name,
        observed_value: "",
        unit: p.unit,
        min_value: p.min_value,
        max_value: p.max_value,
        reference_range: p.reference_range,
        is_abnormal: false
      }))
    };
    setPatientCases(prev => [newCase, ...prev]);

    async function saveToSupabase() {
      await supabase.from('encounters').insert([{
        encounter_id: encounterId,
        accession_no: accessionNo,
        patient_id: patientId,
        partner_id: partnerId,
        total_amount: totalAmount,
        status: 'Pending Accession'
      }]);

      const testInserts = tests.map(t => ({ encounter_id: encounterId, test_code: t }));
      await supabase.from('encounter_tests').insert(testInserts);

      await supabase.from('bill_settlements').insert([{
        bill_id: billingId,
        encounter_id: encounterId,
        patient_id: patientId,
        referral: referral,
        bill_source: "Front Desk Registration",
        organisation: organisation,
        bill_amount: totalAmount,
        due_amount: 0,
        status: "Paid",
        bill_date: new Date().toISOString()
      }]);

      await supabase.from('report_print_tracking').insert([{
        report_id: reportId,
        encounter_id: encounterId,
        patient_name: patientObj ? patientObj.patient_name : "Patient",
        org_name: organisation,
        referral: referral,
        tests: tests,
        print_status: false,
        bill_date: new Date().toISOString()
      }]);

      const sampleRows = createdSamples.map(s => ({
        sample_id: s.sample_id,
        accession_no: accessionNo,
        barcode_number: null,
        sample_type: s.sample_type,
        status: 'Pending Collection'
      }));
      await supabase.from('samples').insert(sampleRows);

      const requiredTestRows: any[] = [];
      createdSamples.forEach(s => {
        s.required_test_codes.forEach(tc => {
          requiredTestRows.push({ sample_id: s.sample_id, test_code: tc });
        });
      });
      await supabase.from('sample_required_tests').insert(requiredTestRows);

      await supabase.from('test_results').insert([{
        result_id: resultId,
        accession_no: accessionNo,
        status: 'Incomplete'
      }]);

      const paramRows = newParameters.map(p => ({
        parameter_id: p.parameter_id,
        result_id: p.result_id,
        parameter_name: p.parameter_name,
        observed_value: "",
        is_abnormal: false,
        reference_range: p.reference_range,
        unit: p.unit,
        min_value: p.min_value,
        max_value: p.max_value
      }));
      await supabase.from('result_parameters').insert(paramRows);

      await supabase.from('clinical_patient_cases').insert([{
        result_id: resultId,
        category: 'Incomplete',
        notes: null
      }]);
    }
    
    saveToSupabase().then();
    return newEncounter;
  };

  const updateEncounterStatus = async (id: string, status: 'Pending Accession' | 'Sample Collected' | 'Processing' | 'Approved') => {
    setEncounters(prev => prev.map(e => e.encounter_id === id ? { ...e, status } : e));
    await supabase.from('encounters').update({ status }).eq('encounter_id', id);
  };

  const collectSample = (sampleId: string, barcode: string) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + " " + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    setSamples(prev => {
      const updated = prev.map(s => s.sample_id === sampleId ? {
        ...s,
        barcode_number: barcode,
        status: 'Accessed' as const,
        collected_at: formattedDate
      } : s);
      
      const matchingSample = prev.find(s => s.sample_id === sampleId);
      if (matchingSample) {
        const accNo = matchingSample.accession_no;
        const accSamples = updated.filter(s => s.accession_no === accNo);
        const allAccessed = accSamples.every(s => s.status === 'Accessed');
        if (allAccessed) {
          setEncounters(ePrev => ePrev.map(e => e.accession_no === accNo ? { ...e, status: 'Sample Collected' } : e));
          supabase.from('encounters').update({ status: 'Sample Collected' }).eq('accession_no', accNo).then();
        }
      }
      return updated;
    });

    supabase.from('samples').update({
      barcode_number: barcode,
      status: 'Accessed',
      collected_at: new Date().toISOString()
    }).eq('sample_id', sampleId).then();
  };

  const bulkCollectSamplesForAccession = (accessionNo: string) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + " " + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    setSamples(prev => {
      return prev.map(s => s.accession_no === accessionNo && s.status !== 'Accessed' ? {
        ...s,
        barcode_number: s.barcode_number || `BC-${accessionNo}-${s.sample_type.toUpperCase()}`,
        status: 'Accessed' as const,
        collected_at: formattedDate
      } : s);
    });
    
    setEncounters(prev => prev.map(e => e.accession_no === accessionNo ? { ...e, status: 'Sample Collected' } : e));

    async function saveBulkCollect() {
      const { data: smps } = await supabase.from('samples').select('*').eq('accession_no', accessionNo);
      if (smps) {
        await Promise.all(smps.map(s => {
          if (s.status !== 'Accessed') {
            const bc = s.barcode_number || `BC-${accessionNo}-${s.sample_type.toUpperCase()}`;
            return supabase.from('samples').update({
              barcode_number: bc,
              status: 'Accessed',
              collected_at: new Date().toISOString()
            }).eq('sample_id', s.sample_id);
          }
          return Promise.resolve();
        }));
      }
      await supabase.from('encounters').update({ status: 'Sample Collected' }).eq('accession_no', accessionNo);
    }
    saveBulkCollect().then();
  };

  const rejectSample = (sampleId: string, reason: string) => {
    let accNo = '';
    setSamples(prev => {
      const item = prev.find(s => s.sample_id === sampleId);
      if (item) accNo = item.accession_no;
      return prev.map(s => s.sample_id === sampleId ? {
        ...s,
        status: 'Rejected' as const,
        rejection_reason: reason
      } : s);
    });
    
    if (accNo) {
      setEncounters(prev => prev.map(e => e.accession_no === accNo ? { ...e, status: 'Pending Accession' } : e));
      supabase.from('encounters').update({ status: 'Pending Accession' }).eq('accession_no', accNo).then();
    }

    supabase.from('samples').update({
      status: 'Rejected',
      rejection_reason: reason
    }).eq('sample_id', sampleId).then();
  };

  const resetRejectedSampleToPending = (sampleId: string) => {
    setSamples(prev => prev.map(s => s.sample_id === sampleId ? {
      ...s,
      barcode_number: null,
      status: 'Pending Collection' as const,
      rejection_reason: undefined,
      collected_at: undefined
    } : s));

    supabase.from('samples').update({
      barcode_number: null,
      status: 'Pending Collection',
      rejection_reason: null,
      collected_at: null
    }).eq('sample_id', sampleId).then();
  };

  const saveDraftParameters = (resultId: string, parameters: ResultParameter[]) => {
    setResultParameters(prev => {
      const paramMap = new Map(parameters.map(p => [p.parameter_id, p]));
      return prev.map(p => paramMap.has(p.parameter_id) ? paramMap.get(p.parameter_id)! : p);
    });

    async function saveParams() {
      await Promise.all(parameters.map(p => 
        supabase.from('result_parameters').update({
          observed_value: p.observed_value,
          is_abnormal: p.is_abnormal
        }).eq('parameter_id', p.parameter_id)
      ));
    }
    saveParams().then();
  };

  const signAndApproveResult = (resultId: string, parameters: ResultParameter[]) => {
    saveDraftParameters(resultId, parameters);
    
    const formattedDate = new Date().toLocaleDateString('en-GB') + " " + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    setTestResults(prev => prev.map(tr => tr.result_id === resultId ? { ...tr, status: 'Signed' as const, updated_at: formattedDate } : tr));
    
    const tr = testResults.find(r => r.result_id === resultId);
    if (tr) {
      setEncounters(prev => prev.map(e => e.accession_no === tr.accession_no ? { ...e, status: 'Approved' } : e));
      supabase.from('encounters').update({ status: 'Approved' }).eq('accession_no', tr.accession_no).then();
    }

    supabase.from('test_results').update({
      status: 'Signed',
      updated_at: new Date().toISOString()
    }).eq('result_id', resultId).then();
  };

  // Intercept setter for Patient Cases to write to clinical_patient_cases, test_results, result_parameters
  const customSetPatientCases = (value: React.SetStateAction<ClinicalPatientCase[]>) => {
    setPatientCases(prev => {
      const next = typeof value === 'function' ? (value as Function)(prev) : value;
      
      next.forEach((c: ClinicalPatientCase) => {
        const prevCase = prev.find(p => p.result_id === c.result_id);
        if (!prevCase || JSON.stringify(prevCase) !== JSON.stringify(c)) {
          supabase.from('clinical_patient_cases').update({
            category: c.category,
            notes: c.notes || null,
            tat_exceeded_hours: c.tat_exceeded_hours || null,
            outsource_center: c.outsource_center || null
          }).eq('result_id', c.result_id).then();

          supabase.from('test_results').update({
            status: c.status,
            updated_at: new Date().toISOString()
          }).eq('result_id', c.result_id).then();

          c.parameters.forEach(param => {
            supabase.from('result_parameters').update({
              observed_value: param.observed_value,
              is_abnormal: param.is_abnormal
            }).eq('parameter_id', param.parameter_id).then();
          });
        }
      });
      return next;
    });
  };

  const addBillSettlement = async (bill: BillSettlement) => {
    setBillSettlements(prev => [bill, ...prev]);
    const matchedEnc = encounters.find(e => e.patient_id === bill.patient_details.patient_id);
    await supabase.from('bill_settlements').insert([{
      bill_id: bill.bill_id,
      encounter_id: matchedEnc ? matchedEnc.encounter_id : null,
      patient_id: bill.patient_details.patient_id,
      referral: bill.referral,
      bill_source: bill.bill_source,
      organisation: bill.organisation,
      bill_amount: bill.bill_amount,
      due_amount: bill.due_amount,
      status: bill.status,
      bill_date: new Date().toISOString()
    }]);
  };

  const updateBillStatus = async (id: string, status: 'Pending' | 'Paid' | 'Cancelled') => {
    setBillSettlements(prev => prev.map(b => b.bill_id === id ? { ...b, status, due_amount: status === 'Paid' ? 0 : b.due_amount } : b));
    await supabase.from('bill_settlements').update({
      status,
      due_amount: status === 'Paid' ? 0 : undefined
    }).eq('bill_id', id);
  };

  const addReportPrint = async (report: ReportPrintTracking) => {
    setReportPrints(prev => [report, ...prev]);
    const matchedEnc = encounters.find(e => e.patient_id === (patients.find(p => p.patient_name === report.patient_name)?.patient_id || ''));
    await supabase.from('report_print_tracking').insert([{
      report_id: report.report_id,
      encounter_id: matchedEnc ? matchedEnc.encounter_id : null,
      patient_name: report.patient_name,
      org_name: report.org_name,
      referral: report.referral,
      tests: report.tests,
      print_status: report.print_status,
      bill_date: new Date().toISOString()
    }]);
  };

  const updateReportPrintStatus = async (id: string, printed: boolean) => {
    const formattedDate = printed ? new Date().toLocaleDateString('en-GB') + " " + new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}) : "";
    setReportPrints(prev => prev.map(r => r.report_id === id ? { ...r, print_status: printed, report_date: formattedDate } : r));
    await supabase.from('report_print_tracking').update({
      print_status: printed,
      report_date: printed ? new Date().toISOString() : null
    }).eq('report_id', id);
  };

  const addTestConfig = async (config: TestConfig) => {
    setTestConfigs(prev => [...prev, config]);
    await supabase.from('test_configs').insert([{
      test_code: config.testCode,
      verification_status: config.verificationStatus,
      auto_approval: config.autoApproval
    }]);
  };

  const updateBillSettings = async (settings: BillSettings) => {
    setBillSettings(settings);
    await supabase.from('bill_settings').update({
      pre_set_additional_amount: settings.preSetAdditionalAmount,
      bill_header_flag: settings.billHeaderFlag,
      bill_footer_flag: settings.billFooterFlag,
      bill_signature_flag: settings.billSignatureFlag,
      barcode_flag: settings.barcodeFlag,
      sample_type_on_barcode: settings.sampleTypeOnBarcode,
      collection_date: settings.collectionDate,
      bill_receipt_qrcode: settings.billReceiptQRCode,
      test_name: settings.testName,
      short_test_names: settings.shortTestNames,
      manual_accession_number_mandatory: settings.manualAccessionNumberMandatory,
      duplicate_accession_number: settings.duplicateAccessionNumber,
      patient_print_card: settings.patientPrintCard,
      helper_comment: settings.helperComment
    }).eq('id', 1);
  };

  const updateInvoiceSettings = async (settings: InvoiceSettings) => {
    setInvoiceSettings(settings);
    await supabase.from('invoice_settings').update({
      header_height: settings.headerHeight,
      footer_height: settings.footerHeight,
      header_image: settings.headerImage,
      footer_image: settings.footerImage,
      invoice_header_flag: settings.invoiceHeaderFlag,
      invoice_footer_flag: settings.invoiceFooterFlag,
      use_bill_level_vat_in_qrcode: settings.useBillLevelVATInQRCode,
      helper_comment: settings.helperComment
    }).eq('id', 1);
  };

  const updateFinancialDashboard = async (stats: FinancialDashboard) => {
    setFinancialDashboard(stats);
    await supabase.from('financial_dashboard').update({
      total_revenue: stats.totalRevenue,
      amount_due: stats.amountDue,
      amount_paid: stats.amountPaid,
      cash_collection: stats.cashCollection,
      online_collection: stats.onlineCollection,
      others_collection: stats.othersCollection,
      average_patient_rating: stats.averagePatientRating,
      total_logins: stats.totalLogins
    }).eq('id', 1);
  };

  const addPriceList = async (list: PriceList) => {
    setPriceLists(prev => [...prev, list]);
    await supabase.from('price_lists').insert([list]);
  };

  const updateCenterDetails = async (details: CenterDetails) => {
    setCenterDetails(details);
    await supabase.from('center_details').update({
      auth_id: details.authID,
      report_sharing_key: details.reportSharingKey,
      lab_address: details.labAddress,
      area: details.area,
      city: details.city,
      type_of_functioning: details.typeOfFunctioning,
      website: details.website,
      primary_contact_number: details.primaryContactNumber,
      secondary_contact_number: details.secondaryContactNumber,
      lab_email: details.labEmail,
      admin_email: details.adminEmail,
      timings_from: details.timingsFrom,
      timings_to: details.timingsTo,
      is_24x7: details.is24x7
    }).eq('lab_name', details.labName);
  };

  const updateCenterResources = async (resources: CenterResources) => {
    setCenterResources(resources);
    await supabase.from('center_resources').update({
      center_logo: resources.centerLogo,
      mobile_header: resources.mobileHeader,
      pdf_header: resources.pdfHeader,
      pdf_footer: resources.pdfFooter,
      bill_header: resources.billHeader
    }).eq('lab_name', centerDetails.labName);
  };

  const addSystemUser = async (user: SystemUser) => {
    setSystemUsers(prev => [...prev, user]);
    await supabase.from('system_users').insert([{
      username: user.username,
      name: user.name,
      user_role: user.userRole,
      default_login_section: user.defaultLoginSection,
      last_activity: new Date(user.lastActivity).toISOString()
    }]);
  };

  const updateSystemIntegrations = async (integrations: SystemIntegrations) => {
    setSystemIntegrations(integrations);
    await supabase.from('system_integrations').update({
      api_requests_count: integrations.apiRequestsCount,
      webhook_triggers_count: integrations.webhookTriggersCount,
      error_count: integrations.errorCount,
      api_endpoint_filter: integrations.apiEndpointFilter
    }).eq('id', 1);
  };

  const addAppointment = async (appt: Appointment) => {
    setAppointments(prev => [appt, ...prev]);
    await supabase.from('appointments').insert([{
      appt_id: appt.appt_id,
      patient_name: appt.patient_name,
      age: appt.age,
      gender: appt.gender,
      test_code: appt.test_code,
      appt_time: new Date(appt.appt_time).toISOString(),
      phone: appt.phone,
      status: appt.status
    }]);
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.appt_id === id ? { ...a, status } : a));
    await supabase.from('appointments').update({ status }).eq('appt_id', id);
  };

  const addReferringDoctor = async (doc: ReferringDoctor) => {
    setReferringDoctors(prev => [...prev, doc]);
    await supabase.from('referring_doctors').insert([{
      id: doc.id,
      name: doc.name,
      speciality: doc.speciality,
      clinic: doc.clinic,
      contact: doc.contact,
      commission: doc.commission
    }]);
  };

  const addSatelliteCenter = async (center: SatelliteCenter) => {
    setSatelliteCenters(prev => [...prev, center]);
    await supabase.from('satellite_centers').insert([{
      center_id: center.center_id,
      name: center.name,
      location: center.location,
      head: center.head,
      status: center.status
    }]);
  };

  const addSampleVialSetting = async (setting: SampleSetting) => {
    const { data, error } = await supabase.from('sample_vial_settings').insert([{
      sample_name: setting.sample_name,
      sample_type: setting.sample_type,
      container_type: setting.container_type
    }]).select('sr_no').single();
    
    if (error) {
      console.error("Failed to insert sample vial setting:", error);
    }
    const srNo = data ? Number(data.sr_no) : Math.floor(Math.random() * 1000) + 100;
    setSampleVialSettings(prev => [...prev, { ...setting, sr_no: srNo }]);
  };

  const updateSampleVialSetting = async (setting: SampleSetting) => {
    setSampleVialSettings(prev => prev.map(s => s.sr_no === setting.sr_no ? setting : s));
    await supabase.from('sample_vial_settings').update({
      sample_name: setting.sample_name,
      sample_type: setting.sample_type,
      container_type: setting.container_type
    }).eq('sr_no', setting.sr_no);
  };

  const deleteSampleVialSetting = async (srNo: number) => {
    setSampleVialSettings(prev => prev.filter(s => s.sr_no !== srNo));
    await supabase.from('sample_vial_settings').delete().eq('sr_no', srNo);
  };

  const toggleArchivePatient = async (id: string) => {
    setArchivedPatientIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('dlabs_archived_patients', JSON.stringify(next));
      return next;
    });
  };

  const searchGlobal = (query: string) => {
    if (!query || query.trim().length === 0) return [];
    const lower = query.toLowerCase().trim();
    const results: Array<any> = [];

    patients.forEach(p => {
      if (
        p.patient_name.toLowerCase().includes(lower) || 
        p.contact_number.includes(lower) || 
        p.patient_id.toLowerCase().includes(lower) || 
        p.mrn.toLowerCase().includes(lower)
      ) {
        results.push({
          type: 'patient',
          id: p.patient_id,
          title: p.patient_name,
          subtitle: `MRN: ${p.mrn} | Mob: ${p.contact_number} | Age: ${p.age} [${p.patient_type}]`,
          targetModule: 'registration',
          payload: { phone_number: p.contact_number }
        });
      }
    });

    encounters.forEach(e => {
      if (e.accession_no.toLowerCase().includes(lower)) {
        const patient = patients.find(p => p.patient_id === e.patient_id);
        results.push({
          type: 'accession',
          id: e.encounter_id,
          title: e.accession_no,
          subtitle: `Order for ${patient ? patient.patient_name : 'Unknown'} | Status: ${e.status}`,
          targetModule: 'dashboard',
          payload: { highlight: e.accession_no }
        });
      }
    });

    billSettlements.forEach(b => {
      if (b.bill_id.toLowerCase().includes(lower) || b.patient_details.name.toLowerCase().includes(lower)) {
        results.push({
          type: 'bill',
          id: b.bill_id,
          title: `Bill: ${b.bill_id}`,
          subtitle: `Patient: ${b.patient_details.name} | Amount: ₹${b.bill_amount} (${b.status})`,
          targetModule: 'registration',
          payload: { subview: 'billing-history', highlight: b.bill_id }
        });
      }
    });

    testCatalog.forEach(t => {
      if (t.test_name.toLowerCase().includes(lower) || t.test_code.toLowerCase().includes(lower)) {
        results.push({
          type: 'test',
          id: t.test_code,
          title: `[${t.test_code}] ${t.test_name}`,
          subtitle: `Dept: ${t.department} | Specimen: ${t.sample_type} | Retail: ₹${t.retail_price}`,
          targetModule: 'admin',
          payload: { tab: 'tests', filter: t.test_code }
        });
      }
    });

    b2bPartners.forEach(b => {
      if (b.partner_name.toLowerCase().includes(lower) || b.partner_id.toLowerCase().includes(lower)) {
        results.push({
          type: 'partner',
          id: b.partner_id,
          title: b.partner_name,
          subtitle: `Discount: ${b.discount_percentage}% | Billing: ${b.billing_type}`,
          targetModule: 'admin',
          payload: { tab: 'partners', filter: b.partner_id }
        });
      }
    });

    return results.slice(0, 6);
  };

  return (
    <AppContext.Provider value={{
      labProfile,
      testCatalog,
      b2bPartners,
      patients,
      encounters,
      billSettlements,
      reportPrints,
      testConfigs,
      billSettings,
      invoiceSettings,
      financialDashboard,
      priceLists,
      centerDetails,
      centerResources,
      systemUsers,
      systemIntegrations,

      samples,
      testResults,
      resultParameters,
      patientCases,
      setPatientCases: customSetPatientCases,

      appointments,
      referringDoctors,
      satelliteCenters,
      sampleVialSettings,
      archivedPatientIds,

      activeSubView,
      setActiveSubView,

      isLoading,

      updateLabProfile,
      addTest,
      addPartner,
      addPatient,
      updatePatient,
      createEncounter,
      updateEncounterStatus,

      collectSample,
      bulkCollectSamplesForAccession,
      rejectSample,
      resetRejectedSampleToPending,
      saveDraftParameters,
      signAndApproveResult,
      
      addBillSettlement,
      updateBillStatus,
      addReportPrint,
      updateReportPrintStatus,
      addTestConfig,
      updateBillSettings,
      updateInvoiceSettings,
      updateFinancialDashboard,
      addPriceList,
      updateCenterDetails,
      updateCenterResources,
      addSystemUser,
      updateSystemIntegrations,

      addAppointment,
      updateAppointmentStatus,
      addReferringDoctor,
      addSatelliteCenter,
      addSampleVialSetting,
      updateSampleVialSetting,
      deleteSampleVialSetting,
      toggleArchivePatient,

      searchGlobal,
      currentLanguage,
      setLanguage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
