export interface PatientAddress {
  address: string;
  city: string;
  district: string;
  pincode: string;
  location_area: string;
  state: string;
  country: string;
  ward_number: string;
}

export interface MedicalHistory {
  covid_vaccine_received: boolean;
  arogya_setu_app: boolean;
  is_hospitalized: boolean;
  type_of_vaccine: string;
  patient_category: string;
  patient_occupation: string;
  vaccination_date: string;
  date_of_dose_2: string;
  vaccination_status: 'Unvaccinated' | 'Partially Vaccinated' | 'Fully Vaccinated';
  body_temperature: 'Normal' | 'Mild Fever' | 'High Fever';
  symptom_progress: 'Improving' | 'Stable' | 'Worsening' | 'None';
  cowin_beneficiary: string;
  country_state_travelled: string;
  isolation_location: string;
  passenger_locator_id: string;
  travel_history: string[];
  symptoms: string[];
  medical_conditions: string[];
}

export interface RegistrationLogistics {
  sample_collected_from: 'Home' | 'Lab Center' | 'Hospital' | 'Drive-through';
  mode_of_transport: 'Courier' | 'Self-delivered' | 'Lab Rider' | 'Ambulance';
}

export interface Patient {
  patient_id: string;
  patient_type: 'Regular' | 'Corporate' | 'VIP' | 'Staff' | 'Referral';
  mrn: string;
  national_id: string;
  designation: 'Mr.' | 'Mrs.' | 'Ms.' | 'Dr.' | 'Master' | 'Mx.';
  patient_name: string;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth: string;
  age: number;
  contact_number: string;
  phone_belongs_to: 'Patient' | 'Relative/Guardian';
  email: string;
  organisation: string;
  referral: string;
  address_details: PatientAddress;
  medical_history: MedicalHistory;
  logistics: RegistrationLogistics;
}

export interface B2B_Partner {
  partner_id: string;
  partner_name: string;
  discount_percentage: number;
  billing_type: 'Prepaid' | 'Postpaid';
  partner_type?: 'Corporate' | 'Insurance' | 'Franchise' | 'Government';
  partner_code?: string;
  contact_number?: string;
  email?: string;
  billing_address?: string;
  credit_limit?: number;
  outstanding_balance?: number;
  status?: 'Active' | 'Inactive';
}

export interface BillSettlement {
  bill_id: string;
  bill_date: string;
  patient_details: {
    name: string;
    gender: 'Male' | 'Female' | 'Other';
    age: number;
    patient_id: string;
  };
  referral: string;
  bill_source: string;
  organisation: string;
  bill_amount: number;
  due_amount: number;
  status: 'Pending' | 'Paid' | 'Cancelled';
}

export interface TestCatalog {
  test_code: string;
  test_name: string;
  sample_type: string;
  container_type: string;
  retail_price: number;
  department: string;
  average_tat: string;
  outsource_status: 'In-House' | 'Outsourced';
  outsource_center: string;
  list_price: number;
}

export interface ReportPrintTracking {
  report_id: string;
  patient_name: string;
  org_name: string;
  referral: string;
  tests: string[];
  report_date: string;
  bill_date: string;
  print_status: boolean;
}

export interface TestConfig {
  testName: string;
  testCode: string;
  sampleType: string;
  department: string;
  outsourceCenter: string;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
  price: number;
  isOutsourced: boolean;
  autoApproval: boolean;
}

export interface BillSettings {
  preSetAdditionalAmount: number;
  billHeaderFlag: boolean;
  billFooterFlag: boolean;
  billSignatureFlag: boolean;
  barcodeFlag: boolean;
  sampleTypeOnBarcode: boolean;
  collectionDate: boolean;
  billReceiptQRCode: boolean;
  testName: boolean;
  shortTestNames: boolean;
  manualAccessionNumberMandatory: boolean;
  duplicateAccessionNumber: 'Allow' | 'Reject' | 'Warn';
  patientPrintCard: 'Detailed' | 'Compact' | 'None';
  helperComment: string;
}

export interface InvoiceSettings {
  headerHeight: number;
  footerHeight: number;
  headerImage: string;
  footerImage: string;
  invoiceHeaderFlag: boolean;
  invoiceFooterFlag: boolean;
  useBillLevelVATInQRCode: boolean;
  helperComment: string;
}

