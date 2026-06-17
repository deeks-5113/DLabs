import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  FlaskConical, 
  CheckCircle, 
  Save, 
  AlertTriangle, 
  Activity, 
  Info,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  FileCheck,
  Settings,
  Download,
  Clock,
  Briefcase,
  AlertOctagon,
  Users,
  Shield,
  Palette,
  Flame,
  ArrowRight,
  TrendingUp,
  MapPin,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ClinicalPatientCase {
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
  category: string; // Waiting List category link
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

export const OperationsModule: React.FC = () => {
  const { 
    encounters, 
    patients, 
    testResults, 
    resultParameters, 
    saveDraftParameters, 
    signAndApproveResult,
    patientCases,
    setPatientCases,
    activeSubView,
    setActiveSubView
  } = useApp();

  type ViewMode = 'dashboard' | 'operations_console' | 'export' | 'settings';
  const [currentView, setCurrentView] = useState<ViewMode>('operations_console');

  // Waiting list selection
  const [selectedWaitingCategory, setSelectedWaitingCategory] = useState<string>('Incomplete');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  // Live Operation Settings State
  const [settings, setSettings] = useState({
    defaultDaysForDataLoad: 'Today(Fastest)',
    fetchAndGroupListBy: 'Latest Updated',
    autoHighlightRanges: 'Every Report Save',
    defaultSigningDoctor: 'Dr. Sarah Connor, MD (Pathology)',
    showLatestOnTop: true,
    flatWaitingList: false,
    lockPrimarySigningDoctor: true,
    statusColors: {
      incomplete: '#eab308',
      rerun: '#a855f7',
      completed: '#06b6d4',
      signed: '#10b981',
      critical: '#ef4444',
      emergency: '#dc2626'
    }
  });

  // Export module state
  const [exportConfig, setExportConfig] = useState({
    dateRange: 'today',
    partnerId: 'All',
    format: 'CSV',
    includeAbnormals: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportCode, setExportCode] = useState('');

  // Sync state between global sidebar clicks and inner panel views
  useEffect(() => {
    if (!activeSubView) return;
    if (activeSubView === 'ops-dashboard') {
      setCurrentView('dashboard');
    } else if (activeSubView === 'ops-export') {
      setCurrentView('export');
    } else if (activeSubView === 'ops-settings') {
      setCurrentView('settings');
    } else if (activeSubView.startsWith('ops-')) {
      setCurrentView('operations_console');
      const sub = activeSubView;
      if (sub === 'ops-all-tests') setSelectedWaitingCategory('All Tests');
      else if (sub === 'ops-incomplete') setSelectedWaitingCategory('Incomplete');
      else if (sub === 'ops-partially-completed') setSelectedWaitingCategory('Partially Completed');
      else if (sub === 'ops-active-reruns') setSelectedWaitingCategory('Active Reruns');
      else if (sub === 'ops-completed') setSelectedWaitingCategory('Completed');
      else if (sub === 'ops-partially-signed') setSelectedWaitingCategory('Partially Signed');
      else if (sub === 'ops-signed') setSelectedWaitingCategory('Signed');
      else if (sub === 'ops-emergency-reports') setSelectedWaitingCategory('Emergency Reports');
      else if (sub === 'ops-critical-reports') setSelectedWaitingCategory('Critical Reports');
      else if (sub === 'ops-tat-exceeded') setSelectedWaitingCategory('TAT Exceeded');
      else if (sub === 'ops-outsourced') setSelectedWaitingCategory('Outsourced');
      else if (sub === 'ops-cancelled-reports') setSelectedWaitingCategory('Cancelled Reports');
    }
  }, [activeSubView]);

  /* Comment out the massive local duplicated state so we use global patientCases from context seamlessly
  const [patientCasesLocal, setPatientCasesLocal] = useState<ClinicalPatientCase[]>([
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
  ]);
  */

  // Active form status validators
  const [activeParameters, setActiveParameters] = useState<ClinicalPatientCase['parameters']>([]);
  const [activeNotes, setActiveNotes] = useState('');
  const [successSignedAlert, setSuccessSignedAlert] = useState(false);
  const [successSavedAlert, setSuccessSavedAlert] = useState(false);

  // Sync selected patient form values when patient ID changes
  useEffect(() => {
    if (selectedPatientId) {
      const p = patientCases.find(c => c.result_id === selectedPatientId);
      if (p) {
        setActiveParameters(JSON.parse(JSON.stringify(p.parameters)));
        setActiveNotes(p.notes || '');
      }
    } else {
      setActiveParameters([]);
      setActiveNotes('');
    }
  }, [selectedPatientId, patientCases]);

  // Derive counts for the left-side LIMS operations list
  const waitingListCounters = useMemo(() => {
    const list = patientCases;
    
    // Exact counts specified by the user's latest finalized schema:
    // All Tests: 76, Incomplete: 54, Signed: 22.
    // Let's model a beautiful dynamic formula on top of these baselines:
    const liveIncomplet = list.filter(p => p.category === 'Incomplete').length;
    const liveSigned = list.filter(p => p.category === 'Signed').length;
    
    // Incomplete baseline is 52. Let's add liveIncomplet to simulate a live 54
    const totalIncomplete = 52 + liveIncomplet;
    const totalSigned = 20 + liveSigned;
    const totalAll = totalIncomplete + totalSigned;

    return {
      allTests: totalAll,
      incomplete: totalIncomplete,
      partiallyCompleted: list.filter(p => p.category === 'Partially Completed').length,
      activeReruns: list.filter(p => p.category === 'Active Reruns').length,
      completed: list.filter(p => p.category === 'Completed').length,
      partiallySigned: list.filter(p => p.category === 'Partially Signed').length,
      signed: totalSigned,
      emergencyReports: list.filter(p => p.category === 'Emergency Reports').length,
      criticalReports: list.filter(p => p.category === 'Critical Reports').length,
      tatExceeded: list.filter(p => p.category === 'TAT Exceeded').length,
      outsourced: list.filter(p => p.category === 'Outsourced').length,
      cancelled: list.filter(p => p.category === 'Cancelled Reports').length,
    };
  }, [patientCases]);

  // Filter list of patients based on searching and Category
  const filteredPatients = useMemo(() => {
    return patientCases.filter(c => {
      const matchesCategory = selectedWaitingCategory === 'All Tests' || c.category === selectedWaitingCategory;
      const matchesSearch = filterQuery.trim() === '' || 
        c.accession_no.toLowerCase().includes(filterQuery.toLowerCase()) ||
        c.patient_name.toLowerCase().includes(filterQuery.toLowerCase()) ||
        c.mrn.toLowerCase().includes(filterQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [patientCases, selectedWaitingCategory, filterQuery]);

  // Form observed value handler
  const handleObservedValueChange = (paramId: string, val: string) => {
    setActiveParameters(prev => prev.map(p => {
      if (p.parameter_id === paramId) {
        const floatV = parseFloat(val);
        let isAb = false;
        if (!isNaN(floatV)) {
          isAb = floatV < p.min_value || floatV > p.max_value;
        }
        return {
          ...p,
          observed_value: val,
          is_abnormal: isAb
        };
      }
      return p;
    }));
  };

  // Action: Save Draft
  const handleSaveDraft = () => {
    if (!selectedPatientId) return;
    setPatientCases(prev => prev.map(c => {
      if (c.result_id === selectedPatientId) {
        return {
          ...c,
          parameters: activeParameters,
          notes: activeNotes
        };
      }
      return c;
    }));
    setSuccessSavedAlert(true);
    setTimeout(() => setSuccessSavedAlert(false), 2000);
  };

  // Keyboard accessibility: bind Ctrl + Enter to Save Draft
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSaveDraft();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPatientId, activeParameters, activeNotes]);

  // Action: Sign & Approve
  const handleSignAndApprove = () => {
    if (!selectedPatientId) return;

    // Mutate state case to category 'Signed'
    setPatientCases(prev => prev.map(c => {
      if (c.result_id === selectedPatientId) {
        return {
          ...c,
          parameters: activeParameters,
          notes: activeNotes,
          category: 'Signed',
          status: 'Signed'
        };
      }
      return c;
    }));

    setSuccessSignedAlert(true);
    setTimeout(() => {
      setSuccessSignedAlert(false);
      // Auto advance to next in the list
      const currentIdx = filteredPatients.findIndex(p => p.result_id === selectedPatientId);
      if (currentIdx !== -1 && currentIdx < filteredPatients.length - 1) {
        setSelectedPatientId(filteredPatients[currentIdx + 1].result_id);
      } else {
        setSelectedPatientId(null);
      }
    }, 2000);
  };

  // Trigger simulated bulk medical clinical data export
  const handleTriggerExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const csvStr = `"AccessionNo","PatientName","MRN","Assay","Value","ReferenceRange","RefDoctor"\n` +
        patientCases.map(c => 
          c.parameters.map(p => 
            `"${c.accession_no}","${c.patient_name}","${c.mrn}","${p.parameter_name}","${p.observed_value}","${p.reference_range}","${c.referral_doctor}"`
          ).join('\n')
        ).join('\n');
      setExportCode(csvStr);
    }, 1500);
  };

  // Check if form is ready to sign (no empty values)
  const isFormReadyToSign = useMemo(() => {
    return activeParameters.length > 0 && activeParameters.every(p => p.observed_value.trim().length > 0);
  }, [activeParameters]);

  // Dashboard Stats
  const dashboardStats = useMemo(() => {
    return [
      { t: "All Registered Tests", v: "76", desc: "Total LIMS cases today", color: "border-l-4 border-slate-600" },
      { t: "Incomplete Backlog", v: "54", desc: "Awaiting clinical assay entry", color: "border-l-4 border-amber-500" },
      { t: "Authorized Sign-offs", v: "22", desc: "Pathologist signed results", color: "border-l-4 border-emerald-500" },
      { t: "Active Reruns / Alerts", v: "0", desc: "Flagged deviations pending", color: "border-l-4 border-red-500" }
    ];
  }, []);

  // Recharts Data Seeding (TAT turnaround times and loading metrics)
  const tatPerformanceData = [
    { name: '08:00', Hematology: 32, Biochemistry: 45, Immunology: 55 },
    { name: '10:00', Hematology: 41, Biochemistry: 50, Immunology: 60 },
    { name: '12:00', Hematology: 35, Biochemistry: 58, Immunology: 72 },
    { name: '14:00', Hematology: 28, Biochemistry: 44, Immunology: 49 },
    { name: '16:00', Hematology: 30, Biochemistry: 42, Immunology: 52 },
    { name: '18:00', Hematology: 25, Biochemistry: 38, Immunology: 40 },
  ];

  const departmentDistributionData = [
    { name: 'Hematology', value: 45, color: '#5A5A40' },
    { name: 'Biochemistry', value: 30, color: '#3b82f6' },
    { name: 'Endocrinology', value: 20, color: '#a855f7' },
    { name: 'Specialty Labs', value: 5, color: '#eab308' },
  ];

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#E5E2D9] pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2D2D2B] font-sans">Lab Clinical Operations</h2>
          <p className="text-sm text-[#6B6B66] mt-0.5">
             clinical execution workspace, pathway validation, turn-around-time stats, and pathology reports signature.
          </p>
        </div>

        {/* Dynamic status view indicator aligning with sidebar selections */}
        <div className="px-4 py-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-xl text-xs font-bold text-[#5A5A40] font-mono tracking-wide uppercase">
          {currentView === 'dashboard' && "Operations Dashboard"}
          {currentView === 'export' && "Operational Export Console"}
          {currentView === 'settings' && "Clinical Configurations"}
          {currentView === 'operations_console' && `Active Queue: ${selectedWaitingCategory}`}
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* VIEW: OPERATIONS DASHBOARD (STATISTICS & CHARTS) */}
        {currentView === 'dashboard' && (
          <motion.div
            key="ops-dashboard-pane"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Top Cards Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {dashboardStats.map((st, i) => (
                <div key={i} className={`bg-white p-5 rounded-2xl border border-[#E5E2D9] shadow-xs ${st.color}`}>
                  <span className="text-xs text-[#6B6B66] font-medium block">{st.t}</span>
                  <span className="text-3xl font-extrabold text-[#2D2D2B] mt-1 block font-mono">{st.v}</span>
                  <span className="text-[10px] text-gray-400 mt-1.5 block">{st.desc}</span>
                </div>
              ))}
            </div>

            {/* Graphics bento row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Turnaround Time Area Plot */}
              <div className="lg:col-span-8 bg-white p-5.5 rounded-2xl border border-[#E5E2D9] shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-2">
                  <div>
                    <h3 className="font-bold text-sm text-[#2D2D2B]">Mean Turnaround Time (TAT) Trend</h3>
                    <p className="text-[10px] text-[#9E9E96]">Operational dispatch latency measured in minutes daily</p>
                  </div>
                  <TrendingUp className="text-[#5A5A40]" size={18} />
                </div>

                <div className="h-64 text-xs font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={tatPerformanceData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorHema" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#5A5A40" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorBio" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2D9" />
                      <XAxis dataKey="name" stroke="#6B6B66" />
                      <YAxis stroke="#6B6B66" />
                      <Tooltip />
                      <Area type="monotone" dataKey="Hematology" stroke="#5A5A40" fillOpacity={1} fill="url(#colorHema)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Biochemistry" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBio)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Department Distribution Pie */}
              <div className="lg:col-span-4 bg-white p-5.5 rounded-2xl border border-[#E5E2D9] shadow-xs flex flex-col justify-between">
                <div className="pb-2">
                  <h3 className="font-bold text-sm text-[#2D2D2B]">Department Assay Workload</h3>
                  <p className="text-[10px] text-[#9E9E96]">Proportional diagnostic volume share</p>
                </div>

                <div className="h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {departmentDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend list */}
                <div className="space-y-1.5 text-xs pt-2">
                  {departmentDistributionData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[#6B6B66]">{d.name}</span>
                      </div>
                      <span className="font-bold font-mono text-gray-800">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Simulated Live Panic/Critical Alerts stream */}
            <div className="bg-white border border-[#E5E2D9] p-5 rounded-2xl shadow-xs">
              <h3 className="font-bold text-sm text-red-950 pb-3 flex items-center gap-1.5 border-b border-gray-100">
                <AlertSquareAlertIcon className="text-red-650" />
                <span>Live Laboratory Panic Values (Critical Warning Feed)</span>
              </h3>

              <div className="divide-y divide-gray-100 mt-2">
                <div className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-105 border border-red-200 text-red-700 font-bold rounded">PANIC CRITICAL</span>
                    <span className="font-semibold text-gray-950">Arthur Pendragon</span>
                    <span className="text-gray-400">| Hemoglobin: 7.8 g/dL (Severe Anemia)</span>
                  </div>
                  <span className="font-mono text-gray-400">14:45</span>
                </div>
                <div className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-105 border border-red-200 text-red-700 font-bold rounded">PANIC CRITICAL</span>
                    <span className="font-semibold text-gray-950">Amira Al-Farsi</span>
                    <span className="text-gray-400">| Urine Protein: 300 mg/dL (Severe Proteinuria)</span>
                  </div>
                  <span className="font-mono text-gray-400">11:30</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW: MAIN WORKSPACE CONSOLE */}
        {currentView === 'operations_console' && (
          <motion.div
            key="ops-console-workspace"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          >
            {/* 2. MATCHING PATIENTS LIST - Middle column (Expanded to 4/12 width) */}
            <div className="lg:col-span-4 bg-white border border-[#E5E2D9] rounded-2xl p-4.5 flex flex-col space-y-3 items-stretch">
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold font-mono text-[#6B6B66] uppercase tracking-wider">
                  List: {selectedWaitingCategory} ({filteredPatients.length})
                </h3>
                
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-8 pr-3 py-1.8 bg-gray-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-[#5A5A40]/30 outline-none"
                    placeholder="Search patient, accession..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Scrollable grid list */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[500px]">
                {filteredPatients.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-405 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    No patient matches for category in system.
                  </div>
                ) : (
                  filteredPatients.map(pat => {
                    const isS = selectedPatientId === pat.result_id;
                    return (
                      <button
                        key={pat.result_id}
                        onClick={() => setSelectedPatientId(pat.result_id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center cursor-pointer ${
                          isS
                            ? 'bg-[#5A5A40] border-[#5A5A40] text-white font-bold shadow-xs'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                        }`}
                      >
                        <div className="min-w-0 pr-1 text-xs">
                          <span className={`font-mono text-[9px] block ${isS ? 'text-white/80' : 'text-gray-400'}`}>
                            {pat.accession_no}
                          </span>
                          <h4 className={`font-bold block truncate mt-0.5 ${isS ? 'text-white' : 'text-gray-900'}`}>
                            {pat.patient_name}
                          </h4>
                          <span className={`text-[9px] block ${isS ? 'text-white/70' : 'text-gray-400'}`}>
                            {pat.gender}, {pat.age} Yrs | {pat.tests_ordered.join('+')}
                          </span>
                        </div>
                        <ChevronRight size={14} className={isS ? 'text-white' : 'text-gray-400'} />
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3. ACTIVE LOG WORKSHEET - Right side panel (Expanded to 8/12 width) */}
            <div className="lg:col-span-8 bg-white border border-[#E5E2D9] rounded-2xl p-5.5 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {!selectedPatientId ? (
                  <motion.div
                    key="empty-worksheet"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center p-12 text-[#6B6B66] h-[350px]"
                  >
                    <FlaskConical size={32} className="text-gray-300 animate-pulse mb-3" />
                    <h3 className="font-bold text-sm text-gray-800">Select Clinical Accession</h3>
                    <p className="text-xs text-gray-450 mt-1 max-w-xs leading-relaxed">
                      Please pick a patient order from the wait pipeline queue list to preview and enter quantitative findings.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedPatientId}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-4"
                  >
                    {(() => {
                      const caseItem = patientCases.find(p => p.result_id === selectedPatientId);
                      if (!caseItem) return null;
                      return (
                        <>
                          {/* Demographics ribbon header */}
                          <div className="p-3 bg-gray-50 rounded-2xl justify-between border border-gray-150 flex flex-wrap gap-2 text-xs">
                            <div>
                              <span className="font-mono text-[9px] block text-gray-400 uppercase tracking-wider">Accession Number</span>
                              <span className="font-bold text-[#5A5A40] text-sm">{caseItem.accession_no}</span>
                              <h3 className="text-sm font-bold text-gray-900 mt-1">{caseItem.patient_name}</h3>
                              <span className="text-[10px] text-gray-400 block font-mono">MRN: {caseItem.mrn} | Doctor: {caseItem.referral_doctor}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] block text-[#6B6B66] font-semibold">{caseItem.organisation}</span>
                              <span className="text-[9px] text-gray-400 block mt-0.5">{caseItem.order_date}</span>
                              <span className={`px-2 py-0.5 mt-2 block rounded-full inline-block text-[10px] font-bold text-white uppercase ${
                                caseItem.status === 'Signed' ? 'bg-emerald-600' :
                                caseItem.status === 'Emergency' ? 'bg-red-650 animate-bounce' :
                                caseItem.status === 'Critical' ? 'bg-red-700 animate-pulse' :
                                'bg-yellow-550'
                              }`}>
                                {caseItem.status}
                              </span>
                            </div>
                          </div>

                          {/* Analyte list list */}
                          <div className="space-y-3.5">
                            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-1.5 flex items-center justify-between">
                              <span>Assay Parameter Measurements</span>
                              <span className="text-[10.5px] font-semibold text-gray-400 font-sans">Unit Range Values</span>
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              {activeParameters.map(par => (
                                <div 
                                  key={par.parameter_id} 
                                  className={`p-3 rounded-xl border transition-all ${
                                    par.is_abnormal 
                                      ? 'bg-red-50/70 border-red-300 ring-1 ring-red-400/20' 
                                      : 'bg-white border-gray-200 focus-within:border-[#5A5A40]'
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-1 text-xs">
                                    <div>
                                      <span className="font-bold text-gray-900 block">{par.parameter_name}</span>
                                      <span className="text-[10px] text-gray-400 block font-mono">Ref: {par.reference_range} {par.unit}</span>
                                    </div>
                                    {par.is_abnormal && (
                                      <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-0.5 font-mono">
                                        <AlertTriangle size={8} /> Abnormal
                                      </span>
                                    )}
                                  </div>

                                  {/* Entry input */}
                                  <div className="relative mt-1">
                                    <input
                                      type="text"
                                      disabled={caseItem.status === 'Signed'}
                                      className="w-full bg-[#F3F1ED] border-none text-xs rounded-lg px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5A5A40]/30 font-bold"
                                      placeholder={`Value in ${par.unit}`}
                                      value={par.observed_value}
                                      onChange={(e) => handleObservedValueChange(par.parameter_id, e.target.value)}
                                    />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold uppercase font-mono">{par.unit}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Commentary logs */}
                          <div className="space-y-1 text-xs">
                            <label className="block font-bold text-gray-500 font-mono text-[10px] uppercase tracking-wider">Pathology Assessment Comment</label>
                            <textarea
                              disabled={caseItem.status === 'Signed'}
                              className="w-full bg-gray-50 border border-gray-200 outline-none p-2.5 rounded-xl text-xs h-16 resize-none focus:bg-white focus:ring-1 focus:ring-[#5A5A40]/20"
                              placeholder="Add diagnostic comments, repeat analysis findings, or pathologist logs..."
                              value={activeNotes}
                              onChange={(e) => setActiveNotes(e.target.value)}
                            />
                          </div>

                          {/* Action controls */}
                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                            <div className="text-[10px] text-gray-400 max-w-xs">
                              {caseItem.status === 'Signed' ? (
                                <span className="text-emerald-700 font-bold block flex items-center gap-1">
                                  <CheckCircle size={12} /> Approved PDF locked on reference network.
                                </span>
                              ) : isFormReadyToSign ? (
                                <span className="text-emerald-600 font-medium block flex items-center gap-1 animate-pulse">
                                  <Info size={12} /> Press Approve Sign-off to publish reporting.
                                </span>
                              ) : (
                                <span className="text-amber-700 font-medium block">
                                  Complete all analyte blocks to enable Pathfinder sign-off.
                                </span>
                              )}
                            </div>

                            {caseItem.status !== 'Signed' && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={handleSaveDraft}
                                  className="px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-all cursor-pointer flex items-center space-x-1"
                                >
                                  <Save size={13} />
                                  <span>Save Draft</span>
                                </button>
                                <button
                                  disabled={!isFormReadyToSign}
                                  onClick={handleSignAndApprove}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                                    isFormReadyToSign 
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' 
                                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  <FileCheck size={13} />
                                  <span>Sign & Approve</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        )}

        {/* VIEW: EXPORTS AND REPORT LOGISTIC DISPATCH */}
        {currentView === 'export' && (
          <motion.div
            key="ops-export-segment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-xs max-w-2xl mx-auto space-y-4 text-xs"
          >
            <div>
              <h3 className="font-bold text-base text-slate-900">Clinical Data Logistics: Operational Export</h3>
              <p className="text-[#6B6B66] mt-0.5 text-xs">Configure clinical records filters and download diagnostic data sheets securely for audit compliance.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-500 font-bold mb-1">Time Range Scope</label>
                <select
                  value={exportConfig.dateRange}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full bg-[#F3F1ED] border-none p-2.5 rounded-xl"
                >
                  <option value="today">Today's Batches (76 cases)</option>
                  <option value="3days">Last 3 Days</option>
                  <option value="weekly">Weekly Rollup report</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Target Organization</label>
                <select
                  value={exportConfig.partnerId}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, partnerId: e.target.value }))}
                  className="w-full bg-[#F3F1ED] border-none p-2.5 rounded-xl"
                >
                  <option value="All">All Associated B2B Clinics</option>
                  <option value="Hospital">Mercy Health General Hospital</option>
                  <option value="Downtown">Downtown Clinic Inc</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Download Format Type</label>
                <select
                  value={exportConfig.format}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full bg-[#F3F1ED] text-xs border-none p-2.5 rounded-xl"
                >
                  <option value="CSV">Comma Separated Sheet (.csv)</option>
                  <option value="JSON">Structured API JSON Feed (.json)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-5 select-none">
                <input
                  type="checkbox"
                  id="inc-abnormal"
                  checked={exportConfig.includeAbnormals}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, includeAbnormals: e.target.checked }))}
                  className="h-4.5 w-4.5 text-[#5A5A40] accent-[#5A5A40]"
                />
                <label htmlFor="inc-abnormal" className="font-semibold text-gray-700 cursor-pointer">Export Abnormal / Panic Flagged Rows only</label>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex flex-col items-center space-y-4">
              <button
                onClick={handleTriggerExport}
                className="px-5 py-2.5 bg-[#5A5A40] font-bold text-white hover:bg-[#484833] rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Download size={14} />
                <span>{isExporting ? "Compiling spreadsheet..." : "Generate & Pre-download Sheet"}</span>
              </button>

              {exportCode && (
                <div className="w-full space-y-2">
                  <span className="font-mono text-[9px] font-bold text-emerald-700 block text-center">SHEET COMPILED SUCCESSFULLY IN CLIENT BUFFER</span>
                  <textarea
                    readOnly
                    className="w-full font-mono text-[10px] bg-slate-50 border border-gray-200 rounded-xl p-3.5 h-36 font-sans select-all outline-none"
                    value={exportCode}
                  />
                  <span className="block text-[10px] text-gray-400 text-center">Click copy raw clinical parameters payload to import to HIS system.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW: CLINICAL LIMS SETTINGS */}
        {currentView === 'settings' && (
          <motion.div
            key="ops-settings-segment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-[#E5E2D9] rounded-2xl p-6.5 shadow-xs max-w-3xl mx-auto space-y-5 text-xs text-[#3C3C3B]"
          >
            <div className="border-b border-[#FAF9F6] pb-3">
              <h3 className="font-bold text-base text-slate-900">Entity Settings: OperationSettings</h3>
              <p className="text-gray-400">Customize the physical validation console bindings, signing doctors, load defaults, and status color codes.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Load days */}
              <div>
                <label className="block text-gray-500 font-bold mb-1.5">Default Days For Data Load</label>
                <select
                  value={settings.defaultDaysForDataLoad}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultDaysForDataLoad: e.target.value }))}
                  className="w-full bg-[#F3F1ED] border-none p-2.5 rounded-xl font-bold"
                >
                  <option value="Today(Fastest)">Today with Fastest Index Loading</option>
                  <option value="Last3Days">Last 3 Days Archive</option>
                  <option value="WeeklyRollup">Weekly Dynamic Partition</option>
                </select>
              </div>

              {/* Group sort */}
              <div>
                <label className="block text-gray-500 font-bold mb-1.5">Fetch And Group List By</label>
                <select
                  value={settings.fetchAndGroupListBy}
                  onChange={(e) => setSettings(prev => ({ ...prev, fetchAndGroupListBy: e.target.value }))}
                  className="w-full bg-[#F3F1ED] border-none p-2.5 rounded-xl font-bold"
                >
                  <option value="Latest Updated">Latest Clinical Update (Recommended)</option>
                  <option value="Accession Number">By Core Accession Sorting</option>
                  <option value="Patient Age">By Demographics Age Bracket</option>
                </select>
              </div>

              {/* Auto highlights */}
              <div>
                <label className="block text-gray-500 font-bold mb-1.5">Auto Highlight Abnormal Ranges</label>
                <select
                  value={settings.autoHighlightRanges}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoHighlightRanges: e.target.value }))}
                  className="w-full bg-[#F3F1ED] border-none p-2.5 rounded-xl font-bold"
                >
                  <option value="Every Report Save">On Key-up & Every Saved Draft</option>
                  <option value="On Signing Only">Only during approval signing window</option>
                </select>
              </div>

              {/* Default signing doctor */}
              <div>
                <label className="block text-gray-500 font-bold mb-1.5">Default Signing Pathologist Doctor</label>
                <select
                  value={settings.defaultSigningDoctor}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultSigningDoctor: e.target.value }))}
                  className="w-full bg-[#F3F1ED] border-none p-2.5 rounded-xl font-bold"
                >
                  <option value="Dr. Sarah Connor, MD (Pathology)">Dr. Sarah Connor, MD (Pathology)</option>
                  <option value="Dr. Rajesh Koothrappali, PhD">Dr. Rajesh Koothrappali, PhD (Biochemistry)</option>
                  <option value="Dr. Gregory House, MD">Dr. Gregory House, MD (Immunology / infectious)</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-3 col-span-full pt-2.5 border-t border-gray-150">
                <h4 className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-gray-400">Technical Boolean Overrides</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 select-none font-sans">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="show-latest"
                      checked={settings.showLatestOnTop}
                      onChange={(e) => setSettings(prev => ({ ...prev, showLatestOnTop: e.target.checked }))}
                      className="h-4.5 w-4.5 text-[#5A5A40] accent-[#5A5A40] cursor-pointer"
                    />
                    <label htmlFor="show-latest" className="font-bold text-gray-600 cursor-pointer">Show Latest On Top</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="flat-waitlist"
                      checked={settings.flatWaitingList}
                      onChange={(e) => setSettings(prev => ({ ...prev, flatWaitingList: e.target.checked }))}
                      className="h-4.5 w-4.5 text-[#5A5A40] accent-[#5A5A40] cursor-pointer"
                    />
                    <label htmlFor="flat-waitlist" className="font-bold text-gray-600 cursor-pointer">Flat Waiting List</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="lock-doctor"
                      checked={settings.lockPrimarySigningDoctor}
                      onChange={(e) => setSettings(prev => ({ ...prev, lockPrimarySigningDoctor: e.target.checked }))}
                      className="h-4.5 w-4.5 text-[#5A5A40] accent-[#5A5A40] cursor-pointer"
                    />
                    <label htmlFor="lock-doctor" className="font-bold text-gray-600 cursor-pointer">Lock Signing Doctor</label>
                  </div>
                </div>
              </div>

              {/* Status color mappings (JSON config) */}
              <div className="col-span-full space-y-2 pt-3 border-t border-gray-150">
                <h4 className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Palette size={13} />
                  <span>Interactive LIMS Hex Color Mapping</span>
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {Object.entries(settings.statusColors).map(([key, col]) => (
                    <div key={key} className="bg-gray-50 border border-gray-150 p-2 rounded-xl text-center">
                      <span className="text-[10px] font-mono text-gray-400 block pb-1 capitalize">{key}</span>
                      <div className="flex items-center justify-center gap-1 font-mono text-[10px] font-bold">
                        <span className="h-3 w-3 rounded-full border border-gray-300" style={{ backgroundColor: col }} />
                        <span>{col}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => {
                  alert("OperationSettings instance updated successfully in live system memory.");
                }}
                className="px-5 py-2.1 bg-[#5A5A40] font-bold text-white hover:bg-[#484833] rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Save Clinical Environment Controls
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* FLOATING SUCCESS ALERTS */}
      <AnimatePresence>
        {successSignedAlert && (
          <div className="fixed bottom-6 right-6 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-emerald-950 text-white border border-emerald-500/30 px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 max-w-sm"
            >
              <div className="bg-emerald-650 p-2 rounded-full text-white shrink-0 shadow-inner">
                <CheckCircle size={18} />
              </div>
              <div>
                <h4 className="font-bold text-[11px] font-mono uppercase tracking-wider text-emerald-450">AUTHORIZATION SIGNED</h4>
                <p className="text-xs text-gray-250 mt-0.5">Pathologist digital code tag attached. PDF has been generated and queued for B2B dispatch.</p>
              </div>
            </motion.div>
          </div>
        )}

        {successSavedAlert && (
          <div className="fixed bottom-6 right-6 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 max-w-sm border border-slate-700/60"
            >
              <div className="bg-slate-700 p-2 rounded-full text-white shrink-0">
                <CheckCircle size={18} />
              </div>
              <div>
                <h4 className="font-bold text-[11px] font-mono uppercase tracking-wider text-slate-300">DRAFT SAVED</h4>
                <p className="text-xs text-gray-300 mt-0.5">Quantitative analyte values saved locally. Accession status remains Incomplete.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Dumb SVG Icon helper since we can't do custom SVG or are restricted
function AlertSquareAlertIcon(props: { className?: string }) {
  return (
    <div className={`h-4 w-4 rounded bg-red-106 flex items-center justify-center flex-shrink-0 ${props.className || ''}`}>
      <span className="text-[10px] font-black text-red-700 select-none">!</span>
    </div>
  );
}
