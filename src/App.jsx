import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import FamilyExplainer from './pages/family-explainer/FamilyExplainer';

import Onboarding from './pages/onboarding/Onboarding';
import Screening from './pages/screening/Screening';
import Dashboard from './pages/dashboard/Dashboard';
import Tracker from './pages/tracker/Tracker';
import VoiceLog from './pages/voice-log/VoiceLog';
import Detective from './pages/detective/Detective';
import Diet from './pages/diet/Diet';
import Festival from './pages/festival/Festival';
import LabReport from './pages/lab-report/LabReport';
import Timeline from './pages/timeline/Timeline';
import Community from './pages/community/Community';
import Education from './pages/education/Education';
import Settings from './pages/settings/Settings';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      <main>
        <Routes>
          {/* ── Public routes — no auth required ── */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Intentionally public — shareable with family members */}
          <Route path="/family-explainer" element={<FamilyExplainer />} />

          {/* ── Protected routes — require a logged-in session ── */}
          {/* /onboarding and /screening need auth but NOT a complete profile/screening. */}
          {/* ProtectedRoute handles the correct redirect for each state internally. */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/screening"
            element={
              <ProtectedRoute>
                <Screening />
              </ProtectedRoute>
            }
          />

          {/* ── Full-access routes — need session + onboarding + screening ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracker"
            element={
              <ProtectedRoute>
                <Tracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voice-log"
            element={
              <ProtectedRoute>
                <VoiceLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/detective"
            element={
              <ProtectedRoute>
                <Detective />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diet"
            element={
              <ProtectedRoute>
                <Diet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/festival"
            element={
              <ProtectedRoute>
                <Festival />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lab-report"
            element={
              <ProtectedRoute>
                <LabReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timeline"
            element={
              <ProtectedRoute>
                <Timeline />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            }
          />
          <Route
            path="/education"
            element={
              <ProtectedRoute>
                <Education />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