export interface FinancialDashboard {
  totalRevenue: number;
  amountDue: number;
  amountPaid: number;
  cashCollection: number;
  onlineCollection: number;
  othersCollection: number;
  averagePatientRating: number;
  totalLogins: number;
}

export interface PriceList {
  listName: string;
  listType: string;
  listCategory: 'Corporate' | 'Govt' | 'Retail' | 'Special';
  status: 'Active' | 'Inactive';
  createdTime: string;
}

export interface BulkTestAssignment {
  selectedTests: string[];
  targetListType: string;
  targetList: string;
  globalApplyFlags: boolean[]; // index-based: [applyPriceIncrement, applyTATLimit, applyAutoApprove]
}

export interface CenterDetails {
  labName: string;
  authID: string;
  reportSharingKey: string;
  labAddress: string;
  area: string;
  city: string;
  typeOfFunctioning: string;
  website: string;
  primaryContactNumber: string;
  secondaryContactNumber: string;
  labEmail: string;
  adminEmail: string;
  timingsFrom: string;
  timingsTo: string;
  is24x7: boolean;
}

export interface CenterResources {
  centerLogo: string;
  mobileHeader: string;
  pdfHeader: string;
  pdfFooter: string;
  billHeader: string;
}

export interface SystemUser {
  username: string;
  name: string;
  userRole: string;
  defaultLoginSection: string;
  lastActivity: string;
  isVisible?: string;
}

export interface SystemIntegrations {
  apiRequestsCount: number;
  webhookTriggersCount: number;
  errorCount: number;
  apiEndpointFilter: string;
}

export interface Encounter {
  encounter_id: string;
  accession_no: string;
  patient_id: string;
  partner_id: string | null;
  total_amount: number;
  status: 'Pending Accession' | 'Sample Collected' | 'Processing' | 'Approved';
  tests_ordered: string[];
  created_at: string;
}

export interface LabProfile {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface Sample {
  sample_id: string;
  accession_no: string;
  barcode_number: string | null;
  sample_type: 'Serum' | 'EDTA' | 'Urine' | 'Blood' | 'Plasma' | 'Swab';
  status: 'Pending Collection' | 'Accessed' | 'Rejected';
  rejection_reason?: string;
  collected_at?: string;
  required_test_codes: string[];
}

export interface TestResult {
  result_id: string;
  accession_no: string;
  status: 'Incomplete' | 'Rerun' | 'Completed' | 'Signed';
  updated_at?: string;
}

export interface ResultParameter {
  parameter_id: string;
  result_id: string;
  parameter_name: string;
  observed_value: string;
  is_abnormal: boolean;
  reference_range: string;
  unit: string;
  min_value: number;
  max_value: number;
}

export interface ClinicalPatientCase {
  result_id: string;
  accession_no: string;
  patient_id: string;
  patient_name: string;
  age: number;
  gender: 'M' | 'F';
  mrn: string;
  tests_ordered: string[];
  organisation: string;
  referral_doctor: string;
  order_date: string;
  category: string;
  status: 'Incomplete' | 'Partially Completed' | 'Active Rerun' | 'Completed' | 'Partially Signed' | 'Signed' | 'Emergency' | 'Critical' | 'TAT Exceeded' | 'Outsourced' | 'Cancelled';
  parameters: {
    parameter_id: string;
    parameter_name: string;
    observed_value: string;
    unit: string;
    min_value: number;
    max_value: number;
    reference_range: string;
    is_abnormal: boolean;
  }[];
  notes?: string;
  tat_exceeded_hours?: number;
  outsource_center?: string;
}

export interface Appointment {
  appt_id: string;
  patient_name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  test_code: string;
  appt_time: string;
  phone: string;
  status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Cancelled';
}

export interface ReferringDoctor {
  id: string;
  name: string;
  speciality: string;
  clinic: string;
  contact: string;
  commission: number;
}

export interface SatelliteCenter {
  center_id: string;
  name: string;
  location: string;
  head: string;
  status: 'Active' | 'Inactive';
}

export interface SampleSetting {
  sr_no: number;
  sample_name: string;
  sample_type: string;
  container_type: string;
}

export type UserRole = 'admin' | 'staff';

export interface User {
  username: string;
  name: string;
  userRole: string;
  defaultLoginSection: string;
  lastActivity: string;
}

export interface AdminNotification {
  id: string;
  message: string;
  timestamp: string;
  is_read: boolean;
}

