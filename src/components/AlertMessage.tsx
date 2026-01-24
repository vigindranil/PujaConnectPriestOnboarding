import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'info';

interface AlertMessageProps {
  type: AlertType;
  title: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  title,
  message,
  onClose,
  autoClose = true,
  duration = 4000,
}) => {
  useEffect(() => {
    if (!autoClose || !onClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [autoClose, duration, onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const borderColor = {
    success: 'border-l-4 border-l-green-500',
    error: 'border-l-4 border-l-red-500',
    info: 'border-l-4 border-l-blue-500',
  };

  const titleColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  };

  const messageColor = {
    success: 'text-green-700',
    error: 'text-red-700',
    info: 'text-blue-700',
  };

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  }[type];

  return (
    <div
      className={`${bgColor[type]} ${borderColor[type]} p-4 rounded-lg shadow-lg flex gap-4 items-start animate-pulse`}
      role="alert"
    >
      <Icon className={`w-6 h-6 flex-shrink-0 ${type === 'success' ? 'text-green-600' : type === 'error' ? 'text-red-600' : 'text-blue-600'}`} />
      <div className="flex-1">
        <h3 className={`font-bold ${titleColor[type]}`}>{title}</h3>
        <p className={`text-sm ${messageColor[type]}`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  );
};
