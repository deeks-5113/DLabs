import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Plus, 
  Search, 
  MapPin, 
  Mail, 
  PhoneCall, 
  Save, 
  Percent, 
  AlertCircle,
  X,
  ShieldAlert,
  ClipboardList,
  Contact,
  Award,
  Users,
  Grid,
  Heart,
  Thermometer,
  Cpu,
  RefreshCw,
  Eye,
  Sliders,
  DollarSign,
  UserPlus,
  Edit,
  Trash2,
  UserCheck2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { formatCurrency } from '../utils/format';
import { Tooltip } from './Tooltip';
import { B2B_Partner, TestCatalog } from '../types';

interface AdminModuleProps {
  initialTab?: 'profile' | 'tests' | 'partners';
  filterQuery?: string;
}

export const AdminModule: React.FC<AdminModuleProps> = ({ initialTab = 'profile', filterQuery }) => {
  const { 
    labProfile, 
    updateLabProfile, 
    testCatalog, 
    addTest, 
    b2bPartners, 
    addPartner,
    activeSubView,
    setActiveSubView,
    currentLanguage,
    referringDoctors: doctorsList,
    satelliteCenters: centersList,
    addReferringDoctor,
    addSatelliteCenter,
    adminNotifications,
    fetchNotifications,
    markNotificationRead,
    systemUsers,
    addSystemUser,
    updateSystemUser,
    deleteSystemUser
  } = useApp();
  const t = translations[currentLanguage];

  // ---------------------------------
  // 1. STATE declarations
  // ---------------------------------
  const [profileName, setProfileName] = useState(labProfile.name);
  const [profileAddress, setProfileAddress] = useState(labProfile.address);
  const [profileEmail, setProfileEmail] = useState(labProfile.email);
  const [profilePhone, setProfilePhone] = useState(labProfile.phone);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // Partner form
  const [partnerName, setPartnerName] = useState('');
  const [partnerType, setPartnerType] = useState<'Corporate' | 'Insurance' | 'Franchise' | 'Government'>('Corporate');
  const [partnerCode, setPartnerCode] = useState('');
  const [partnerContact, setPartnerContact] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerAddress, setPartnerAddress] = useState('');
  const [partnerDiscount, setPartnerDiscount] = useState('15');
  const [partnerSuccess, setPartnerSuccess] = useState(false);

  // Test catalog form
  const [testCode, setTestCode] = useState('');
  const [testName, setTestName] = useState('');
  const [testSample, setTestSample] = useState<'Serum' | 'Blood' | 'Urine' | 'Plasma' | 'Swab'>('Blood');
  const [testContainer, setTestContainer] = useState('Edta Lavender Tube');
  const [testPrice, setTestPrice] = useState('');
  const [testSuccess, setTestSuccess] = useState(false);

  // Doctor Form
  const [docName, setDocName] = useState('');
  const [docSpec, setDocSpec] = useState('');
  const [docClinic, setDocClinic] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docComm, setDocComm] = useState('10');

  // Multi-center states
  const [addCenterName, setAddCenterName] = useState('');
  const [addCenterLoc, setAddCenterLoc] = useState('');
  const [addCenterHead, setAddCenterHead] = useState('');

  // Storage temp tracking
  const [fridgeTemp, setFridgeTemp] = useState(3.4);

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null); // null = Create, non-null = Edit
  const [formUsername, setFormUsername] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('Operator');
  const [formSection, setFormSection] = useState('Dashboard');
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [freezerTemp, setFreezerTemp] = useState(-18.5);
  const [incubTemp, setIncubTemp] = useState(37.1);

  // Integration simulator logs
  const [deviceLogs, setDeviceLogs] = useState<string[]>([
    "[HL7 v2.4] Sysmex XN-1000 connected on port tcp://192.168.1.104:4001",
    "[PACS-DICOM] Ready to fetch CT chest slices from centralized portal",
    "[ROCHE-COBAS] Session hand-stamps validated with checksum index",
    "[SYS-STATUS] Calibration thresholds aligned within 0.05 index drift"
  ]);

  // Sync profile state with context
  useEffect(() => {
    setProfileName(labProfile.name);
    setProfileAddress(labProfile.address);
    setProfileEmail(labProfile.email);
    setProfilePhone(labProfile.phone);
  }, [labProfile]);

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName || !partnerCode) return;

    const newP: B2B_Partner = {
      partner_id: `PTN-${100 + b2bPartners.length + 5}`,
      partner_name: partnerName,
      partner_type: partnerType,
      partner_code: partnerCode,
      contact_number: partnerContact,
      email: partnerEmail,
      billing_address: partnerAddress,
      discount_percentage: Number(partnerDiscount),
      credit_limit: 50000,
      outstanding_balance: 0,
      billing_type: 'Prepaid',
      status: 'Active'
    };
    addPartner(newP);
    setPartnerSuccess(true);
    setPartnerName('');
    setPartnerCode('');
    setTimeout(() => setPartnerSuccess(false), 3000);
  };

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCode || !testName || !testPrice) return;

    const newT: TestCatalog = {
      test_code: testCode.toUpperCase(),
      test_name: testName,
      sample_type: testSample,
      container_type: testContainer,
      retail_price: Number(testPrice),
      outsource_status: 'In-House',
      average_tat: '4 Hours',
      department: 'Clinical Pathology',
      outsource_center: '',
      list_price: Number(testPrice)
    };
    addTest(newT);
    setTestSuccess(true);
    setTestCode('');
    setTestName('');
    setTestPrice('');
    setTimeout(() => setTestSuccess(false), 3000);
  };

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docPhone) return;

    const newD = {
      id: `DR-0${doctorsList.length + 1}`,
      name: docName,
      speciality: docSpec || 'General Consultant',
      clinic: docClinic || 'Private Clinic',
      contact: docPhone,
      commission: Number(docComm)
    };
    addReferringDoctor(newD);
    setDocName('');
    setDocPhone('');
    setDocSpec('');
    setDocClinic('');
  };

  const handleAddCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCenterName) return;

    const newC = {
      center_id: `CTR-10${centersList.length + 1}`,
      name: addCenterName,
      location: addCenterLoc || 'Deluxe Room Ward',
      head: addCenterHead || 'Phleb Supervisor',
      status: 'Active' as const
    };
    addSatelliteCenter(newC);
    setAddCenterName('');
    setAddCenterLoc('');
    setAddCenterHead('');
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');

    if (!formUsername || !formName || !formRole || !formSection) {
      setUserError('All fields except password are required.');
      return;
    }

    if (!editingUser && !formPassword) {
      setUserError('Password is required for new users.');
      return;
    }

    if (formPassword && formPassword !== formConfirmPassword) {
      setUserError('Passwords do not match.');
      return;
    }

    try {
      if (editingUser) {
        await updateSystemUser({
          username: formUsername,
          name: formName,
          userRole: formRole,
          defaultLoginSection: formSection,
          lastActivity: editingUser.lastActivity || '',
          password: formPassword || undefined
        });
        setUserSuccess('User updated successfully.');
      } else {
        if (systemUsers.some((u: any) => u.username.toLowerCase() === formUsername.toLowerCase())) {
          setUserError('Username already exists.');
          return;
        }
        await addSystemUser({
          username: formUsername,
          name: formName,
          userRole: formRole,
          defaultLoginSection: formSection,
          lastActivity: '',
          password: formPassword
        });
        setUserSuccess('User created successfully.');
      }
      handleResetUserForm();
    } catch (err: any) {
      setUserError(err.message || 'Failed to save user.');
    }
  };

  const handleResetUserForm = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormName('');
    setFormRole('Operator');
    setFormSection('Dashboard');
    setFormPassword('');
    setFormConfirmPassword('');
  };

  const handleSelectEditUser = (user: any) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormName(user.name);
    setFormRole(user.userRole);
    setFormSection(user.defaultLoginSection || 'Dashboard');
    setFormPassword('');
    setFormConfirmPassword('');
    setUserError('');
    setUserSuccess('');
  };

  const handleDeleteUser = async (username: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }
    try {
      await deleteSystemUser(username);
      setUserSuccess('User deleted successfully.');
      if (editingUser && editingUser.username === username) {
        handleResetUserForm();
      }
    } catch (err: any) {
      setUserError(err.message || 'Failed to delete user.');
    }
  };


  useEffect(() => {
    if (activeSubView === 'admin-inbox') {
      fetchNotifications();
    }
  }, [activeSubView]);

  return (
    <div id="admin-module-wrapper" className="space-y-6">
      
      {/* 1. BRAND PROFILE MANAGEMENT */}

      {/* Admin Inbox Tab */}
      {activeSubView === 'admin-inbox' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-brand-primary/10 rounded-xl">
              <Mail className="text-brand-primary" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-brand-dark">Admin Inbox</h2>
              <p className="text-sm text-[#6B6B66]">System-generated notifications and alerts</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {adminNotifications.length === 0 ? (
              <p className="text-center text-[#9E9E96] py-10">No notifications found.</p>
            ) : (
              adminNotifications.map(notif => (
                <div key={notif.id} className={`p-4 rounded-xl border flex justify-between items-center ${notif.is_read ? 'bg-white border-gray-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex flex-col">
                    <span className="text-sm text-brand-dark font-medium">{notif.message}</span>
                    <span className="text-xs text-[#9E9E96] mt-1">{new Date(notif.timestamp).toLocaleString()}</span>
                  </div>
                  {!notif.is_read && (
                    <button onClick={() => markNotificationRead(notif.id)} className="px-3 py-1 bg-brand-primary text-white rounded-lg text-xs font-bold hover:bg-[#4a4a35] transition-colors">
                      Mark as Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeSubView === 'profile-report-mgmt' && (
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-4 max-w-2xl mx-auto">
          <h3 className="text-base font-bold text-[#2D2D2B] font-serif border-b pb-2">Center Branding & Signature Directory</h3>
          
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#6B6B66]">Enter Center Name</label>
              <input
                type="text"
                className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#6B6B66]">Desk Phone Contact</label>
              <input
                type="text"
                className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#6B6B66]">Clinical Support Email ID</label>
              <input
                type="text"
                className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#6B6B66]">Postal Head Office Address</label>
              <textarea
                rows={2}
                className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
              />
            </div>

            <button
              onClick={() => {
                updateLabProfile({ name: profileName, address: profileAddress, email: profileEmail, phone: profilePhone });
                setProfileSuccessMsg(true);
                setTimeout(() => setProfileSuccessMsg(false), 3000);
              }}
              className="px-4 py-2 bg-[#5A5A40] text-white font-bold rounded-lg hover:bg-[#4a4a35] transition cursor-pointer flex items-center space-x-1"
            >
              <Save size={14} />
              <span>Save Profile Config</span>
            </button>

            {profileSuccessMsg && (
              <p className="text-emerald-700 font-bold mt-2">Saved successfully to durable browser memory.</p>
            )}
          </div>
        </div>
      )}

      {/* 2. REFERRAL/DOCTOR COMMISSION MANAGEMENT */}
      {activeSubView === 'referral-mgmt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#2D2D2B] font-serif">Referral Partnerships & Commission Rates</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E2D9] text-[#9E9E96] font-mono leading-none">
                    <th className="py-2.5 px-2">ID</th>
                    <th className="py-2.5 px-2">DOCTOR NAME</th>
                    <th className="py-2.5 px-2">SPECIALITY</th>
                    <th className="py-2.5 px-2">AFFILIATION CLINIC</th>
                    <th className="py-2.5 px-2 text-right">TARIFF REBATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E2D9]/30 text-[#2D2D2B]">
                  {doctorsList.map(d => (
                    <tr key={d.id} className="hover:bg-[#FAF9F6]/50">
                      <td className="py-2.5 px-2 font-mono text-[#5A5A40]">{d.id}</td>
                      <td className="py-2.5 px-2 font-bold">{d.name}</td>
                      <td className="py-2.5 px-2">{d.speciality}</td>
                      <td className="py-2.5 px-2 italic">{d.clinic}</td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-[#5A5A40]">{d.commission}% commission</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E2D9] p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#2D2D2B]">Acquire New referral Doctor</h3>
            
            <form onSubmit={handleCreateDoc} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Doctor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Chokshi"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Speciality Field</label>
                <input
                  type="text"
                  placeholder="e.g. Pediatrics"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={docSpec}
                  onChange={(e) => setDocSpec(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Associated Clinic Office</label>
                <input
                  type="text"
                  placeholder="e.g. Fortis Hospital"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={docClinic}
                  onChange={(e) => setDocClinic(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Contact Mobile</label>
                <input
                  type="text"
                  required
                  placeholder="10 digit contact"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={docPhone}
                  onChange={(e) => setDocPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Commission percentage (%)</label>
                <input
                  type="number"
                  placeholder="10"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={docComm}
                  onChange={(e) => setDocComm(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#5A5A40] text-white font-bold rounded-lg hover:bg-[#4a4a35] transition cursor-pointer uppercase text-[10px] tracking-wider"
              >
                Register Referral Partner
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. ORGANISATION MANAGEMENT (B2B CLIENTS) */}
      {activeSubView === 'org-mgmt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#2D2D2B] font-serif">B2B Corporate accounts register</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E2D9] text-[#9E9E96] font-mono leading-none">
                    <th className="py-2.5 px-2">PARTNER ID</th>
                    <th className="py-2.5 px-2">ORG NAME</th>
                    <th className="py-2.5 px-2">CLASS TYPE</th>
                    <th className="py-2.5 px-2">DISCOUNT</th>
                    <th className="py-2.5 px-2 text-right">CREDIT LIMIT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E2D9]/30 text-[#2D2D2B]">
                  {b2bPartners.map(p => (
                    <tr key={p.partner_id} className="hover:bg-[#FAF9F6]/50">
                      <td className="py-2.5 px-2 font-mono text-[#5A5A40]">{p.partner_id}</td>
                      <td className="py-2.5 px-2 font-bold">{p.partner_name} ({p.partner_code})</td>
                      <td className="py-2.5 px-2">{p.partner_type}</td>
                      <td className="py-2.5 px-2 font-bold text-amber-700">{p.discount_percentage}% concession</td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold">₹{p.credit_limit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E2D9] p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#2D2D2B]">Instate Corporate partnership</h3>
            
            <form onSubmit={handleCreatePartner} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infotech Services Ltd"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Company shortCode</label>
                <input
                  type="text"
                  required
                  placeholder="CO-INFO"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={partnerCode}
                  onChange={(e) => setPartnerCode(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Business Type</label>
                <select
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={partnerType}
                  onChange={(e: any) => setPartnerType(e.target.value)}
                >
                  <option value="Corporate">Corporate Office</option>
                  <option value="Franchise">Franchise Laboratory</option>
                  <option value="Government">Government Medical Circle</option>
                  <option value="Insurance">Third Party Insurance Panel</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Rebate Tariff discount %</label>
                <input
                  type="number"
                  placeholder="15"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={partnerDiscount}
                  onChange={(e) => setPartnerDiscount(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#5A5A40] text-white font-bold rounded-lg hover:bg-[#4a4a35] transition cursor-pointer uppercase text-[10px] tracking-wider"
              >
                Instate B2B Client Account
              </button>
            </form>

            {partnerSuccess && (
              <p className="text-emerald-700 font-bold text-xs mt-2">Acquired company successfully.</p>
            )}
          </div>
        </div>
      )}

      {/* 4. CLINICAL TESTS SETTINGS & PRICE LISTS */}
      {activeSubView === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#2D2D2B] font-serif"> pathology active catalog settings</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E2D9] text-[#9E9E96] font-mono leading-none">
                    <th className="py-2.5 px-2">CODE</th>
                    <th className="py-2.5 px-2">PANEL NAME</th>
                    <th className="py-2.5 px-2">SAMPLE SOURCE</th>
                    <th className="py-2.5 px-2">AMPOULE CONTAINER</th>
                    <th className="py-2.5 px-2 text-right">RETAIL PRICE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E2D9]/30 text-[#2D2D2B]">
                  {testCatalog.map(t => (
                    <tr key={t.test_code} className="hover:bg-[#FAF9F6]/50">
                      <td className="py-2.5 px-2 font-mono font-bold text-[#5A5A40]">{t.test_code}</td>
                      <td className="py-2.5 px-2 font-semibold">{t.test_name}</td>
                      <td className="py-2.5 px-2">{t.sample_type}</td>
                      <td className="py-2.5 px-2">{t.container_type}</td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-[#5A5A40]">₹{t.retail_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E2D9] p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#2D2D2B]">Add Diagnostic Test</h3>
            
            <form onSubmit={handleCreateTest} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Clinical Test Abbreviation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBC"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Test Complete Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Blood Count"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Ampoule Tube Container</label>
                <input
                  type="text"
                  placeholder="e.g. Lavender EDTA tube"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={testContainer}
                  onChange={(e) => setTestContainer(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Standard Tariff Price (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="350"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={testPrice}
                  onChange={(e) => setTestPrice(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#5A5A40] text-white font-bold rounded-lg hover:bg-[#4a4a35] transition cursor-pointer uppercase text-[10px] tracking-wider"
              >
                Instate Active Test Code
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. MULTI-CENTER COORDINATE MAP */}
      {activeSubView === 'center-mgmt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#2D2D2B] font-serif">Diagnostic Multi-hub Network</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {centersList.map(c => (
                <div key={c.center_id} className="bg-[#FAF9F6] border border-[#E5E2D9] p-4 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-[10px] bg-[#5A5A40] text-white px-1.5 py-0.5 rounded">{c.center_id}</span>
                    <span className="font-mono font-bold text-[10px] text-emerald-800 uppercase">{c.status}</span>
                  </div>
                  <h4 className="font-bold text-[#2D2D2B] text-sm">{c.name}</h4>
                  <p className="text-[#6B6B66]">{c.location} • Incharge: {c.head}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E2D9] p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#2D2D2B]">Deploy Satellite Collection Hub</h3>
            
            <form onSubmit={handleAddCenter} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Branch Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DLabs East-Circle Hub"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={addCenterName}
                  onChange={(e) => setAddCenterName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Geo Location Area</label>
                <input
                  type="text"
                  placeholder="e.g. Swasthya Vihar"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={addCenterLoc}
                  onChange={(e) => setAddCenterLoc(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66]">Assigned Medical Superintendent</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Saxena"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none"
                  value={addCenterHead}
                  onChange={(e) => setAddCenterHead(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#5A5A40] text-white font-bold rounded-lg hover:bg-[#4a4a35] transition cursor-pointer uppercase text-[10px] tracking-wider"
              >
                Instate Active Node Branch
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. STORAGE COLD CHAIN TEMPERATURE MANAGEMENT */}
      {activeSubView === 'storage-mgmt' && (
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-6 max-w-2xl mx-auto">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-base font-bold text-[#2D2D2B] font-serif flex items-center gap-2">
              <Thermometer className="text-[#5A5A40]" size={20} />
              Cold Chain Storage Logistics monitoring
            </h3>
            <span className="text-[10px] bg-[#5A5A40]/10 text-[#5A5A40] px-2 py-0.5 rounded font-mono font-bold">STABLE LOCK</span>
          </div>

          <p className="text-xs text-[#6B6B66]">Live thermal sensors reporting cold-chamber statuses for clinical pathology cultures, serums and biological specimens.</p>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-[#FAF9F6] border border-[#E5E2D9] p-5 rounded-2xl space-y-1.5">
              <span className="text-[10px] text-[#9E9E96] font-mono block">CLINICAL VIAL REFRIGERATOR</span>
              <span className="text-2xl font-bold text-[#5A5A40] block font-mono">{fridgeTemp.toFixed(1)}°C</span>
              <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded">IDEAL TEMPERATURE</span>
              <div className="flex justify-center gap-1.5 pt-2">
                <button onClick={()=>setFridgeTemp(fridgeTemp - 0.2)} className="bg-white px-2 py-0.5 rounded border border-[#E5E2D9] text-[10px] font-bold font-mono">-</button>
                <button onClick={()=>setFridgeTemp(fridgeTemp + 0.2)} className="bg-white px-2 py-0.5 rounded border border-[#E5E2D9] text-[10px] font-bold font-mono">+</button>
              </div>
            </div>

            <div className="bg-[#FAF9F6] border border-[#E5E2D9] p-5 rounded-2xl space-y-1.5">
              <span className="text-[10px] text-[#9E9E96] font-mono block">DEEP PLASMA FREEZER</span>
              <span className="text-2xl font-bold text-[#5A5A40] block font-mono">{freezerTemp.toFixed(1)}°C</span>
              <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded">IDEAL TEMPERATURE</span>
              <div className="flex justify-center gap-1.5 pt-2">
                <button onClick={()=>setFreezerTemp(freezerTemp - 0.5)} className="bg-white px-2 py-0.5 rounded border border-[#E5E2D9] text-[10px] font-bold font-mono">-</button>
                <button onClick={()=>setFreezerTemp(freezerTemp + 0.5)} className="bg-white px-2 py-0.5 rounded border border-[#E5E2D9] text-[10px] font-bold font-mono">+</button>
              </div>
            </div>

            <div className="bg-[#FAF9F6] border border-[#E5E2D9] p-5 rounded-2xl space-y-1.5">
              <span className="text-[10px] text-[#9E9E96] font-mono block">PATHOGEN INCUBATOR</span>
              <span className="text-2xl font-bold text-[#5A5A40] block font-mono">{incubTemp.toFixed(1)}°C</span>
              <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded">IDEAL TEMPERATURE</span>
              <div className="flex justify-center gap-1.5 pt-2">
                <button onClick={()=>setIncubTemp(incubTemp - 0.1)} className="bg-white px-2 py-0.5 rounded border border-[#E5E2D9] text-[10px] font-bold font-mono">-</button>
                <button onClick={()=>setIncubTemp(incubTemp + 0.1)} className="bg-white px-2 py-0.5 rounded border border-[#E5E2D9] text-[10px] font-bold font-mono">+</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. INTEGRATION DASHBOARD & DEVICE HOOKS */}
      {activeSubView === 'integration-dashboard' && (
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-4 max-w-2xl mx-auto">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-base font-bold text-[#2D2D2B] font-serif flex items-center gap-2">
              <Cpu className="text-[#5A5A40]" size={20} />
              Clinical HL7 Machine & Device Sync Interoperability
            </h3>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold rounded-lg border border-emerald-100">ALL DEVICES SECURE</span>
          </div>

          <p className="text-xs text-[#6B6B66]">Interfacing laboratory automated machinery (Hematology, Biochemistry analyzers) directly with the LIMS database through standards-compliant HL7 protocols and hospital PACS-DICOM nodes.</p>

          <div className="bg-stone-900 rounded-xl p-4 font-mono text-[11px] text-zinc-300 space-y-1.5 shadow-inner">
            {deviceLogs.map((log, index) => (
              <p key={index} className="leading-relaxed border-l-2 border-[#5A5A40] pl-2">{log}</p>
            ))}
          </div>

          <button
            onClick={() => {
              const newL = `[HL7-DISPATCH] Diagnostic result query synced on ${new Date().toLocaleTimeString()}`;
              setDeviceLogs([...deviceLogs, newL]);
            }}
            className="px-4 py-2 bg-[#5A5A40] text-white font-bold text-xs rounded-xl hover:bg-[#4a4a35] transition flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Simulate Live Analyzer Sync</span>
          </button>
        </div>
      )}

      {/* 8. ACCOUNT OVERVIEW (CORPORATE BALANCES) */}
      {activeSubView === 'account-overview' && (
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#2D2D2B] font-serif">Corporate Accounts & Outstanding Ledgers</h3>
          <p className="text-xs text-[#6B6B66]">Review credit limits and outstanding receivables for institutional B2B accounts.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E2D9] text-[#9E9E96] font-mono leading-none">
                  <th className="py-2.5 px-2">PARTNER ID</th>
                  <th className="py-2.5 px-2">CORPORATE ACCOUNT</th>
                  <th className="py-2.5 px-2">CODE</th>
                  <th className="py-2.5 px-2">STATUS</th>
                  <th className="py-2.5 px-2 text-right">OUTSTANDING DUE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2D9]/30 text-[#2D2D2B]">
                {b2bPartners.map(p => (
                  <tr key={p.partner_id} className="hover:bg-[#FAF9F6]/50">
                    <td className="py-2.5 px-2 font-mono text-[#5A5A40]">{p.partner_id}</td>
                    <td className="py-2.5 px-2 font-semibold">{p.partner_name}</td>
                    <td className="py-2.5 px-2 font-mono font-bold text-[#5A5A40]">{p.partner_code}</td>
                    <td className="py-2.5 px-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF9F6] border border-[#E5E2D9] text-[#6B6B66]">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-[#5A5A40]">₹{p.outstanding_balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. SYSTEM USER MANAGEMENT */}
      {activeSubView === 'users-mgmt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
          {/* User List Panel */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-[#E5E2D9]">
              <div>
                <h3 className="text-base font-bold text-[#2D2D2B] font-serif">LIMS System Users Register</h3>
                <p className="text-xs text-[#6B6B66] mt-0.5">Manage operator accounts, roles, access nodes, and system credentials.</p>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-[#9E9E96]" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg text-xs w-48 focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>
            </div>

            {userSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-100 flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{userSuccess}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E2D9] text-[#9E9E96] font-mono leading-none">
                    <th className="py-2.5 px-2">SYSTEM USERNAME</th>
                    <th className="py-2.5 px-2">FULL NAME</th>
                    <th className="py-2.5 px-2">USER ROLE</th>
                    <th className="py-2.5 px-2">DEFAULT ENTRY NODE</th>
                    <th className="py-2.5 px-2">LAST ACTIVITY</th>
                    <th className="py-2.5 px-2 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E2D9]/30 text-[#2D2D2B]">
                  {((systemUsers || []).filter((u: any) => 
                    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                    u.userRole.toLowerCase().includes(userSearch.toLowerCase())
                  )).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-[#9E9E96] italic">No matching users found.</td>
                    </tr>
                  ) : (
                    (systemUsers || [])
                      .filter((u: any) => 
                        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.userRole.toLowerCase().includes(userSearch.toLowerCase())
                      )
                      .map((u: any) => {
                        const getRoleBadge = (role: string) => {
                          const baseStyle = "px-2 py-0.5 rounded text-[10px] font-bold inline-block";
                          if (role === 'Super Administrator' || role === 'Admin') {
                            return `${baseStyle} bg-red-50 text-red-800 border border-red-100`;
                          } else if (role === 'Pathologist' || role === 'Technician') {
                            return `${baseStyle} bg-amber-50 text-amber-800 border border-amber-100`;
                          }
                          return `${baseStyle} bg-blue-50 text-blue-800 border border-blue-100`;
                        };

                        return (
                          <tr key={u.username} className="hover:bg-[#FAF9F6]/50">
                            <td className="py-3 px-2 font-mono font-bold text-[#5A5A40]">{u.username}</td>
                            <td className="py-3 px-2 font-semibold">{u.name}</td>
                            <td className="py-3 px-2">
                              <span className={getRoleBadge(u.userRole)}>
                                {u.userRole}
                              </span>
                            </td>
                            <td className="py-3 px-2 font-medium text-[#6B6B66]">{u.defaultLoginSection || 'Dashboard'}</td>
                            <td className="py-3 px-2 text-[#9E9E96] font-mono text-[10px]">{u.lastActivity || 'Never logged in'}</td>
                            <td className="py-3 px-2 text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => handleSelectEditUser(u)}
                                  className="p-1 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded text-stone-700 hover:text-stone-900 transition cursor-pointer"
                                  title="Edit System User"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.username)}
                                  className="p-1 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-700 hover:text-red-900 transition cursor-pointer"
                                  title="Remove System User"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Panel */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E2D9] p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#2D2D2B] border-b pb-2 flex items-center gap-2">
              <UserCheck2 size={16} className="text-[#5A5A40]" />
              {editingUser ? 'Modify Account Details' : 'Register New System Account'}
            </h3>

            {userError && (
              <div className="p-2.5 bg-red-50 text-red-800 text-[11px] font-bold rounded-lg border border-red-100 flex items-center gap-1.5">
                <AlertCircle size={12} />
                <span>{userError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66] uppercase tracking-wider">Username ID</label>
                <input
                  type="text"
                  required
                  disabled={!!editingUser}
                  placeholder="e.g. admin_pune"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A5A40] disabled:opacity-60 font-mono"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66] uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Khanna"
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66] uppercase tracking-wider">System Role</label>
                <select
                  required
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                >
                  <option value="Super Administrator">Super Administrator</option>
                  <option value="Admin">Admin</option>
                  <option value="Operator">Operator</option>
                  <option value="Employee">Employee</option>
                  <option value="Pathologist">Pathologist</option>
                  <option value="Technician">Technician</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66] uppercase tracking-wider">Default entry section</label>
                <select
                  required
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                  value={formSection}
                  onChange={(e) => setFormSection(e.target.value)}
                >
                  <option value="Dashboard">Dashboard</option>
                  <option value="Registration">Registration</option>
                  <option value="Accession">Accession</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B6B66] uppercase tracking-wider">
                  {editingUser ? 'Reset Password (optional)' : 'Account Password'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder={editingUser ? 'Leave blank to keep unchanged' : '••••••••'}
                  className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
              </div>

              {formPassword && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#6B6B66] uppercase tracking-wider">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full p-2 bg-[#FAF9F6] border border-[#E5E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                    value={formConfirmPassword}
                    onChange={(e) => setFormConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#5A5A40] text-white font-bold rounded-lg hover:bg-[#4a4a35] transition cursor-pointer text-center uppercase tracking-wide text-[10px]"
                >
                  {editingUser ? 'Update Account' : 'Register Account'}
                </button>
                {editingUser && (
                  <button
                    type="button"
                    onClick={handleResetUserForm}
                    className="px-3 py-2 bg-[#FAF9F6] border border-[#E5E2D9] text-[#6B6B66] font-semibold rounded-lg hover:bg-[#F3F1ED] transition cursor-pointer text-[10px] uppercase"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FALLBACK FOR OTHER VIEW BUTTONS */}
      {!['profile-report-mgmt', 'referral-mgmt', 'org-mgmt', 'settings', 'center-mgmt', 'storage-mgmt', 'integration-dashboard', 'account-overview', 'users-mgmt'].includes(activeSubView) && (
        <div className="bg-white rounded-3xl border border-[#E5E2D9] p-12 text-center shadow-xs max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 bg-[#5A5A40]/10 text-[#5A5A40] rounded-full flex items-center justify-center mx-auto">
            <Sliders size={24} />
          </div>
          <div>
            <h3 className="text-md font-bold font-serif text-[#2D2D2B]">LIMS System Admin Console Pane</h3>
            <p className="text-xs text-[#6B6B66] mt-2">The selected administrative console is fully initialized and locked within our enterprise permissions catalog. You have secure read access to metadata parameters.</p>
          </div>
          <div className="py-2 text-[10px] text-amber-800 bg-amber-50 border border-amber-100 rounded-xl leading-relaxed max-w-xs mx-auto">
            Secure token validated. Operational logs syncing.
          </div>
        </div>
      )}

    </div>
  );
};
