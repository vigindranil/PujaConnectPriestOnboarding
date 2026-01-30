import { useState, createElement } from 'react';
import SacredAlert, { type AlertType } from '../components/SacredAlert';

interface AlertState {
  isVisible: boolean;
  type: AlertType;
  title: string;
  message: string;
}

export const useSacredAlert = () => {
  const [alert, setAlert] = useState<AlertState>({
    isVisible: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = (type: AlertType, title: string, message: string) => {
    setAlert({
      isVisible: true,
      type,
      title,
      message
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isVisible: false }));
  };

  const showSuccess = (title: string, message: string) => showAlert('success', title, message);
  const showError = (title: string, message: string) => showAlert('error', title, message);
  const showWarning = (title: string, message: string) => showAlert('warning', title, message);
  const showInfo = (title: string, message: string) => showAlert('info', title, message);
  const showBlessing = (title: string, message: string) => showAlert('blessing', title, message);

  const AlertComponent = () => 
    createElement(SacredAlert, {
      type: alert.type,
      title: alert.title,
      message: alert.message,
      isVisible: alert.isVisible,
      onClose: hideAlert
    });

  return {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showBlessing,
    hideAlert,
    AlertComponent
  };
};