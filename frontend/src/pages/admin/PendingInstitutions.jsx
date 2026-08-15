import React, { useState, useEffect } from 'react';
import { ShieldCheck, Building2, User, Mail, MapPin, FileText, CheckCircle2, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ConfirmModal from '../../components/ConfirmModal';
import VerificationBadge from '../../components/common/VerificationBadge';
import EmptyState from '../../components/EmptyState';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';

const PendingInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Approval modal state
  const [actionTarget, setActionTarget] = useState(null); // { id, name, approve: boolean }
  const [processing, setProcessing] = useState(false);

  const { showToast } = useToast();

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPendingInstitutions();
      setInstitutions(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Failed to fetch pending institutions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleConfirmVerify = async () => {
    if (!actionTarget) return;
    setProcessing(true);

    try {
      await adminApi.verifyInstitution(actionTarget.id, actionTarget.approve);
      showToast(
        `Institution ${actionTarget.name} has been ${actionTarget.approve ? 'APPROVED' : 'REJECTED'}.`,
        actionTarget.approve ? 'success' : 'warning'
      );
      setActionTarget(null);
      fetchPending();
    } catch (err) {
      showToast(err.message || 'Verification operation failed.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout title="Pending Institution Verification" subtitle="Review government NGO registration documents and approve or reject access">
      {loading ? (
        <div className="p-8 text-center text-xs font-semibold text-slate-500">Loading pending verification queue...</div>
      ) : institutions.length > 0 ? (
        <div className="space-y-6">
          {institutions.map((inst) => (
            <div key={inst.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-xl font-bold text-slate-900">{inst.institutionName}</h3>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Registration No: <span className="font-mono font-bold text-slate-700">{inst.registrationNumber || 'N/A'}</span>
                  </div>
                </div>
                <VerificationBadge status={inst.verificationStatus || 'PENDING'} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 font-medium">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Admin Contact</span>
                  </div>
                  <div>{inst.fullName || 'Admin User'}</div>
                  <div className="text-slate-500">{inst.email}</div>
                  <div className="text-slate-500">{inst.phone}</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Operating City & Address</span>
                  </div>
                  <div>{inst.city}</div>
                  <div className="text-slate-500">{inst.address}</div>
                </div>
              </div>

              {inst.description && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-1">
                  <div className="font-bold text-slate-900">Organization Statement</div>
                  <p className="text-slate-600 leading-relaxed">{inst.description}</p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  onClick={() => setActionTarget({ id: inst.id, name: inst.institutionName, approve: false })}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Application</span>
                </button>
                <button
                  onClick={() => setActionTarget({ id: inst.id, name: inst.institutionName, approve: true })}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Verify</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title="No Pending Institutions"
          description="All submitted institution registration applications have been processed."
        />
      )}

      {/* Verification Modal */}
      <ConfirmModal
        isOpen={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={handleConfirmVerify}
        title={actionTarget?.approve ? 'Approve Institution Application' : 'Reject Institution Application'}
        message={
          actionTarget?.approve
            ? `Are you sure you want to APPROVE "${actionTarget?.name}"? Once approved, the institution can publish community needs and claim open donations.`
            : `Are you sure you want to REJECT "${actionTarget?.name}"?`
        }
        confirmText={actionTarget?.approve ? 'Approve Institution' : 'Reject Application'}
        isDanger={!actionTarget?.approve}
        loading={processing}
      />
    </DashboardLayout>
  );
};

export default PendingInstitutions;
