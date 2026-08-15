import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, FileText, User, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import VerificationBadge from '../../components/common/VerificationBadge';
import { institutionApi } from '../../api/institutionApi';

const InstitutionProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await institutionApi.getMyInstitution();
        setProfile(data);
      } catch (err) {
        console.error('Error loading institution profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <DashboardLayout title="Institution Profile" subtitle="Your registered organization details and admin verification status">
      {loading ? (
        <div className="p-8 text-center text-xs font-semibold text-slate-500">Loading profile...</div>
      ) : profile ? (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-8 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider">Registered Institution</span>
              <VerificationBadge status={profile.verificationStatus} />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight">{profile.institutionName}</h1>
            <div className="text-xs text-indigo-200">Registration Reg. No: <span className="font-mono font-bold text-white">{profile.registrationNumber}</span></div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Admin Representative</span>
                </div>
                <div className="text-slate-700 font-semibold">{profile.fullName || 'Admin User'}</div>
                <div className="text-slate-500">{profile.email}</div>
                <div className="text-slate-500">{profile.phone}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>Physical Address & City</span>
                </div>
                <div className="text-slate-700 font-semibold">{profile.city}</div>
                <div className="text-slate-500 leading-relaxed">{profile.address}</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Organization Description & Mission</span>
              </div>
              <p className="text-slate-600 leading-relaxed">{profile.description || 'No description provided.'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs font-semibold text-slate-500">Failed to load profile.</div>
      )}
    </DashboardLayout>
  );
};

export default InstitutionProfile;
