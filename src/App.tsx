import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginScreen } from './pages/LoginScreen';
import { Dashboard } from './pages/Dashboard';
import { PriestRegistration } from './pages/PriestRegistration';
import { AdminDashboard } from './pages/AdminDashboard';
import './App.css';
import { Profile } from './pages/Profile';

function App() {
  return (

    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/priest-registration" element={<PriestRegistration />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

  );
}

export default App;
