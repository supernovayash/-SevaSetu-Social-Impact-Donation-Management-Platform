import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Building2, AlertTriangle, ArrowRight, Activity, Users } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminApi } from '../../api/adminApi';

const AdminDashboard = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const data = await adminApi.getPendingInstitutions();
        setPendingCount(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        console.error('Failed to load pending institutions count:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  return (
    <DashboardLayout title="Super Admin Control Center" subtitle="Manage platform governance and institution verifications">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-rose-200 bg-rose-50/30 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            {pendingCount > 0 && (
              <span className="px-2.5 py-1 bg-rose-600 text-white font-extrabold text-xs rounded-full">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{pendingCount}</div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-0.5">Pending Institutions</div>
          </div>
          <Link
            to="/admin/institutions"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 pt-2"
          >
            <span>Review Registration Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">Active</div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-0.5">System Monitoring</div>
          </div>
          <div className="text-xs text-slate-400">REST API Gateway & Database Connectivity Operational</div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
