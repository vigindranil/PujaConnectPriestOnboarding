import React, { useState, useEffect, useCallback } from 'react';
import { Flame, LogOut, Plus, Search, Edit2, Eye, Trash2, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { UserData } from '../services/authService';

interface Priest {
  id: number;
  name: string;
  phone: string;
  email: string;
  experience: number;
  specialization: string[];
  status: 'approved' | 'pending' | 'rejected';
  approvedBy?: string;
  dateAdded: string;
  updatedAt: string;
}

interface DashboardStats {
  totalOnboarded: number;
  pendingApproval: number;
  approved: number;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userData] = useState<UserData | null>(() => {
    const stored = localStorage.getItem('puja_connect_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error loading user data:', error);
        return null;
      }
    }
    return null;
  });
  const [priests, setPriests] = useState<Priest[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOnboarded: 0,
    pendingApproval: 0,
    approved: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPriest, setSelectedPriest] = useState<Priest | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const loadMockPriestData = useCallback(() => {
    const mockPriests: Priest[] = [
      {
        id: 1,
        name: 'Pandit Sharma',
        phone: '9876543210',
        email: 'sharma@email.com',
        experience: 15,
        specialization: ['Vedic Rituals', 'Puja Ceremonies'],
        status: 'approved',
        approvedBy: 'Admin',
        dateAdded: '2026-01-10',
        updatedAt: '2026-01-15',
      },
      {
        id: 2,
        name: 'Priest Gupta',
        phone: '9876543211',
        email: 'gupta@email.com',
        experience: 8,
        specialization: ['Marriage Ceremonies', 'Havan'],
        status: 'pending',
        dateAdded: '2026-01-20',
        updatedAt: '2026-01-20',
      },
      {
        id: 3,
        name: 'Pandit Mishra',
        phone: '9876543212',
        email: 'mishra@email.com',
        experience: 20,
        specialization: ['Astrology', 'Vedic Rituals', 'Death Rituals'],
        status: 'approved',
        approvedBy: 'Admin',
        dateAdded: '2026-01-05',
        updatedAt: '2026-01-12',
      },
      {
        id: 4,
        name: 'Priest Patel',
        phone: '9876543213',
        email: 'patel@email.com',
        experience: 5,
        specialization: ['Puja Ceremonies'],
        status: 'pending',
        dateAdded: '2026-01-19',
        updatedAt: '2026-01-19',
      },
    ];

    setPriests(mockPriests);
    updateStats(mockPriests);
  }, []);

  const updateStats = (priestList: Priest[]) => {
    setStats({
      totalOnboarded: priestList.length,
      pendingApproval: priestList.filter(p => p.status === 'pending').length,
      approved: priestList.filter(p => p.status === 'approved').length,
    });
  };

  // Load mock priest data on mount
  useEffect(() => {
    loadMockPriestData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('puja_connect_user');
    navigate('/login');
  };

  const handleAddPriest = (newPriest: Omit<Priest, 'id'>) => {
    const priest: Priest = {
      ...newPriest,
      id: Math.max(...priests.map(p => p.id), 0) + 1,
    };
    const updatedPriests = [...priests, priest];
    setPriests(updatedPriests);
    updateStats(updatedPriests);
    setShowAddModal(false);
  };

  const handleEditPriest = (updatedPriest: Priest) => {
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
    const matchesSearch = priest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         priest.phone.includes(searchTerm) ||
                         priest.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || priest.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-orange-700">PujaConnect</h1>
              <p className="text-xs text-gray-500">Priest Management Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        {userData && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              🙏 Welcome, {userData.user_full_name}!
            </h2>
            <p className="text-gray-600">Manage priests and monitor onboarding status</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Onboarded Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Priests Onboarded</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalOnboarded}</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">👨‍🔬</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">By Agent this month</p>
          </div>

          {/* Pending Approval Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Pending Approval</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">{stats.pendingApproval}</p>
              </div>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">⏳</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">Waiting for Admin review</p>
          </div>

          {/* Approved Priests Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Approved Priests</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{stats.approved}</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">Active priests on platform</p>
          </div>
        </div>

        {/* Actions & Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600 transition"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'approved' | 'pending' | 'rejected')}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600 transition"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={() => {
                setShowAddModal(true);
                setSelectedPriest(null);
                setIsEditMode(false);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add New Priest
            </button>
          </div>
        </div>

        {/* Priests Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Experience</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date Added</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPriests.length > 0 ? (
                  filteredPriests.map((priest, index) => (
                    <tr key={priest.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{priest.name}</p>
                          <p className="text-xs text-gray-500">{priest.specialization.join(', ')}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{priest.phone}</p>
                          <p className="text-xs text-gray-500">{priest.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {priest.experience} years
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(priest.status)}`}>
                          {getStatusIcon(priest.status)}
                          {priest.status.charAt(0).toUpperCase() + priest.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(priest.dateAdded).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedPriest(priest);
                              setShowViewModal(true);
                              setIsEditMode(false);
                            }}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPriest(priest);
                              setShowViewModal(true);
                              setIsEditMode(true);
                            }}
                            className="text-orange-600 hover:bg-orange-50 p-2 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this priest?')) {
                                handleDeletePriest(priest.id);
                              }
                            }}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <p className="text-lg">No priests found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add/Edit Priest Modal */}
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
  onAdd: (priest: Omit<Priest, 'id'>) => void;
}

const AddPriestModal: React.FC<AddPriestModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    experience: 0,
    specialization: '',
    status: 'pending' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    const specializations = formData.specialization
      .split(',')
      .map(s => s.trim())
      .filter(s => s);

    onAdd({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      experience: formData.experience,
      specialization: specializations,
      status: formData.status,
      dateAdded: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Add New Priest</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
              placeholder="Pandit Name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
              placeholder="10-digit phone"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
              placeholder="email@example.com"
            />
          </div>

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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Specializations (comma-separated)
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
              placeholder="Vedic Rituals, Marriage Ceremonies"
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
              Add Priest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View/Edit Priest Modal Component
interface ViewEditPriestModalProps {
  priest: Priest;
  isEditMode: boolean;
  onClose: () => void;
  onEdit: (priest: Priest) => void;
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
    if (!formData.name || !formData.phone || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    onEdit({
      ...formData,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {isEditMode ? 'Edit Priest' : 'Priest Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            {isEditMode ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
              />
            ) : (
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{formData.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone
            </label>
            {isEditMode ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
              />
            ) : (
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{formData.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            {isEditMode ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
              />
            ) : (
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{formData.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Experience (years)
            </label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Specializations
            </label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
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

// Helper function for status color
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
