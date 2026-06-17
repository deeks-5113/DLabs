import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Search, 
  Plus, 
  X, 
  Briefcase, 
  FileCheck2, 
  Percent, 
  AlertCircle, 
  UserCheck2,
  Calendar,
  Receipt,
  TrendingDown,
  Barcode,
  Sparkles,
  MapPin,
  ClipboardList,
  Archive,
  Printer,
  Table,
  Activity,
  Database,
  Building,
  ActivitySquare,
  Filter,
  CheckCircle,
  Clock,
  Shield,
  HeartPulse
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, calculateAge, formatDate } from '../utils/format';
import { Patient, TestCatalog, B2B_Partner, Encounter, BillSettlement, ReportPrintTracking } from '../types';
import { Tooltip } from './Tooltip';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartTooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface RegistrationModuleProps {
  initialPhone?: string;
}

export const RegistrationModule: React.FC<RegistrationModuleProps> = ({ initialPhone = '' }) => {
  const { 
    patients, 
    b2bPartners, 
    testCatalog, 
    addPatient, 
    updatePatient,
    createEncounter, 
    encounters,
    billSettlements,
    updateBillStatus,
    reportPrints,
    updateReportPrintStatus,
    updateEncounterStatus,
    activeSubView,
    setActiveSubView
  } = useApp();

  // -------------------------
  // FORM STATES: REGISTRATION & BILLING
  // -------------------------
  const [phoneNumberQuery, setPhoneNumberQuery] = useState(initialPhone);
  const [lookupFeedback, setLookupFeedback] = useState<{ type: 'success' | 'warn' | null; message: string }>({ type: null, message: '' });
  const [isExistingPatient, setIsExistingPatient] = useState(false);

  // Demographics
  const [patientId, setPatientId] = useState('');
  const [patientType, setPatientType] = useState<any>('Regular');
  const [mrn, setMrn] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [designation, setDesignation] = useState<any>('Mr.');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [phoneBelongsTo, setPhoneBelongsTo] = useState<any>('Patient');
  const [emailAddress, setEmailAddress] = useState('');
  const [organisationName, setOrganisationName] = useState('Direct Walk-In');
  const [referringPhysician, setReferringPhysician] = useState('Self');

  // Address
  const [addressLine, setAddressLine] = useState('');
  const [cityLine, setCityLine] = useState('');
  const [districtLine, setDistrictLine] = useState('');
  const [pincodeLine, setPincodeLine] = useState('');
  const [locationArea, setLocationArea] = useState('');
  const [stateDropdown, setStateDropdown] = useState('Delhi');
  const [countryDropdown, setCountryDropdown] = useState('India');
  const [wardNumber, setWardNumber] = useState('');

  // Medical History
  const [covidVaccineReceived, setCovidVaccineReceived] = useState(false);
  const [arogyaSetuApp, setArogyaSetuApp] = useState(false);
  const [isHospitalized, setIsHospitalized] = useState(false);
  const [typeOfVaccine, setTypeOfVaccine] = useState('Covishield');
  const [patientCategory, setPatientCategory] = useState('General Walk-In');
  const [patientOccupation, setPatientOccupation] = useState('Corporate Employee');
  const [vaccinationDate, setVaccinationDate] = useState('');
  const [dateOfDose2, setDateOfDose2] = useState('');
  const [vaccinationStatus, setVaccinationStatus] = useState<any>('Unvaccinated');
  const [bodyTemperature, setBodyTemperature] = useState<any>('Normal');
  const [symptomProgress, setSymptomProgress] = useState<any>('None');
  const [cowinBeneficiary, setCowinBeneficiary] = useState('');
  const [countryStateTravelled, setCountryStateTravelled] = useState('');
  const [isolationLocation, setIsolationLocation] = useState('');
  const [passengerLocatorId, setPassengerLocatorId] = useState('');
  // Editable string comma separators for Arrays
  const [travelHistoryText, setTravelHistoryText] = useState('');
  const [symptomsText, setSymptomsText] = useState('');
  const [medicalConditionsText, setMedicalConditionsText] = useState('');

  // Logistics
  const [sampleCollectedFrom, setSampleCollectedFrom] = useState<any>('Lab Center');
  const [modeOfTransport, setModeOfTransport] = useState<any>('Self-delivered');

  // Order Cart Selection
  const [selectedTests, setSelectedTests] = useState<TestCatalog[]>([]);
  const [testFilter, setTestFilter] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  
  // Successful barcode outcome
  const [liveSuccessEncounter, setLiveSuccessEncounter] = useState<Encounter | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Appointments state
  const [appointments, setAppointments] = useState<any[]>([
    { appt_id: "APP-501", patient_name: "Komal Malhotra", age: 29, gender: "Female", test_code: "TSH", appt_time: "16/06/2026 14:00", phone: "9818299101", status: "In-Progress" },
    { appt_id: "APP-502", patient_name: "Rajesh Kumar", age: 52, gender: "Male", test_code: "LFT", appt_time: "16/06/2026 15:30", phone: "9122391029", status: "Scheduled" },
    { appt_id: "APP-503", patient_name: "Ananya Deshmukh", age: 31, gender: "Female", test_code: "CBC", appt_time: "17/06/2026 09:00", phone: "8872109882", status: "Scheduled" }
  ]);
  const [apptFormName, setApptFormName] = useState('');
  const [apptFormAge, setApptFormAge] = useState('');
  const [apptFormGender, setApptFormGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [apptFormTest, setApptFormTest] = useState('CBC');
  const [apptFormDate, setApptFormDate] = useState('');
  const [apptFormPhone, setApptFormPhone] = useState('');

  // Active modal/popup for viewing specific patient record card
  const [selectedAuditPatient, setSelectedAuditPatient] = useState<Patient | null>(null);
  const [selectedPrintReport, setSelectedPrintReport] = useState<ReportPrintTracking | null>(null);

  // Archiving flags state
  const [archivedPatientIds, setArchivedPatientIds] = useState<string[]>([]);

  // Advance searching states
  const [advSearchType, setAdvSearchType] = useState<string>('');
  const [advSearchState, setAdvSearchState] = useState<string>('');
  const [advSearchGender, setAdvSearchGender] = useState<string>('');
  const [advSearchVaccine, setAdvSearchVaccine] = useState<string>('');

  // Sync initialPhone
  useEffect(() => {
    if (initialPhone) {
      setPhoneNumberQuery(initialPhone);
      handlePatientLookup(initialPhone);
    }
  }, [initialPhone]);

  useEffect(() => {
    if (dob) {
      const calculated = calculateAge(dob);
      if (calculated > 0) {
        setAge(String(calculated));
      }
    }
  }, [dob]);

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumberQuery(val);
    if (val.length === 0) {
      setLookupFeedback({ type: null, message: '' });
    }
  };

  const handlePatientLookup = (searchNo?: string) => {
    const targetNo = searchNo || phoneNumberQuery;
    if (targetNo.length < 10) {
      setErrors(prev => ({ ...prev, lookup: "Mandatory 10-digit number required" }));
      return;
    }
    setErrors(prev => ({ ...prev, lookup: '' }));

    const match = patients.find(p => p.contact_number === targetNo);
    if (match) {
      setIsExistingPatient(true);
      setPatientId(match.patient_id);
      setPatientType(match.patient_type);
      setMrn(match.mrn);
      setNationalId(match.national_id);
      setDesignation(match.designation);
      setFullName(match.patient_name);
      setGender(match.gender);
      setDob(match.date_of_birth);
      setAge(String(match.age));
      setContactNumber(match.contact_number);
      setPhoneBelongsTo(match.phone_belongs_to);
      setEmailAddress(match.email);
      setOrganisationName(match.organisation);
      setReferringPhysician(match.referral);

      // Address
      setAddressLine(match.address_details.address);
      setCityLine(match.address_details.city);
      setDistrictLine(match.address_details.district);
      setPincodeLine(match.address_details.pincode);
      setLocationArea(match.address_details.location_area);
      setStateDropdown(match.address_details.state);
      setCountryDropdown(match.address_details.country);
      setWardNumber(match.address_details.ward_number);

      // Medical History
      setCovidVaccineReceived(match.medical_history.covid_vaccine_received);
      setArogyaSetuApp(match.medical_history.arogya_setu_app);
      setIsHospitalized(match.medical_history.is_hospitalized);
      setTypeOfVaccine(match.medical_history.type_of_vaccine);
      setPatientCategory(match.medical_history.patient_category);
      setPatientOccupation(match.medical_history.patient_occupation);
      setVaccinationDate(match.medical_history.vaccination_date);
      setDateOfDose2(match.medical_history.date_of_dose_2);
      setVaccinationStatus(match.medical_history.vaccination_status);
      setBodyTemperature(match.medical_history.body_temperature);
      setSymptomProgress(match.medical_history.symptom_progress);
      setCowinBeneficiary(match.medical_history.cowin_beneficiary);
      setCountryStateTravelled(match.medical_history.country_state_travelled);
      setIsolationLocation(match.medical_history.isolation_location);
      setPassengerLocatorId(match.medical_history.passenger_locator_id);
      setTravelHistoryText(match.medical_history.travel_history.join(', '));
      setSymptomsText(match.medical_history.symptoms.join(', '));
      setMedicalConditionsText(match.medical_history.medical_conditions.join(', '));

      // Logistics
      setSampleCollectedFrom(match.logistics.sample_collected_from);
      setModeOfTransport(match.logistics.mode_of_transport);

      setLookupFeedback({
        type: 'success',
        message: "Match record successfully synced to active intake terminal!"
      });
    } else {
      setIsExistingPatient(false);
      setPatientId(`P-${1000 + patients.length + 5}`);
      setPatientType('Regular');
      setMrn(`MRN-${Math.floor(100000 + Math.random() * 900000)}`);
      setNationalId('');
      setDesignation('Mr.');
      setFullName('');
      setGender('Male');
      setDob('');
      setAge('');
      setContactNumber(targetNo);
      setPhoneBelongsTo('Patient');
      setEmailAddress('');
      setOrganisationName('Direct Walk-In');
      setReferringPhysician('Self');

      // Clear sub-fields
      setAddressLine('');
      setCityLine('');
      setDistrictLine('');
      setPincodeLine('');
      setLocationArea('');
      setStateDropdown('Delhi');
      setCountryDropdown('India');
      setWardNumber('');

      setCovidVaccineReceived(false);
      setArogyaSetuApp(false);
      setIsHospitalized(false);
      setTypeOfVaccine('Covishield');
      setPatientCategory('General Walk-In');
      setPatientOccupation('Corporate Employee');
      setVaccinationDate('');
      setDateOfDose2('');
      setVaccinationStatus('Unvaccinated');
      setBodyTemperature('Normal');
      setSymptomProgress('None');
      setCowinBeneficiary('');
      setCountryStateTravelled('');
      setIsolationLocation('');
      setPassengerLocatorId('');
      setTravelHistoryText('');
      setSymptomsText('');
      setMedicalConditionsText('');

      setSampleCollectedFrom('Lab Center');
      setModeOfTransport('Courier');

      setLookupFeedback({
        type: 'warn',
        message: "No record matching phone found. Registering new profile entry."
      });
    }
  };

  const handleTestSelection = (test: TestCatalog) => {
    if (selectedTests.some(t => t.test_code === test.test_code)) return;
    setSelectedTests(prev => [...prev, test]);
    setTestFilter('');
  };

  const handleRemoveTest = (code: string) => {
    setSelectedTests(prev => prev.filter(t => t.test_code !== code));
  };

  const grossTotal = selectedTests.reduce((sum, test) => sum + test.retail_price, 0);
  const selectedPartner = b2bPartners.find(p => p.partner_id === selectedPartnerId);
  const discountVal = selectedPartner ? (grossTotal * selectedPartner.discount_percentage) / 100 : 0;
  const grandPayable = grossTotal - discountVal;

  const validateAndSubmit = () => {
    const errs: { [key: string]: string } = {};
    if (!fullName.trim()) errs.name = "Full Patient Name is required";
    if (!contactNumber.trim()) errs.phone = "Phone number is required";
    if (contactNumber.length < 10) errs.phone = "Must be 10 digits";
    if (!age) errs.age = "Required";
    if (selectedTests.length === 0) errs.tests = "Must select at least one clinical test";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Build Patient Address
    const addressDetails = {
      address: addressLine.trim() || "N/A",
      city: cityLine.trim() || "N/A",
      district: districtLine.trim() || "N/A",
      pincode: pincodeLine.trim() || "N/A",
      location_area: locationArea.trim() || "N/A",
      state: stateDropdown,
      country: countryDropdown,
      ward_number: wardNumber.trim()
    };

    // Build Medical history
    const medicalHistory = {
      covid_vaccine_received: covidVaccineReceived,
      arogya_setu_app: arogyaSetuApp,
      is_hospitalized: isHospitalized,
      type_of_vaccine: typeOfVaccine,
      patient_category: patientCategory,
      patient_occupation: patientOccupation,
      vaccination_date: vaccinationDate || "",
      date_of_dose_2: dateOfDose2 || "",
      vaccination_status: vaccinationStatus,
      body_temperature: bodyTemperature,
      symptom_progress: symptomProgress,
      cowin_beneficiary: cowinBeneficiary,
      country_state_travelled: countryStateTravelled,
      isolation_location: isolationLocation,
      passenger_locator_id: passengerLocatorId,
      travel_history: travelHistoryText ? travelHistoryText.split(',').map(s => s.trim()) : [],
      symptoms: symptomsText ? symptomsText.split(',').map(s => s.trim()) : [],
      medical_conditions: medicalConditionsText ? medicalConditionsText.split(',').map(s => s.trim()) : []
    };

    // Build logistics
    const logistics = {
      sample_collected_from: sampleCollectedFrom,
      mode_of_transport: modeOfTransport
    };

    const targetPatient: Patient = {
      patient_id: patientId || `P-${1000 + patients.length + 5}`,
      patient_type: patientType,
      mrn: mrn || `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
      national_id: nationalId,
      designation: designation,
      patient_name: fullName,
      gender: gender,
      date_of_birth: dob,
      age: Number(age),
      contact_number: contactNumber,
      phone_belongs_to: phoneBelongsTo,
      email: emailAddress,
      organisation: selectedPartner ? selectedPartner.partner_name : organisationName,
      referral: referringPhysician,
      address_details: addressDetails,
      medical_history: medicalHistory,
      logistics: logistics
    };

    // Add Patient
    addPatient(targetPatient);

    // Call generate encounter
    const tCodes = selectedTests.map(t => t.test_code);
    const newEnc = createEncounter(
      targetPatient.patient_id,
      selectedPartnerId || null,
      tCodes,
      grandPayable,
      referringPhysician,
      selectedPartner ? selectedPartner.partner_name : organisationName,
      logistics,
      medicalHistory
    );

    setLiveSuccessEncounter(newEnc);
  };

  // Keyboard Shortcut: Ctrl + Enter to Submit/Validate Order
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (activeSubView === 'registration-billing' && !liveSuccessEncounter) {
          e.preventDefault();
          validateAndSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeSubView,
    liveSuccessEncounter,
    fullName,
    contactNumber,
    age,
    selectedTests,
    addressLine,
    cityLine,
    districtLine,
    pincodeLine,
    locationArea,
    stateDropdown,
    countryDropdown,
    wardNumber,
    covidVaccineReceived,
    arogyaSetuApp,
    isHospitalized,
    typeOfVaccine,
    patientCategory,
    patientOccupation,
    vaccinationDate,
    dateOfDose2,
    selectedPartnerId,
    organisationName
  ]);

  const handleReset = () => {
    setPhoneNumberQuery('');
    setLookupFeedback({ type: null, message: '' });
    setIsExistingPatient(false);
    setPatientId('');
    setFullName('');
    setContactNumber('');
    setDob('');
    setAge('');
    setSelectedTests([]);
    setSelectedPartnerId('');
    setErrors({});
    setLiveSuccessEncounter(null);
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptFormName || !apptFormPhone) return;

    const newAppt = {
      appt_id: `APP-${500 + appointments.length + 2}`,
      patient_name: apptFormName,
      age: Number(apptFormAge) || 30,
      gender: apptFormGender,
      test_code: apptFormTest,
      appt_time: apptFormDate ? new Date(apptFormDate).toLocaleString('en-GB') : new Date().toLocaleString(),
      phone: apptFormPhone,
      status: "Scheduled"
    };

    setAppointments([...appointments, newAppt]);
    setApptFormName('');
    setApptFormPhone('');
    setApptFormAge('');
  };

  const toggleArchive = (id: string) => {
    if (archivedPatientIds.includes(id)) {
      setArchivedPatientIds(archivedPatientIds.filter(x => x !== id));
    } else {
      setArchivedPatientIds([...archivedPatientIds, id]);
    }
  };

  // Filter patients on Adv search
  const filteredAdvPatients = patients.filter(p => {
    if (advSearchType && p.patient_type !== advSearchType) return false;
    if (advSearchState && p.address_details.state.toLowerCase() !== advSearchState.toLowerCase()) return false;
    if (advSearchGender && p.gender !== advSearchGender) return false;
    if (advSearchVaccine && p.medical_history.vaccination_status !== advSearchVaccine) return false;
    return true;
  });

  return (
    <div id="registration-subsystem-wrapper" className="space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-[#E5E2D9] shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-serif text-[#2D2D2B] flex items-center gap-2">
            <HeartPulse className="text-[#5A5A40]" size={22} />
            {activeSubView === 'registration-billing' && "Registration / Billing Terminal"}
            {activeSubView === 'patient-search' && "Patient Memory Directory"}
            {activeSubView === 'appointments' && "LIMS Appointment Intake Diary"}
            {activeSubView === 'billing-history' && "Financial Settlement Ledger"}
            {activeSubView === 'financial-reports' && "Operational Yield Analytics"}
            {activeSubView === 'archives' && "Archived Diagnostics Registers"}
            {activeSubView === 'report-prints' && "Clinical Report Dispatch Tracking"}
            {activeSubView === 'collection-reports' && "Specimen Deposit Log Book"}
            {activeSubView === 'tests-list' && "Clinician Diagnostics Catalog"}
            {activeSubView === 'operational-status' && "LIMS Intake Operations Line"}
            {activeSubView === 'advanced-search' && "Multi-Criteria Advanced Search"}
          </h2>
          <p className="text-xs text-[#6B6B66] mt-0.5">Secure clinical session • Operator: ops_lab_admin</p>
        </div>
        <div className="bg-[#5A5A40]/10 text-[#5A5A40] text-[10px] font-bold font-mono px-3 py-1.5 rounded-lg border border-[#5A5A40]/20">
          SECURE CHANNEL 01
        </div>
      </div>

      {/* 1. REGISTRATION / BILLING VIEW */}
      {activeSubView === 'registration-billing' && (
        <div>
          {liveSuccessEncounter ? (
            <div id="registration-success" className="bg-white rounded-3xl border border-[#E5E2D9] shadow-md p-8 max-w-2xl mx-auto space-y-6 text-center animate-in zoom-in-95 duration-2 *">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle size={36} />
                </div>
                <h3 className="text-lg font-bold font-serif text-[#2D2D2B]">Specimen Intake Enrolled Successfully</h3>
                <p className="text-xs text-[#6B6B66]">Financial transaction and test accession keys generated.</p>
              </div>

              {/* Accession Slip representation */}
              <div className="bg-[#FAF9F6] border border-[#E5E2D9] rounded-2xl p-6 space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
                  <div className="flex items-center space-x-2">
                    <Barcode className="text-[#5A5A40]" size={20} />
                    <span className="font-mono font-bold text-[#2D2D2B] tracking-wider text-sm">{liveSuccessEncounter.accession_no}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#9E9E96]">SAMPLE BATCH ROUTING SLIP</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#9E9E96] block font-mono">PATIENT IDENTIFIER</span>
                    <span className="font-bold text-[#2D2D2B] block text-sm mt-0.5">{fullName}</span>
                    <span className="text-[#6B6B66]">{gender} • {age} Yrs</span>
                  </div>
                  <div>
                    <span className="text-[#9E9E96] block font-mono">INTAKE TIMESTAMP</span>
                    <span className="font-bold text-[#2D2D2B] block text-sm mt-0.5">{liveSuccessEncounter.created_at}</span>
                    <span className="text-amber-600 font-bold font-mono">{liveSuccessEncounter.status}</span>
                  </div>
                </div>

                <div className="border-t border-[#E5E2D9] pt-3">
                  <span className="text-[10px] font-mono text-[#9E9E96] block mb-1">PRESCRIBED TEST DIRECTORY</span>
                  <div className="flex flex-wrap gap-1.5">
                    {liveSuccessEncounter.tests_ordered.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded bg-white border border-[#E5E2D9] font-mono font-bold text-[10px] text-[#5A5A40]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-[#5A5A40]/10 p-4 rounded-xl border border-[#5A5A40]/20">
                <span className="text-xs font-bold text-[#5A5A40] font-mono">TOTAL BILL VALUE RECEIVED:</span>
                <span className="font-mono font-bold text-lg text-[#5A5A40]">{formatCurrency(grandPayable)}</span>
              </div>

              <button
                id="btn-regist-done"
                onClick={handleReset}
                className="px-6 py-3 bg-[#5A5A40] text-white font-bold text-xs rounded-xl hover:bg-[#4a4a35] transition-colors shadow-md flex items-center space-x-2 justify-center mx-auto cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Onboard Next Patient</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column Form */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Lookup Bar */}
                <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-3 shadow-xs">
                  <h3 className="text-xs font-bold font-mono text-[#9E9E96] uppercase tracking-wider">Demographic lookup engine</h3>
                  <div className="flex gap-2.5">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9E96]" size={15} />
                      <input
                        id="lookup-search"
                        type="text"
                        className="w-full pl-9 pr-4 py-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 text-[#2D2D2B]"
                        placeholder="Search patient via 10-digit mobile number..."
                        value={phoneNumberQuery}
                        onChange={handlePhoneInputChange}
                      />
                    </div>
                    <button
                      id="btn-search-audit"
                      onClick={() => handlePatientLookup()}
                      className="px-4 py-2 bg-[#5A5A40] text-white font-bold text-xs rounded-xl hover:bg-[#4a4a35] transition-colors cursor-pointer"
                    >
                      Search
                    </button>
                  </div>
                  {lookupFeedback.type && (
                    <div className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2 ${
                      lookupFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'
                    }`}>
                      <AlertCircle size={14} />
                      <span>{lookupFeedback.message}</span>
                    </div>
                  )}
                </div>

                {/* Patient Multi-Section Accordions */}
                <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 space-y-6 shadow-xs">
                  
                  {/* Step 1: Patient demographics */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 border-b border-[#FAF9F6] pb-2">
                      <div className="w-6 h-6 rounded-md bg-[#5A5A40]/10 text-[#5A5A40] font-bold text-xs flex items-center justify-center">1</div>
                      <h4 className="text-sm font-bold text-[#2D2D2B]">Patient Core Biodata Demographics</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Salutation Title</label>
                        <select 
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          value={designation}
                          onChange={(e: any) => setDesignation(e.target.value)}
                        >
                          <option value="Mr.">Mr.</option>
                          <option value="Mrs.">Mrs.</option>
                          <option value="Ms.">Ms.</option>
                          <option value="Dr.">Dr.</option>
                          <option value="Master">Master</option>
                          <option value="Mx.">Mx.</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Full Descriptive Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none focus:border-[#5A5A40]"
                          placeholder="e.g. Ramesh Kumar Verma"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                        {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Assigned Bio Sex</label>
                        <div className="flex bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg overflow-hidden shrink-0">
                          {['Male', 'Female', 'Other'].map((g: any) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setGender(g)}
                              className={`flex-1 py-1.5 font-bold text-[10px] transition-colors cursor-pointer ${gender === g ? 'bg-[#5A5A40] text-white' : 'text-[#6B6B66] hover:bg-[#F3F1ED]'}`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Mobile Phone Number <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none focus:border-[#5A5A40]"
                          placeholder="10-digit number"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        />
                        {errors.phone && <p className="text-[10px] text-red-500 font-bold">{errors.phone}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Belongs To</label>
                        <select 
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          value={phoneBelongsTo}
                          onChange={(e: any) => setPhoneBelongsTo(e.target.value)}
                        >
                          <option value="Patient">Patient Own Self</option>
                          <option value="Relative/Guardian">Relative / Guardian</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Date of Birth</label>
                        <input
                          type="date"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Verified Age <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          placeholder="e.g. 45"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                        />
                        {errors.age && <p className="text-[10px] text-red-500 font-bold">{errors.age}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Patient Profile Classification</label>
                        <select 
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          value={patientType}
                          onChange={(e: any) => setPatientType(e.target.value)}
                        >
                          <option value="Regular">Regular Walk-In</option>
                          <option value="Corporate">B2B Corporate Account</option>
                          <option value="VIP">VIP Priority Status</option>
                          <option value="Staff">Clinic Internal Staff</option>
                          <option value="Referral">Consultant External Referral</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">National Aadhaar / Unique ID</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          placeholder="4412-XXXX-XXXX"
                          value={nationalId}
                          onChange={(e) => setNationalId(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: PatientAddress details */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 border-b border-[#FAF9F6] pb-2">
                      <div className="w-6 h-6 rounded-md bg-[#5A5A40]/10 text-[#5A5A40] font-bold text-xs flex items-center justify-center">2</div>
                      <h4 className="text-sm font-bold text-[#2D2D2B]">Physical Address Specifications</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Street Address / House Locality</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          placeholder="e.g. Plot No 12, Swasthya Vihar"
                          value={addressLine}
                          onChange={(e) => setAddressLine(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">LIMS Locality Area</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          placeholder="e.g. Laxmi Nagar"
                          value={locationArea}
                          onChange={(e) => setLocationArea(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">City</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          value={cityLine}
                          onChange={(e) => setCityLine(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">District Jurisdiction</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          value={districtLine}
                          onChange={(e) => setDistrictLine(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Postal Code PIN</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          value={pincodeLine}
                          onChange={(e) => setPincodeLine(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">State Region</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          value={stateDropdown}
                          onChange={(e) => setStateDropdown(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Country</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          value={countryDropdown}
                          onChange={(e) => setCountryDropdown(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Hospital Ward Line (Optional)</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          placeholder="e.g. ICU-04A"
                          value={wardNumber}
                          onChange={(e) => setWardNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Medical History detailed */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 border-b border-[#FAF9F6] pb-2">
                      <div className="w-6 h-6 rounded-md bg-[#5A5A40]/10 text-[#5A5A40] font-bold text-xs flex items-center justify-center">3</div>
                      <h4 className="text-sm font-bold text-[#2D2D2B]">Clinical Medical History Record</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="flex items-center space-x-2 pt-5">
                        <input
                          type="checkbox"
                          id="chk-vaccine"
                          className="rounded border-[#E5E2D9] text-[#5A5A40] focus:ring-[#5A5A40]"
                          checked={covidVaccineReceived}
                          onChange={(e) => setCovidVaccineReceived(e.target.checked)}
                        />
                        <label htmlFor="chk-vaccine" className="font-bold text-[#6B6B66]">Covid Vaccine Received</label>
                      </div>

                      <div className="flex items-center space-x-2 pt-5">
                        <input
                          type="checkbox"
                          id="chk-arogya"
                          className="rounded border-[#E5E2D9] text-[#5A5A40] focus:ring-[#5A5A40]"
                          checked={arogyaSetuApp}
                          onChange={(e) => setArogyaSetuApp(e.target.checked)}
                        />
                        <label htmlFor="chk-arogya" className="font-bold text-[#6B6B66]">Arogya Setu Installed</label>
                      </div>

                      <div className="flex items-center space-x-2 pt-5">
                        <input
                          type="checkbox"
                          id="chk-hosp"
                          className="rounded border-[#E5E2D9] text-[#5A5A40] focus:ring-[#5A5A40]"
                          checked={isHospitalized}
                          onChange={(e) => setIsHospitalized(e.target.checked)}
                        />
                        <label htmlFor="chk-hosp" className="font-bold text-[#6B6B66]">Is Hospitalized</label>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Vaccination Concluded</label>
                        <select 
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          value={vaccinationStatus}
                          onChange={(e: any) => setVaccinationStatus(e.target.value)}
                        >
                          <option value="Unvaccinated">Unvaccinated</option>
                          <option value="Partially Vaccinated">Partially Vaccinated</option>
                          <option value="Fully Vaccinated">Fully Vaccinated</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Type Of Vaccine</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          value={typeOfVaccine}
                          onChange={(e) => setTypeOfVaccine(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">CoWIN Beneficiary ID</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none font-mono"
                          value={cowinBeneficiary}
                          placeholder="e.g. 5201-9921-2201"
                          onChange={(e) => setCowinBeneficiary(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Body Temperature</label>
                        <select 
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          value={bodyTemperature}
                          onChange={(e: any) => setBodyTemperature(e.target.value)}
                        >
                          <option value="Normal">Normal (98.6°F)</option>
                          <option value="Mild Fever">Mild Fever (99.8°F)</option>
                          <option value="High Fever">High Fever (&gt; 102°F)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Symptoms Progress</label>
                        <select 
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          value={symptomProgress}
                          onChange={(e: any) => setSymptomProgress(e.target.value)}
                        >
                          <option value="None">None</option>
                          <option value="Improving">Improving</option>
                          <option value="Stable">Stable</option>
                          <option value="Worsening">Worsening</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Passenger Locator ID</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          placeholder="e.g. PL-UK-1200"
                          value={passengerLocatorId}
                          onChange={(e) => setPassengerLocatorId(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Recent Symptoms (Comma separated)</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          placeholder="Fever, Cough, fatigue"
                          value={symptomsText}
                          onChange={(e) => setSymptomsText(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Pre-existing Chronic conditions</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          placeholder="Hypertension, Diabetes"
                          value={medicalConditionsText}
                          onChange={(e) => setMedicalConditionsText(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Countries Travelled Recently</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                          placeholder="United Kingdom, UAE"
                          value={travelHistoryText}
                          onChange={(e) => setTravelHistoryText(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Logistics */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 border-b border-[#FAF9F6] pb-2">
                      <div className="w-6 h-6 rounded-md bg-[#5A5A40]/10 text-[#5A5A40] font-bold text-xs flex items-center justify-center">4</div>
                      <h4 className="text-sm font-bold text-[#2D2D2B]">Logistical Shipment Routing</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Specimen Collected From</label>
                        <select 
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none font-bold"
                          value={sampleCollectedFrom}
                          onChange={(e: any) => setSampleCollectedFrom(e.target.value)}
                        >
                          <option value="Lab Center">Lab Center Clinic Desk</option>
                          <option value="Home">Home Phlebotomy Visit</option>
                          <option value="Hospital">Hospital Sub-Center Desk</option>
                          <option value="Drive-through">Drive-through Fast Intake</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6B6B66]">Mode of Courier Transport</label>
                        <select 
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none font-bold"
                          value={modeOfTransport}
                          onChange={(e: any) => setModeOfTransport(e.target.value)}
                        >
                          <option value="Courier">Cold-Chain Courier Bag</option>
                          <option value="Self-delivered">Self-delivered Phlebotomist walk-in</option>
                          <option value="Lab Rider">Official Lab Logistics Rider</option>
                          <option value="Ambulance">Emergency Dispatch Intake</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
              
              {/* Right Column Cart & Invoice */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Search Diagnostics */}
                <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-3 shadow-xs">
                  <h3 className="text-sm font-bold text-[#2D2D2B]">Select Diagnostic Panels</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E96]" size={15} />
                    <input
                      type="text"
                      className="w-full pl-9 pr-4 py-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#5A5A40] text-[#2D2D2B]"
                      placeholder="Type CBC, LFT, TSH, Urine..."
                      value={testFilter}
                      onChange={(e) => setTestFilter(e.target.value)}
                    />
                  </div>

                  {testFilter && (
                    <div className="border border-[#E5E2D9] rounded-xl overflow-hidden max-h-48 overflow-y-auto bg-white shadow-md text-xs">
                      {testCatalog
                        .filter(t => !selectedTests.some(st => st.test_code === t.test_code))
                        .filter(t => t.test_name.toLowerCase().includes(testFilter.toLowerCase()) || t.test_code.toLowerCase().includes(testFilter.toLowerCase()))
                        .map(t => (
                          <button
                            key={t.test_code}
                            type="button"
                            onClick={() => handleTestSelection(t)}
                            className="w-full px-3 py-2 text-left hover:bg-[#F3F1ED] flex justify-between items-center cursor-pointer transition-colors border-b border-[#FAF9F6]"
                          >
                            <div>
                              <span className="font-bold text-[#5A5A40] font-mono">[{t.test_code}]</span> {t.test_name}
                            </div>
                            <span className="font-mono text-emerald-700 font-bold">₹{t.retail_price}</span>
                          </button>
                        ))}
                    </div>
                  )}

                  {selectedTests.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <p className="text-[10px] font-bold text-[#9E9E96] uppercase tracking-wider">Active Cart Items</p>
                      <div className="max-h-40 overflow-y-auto space-y-1.5">
                        {selectedTests.map(t => (
                          <div key={t.test_code} className="flex justify-between items-center bg-[#FAF9F6] border border-[#E5E2D9] px-2.5 py-2 rounded-lg text-xs">
                            <div className="truncate pr-2">
                              <span className="font-mono font-bold text-[#5A5A40]">[{t.test_code}]</span> {t.test_name}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-[#2D2D2B]">₹{t.retail_price}</span>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveTest(t.test_code)}
                                className="text-red-500 hover:bg-red-50 p-1 rounded cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {errors.tests && <p className="text-xs text-red-500 font-bold">{errors.tests}</p>}
                </div>

                {/* Concession Selection */}
                <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-3 shadow-xs text-xs">
                  <h3 className="text-sm font-bold text-[#2D2D2B]">Rebate Partnership</h3>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B6B66]">B2B Corporate Invoice Concessions</label>
                    <select
                      className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                      value={selectedPartnerId}
                      onChange={(e) => setSelectedPartnerId(e.target.value)}
                    >
                      <option value="">Direct Billing Tariff (0% Concession)</option>
                      {b2bPartners.map(p => (
                        <option key={p.partner_id} value={p.partner_id}>
                          {p.partner_name} ({p.discount_percentage}% Concession)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Final Bill Settlement Calculation Card */}
                <div className="bg-white p-6 rounded-3xl border border-[#E5E2D9] space-y-4 shadow-md">
                  <h3 className="text-sm font-bold text-[#2D2D2B] border-b border-[#FAF9F6] pb-2 font-serif">Checkout Yield Invoice</h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-[#6B6B66]">
                      <span>Tests Retail Total</span>
                      <span className="font-mono font-bold">₹{grossTotal}</span>
                    </div>

                    {selectedPartner && (
                      <div className="flex justify-between text-[#5A5A40] font-bold">
                        <span>Corporate Rebate Concession ({selectedPartner.discount_percentage}%)</span>
                        <span className="font-mono">-₹{discountVal.toFixed(1)}</span>
                      </div>
                    )}

                    <div className="border-t border-[#E5E2D9] pt-2 flex justify-between text-base text-[#2D2D2B] font-bold">
                      <span>Total Amount Paid</span>
                      <span className="font-mono font-extrabold text-[#5A5A40]">₹{grandPayable.toFixed(1)}</span>
                    </div>
                  </div>

                  <button
                    id="btn-bill-confirm"
                    type="button"
                    onClick={validateAndSubmit}
                    className="w-full py-3.5 bg-[#5A5A40] hover:bg-[#4a4a35] text-white font-bold text-xs rounded-xl transition-transform transform active:scale-95 shadow-md uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Receipt size={14} />
                    <span>Conclude Order & Accession</span>
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. PATIENT SEARCH DISPLAY */}
      {activeSubView === 'patient-search' && (
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-[#2D2D2B] font-serif">Registered Patient Census Directory</h3>
            <span className="px-2.5 py-1 text-xs bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg font-mono text-[#5A5A40]">
              Total Records: {patients.length} entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E2D9] text-[#9E9E96] font-mono leading-none">
                  <th className="py-3 px-3">PATIENT ID</th>
                  <th className="py-3 px-3">FULL NAME</th>
                  <th className="py-3 px-3">SEX • AGE(YRS)</th>
                  <th className="py-3 px-3">TELECOM CONTACT</th>
                  <th className="py-3 px-3">CLASSIFICATION</th>
                  <th className="py-3 px-3">ESTABLISHED REFERRAL</th>
                  <th className="py-3 px-3 text-right">AUDIT ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2D9]/30 text-[#2D2D2B]">
                {patients.map(p => (
                  <tr key={p.patient_id} className="hover:bg-[#FAF9F6]/50">
                    <td className="py-3 px-3 font-mono font-bold text-[#5A5A40]">{p.patient_id}</td>
                    <td className="py-3 px-3 font-bold">{p.designation} {p.patient_name}</td>
                    <td className="py-3 px-3">{p.gender} • {p.age} Yrs</td>
                    <td className="py-3 px-3 font-mono">{p.contact_number}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.patient_type === 'VIP' ? 'bg-amber-100 text-amber-800' :
                        p.patient_type === 'Corporate' ? 'bg-[#5A5A40]/10 text-[#5A5A40]' :
                        'bg-[#F3F1ED] text-[#6B6B66]'
                      }`}>
                        {p.patient_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 italic text-[#6B6B66]">{p.referral}</td>
                    <td className="py-3 px-3 text-right space-x-1">
                      <button
                        onClick={() => setSelectedAuditPatient(p)}
                        className="px-2.5 py-1.5 bg-[#F3F1ED] text-[#2D2D2B] font-bold text-[10px] rounded hover:bg-[#E5E2D9] transition-colors cursor-pointer"
                      >
                        Audit Bio Card
                      </button>
                      <button
                        onClick={() => {
                          setPhoneNumberQuery(p.contact_number);
                          handlePatientLookup(p.contact_number);
                          setActiveSubView('registration-billing');
                        }}
                        className="px-2.5 py-1.5 bg-[#5A5A40] text-white font-bold text-[10px] rounded hover:bg-[#4a4a35] transition-colors cursor-pointer"
                      >
                        Create Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. APPOINTMENTS DIARY */}
      {activeSubView === 'appointments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Booking list */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#2D2D2B] font-serif">Daily Consultation Schedule</h3>
            
            <div className="space-y-2.5">
              {appointments.map(a => (
                <div key={a.appt_id} className="flex justify-between items-center bg-[#FAF9F6] border border-[#E5E2D9] p-3.5 rounded-xl text-xs">
                  <div className="space-y-1">
                    <span className="font-mono font-bold text-[#5A5A40] block">{a.appt_id} • {a.appt_time}</span>
                    <span className="text-sm font-bold text-[#2D2D2B]">{a.patient_name}</span>
                    <span className="text-xs text-[#6B6B66] block">Age: {a.age} Yrs • Sex: {a.gender} • Mobile: {a.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded bg-[#5A5A40]/10 text-[#5A5A40] font-mono font-bold text-[10px]">
                      {a.test_code}
                    </span>
                    <span className="font-mono text-emerald-700 font-bold uppercase text-[10px] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule form */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E2D9] p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#2D2D2B]">Record Diagnostics Pre-booking</h3>
            <form onSubmit={handleCreateAppointment} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shreya Goel"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={apptFormName}
                  onChange={(e) => setApptFormName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Phone Contact</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9654129910"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={apptFormPhone}
                  onChange={(e) => setApptFormPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#6B6B66]">Age</label>
                  <input
                    type="number"
                    className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                    value={apptFormAge}
                    onChange={(e) => setApptFormAge(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#6B6B66]">Test Directory</label>
                  <select
                    className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                    value={apptFormTest}
                    onChange={(e) => setApptFormTest(e.target.value)}
                  >
                    {testCatalog.map(t => (
                      <option key={t.test_code} value={t.test_code}>[{t.test_code}] {t.test_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Intake Reservation Time</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none font-mono"
                  value={apptFormDate}
                  onChange={(e) => setApptFormDate(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#5A5A40] text-white font-bold text-xs rounded-xl hover:bg-[#4a4a35] uppercase tracking-wider cursor-pointer font-sans"
              >
                Appoint Clinic Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. BILLING HISTORY */}
      {activeSubView === 'billing-history' && (
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center text-xs">
            <h3 className="text-base font-bold text-[#2D2D2B] font-serif">Diagnostic Accounts Receivable ledger</h3>
            <span className="font-mono text-[#9E9E96]">Audited GST receipts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E2D9] text-[#9E9E96] font-mono leading-none">
                  <th className="py-3 px-3">BILL ID</th>
                  <th className="py-3 px-3">RECORD DATE</th>
                  <th className="py-3 px-3">PATIENT DETAILS</th>
                  <th className="py-3 px-3">DESK REFERRAL</th>
                  <th className="py-3 px-3">CORPORATE CONCESSION</th>
                  <th className="py-3 px-3 text-right">EXPECTED BILL</th>
                  <th className="py-3 px-3 text-center">SETTLED STATUS</th>
                  <th className="py-3 px-3 text-right">LEDGER ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2D9]/30 text-[#2D2D2B]">
                {billSettlements.map(b => (
                  <tr key={b.bill_id} className="hover:bg-[#FAF9F6]/50">
                    <td className="py-3 px-3 font-mono font-bold text-[#5A5A40]">{b.bill_id}</td>
                    <td className="py-3 px-3">{b.bill_date}</td>
                    <td className="py-3 px-3 font-semibold">
                      {b.patient_details.name} <span className="text-[10px] text-[#6B6B66] italic">({b.patient_details.age} yrs)</span>
                    </td>
                    <td className="py-3 px-3 text-xs">{b.referral}</td>
                    <td className="py-3 px-3 text-xs italic">{b.organisation}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold">₹{b.bill_amount}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'Paid' ? 'bg-emerald-50 text-emerald-800' :
                        b.status === 'Cancelled' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      {b.status === 'Pending' && (
                        <button
                          onClick={() => updateBillStatus(b.bill_id, 'Paid')}
                          className="px-2 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded hover:bg-emerald-700 transition-colors cursor-pointer"
                        >
                          Settle Paid
                        </button>
                      )}
                      {b.status !== 'Cancelled' && (
                        <button
                          onClick={() => updateBillStatus(b.bill_id, 'Cancelled')}
                          className="px-2 py-1 bg-red-50 text-red-600 font-bold text-[10px] rounded hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          Void Bill
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. FINANCIAL REPORTS */}
      {activeSubView === 'financial-reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] shadow-xs text-center space-y-1">
              <span className="text-xs text-[#9E9E96] font-mono block">LEDGER GROSS TURNOVER</span>
              <span className="text-2xl font-bold text-[#5A5A40] font-serif block">₹{billSettlements.reduce((s,b)=>s+ (b.status === 'Cancelled' ? 0: b.bill_amount),0).toFixed(1)}</span>
              <p className="text-[10px] text-emerald-600 font-bold">100% compliant with GST IN</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] shadow-xs text-center space-y-1">
              <span className="text-xs text-[#9E9E96] font-mono block">OUTSTANDING BAL_DUES</span>
              <span className="text-2xl font-bold text-[#5A5A40] font-serif block">₹{billSettlements.reduce((s,b)=>s+ (b.status === 'Pending' ? b.due_amount : 0),0).toFixed(1)}</span>
              <p className="text-[10px] text-amber-600 font-bold">Requires B2B postpaid reconciliations</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] shadow-xs text-center space-y-1">
              <span className="text-xs text-[#9E9E96] font-mono block">CURED TRANSACTIONS</span>
              <span className="text-2xl font-bold text-[#5A5A40] font-serif block">{billSettlements.filter(b=>b.status==='Paid').length} invoices</span>
              <p className="text-[10px] text-[#6B6B66]">Average cart yield: ₹{(billSettlements.reduce((s,b)=>s+b.bill_amount,0)/billSettlements.length).toFixed(1)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-4">
              <h4 className="text-sm font-bold text-[#2D2D2B] font-serif">Inflow Channel Performance</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={billSettlements.filter(b => b.status !== 'Cancelled').map(b=>({ name: b.patient_details.name.substring(0,8), Amount: b.bill_amount }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#9E9E96" fontSize={10} />
                    <YAxis stroke="#9E9E96" fontSize={10} />
                    <RechartTooltip />
                    <Bar dataKey="Amount" fill="#5A5A40" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-4">
              <h4 className="text-sm font-bold text-[#2D2D2B] font-serif">Concession Partner Allocations</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Direct Retail', value: billSettlements.filter(b=>b.organisation.includes('Walk-In') || !b.organisation).length },
                        { name: 'Corporate Concession', value: billSettlements.filter(b=>b.organisation && !b.organisation.includes('Walk-In')).length }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      <Cell fill="#5A5A40" />
                      <Cell fill="#9E9E96" />
                    </Pie>
                    <Legend />
                    <RechartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. ARCHIVES */}
      {activeSubView === 'archives' && (
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#2D2D2B] font-serif">Historical Diagnostics Archives</h3>
          <p className="text-xs text-[#6B6B66]">Intakes older than selected retention limits or explicitly toggled into system warehouse vault.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E2D9] text-[#9E9E96] font-mono leading-none">
                  <th className="py-3 px-3">PATIENT ID</th>
                  <th className="py-3 px-3">PATIENT NAME</th>
                  <th className="py-3 px-3">GENDER</th>
                  <th className="py-3 px-3">AGE</th>
                  <th className="py-3 px-3 font-mono text-center">HISTORIC STATUS</th>
                  <th className="py-3 px-3 text-right">ARCHIVAL ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2D9]/30 text-[#2D2D2B]">
                {patients.map(p => {
                  const isArchived = archivedPatientIds.includes(p.patient_id);
                  return (
                    <tr key={p.patient_id} className="hover:bg-[#FAF9F6]/50">
                      <td className="py-3 px-3 font-mono font-bold">{p.patient_id}</td>
                      <td className="py-3 px-3 font-bold">{p.patient_name}</td>
                      <td className="py-3 px-3">{p.gender}</td>
                      <td className="py-3 px-3 font-mono">{p.age} Yrs</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${isArchived ? 'bg-amber-100 text-amber-800':'bg-emerald-100 text-emerald-800'}`}>
                          {isArchived ? "Warehouse VaultED":"Active Online Record"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => toggleArchive(p.patient_id)}
                          className={`px-3 py-1 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                            isArchived ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-100 text-amber-800 hover:bg-amber-150'
                          }`}
                        >
                          {isArchived ? "Unvault to Active":"Send to Vault"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. REPORT PRINTS */}
      {activeSubView === 'report-prints' && (
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#2D2D2B] font-serif">Report Prints & Dispatch Tracker</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-[#E5E2D9] text-[#9E9E96] font-mono leading-none">
                  <th className="py-3 px-3">REPORT ID</th>
                  <th className="py-3 px-3">PATIENT NAME</th>
                  <th className="py-3 px-3">B2B CORP GROUP</th>
                  <th className="py-3 px-3">REFERRING DOCTOR</th>
                  <th className="py-3 px-3">PANELS</th>
                  <th className="py-3 px-3 text-center">PRINT DISPATCH</th>
                  <th className="py-3 px-3 text-right">CLINICAL ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2D9]/30 text-[#2D2D2B]">
                {reportPrints.map(r => (
                  <tr key={r.report_id} className="hover:bg-[#FAF9F6]/50">
                    <td className="py-3 px-3 font-mono font-bold text-[#5A5A40]">{r.report_id}</td>
                    <td className="py-3 px-3 font-bold">{r.patient_name}</td>
                    <td className="py-3 px-3 italic">{r.org_name}</td>
                    <td className="py-3 px-3">{r.referral}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#5A5A40] max-w-xs truncate">{r.tests.join(', ')}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${r.print_status ? 'bg-emerald-50 text-emerald-800' : 'bg-[#FAF9F6] border border-[#E5E2D9] text-[#6B6B66]'}`}>
                        {r.print_status ? "Dispatched" : "Pending Output"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedPrintReport(r)}
                        className="px-2.5 py-1.5 bg-[#F3F1ED] text-[#2D2D2B] font-bold text-[10px] rounded hover:bg-[#E5E2D9] transition-colors cursor-pointer"
                      >
                        Clinical Preview
                      </button>
                      <button
                        onClick={() => updateReportPrintStatus(r.report_id, !r.print_status)}
                        className={`px-2.5 py-1.5 font-bold text-[10px] rounded cursor-pointer transition-colors ${r.print_status ? 'bg-amber-100 text-amber-800':'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                      >
                        {r.print_status ? "Reset Status" : "Mark Dispatched"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. COLLECTION REPORTS */}
      {activeSubView === 'collection-reports' && (
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-4 text-xs text-[#2D2D2B]">
          <h3 className="text-base font-bold text-[#2D2D2B] font-serif">Specimen Collection Point Log</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#FAF9F6] border border-[#E5E2D9] p-4 rounded-xl space-y-1">
              <span className="block font-mono tracking-wider font-bold text-[10px] text-[#9E9E96]">CLINIC DESK INTAKES</span>
              <span className="block text-xl font-bold font-serif text-[#5A5A40]">{patients.filter(p=>p.logistics.sample_collected_from==='Lab Center').length} samples</span>
            </div>
            <div className="bg-[#FAF9F6] border border-[#E5E2D9] p-4 rounded-xl space-y-1">
              <span className="block font-mono tracking-wider font-bold text-[10px] text-[#9E9E96]">HOME VISIT OUTREACHES</span>
              <span className="block text-xl font-bold font-serif text-[#5A5A40]">{patients.filter(p=>p.logistics.sample_collected_from==='Home').length} samples</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse mt-4">
              <thead>
                <tr className="border-b border-[#E5E2D9] text-[#9E9E96] font-mono leading-none">
                  <th className="py-3 px-3">PATIENT ID</th>
                  <th className="py-3 px-3">PATIENT FULL NAME</th>
                  <th className="py-3 px-3">COLLECTED FROM</th>
                  <th className="py-3 px-3">COURIER SPEED</th>
                  <th className="py-3 px-3">VACCINATION STATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2D9]/30">
                {patients.map(p => (
                  <tr key={p.patient_id} className="hover:bg-[#FAF9F6]/50">
                    <td className="py-3 px-3 font-mono text-[#5A5A40]">{p.patient_id}</td>
                    <td className="py-3 px-3 font-bold">{p.patient_name}</td>
                    <td className="py-3 px-3">{p.logistics.sample_collected_from}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#5A5A40]">{p.logistics.mode_of_transport}</td>
                    <td className="py-3 px-3">{p.medical_history.vaccination_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. TESTS LIST CHECKLIST */}
      {activeSubView === 'tests-list' && (
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#2D2D2B] font-serif">Clinical Pathology active catalog</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testCatalog.map(t => (
              <div key={t.test_code} className="bg-[#FAF9F6] border border-[#E5E2D9] rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-mono font-bold text-xs bg-[#5A5A40] text-white px-2 py-0.5 rounded">{t.test_code}</span>
                  <span className="font-mono font-semibold font-bold text-xs text-emerald-800">₹{t.retail_price}</span>
                </div>
                <h4 className="font-bold text-[#2D2D2B] leading-snug">{t.test_name}</h4>
                <div className="pt-2 text-[10px] text-[#6B6B66] space-y-1 block border-t border-[#E5E2D9]/40 font-mono">
                  <p>Vial: {t.container_type}</p>
                  <p>Specimen: {t.sample_type}</p>
                  <p>TAT Limit: {t.average_tat}</p>
                  <p>Outsource Status: {t.outsource_status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. OPERATIONAL ACCESSION SPECIMEN TRACKER */}
      {activeSubView === 'operational-status' && (
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#2D2D2B] font-serif">Specimen Accession Routing pipeline</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E2D9] text-[#9E9E96] font-mono leading-none">
                  <th className="py-3 px-3">RECORD ACC_NO</th>
                  <th className="py-3 px-3">PATIENT ID</th>
                  <th className="py-3 px-3">DIAGNOSTICS CART</th>
                  <th className="py-3 px-3">INTAKE STAMP</th>
                  <th className="py-3 px-3 text-center">ACCESSIONAL ROUTE STATUS</th>
                  <th className="py-3 px-3 text-right">TRANSITION STEP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2D9]/30 text-[#2D2D2B]">
                {encounters.map(e => (
                  <tr key={e.encounter_id} className="hover:bg-[#FAF9F6]/50">
                    <td className="py-3 px-3 font-mono font-bold text-[#5A5A40]">{e.accession_no}</td>
                    <td className="py-3 px-3 font-semibold text-xs">{e.patient_id}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#5A5A40]">{e.tests_ordered.join(', ')}</td>
                    <td className="py-3 px-3">{e.created_at}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        e.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        e.status === 'Processing' ? 'bg-[#5A5A40]/10 text-[#5A5A40]' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      {e.status === 'Pending Accession' && (
                        <button
                          onClick={() => updateEncounterStatus(e.encounter_id, 'Sample Collected')}
                          className="px-2 py-1 bg-yellow-600 text-white font-bold text-[10px] rounded hover:bg-yellow-700 transition"
                        >
                          Collect Sample
                        </button>
                      )}
                      {e.status === 'Sample Collected' && (
                        <button
                          onClick={() => updateEncounterStatus(e.encounter_id, 'Processing')}
                          className="px-2 py-1 bg-sky-600 text-white font-bold text-[10px] rounded hover:bg-sky-700 transition"
                        >
                          Send to Lab Analyzer
                        </button>
                      )}
                      {e.status === 'Processing' && (
                        <button
                          onClick={() => updateEncounterStatus(e.encounter_id, 'Approved')}
                          className="px-2 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded hover:bg-emerald-700 transition"
                        >
                          Approve Release
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 11. ADVANCED SEARCH */}
      {activeSubView === 'advanced-search' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E2D9] p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#2D2D2B]">Select Advanced Filtering Rules</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Patient Profile Classification</label>
                <select 
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={advSearchType}
                  onChange={(e) => setAdvSearchType(e.target.value)}
                >
                  <option value="">-- All Classifications --</option>
                  <option value="Regular">Regular</option>
                  <option value="Corporate">Corporate</option>
                  <option value="VIP">VIP</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">State Region</label>
                <input
                  type="text"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  placeholder="e.g. Tamil Nadu or Delhi"
                  value={advSearchState}
                  onChange={(e) => setAdvSearchState(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Sex/Gender</label>
                <select 
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={advSearchGender}
                  onChange={(e) => setAdvSearchGender(e.target.value)}
                >
                  <option value="">-- All Genders --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Vaccination Status Key</label>
                <select 
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={advSearchVaccine}
                  onChange={(e) => setAdvSearchVaccine(e.target.value)}
                >
                  <option value="">-- All Vaccine States --</option>
                  <option value="Unvaccinated">Unvaccinated</option>
                  <option value="Partially Vaccinated">Partially Vaccinated</option>
                  <option value="Fully Vaccinated">Fully Vaccinated</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#2D2D2B] mb-4 font-serif">Dynamic Search Yield</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E2D9] text-[#9E9E96] font-mono leading-none">
                    <th className="py-3 px-3">PATIENT ID</th>
                    <th className="py-3 px-3">PATIENT FULL NAME</th>
                    <th className="py-3 px-3">VACCINATION STATE</th>
                    <th className="py-3 px-3">COURIER ROUTE</th>
                    <th className="py-3 px-3">STATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E2D9]/30 text-[#2D2D2B]">
                  {filteredAdvPatients.map(p => (
                    <tr key={p.patient_id} className="hover:bg-[#FAF9F6]/50">
                      <td className="py-3 px-3 font-mono font-bold text-[#5A5A40]">{p.patient_id}</td>
                      <td className="py-3 px-3 font-bold">{p.patient_name}</td>
                      <td className="py-3 px-3">{p.medical_history.vaccination_status}</td>
                      <td className="py-3 px-3 font-mono text-[#5A5A40]">{p.logistics.mode_of_transport}</td>
                      <td className="py-3 px-3">{p.address_details.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL VIEW DIALOG: PATIENT BIO CARD ----------------- */}
      {selectedAuditPatient && (
        <div className="fixed inset-0 bg-[#2D2D2B]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#E5E2D9] shadow-2xl max-w-2xl w-full overflow-hidden text-xs text-[#2D2D2B]">
            <div className="p-5 bg-[#FAF9F6] border-b border-[#E5E2D9] flex justify-between items-center">
              <div>
                <h4 className="text-md font-bold text-[#2D2D2B] font-serif">Diagnostic Bio-File Verification</h4>
                <p className="text-[10px] text-[#6B6B66]">ID: {selectedAuditPatient.patient_id} • MRN: {selectedAuditPatient.mrn}</p>
              </div>
              <button 
                onClick={() => setSelectedAuditPatient(null)}
                className="p-1 rounded-lg hover:bg-[#E5E2D9] text-[#6B6B66]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-120 overflow-y-auto">
              {/* Demographics */}
              <div className="grid grid-cols-3 gap-4 border-b border-[#FAF9F6] pb-4">
                <div>
                  <span className="text-[#9E9E96] font-mono block uppercase">Name</span>
                  <span className="font-bold text-sm block mt-0.5">{selectedAuditPatient.designation} {selectedAuditPatient.patient_name}</span>
                </div>
                <div>
                  <span className="text-[#9E9E96] font-mono block uppercase">Gender & Age</span>
                  <span className="font-bold text-sm block mt-0.5">{selectedAuditPatient.gender} • {selectedAuditPatient.age} Yrs</span>
                </div>
                <div>
                  <span className="text-[#9E9E96] font-mono block uppercase">Contact</span>
                  <span className="font-bold text-sm block mt-0.5">{selectedAuditPatient.contact_number}</span>
                </div>
              </div>

              {/* PatientAddress Details */}
              <div className="space-y-2">
                <h5 className="font-bold text-[#5A5A40] font-mono block">ADDRESS DOSSIER</h5>
                <div className="grid grid-cols-2 gap-2 bg-[#FAF9F6] p-3 rounded-lg border border-[#E5E2D9]">
                  <p><span className="text-[#6B6B66]">Street:</span> {selectedAuditPatient.address_details.address}</p>
                  <p><span className="text-[#6B6B66]">Area:</span> {selectedAuditPatient.address_details.location_area}</p>
                  <p><span className="text-[#6B6B66]">City/PIN:</span> {selectedAuditPatient.address_details.city} ({selectedAuditPatient.address_details.pincode})</p>
                  <p><span className="text-[#6B6B66]">State/Country:</span> {selectedAuditPatient.address_details.state}, {selectedAuditPatient.address_details.country}</p>
                </div>
              </div>

              {/* Medical History */}
              <div className="space-y-2">
                <h5 className="font-bold text-[#5A5A40] font-mono block">MEDICAL LOG HISTORY</h5>
                <div className="grid grid-cols-2 gap-2 bg-[#FAF9F6] p-3 rounded-lg border border-[#E5E2D9]">
                  <p><span className="text-[#6B6B66]">Vaccinated Status:</span> {selectedAuditPatient.medical_history.vaccination_status} ({selectedAuditPatient.medical_history.type_of_vaccine})</p>
                  <p><span className="text-[#6B6B66]">Arogya Setu Client:</span> {selectedAuditPatient.medical_history.arogya_setu_app ? "Yes":"No"}</p>
                  <p><span className="text-[#6B6B66]">Hospitalized Status:</span> {selectedAuditPatient.medical_history.is_hospitalized ? "Yes" : "No"}</p>
                  <p><span className="text-[#6B6B66]">Temperature Index:</span> {selectedAuditPatient.medical_history.body_temperature}</p>
                  <p className="col-span-2"><span className="text-[#6B6B66]">Pre-conditions:</span> {selectedAuditPatient.medical_history.medical_conditions.join(', ') || 'None reported'}</p>
                  <p className="col-span-2"><span className="text-[#6B6B66]">Symptoms:</span> {selectedAuditPatient.medical_history.symptoms.join(', ') || 'No active symptoms'}</p>
                  <p className="col-span-2"><span className="text-[#6B6B66]">Travel Logs:</span> {selectedAuditPatient.medical_history.travel_history.join(', ') || 'No recent travel outside boundary'}</p>
                </div>
              </div>

              {/* Logistics */}
              <div className="space-y-2">
                <h5 className="font-bold text-[#5A5A40] font-mono block">ROUTING LOGISTICS SHIPMENT</h5>
                <p>Intake Location: <span className="font-bold">{selectedAuditPatient.logistics.sample_collected_from}</span> • Shipping Mode: <span className="font-bold">{selectedAuditPatient.logistics.mode_of_transport}</span></p>
              </div>
            </div>

            <div className="p-4 bg-[#FAF9F6] border-t border-[#E5E2D9] flex justify-end">
              <button
                onClick={() => setSelectedAuditPatient(null)}
                className="px-4 py-2 bg-[#5A5A40] text-white font-bold rounded-lg hover:bg-[#4a4a35] transition cursor-pointer"
              >
                Done Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL VIEW DIALOG: CLINICAL REPORT PREVIEW ----------------- */}
      {selectedPrintReport && (
        <div className="fixed inset-0 bg-[#2D2D2B]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#E5E2D9] shadow-2xl max-w-2xl w-full overflow-hidden text-xs text-[#2D2D2B]">
            <div className="p-5 bg-[#FAF9F6] border-b border-[#E5E2D9] flex justify-between items-center">
              <div>
                <h4 className="text-md font-bold text-[#2D2D2B] font-serif">Clinical Pathology Laboratory Output Preview</h4>
                <p className="text-[10px] text-[#6B6B66]">Report Reference ID: {selectedPrintReport.report_id}</p>
              </div>
              <button 
                onClick={() => setSelectedPrintReport(null)}
                className="p-1 rounded-lg hover:bg-[#E5E2D9] text-[#6B6B66] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-120 overflow-y-auto font-sans bg-white border m-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start border-b-2 border-[#5A5A40] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[#2D2D2B] font-serif">DLabs Diagnostics Laboratory (Main HQ)</h3>
                  <p className="text-[10px] text-[#6B6B66]">ISO 9001:2015 Accredited reference laboratory</p>
                </div>
                <div className="text-right text-[10px] text-[#6B6B66]">
                  <p>Email: labs@dlabsfield.in</p>
                  <p>Tel: 011-45091211</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-[#FAF9F6] p-4 rounded-xl border border-[#E5E2D9]">
                <div>
                  <p><span className="text-[#9E9E96]">PATIENT:</span> <span className="font-bold">{selectedPrintReport.patient_name}</span></p>
                  <p><span className="text-[#9E9E96]">BILL REFERRAL:</span> <span className="italic">{selectedPrintReport.referral}</span></p>
                </div>
                <div className="text-right">
                  <p><span className="text-[#9E9E96]">DATE REGISTERED:</span> {selectedPrintReport.bill_date}</p>
                  <p><span className="text-[#9E9E96]">REPORT COMPILED:</span> {selectedPrintReport.report_date || 'Awaiting Laboratory Processing'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-[#5A5A40] border-b border-[#E5E2D9] pb-1 uppercase tracking-wider font-sans text-xs">Pathology diagnostics results directory</h4>
                <div className="space-y-3">
                  {selectedPrintReport.tests.map(testCode => {
                    const mathVal = Math.floor(10 + Math.random() * 150);
                    return (
                      <div key={testCode} className="flex justify-between items-center border-b border-[#E5E2D9]/35 pb-1">
                        <div>
                          <span className="font-bold text-[#2D2D2B]">{testCode} Panel Summary</span>
                          <span className="block text-[10px] text-[#6B6B66]">Automated diagnostic spectrophotometer assay</span>
                        </div>
                        <div className="text-right font-mono font-bold text-[#5A5A40]">
                          <span>{mathVal} mg/dL</span>
                          <span className="block text-[9px] text-emerald-800 font-bold uppercase">NORMAL INDEX</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-[9px] text-[#9E9E96] italic text-center pt-4 border-t border-[#E5E2D9]">
                This is a computer generated diagnostic verification report requiring no manual signature stamp.
              </p>
            </div>

            <div className="p-4 bg-[#FAF9F6] border-t border-[#E5E2D9] flex justify-end">
              <button
                onClick={() => {
                  updateReportPrintStatus(selectedPrintReport.report_id, true);
                  setSelectedPrintReport(null);
                }}
                className="px-4 py-2 bg-[#5A5A40] text-white font-bold rounded-lg hover:bg-[#4a4a35] transition cursor-pointer"
              >
                Conclude PDF Print & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
