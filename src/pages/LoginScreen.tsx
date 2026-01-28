import React, { useState } from 'react';
import { Flame, ArrowLeft, Phone, Lock, User, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageCarousel } from '../components/ImageCarousel';
import { AlertMessage } from '../components/AlertMessage';
import { OTPSuccessScreen } from '../components/OTPSuccessScreen';
import { authService } from '../services/authService';

type LoginStep = 'phone' | 'otp' | 'success';
type UserType = 'user' | 'authority';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<LoginStep>('phone');
  const [userType, setUserType] = useState<UserType>('user');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successAlert, setSuccessAlert] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      // Conditional API Call based on User Type
      if (userType === 'authority') {
        await authService.sendAuthorityOTP(cleanPhone);
      } else {
        await authService.sendOTP(cleanPhone);
      }

      setLoading(false);
      setSuccessAlert(true);
      setTimeout(() => {
        setSuccessAlert(false);
        setStep('otp');
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      let userData;

      // Conditional Validation API Call based on User Type
      if (userType === 'authority') {
        const response = await authService.validateAuthorityOTP(cleanPhone, otp);
        userData = response.userData;
      } else {
        const response = await authService.validateOTP(cleanPhone, otp);
        userData = response.userData;
      }

      // Store user data in localStorage for dashboard access
      // We also store the type so the app knows how to render the dashboard
      const storedData = {
        ...userData,
        loginType: userType // Helper flag for UI decisions later
      };

      localStorage.setItem('puja_connect_user', JSON.stringify(storedData));

      setLoading(false);
      setSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessScreen(true);
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess();
          }
          // Redirect to appropriate dashboard if needed, or default
          navigate('/dashboard');
        }, 3000);
      }, 1500);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to verify OTP. Please try again.');
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return value;

    const [, part1, part2, part3] = match;
    let formatted = '';
    if (part1) formatted += part1;
    if (part2) formatted += part2 ? ' ' + part2 : '';
    if (part3) formatted += part3 ? ' ' + part3 : '';
    return formatted;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-amber-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-red-200/20 to-orange-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Background carousel */}
      <ImageCarousel autoPlay={true} interval={5000} />

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        {step === 'otp' && (
          <button
            onClick={() => {
              setStep('phone');
              setOtp('');
              setError('');
            }}
            className="flex items-center gap-2 text-slate-600 hover:text-orange-600 mb-6 transition-all duration-200 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        )}

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden hover:shadow-3xl transition-all duration-300">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 px-8 pt-12 pb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative">
                  <Flame className="w-10 h-10 text-white drop-shadow-lg" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-300 rounded-full animate-pulse"></div>
                </div>
                <h1 className="text-3xl font-bold text-white drop-shadow-sm">PujaConnect</h1>
              </div>
              <p className="text-orange-100 text-center text-sm leading-relaxed">
                {step === 'phone' ? 'Sign in to your spiritual journey' : 'Verify your mobile number'}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pt-8 pb-4">
            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div>
                  {successAlert && (
                    <div className="mb-6">
                      <AlertMessage
                        type="success"
                        title="OTP Sent Successfully!"
                        message={`A 6-digit OTP has been sent to your ${userType === 'authority' ? 'registered' : ''} phone number.`}
                        autoClose={true}
                        duration={2000}
                      />
                    </div>
                  )}

                  {/* User Type Toggle */}
                  <div className="bg-slate-100 p-1.5 rounded-xl flex items-center mb-6 relative">
                    <button
                      type="button"
                      onClick={() => {
                        setUserType('user');
                        setError('');
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 relative z-10 ${userType === 'user'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      <User className="w-4 h-4" />
                      Priest
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserType('authority');
                        setError('');
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 relative z-10 ${userType === 'authority'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      <Crown className="w-4 h-4" />
                      Agent / Authority
                    </button>
                  </div>

                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Mobile Number
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <Phone className="w-5 h-5 text-orange-500 group-focus-within:text-orange-600 transition-colors" />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(formatPhoneNumber(e.target.value));
                        setError('');
                      }}
                      placeholder="Enter 10-digit number"
                      className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 text-lg bg-slate-50 hover:bg-white group-focus-within:bg-white"
                      maxLength={12}
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    We'll send you a secure verification code
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || phoneNumber.replace(/\D/g, '').length !== 10}
                  className={`group relative w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${loading || phoneNumber.replace(/\D/g, '').length !== 10
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/60 hover:-translate-y-0.5'
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Sending OTP...
                    </span>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-8">
                <div>
                  {successAlert && (
                    <div className="mb-6">
                      <AlertMessage
                        type="success"
                        title="OTP Verified!"
                        message={`Welcome back, ${userType === 'authority' ? 'Priest' : 'Devotee'}!`}
                        autoClose={true}
                        duration={3000}
                      />
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full mb-4 animate-pulse-glow">
                      <Lock className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Verification Code</h3>
                    <p className="text-slate-600 leading-relaxed">
                      We've sent a 6-digit code to<br />
                      <span className="font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg inline-block mt-2">
                        +91 {phoneNumber}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('phone');
                        setOtp('');
                        setError('');
                      }}
                      className="text-orange-600 text-sm hover:text-orange-700 hover:underline mt-3 font-medium transition-all duration-200"
                    >
                      Change number
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-center gap-3 mb-8">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <div key={index} className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={otp[index] || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            const newOtp = otp.split('');
                            newOtp[index] = value;
                            const otpString = newOtp.join('').slice(0, 6);
                            setOtp(otpString);
                            setError('');

                            // Auto-focus next input if value entered
                            if (value && index < 5) {
                              const nextInput = document.querySelector(
                                `input[data-otp-index="${index + 1}"]`
                              ) as HTMLInputElement;
                              nextInput?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            // Handle backspace
                            if (e.key === 'Backspace') {
                              if (!otp[index] && index > 0) {
                                // If empty, move to previous and delete
                                e.preventDefault();
                                const newOtp = otp.split('');
                                newOtp[index - 1] = '';
                                setOtp(newOtp.join(''));
                                const prevInput = document.querySelector(
                                  `input[data-otp-index="${index - 1}"]`
                                ) as HTMLInputElement;
                                prevInput?.focus();
                              } else if (otp[index]) {
                                // If value exists, delete it normally
                                const newOtp = otp.split('');
                                newOtp[index] = '';
                                setOtp(newOtp.join(''));
                              }
                            }
                            // Handle arrow keys
                            else if (e.key === 'ArrowLeft' && index > 0) {
                              e.preventDefault();
                              const prevInput = document.querySelector(
                                `input[data-otp-index="${index - 1}"]`
                              ) as HTMLInputElement;
                              prevInput?.focus();
                            } else if (e.key === 'ArrowRight' && index < 5) {
                              e.preventDefault();
                              const nextInput = document.querySelector(
                                `input[data-otp-index="${index + 1}"]`
                              ) as HTMLInputElement;
                              nextInput?.focus();
                            }
                          }}
                          data-otp-index={index}
                          placeholder="–"
                          className="w-14 h-14 text-center text-2xl font-semibold border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100/50 transition-all duration-200 bg-white hover:border-slate-300 focus:bg-orange-50/30 shadow-sm hover:shadow-md focus:shadow-lg"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      Enter the 6-digit verification code
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className={`group relative w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${loading || otp.length !== 6
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/60 hover:-translate-y-0.5'
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Lock className="w-5 h-5" />
                      Verify & Continue
                    </span>
                  )}
                </button>

                <div className="text-center space-y-3">
                  <p className="text-slate-500 text-sm">Didn't receive the code?</p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      className="text-orange-600 font-semibold hover:text-orange-700 hover:underline text-sm transition-colors duration-200 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg"
                    >
                      Resend Code
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('phone');
                        setOtp('');
                        setError('');
                      }}
                      className="text-slate-600 font-medium hover:text-slate-700 hover:underline text-sm transition-colors duration-200"
                    >
                      Try Different Number
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200/60 px-8 py-4 bg-gradient-to-r from-slate-50/80 to-orange-50/30 backdrop-blur-sm">
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              By continuing, you agree to our{' '}
              <button className="text-orange-600 hover:text-orange-700 hover:underline font-medium transition-colors duration-200">
                Terms of Service
              </button>
              {' '}and{' '}
              <button className="text-orange-600 hover:text-orange-700 hover:underline font-medium transition-colors duration-200">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Success Screen */}
      {showSuccessScreen && <OTPSuccessScreen onContinue={() => navigate('/dashboard')} />}
    </div>
  );
};