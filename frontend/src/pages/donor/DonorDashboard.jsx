import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  PlusCircle,
  Coins,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import DonationCard from '../../components/DonationCard';
import DonationTimeline from '../../components/DonationTimeline';
import ConfirmModal from '../../components/ConfirmModal';
import { GridSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { donationApi } from '../../api/donationApi';
import { paymentApi } from '../../api/paymentApi';
import { useToast } from '../../context/ToastContext';

const DonorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTimelineId, setActiveTimelineId] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Cancel pledge modal state
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const { showToast } = useToast();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await donationApi.getMyHistory();
      setDonations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching donation history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleTrack = async (id) => {
    setActiveTimelineId(id);
    setTimelineLoading(true);
    try {
      const events = await donationApi.getTimeline(id);
      setTimelineEvents(Array.isArray(events) ? events : []);
    } catch (err) {
      showToast('Failed to load timeline.', 'error');
    } finally {
      setTimelineLoading(false);
    }
  };

  const handlePay = async (id) => {
    try {
      const orderData = await paymentApi.createOrder(id);
      if (window.Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Seva Setu Impact',
          description: `Donation #${id}`,
          order_id: orderData.razorpayOrderId,
          handler: async function (response) {
            try {
              await paymentApi.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              showToast('Payment verified successfully!', 'success');
              fetchHistory();
            } catch (err) {
              showToast('Payment verification failed.', 'error');
            }
          },
          theme: { color: '#059669' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        showToast('Razorpay SDK not available.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Payment initiation failed.', 'error');
    }
  };

  const handleConfirmCancelPledge = async () => {
    if (!cancelTargetId) return;
    setCancelling(true);
    try {
      await donationApi.updateStatus(cancelTargetId, 'CANCELLED', 'Cancelled by donor');
      showToast('Donation pledge cancelled successfully.', 'success');
      setCancelTargetId(null);
      fetchHistory();
    } catch (err) {
      showToast(err.message || 'Failed to cancel pledge.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  // Metrics summary calculations
  const totalCount = donations.length;
  const pledgedCount = donations.filter((d) => d.status === 'PLEDGED').length;
  const confirmedCount = donations.filter((d) => d.status === 'CONFIRMED').length;
  const inProgressCount = donations.filter((d) => d.status === 'ASSIGNED' || d.status === 'PICKED_UP').length;
  const deliveredCount = donations.filter((d) => d.status === 'DELIVERED').length;
  const utilizedCount = donations.filter((d) => d.status === 'UTILIZED').length;

  const currentActiveDonation = donations.find((d) => d.id === activeTimelineId);

  return (
    <DashboardLayout title="Donor Overview" subtitle="Track your contributions and social impact progress">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Pledges</div>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 bg-amber-50/40 shadow-xs space-y-1">
          <div className="text-xs font-bold text-amber-700 uppercase">Pledged</div>
          <div className="text-2xl font-black text-amber-900">{pledgedCount}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-200 bg-blue-50/40 shadow-xs space-y-1">
          <div className="text-xs font-bold text-blue-700 uppercase">Confirmed</div>
          <div className="text-2xl font-black text-blue-900">{confirmedCount}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-purple-200 bg-purple-50/40 shadow-xs space-y-1">
          <div className="text-xs font-bold text-purple-700 uppercase">In Transit</div>
          <div className="text-2xl font-black text-purple-900">{inProgressCount}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-teal-200 bg-teal-50/40 shadow-xs space-y-1">
          <div className="text-xs font-bold text-teal-700 uppercase">Delivered</div>
          <div className="text-2xl font-black text-teal-900">{deliveredCount}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 bg-emerald-50/40 shadow-xs space-y-1">
          <div className="text-xs font-bold text-emerald-700 uppercase">Utilized</div>
          <div className="text-2xl font-black text-emerald-900">{utilizedCount}</div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold">Want to support another cause?</h3>
          <p className="text-xs text-emerald-100">
            Choose between donating to a specific verified need or making an open community donation.
          </p>
        </div>
        <Link
          to="/donor/donate"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-md shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          <span>Create New Donation</span>
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">Recent Donations</h3>
          <Link to="/donor/donations" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View Full History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <GridSkeleton count={3} />
        ) : donations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.slice(0, 6).map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                onTrack={handleTrack}
                onPay={handlePay}
                onCancel={(id) => setCancelTargetId(id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Donations Yet"
            description="Start your impact journey by choosing a cause or creating an open donation."
            actionLink="/donor/donate"
            actionText="Make Your First Donation"
          />
        )}
      </div>

      {/* Timeline Modal */}
      {activeTimelineId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Donation Tracking #DON-{activeTimelineId}</h3>
                <p className="text-xs text-slate-500">Live lifecycle updates</p>
              </div>
              <button
                onClick={() => setActiveTimelineId(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {timelineLoading ? (
              <div className="p-8 text-center text-xs font-semibold text-slate-500">Loading timeline...</div>
            ) : (
              <DonationTimeline
                events={timelineEvents}
                currentStatus={currentActiveDonation?.status || 'PLEDGED'}
              />
            )}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={!!cancelTargetId}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleConfirmCancelPledge}
        title="Cancel Donation Pledge"
        message={`Are you sure you want to cancel donation pledge #DON-${cancelTargetId}?`}
        confirmText="Yes, Cancel Pledge"
        isDanger={true}
        loading={cancelling}
      />
    </DashboardLayout>
  );
};

export default DonorDashboard;
