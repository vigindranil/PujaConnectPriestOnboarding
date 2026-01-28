import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Save, Mail, Phone, MapPin, User as UserIcon, Shield } from 'lucide-react';
import { Navbar } from '../components/Navbar'; // Reuse your Navbar
import type { UserData } from '../services/authService';

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        bio: ''
    });

    // Image State
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        // 1. Load User Data
        const storedUser = localStorage.getItem('puja_connect_user');
        const storedImage = localStorage.getItem('user_profile_pic');

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserData(parsedUser);

            // 2. Pre-fill Form
            setFormData({
                fullName: parsedUser.user_full_name || '',
                email: parsedUser.user_email || 'agent@pujaconnect.com', // Mock if missing
                phone: parsedUser.user_phone || '+91 98765 43210',     // Mock if missing
                location: 'New Delhi, India',                          // Mock default
                bio: 'Senior Agent specializing in Vedic rituals and large scale ceremonies.'
            });

            if (storedImage) {
                setProfileImage(storedImage);
            }
        }
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Create a fake URL for preview
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);

            // In a real app, you would upload 'file' to a server here.
            // For this demo, we save the base64/url to localStorage to persist it locally.
            const reader = new FileReader();
            reader.onloadend = () => {
                localStorage.setItem('user_profile_pic', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API Call
        setTimeout(() => {
            // Update local storage to reflect changes
            if (userData) {
                const updatedUser = { ...userData, user_full_name: formData.fullName };
                localStorage.setItem('puja_connect_user', JSON.stringify(updatedUser));
                setUserData(updatedUser);
            }

            setIsLoading(false);
            alert('Profile updated successfully!');
        }, 1000);
    };

    const handleLogout = () => {
        localStorage.removeItem('puja_connect_user');
        localStorage.removeItem('puja_connect_auth_token');
        navigate('/');
    };

    if (!userData) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50">
            <Navbar userData={userData} onLogout={handleLogout} />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-slate-500 hover:text-orange-600 transition-colors mb-6 font-medium"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-orange-400 to-red-500"></div>

                            <div className="relative z-10 -mt-4">
                                {/* Image Upload Area */}
                                <div className="relative inline-block group">
                                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white mx-auto">
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-4xl font-bold text-slate-300">
                                                {formData.fullName.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload Overlay Button */}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-1 right-1 bg-slate-800 text-white p-2.5 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
                                        title="Change Photo"
                                    >
                                        <Camera className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>

                                <h2 className="text-2xl font-bold text-slate-800 mt-4">{formData.fullName}</h2>
                                <p className="text-slate-500 font-medium">Authorized Agent</p>

                                <div className="mt-6 flex flex-col gap-2">
                                    <div className="flex items-center justify-center gap-2 text-slate-600 text-sm">
                                        <Shield className="w-4 h-4 text-green-500" />
                                        <span>Verified Account</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-slate-600 text-sm">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        <span>Online Status: Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Edit Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800">Profile Settings</h3>
                                    <p className="text-slate-500">Update your personal information</p>
                                </div>
                                <UserIcon className="w-8 h-8 text-orange-200" />
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Full Name</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                readOnly // Assuming email is not changeable
                                                className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Bio / Notes</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                {/* Actions */}
                                <div className="pt-4 flex items-center justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/dashboard')}
                                        className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <Save className="w-5 h-5" />
                                        )}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};