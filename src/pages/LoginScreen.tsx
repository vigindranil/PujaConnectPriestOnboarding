import React, { useState, useEffect } from 'react';
import { Flame, ArrowLeft, Phone, Lock, User, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageCarousel } from '../components/ImageCarousel';
import { AlertMessage } from '../components/AlertMessage';
import { OTPSuccessScreen } from '../components/OTPSuccessScreen';
import { authService } from '../services/authService';
import { authServiceV1 } from '../services/authServiceV1';

// --- STYLE INJECTION: Dashboard "Stone" Aesthetics ---
// const dashboardStyles = `
//   @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&display=swap');

//   :root {
//     --c-stone-shadow: #E6DCC8;
//   }

//   body {
//     font-family: 'Urbanist', sans-serif;
//   }

//   /* --- Dashboard "Stone Inset" Look for Inputs --- */
//   .stone-inset {
//     background: #fdfaf4;
//     box-shadow: inset 3px 3px 6px #e6dfcf, inset -3px -3px 6px #ffffff;
//     border-radius: 12px;
//     border: none;
//   }

//   .stone-inset:focus-within {
//     box-shadow: inset 4px 4px 8px #e6dfcf, inset -4px -4px 8px #ffffff;
//     background: #fffbf2;
//   }

//   /* --- Dashboard Button Clip Path --- */
//   .clip-chamfer {
//     clip-path: polygon(
//       15px 0, 100% 0, 
//       100% calc(100% - 15px), calc(100% - 15px) 100%, 
//       0 100%, 0 15px
//     );
//   }
// `;


// --- SACRED GEOMETRY & 3D STYLE INJECTION ---
// const dashboardStyles = `
//   @import url('https://fonts.googleapis.com/css2?family=Philosopher:ital,wght@0,400;0,700;1,400&family=Urbanist:wght@300;400;500;600;700&display=swap');

//   :root {
//     --c-primary: #D97706; 
//     --c-secondary: #9F1239;
//     --c-bg: #FFFBF2; 
//     --c-stone-light: #FFFFFF;
//     --c-stone-shadow: #E6DCC8;
//     --c-text: #292524;
//   }

//   body {
//     background-color: var(--c-bg);
//     font-family: 'Urbanist', sans-serif;
//     color: var(--c-text);
//     overflow-x: hidden;
//   }

//   .font-sacred { font-family: 'Philosopher', serif; }

//   /* --- 3D Embedded Look (Neumorphic/Stone) --- */
//   .stone-card {
//     background: linear-gradient(145deg, #ffffff, #fff8f0);
//     box-shadow: 
//       8px 8px 16px var(--c-stone-shadow), 
//       -8px -8px 16px #ffffff;
//     border: 1px solid rgba(255,255,255,0.4);
//     transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
//   }

//   .stone-card:hover {

//     box-shadow: 
//       15px 15px 25px rgba(217, 119, 6, 0.15), 
//       -8px -8px 16px #ffffff;
//     border-color: rgba(217, 119, 6, 0.2);
//   }

//   .stone-inset {
//     background: #fdfaf4;
//     box-shadow: inset 3px 3px 6px #e6dfcf, inset -3px -3px 6px #ffffff;
//     border-radius: 12px;
//   }

//   /* --- Complex Geometric Backgrounds --- */
//   .geo-pattern {
//     position: fixed;
//     pointer-events: none;
//     z-index: -1;
//     opacity: 0.4;
//   }

//   /* Sri Yantra-ish Lines */
//   .yantra-lines {
//     background-image: repeating-linear-gradient(
//       45deg,
//       rgba(217, 119, 6, 0.03) 0px,
//       rgba(217, 119, 6, 0.03) 1px,
//       transparent 1px,
//       transparent 10px
//     ),
//     repeating-linear-gradient(
//       -45deg,
//       rgba(159, 18, 57, 0.03) 0px,
//       rgba(159, 18, 57, 0.03) 1px,
//       transparent 1px,
//       transparent 10px
//     );
//   }

//   /* --- Clip Paths --- */
//   .clip-chamfer {
//     clip-path: polygon(
//       15px 0, 100% 0, 
//       100% calc(100% - 15px), calc(100% - 15px) 100%, 
//       0 100%, 0 15px
//     );
//   }

//   .clip-hex-btn {
//     clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
//   }

//   /* --- Animations --- */
//   @keyframes float-gentle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
//   .animate-float { animation: float-gentle 6s ease-in-out infinite; }

