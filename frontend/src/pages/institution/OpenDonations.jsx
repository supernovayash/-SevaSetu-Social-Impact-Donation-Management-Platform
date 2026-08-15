import React, { useState, useEffect } from 'react';
import { PackageOpen, Coins, Package, Calendar, User, ArrowRight, Sparkles } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ConfirmModal from '../../components/ConfirmModal';
import { GridSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { donationApi } from '../../api/donationApi';
import { useToast } from '../../context/ToastContext';

const OpenDonations = () => {
  const [openDonations, setOpenDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Claim modal state
  const [claimTargetId, setClaimTargetId] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const { showToast } = useToast();

  const fetchOpenDonations = async () => {
    setLoading(true);
    try {
      const data = await donationApi.getOpenDonations();
      setOpenDonations(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Failed to fetch open donations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenDonations();
  }, []);

  const handleConfirmClaim = async () => {
    if (!claimTargetId) return;
    setClaiming(true);

    try {
      await donationApi.claimDonation(claimTargetId);
      showToast('Donation claimed successfully for your institution!', 'success');
      setClaimTargetId(null);
      fetchOpenDonations();
    } catch (err) {
      if (err.status === 409) {
        showToast('This donation has already been claimed by another institution.', 'error');
      } else {
        showToast(err.message || 'Failed to claim donation.', 'error');
      }
    } finally {
      setClaiming(false);
    }
  };

  return (
    <DashboardLayout title="Open Donations Marketplace" subtitle="Browse unlinked donor pledges and claim them for your institution">
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between text-xs text-indigo-950 font-medium">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Open donations are pledged by donors without specifying a particular need. Once claimed, they associate with your institution.</span>
        </div>
      </div>

      {loading ? (
        <GridSkeleton count={6} />
      ) : openDonations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {openDonations.map((item) => {
            const isMoney = item.type === 'MONEY';
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
                      {item.category || 'Open Pledge'}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">#DON-{item.id}</span>
                  </div>

                  <div>
                    <div className="text-2xl font-black text-slate-900">
                      {isMoney ? `₹${item.amount?.toLocaleString('en-IN')}` : `${item.quantity || 0} ${item.unit || 'units'}`}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                      {item.description || `Unlinked ${item.category || 'material'} contribution`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{item.donorName || 'Generous Donor'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : 'Recently'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setClaimTargetId(item.id)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Claim Donation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={PackageOpen}
          title="No Open Donations Available"
          description="There are currently no unclaimed open donations. Check back soon!"
        />
      )}

      {/* Claim Confirmation Modal */}
      <ConfirmModal
        isOpen={!!claimTargetId}
        onClose={() => setClaimTargetId(null)}
        onConfirm={handleConfirmClaim}
        title="Claim Open Donation"
        message={`Are you sure you want to claim donation #DON-${claimTargetId} for your institution? Once claimed, your institution will take ownership of fulfilling its pickup and distribution.`}
        confirmText="Yes, Claim Donation"
        loading={claiming}
      />
    </DashboardLayout>
  );
};

export default OpenDonations;
