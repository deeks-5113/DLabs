import React, { createContext, useContext, useState, useEffect } from 'react';
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
  ClinicalPatientCase
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

  activeSubView: string;
  setActiveSubView: (view: string) => void;

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
  const [labProfile, setLabProfile] = useState<LabProfile>(() => {
    const saved = localStorage.getItem('dlabs_lab_profile');
    return saved ? JSON.parse(saved) : initialLabProfile;
  });

  const [testCatalog, setTestCatalog] = useState<TestCatalog[]>(() => {
    const saved = localStorage.getItem('dlabs_test_catalog');
    return saved ? JSON.parse(saved) : initialTestCatalog;
  });

  const [b2bPartners, setB2BPartners] = useState<B2B_Partner[]>(() => {
    const saved = localStorage.getItem('dlabs_b2b_partners');
    return saved ? JSON.parse(saved) : initialB2BPartners;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('dlabs_patients_v2');
    return saved ? JSON.parse(saved) : initialPatients;
  });

  const [encounters, setEncounters] = useState<Encounter[]>(() => {
    const saved = localStorage.getItem('dlabs_encounters_v2');
    return saved ? JSON.parse(saved) : initialEncounters;
  });

  const [billSettlements, setBillSettlements] = useState<BillSettlement[]>(() => {
    const saved = localStorage.getItem('dlabs_bill_settlements');
    return saved ? JSON.parse(saved) : initialBillSettlements;
  });

  const [reportPrints, setReportPrints] = useState<ReportPrintTracking[]>(() => {
    const saved = localStorage.getItem('dlabs_report_prints');
    return saved ? JSON.parse(saved) : initialReportPrints;
  });

  const [testConfigs, setTestConfigs] = useState<TestConfig[]>(() => {
    const saved = localStorage.getItem('dlabs_test_configs');
    return saved ? JSON.parse(saved) : initialTestConfigs;
  });

  const [billSettings, setBillSettings] = useState<BillSettings>(() => {
    const saved = localStorage.getItem('dlabs_bill_settings');
    return saved ? JSON.parse(saved) : initialBillSettings;
  });

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(() => {
    const saved = localStorage.getItem('dlabs_invoice_settings');
    return saved ? JSON.parse(saved) : initialInvoiceSettings;
  });

  const [financialDashboard, setFinancialDashboard] = useState<FinancialDashboard>(() => {
    const saved = localStorage.getItem('dlabs_financial_dashboard');
    return saved ? JSON.parse(saved) : initialFinancialDashboard;
  });

  const [priceLists, setPriceLists] = useState<PriceList[]>(() => {
    const saved = localStorage.getItem('dlabs_price_lists');
    return saved ? JSON.parse(saved) : initialPriceLists;
  });

  const [centerDetails, setCenterDetails] = useState<CenterDetails>(() => {
    const saved = localStorage.getItem('dlabs_center_details');
    return saved ? JSON.parse(saved) : initialCenterDetails;
  });

  const [centerResources, setCenterResources] = useState<CenterResources>(() => {
    const saved = localStorage.getItem('dlabs_center_resources');
    return saved ? JSON.parse(saved) : initialCenterResources;
  });

  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(() => {
    const saved = localStorage.getItem('dlabs_system_users');
    return saved ? JSON.parse(saved) : initialSystemUsers;
  });

  const [systemIntegrations, setSystemIntegrations] = useState<SystemIntegrations>(() => {
    const saved = localStorage.getItem('dlabs_system_integrations');
    return saved ? JSON.parse(saved) : initialSystemIntegrations;
  });

  // Phase 2 states
  const [samples, setSamples] = useState<Sample[]>(() => {
    const saved = localStorage.getItem('dlabs_samples');
    return saved ? JSON.parse(saved) : initialSamples;
  });

  const [testResults, setTestResults] = useState<TestResult[]>(() => {
    const saved = localStorage.getItem('dlabs_test_results');
    return saved ? JSON.parse(saved) : initialTestResults;
  });

  const [resultParameters, setResultParameters] = useState<ResultParameter[]>(() => {
    const saved = localStorage.getItem('dlabs_result_parameters');
    return saved ? JSON.parse(saved) : initialResultParameters;
  });

  const [patientCases, setPatientCases] = useState<ClinicalPatientCase[]>(() => {
    const saved = localStorage.getItem('dlabs_patient_cases');
    return saved ? JSON.parse(saved) : initialPatientCases;
  });

  // Keep track of active secondary views requested by user
  const [activeSubView, setActiveSubView] = useState<string>('registration-billing');

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'te' | 'hi'>(() => {
    const saved = localStorage.getItem('dlabs_language');
    return (saved as 'en' | 'te' | 'hi') || 'en';
  });

  const setLanguage = (lang: 'en' | 'te' | 'hi') => {
    setCurrentLanguage(lang);
    localStorage.setItem('dlabs_language', lang);
  };

  // Persistence triggers
  useEffect(() => { localStorage.setItem('dlabs_lab_profile', JSON.stringify(labProfile)); }, [labProfile]);
  useEffect(() => { localStorage.setItem('dlabs_test_catalog', JSON.stringify(testCatalog)); }, [testCatalog]);
  useEffect(() => { localStorage.setItem('dlabs_b2b_partners', JSON.stringify(b2bPartners)); }, [b2bPartners]);
  useEffect(() => { localStorage.setItem('dlabs_patients_v2', JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem('dlabs_encounters_v2', JSON.stringify(encounters)); }, [encounters]);
  useEffect(() => { localStorage.setItem('dlabs_bill_settlements', JSON.stringify(billSettlements)); }, [billSettlements]);
  useEffect(() => { localStorage.setItem('dlabs_report_prints', JSON.stringify(reportPrints)); }, [reportPrints]);
  useEffect(() => { localStorage.setItem('dlabs_test_configs', JSON.stringify(testConfigs)); }, [testConfigs]);
  useEffect(() => { localStorage.setItem('dlabs_bill_settings', JSON.stringify(billSettings)); }, [billSettings]);
  useEffect(() => { localStorage.setItem('dlabs_invoice_settings', JSON.stringify(invoiceSettings)); }, [invoiceSettings]);
  useEffect(() => { localStorage.setItem('dlabs_financial_dashboard', JSON.stringify(financialDashboard)); }, [financialDashboard]);
  useEffect(() => { localStorage.setItem('dlabs_price_lists', JSON.stringify(priceLists)); }, [priceLists]);
  useEffect(() => { localStorage.setItem('dlabs_center_details', JSON.stringify(centerDetails)); }, [centerDetails]);
  useEffect(() => { localStorage.setItem('dlabs_center_resources', JSON.stringify(centerResources)); }, [centerResources]);
  useEffect(() => { localStorage.setItem('dlabs_system_users', JSON.stringify(systemUsers)); }, [systemUsers]);
  useEffect(() => { localStorage.setItem('dlabs_system_integrations', JSON.stringify(systemIntegrations)); }, [systemIntegrations]);
  useEffect(() => { localStorage.setItem('dlabs_samples', JSON.stringify(samples)); }, [samples]);
  useEffect(() => { localStorage.setItem('dlabs_test_results', JSON.stringify(testResults)); }, [testResults]);
  useEffect(() => { localStorage.setItem('dlabs_result_parameters', JSON.stringify(resultParameters)); }, [resultParameters]);
  useEffect(() => { localStorage.setItem('dlabs_patient_cases', JSON.stringify(patientCases)); }, [patientCases]);

  const updateLabProfile = (profile: LabProfile) => {
    setLabProfile(profile);
  };

  const addTest = (test: TestCatalog) => {
    setTestCatalog(prev => {
      if (prev.some(t => t.test_code.toUpperCase() === test.test_code.toUpperCase())) {
        return prev;
      }
      return [...prev, test];
    });
    // Add default TestConfig matching it
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
  };

  const addPartner = (partner: B2B_Partner) => {
    setB2BPartners(prev => {
      if (prev.some(p => p.partner_id === partner.partner_id)) return prev;
      return [...prev, partner];
    });
  };

  const addPatient = (patient: Patient) => {
    setPatients(prev => {
      if (prev.some(p => p.patient_id === patient.patient_id)) {
        return prev;
      }
      return [...prev, patient];
    });
  };

  const updatePatient = (updated: Patient) => {
    setPatients(prev => prev.map(p => p.patient_id === updated.patient_id ? updated : p));
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
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utcTime + (3600000 * 5.5));
    const day = String(istTime.getDate()).padStart(2, '0');
    const month = String(istTime.getMonth() + 1).padStart(2, '0');
    const year = istTime.getFullYear();
    const hours = String(istTime.getHours()).padStart(2, '0');
    const minutes = String(istTime.getMinutes()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;

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

    // Automatically create accompanying BillSettlement
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

    // Automatically create accompanying ReportPrintTracking entry
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

    // Update financial dashboards
    setFinancialDashboard(prev => ({
      ...prev,
      totalRevenue: prev.totalRevenue + totalAmount,
      amountPaid: prev.amountPaid + totalAmount,
      cashCollection: prev.cashCollection + totalAmount
    }));

    // PHASE 2 - ACCEDING LOGISTICS GENERATION (Samples, results, parameters)
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

    return newEncounter;
  };

  const updateEncounterStatus = (id: string, status: 'Pending Accession' | 'Sample Collected' | 'Processing' | 'Approved') => {
    setEncounters(prev => prev.map(e => e.encounter_id === id ? { ...e, status } : e));
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
        }
      }
      return updated;
    });
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
    }
  };

  const resetRejectedSampleToPending = (sampleId: string) => {
    setSamples(prev => prev.map(s => s.sample_id === sampleId ? {
      ...s,
      barcode_number: null,
      status: 'Pending Collection' as const,
      rejection_reason: undefined,
      collected_at: undefined
    } : s));
  };

  const saveDraftParameters = (resultId: string, parameters: ResultParameter[]) => {
    setResultParameters(prev => {
      const paramMap = new Map(parameters.map(p => [p.parameter_id, p]));
      return prev.map(p => paramMap.has(p.parameter_id) ? paramMap.get(p.parameter_id)! : p);
    });
  };

  const signAndApproveResult = (resultId: string, parameters: ResultParameter[]) => {
    saveDraftParameters(resultId, parameters);
    
    setTestResults(prev => prev.map(tr => tr.result_id === resultId ? { ...tr, status: 'Signed' as const, updated_at: new Date().toLocaleDateString('en-GB') + " " + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) } : tr));
    
    // Find accession number to update encounter status
    const tr = testResults.find(r => r.result_id === resultId);
    if (tr) {
      setEncounters(prev => prev.map(e => e.accession_no === tr.accession_no ? { ...e, status: 'Approved' } : e));
    }
  };

  const addBillSettlement = (bill: BillSettlement) => {
    setBillSettlements(prev => [bill, ...prev]);
  };

  const updateBillStatus = (id: string, status: 'Pending' | 'Paid' | 'Cancelled') => {
    setBillSettlements(prev => prev.map(b => b.bill_id === id ? { ...b, status, due_amount: status === 'Paid' ? 0 : b.due_amount } : b));
  };

  const addReportPrint = (report: ReportPrintTracking) => {
    setReportPrints(prev => [report, ...prev]);
  };

  const updateReportPrintStatus = (id: string, printed: boolean) => {
    const formattedDate = printed ? new Date().toLocaleDateString('en-GB') + " " + new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}) : "";
    setReportPrints(prev => prev.map(r => r.report_id === id ? { ...r, print_status: printed, report_date: formattedDate } : r));
  };

  const addTestConfig = (config: TestConfig) => {
    setTestConfigs(prev => [...prev, config]);
  };

  const updateBillSettings = (settings: BillSettings) => {
    setBillSettings(settings);
  };

  const updateInvoiceSettings = (settings: InvoiceSettings) => {
    setInvoiceSettings(settings);
  };

  const updateFinancialDashboard = (stats: FinancialDashboard) => {
    setFinancialDashboard(stats);
  };

  const addPriceList = (list: PriceList) => {
    setPriceLists(prev => [...prev, list]);
  };

  const updateCenterDetails = (details: CenterDetails) => {
    setCenterDetails(details);
  };

  const updateCenterResources = (resources: CenterResources) => {
    setCenterResources(resources);
  };

  const addSystemUser = (user: SystemUser) => {
    setSystemUsers(prev => [...prev, user]);
  };

  const updateSystemIntegrations = (integrations: SystemIntegrations) => {
    setSystemIntegrations(integrations);
  };

  const searchGlobal = (query: string) => {
    if (!query || query.trim().length === 0) return [];
    const lower = query.toLowerCase().trim();
    const results: Array<any> = [];

    // Search patients by name or phone or ID and MRN
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

    // Search encounters by accession_no
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

    // Search bills
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

    // Search tests
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

    // Search B2B partners
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
      setPatientCases,

      activeSubView,
      setActiveSubView,

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
