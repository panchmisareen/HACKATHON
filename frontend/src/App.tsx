import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MissionsPage from './pages/MissionsPage';
import CoachPage from './pages/CoachPage';
import ImpactPage from './pages/ImpactPage';
import CarbonEnginePage from './pages/CarbonEnginePage';
import LeaguePage from './pages/LeaguePage';
import PassportPage from './pages/PassportPage';
import CampusMapPage from './pages/CampusMapPage';
import GoalsPage from './pages/GoalsPage';
import ThriftClubPage from './pages/ThriftClubPage';
import FeedPage from './pages/FeedPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/app" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="missions" element={<MissionsPage />} />
        <Route path="coach" element={<CoachPage />} />
        <Route path="impact" element={<ImpactPage />} />
        <Route path="calculator" element={<CarbonEnginePage />} />
        <Route path="carbon-engine" element={<Navigate to="/app/calculator" replace />} />
        <Route path="league" element={<LeaguePage />} />
        <Route path="thrift" element={<ThriftClubPage />} />
        <Route path="feed" element={<FeedPage />} />
        <Route path="passport" element={<PassportPage />} />
        <Route path="map" element={<CampusMapPage />} />
        <Route path="goals" element={<GoalsPage />} />
      </Route>
      {/* Legacy /dashboard redirect */}
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