//   @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
//   .animate-spin-slow { animation: spin-slow 120s linear infinite; }

//   /* Table Animations */
//   .table-row-animate {
//     transition: transform 0.2s ease, background-color 0.2s;
//   }
//   .table-row-animate:hover {
//     transform: translateX(4px);
//     background-color: rgba(217, 119, 6, 0.03);
//     z-index: 10;
//     position: relative;
//     box-shadow: 0 4px 12px rgba(0,0,0,0.05);
//   }

//   /* Scrollbar */
//   ::-webkit-scrollbar { width: 8px; height: 8px; }
//   ::-webkit-scrollbar-track { background: #f1f1f1; }
//   ::-webkit-scrollbar-thumb { background: #D97706; border-radius: 4px; }
//   ::-webkit-scrollbar-thumb:hover { background: #9F1239; }
// `;


// --- SACRED GEOMETRY & 3D STYLE INJECTION (Matching Dashboard) ---
const sacredStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Philosopher:ital,wght@0,400;0,700;1,400&family=Urbanist:wght@300;400;500;600;700&display=swap');
  
  :root {
    --c-primary: #D97706; 
    --c-secondary: #9F1239;
    --c-bg: #FFFBF2; 
    --c-stone-shadow: #E6DCC8;
    --c-text: #292524;
  }
  
  body {
    background-color: var(--c-bg);
    font-family: 'Urbanist', sans-serif;
    color: var(--c-text);
  }

  .font-sacred { font-family: 'Philosopher', serif; }
  
  /* --- Stone Card Look --- */
  .stone-card {
    background: linear-gradient(145deg, #ffffff, #fff8f0);
    box-shadow: 
      8px 8px 16px var(--c-stone-shadow), 
      -8px -8px 16px #ffffff;
    border: 1px solid rgba(255,255,255,0.4);
  }

  .stone-inset {
    background: #fdfaf4;
    box-shadow: inset 3px 3px 6px #e6dfcf, inset -3px -3px 6px #ffffff;
    border-radius: 12px;
  }

  /* --- Backgrounds --- */
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

  /* --- Animations --- */
  @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .animate-spin-slow { animation: spin-slow 120s linear infinite; }
  
  @keyframes float-gentle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  .animate-float { animation: float-gentle 6s ease-in-out infinite; }
`;


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

  // Inject the font and stone styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = sacredStyles;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
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
      let userData; // Assuming response logic handles this

      if (userType === 'authority') {
        await authServiceV1.validateAuthorityOTP(cleanPhone, otp);
      } else {
        await authServiceV1.validateOTP(cleanPhone, otp);
      }

      const storedData = {
        ...userData,
        loginType: userType
      };

      localStorage.setItem('puja_connect_user', JSON.stringify(storedData));

      setLoading(false);
      setSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessScreen(true);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
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
    return `${part1}${part2 ? ' ' + part2 : ''}${part3 ? ' ' + part3 : ''}`;
  };

  return (
    // 1. ORIGINAL BACKGROUND & GRADIENT PRESERVED
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">

      {/* 2. ORIGINAL BLOBS PRESERVED */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-amber-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-red-200/20 to-orange-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* 3. ORIGINAL CAROUSEL PRESERVED */}
      <ImageCarousel autoPlay={true} interval={5000} />

      <div className="w-full max-w-md relative z-10">

        {/* Back Button */}
        {step === 'otp' && (
          <button
            onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
            className="flex items-center gap-2 text-slate-600 hover:text-orange-600 mb-6 transition-all duration-200 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        )}

        {/* Card Container - Added subtle stone shadow to match dashboard depth */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[8px_8px_16px_#E6DCC8] border border-white/40 overflow-hidden hover:shadow-2xl transition-all duration-300">

          {/* Header */}
          <div className="bg-gradient-to-r from-orange-400 via-orange-200 to-amber-500 p-8 pb-6 border-b border-orange-200 text-center relative overflow-hidden">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full"></div>
                <Flame className="w-12 h-12 text-orange-600 drop-shadow-sm" />
                <div className="absolute top-0 right-0 w-3 h-3 bg-amber-400 rounded-full animate-pulse border-2 border-white"></div>
              </div>
              <h1 className="text-4xl font-sacred font-bold text-stone-800 mb-1">PujaConnect</h1>
              <p className="text-stone-500 font-medium text-sm tracking-wide uppercase">
                {step === 'phone' ? 'Spiritual Gateway' : 'Verify Identity'}
              </p>
            </div>
          </div>

          {/* Content Area - MODIFIED to use Dashboard "Stone" Styles */}
          <div className="px-8 pt-8 pb-4">
            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">

                {successAlert && (
                  <div className="mb-6">
                    <AlertMessage type="success" title="OTP Sent" message="Please check your phone." />
                  </div>
                )}

                {/* DASHBOARD STYLE: Stone Toggle Switch */}
                <div className="stone-inset p-1.5 flex items-center mb-6 relative bg-stone-50">
                  {/* Animated background pill */}
                  <div
                    className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-stone-100"
                    style={{ transform: userType === 'authority' ? 'translateX(100%) translateX(6px)' : 'translateX(0)' }}
                  ></div>

                  <button
                    type="button"
                    onClick={() => setUserType('user')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 relative z-10 ${userType === 'user' ? 'text-orange-600' : 'text-stone-400'}`}
                  >
                    <User className="w-4 h-4" />
                    Priest
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('authority')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 relative z-10 ${userType === 'authority' ? 'text-orange-600' : 'text-stone-400'}`}
                  >
                    <Crown className="w-4 h-4" />
                    Authority
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Mobile Number</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-stone-400 group-focus-within:text-orange-600 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    {/* DASHBOARD STYLE: Stone Inset Input */}
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(formatPhoneNumber(e.target.value));
                        setError('');
                      }}
                      placeholder="Enter 10-digit number"
                      className="w-full pl-12 pr-4 py-4 stone-inset text-lg font-semibold text-stone-700 placeholder:text-stone-300 focus:outline-none transition-all"
                      maxLength={12}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                    <p className="text-red-700 text-sm font-bold">{error}</p>
                  </div>
                )}

                {/* DASHBOARD STYLE: Chamfered Button */}
                <button
                  type="submit"
                  disabled={loading || phoneNumber.replace(/\D/g, '').length !== 10}
                  className={`group relative w-full py-4 font-bold text-lg transition-all duration-300 clip-chamfer
                    ${loading || phoneNumber.replace(/\D/g, '').length !== 10
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg hover:shadow-orange-200/50 hover:-translate-y-0.5'
                    }`}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-8">

                {successAlert && (
                  <div className="mb-6"><AlertMessage type="success" title="Verified!" message="Welcome back." /></div>
                )}

                <div className="text-center mb-8">
                  {/* Dashboard Style Icon Container */}
                  <div className="inline-flex items-center justify-center w-16 h-16 stone-inset mb-4 rounded-full">
                    <Lock className="w-7 h-7 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">Enter Code</h3>
                  <p className="text-slate-500 text-sm">
                    Sent to <span className="font-bold text-slate-700">+91 {phoneNumber}</span>
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index] || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const newOtp = otp.split('');
                        newOtp[index] = value;
                        setOtp(newOtp.join('').slice(0, 6));
                        setError('');
                        if (value && index < 5) {
                          (document.querySelector(`input[data-otp-index="${index + 1}"]`) as HTMLInputElement)?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otp[index] && index > 0) {
                          (document.querySelector(`input[data-otp-index="${index - 1}"]`) as HTMLInputElement)?.focus();
                        }
                      }}
                      data-otp-index={index}
                      className="w-12 h-14 text-center text-2xl font-bold stone-inset text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  ))}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center">
                    <p className="text-red-700 text-sm font-bold">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className={`group relative w-full py-4 font-bold text-lg transition-all duration-300 clip-chamfer
                    ${loading || otp.length !== 6
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg hover:shadow-orange-200/50 hover:-translate-y-0.5'
                    }`}
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>

                <div className="text-center space-y-3 pt-2">
                  <div className="flex items-center justify-center gap-4 text-sm font-semibold">
                    <button type="button" className="text-orange-600 hover:text-orange-700">Resend Code</button>
                    <span className="text-slate-300">•</span>
                    <button type="button" onClick={() => { setStep('phone'); setOtp(''); }} className="text-slate-500 hover:text-slate-700">Change Number</button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-8 py-4 bg-stone-50">
            <p className="text-xs text-slate-400 text-center font-bold uppercase tracking-wider">
              Secure Spiritual Network
            </p>
          </div>
        </div>
      </div>

      {showSuccessScreen && <OTPSuccessScreen onContinue={() => navigate('/dashboard')} />}
    </div>
  );
};