import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, User, Clock, FileText, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { logisticsApi } from '../../api/logisticsApi';
import { donationApi } from '../../api/donationApi';
import { useToast } from '../../context/ToastContext';

const InstitutionLogistics = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign volunteer modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDonationId, setSelectedDonationId] = useState('');
  const [volunteerId, setVolunteerId] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Mark delivered modal state
  const [deliverTargetId, setDeliverTargetId] = useState(null);
  const [delivering, setDelivering] = useState(false);

  const { showToast } = useToast();

  const fetchLogisticsDonations = async () => {
    setLoading(true);
    try {
      const data = await donationApi.getMyHistory(); // Or associated institution donations
      setDonations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load logistics donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogisticsDonations();
  }, []);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDonationId || !volunteerId) {
      showToast('Please select donation and enter volunteer ID.', 'warning');
      return;
    }

    setSubmittingAssign(true);
    try {
      await logisticsApi.assignVolunteer({
        donationId: Number(selectedDonationId),
        volunteerId: Number(volunteerId),
        notes: notes || 'Pickup dispatch request',
      });
      showToast('Volunteer assigned successfully!', 'success');
      setShowAssignModal(false);
      setSelectedDonationId('');
      setVolunteerId('');
      setNotes('');
      fetchLogisticsDonations();
    } catch (err) {
      showToast(err.message || 'Failed to assign volunteer.', 'error');
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleConfirmDeliver = async () => {
    if (!deliverTargetId) return;
    setDelivering(true);
    try {
      await logisticsApi.markDelivered(deliverTargetId);
      showToast('Donation marked as DELIVERED to institution!', 'success');
      setDeliverTargetId(null);
      fetchLogisticsDonations();
    } catch (err) {
      showToast(err.message || 'Failed to mark as delivered.', 'error');
    } finally {
      setDelivering(false);
    }
  };

  return (
    <DashboardLayout title="Logistics & Volunteer Dispatch" subtitle="Manage volunteer assignments, pickups, and delivery confirmations">
      <div className="flex justify-between items-center">
        <div className="text-xs font-bold text-slate-500 uppercase">Logistics Pipeline</div>
        <button
          onClick={() => setShowAssignModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
        >
          <Truck className="w-4 h-4" />
          <span>+ Assign Volunteer to Pickup</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-semibold text-slate-500">Loading logistics task pipeline...</div>
      ) : donations.length > 0 ? (
        <div className="space-y-4">
          {donations.map((donation) => {
            const isPickedUp = donation.status === 'PICKED_UP';
            const isDelivered = donation.status === 'DELIVERED' || donation.status === 'UTILIZED';

            return (
              <div
                key={donation.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900">#DON-{donation.id}</span>
                    <StatusBadge status={donation.status} />
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    {donation.type === 'MONEY' ? `₹${donation.amount}` : `${donation.quantity} ${donation.unit}`} — {donation.needTitle || donation.description || 'Donation Item'}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {donation.status === 'CONFIRMED' && (
                    <button
                      onClick={() => {
                        setSelectedDonationId(donation.id);
                        setShowAssignModal(true);
                      }}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Assign Volunteer
                    </button>
                  )}

                  {isPickedUp && (
                    <button
                      onClick={() => setDeliverTargetId(donation.id)}
                      className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Delivered</span>
                    </button>
                  )}

                  {isDelivered && (
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
                      ✓ Delivered
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200 text-xs">
          No confirmed logistics items to manage.
        </div>
      )}

      {/* Assign Volunteer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Assign Volunteer to Pickup</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Donation ID</label>
                <input
                  type="number"
                  required
                  value={selectedDonationId}
                  onChange={(e) => setSelectedDonationId(e.target.value)}
                  placeholder="e.g. 123"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Volunteer User ID</label>
                <input
                  type="number"
                  required
                  value={volunteerId}
                  onChange={(e) => setVolunteerId(e.target.value)}
                  placeholder="e.g. 55"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dispatch Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Pickup before 6 PM from Ghaziabad address..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submittingAssign}
                className="w-full py-3 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20"
              >
                {submittingAssign ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Deliver Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deliverTargetId}
        onClose={() => setDeliverTargetId(null)}
        onConfirm={handleConfirmDeliver}
        title="Mark Donation as Delivered"
        message={`Confirm that donation #DON-${deliverTargetId} has arrived safely at your institution drop-off center.`}
        confirmText="Confirm Delivery"
        loading={delivering}
      />
    </DashboardLayout>
  );
};

export default InstitutionLogistics;
