import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Heart,
  PlusCircle,
  PackageOpen,
  Truck,
  FileCheck2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import VerificationBadge from '../../components/common/VerificationBadge';
import { institutionApi } from '../../api/institutionApi';
import { donationApi } from '../../api/donationApi';
import { needApi } from '../../api/needApi';

const InstitutionDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [openDonationsCount, setOpenDonationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const instData = await institutionApi.getMyInstitution();
        setProfile(instData);

        const openDons = await donationApi.getOpenDonations();
        setOpenDonationsCount(Array.isArray(openDons) ? openDons.length : 0);
      } catch (err) {
        console.error('Failed to load institution data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const isVerified = profile?.verificationStatus === 'VERIFIED';
  const isPending = profile?.verificationStatus === 'PENDING' || !profile?.verificationStatus;

  return (
    <DashboardLayout title="Institution Admin Dashboard" subtitle="Manage needs, open donations, logistics, and proof of impact">
      {/* Verification Alert Banner */}
      {isPending && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-4 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="font-bold text-sm">Account Verification Status: PENDING</div>
            <p className="leading-relaxed">
              Your institution application has been registered and is currently under review by the Super Administrator. Once approved, you will be able to publish new community needs and receive direct donor pledges.
            </p>
          </div>
        </div>
      )}

      {isVerified && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>Verified Partner Institution — Fully authorized to publish needs and claim donations.</span>
          </div>
          <Link
            to="/institution/needs/create"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shrink-0"
          >
            + Publish New Need
          </Link>
        </div>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/institution/needs"
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Manage Active Needs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Track requirements & fulfillment progress</p>
          </div>
        </Link>

        <Link
          to="/institution/open-donations"
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <PackageOpen className="w-5 h-5" />
            </div>
            {openDonationsCount > 0 && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full">
                {openDonationsCount} Available
              </span>
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              Claim Open Donations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Browse unlinked donor contributions</p>
          </div>
        </Link>

        <Link
          to="/institution/logistics"
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              Assign Volunteers
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Dispatch volunteers & mark deliveries</p>
          </div>
        </Link>

        <Link
          to="/institution/proof"
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Submit Proof of Impact
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Upload photos & utilization reports</p>
          </div>
        </Link>
      </div>

      {/* Institution Details Summary */}
      {profile && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">{profile.institutionName}</h3>
            </div>
            <VerificationBadge status={profile.verificationStatus} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 font-medium">
            <div>
              <span className="font-bold text-slate-900 block">Registration Number:</span>
              {profile.registrationNumber || 'N/A'}
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Operating City:</span>
              {profile.city || 'N/A'}
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Physical Address:</span>
              {profile.address || 'N/A'}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InstitutionDashboard;
