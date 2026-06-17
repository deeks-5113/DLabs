import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Barcode, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  ClipboardList, 
  RotateCcw, 
  Printer, 
  Trash2, 
  X, 
  AlertOctagon,
  Settings,
  Plus,
  Edit2,
  SlidersHorizontal,
  Filter,
  CheckCircle2,
  Calendar,
  Building,
  User,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SampleSetting {
  sr_no: number;
  sample_name: string;
  sample_type: string;
  container_type: string;
}

export const AccessionModule: React.FC = () => {
  const { 
    encounters, 
    patients, 
    samples, 
    collectSample, 
    bulkCollectSamplesForAccession, 
    rejectSample, 
    resetRejectedSampleToPending,
    b2bPartners,
    systemUsers,
    activeSubView,
    setActiveSubView
  } = useApp();

  type AccessionTab = 'pending_accession' | 'pending_collection' | 'accessed' | 'rejected' | 'settings';
  
  const activeTab = useMemo<AccessionTab>(() => {
    if (activeSubView === 'accession-pending-collection') return 'pending_collection';
    if (activeSubView === 'accession-accessed') return 'accessed';
    if (activeSubView === 'accession-rejected') return 'rejected';
    if (activeSubView === 'accession-settings') return 'settings';
    return 'pending_accession';
  }, [activeSubView]);

  const setActiveTab = (tab: AccessionTab) => {
    if (tab === 'pending_accession') setActiveSubView('accession-pending-accession');
    else if (tab === 'pending_collection') setActiveSubView('accession-pending-collection');
    else if (tab === 'accessed') setActiveSubView('accession-accessed');
    else if (tab === 'rejected') setActiveSubView('accession-rejected');
    else if (tab === 'settings') setActiveSubView('accession-settings');
  };

  // Multi-Filter Panel State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedPartner, setSelectedPartner] = useState('All');
  const [selectedSampleType, setSelectedSampleType] = useState('All');
  const [selectedBilledBy, setSelectedBilledBy] = useState('All');
  const [collectionStatusFilter, setCollectionStatusFilter] = useState<'All' | 'Not Collected' | 'Collected Only'>('All');

  // Sample Settings Local State (CRUD)
  const [sampleSettings, setSampleSettings] = useState<SampleSetting[]>([
    { sr_no: 1, sample_name: "EDTA Whole Blood", sample_type: "EDTA", container_type: "Lavender Vacuum Tube" },
    { sr_no: 2, sample_name: "Serum Separator SST", sample_type: "Serum", container_type: "Gold/Yellow Vacuum Tube" },
    { sr_no: 3, sample_name: "Sterile Midstream Urine", sample_type: "Urine", container_type: "Sterile Collector Container" },
    { sr_no: 4, sample_name: "Sodium Citrate Coagulation", sample_type: "Plasma", container_type: "Light Blue Vacuum Tube" },
    { sr_no: 5, sample_name: "Heparinised Plasma", sample_type: "Plasma", container_type: "Green Tube" },
    { sr_no: 6, sample_name: "Nasopharyngeal Swab", sample_type: "Swab", container_type: "Transport Media Swab" }
  ]);

  const [editingSettingIdx, setEditingSettingIdx] = useState<number | null>(null);
  const [editSampleName, setEditSampleName] = useState('');
  const [editSampleType, setEditSampleType] = useState('EDTA');
  const [editContainerType, setEditContainerType] = useState('');
  const [isAddingSetting, setIsAddingSetting] = useState(false);

  // Rejection Dialog Tracking
  const [rejectingSampleId, setRejectingSampleId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Hemolyzed Specimen (Red Cell Lysate)');
  const [customRejectionReason, setCustomRejectionReason] = useState('');
  
  // Zebra Print Simulation State
  const [showBarcodePrintModal, setShowBarcodePrintModal] = useState<string | null>(null);
  const [printedStamp, setPrintedStamp] = useState<string>('');

  const standardRejectionReasons = [
    "Hemolyzed Specimen (Red Cell Lysate)",
    "Clotted blood in EDTA violet tube",
    "Quantity Insufficient (QNS) for parsing",
    "Lipemic Serum / Chylous specimen",
    "Incorrect tube / Container contaminated",
    "Spillage / Improper physical sealing",
    "Mismatched Client Label Credentials"
  ];

  // Helper: Retrieve patient/encounter records connected to an accession_no
  const getPatientForAccession = (accNo: string) => {
    const enc = encounters.find(e => e.accession_no === accNo);
    if (!enc) return { name: "Direct Walk-In", encounter: null, patient: null };
    const pt = patients.find(p => p.patient_id === enc.patient_id);
    return {
      name: pt ? pt.patient_name : "Direct Walk-In",
      encounter: enc,
      patient: pt
    };
  };

  // State-Based Filter logic depending on standard lists
  const pendingAccessionList = useMemo(() => {
    // Registered orders pending primary check-in/label authorization: Encounter status = "Pending Accession"
    const pendingEncounters = encounters.filter(e => e.status === 'Pending Accession');
    return pendingEncounters.map(e => {
      const { name, patient } = getPatientForAccession(e.accession_no);
      const accNoSamples = samples.filter(s => s.accession_no === e.accession_no);
      return {
        encounter: e,
        accession_no: e.accession_no,
        patientName: name,
        patient,
        samples: accNoSamples
      };
    });
  }, [encounters, samples]);

  const pendingCollectionList = useMemo(() => {
    // Group samples by Accession number where sample status is "Pending Collection"
    const pendingSmp = samples.filter(s => s.status === 'Pending Collection');
    const groups: Record<string, typeof pendingSmp> = {};
    pendingSmp.forEach(s => {
      if (!groups[s.accession_no]) groups[s.accession_no] = [];
      groups[s.accession_no].push(s);
    });

    return Object.entries(groups).map(([accNo, smps]) => {
      const { name, encounter, patient } = getPatientForAccession(accNo);
      return {
        accession_no: accNo,
        patientName: name,
        encounter,
        patient,
        samples: smps
      };
    });
  }, [samples, encounters]);

  const accessedSpecimensList = useMemo(() => {
    // List samples where status === "Accessed" (Received/Barcode generated)
    return samples.filter(s => s.status === 'Accessed');
  }, [samples]);

  const rejectedSpecimensList = useMemo(() => {
    // List samples where status === "Rejected"
    return samples.filter(s => s.status === 'Rejected');
  }, [samples]);

  // COMBINED FILTER ENG: Apply Global search and advanced dropdown criteria
  const filteredPendingAccession = useMemo(() => {
    return pendingAccessionList.filter(item => {
      // Global query match (Name, Accession, ID, MRN, Birth)
      const matchesSearch = searchQuery.trim() === '' || 
        item.accession_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.patient?.mrn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.patient?.national_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.patient?.date_of_birth || '').includes(searchQuery);

      // Department Match (Derived from its ordered tests)
      const matchesDept = selectedDepartment === 'All' || (item.encounter?.tests_ordered || []).some(t => {
        // Basic department categorization check
        const code = t.toUpperCase();
        if (selectedDepartment === 'Hematology' && code === 'CBC') return true;
        if (selectedDepartment === 'Biochemistry' && ['HBA1C', 'LIPID', 'LFT', 'KFT'].includes(code)) return true;
        if (selectedDepartment === 'Endocrinology' && code === 'TSH') return true;
        if (selectedDepartment === 'Clinical Pathology' && code === 'URINE') return true;
        return false;
      });

      // B2B Partner Match
      const matchesPartner = selectedPartner === 'All' || item.encounter?.partner_id === selectedPartner;

      // Sample tube match
      const matchesSample = selectedSampleType === 'All' || item.samples.some(s => s.sample_type.toUpperCase() === selectedSampleType.toUpperCase());

      // Filter: Collection Status
      const matchesColStatus = collectionStatusFilter === 'All' || 
        (collectionStatusFilter === 'Not Collected' && item.samples.some(s => s.status === 'Pending Collection')) ||
        (collectionStatusFilter === 'Collected Only' && item.samples.every(s => s.status === 'Accessed'));

      return matchesSearch && matchesDept && matchesPartner && matchesSample && matchesColStatus;
    });
  }, [pendingAccessionList, searchQuery, selectedDepartment, selectedPartner, selectedSampleType, collectionStatusFilter]);

  const filteredPendingCollection = useMemo(() => {
    return pendingCollectionList.filter(item => {
      const matchesSearch = searchQuery.trim() === '' || 
        item.accession_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.patient?.mrn || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPartner = selectedPartner === 'All' || item.encounter?.partner_id === selectedPartner;
      const matchesSample = selectedSampleType === 'All' || item.samples.some(s => s.sample_type.toUpperCase() === selectedSampleType.toUpperCase());

      return matchesSearch && matchesPartner && matchesSample;
    });
  }, [pendingCollectionList, searchQuery, selectedPartner, selectedSampleType]);

  const filteredAccessed = useMemo(() => {
    return accessedSpecimensList.filter(sample => {
      const patientInfo = getPatientForAccession(sample.accession_no);
      const matchesSearch = searchQuery.trim() === '' || 
        sample.accession_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sample.barcode_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        patientInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patientInfo.patient?.mrn || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSample = selectedSampleType === 'All' || sample.sample_type.toUpperCase() === selectedSampleType.toUpperCase();
      const matchesPartner = selectedPartner === 'All' || patientInfo.encounter?.partner_id === selectedPartner;

      return matchesSearch && matchesSample && matchesPartner;
    });
  }, [accessedSpecimensList, searchQuery, selectedSampleType, selectedPartner]);

  const filteredExceptions = useMemo(() => {
    return rejectedSpecimensList.filter(sample => {
      const patientInfo = getPatientForAccession(sample.accession_no);
      const matchesSearch = searchQuery.trim() === '' || 
        sample.accession_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patientInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sample.rejection_reason || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [rejectedSpecimensList, searchQuery]);

  // State trigger to digitally Receive/Check-In specimen manually
  const triggerManualReceive = (sampleId: string) => {
    const s = samples.find(itm => itm.sample_id === sampleId);
    if (!s) return;
    const computedBarcode = s.barcode_number || `BC-RCV-${s.accession_no}-${s.sample_type.toUpperCase()}`;
    collectSample(sampleId, computedBarcode);
  };

  const triggerBulkReceive = (accessionNo: string) => {
    bulkCollectSamplesForAccession(accessionNo);
  };

  const handleOpenRejection = (sampleId: string) => {
    setRejectingSampleId(sampleId);
    setRejectionReason(standardRejectionReasons[0]);
    setCustomRejectionReason('');
  };

  const handleCommitRejection = () => {
    if (!rejectingSampleId) return;
    const finalReason = rejectionReason === "Other" && customRejectionReason.trim()
      ? customRejectionReason
      : rejectionReason;
    
    rejectSample(rejectingSampleId, finalReason);
    setRejectingSampleId(null);
  };

  // Sample type Settings modifiers
  const handleAddSampleSetting = () => {
    const nextSr = sampleSettings.length > 0 ? Math.max(...sampleSettings.map(s => s.sr_no)) + 1 : 1;
    const newS: SampleSetting = {
      sr_no: nextSr,
      sample_name: editSampleName.trim() || `New Assay Tube Setup`,
      sample_type: editSampleType,
      container_type: editContainerType.trim() || "Clear PET Additive Specimen Vial"
    };
    setSampleSettings(prev => [...prev, newS]);
    setEditSampleName('');
    setEditContainerType('');
    setIsAddingSetting(false);
  };

  const handleEditSampleSetting = (index: number) => {
    const s = sampleSettings[index];
    setEditingSettingIdx(index);
    setEditSampleName(s.sample_name);
    setEditSampleType(s.sample_type);
    setEditContainerType(s.container_type);
  };

  const handleSaveSampleSetting = () => {
    if (editingSettingIdx === null) return;
    setSampleSettings(prev => prev.map((s, idx) => idx === editingSettingIdx ? {
      ...s,
      sample_name: editSampleName.trim(),
      sample_type: editSampleType,
      container_type: editContainerType.trim()
    } : s));
    setEditingSettingIdx(null);
    setEditSampleName('');
    setEditContainerType('');
  };

  const handleDeleteSampleSetting = (srNo: number) => {
    setSampleSettings(prev => prev.filter(s => s.sr_no !== srNo));
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#E5E2D9] pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2D2D2B] font-sans">Physical Specimen Accessioning</h2>
          <p className="text-sm text-[#6B6B66] mt-1">
            Assign unique LIMS barcoding tags, manage phlebotomy draws, log floor Redraws, and configure specimen vials.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-1.5 rounded-full font-mono font-semibold flex items-center space-x-1.5">
            <span className="h-2 w-2 bg-amber-500 rounded-full animate-ping" />
            <span>Pending collection: <strong>{samples.filter(s => s.status === 'Pending Collection').length}</strong></span>
          </div>
          <div className="bg-[#FAF9F6] border border-[#E5E2D9] text-[#6B6B66] px-3.5 py-1.5 rounded-full font-mono">
            Accessed tubes: <strong>{samples.filter(s => s.status === 'Accessed').length}</strong>
          </div>
        </div>
      </div>

      {/* Persistent Accession Sub-Navigation Ribbons */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Navigation title label aligned with sidebar selection */}
        <div className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider font-mono">
          {activeTab === 'pending_accession' && "Pending Accession"}
          {activeTab === 'pending_collection' && "Specimens Pending Collection"}
          {activeTab === 'accessed' && "Accessed Specimens List"}
          {activeTab === 'rejected' && "Rejected Cases Registry"}
          {activeTab === 'settings' && "Accession Settings & Profiles"}
        </div>

        {/* Global Toolbar Search & Sliders */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <div className="relative w-full md:w-64 group">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E96] group-focus-within:text-[#5A5A40]" />
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 bg-[#F3F1ED] border-none rounded-xl focus:bg-white focus:outline-none focus:ring-1 text-xs text-[#3C3C3B]"
              placeholder="Search ID, Acc, MRN, Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {activeTab !== 'settings' && (
            <button
               onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
               className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                 showAdvancedFilters || selectedDepartment !== 'All' || selectedPartner !== 'All' || selectedSampleType !== 'All' || collectionStatusFilter !== 'All'
                   ? 'bg-amber-100/60 border-amber-300 text-amber-900'
                   : 'bg-white border-[#E5E2D9] text-[#6B6B66] hover:bg-[#FAF9F6]'
               }`}
               title="Advanced Filter Panel Toggle"
             >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedFilters && activeTab !== 'settings' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#FAF9F6] border border-[#E5E2D9] p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              
              {/* Date Filters */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] font-bold text-[#6B6B66] uppercase tracking-wider">Billed Date Range</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white border border-[#E5E2D9] rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-[#5A5A40]/30 outline-none"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white border border-[#E5E2D9] rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-[#5A5A40]/30 outline-none"
                  />
                </div>
              </div>

              {/* Department Criteria dropdown */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] font-bold text-[#6B6B66] uppercase tracking-wider">Lab Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="bg-white border border-[#E5E2D9] rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-[#5A5A40]/30 outline-none"
                >
                  <option value="All">All Departments</option>
                  <option value="Hematology">Hematology</option>
                  <option value="Biochemistry">Biochemistry</option>
                  <option value="Endocrinology">Endocrinology</option>
                  <option value="Clinical Pathology">Clinical Pathology</option>
                </select>
              </div>

              {/* Referring Organization dropdown */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] font-bold text-[#6B6B66] uppercase tracking-wider">Referring Partner</label>
                <select
                  value={selectedPartner}
                  onChange={(e) => setSelectedPartner(e.target.value)}
                  className="bg-white border border-[#E5E2D9] rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-[#5A5A40]/30 outline-none"
                >
                  <option value="All">All Corporate Partners</option>
                  {b2bPartners.map(p => (
                    <option key={p.partner_id} value={p.partner_id}>{p.partner_name}</option>
                  ))}
                  <option value="walk_in">Walk-In Patient</option>
                </select>
              </div>

              {/* Sample Material Filter */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] font-bold text-[#6B6B66] uppercase tracking-wider">Required Tube Material</label>
                <select
                  value={selectedSampleType}
                  onChange={(e) => setSelectedSampleType(e.target.value)}
                  className="bg-white border border-[#E5E2D9] rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-[#5A5A40]/30 outline-none"
                >
                  <option value="All">All Vials/Samples</option>
                  <option value="EDTA">EDTA Whole Blood</option>
                  <option value="Serum">Serum SST Yellow</option>
                  <option value="Urine">Sterile Urine Cup</option>
                  <option value="Plasma">Plasma Blue</option>
                  <option value="Swab">Nasopharyngeal Swab</option>
                </select>
              </div>

              {/* Collection Status filter */}
              {activeTab === 'pending_accession' && (
                <div className="flex flex-col gap-1 col-span-1 sm:col-span-2 md:col-span-1">
                  <label className="font-mono text-[10px] font-bold text-[#6B6B66] uppercase tracking-wider">Collection Status</label>
                  <div className="flex bg-[#E5E2D9]/40 p-0.5 rounded-lg">
                    {(['All', 'Not Collected', 'Collected Only'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => setCollectionStatusFilter(opt)}
                        className={`flex-1 text-[10px] py-1 rounded font-bold transition-all ${
                          collectionStatusFilter === opt
                            ? 'bg-[#5A5A40] text-white shadow-xs'
                            : 'text-[#6B6B66] hover:text-[#2D2D2B]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear filters Button */}
              <div className="flex items-end justify-end col-span-full pt-1.5 border-t border-[#E5E2D9]/60">
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setSelectedDepartment('All');
                    setSelectedPartner('All');
                    setSelectedSampleType('All');
                    setCollectionStatusFilter('All');
                  }}
                  className="px-3.5 py-1.5 bg-gray-100 text-[#6B6B66] font-bold hover:bg-gray-200 rounded-lg text-[11px] transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tab Interface Renderers */}
      <div className="min-h-96">
        <AnimatePresence mode="wait">
          
          {/* PENDING ACCESSION TAB */}
          {activeTab === 'pending_accession' && (
            <motion.div
              key="pending-accession-grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {filteredPendingAccession.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E5E2D9] p-12 text-center text-[#6B6B66]">
                  <div className="w-14 h-14 bg-[#FAF9F6] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#E5E2D9]">
                    <CheckCircle className="text-[#5A5A40]" size={24} />
                  </div>
                  <p className="font-semibold text-[#2D2D2B]">No pending Accession Orders!</p>
                  <p className="text-xs text-[#9E9E96] mt-1">Try broadening your search or register new phlebotomy draws.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPendingAccession.map((g) => {
                    const isFullyCollected = g.samples.every(v => v.status === 'Accessed');
                    return (
                      <div 
                        key={g.accession_no}
                        className="bg-white border border-[#E5E2D9] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#5A5A40]/40 transition-all group"
                      >
                        <div>
                          <div className="flex items-center justify-between border-b border-[#FAF9F6] pb-3 mb-4">
                            <div>
                              <span className="font-mono text-xs font-bold text-[#5A5A40] block tracking-wide">{g.accession_no}</span>
                              <h4 className="text-sm font-bold text-[#2D2D2B] mt-0.5">{g.patientName}</h4>
                              <span className="text-[10px] text-gray-400 font-mono">Encounter: {g.encounter?.encounter_id}</span>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono border uppercase ${
                              isFullyCollected 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : 'bg-orange-50 text-orange-850 border-orange-200'
                            }`}>
                              {isFullyCollected ? 'Checked-In' : 'Draw Awaiting'}
                            </span>
                          </div>

                          {/* Specific spec list */}
                          <div className="space-y-2 mb-5">
                            <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Registered Specimen Files:</p>
                            <div className="space-y-1.5">
                              {g.samples.map(sample => {
                                const activeCol = sample.status === 'Accessed';
                                return (
                                  <div key={sample.sample_id} className="flex items-center justify-between bg-[#FAF9F6] p-2 rounded-xl text-xs border border-gray-100">
                                    <div className="flex items-center space-x-2">
                                      <span className={`h-2.5 w-2.5 rounded-full ${activeCol ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                      <span className="font-semibold text-gray-800">{sample.sample_type} Specimen</span>
                                      <span className="text-xs text-amber-700 font-mono">({(sample.required_test_codes).join(',')})</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {activeCol ? (
                                        <span className="text-[10px] font-mono text-emerald-700 font-extrabold flex items-center gap-0.5">
                                          <CheckCircle2 size={11} /> Barcode: {sample.barcode_number}
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() => triggerManualReceive(sample.sample_id)}
                                          className="px-2 py-1 bg-white border border-[#E5E2D9] rounded hover:bg-[#5A5A40] hover:text-white transition-all text-[10px] font-bold cursor-pointer"
                                        >
                                          Receive Specimen
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Control actions bar */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#F3F1ED] mt-2">
                          <span className="text-[10px] font-mono text-[#9E9E96]">
                            Created: {g.encounter?.created_at || "Now"}
                          </span>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                triggerBulkReceive(g.accession_no);
                                setShowBarcodePrintModal(g.accession_no);
                              }}
                              className="px-3.5 py-1.8 bg-[#5A5A40] text-white hover:bg-[#484833] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                            >
                              <Barcode size={13} />
                              <span>Receive & Print Label</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* PENDING COLLECTION TAB */}
          {activeTab === 'pending_collection' && (
            <motion.div
              key="pending-draws-layout"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {filteredPendingCollection.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E5E2D9] p-12 text-center text-[#6B6B66]">
                  <div className="w-14 h-14 bg-[#FAF9F6] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#E5E2D9]">
                    <CheckCircle className="text-emerald-600" size={24} />
                  </div>
                  <p className="font-semibold text-[#2D2D2B]">No pending draws in phlebotomy queue.</p>
                  <p className="text-xs text-[#9E9E96] mt-1">Excellent floor work. All specimens currently collected and delivered.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPendingCollection.map((group) => (
                    <div 
                      key={group.accession_no}
                      className="bg-white border border-[#E5E2D9] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#5A5A40]/35 transition-all"
                    >
                      <div>
                        {/* Acc Title */}
                        <div className="flex items-center justify-between border-b border-[#FAF9F6] pb-3 mb-4">
                          <div>
                            <span className="font-mono text-xs font-bold text-[#5A5A40] uppercase tracking-wider">{group.accession_no}</span>
                            <h4 className="text-sm font-bold text-[#2D2D2B] mt-0.5">{group.patientName}</h4>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide bg-amber-50 text-amber-805 border border-amber-200 uppercase animate-pulse">
                            Pending Specimen Collect
                          </span>
                        </div>

                        {/* Breakdown of specimen items as pills */}
                        <div className="space-y-2 mb-6">
                          <p className="text-[10px] font-bold text-[#9E9E96] uppercase tracking-wider font-mono">Phlebotomy Vacuum Tube Directives:</p>
                          <div className="flex flex-wrap gap-2">
                            {group.samples.map(sample => {
                              const sType = sample.sample_type;
                              const bgStyle = 
                                sType === 'EDTA' ? 'bg-indigo-50 border-indigo-200 text-indigo-900 border' :
                                sType === 'Serum' ? 'bg-amber-50 border-amber-200 text-amber-955 border' :
                                sType === 'Urine' ? 'bg-emerald-50 border-emerald-250 text-emerald-900 border' :
                                'bg-gray-50 border-gray-200 text-gray-900 border';

                              const tubeCol = 
                                sType === 'EDTA' ? '🟣 EDTA Lavender Tube' :
                                sType === 'Serum' ? '🟡 Serum Gold/SST Yellow' :
                                sType === 'Urine' ? '🟢 Sterile Urine Cup' :
                                `⚪ Specimen (${sType})`;

                              return (
                                <span 
                                  key={sample.sample_id}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 ${bgStyle}`}
                                >
                                  <span>{tubeCol}</span>
                                  <span className="text-[9px] font-bold uppercase font-mono px-1.5 py-0.2 bg-white/70 rounded">
                                    {(sample.required_test_codes).join('+')}
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Phlebotomy Primary actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#F3F1ED] mt-2">
                        <span className="text-[10px] text-[#9E9E96] font-mono">
                          Registered: {group.encounter ? group.encounter.created_at : "Today"}
                        </span>
                        
                        <button
                          onClick={() => {
                            bulkCollectSamplesForAccession(group.accession_no);
                            setShowBarcodePrintModal(group.accession_no);
                          }}
                          className="px-4 py-2 bg-[#5A5A40] text-white rounded-xl text-xs font-bold hover:bg-[#484833] transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Barcode size={14} />
                          <span>Collect & Print Labels</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ACCESSED SPECIMENS TAB */}
          {activeTab === 'accessed' && (
            <motion.div
              key="accessed-data-table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl border border-[#E5E2D9] overflow-hidden shadow-xs"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F6] border-b border-[#E5E2D9] text-[#6B6B66] text-[10px] font-bold uppercase tracking-wider font-mono">
                    <th className="px-6 py-4.5">Patient Demographics</th>
                    <th className="px-6 py-4.5">Acc No / Barcode ID</th>
                    <th className="px-6 py-4.5">Vial Category</th>
                    <th className="px-6 py-4.5">Acquisition Date</th>
                    <th className="px-6 py-4.5 text-right">Technical Correctives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E2D9]/40 text-xs text-[#3C3C3B]">
                  {filteredAccessed.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[#9E9E96]">
                        No matching received specimens found in physical custody index.
                      </td>
                    </tr>
                  ) : (
                    filteredAccessed.map((sample) => {
                      const patientInfo = getPatientForAccession(sample.accession_no);
                      return (
                        <tr key={sample.sample_id} className="hover:bg-[#FAF9F6]/40 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-semibold text-[#2D2D2B] text-sm block">{patientInfo.name}</span>
                            <span className="text-[10px] text-[#9E9E96] block font-mono">Gender: {patientInfo.patient?.gender || 'M'} | Age: {patientInfo.patient?.age || '25'}</span>
                          </td>
                          <td className="px-6 py-4 font-mono">
                            <div className="flex items-center space-x-2">
                              <Barcode size={15} className="text-[#5A5A40]" />
                              <div>
                                <span className="block text-[10px] text-gray-400 font-bold">{sample.accession_no}</span>
                                <span className="text-emerald-700 font-bold block mt-0.5">{sample.barcode_number}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider ${
                              sample.sample_type === 'EDTA' ? 'bg-indigo-50 border border-indigo-100 text-indigo-800' :
                              sample.sample_type === 'Serum' ? 'bg-amber-50 border border-amber-100 text-amber-800' :
                              sample.sample_type === 'Urine' ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' :
                              'bg-gray-50 border border-gray-100 text-gray-800'
                            }`}>
                              {sample.sample_type} Vial
                            </span>
                            <span className="block mt-1 text-[9px] text-gray-400 font-mono">
                              Tests: {(sample.required_test_codes).join('+')}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-[#6B6B66]">
                            {sample.collected_at || "16/06/2026 12:45"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => setShowBarcodePrintModal(sample.accession_no)}
                                className="p-1 text-[#5A5A40] hover:bg-gray-100 rounded-lg border border-[#E5E2D9] transition-all cursor-pointer"
                                title="Print dispatch sticker template"
                              >
                                <Printer size={13} />
                              </button>
                              <button
                                onClick={() => handleOpenRejection(sample.sample_id)}
                                className="px-2.5 py-1 border border-red-250 text-red-650 rounded-xl hover:bg-red-50 text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1"
                              >
                                <Trash2 size={12} />
                                <span>Redraw / Reject</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* REJECTED SAMPLES TAB */}
          {activeTab === 'rejected' && (
            <motion.div
              key="rejected-samples-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {filteredExceptions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E5E2D9] p-12 text-center text-[#6B6B66] text-sm">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="text-emerald-600" size={24} />
                  </div>
                  <p className="font-semibold text-[#2D2D2B]">Zero exceptions recorded in database!</p>
                  <p className="text-xs text-[#9E9E96] mt-1">Excellent phlebotomy adherence.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#E5E2D9] overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAF9F6] border-b border-[#E5E2D9] text-[#6B6B66] text-[10px] font-bold uppercase tracking-wider font-mono">
                        <th className="px-6 py-4.5">Patient Details</th>
                        <th className="px-6 py-4.5">Accession Reference</th>
                        <th className="px-6 py-4.5">Specimen Type</th>
                        <th className="px-6 py-4.5">Floor Rejection Log entry</th>
                        <th className="px-6 py-4.5 text-right font-mono">Resolution Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E2D9]/40 text-xs text-[#3C3C3B]">
                      {filteredExceptions.map((sample) => {
                        const patientInfo = getPatientForAccession(sample.accession_no);
                        return (
                          <tr key={sample.sample_id} className="hover:bg-red-50/10 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-semibold text-red-950 block text-sm">{patientInfo.name}</span>
                              <span className="block text-[10px] text-red-750 font-mono">MRN: {patientInfo.patient?.mrn || 'N/A'}</span>
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-red-700">
                              {sample.accession_no}
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-700 uppercase font-mono text-[10px]">
                              {sample.sample_type} Tube
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-start space-x-1.5 text-xs text-red-700 bg-red-50 border border-red-100 p-2 rounded-xl">
                                <AlertOctagon size={13} className="shrink-0 mt-0.5" />
                                <span>{sample.rejection_reason || "Specimen hemolyzed during manual syringe collection."}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => resetRejectedSampleToPending(sample.sample_id)}
                                className="px-3 py-1.8 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex inline-flex items-center space-x-1 shadow-sm"
                              >
                                <RotateCcw size={13} />
                                <span>Request Redraw</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ACCESSION SETTINGS TAB */}
          {activeTab === 'settings' && (
            <motion.div
              key="accession-settings-grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Sample Custom configuration panel */}
              <div className="bg-white border border-[#E5E2D9] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#FAF9F6] pb-3 gap-3">
                  <div>
                    <h3 className="font-bold text-lg text-[#2D2D2B] font-sans">Vial Specimen Catalog Setup</h3>
                    <p className="text-xs text-[#9E9E96]">Configure pre-defined laboratory sample definitions and required vacutainer configurations.</p>
                  </div>
                  <button
                    onClick={() => setIsAddingSetting(true)}
                    className="px-3 py-1.8 bg-[#5A5A40] text-white hover:bg-[#484833] rounded-xl text-xs font-bold flex items-center space-x-1.5 self-end sm:self-auto cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Configure Sample Vial</span>
                  </button>
                </div>

                {/* Adding form */}
                {isAddingSetting && (
                  <div className="bg-[#FAF9F6] border border-[#E5E2D9] p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end text-xs">
                    <div>
                      <label className="block font-bold text-gray-500 mb-1">Display Sample Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Lithium Heparinized Plasma"
                        className="w-full bg-white border border-[#E5E2D9] p-2 rounded-xl focus:outline-none"
                        value={editSampleName}
                        onChange={(e) => setEditSampleName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-500 mb-1">Base Tube Code Type</label>
                      <select
                        className="w-full bg-white border border-[#E5E2D9] p-2 rounded-xl focus:outline-none"
                        value={editSampleType}
                        onChange={(e) => setEditSampleType(e.target.value)}
                      >
                        <option value="EDTA">EDTA (Lavender)</option>
                        <option value="Serum">Serum (Yellow/SST)</option>
                        <option value="Urine">Urine (Green Container)</option>
                        <option value="Plasma">Plasma (Light Blue)</option>
                        <option value="Blood">Blood (Standard Red)</option>
                        <option value="Swab">Swab (Nasal Transport Media)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-gray-500 mb-1">Additive / Container Class</label>
                      <input
                        type="text"
                        placeholder="e.g. Sodium Citrate Additive"
                        className="w-full bg-white border border-[#E5E2D9] p-2 rounded-xl focus:outline-none mb-2 sm:mb-0"
                        value={editContainerType}
                        onChange={(e) => setEditContainerType(e.target.value)}
                      />
                    </div>
                    <div className="col-span-full flex justify-end space-x-2 pt-2">
                      <button
                        onClick={() => setIsAddingSetting(false)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 font-bold rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddSampleSetting}
                        className="px-3.5 py-1.5 bg-[#5A5A40] text-white font-bold rounded-lg"
                      >
                        Add Configuration
                      </button>
                    </div>
                  </div>
                )}

                {/* Table with entries */}
                <div className="overflow-x-auto rounded-2xl border border-[#E5E2D9]/60">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAF9F6] text-[10px] font-bold font-mono text-[#6B6B66] uppercase border-b border-[#E5E2D9]">
                        <th className="px-5 py-3">Sr No.</th>
                        <th className="px-5 py-3">Assay Display Name</th>
                        <th className="px-5 py-3">Code Type</th>
                        <th className="px-5 py-3">Integrated Vial Container Additives</th>
                        <th className="px-5 py-3 text-right">Settings Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E2D9]/40 text-xs">
                      {sampleSettings.map((s, idx) => (
                        <tr key={s.sr_no} className="hover:bg-gray-50/50">
                          {editingSettingIdx === idx ? (
                            // Edit inputs inline
                            <>
                              <td className="px-5 py-2.5 font-mono text-gray-400 font-bold">{s.sr_no}</td>
                              <td className="px-5 py-2.5">
                                <input
                                  type="text"
                                  className="border border-[#E5E2D9] px-2 py-1 rounded w-full bg-white"
                                  value={editSampleName}
                                  onChange={(e) => setEditSampleName(e.target.value)}
                                />
                              </td>
                              <td className="px-5 py-2.5">
                                <select
                                  className="border border-[#E5E2D9] px-2 py-1 rounded bg-white"
                                  value={editSampleType}
                                  onChange={(e) => setEditSampleType(e.target.value)}
                                >
                                  <option value="EDTA">EDTA</option>
                                  <option value="Serum">Serum</option>
                                  <option value="Urine">Urine</option>
                                  <option value="Plasma">Plasma</option>
                                  <option value="Blood">Blood</option>
                                  <option value="Swab">Swab</option>
                                </select>
                              </td>
                              <td className="px-5 py-2.5">
                                <input
                                  type="text"
                                  className="border border-[#E5E2D9] px-2 py-1 rounded w-full bg-white"
                                  value={editContainerType}
                                  onChange={(e) => setEditContainerType(e.target.value)}
                                />
                              </td>
                              <td className="px-5 py-2.5 text-right space-x-1">
                                <button
                                  onClick={handleSaveSampleSetting}
                                  className="px-2 py-1 bg-emerald-600 text-white font-bold rounded text-[10px]"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingSettingIdx(null)}
                                  className="px-2 py-1 bg-gray-200 text-gray-700 font-bold rounded text-[10px]"
                                >
                                  Cancel
                                </button>
                              </td>
                            </>
                          ) : (
                            // Read-only parameters
                            <>
                              <td className="px-5 py-3 font-mono font-semibold text-gray-400">{s.sr_no}</td>
                              <td className="px-5 py-3 font-bold text-gray-800">{s.sample_name}</td>
                              <td className="px-5 py-3 font-semibold text-indigo-700 font-mono text-[10px]">{s.sample_type}</td>
                              <td className="px-5 py-3 text-[#6B6B66]">{s.container_type}</td>
                              <td className="px-5 py-3 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleEditSampleSetting(idx)}
                                    className="p-1 border border-gray-200 text-gray-600 rounded hover:bg-gray-50 cursor-pointer"
                                    title="Edit settings"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSampleSetting(s.sr_no)}
                                    className="p-1 border border-red-100 text-red-600 rounded hover:bg-red-50 cursor-pointer"
                                    title="Delete settings"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* REJECTION LOGGING MODAL CONTAINER */}
      {rejectingSampleId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-md w-full border border-[#E5E2D9] shadow-2xl p-6.5 space-y-4 text-[#3C3C3B]"
          >
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3.5">
              <div className="flex items-center space-x-2.5 text-red-650">
                <AlertTriangle size={20} />
                <h3 className="font-bold text-lg font-sans text-red-950">Record Specimen Deviation</h3>
              </div>
              <button 
                onClick={() => setRejectingSampleId(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#6B6B66] leading-relaxed">
              Flagging a specimen as rejected alerts clinical technicians. The core encounter will be reset to 
              <span className="font-bold text-amber-700"> Draw Pending</span>, prompting phlebotomy to summon the patient for another redraw.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider font-mono text-[#6B6B66] mb-1.5">
                  Rejection Code Reason
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full text-xs bg-[#F3F1ED] border border-[#E5E2D9] rounded-xl px-3 py-2.5 focus:outline-none focus:bg-white"
                >
                  {standardRejectionReasons.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                  <option value="Other">Other / Custom Log Entry</option>
                </select>
              </div>

              {rejectionReason === 'Other' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider font-mono text-[#6B6B66] mb-1.5">
                    Describe Custom Rejection Fact
                  </label>
                  <textarea
                    placeholder="Enter specific physical issues (e.g. spilled vial context)"
                    className="w-full text-xs bg-[#F3F1ED] border border-[#E5E2D9] rounded-xl px-3 py-2.5 focus:outline-none focus:bg-white h-20 resize-none font-sans outline-none"
                    value={customRejectionReason}
                    onChange={(e) => setCustomRejectionReason(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E5E2D9]">
              <button
                onClick={() => setRejectingSampleId(null)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer"
              >
                Keep Specimen
              </button>
              <button
                onClick={handleCommitRejection}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-sm transition-all cursor-pointer"
              >
                Log Floor Rejection
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* SAMPLE BARCODE MODAL */}
      {showBarcodePrintModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2D2D2B] text-white rounded-3xl max-w-sm w-full shadow-2xl p-6.5 border border-white/10"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5 text-emerald-400">
                <Barcode size={20} />
                <h3 className="font-bold text-lg font-mono">DLabs Label Engine</h3>
              </div>
              <button 
                onClick={() => setShowBarcodePrintModal(null)}
                className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-6 space-y-4 text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Sending vector print command to Zebra desktop ZD421...</p>
              
              {/* Dynamic Barcode rendering */}
              <div className="bg-white p-5 rounded-2xl inline-block shadow-md border-2 border-emerald-500/30">
                <div className="font-mono text-black text-[13px] font-bold mb-1 uppercase tracking-wider text-ellipsis overflow-hidden max-w-48 whitespace-nowrap mx-auto">
                  {getPatientForAccession(showBarcodePrintModal).name}
                </div>
                
                {/* Visual Barcode pattern */}
                <div className="h-14 w-52 flex items-center justify-center bg-gray-50 p-1 select-none mx-auto border border-gray-100 rounded">
                  <div className="w-full flex justify-between h-10 px-2 pt-1 pb-1">
                    {[2, 3, 1, 4, 1, 5, 3, 2, 6, 2, 5, 2, 4, 3, 1].map((w, idx) => (
                      <div 
                        key={idx} 
                        className="bg-black inline-block h-full transition-all" 
                        style={{ width: `${w}px` }} 
                      />
                    ))}
                  </div>
                </div>

                <div className="font-mono text-black text-[11px] mt-1.5 tracking-widest font-bold">
                  {showBarcodePrintModal}-V12
                </div>
                <div className="text-[8px] text-gray-500 font-bold font-mono uppercase">
                  {getPatientForAccession(showBarcodePrintModal).encounter?.tests_ordered.join('+') || 'GEN'} | {new Date().toLocaleDateString('en-GB')}
                </div>
              </div>

              <div className="text-xs text-gray-300">
                Label printed successfully! Attach to specimen tubes immediately to prevent mixed diagnostics tracking.
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setShowBarcodePrintModal(null)}
                className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer shadow-md"
              >
                Ok, Labels Attached
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
