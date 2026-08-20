import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, User, MapPin, Phone, Clock, FileText, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { logisticsApi } from '../../api/logisticsApi';
import { donationApi } from '../../api/donationApi';
import { useToast } from '../../context/ToastContext';

const InstitutionLogistics = () => {
  const [donations, setDonations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign volunteer modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDonationId, setSelectedDonationId] = useState('');
  const [volunteerId, setVolunteerId] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Accept / Confirm state
  const [acceptingId, setAcceptingId] = useState(null);

  // Mark delivered modal state
  const [deliverTargetId, setDeliverTargetId] = useState(null);
  const [delivering, setDelivering] = useState(false);

  const { showToast } = useToast();

  const fetchLogisticsDonations = async () => {
    setLoading(true);
    try {
      const data = await donationApi.getInstitutionDonations();
      setDonations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load logistics donations:', err);
      showToast('Failed to load institution donations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const data = await logisticsApi.getVolunteers();
      setVolunteers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load volunteers list:', err);
    }
  };

  useEffect(() => {
    fetchLogisticsDonations();
    fetchVolunteers();
  }, []);

  const handleAcceptDonation = async (donationId) => {
    setAcceptingId(donationId);
    try {
      await donationApi.updateStatus(donationId, 'CONFIRMED', 'Accepted by institution');
      showToast('Donation accepted and marked as CONFIRMED!', 'success');
      fetchLogisticsDonations();
    } catch (err) {
      showToast(err.message || 'Failed to accept donation.', 'error');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDonationId || !volunteerId) {
      showToast('Please select donation and select a volunteer.', 'warning');
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
    <DashboardLayout title="Logistics & Volunteer Dispatch" subtitle="Manage pledged donations, volunteer assignments, pickups, and deliveries">
      <div className="flex justify-between items-center">
        <div className="text-xs font-bold text-slate-500 uppercase">Donation Logistics Pipeline</div>
        <button
          onClick={() => {
            const confirmedDonation = donations.find(d => d.status === 'CONFIRMED');
            if (confirmedDonation) setSelectedDonationId(confirmedDonation.id);
            setShowAssignModal(true);
          }}
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
            const isPledged = donation.status === 'PLEDGED';
            const isConfirmed = donation.status === 'CONFIRMED';
            const isPickedUp = donation.status === 'PICKED_UP';
            const isDelivered = donation.status === 'DELIVERED' || donation.status === 'UTILIZED';

            return (
              <div
                key={donation.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                <div className="space-y-2.5 max-w-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900">#DON-{donation.id}</span>
                    <StatusBadge status={donation.status} />
                    {donation.openDonation && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                        Open Claimed
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-slate-800 font-bold">
                    {donation.type === 'MONEY' ? `₹${donation.amount?.toLocaleString('en-IN')}` : `${donation.quantity} ${donation.unit}`} — {donation.needTitle || donation.description || 'Donation Item'}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Donor: <strong className="text-slate-800">{donation.donorName || 'Generous Donor'}</strong></span>
                      {donation.donorPhone && <span className="text-slate-400">({donation.donorPhone})</span>}
                    </div>
                  </div>

                  {donation.pickupAddress && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900">Pickup Address: </span>
                        <span>{donation.pickupAddress}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  {isPledged && (
                    <button
                      onClick={() => handleAcceptDonation(donation.id)}
                      disabled={acceptingId === donation.id}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{acceptingId === donation.id ? 'Accepting...' : 'Accept Donation'}</span>
                    </button>
                  )}

                  {isConfirmed && (
                    <button
                      onClick={() => {
                        setSelectedDonationId(donation.id);
                        setShowAssignModal(true);
                      }}
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Assign Volunteer</span>
                    </button>
                  )}

                  {isPickedUp && (
                    <button
                      onClick={() => setDeliverTargetId(donation.id)}
                      className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Delivered</span>
                    </button>
                  )}

                  {isDelivered && (
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-2 rounded-xl border border-teal-200 text-center">
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
          No donations pledged or associated with your institution yet.
        </div>
      )}

      {/* Assign Volunteer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Assign Volunteer to Pickup</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Donation</label>
                <select
                  required
                  value={selectedDonationId}
                  onChange={(e) => setSelectedDonationId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white"
                >
                  <option value="">-- Select Confirmed Donation --</option>
                  {donations.filter(d => d.status === 'CONFIRMED').map((d) => (
                    <option key={d.id} value={d.id}>
                      #DON-{d.id} ({d.type === 'MONEY' ? `₹${d.amount}` : `${d.quantity} ${d.unit}`}) - {d.donorName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Volunteer</label>
                <select
                  required
                  value={volunteerId}
                  onChange={(e) => setVolunteerId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white"
                >
                  <option value="">-- Choose Registered Volunteer --</option>
                  {volunteers.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.user?.fullName || `Volunteer #${v.id}`} ({v.city}) {v.vehicleAvailable ? '🚗' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dispatch Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Pickup before 6 PM from donor address..."
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
