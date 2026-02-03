import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame, Plus, Search, Eye, Edit2, Trash2, X,
  Check, Clock, XOctagon, LayoutGrid, Wallet,
  Sparkles, Filter, MoreHorizontal, ArrowUpRight,
  ArrowLeft
} from 'lucide-react';
import type { UserData } from '../services/authService';
import { getAgentDashboard, getAuthorityPriestInfo, getAuthToken, getUserData, type DashboardStats } from '../services/dashboardservice';
import { Navbar } from '../components/Navbar';
import flameIcon from "../assets/flame.svg"

// --- SACRED GEOMETRY & 3D STYLE INJECTION ---
const sacredStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Philosopher:ital,wght@0,400;0,700;1,400&family=Urbanist:wght@300;400;500;600;700&display=swap');
  
  :root {
    --c-primary: #D97706; 
    --c-secondary: #9F1239;
    --c-bg: #FFFBF2; 
    --c-stone-light: #FFFFFF;
    --c-stone-shadow: #E6DCC8;
    --c-text: #292524;
  }
  
  body {
    background-color: var(--c-bg);
    font-family: 'Urbanist', sans-serif;
    color: var(--c-text);
    overflow-x: hidden;
  }

  .font-sacred { font-family: 'Philosopher', serif; }
  
  /* --- 3D Embedded Look (Neumorphic/Stone) --- */
  .stone-card {
    background: linear-gradient(145deg, #ffffff, #fff8f0);
    box-shadow: 
      8px 8px 16px var(--c-stone-shadow), 
      -8px -8px 16px #ffffff;
    border: 1px solid rgba(255,255,255,0.4);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .stone-card:hover {
   
    box-shadow: 
      15px 15px 25px rgba(217, 119, 6, 0.15), 
      -8px -8px 16px #ffffff;
    border-color: rgba(217, 119, 6, 0.2);
  }

  .stone-inset {
    background: #fdfaf4;
    box-shadow: inset 3px 3px 6px #e6dfcf, inset -3px -3px 6px #ffffff;
    border-radius: 12px;
  }

  /* --- Complex Geometric Backgrounds --- */
  .geo-pattern {
    position: fixed;
    pointer-events: none;
    z-index: -1;
    opacity: 0.4;
  }
  
  /* Sri Yantra-ish Lines */
  .yantra-lines {
    background-image: repeating-linear-gradient(
      45deg,
      rgba(217, 119, 6, 0.03) 0px,
      rgba(217, 119, 6, 0.03) 1px,
      transparent 1px,
      transparent 10px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(159, 18, 57, 0.03) 0px,
      rgba(159, 18, 57, 0.03) 1px,
      transparent 1px,
      transparent 10px
    );
  }

  /* --- Clip Paths --- */
  .clip-chamfer {
    clip-path: polygon(
      15px 0, 100% 0, 
      100% calc(100% - 15px), calc(100% - 15px) 100%, 
      0 100%, 0 15px
    );
  }
  
  .clip-hex-btn {
    clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
  }

  /* --- Animations --- */
  @keyframes float-gentle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  .animate-float { animation: float-gentle 6s ease-in-out infinite; }

  @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .animate-spin-slow { animation: spin-slow 120s linear infinite; }

  /* Table Animations */
  .table-row-animate {
    transition: transform 0.2s ease, background-color 0.2s;
  }
  .table-row-animate:hover {
    transform: translateX(4px);
    background-color: rgba(217, 119, 6, 0.03);
    z-index: 10;
    position: relative;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #f1f1f1; }
  ::-webkit-scrollbar-thumb { background: #D97706; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #9F1239; }
`;

interface RegisteredPriest {
  id: number;
  agentId: string;
  priestName: string;
  priestPhone: string;
  priestEmail: string;
  experience: number;
  specialization: string[];
  education: string;
  certification: string[];
  location: string;
  bankAccount?: string;
  status: 'pending' | 'approved' | 'rejected';
  registeredDate: string;
  updatedAt: string;
  notes?: string;
}

export interface PriestDetails {
  priest_user_id: number;
  priest_name: string;
  priest_email: string;
  priest_contact_no: string;
  priest_gender: string;
  priest_dob: string;
  priest_present_city_town_village: string;
  priest_present_post_office: string;
  priest_approval_status: string;
  priest_experience_year: number;
  status: string;
}





interface AgentStats {
  todaySurvey: number;
  totalSurvey: number;
  totalRegistered: number;
  approved: number;
  pending: number;
  rejected: number;
  commissionEarned: number;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [priests, setPriests] = useState<RegisteredPriest[]>([]);
  const [stats, setStats] = useState<AgentStats>({
    todaySurvey: 0, totalSurvey: 0, totalRegistered: 0, approved: 0, pending: 0, rejected: 0, commissionEarned: 0,
  });
  const [allpriests, setAllPriests] = useState<PriestDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPriest, setSelectedPriest] = useState<PriestDetails | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // You can make this configurable if needed
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = sacredStyles;
    document.head.appendChild(styleSheet);

    const stored = localStorage.getItem('puja_connect_user');
    if (stored) setUserData(JSON.parse(stored));

    loadPriestData(currentPage); // Pass current page
    loadDashboardStats();

    return () => { document.head.removeChild(styleSheet); };
  }, [currentPage]); // Add currentPage as dependency

  const loadDashboardStats = async () => {
    try {
      const user = getUserData();
      console.log('User Data in Dashboard:', user);
      const token = getAuthToken();
      if (!user || !token) throw new Error('Auth Error');
      const data: DashboardStats = await getAgentDashboard(user.user_id, token);
      setStats(prev => ({
        ...prev,
        todaySurvey: data.today_survey_qty,
        totalSurvey: data.total_survey_qty,
        approved: data.total_approved_qty,
        pending: data.total_pending_qty,
        rejected: data.total_rejected_qty,
        commissionEarned: data.total_approved_qty * 5000,
      }));
    } catch (e) { console.error(e); }
  };

  const loadPriestData = useCallback(async (pageNo: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const user = getUserData();
      const token = getAuthToken();

      if (!user) {
        throw new Error('User not logged in');
      }

      const payload = {
        authority_user_id: 2, // Use actual user ID
        priest_user_id: 0,
        status_id: 0,
        page_no: pageNo, // This will now be 1, 2, 3... instead of 0, 1, 2...
        page_size: pageSize,
        from_date: "",
        to_date: ""
      }

      const data = await getAuthorityPriestInfo(payload);

      console.log('Fetched Priest Data:', data);

      const priestList = (data as unknown) as PriestDetails[];
      setAllPriests(priestList || []);

      // If your API returns total count, set it here
      // setTotalRecords(data.totalCount || priestList.length);

    } catch (err: any) {
      setError(err.message || 'Something went wrong fetching priests');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalRegistered: allpriests.length,
    }));
  }, [allpriests]);

  const handleLogout = () => {
    localStorage.removeItem('puja_connect_user');
    localStorage.removeItem('puja_connect_auth_token');
    navigate('/');
  };

  const handleAddPriest = (p: any) => {
    setPriests([...priests, { ...p, id: Date.now(), agentId: userData?.user_id || 'A1' }]);
    setShowAddModal(false);
    loadDashboardStats();
  };
  const handleEditPriest = (p: any) => {
    setPriests(priests.map(x => x.id === p.id ? p : x));
    setShowViewModal(false);
    loadDashboardStats();
  };
  const handleDeletePriest = (id: number) => {
    setPriests(priests.filter(x => x.id !== id));
    setShowViewModal(false);
    loadDashboardStats();
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handlePageJump = (pageNo: number) => {
    setCurrentPage(pageNo);
  };

  const filtered = allpriests.filter(p => {
    const s = (searchTerm || '').toLowerCase();
    const name = (p.priest_name || '').toLowerCase();
    const contact = (p.priest_contact_no || '');
    const email = (p.priest_email || '').toLowerCase();
    const match = name.includes(s) || contact.includes(s) || email.includes(s);
    return filterStatus === 'all'
      ? match
      : match && (p.status || '') === filterStatus;
  });

  const flame = <img src={flameIcon} alt="flame" className="w-6 h-6" />;
  return (
    <div className="min-h-screen relative w-full">

      {/* --- ELABORATE GEOMETRIC BACKGROUND --- */}
      <div className="fixed inset-0 bg-[#FFFBF2] -z-50"></div>
      <div className="fixed inset-0 yantra-lines opacity-100 -z-40"></div>

      {/* Rotating Mandala/Stars Top Right */}
      <div className="fixed -top-40 -right-40 w-[800px] h-[800px] pointer-events-none -z-30">
        {/* Clockwise Star - Orange */}
        <div className="absolute inset-0 text-orange-200/30 animate-spin-slow">
          <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
            <path d="M100 0 L120 80 L200 100 L120 120 L100 200 L80 120 L0 100 L80 80 Z" />
            <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1" fill="none" />
            <rect x="70" y="70" width="60" height="60" stroke="currentColor" strokeWidth="1" fill="none" transform="rotate(45 100 100)" />
          </svg>
        </div>

        {/* Counter-clockwise Star - Red/Rose */}
        <div className="absolute inset-0 text-rose-200/25 animate-spin-reverse">
          <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" className="w-full h-full">
            <path d="M100 10 L115 75 L180 90 L115 105 L100 170 L85 105 L20 90 L85 75 Z" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="50" strokeWidth="1" />
            <circle cx="100" cy="100" r="70" strokeWidth="0.5" />
            <polygon points="70,100 100,70 130,100 100,130" strokeWidth="1" transform="rotate(0 100 100)" />
          </svg>
        </div>
      </div>
      {/* Floating Geometric Shapes Bottom Left */}
      <div className="fixed bottom-0 left-0 w-[600px] h-[400px] opacity-20 pointer-events-none -z-30 animate-float">
        <svg viewBox="0 0 300 200" className="w-full h-full text-red-800">
          <path d="M0 200 L150 50 L300 200 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M50 200 L150 100 L250 200 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      <Navbar userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-16 sm:px-6 lg:px-20  py-10 pb-32">

        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0 bg-orange-100 rounded-full text-orange-800 text-xs font-bold uppercase tracking-widest mb-3 border border-orange-200">
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></span>
              Live Dashboard
            </div>
            <h1 className="text-5xl flex md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-stone-800 to-stone-600 drop-shadow-sm">
              <div className='mt-4 font-sacred font-bold  '>Pranam, {userData?.user_full_name?.split(' ')[0] || 'Agent'}</div>

              <div className=''> <img src={flameIcon} alt="flame" className=" w-20 h-20" /></div>

            </h1>
            <p className="text-stone-500 font-medium text-lg mt-2 max-w-xl">
              Manage your spiritual network. Monitor registrations and activity in real-time.
            </p>
          </div>


          <div className='pb-10'>
            <button
              onClick={() => navigate('/priest-registration')}
              className="group relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 text-white pl-8 pr-10 py-4 text-lg font-bold shadow-xl shadow-orange-900/20 clip-hex-btn transition-transform duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-black/40 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              <div className="flex items-center gap-3 relative z-10">
                <Plus className="w-6 h-6" />
                <span>New Registration</span>
              </div>
            </button>
          </div>

        </div>

        {/* --- 3D Stats Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 perspective-1000">
          <StatCard3D
            label="Activity Today"
            value={stats.todaySurvey}
            icon={<Clock />}
            trend="+12%"
            color="text-blue-600"
            delay={0}
          />
          <StatCard3D
            label="Total Surveys"
            value={stats.totalSurvey}
            icon={<LayoutGrid />}
            trend="+5%"
            color="text-indigo-600"
            delay={100}
          />
          <StatCard3D
            label="Approved Priests"
            value={stats.approved}
            icon={<Check />}
            trend="High Quality"
            color="text-emerald-600"
            delay={200}
          />
          <StatCard3D
            label="Earnings (₹)"
            value={(stats.commissionEarned).toLocaleString()}
            icon={<Wallet />}
            trend="Available"
            color="text-amber-600"
            delay={300}
          />
        </div>

        {/* --- Controls Section (Separate Card) --- */}
        {/* --- Controls Section (Separate Card) --- */}
        {/* --- Controls Section (Robust Layout) --- */}
        <div className="rounded-2xl overflow-hidden backdrop-blur-sm bg-white/80 border border-white/50 shadow-[8px_8px_16px_#E6DCC8] mb-6">
          <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">

            {/* --- LEFT: Search Input (Flexbox Wrapper Method) --- */}
            {/* This container acts as the 'Input Field' visually */}
            <div className="group w-full md:w-[480px] flex items-center bg-stone-50 rounded-xl p-1.5 stone-inset focus-within:ring-2 focus-within:ring-orange-100 transition-all">

              {/* Icon */}
              <Search className="ml-4 text-stone-400 w-5 h-5 flex-shrink-0 group-focus-within:text-orange-600 transition-colors" />

              {/* Actual Input (Transparent, no border) */}
              <input
                type="text"
                placeholder="Search by name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-stone-700 font-medium px-4 py-3 focus:ring-0 focus:outline-none placeholder:text-stone-400 w-full min-w-0"
              />

              {/* Button (Sitting naturally inside the flex container) */}
              <button
                className="flex-shrink-0 relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-black/30 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                <span className="relative z-10">Search</span>
              </button>
            </div>

            {/* --- RIGHT: Filter Toggle (Clean White) --- */}
            <div className="relative grid grid-cols-4 bg-stone-100 p-1.5 rounded-xl stone-inset w-full md:w-auto min-w-[400px]">

              {/* Animated White Pill */}
              <div
                className="absolute inset-y-1.5 w-1/4 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0"
                style={{
                  transform: `translateX(${['all', 'approved', 'pending', 'rejected'].indexOf(filterStatus) * 100}%)`,
                }}
              >
                <div className="h-full mx-1 bg-white rounded-lg shadow-sm" />
              </div>

              {/* Buttons */}
              {['all', 'approved', 'pending', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`
            relative z-10 py-2.5 px-4 text-sm font-bold capitalize transition-colors duration-200 rounded-lg select-none
            ${filterStatus === status
                      ? 'text-orange-700'
                      : 'text-stone-400 hover:text-stone-600'
                    }
          `}
                >
                  {status}
                </button>
              ))}
            </div>

          </div>
        </div>
        {/* --- Table Container (Separate Card) --- */}
        <div className="stone-card rounded-2xl overflow-hidden backdrop-blur-sm bg-white/80 border border-white/50">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 border-b-2 border-orange-300">
            <table className="w-full">
              <thead>
                <tr className="text-xs uppercase tracking-widest font-bold">
                  <th className="p-6 pl-8 font-sacred text-sm text-orange-900 text-left">Priest Identity</th>
                  <th className="p-6 text-amber-900 text-left">Contact Info</th>
                  <th className="p-6 text-orange-800 text-left">Date Of Birth</th>
                  <th className="p-6 text-orange-800 text-left">Gender</th>
                  <th className="p-6 text-amber-900 text-left">Location</th>
                  {/* <th className="p-6 text-amber-900 text-left">Post Office</th> */}
                  <th className="p-6 text-orange-800 text-left">Experience Year</th>
                  <th className="p-6 text-orange-800 text-left">Status</th>
                  <th className="p-6 text-right pr-8 text-amber-900">Actions</th>
                </tr>
              </thead>
            </table>
          </div>

          {/* --- THE GEOMETRIC TABLE --- */}
          {/* --- THE GEOMETRIC TABLE --- */}
          {/* --- THE GEOMETRIC TABLE --- */}
          {/* --- THE GEOMETRIC TABLE --- */}
          <div className="overflow-hidden">
            <table className="w-full text-left border-collapse table-fixed">
              <tbody className="divide-y divide-stone-100">
                {filtered.length > 0 ? (
                  filtered.map((priest, idx) => {
                    // Parse the status to match the badge options
                    let status = 'pending';
                    if (priest.status) {
                      const statusLower = priest.status.toLowerCase();
                      if (statusLower === 'approved') status = 'approved';
                      else if (statusLower === 'rejected') status = 'rejected';
                      else status = 'pending';
                    }

                    return (
                      <tr
                        key={priest.priest_user_id}
                        className="table-row-animate group bg-white hover:bg-orange-50/20"
                        style={{ transitionDelay: `${idx * 50}ms` }}
                      >
                        <td className="p-3 pl-6 w-[16%]">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-gradient-to-br from-orange-100 to-amber-200 text-orange-800 flex items-center justify-center font-sacred text-base font-bold shadow-inner border border-orange-200">
                              {priest.priest_name?.charAt(0).toUpperCase() || 'P'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-sacred font-bold text-sm text-stone-800 group-hover:text-orange-700 transition-colors truncate">
                                {priest.priest_name}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 w-[15%]">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-stone-700 font-semibold text-xs">{priest.priest_contact_no}</span>
                            <span className="text-xs text-stone-400 truncate">{priest.priest_email || 'N/A'}</span>
                          </div>
                        </td>

                        <td className="p-3 w-[10%]">
                          <span className="text-xs text-stone-700 font-medium whitespace-nowrap">{priest.priest_dob || 'N/A'}</span>
                        </td>

                        <td className="p-3 w-[8%]">
                          <span className="text-xs text-stone-700 font-medium">{priest.priest_gender}</span>
                        </td>

                        <td className="p-3 w-[12%]">
                          <span className="text-xs text-stone-700 font-medium truncate block">{priest.priest_present_city_town_village}</span>
                        </td>

                        {/* <td className="p-3 w-[12%]">
                          <span className="text-xs text-stone-700 font-medium truncate block">{priest.priest_present_post_office}</span>
                        </td> */}

                        <td className="p-3 w-[9%]">
                          <span className="text-stone-600 text-xs font-bold uppercase">{priest.priest_experience_year || 0} Yrs</span>
                        </td>

                        <td className="p-3 w-[11%]">
                          <StatusBadgeCompact status={status} />
                        </td>

                        <td className="p-3 pr-6 w-[7%]">
                          <ActionDropdown
                            onView={() => {
                              setSelectedPriest({
                                ...priest,
                                priest_name: priest.priest_name,
                                priest_user_id: priest.priest_user_id,
                                priest_email: priest.priest_email,
                                priest_contact_no: priest.priest_contact_no,
                                priest_gender: priest.priest_gender,
                                priest_dob: priest.priest_dob,
                                priest_present_city_town_village: priest.priest_present_city_town_village,
                                priest_present_post_office: priest.priest_present_post_office,
                                priest_experience_year: priest.priest_experience_year,
                                status: status
                              });
                              setShowViewModal(true);
                              setIsEditMode(false);
                            }}
                            onEdit={() => {
                              setSelectedPriest({
                                priest_user_id: priest.priest_user_id,
                                priest_name: priest.priest_name,
                                priest_email: priest.priest_email,
                                priest_contact_no: priest.priest_contact_no,
                                priest_gender: priest.priest_gender,
                                priest_dob: priest.priest_dob,
                                priest_present_city_town_village: priest.priest_present_city_town_village,
                                priest_present_post_office: priest.priest_present_post_office,
                                priest_approval_status: status,
                                priest_experience_year: priest.priest_experience_year,
                                status: status
                              });
                              setShowViewModal(true);
                              setIsEditMode(true);
                            }}
                            onDelete={() => {
                              if (confirm('Delete this priest?')) handleDeletePriest(priest.priest_user_id);
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="inline-block p-5 rounded-full bg-stone-50 stone-inset mb-3">
                        <Sparkles className="w-8 h-8 text-stone-300" />
                      </div>
                      <h3 className="text-lg font-sacred font-bold text-stone-600">No priests found</h3>
                      <p className="text-stone-400 text-sm mt-1">Try adjusting your search or filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- UNIFIED PAGINATION & FOOTER --- */}
          <div className="border-t border-stone-200 bg-stone-50/50 p-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">

            {/* Left Section: Record Status */}
            <div className="flex items-center gap-3">
              <div className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </div>
              {/* <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                Showing {filtered.length > 0 ? currentPage * pageSize + 1 : 0} - {Math.min((currentPage + 1) * pageSize, totalRecords || Math.max(filtered.length, 10))} Records
              </span> */}
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Showing {filtered.length} Records</span>
            </div>


            {/* pagination should be different component */}
            {/* Right Section: Circular Pagination Controls */}
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-stone-200 shadow-sm">

              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`
                  w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 group
                  ${currentPage === 0
                    ? 'text-stone-300 cursor-not-allowed bg-transparent'
                    : 'text-stone-600 hover:bg-orange-50 hover:text-orange-600 active:scale-95'
                  }
                `}
                title="Previous"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div className="hidden sm:flex items-center gap-1 px-2 border-l border-r border-stone-100 h-5">
                {(() => {
                  const totalCount = totalRecords || (filtered.length > pageSize ? filtered.length : 50);
                  const totalPages = Math.ceil(totalCount / pageSize) || 1;

                  const pages = [];
                  let start = Math.max(1, currentPage - 1);
                  let end = Math.min(totalPages - 1, start + 2);

                  if (end - start < 2 && totalPages > 2) {
                    if (start === 0) end = Math.min(2, totalPages - 1);
                    else if (end === totalPages - 1) start = Math.max(0, totalPages - 3);
                  }

                  if (start > 1) {
                    pages.push(
                      <button key={0} onClick={() => handlePageJump(0)} className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold text-stone-500 hover:bg-stone-100 transition-colors">1</button>
                    );
                    if (start > 1) pages.push(<span key="dots1" className="text-stone-300 text-[10px]">•</span>);
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageJump(i)}
                        className={`
                              w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all duration-300
                              ${currentPage === i
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md scale-105'
                            : 'text-stone-500 hover:bg-stone-100 hover:text-orange-600'
                          }
                            `}
                      >
                        {i}
                      </button>
                    );
                  }

                  if (end < totalPages - 1) {
                    if (end < totalPages - 2) pages.push(<span key="dots2" className="text-stone-300 text-[10px]">•</span>);
                    pages.push(
                      <button key={totalPages - 1} onClick={() => handlePageJump(totalPages - 1)} className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold text-stone-500 hover:bg-stone-100 transition-colors">{totalPages}</button>
                    );
                  }
                  return pages;
                })()}
              </div>

              <button
                onClick={handleNextPage}
                className={`
                  w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 group
                  text-stone-600 hover:bg-orange-50 hover:text-orange-600 active:scale-95
                `}
                title="Next"
              >
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Table Footer */}
        {/* <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest">

          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
          </div>
        </div> */}

      </main>

      {/* Modals */}
      {showAddModal && <AddPriestModal onClose={() => setShowAddModal(false)} onAdd={handleAddPriest} />}
      {
        showViewModal && selectedPriest && (
          <ViewEditPriestModal
            priest={selectedPriest}
            isEditMode={isEditMode}
            onClose={() => { setShowViewModal(false); setIsEditMode(false); }}
            onEdit={handleEditPriest}
            onDelete={() => { if (confirm('Delete?')) handleDeletePriest(selectedPriest.priest_user_id); }}
          />
        )
      }
    </div >
  );
};

// --- SUB-COMPONENTS ---


const StatCard3D = ({ label, value, icon, color, trend, delay }: any) => {
  // Color configurations matching your palette
  const cardColors: any = {
    'text-blue-600': {
      bg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-100',
      iconBg: 'bg-blue-50',
      shadow: 'hover:shadow-[10px_10px_0px_0px_rgba(59,130,246,0.15)]',
      hoverText: 'group-hover:text-blue-600'
    },
    'text-indigo-600': {
      bg: 'from-indigo-50 to-purple-50',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-50',
      shadow: 'hover:shadow-[10px_10px_0px_0px_rgba(99,102,241,0.15)]',
      hoverText: 'group-hover:text-indigo-600'
    },
    'text-emerald-600': {
      bg: 'from-emerald-50 to-teal-50',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-50',
      shadow: 'hover:shadow-[10px_10px_0px_0px_rgba(16,185,129,0.15)]',
      hoverText: 'group-hover:text-emerald-600'
    },
    'text-amber-600': {
      bg: 'from-amber-50 to-orange-50',
      border: 'border-amber-100',
      iconBg: 'bg-amber-50',
      shadow: 'hover:shadow-[10px_10px_0px_0px_rgba(245,158,11,0.15)]',
      hoverText: 'group-hover:text-amber-600'
    }
  };

  const colorConfig = cardColors[color] || cardColors['text-amber-600'];

  return (
    <div
      className={`group relative rounded-2xl border-2 ${colorConfig.border} bg-gradient-to-br ${colorConfig.bg}
                 transition-all duration-300 ease-out
                 shadow-[6px_6px_0px_0px_#E6DCC8] 
                 ${colorConfig.shadow}
                 hover:-translate-y-1.5 overflow-hidden
                 h-48 p-6 flex flex-col justify-between`}
      style={{ animationDelay: `${delay}ms`, opacity: 1 }}
    >
      {/* --- SHINY EFFECT --- */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out z-0 pointer-events-none">
        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12"></div>
      </div>

      {/* Abstract Geometric Decoration (Low opacity overlay) */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${colorConfig.iconBg} to-transparent rounded-full opacity-30 pointer-events-none group-hover:scale-110 transition-transform duration-500`}></div>
      <div className={`absolute right-4 top-4 w-12 h-12 rounded-full opacity-10 ${color.replace('text-', 'bg-')} blur-xl group-hover:opacity-25 transition-opacity duration-500`}></div>

      {/* Header Section (Icon + Label) */}
      <div className="flex justify-between items-start relative z-10">
        <p className="text-stone-500 text-xs font-bold uppercase tracking-[0.2em] pt-1">{label}</p>

        {/* 3D Icon Container */}
        <div className={`
          ${color} ${colorConfig.iconBg} p-3.5 rounded-xl border-2 ${colorConfig.border}
          shadow-[4px_4px_0px_0px_#E6DCC8] 
          group-hover:shadow-[4px_4px_0px_0px_rgba(217,119,6,0.2)]
          group-hover:rotate-12 group-hover:scale-110
          transition-all duration-300
        `}>
          {icon && typeof icon === 'object' ? React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: 2.5 }) : icon}
        </div>
      </div>

      {/* Bottom Section (Value + Trend) */}
      <div className="relative z-10">
        <h3 className={`text-5xl font-mono font-bold text-stone-800 tracking-tighter ${colorConfig.hoverText} transition-colors`}>
          {value}
        </h3>

        {/* Optional Trend Section (Uncomment if needed) */}
        {/* <div className="flex items-center gap-2 mt-2">
           <span className="text-emerald-600 font-bold text-xs flex items-center bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
             {trend}
           </span>
           <span className="text-xs font-semibold text-stone-400 opacity-70">vs last month</span>
        </div> */}
      </div>
    </div>
  );
};



