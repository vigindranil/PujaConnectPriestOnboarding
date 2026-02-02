import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Flame, LogOut, Bell } from 'lucide-react';
import type { UserData } from '../services/authService';

interface NavbarProps {
    userData: UserData | null;
    onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ userData, onLogout }) => {
    const navigate = useNavigate(); // Initialize hook

    // Get initials from user name
    const getInitials = (name: string) => {
        return name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
    }; 

    return (
        <nav className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo - Click to go home */}
                    <div onClick={() => navigate('/dashboard')} className="flex items-center gap-3 group cursor-pointer">
                        <div className="relative transform group-hover:scale-110 transition-transform duration-300">
                            <div className="absolute inset-0 bg-orange-500 blur-lg opacity-20 group-hover:opacity-40 rounded-full"></div>
                            <Flame className="w-10 h-10 text-orange-600 relative z-10 drop-shadow-sm" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse border-2 border-white"></div>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent tracking-tight">
                                PujaConnect
                            </h1>
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-0.5">
                                Agent Portal
                            </span>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4 sm:gap-6">

                        <button className="hidden sm:flex relative p-2 text-slate-400 hover:text-orange-600 transition-colors rounded-full hover:bg-orange-50">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        {userData ? (
                            <div className="flex items-center gap-4">
                                {/* 
                  Profile Pill - CLICKABLE 
                  Added onClick to navigate to profile
                */}
                                <div
                                    onClick={() => navigate('/profile')}
                                    className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-full shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 group/profile cursor-pointer"
                                    title="Edit Profile"
                                >
                                    <div className="relative">
                                        {/* Show uploaded image if available in localStorage, else initials */}
                                        {localStorage.getItem('user_profile_pic') ? (
                                            <img
                                                src={localStorage.getItem('user_profile_pic') || ''}
                                                alt="Profile"
                                                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md group-hover/profile:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white group-hover/profile:scale-105 transition-transform">
                                                {getInitials(userData.user_full_name)}
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>

                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-bold text-slate-700 leading-none group-hover/profile:text-orange-600 transition-colors">
                                            {userData.user_full_name}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mt-1">
                                            Edit Profile
                                        </p>
                                    </div>
                                </div>

                                <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                                <button
                                    onClick={onLogout}
                                    className="group flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 font-semibold text-sm border border-red-100 hover:border-red-600 shadow-sm hover:shadow-red-200/50"
                                >
                                    <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 animate-pulse">
                                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};