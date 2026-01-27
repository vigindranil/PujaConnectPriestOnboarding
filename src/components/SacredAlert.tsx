import React from 'react';
import { X, Check, AlertTriangle, Info, Heart } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'blessing';

interface SacredAlertProps {
    type: AlertType;
    title: string;
    message: string;
    isVisible: boolean;
    onClose: () => void;
    autoClose?: boolean;
    duration?: number;
}

const SacredAlert: React.FC<SacredAlertProps> = ({
    type,
    title,
    message,
    isVisible,
    onClose,
    autoClose = true,
    duration = 5000
}) => {
    React.useEffect(() => {
        if (isVisible && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, autoClose, duration, onClose]);

    if (!isVisible) return null;

    const getAlertStyles = () => {
        switch (type) {
            case 'success':
                return {
                    container: 'bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 shadow-green-100',
                    icon: 'bg-green-500 text-white',
                    title: 'text-green-800',
                    message: 'text-green-700',
                    decoration: '🌿',
                    glow: 'shadow-lg shadow-green-200'
                };
            case 'error':
                return {
                    container: 'bg-gradient-to-r from-red-50 via-rose-50 to-red-50 border-2 border-red-200 shadow-red-100',
                    icon: 'bg-red-500 text-white',
                    title: 'text-red-800',
                    message: 'text-red-700',
                    decoration: '🔥',
                    glow: 'shadow-lg shadow-red-200'
                };
            case 'warning':
                return {
                    container: 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-200 shadow-amber-100',
                    icon: 'bg-amber-500 text-white',
                    title: 'text-amber-800',
                    message: 'text-amber-700',
                    decoration: '⚡',
                    glow: 'shadow-lg shadow-amber-200'
                };
            case 'info':
                return {
                    container: 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200 shadow-blue-100',
                    icon: 'bg-blue-500 text-white',
                    title: 'text-blue-800',
                    message: 'text-blue-700',
                    decoration: '🔔',
                    glow: 'shadow-lg shadow-blue-200'
                };
            case 'blessing':
                return {
                    container: 'bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-300 shadow-orange-100',
                    icon: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
                    title: 'text-orange-800',
                    message: 'text-orange-700',
                    decoration: '🪷',
                    glow: 'shadow-xl shadow-orange-200'
                };
            default:
                return {
                    container: 'bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200',
                    icon: 'bg-gray-500 text-white',
                    title: 'text-gray-800',
                    message: 'text-gray-700',
                    decoration: '📿',
                    glow: 'shadow-lg shadow-gray-200'
                };
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <Check className="w-5 h-5" />;
            case 'error':
                return <X className="w-5 h-5" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5" />;
            case 'info':
                return <Info className="w-5 h-5" />;
            case 'blessing':
                return <Heart className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    const styles = getAlertStyles();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className={`max-w-md w-full rounded-3xl p-6 ${styles.container} ${styles.glow} transform animate-bounce-in`}>
                {/* Decorative Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl animate-pulse">{styles.decoration}</span>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.icon} shadow-lg`}>
                            {getIcon()}
                        </div>
                        <span className="text-2xl animate-pulse">{styles.decoration}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/50 rounded-full transition-all duration-200 hover:scale-110"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Sacred Divider */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                    <span className="text-orange-500 text-sm">🕉️</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="text-center space-y-3">
                    <h3 className={`text-xl font-bold ${styles.title}`}>
                        {title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${styles.message}`}>
                        {message}
                    </p>
                </div>

                {/* Sacred Footer */}
                <div className="flex items-center justify-center gap-2 mt-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                    <span className="text-orange-500 text-xs">शुभम्</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                </div>

                {/* Auto-close Progress Bar */}
                {autoClose && (
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full animate-progress-bar"
                                style={{ animationDuration: `${duration}ms` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(-100px);
          }
          50% {
            opacity: 1;
            transform: scale(1.1) translateY(0px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0px);
          }
        }
        
        @keyframes progress-bar {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-progress-bar {
          animation: progress-bar linear;
        }
      `}</style>
        </div>
    );
};

export default SacredAlert;