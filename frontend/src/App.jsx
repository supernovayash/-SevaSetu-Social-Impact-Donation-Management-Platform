import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Needs from './pages/Needs';
import NeedDetails from './pages/NeedDetails';

// Donor Pages
import DonorDashboard from './pages/donor/DonorDashboard';
import MyDonations from './pages/donor/MyDonations';
import CreateDonation from './pages/donor/CreateDonation';
import DonationDetails from './pages/donor/DonationDetails';

// Institution Pages
import InstitutionDashboard from './pages/institution/InstitutionDashboard';
import InstitutionProfile from './pages/institution/InstitutionProfile';
import ManageNeeds from './pages/institution/ManageNeeds';
import CreateNeed from './pages/institution/CreateNeed';
import OpenDonations from './pages/institution/OpenDonations';
import InstitutionLogistics from './pages/institution/InstitutionLogistics';
import SubmitProof from './pages/institution/SubmitProof';

// Volunteer Pages
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingInstitutions from './pages/admin/PendingInstitutions';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/donor" element={<Register />} />
            <Route path="/register/institution" element={<Register />} />
            <Route path="/register/volunteer" element={<Register />} />
            <Route path="/needs" element={<Needs />} />
            <Route path="/needs/:id" element={<NeedDetails />} />

            {/* Protected DONOR Routes */}
            <Route
              path="/donor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['DONOR']}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/donations"
              element={
                <ProtectedRoute allowedRoles={['DONOR']}>
                  <MyDonations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/donations/:id"
              element={
                <ProtectedRoute allowedRoles={['DONOR']}>
                  <DonationDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/donate"
              element={
                <ProtectedRoute allowedRoles={['DONOR']}>
                  <CreateDonation />
                </ProtectedRoute>
              }
            />

            {/* Protected INSTITUTION_ADMIN Routes */}
            <Route
              path="/institution/dashboard"
              element={
                <ProtectedRoute allowedRoles={['INSTITUTION_ADMIN']}>
                  <InstitutionDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/institution/profile"
              element={
                <ProtectedRoute allowedRoles={['INSTITUTION_ADMIN']}>
                  <InstitutionProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/institution/needs"
              element={
                <ProtectedRoute allowedRoles={['INSTITUTION_ADMIN']}>
                  <ManageNeeds />
                </ProtectedRoute>
              }
            />
            <Route
              path="/institution/needs/create"
              element={
                <ProtectedRoute allowedRoles={['INSTITUTION_ADMIN']}>
                  <CreateNeed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/institution/open-donations"
              element={
                <ProtectedRoute allowedRoles={['INSTITUTION_ADMIN']}>
                  <OpenDonations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/institution/logistics"
              element={
                <ProtectedRoute allowedRoles={['INSTITUTION_ADMIN']}>
                  <InstitutionLogistics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/institution/proof"
              element={
                <ProtectedRoute allowedRoles={['INSTITUTION_ADMIN']}>
                  <SubmitProof />
                </ProtectedRoute>
              }
            />

            {/* Protected VOLUNTEER Routes */}
            <Route
              path="/volunteer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['VOLUNTEER']}>
                  <VolunteerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/pickups"
              element={
                <ProtectedRoute allowedRoles={['VOLUNTEER']}>
                  <VolunteerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected SUPER_ADMIN Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/institutions"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <PendingInstitutions />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
