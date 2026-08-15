import React, { useState, useEffect } from 'react';
import { donationApi } from '../../api/donationApi';
import { paymentApi } from '../../api/paymentApi';
import DashboardLayout from '../../components/DashboardLayout';
import DonationCard from '../../components/DonationCard';
import DonationTimeline from '../../components/DonationTimeline';
import ConfirmModal from '../../components/ConfirmModal';
import { GridSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';

const MyDonations = () => {
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
      showToast('Failed to fetch donation history.', 'error');
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
      showToast('Failed to load timeline events.', 'error');
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
        showToast('Razorpay SDK unavailable.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to initiate payment.', 'error');
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

  const currentDonation = donations.find((d) => d.id === activeTimelineId);

  return (
    <DashboardLayout title="My Donations History" subtitle="View and track all your past and active pledges">
      {loading ? (
        <GridSkeleton count={6} />
      ) : donations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
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
          title="No Donations Found"
          description="You haven't made any pledges yet. Choose a cause from the marketplace!"
          actionLink="/needs"
          actionText="Explore Marketplace"
        />
      )}

      {/* Timeline Modal */}
      {activeTimelineId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Donation Timeline #DON-{activeTimelineId}</h3>
                <p className="text-xs text-slate-500">Full audit trail of your contribution</p>
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
                currentStatus={currentDonation?.status || 'PLEDGED'}
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
        message={`Are you sure you want to cancel donation pledge #DON-${cancelTargetId}? This action will mark your pledge as CANCELLED.`}
        confirmText="Yes, Cancel Pledge"
        isDanger={true}
        loading={cancelling}
      />
    </DashboardLayout>
  );
};

export default MyDonations;
