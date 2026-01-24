import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, LogOut, Plus, Search, Eye, Edit2, Trash2, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { UserData } from '../services/authService';

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
    totalRegistered: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    commissionEarned: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPriest, setSelectedPriest] = useState<RegisteredPriest | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('puja_connect_user');
    if (stored) {
      try {
        const user = JSON.parse(stored) as UserData;
        setUserData(user);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
    loadMockPriestData();
  }, []);

  const loadMockPriestData = useCallback(() => {
    const mockPriests: RegisteredPriest[] = [
      {
        id: 1,
        agentId: 'AGENT001',
        priestName: 'Pandit Sharma',
        priestPhone: '9876543210',
        priestEmail: 'sharma@email.com',
        experience: 15,
        specialization: ['Vedic Rituals', 'Puja Ceremonies'],
        education: 'Vedic Scholar',
        certification: ['Vedic Studies Certificate', 'Ritual Specialist'],
        location: 'Delhi',
        bankAccount: '1234567890',
        status: 'approved',
        registeredDate: '2026-01-10',
        updatedAt: '2026-01-15',
        notes: 'Excellent performance, highly recommended',
      },
      {
        id: 2,
        agentId: 'AGENT001',
        priestName: 'Priest Gupta',
        priestPhone: '9876543211',
        priestEmail: 'gupta@email.com',
        experience: 8,
        specialization: ['Marriage Ceremonies', 'Havan'],
        education: 'Vedic Master',
        certification: ['Marriage Ceremony Specialist'],
        location: 'Mumbai',
        status: 'pending',
        registeredDate: '2026-01-20',
        updatedAt: '2026-01-20',
        notes: 'Under verification',
      },
      {
        id: 3,
        agentId: 'AGENT001',
        priestName: 'Pandit Mishra',
        priestPhone: '9876543212',
        priestEmail: 'mishra@email.com',
        experience: 20,
        specialization: ['Astrology', 'Vedic Rituals', 'Death Rituals'],
        education: 'Senior Vedic Scholar',
        certification: ['Astrology Certificate', 'Rituals Specialist'],
        location: 'Varanasi',
        bankAccount: '0987654321',
        status: 'approved',
        registeredDate: '2026-01-05',
        updatedAt: '2026-01-12',
      },
      {
        id: 4,
        agentId: 'AGENT001',
        priestName: 'Priest Patel',
        priestPhone: '9876543213',
        priestEmail: 'patel@email.com',
        experience: 5,
        specialization: ['Puja Ceremonies', 'Pooja'],
        education: 'Vedic Basics',
        certification: ['Basic Puja Certificate'],
        location: 'Bangalore',
        status: 'rejected',
        registeredDate: '2026-01-19',
        updatedAt: '2026-01-22',
        notes: 'Does not meet certification requirements',
      },
    ];

    setPriests(mockPriests);
    updateStats(mockPriests);
  }, []);

  const updateStats = (priestList: RegisteredPriest[]) => {
    const approved = priestList.filter(p => p.status === 'approved').length;
    setStats({
      totalRegistered: priestList.length,
      approved,
      pending: priestList.filter(p => p.status === 'pending').length,
      rejected: priestList.filter(p => p.status === 'rejected').length,
      commissionEarned: approved * 5000,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('puja_connect_user');
    localStorage.removeItem('puja_connect_auth_token');
    navigate('/');
  };

  const handleAddPriest = (newPriest: Omit<RegisteredPriest, 'id' | 'agentId'>) => {
    const priest: RegisteredPriest = {
      ...newPriest,
      id: Math.max(...priests.map(p => p.id), 0) + 1,
      agentId: userData?.user_id.toString() || 'AGENT001',
    };
    const updatedPriests = [...priests, priest];
    setPriests(updatedPriests);
    updateStats(updatedPriests);
    setShowAddModal(false);
  };

  const handleEditPriest = (updatedPriest: RegisteredPriest) => {
    const updatedPriests = priests.map(p => p.id === updatedPriest.id ? updatedPriest : p);
    setPriests(updatedPriests);
    updateStats(updatedPriests);
    setShowViewModal(false);
    setIsEditMode(false);
  };

  const handleDeletePriest = (id: number) => {
    const updatedPriests = priests.filter(p => p.id !== id);
    setPriests(updatedPriests);
    updateStats(updatedPriests);
    setShowViewModal(false);
  };

  const filteredPriests = priests.filter(priest => {
    const matchesSearch = priest.priestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         priest.priestPhone.includes(searchTerm) ||
                         priest.priestEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || priest.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-300 shadow-green-200/50';
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-300 shadow-yellow-200/50';
      case 'rejected':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-300 shadow-red-200/50';
      default:
        return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-300 shadow-slate-200/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-amber-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-red-200/20 to-orange-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-amber-200/10 to-orange-200/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl shadow-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <Flame className="w-8 sm:w-10 h-8 sm:h-10 text-orange-600 drop-shadow-lg" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-300 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                PujaConnect Agent
              </h1>
              <p className="text-sm text-slate-600 hidden sm:block font-medium">Priest Onboarding Portal</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-red-200/50 hover:-translate-y-0.5 font-semibold"
          >
            <LogOut className="w-4 sm:w-5 h-4 sm:h-5 transition-transform group-hover:rotate-12" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        {userData && (
          <div className="mb-8 sm:mb-12">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 hover:shadow-3xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-2xl animate-pulse-glow">
                  🙏
                </div>
                <div>
                  <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Welcome, {userData.user_full_name}!
                  </h2>
                  <p className="text-sm sm:text-lg text-slate-600 font-medium mt-1">
                    Onboard and manage priests in your spiritual network
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
                <p className="text-orange-800 text-sm font-medium">
                  ✨ Ready to expand your network? Register new priests and track your commission earnings!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Total Registered */}
          <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide">Total Registered</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">{stats.totalRegistered}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-2xl animate-pulse-glow">
                👨‍🔬
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full blur-xl"></div>
          </div>

          {/* Approved */}
          <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide">Approved</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center text-2xl animate-pulse-glow">
                ✅
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full blur-xl"></div>
          </div>

          {/* Pending */}
          <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl flex items-center justify-center text-2xl animate-pulse-glow">
                ⏳
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-yellow-200/20 to-amber-300/20 rounded-full blur-xl"></div>
          </div>

          {/* Rejected */}
          <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide">Rejected</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center text-2xl animate-pulse-glow">
                ❌
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-red-200/20 to-rose-300/20 rounded-full blur-xl"></div>
          </div>


        </div>

        {/* Actions Bar */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 mb-8 sm:mb-12 border border-white/20 hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-between">
            <div className="flex-1 relative w-full sm:w-auto group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 text-lg bg-slate-50 hover:bg-white group-focus-within:bg-white"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
            
            <div className="relative group">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'approved' | 'pending' | 'rejected')}
                className="w-full sm:w-auto px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 text-lg bg-slate-50 hover:bg-white appearance-none pr-10 font-medium"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
            
            <button
              onClick={() => navigate('/priest-registration')}
              className="group flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 sm:px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/60 hover:-translate-y-0.5 font-semibold text-lg whitespace-nowrap w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              Register Priest
            </button>
          </div>
        </div>

        {/* Priests Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20 hover:shadow-2xl transition-all duration-300">
          <div className="min-w-full overflow-x-auto">
            <table className="w-full text-sm sm:text-base">
              <thead className="bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 text-white relative">
                <tr className="relative z-10 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-black/10 before:to-transparent before:pointer-events-none">
                  <th className="px-4 sm:px-6 py-4 sm:py-5 text-left text-sm sm:text-base font-bold tracking-wide relative z-20">Priest Name</th>
                  <th className="px-4 sm:px-6 py-4 sm:py-5 text-left text-sm sm:text-base font-bold tracking-wide hidden sm:table-cell relative z-20">Contact</th>
                  <th className="px-4 sm:px-6 py-4 sm:py-5 text-left text-sm sm:text-base font-bold tracking-wide hidden md:table-cell relative z-20">Experience</th>
                  <th className="px-4 sm:px-6 py-4 sm:py-5 text-left text-sm sm:text-base font-bold tracking-wide hidden lg:table-cell relative z-20">Location</th>
                  <th className="px-4 sm:px-6 py-4 sm:py-5 text-left text-sm sm:text-base font-bold tracking-wide relative z-20">Status</th>
                  <th className="px-4 sm:px-6 py-4 sm:py-5 text-center text-sm sm:text-base font-bold tracking-wide relative z-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPriests.length > 0 ? (
                  filteredPriests.map((priest) => (
                    <tr key={priest.id} className="group hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 transition-all duration-200">
                      <td className="px-4 sm:px-6 py-4 sm:py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                            {priest.priestName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm sm:text-base group-hover:text-orange-600 transition-colors">
                              {priest.priestName}
                            </p>
                            <p className="text-xs text-slate-500 sm:hidden">{priest.priestPhone}</p>
                            <p className="text-xs text-slate-500 hidden sm:block">
                              {priest.specialization.slice(0, 1).join(', ')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 sm:py-5 hidden sm:table-cell">
                        <div className="text-sm">
                          <p className="font-semibold text-slate-800">{priest.priestPhone}</p>
                          <p className="text-slate-500 text-xs">{priest.priestEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 sm:py-5 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-2 rounded-xl text-sm font-bold border border-blue-200">
                          <span>{priest.experience}</span>
                          <span className="text-xs">yrs</span>
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 sm:py-5 hidden lg:table-cell text-sm text-slate-600 font-medium">
                        {priest.location}
                      </td>
                      <td className="px-4 sm:px-6 py-4 sm:py-5">
                        <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${getStatusColor(priest.status)}`}>
                          {getStatusIcon(priest.status)}
                          <span className="hidden sm:inline capitalize">{priest.status}</span>
                          <span className="sm:hidden uppercase">{priest.status.charAt(0)}</span>
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 sm:py-5">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedPriest(priest);
                              setShowViewModal(true);
                              setIsEditMode(false);
                            }}
                            className="group/btn relative bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 p-2 sm:p-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border border-blue-200 hover:border-blue-300"
                            title="View Details"
                          >
                            <Eye className="w-4 sm:w-5 h-4 sm:h-5 transition-transform group-hover/btn:scale-110" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPriest(priest);
                              setShowViewModal(true);
                              setIsEditMode(true);
                            }}
                            className="group/btn relative bg-orange-50 hover:bg-orange-100 text-orange-600 hover:text-orange-700 p-2 sm:p-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border border-orange-200 hover:border-orange-300"
                            title="Edit Priest"
                          >
                            <Edit2 className="w-4 sm:w-5 h-4 sm:h-5 transition-transform group-hover/btn:scale-110" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this priest?')) {
                                handleDeletePriest(priest.id);
                              }
                            }}
                            className="group/btn relative bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 p-2 sm:p-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border border-red-200 hover:border-red-300"
                            title="Delete Priest"
                          >
                            <Trash2 className="w-4 sm:w-5 h-4 sm:h-5 transition-transform group-hover/btn:scale-110" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                          <span className="text-4xl">🕉️</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-slate-600">No priests registered yet</p>
                          <p className="text-sm text-slate-500">Click "Register Priest" to onboard your first priest to the platform</p>
                        </div>
                        <button
                          onClick={() => navigate('/priest-registration')}
                          className="mt-4 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-orange-200/50 hover:-translate-y-0.5 font-semibold"
                        >
                          <Plus className="w-5 h-5" />
                          Register Your First Priest
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Priest Modal */}
      {showAddModal && (
        <AddPriestModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddPriest}
        />
      )}

      {/* View/Edit Priest Modal */}
      {showViewModal && selectedPriest && (
        <ViewEditPriestModal
          priest={selectedPriest}
          isEditMode={isEditMode}
          onClose={() => {
            setShowViewModal(false);
            setIsEditMode(false);
          }}
          onEdit={handleEditPriest}
          onDelete={() => {
            if (confirm('Are you sure you want to delete this priest?')) {
              handleDeletePriest(selectedPriest.id);
            }
          }}
        />
      )}
    </div>
  );
};

// Add Priest Modal Component
interface AddPriestModalProps {
  onClose: () => void;
  onAdd: (priest: Omit<RegisteredPriest, 'id' | 'agentId'>) => void;
}

const AddPriestModal: React.FC<AddPriestModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    priestName: '',
    priestPhone: '',
    priestEmail: '',
    experience: 0,
    specialization: '',
    education: '',
    certification: '',
    location: '',
    bankAccount: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.priestName || !formData.priestPhone || !formData.priestEmail || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    const specializations = formData.specialization
      .split(',')
      .map(s => s.trim())
      .filter(s => s);

    const certifications = formData.certification
      .split(',')
      .map(c => c.trim())
      .filter(c => c);

    onAdd({
      priestName: formData.priestName,
      priestPhone: formData.priestPhone,
      priestEmail: formData.priestEmail,
      experience: formData.experience,
      specialization: specializations,
      education: formData.education,
      certification: certifications,
      location: formData.location,
      bankAccount: formData.bankAccount || undefined,
      status: 'pending',
      registeredDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      notes: formData.notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Register New Priest</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priest Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priest Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.priestName}
                onChange={(e) => setFormData({ ...formData, priestName: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                placeholder="Pandit Name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.priestPhone}
                onChange={(e) => setFormData({ ...formData, priestPhone: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                placeholder="10-digit phone"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.priestEmail}
                onChange={(e) => setFormData({ ...formData, priestEmail: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                placeholder="priest@email.com"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                placeholder="City/Region"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                placeholder="0"
              />
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Education
              </label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                placeholder="Vedic Scholar, etc"
              />
            </div>
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Specializations (comma-separated)
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
              placeholder="Vedic Rituals, Marriage Ceremonies, etc"
            />
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Certifications (comma-separated)
            </label>
            <input
              type="text"
              value={formData.certification}
              onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
              placeholder="Vedic Studies Certificate, etc"
            />
          </div>

          {/* Bank Account */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bank Account Number
            </label>
            <input
              type="text"
              value={formData.bankAccount}
              onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
              placeholder="Bank account for commission"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
              placeholder="Additional notes about the priest"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition font-semibold"
            >
              Register Priest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View/Edit Priest Modal Component
interface ViewEditPriestModalProps {
  priest: RegisteredPriest;
  isEditMode: boolean;
  onClose: () => void;
  onEdit: (priest: RegisteredPriest) => void;
  onDelete: () => void;
}

const ViewEditPriestModal: React.FC<ViewEditPriestModalProps> = ({
  priest,
  isEditMode,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [formData, setFormData] = useState(priest);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.priestName || !formData.priestPhone || !formData.priestEmail || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    onEdit({
      ...formData,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {isEditMode ? 'Edit Priest Registration' : 'Priest Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priest Name</label>
              {isEditMode ? (
                <input
                  type="text"
                  value={formData.priestName}
                  onChange={(e) => setFormData({ ...formData, priestName: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{formData.priestName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              {isEditMode ? (
                <input
                  type="tel"
                  value={formData.priestPhone}
                  onChange={(e) => setFormData({ ...formData, priestPhone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{formData.priestPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              {isEditMode ? (
                <input
                  type="email"
                  value={formData.priestEmail}
                  onChange={(e) => setFormData({ ...formData, priestEmail: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{formData.priestEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              {isEditMode ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{formData.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Experience (years)</label>
              {isEditMode ? (
                <input
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{formData.experience} years</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Education</label>
              {isEditMode ? (
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{formData.education}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Specializations</label>
            {isEditMode ? (
              <input
                type="text"
                value={formData.specialization.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  specialization: e.target.value.split(',').map(s => s.trim()),
                })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.specialization.map((spec, idx) => (
                  <span key={idx} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Certifications</label>
            {isEditMode ? (
              <input
                type="text"
                value={formData.certification.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  certification: e.target.value.split(',').map(c => c.trim()),
                })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.certification.map((cert, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {cert}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Account</label>
            {isEditMode ? (
              <input
                type="text"
                value={formData.bankAccount || ''}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value || undefined })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
              />
            ) : (
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{formData.bankAccount || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            {isEditMode ? (
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'approved' | 'pending' | 'rejected' })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            ) : (
              <p className={`px-4 py-2 rounded-lg inline-block text-sm font-semibold ${getStatusColor(formData.status)}`}>
                {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            {isEditMode ? (
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value || undefined })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                rows={3}
              />
            ) : (
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{formData.notes || 'No notes'}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            {isEditMode ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition font-semibold"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
