import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame, Plus, Search, Eye, Edit2, Trash2, X,
  Check, Clock, XOctagon, LayoutGrid, Wallet,
  Sparkles, Filter, MoreHorizontal, ArrowUpRight
} from 'lucide-react';
import type { UserData } from '../services/authService';
import { getAgentDashboard, getAuthToken, getUserData, type DashboardStats } from '../services/dashboardservice';
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
    transform: translateY(-5px) scale(1.01);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPriest, setSelectedPriest] = useState<RegisteredPriest | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = sacredStyles;
    document.head.appendChild(styleSheet);

    const stored = localStorage.getItem('puja_connect_user');
    if (stored) setUserData(JSON.parse(stored));

    loadMockPriestData();
    loadDashboardStats();

    return () => { document.head.removeChild(styleSheet); };
  }, []);

  const loadDashboardStats = async () => {
    try {
      const user = getUserData();
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

  const loadMockPriestData = useCallback(() => {
    const mockPriests: RegisteredPriest[] = [
      { id: 1, agentId: 'A1', priestName: 'Pandit Sharma', priestPhone: '9876543210', priestEmail: 'sharma@email.com', experience: 15, specialization: ['Vedic Rituals', 'Puja'], education: 'Vedic Scholar', certification: ['Ritual Specialist'], location: 'Delhi', status: 'approved', registeredDate: '2026-01-10', updatedAt: '2026-01-15' },
      { id: 2, agentId: 'A1', priestName: 'Priest Gupta', priestPhone: '9876543211', priestEmail: 'gupta@email.com', experience: 8, specialization: ['Marriage', 'Havan'], education: 'Vedic Master', certification: ['Marriage Specialist'], location: 'Mumbai', status: 'pending', registeredDate: '2026-01-20', updatedAt: '2026-01-20' },
      { id: 3, agentId: 'A1', priestName: 'Pandit Mishra', priestPhone: '9876543212', priestEmail: 'mishra@email.com', experience: 20, specialization: ['Astrology', 'Vedic Rituals'], education: 'Senior Scholar', certification: ['Astrology Cert'], location: 'Varanasi', status: 'approved', registeredDate: '2026-01-05', updatedAt: '2026-01-12' },
      { id: 4, agentId: 'A1', priestName: 'Priest Patel', priestPhone: '9876543213', priestEmail: 'patel@email.com', experience: 5, specialization: ['Puja'], education: 'Basic Vedic', certification: ['Basic Cert'], location: 'Bangalore', status: 'rejected', registeredDate: '2026-01-19', updatedAt: '2026-01-22' },
      { id: 5, agentId: 'A1', priestName: 'Acharya Singh', priestPhone: '9876543214', priestEmail: 'singh@email.com', experience: 12, specialization: ['Vastu', 'Griha Pravesh'], education: 'PhD Sanskrit', certification: ['Vastu Shastra'], location: 'Jaipur', status: 'approved', registeredDate: '2026-01-25', updatedAt: '2026-01-26' },
    ];
    setPriests(mockPriests);
    setStats(prev => ({ ...prev, totalRegistered: mockPriests.length }));
  }, []);

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

  const filtered = priests.filter(p => {
    const s = searchTerm.toLowerCase();
    const match = p.priestName.toLowerCase().includes(s) || p.priestPhone.includes(s) || p.priestEmail.toLowerCase().includes(s);
    return filterStatus === 'all' ? match : match && p.status === filterStatus;
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">

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

        {/* --- Controls & Table Container --- */}
        <div className="stone-card rounded-2xl overflow-hidden backdrop-blur-sm bg-white/80 border border-white/50">

          {/* Table Controls */}
          <div className="p-6 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, phone, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 stone-inset bg-stone-50 text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>

            <div className="flex bg-stone-100 p-1 rounded-lg stone-inset gap-1">
              {['all', 'approved', 'pending', 'rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 text-sm font-bold capitalize rounded-md transition-all duration-300
                    ${filterStatus === status
                      ? 'bg-white text-orange-700 shadow-md transform scale-105'
                      : 'text-stone-500 hover:text-stone-700'}`
                  }
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* --- THE GEOMETRIC TABLE --- */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100/50 text-stone-500 text-xs uppercase tracking-widest font-bold border-b border-stone-200">
                  <th className="p-6 pl-8 font-sacred text-sm text-stone-700">Priest Identity</th>
                  <th className="p-6">Contact Info</th>
                  <th className="p-6">Specialization</th>
                  <th className="p-6">Location</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.length > 0 ? (
                  filtered.map((priest, idx) => (
                    <tr
                      key={priest.id}
                      className="table-row-animate group bg-white hover:bg-orange-50/20"
                      style={{ transitionDelay: `${idx * 50}ms` }}
                    >
                      <td className="p-6 pl-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-amber-200 text-orange-800 flex items-center justify-center font-sacred text-xl font-bold shadow-inner border border-orange-200 transform group-hover:rotate-6 transition-transform">
                            {priest.priestName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-sacred font-bold text-lg text-stone-800 group-hover:text-orange-700 transition-colors">
                              {priest.priestName}
                            </div>
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-wide mt-0.5">
                              ID: {priest.agentId}-{priest.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="font-mono text-stone-700 font-bold tracking-tight text-base">{priest.priestPhone}</span>
                          <span className="text-sm text-stone-400 truncate max-w-[150px]">{priest.priestEmail}</span>
                        </div>
                      </td>

                      <td className="p-6">
                        <div className="flex flex-wrap gap-2 max-w-[250px]">
                          <span className="bg-stone-100 text-stone-600 px-2 py-1 text-xs font-bold uppercase rounded border border-stone-200">{priest.experience} Yrs</span>
                          {priest.specialization.slice(0, 2).map((s, i) => (
                            <span key={i} className="bg-orange-50 text-orange-700 px-2 py-1 text-xs font-bold uppercase rounded border border-orange-100">{s}</span>
                          ))}
                          {priest.specialization.length > 2 && <span className="text-xs text-stone-400 py-1">+ {priest.specialization.length - 2}</span>}
                        </div>
                      </td>

                      <td className="p-6">
                        <span className="text-stone-700 font-medium">{priest.location}</span>
                      </td>

                      <td className="p-6">
                        <StatusBadge status={priest.status} />
                      </td>

                      <td className="p-6 pr-8 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <ActionButton
                            icon={<Eye size={16} />}
                            onClick={() => { setSelectedPriest(priest); setShowViewModal(true); setIsEditMode(false); }}
                            label="View"
                          />
                          <ActionButton
                            icon={<Edit2 size={16} />}
                            onClick={() => { setSelectedPriest(priest); setShowViewModal(true); setIsEditMode(true); }}
                            label="Edit"
                          />
                          <ActionButton
                            icon={<Trash2 size={16} />}
                            onClick={() => { if (confirm('Delete?')) handleDeletePriest(priest.id); }}
                            danger
                            label="Delete"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="inline-block p-6 rounded-full bg-stone-50 stone-inset mb-4">
                        <Sparkles className="w-10 h-10 text-stone-300" />
                      </div>
                      <h3 className="text-xl font-sacred font-bold text-stone-600">No priests found</h3>
                      <p className="text-stone-400 mt-2">Try adjusting your search or filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest">
            <span>Showing {filtered.length} Records</span>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
            </div>
          </div>
        </div>

      </main>

      {/* Modals */}
      {showAddModal && <AddPriestModal onClose={() => setShowAddModal(false)} onAdd={handleAddPriest} />}
      {showViewModal && selectedPriest && (
        <ViewEditPriestModal
          priest={selectedPriest}
          isEditMode={isEditMode}
          onClose={() => { setShowViewModal(false); setIsEditMode(false); }}
          onEdit={handleEditPriest}
          onDelete={() => { if (confirm('Delete?')) handleDeletePriest(selectedPriest.id); }}
        />
      )}
    </div>
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
        <p className="text-stone-500 text-[10px] font-bold uppercase tracking-[0.2em] pt-1">{label}</p>

        {/* 3D Icon Container */}
        <div className={`
          ${color} ${colorConfig.iconBg} p-3.5 rounded-xl border-2 ${colorConfig.border}
          shadow-[4px_4px_0px_0px_#E6DCC8] 
          group-hover:shadow-[4px_4px_0px_0px_rgba(217,119,6,0.2)]
          group-hover:rotate-12 group-hover:scale-110
          transition-all duration-300
        `}>
          {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
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
  const [f, setF] = useState(priest);
  const sub = (e: any) => { e.preventDefault(); onEdit({ ...f, updatedAt: new Date().toISOString() }) };

  return (
    <ModalFrame title={isEditMode ? 'Edit Details' : 'Priest Profile'} onClose={onClose}>
      <form onSubmit={sub} className="space-y-6">
        {!isEditMode && (
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-stone-100">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-100 to-white border border-orange-200 flex items-center justify-center text-4xl font-sacred text-orange-700 shadow-sm">{priest.priestName.charAt(0)}</div>
            <div>
              <h2 className="text-3xl font-bold font-sacred text-stone-800">{priest.priestName}</h2>
              <div className="mt-3"><StatusBadge status={priest.status} /></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GeometricInput disabled={!isEditMode} label="Name" value={f.priestName} onChange={(e: any) => setF({ ...f, priestName: e.target.value })} />
          <GeometricInput disabled={!isEditMode} label="Phone" value={f.priestPhone} onChange={(e: any) => setF({ ...f, priestPhone: e.target.value })} />
          <GeometricInput disabled={!isEditMode} label="Email" value={f.priestEmail} onChange={(e: any) => setF({ ...f, priestEmail: e.target.value })} />
          <GeometricInput disabled={!isEditMode} label="Location" value={f.location} onChange={(e: any) => setF({ ...f, location: e.target.value })} />

          {isEditMode && (
            <div className="col-span-2">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Status</label>
              <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className="w-full bg-stone-50 border border-stone-200 px-4 py-3.5 rounded-lg font-medium outline-none focus:ring-2 focus:ring-orange-100 stone-inset">
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
              <button type="button" onClick={onDelete} className="px-8 py-3.5 rounded-lg bg-red-50 text-red-600 font-bold border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all">DELETE</button>
              <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-lg bg-stone-800 text-white font-bold hover:bg-stone-900 transition-all shadow-lg shadow-stone-200">CLOSE</button>
            </>
          )}
        </div>
      </form>
    </ModalFrame>
  );
};