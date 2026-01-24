import React, { useEffect } from 'react';
import { Check } from 'lucide-react';

interface OTPSuccessScreenProps {
  onContinue: () => void;
}

export const OTPSuccessScreen: React.FC<OTPSuccessScreenProps> = ({ onContinue }) => {
  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      onContinue();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center animate-fadeIn">
        {/* Religious Icon - Om Symbol */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Outer circle */}
            <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
            {/* Middle circle */}
            <div className="absolute inset-2 border-2 border-orange-300 rounded-full"></div>
            {/* Inner OM symbol representation */}
            <div className="text-5xl font-bold text-orange-600">ॐ</div>
          </div>
        </div>

        {/* Success Icon */}
        <div className="mb-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="w-12 h-12 text-green-600 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Blessed!</h2>

        {/* Message */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your phone number has been verified successfully. Welcome to PujaConnect!
        </p>

        {/* Decorative line */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
          <span className="text-2xl text-orange-600">🙏</span>
          <div className="flex-1 h-px bg-gradient-to-l from-orange-200 to-transparent"></div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-600/30 transition"
        >
          Continue to Dashboard
        </button>

        {/* Footer message */}
        <p className="text-xs text-gray-500 mt-6">
          Redirecting automatically in 3 seconds...
        </p>
      </div>
    </div>
  );
};