const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    rejected: "bg-red-100 text-red-800 border-red-200"
  };

  // Geometric icons for status
  const icons: any = {
    approved: <div className="w-2 h-2 rotate-45 bg-emerald-600" />,
    pending: <div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />,
    rejected: <div className="w-2 h-2 bg-red-600 clip-hex-btn" />
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${styles[status]} font-bold text-xs uppercase tracking-wider shadow-sm`}>
      {icons[status]}
      {status}
    </div>
  );
};

const ActionButton = ({ onClick, icon, danger, label }: any) => (
  <button
    onClick={onClick}
    title={label}
    className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm border
      ${danger
        ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white hover:shadow-red-200'
        : 'bg-white text-stone-500 border-stone-200 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:shadow-orange-200'}`
    }
  >
    {icon}
  </button>
);

// --- MODALS (Enhanced) ---

const ModalFrame = ({ children, title, onClose }: any) => (
  <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
    <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl animate-[float_0.4s_ease-out] flex flex-col border border-white/50 relative">
      {/* Decorative top border */}
      <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"></div>

      <div className="px-8 py-6 flex justify-between items-center border-b border-stone-100 bg-stone-50/50">
        <h2 className="text-3xl font-sacred font-bold text-stone-800">{title}</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"><X size={20} /></button>
      </div>

      <div className="p-8 overflow-y-auto bg-white flex-1 relative">
        {/* Background pattern in modal */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor"><circle cx="50" cy="50" r="40" /></svg>
        </div>
        {children}
      </div>
    </div>
  </div>
);

const GeometricInput = ({ label, ...props }: any) => (
  <div className="mb-1 group">
    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1 transition-colors group-focus-within:text-orange-600">{label}</label>
    <input
      {...props}
      className="w-full bg-stone-50 border border-stone-200 px-4 py-3.5 text-stone-800 font-medium rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 focus:outline-none transition-all stone-inset"
    />
  </div>
);

const AddPriestModal: React.FC<any> = ({ onClose, onAdd }) => {
  const [f, setF] = useState({ priestName: '', priestPhone: '', priestEmail: '', experience: 0, specialization: '', education: '', certification: '', location: '', notes: '' });
  const sub = (e: any) => { e.preventDefault(); onAdd({ ...f, specialization: f.specialization.split(','), certification: f.certification.split(','), status: 'pending', registeredDate: new Date().toISOString(), updatedAt: new Date().toISOString() }) };

  return (
    <ModalFrame title="New Registration" onClose={onClose}>
      <form onSubmit={sub} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <GeometricInput label="Priest Name" required value={f.priestName} onChange={(e: any) => setF({ ...f, priestName: e.target.value })} placeholder="Full Name" />
          <GeometricInput label="Mobile" required value={f.priestPhone} onChange={(e: any) => setF({ ...f, priestPhone: e.target.value })} placeholder="+91..." />
          <GeometricInput label="Email" required type="email" value={f.priestEmail} onChange={(e: any) => setF({ ...f, priestEmail: e.target.value })} />
          <GeometricInput label="City/Location" required value={f.location} onChange={(e: any) => setF({ ...f, location: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <GeometricInput label="Experience (Yrs)" type="number" value={f.experience} onChange={(e: any) => setF({ ...f, experience: +e.target.value })} />
          <GeometricInput label="Education" value={f.education} onChange={(e: any) => setF({ ...f, education: e.target.value })} />
        </div>
        <GeometricInput label="Specialization (comma sep)" value={f.specialization} onChange={(e: any) => setF({ ...f, specialization: e.target.value })} />

        <div className="flex gap-4 pt-6 mt-2 border-t border-stone-100">
          <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-lg border-2 border-stone-200 font-bold text-stone-500 hover:bg-stone-50 hover:text-stone-700 hover:border-stone-300 transition-all">CANCEL</button>
          <button type="submit" className="flex-1 py-3.5 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all">REGISTER PRIEST</button>
        </div>
      </form>
    </ModalFrame>
  );
};

const ViewEditPriestModal: React.FC<any> = ({ priest, isEditMode, onClose, onEdit, onDelete }) => {
  // Use the incoming priest data which is in snake_case
  const [f, setF] = useState(priest);

  const sub = (e: any) => {
    e.preventDefault();
    onEdit({ ...f, updatedAt: new Date().toISOString() });
  };

  return (
    <ModalFrame title={isEditMode ? 'Edit Details' : 'Priest Profile'} onClose={onClose}>
      <form onSubmit={sub} className="space-y-6">
        {!isEditMode && (
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-stone-100">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-100 to-white border border-orange-200 flex items-center justify-center text-4xl font-sacred text-orange-700 shadow-sm">
              {/* FIXED: Accessed priest_name instead of PriestName */}
              {(priest.priest_name || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              {/* FIXED: Accessed priest_name instead of PriestName */}
              <h2 className="text-3xl font-bold font-sacred text-stone-800">{priest.priest_name}</h2>
              <div className="mt-3"><StatusBadge status={priest.status || 'pending'} /></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FIXED: Updated all value/onChange props to use snake_case keys */}
          <GeometricInput
            disabled={!isEditMode}
            label="Name"
            value={f.priest_name}
            onChange={(e: any) => setF({ ...f, priest_name: e.target.value })}
          />
          <GeometricInput
            disabled={!isEditMode}
            label="Phone"
            value={f.priest_contact_no}
            onChange={(e: any) => setF({ ...f, priest_contact_no: e.target.value })}
          />
          <GeometricInput
            disabled={!isEditMode}
            label="Email"
            value={f.priest_email}
            onChange={(e: any) => setF({ ...f, priest_email: e.target.value })}
          />
          <GeometricInput
            disabled={!isEditMode}
            label="Location"
            value={f.priest_present_city_town_village}
            onChange={(e: any) => setF({ ...f, priest_present_city_town_village: e.target.value })}
          />

          {isEditMode && (
            <div className="col-span-2">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Status</label>
              <select
                value={f.status}
                onChange={(e) => setF({ ...f, status: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 px-4 py-3.5 rounded-lg font-medium outline-none focus:ring-2 focus:ring-orange-100 stone-inset"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-6 mt-4 border-t border-stone-100">
          {isEditMode ? (
            <>
              <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-lg border-2 border-stone-200 font-bold text-stone-500 hover:bg-stone-50 transition-all">CANCEL</button>
              <button type="submit" className="flex-1 py-3.5 rounded-lg bg-orange-600 text-white font-bold hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all">SAVE CHANGES</button>
            </>
          ) : (
            <>
              {/* FIXED: Accessed priest_user_id instead of ID */}
              <button type="button" onClick={onDelete} className="px-8 py-3.5 rounded-lg bg-red-50 text-red-600 font-bold border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all">DELETE</button>
              <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-lg bg-stone-800 text-white font-bold hover:bg-stone-900 transition-all shadow-lg shadow-stone-200">CLOSE</button>
            </>
          )}
        </div>
      </form>
    </ModalFrame>
  );
};

// Compact Status Badge
const StatusBadgeCompact = ({ status }: { status: string }) => {
  const styles: any = {
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    rejected: "bg-red-100 text-red-800 border-red-200"
  };

  const icons: any = {
    approved: <div className="w-1.5 h-1.5 rotate-45 bg-emerald-600" />,
    pending: <div className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />,
    rejected: <div className="w-1.5 h-1.5 bg-red-600" />
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${styles[status]} font-bold text-[10px] uppercase tracking-wider`}>
      {icons[status]}
      {status}
    </div>
  );
};

// Action Dropdown Component
const ActionDropdown = ({ onView, onEdit, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-white text-stone-500 border border-stone-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm"
      >
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-xl border border-stone-200 py-1 z-20 overflow-hidden">
            <button
              onClick={() => {
                onView();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-xs font-semibold text-stone-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
            >
              <Eye size={14} />
              View Details
            </button>
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-xs font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center gap-2"
            >
              <Edit2 size={14} />
              Edit
            </button>
            <div className="h-px bg-stone-200 my-1" />
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};
