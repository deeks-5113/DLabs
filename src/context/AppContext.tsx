import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/apiClient';
import { User, AdminNotification, TestCatalog, 
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
  currentUser: User | null;
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  adminNotifications: AdminNotification[];
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;

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
  addPatient: (patient: Patient) => Promise<Patient>;
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
  addSystemUser: (user: SystemUser & { password?: string }) => Promise<void>;
  updateSystemUser: (user: SystemUser & { password?: string }) => Promise<void>;
  deleteSystemUser: (username: string) => Promise<void>;
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

// Mocks removed, fetching from backend

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const resp = await apiRequest<any>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      if (resp && resp.user) {
        setCurrentUser(resp.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login failed", err);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const fetchNotifications = async () => {
    try {
      const data = await apiRequest<AdminNotification[]>('/api/v1/admin/notifications');
      setAdminNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await apiRequest(`/api/v1/admin/notifications/${id}/read`, { method: 'PATCH' });
      setAdminNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const [labProfile, setLabProfile] = useState<any>({} as LabProfile);
  const [testCatalog, setTestCatalog] = useState<any>([]);
  const [b2bPartners, setB2BPartners] = useState<B2B_Partner[]>([]);
  const [patients, setPatients] = useState<any>([]);
  const [encounters, setEncounters] = useState<any>([]);
  const [billSettlements, setBillSettlements] = useState<any>([]);
  const [reportPrints, setReportPrints] = useState<any>([]);
  const [testConfigs, setTestConfigs] = useState<any>([]);
  const [billSettings, setBillSettings] = useState<any>({} as BillSettings);
  const [invoiceSettings, setInvoiceSettings] = useState<any>({} as InvoiceSettings);
  const [financialDashboard, setFinancialDashboard] = useState<any>({} as FinancialDashboard);
  const [priceLists, setPriceLists] = useState<any>([]);
  const [centerDetails, setCenterDetails] = useState<any>({} as CenterDetails);
  const [centerResources, setCenterResources] = useState<any>({} as CenterResources);
  const [systemUsers, setSystemUsers] = useState<any>([]);
  const [systemIntegrations, setSystemIntegrations] = useState<any>({} as SystemIntegrations);
  
  const [samples, setSamples] = useState<any>([]);
  const [testResults, setTestResults] = useState<any>([]);
  const [resultParameters, setResultParameters] = useState<any>([]);
  const [patientCases, setPatientCases] = useState<any>([]);

  const [appointments, setAppointments] = useState<any>([]);
  const [referringDoctors, setReferringDoctors] = useState<any>([]);
  const [satelliteCenters, setSatelliteCenters] = useState<any>([]);
  const [sampleVialSettings, setSampleVialSettings] = useState<any>([]);
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

  // 1. Initial Load from FastAPI Backend
  useEffect(() => {
    async function initBackend() {
      if (!currentUser) return;
      try {
        const data = await apiRequest<any>('/api/v1/app-state');
        if (data.labProfile) setLabProfile(data.labProfile);
        if (data.testCatalog) setTestCatalog(data.testCatalog);
        if (data.b2bPartners) setB2BPartners(data.b2bPartners);
        if (data.appointments) {
          setAppointments(data.appointments.map((a: any) => ({
            ...a,
            age: Number(a.age)
          })));
        }
        if (data.referringDoctors) {
          setReferringDoctors(data.referringDoctors.map((d: any) => ({
            ...d,
            commission: Number(d.commission)
          })));
        }
        if (data.satelliteCenters) setSatelliteCenters(data.satelliteCenters);
        if (data.sampleVialSettings) {
          setSampleVialSettings(data.sampleVialSettings.map((v: any) => ({
            ...v,
            sr_no: Number(v.sr_no)
          })));
        }
        if (data.patients) setPatients(data.patients);
        if (data.encounters) {
          setEncounters(data.encounters.map((e: any) => ({
            ...e,
            total_amount: Number(e.total_amount)
          })));
        }
        if (data.billSettlements) {
          setBillSettlements(data.billSettlements.map((b: any) => ({
            ...b,
            bill_amount: Number(b.bill_amount),
            due_amount: Number(b.due_amount)
          })));
        }
        if (data.reportPrints) setReportPrints(data.reportPrints);
        if (data.testConfigs) setTestConfigs(data.testConfigs);
        if (data.billSettings) setBillSettings(data.billSettings);
        if (data.invoiceSettings) setInvoiceSettings(data.invoiceSettings);
        if (data.financialDashboard) setFinancialDashboard(data.financialDashboard);
        if (data.priceLists) setPriceLists(data.priceLists);
        if (data.centerDetails) setCenterDetails(data.centerDetails);
        if (data.centerResources) setCenterResources(data.centerResources);
        if (data.systemUsers) setSystemUsers(data.systemUsers);
        if (data.systemIntegrations) setSystemIntegrations(data.systemIntegrations);
        if (data.samples) setSamples(data.samples);
        if (data.testResults) setTestResults(data.testResults);
        if (data.resultParameters) setResultParameters(data.resultParameters);
        if (data.patientCases) setPatientCases(data.patientCases);
      } catch (err) {
        console.error("Failed to initialize LIMS database:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initBackend();
  }, [currentUser]);

  const updateLabProfile = async (profile: LabProfile) => {
    setLabProfile(profile);
    await apiRequest<LabProfile>('/api/v1/admin/lab-profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
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

    await apiRequest<TestCatalog>('/api/v1/admin/test-catalog', {
      method: 'POST',
      body: JSON.stringify(test)
    });
    await apiRequest<TestConfig>('/api/v1/admin/test-configs', {
      method: 'POST',
      body: JSON.stringify({
        test_code: newConfig.testCode,
        verification_status: newConfig.verificationStatus,
        auto_approval: newConfig.autoApproval
      })
    });
  };

  const addPartner = async (partner: B2B_Partner) => {
    setB2BPartners(prev => {
      if (prev.some(p => p.partner_id === partner.partner_id)) return prev;
      return [...prev, partner];
    });
    await apiRequest<B2B_Partner>('/api/v1/admin/partners', {
      method: 'POST',
      body: JSON.stringify(partner)
    });
  };

  const addPatient = async (patient: Patient) => {
    const createdPatient = await apiRequest<Patient>('/api/v1/registration/patients', {
      method: 'POST',
      body: JSON.stringify({
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
        address_details: patient.address_details,
        medical_history: patient.medical_history
      })
    });

    setPatients(prev => {
      if (prev.some(p => p.patient_id === createdPatient.patient_id)) {
        return prev;
      }
      return [...prev.filter(p => p.patient_id !== patient.patient_id), createdPatient];
    });

    return createdPatient;
  };

  const updatePatient = async (updated: Patient) => {
    setPatients(prev => prev.map(p => p.patient_id === updated.patient_id ? updated : p));

    await apiRequest<Patient>(`/api/v1/registration/patients/${updated.patient_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        patient_id: updated.patient_id,
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
        patient_addresses: updated.address_details,
        patient_medical_histories: updated.medical_history
      })
    });
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

    setFinancialDashboard(prev => ({
      ...prev,
      totalRevenue: prev.totalRevenue + totalAmount,
      amountPaid: prev.amountPaid + totalAmount,
      cashCollection: prev.cashCollection + totalAmount
    }));

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

    async function saveEncounterToBackend() {
      try {
        const bundle = await apiRequest<any>('/api/v1/registration/encounter', {
          method: 'POST',
          body: JSON.stringify({
            patientId,
            partnerId,
            tests,
            totalAmount,
            referral,
            organisation
          })
        });
        
        setEncounters(prev => prev.map(e => e.encounter_id === encounterId ? bundle.encounter : e));
        setBillSettlements(prev => prev.map(b => b.bill_id === billingId ? bundle.billSettlement : b));
        setReportPrints(prev => prev.map(r => r.report_id === reportId ? bundle.reportPrint : r));
        setSamples(prev => prev.filter(s => s.accession_no !== accessionNo).concat(bundle.samples));
        setTestResults(prev => prev.map(tr => tr.result_id === resultId ? bundle.testResult : tr));
        setResultParameters(prev => [...prev, ...bundle.resultParameters]);
        setPatientCases(prev => [bundle.patientCase, ...prev.filter(c => c.result_id !== resultId)]);
        setFinancialDashboard(bundle.financialDashboard);
      } catch (err) {
        console.error("Failed to save encounter to backend:", err);
      }
    }

    saveEncounterToBackend();
    return newEncounter;
  };

  const updateEncounterStatus = async (id: string, status: 'Pending Accession' | 'Sample Collected' | 'Processing' | 'Approved') => {
    setEncounters(prev => prev.map(e => e.encounter_id === id ? { ...e, status } : e));
    await apiRequest<any>(`/api/v1/registration/encounter/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  };

  const collectSample = async (sampleId: string, barcode: string) => {
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

    try {
      const updatedSample = await apiRequest<any>('/api/v1/accession/collect', {
        method: 'POST',
        body: JSON.stringify({ sampleId, barcode })
      });
      setSamples(prev => prev.map(s => s.sample_id === sampleId ? updatedSample : s));
    } catch (err) {
      console.error("Failed to collect sample:", err);
    }
  };

  const bulkCollectSamplesForAccession = async (accessionNo: string) => {
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

    try {
      const updatedSamples = await apiRequest<any[]>('/api/v1/accession/collect/bulk', {
        method: 'POST',
        body: JSON.stringify({ accessionNo })
      });
      setSamples(prev => {
        const otherSamples = prev.filter(s => s.accession_no !== accessionNo);
        return [...updatedSamples, ...otherSamples];
      });
    } catch (err) {
      console.error("Failed bulk collect:", err);
    }
  };

  const rejectSample = async (sampleId: string, reason: string) => {
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

    try {
      const updatedSample = await apiRequest<any>('/api/v1/accession/reject', {
        method: 'POST',
        body: JSON.stringify({ sampleId, reason })
      });
      setSamples(prev => prev.map(s => s.sample_id === sampleId ? updatedSample : s));
    } catch (err) {
      console.error("Failed to reject sample:", err);
    }
  };

  const resetRejectedSampleToPending = async (sampleId: string) => {
    setSamples(prev => prev.map(s => s.sample_id === sampleId ? {
      ...s,
      barcode_number: null,
      status: 'Pending Collection' as const,
      rejection_reason: undefined,
      collected_at: undefined
    } : s));

    try {
      const updatedSample = await apiRequest<any>('/api/v1/accession/reset', {
        method: 'POST',
        body: JSON.stringify({ sampleId })
      });
      setSamples(prev => prev.map(s => s.sample_id === sampleId ? updatedSample : s));
    } catch (err) {
      console.error("Failed to reset sample:", err);
    }
  };

  const saveDraftParameters = async (resultId: string, parameters: ResultParameter[]) => {
    setResultParameters(prev => {
      const paramMap = new Map(parameters.map(p => [p.parameter_id, p]));
      return prev.map(p => paramMap.has(p.parameter_id) ? paramMap.get(p.parameter_id)! : p);
    });

    try {
      const updatedParams = await apiRequest<ResultParameter[]>(`/api/v1/operations/results/${resultId}/draft`, {
        method: 'POST',
        body: JSON.stringify({ parameters })
      });
      setResultParameters(prev => {
        const otherParams = prev.filter(p => p.result_id !== resultId);
        return [...otherParams, ...updatedParams];
      });
    } catch (err) {
      console.error("Failed to save draft parameters:", err);
    }
  };

  const signAndApproveResult = async (resultId: string, parameters: ResultParameter[]) => {
    setResultParameters(prev => {
      const paramMap = new Map(parameters.map(p => [p.parameter_id, p]));
      return prev.map(p => paramMap.has(p.parameter_id) ? paramMap.get(p.parameter_id)! : p);
    });
    
    const formattedDate = new Date().toLocaleDateString('en-GB') + " " + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    setTestResults(prev => prev.map(tr => tr.result_id === resultId ? { ...tr, status: 'Signed' as const, updated_at: formattedDate } : tr));
    
    const tr = testResults.find(r => r.result_id === resultId);
    if (tr) {
      setEncounters(prev => prev.map(e => e.accession_no === tr.accession_no ? { ...e, status: 'Approved' } : e));
    }

    try {
      const updatedResult = await apiRequest<any>(`/api/v1/operations/results/${resultId}/sign`, {
        method: 'POST',
        body: JSON.stringify({ parameters })
      });
      setTestResults(prev => prev.map(r => r.result_id === resultId ? updatedResult : r));
      if (tr) {
        setEncounters(prev => prev.map(e => e.accession_no === tr.accession_no ? { ...e, status: 'Approved' } : e));
      }
    } catch (err) {
      console.error("Failed to sign and approve result:", err);
    }
  };

  const customSetPatientCases = (value: React.SetStateAction<ClinicalPatientCase[]>) => {
    setPatientCases(prev => {
      const next = typeof value === 'function' ? (value as Function)(prev) : value;
      
      next.forEach(async (c: ClinicalPatientCase) => {
        const prevCase = prev.find(p => p.result_id === c.result_id);
        if (!prevCase || JSON.stringify(prevCase) !== JSON.stringify(c)) {
          try {
            const updatedCase = await apiRequest<any>(`/api/v1/operations/cases/${c.result_id}`, {
              method: 'PUT',
              body: JSON.stringify({
                patientCase: {
                  result_id: c.result_id,
                  category: c.category,
                  notes: c.notes,
                  tat_exceeded_hours: c.tat_exceeded_hours,
                  outsource_center: c.outsource_center
                }
              })
            });
            setPatientCases(current => current.map(item => item.result_id === c.result_id ? updatedCase : item));
          } catch (err) {
            console.error("Failed to update patient case:", err);
          }
        }
      });
      return next;
    });
  };

  const addBillSettlement = async (bill: BillSettlement) => {
    setBillSettlements(prev => [bill, ...prev]);
    try {
      const createdBill = await apiRequest<any>('/api/v1/finance/bills', {
        method: 'POST',
        body: JSON.stringify({
          bill_id: bill.bill_id,
          bill_date: bill.bill_date,
          patient_id: bill.patient_details.patient_id,
          referral: bill.referral,
          bill_source: bill.bill_source,
          organisation: bill.organisation,
          bill_amount: bill.bill_amount,
          due_amount: bill.due_amount,
          status: bill.status
        }),
      });
      setBillSettlements(prev => prev.map(b => b.bill_id === bill.bill_id ? createdBill : b));
    } catch (err) {
      console.error("Failed to add bill settlement:", err);
    }
  };

  const updateBillStatus = async (id: string, status: 'Pending' | 'Paid' | 'Cancelled') => {
    setBillSettlements(prev => prev.map(b => b.bill_id === id ? { ...b, status, due_amount: status === 'Paid' ? 0 : b.due_amount } : b));
    try {
      const updatedBill = await apiRequest<any>(`/api/v1/finance/bills/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      setBillSettlements(prev => prev.map(b => b.bill_id === id ? updatedBill : b));
    } catch (err) {
      console.error("Failed to update bill status:", err);
    }
  };

  const addReportPrint = async (report: ReportPrintTracking) => {
    setReportPrints(prev => [report, ...prev]);
    try {
      const createdReport = await apiRequest<any>('/api/v1/finance/reports', {
        method: 'POST',
        body: JSON.stringify(report),
      });
      setReportPrints(prev => prev.map(r => r.report_id === report.report_id ? createdReport : r));
    } catch (err) {
      console.error("Failed to add report print:", err);
    }
  };

  const updateReportPrintStatus = async (id: string, printed: boolean) => {
    const formattedDate = printed ? new Date().toLocaleDateString('en-GB') + " " + new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}) : "";
    setReportPrints(prev => prev.map(r => r.report_id === id ? { ...r, print_status: printed, report_date: formattedDate } : r));
    try {
      const updatedReport = await apiRequest<any>(`/api/v1/finance/reports/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ printStatus: printed })
      });
      setReportPrints(prev => prev.map(r => r.report_id === id ? updatedReport : r));
    } catch (err) {
      console.error("Failed to update report print status:", err);
    }
  };

  const addTestConfig = async (config: TestConfig) => {
    setTestConfigs(prev => [...prev, config]);
    await apiRequest<any>('/api/v1/admin/test-configs', {
      method: 'POST',
      body: JSON.stringify({
        test_code: config.testCode,
        verification_status: config.verificationStatus,
        auto_approval: config.autoApproval
      })
    });
  };

  const updateBillSettings = async (settings: BillSettings) => {
    setBillSettings(settings);
    await apiRequest<any>('/api/v1/admin/bill-settings', {
      method: 'PUT',
      body: JSON.stringify({
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
      })
    });
  };

  const updateInvoiceSettings = async (settings: InvoiceSettings) => {
    setInvoiceSettings(settings);
    await apiRequest<any>('/api/v1/admin/invoice-settings', {
      method: 'PUT',
      body: JSON.stringify({
        header_height: settings.headerHeight,
        footer_height: settings.footerHeight,
        header_image: settings.headerImage,
        footer_image: settings.footerImage,
        invoice_header_flag: settings.invoiceHeaderFlag,
        invoice_footer_flag: settings.invoiceFooterFlag,
        use_bill_level_vat_in_qrcode: settings.useBillLevelVATInQRCode,
        helper_comment: settings.helperComment
      })
    });
  };

  const updateFinancialDashboard = async (stats: FinancialDashboard) => {
    setFinancialDashboard(stats);
    await apiRequest<any>('/api/v1/admin/financial-dashboard', {
      method: 'PUT',
      body: JSON.stringify({
        total_revenue: stats.totalRevenue,
        amount_due: stats.amountDue,
        amount_paid: stats.amountPaid,
        cash_collection: stats.cashCollection,
        online_collection: stats.onlineCollection,
        others_collection: stats.othersCollection,
        average_patient_rating: stats.averagePatientRating,
        total_logins: stats.totalLogins
      })
    });
  };

  const addPriceList = async (list: PriceList) => {
    setPriceLists(prev => [...prev, list]);
    await apiRequest<any>('/api/v1/admin/price-lists', {
      method: 'POST',
      body: JSON.stringify({
        list_name: list.listName,
        list_type: list.listType,
        list_category: list.listCategory,
        status: list.status,
        created_time: list.createdTime
      })
    });
  };

  const updateCenterDetails = async (details: CenterDetails) => {
    setCenterDetails(details);
    await apiRequest<any>('/api/v1/admin/center-details', {
      method: 'PUT',
      body: JSON.stringify({
        lab_name: details.labName,
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
      })
    });
  };

  const updateCenterResources = async (resources: CenterResources) => {
    setCenterResources(resources);
    await apiRequest<any>('/api/v1/admin/center-resources', {
      method: 'PUT',
      body: JSON.stringify({
        lab_name: centerDetails.labName || "DLabs Diagnostics Pvt Ltd (Main HQ)",
        center_logo: resources.centerLogo,
        mobile_header: resources.mobileHeader,
        pdf_header: resources.pdfHeader,
        pdf_footer: resources.pdfFooter,
        bill_header: resources.billHeader
      })
    });
  };

  const addSystemUser = async (user: SystemUser & { password?: string }) => {
    const response = await apiRequest<any>('/api/v1/admin/system-users', {
      method: 'POST',
      body: JSON.stringify({
        username: user.username,
        name: user.name,
        user_role: user.userRole,
        default_login_section: user.defaultLoginSection,
        last_activity: user.lastActivity,
        is_visible: user.isVisible || "yes",
        password: user.password
      })
    });
    if (response) {
      setSystemUsers(prev => [...prev.filter(u => u.username !== user.username), response]);
    }
  };

  const updateSystemUser = async (user: SystemUser & { password?: string }) => {
    const response = await apiRequest<any>(`/api/v1/admin/system-users/${user.username}`, {
      method: 'PUT',
      body: JSON.stringify({
        username: user.username,
        name: user.name,
        user_role: user.userRole,
        default_login_section: user.defaultLoginSection,
        last_activity: user.lastActivity,
        is_visible: user.isVisible || "yes",
        password: user.password
      })
    });
    if (response) {
      setSystemUsers(prev => prev.map(u => u.username === user.username ? response : u));
    }
  };

  const deleteSystemUser = async (username: string) => {
    await apiRequest<any>(`/api/v1/admin/system-users/${username}`, {
      method: 'DELETE'
    });
    setSystemUsers(prev => prev.filter(u => u.username !== username));
  };

  const updateSystemIntegrations = async (integrations: SystemIntegrations) => {
    setSystemIntegrations(integrations);
    await apiRequest<any>('/api/v1/admin/system-integrations', {
      method: 'PUT',
      body: JSON.stringify({
        api_requests_count: integrations.apiRequestsCount,
        webhook_triggers_count: integrations.webhookTriggersCount,
        error_count: integrations.errorCount,
        api_endpoint_filter: integrations.apiEndpointFilter
      })
    });
  };

  const addAppointment = async (appt: Appointment) => {
    setAppointments(prev => [appt, ...prev]);
    await apiRequest<any>('/api/v1/admin/appointments', {
      method: 'POST',
      body: JSON.stringify(appt)
    });
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.appt_id === id ? { ...a, status } : a));
    await apiRequest<any>(`/api/v1/admin/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  };

  const addReferringDoctor = async (doc: ReferringDoctor) => {
    setReferringDoctors(prev => [...prev, doc]);
    await apiRequest<any>('/api/v1/admin/referring-doctors', {
      method: 'POST',
      body: JSON.stringify(doc)
    });
  };

  const addSatelliteCenter = async (center: SatelliteCenter) => {
    setSatelliteCenters(prev => [...prev, center]);
    await apiRequest<any>('/api/v1/admin/satellite-centers', {
      method: 'POST',
      body: JSON.stringify(center)
    });
  };

  const addSampleVialSetting = async (setting: SampleSetting) => {
    try {
      const createdSetting = await apiRequest<SampleSetting>('/api/v1/admin/sample-vial-settings', {
        method: 'POST',
        body: JSON.stringify(setting)
      });
      setSampleVialSettings(prev => [...prev, createdSetting]);
    } catch (err) {
      console.error("Failed to add sample vial setting:", err);
      const srNo = Math.floor(Math.random() * 1000) + 100;
      setSampleVialSettings(prev => [...prev, { ...setting, sr_no: srNo }]);
    }
  };

  const updateSampleVialSetting = async (setting: SampleSetting) => {
    setSampleVialSettings(prev => prev.map(s => s.sr_no === setting.sr_no ? setting : s));
    await apiRequest<any>(`/api/v1/admin/sample-vial-settings/${setting.sr_no}`, {
      method: 'PUT',
      body: JSON.stringify(setting)
    });
  };

  const deleteSampleVialSetting = async (srNo: number) => {
    setSampleVialSettings(prev => prev.filter(s => s.sr_no !== srNo));
    await apiRequest<any>(`/api/v1/admin/sample-vial-settings/${srNo}`, {
      method: 'DELETE'
    });
  };

  const toggleArchivePatient = async (id: string) => {
    setArchivedPatientIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('dlabs_archived_patients', JSON.stringify(next));
      return next;
    });
  };

  const searchGlobal = async (query: string) => {
    if (!query || query.trim().length === 0) return [];
    try {
      return await apiRequest<any[]>(`/api/v1/search?q=${encodeURIComponent(query)}`);
    } catch (err) {
      console.error("Global search failed:", err);
      return [];
    }
  };
  return (
    <AppContext.Provider value={{
      currentUser,
      login,
      logout,
      adminNotifications,
      fetchNotifications,
      markNotificationRead,
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
      updateSystemUser,
      deleteSystemUser,
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
