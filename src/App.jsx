import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Screening from './pages/screening/Screening';
import Tracker from './pages/tracker/Tracker';
import VoiceLog from './pages/voice-log/VoiceLog';
import Detective from './pages/detective/Detective';
import Diet from './pages/diet/Diet';
import Festival from './pages/festival/Festival';
import LabReport from './pages/lab-report/LabReport';
import Timeline from './pages/timeline/Timeline';
import Community from './pages/community/Community';
import Education from './pages/education/Education';
import FamilyExplainer from './pages/family-explainer/FamilyExplainer';
import Dashboard from './pages/dashboard/Dashboard';
import Onboarding from './pages/onboarding/Onboarding';
import Settings from './pages/settings/Settings';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/screening" element={<Screening />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/voice-log" element={<VoiceLog />} />
          <Route path="/detective" element={<Detective />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/festival" element={<Festival />} />
          <Route path="/lab-report" element={<LabReport />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/community" element={<Community />} />
          <Route path="/education" element={<Education />} />
          <Route path="/family-explainer" element={<FamilyExplainer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
