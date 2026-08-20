import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Building2, User, Phone, FileText, CheckCircle2, Navigation } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { logisticsApi } from '../../api/logisticsApi';
import { useToast } from '../../context/ToastContext';

const VolunteerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Picked up modal state
  const [pickupTargetId, setPickupTargetId] = useState(null);
  const [markingPickup, setMarkingPickup] = useState(false);

  const { showToast } = useToast();

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await logisticsApi.getMyAssignments();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load volunteer pickup assignments:', err);
      showToast('Failed to load pickup assignments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleConfirmPickup = async () => {
    if (!pickupTargetId) return;
    setMarkingPickup(true);

    try {
      await logisticsApi.markPickedUp(pickupTargetId);
      showToast('Donation marked as PICKED UP! Status updated.', 'success');
      setPickupTargetId(null);
      fetchAssignments();
    } catch (err) {
      showToast(err.message || 'Failed to mark as picked up.', 'error');
    } finally {
      setMarkingPickup(false);
    }
  };

  return (
    <DashboardLayout title="Volunteer Pickup Portal" subtitle="Manage assigned pickup tasks and view pickup/drop-off directions">
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Collect pledged items from donors and deliver them to institution drop-off locations. Mark items as picked up upon physical collection.</span>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-semibold text-slate-500">Loading assigned pickup tasks...</div>
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => {
            const isAssigned = task.status === 'ASSIGNED';
            const isPickedUp = task.status === 'PICKED_UP';
            const isDelivered = task.status === 'DELIVERED' || task.status === 'UTILIZED';

            return (
              <div key={task.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs uppercase">
                      Assignment #{task.id} (Donation #{task.donationId})
                    </span>
                    <StatusBadge status={task.status} />
                  </div>

                  <div>
                    <div className="text-lg font-extrabold text-slate-900">
                      {task.donationType === 'MONEY' ? `₹${task.amount?.toLocaleString('en-IN')}` : `${task.quantity} ${task.unit}`} — {task.needTitle || task.description || 'Donation Item'}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-1">
                      Donor: <strong className="text-slate-800">{task.donorName || 'Generous Donor'}</strong>
                      {task.donorPhone && <span className="ml-1 text-slate-400">({task.donorPhone})</span>}
                    </div>
                  </div>

                  {/* Pickup Address Card */}
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>PICKUP ADDRESS (FROM DONOR):</span>
                    </div>
                    <p className="text-slate-700 font-medium pl-5">
                      {task.pickupAddress || 'Address not provided by donor (Contact donor via phone)'}
                    </p>
                  </div>

                  {/* Drop Address Card */}
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                      <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>DROP ADDRESS (TO INSTITUTION):</span>
                    </div>
                    <p className="text-slate-700 font-medium pl-5">
                      {task.dropAddress || task.institutionName || 'Target Institution Drop-off Point'}
                    </p>
                  </div>

                  {task.notes && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>Dispatch Note: "{task.notes}"</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isAssigned && (
                    <button
                      onClick={() => setPickupTargetId(task.donationId)}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Picked Up</span>
                    </button>
                  )}

                  {isPickedUp && (
                    <div className="w-full text-center py-2.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold">
                      ✓ Picked Up — In Transit to Institution Drop Address
                    </div>
                  )}

                  {isDelivered && (
                    <div className="w-full text-center py-2.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold">
                      ✓ Delivered to Institution
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200 text-xs">
          No pickup assignments currently assigned to your volunteer account.
        </div>
      )}

      {/* Pickup Confirmation Modal */}
      <ConfirmModal
        isOpen={!!pickupTargetId}
        onClose={() => setPickupTargetId(null)}
        onConfirm={handleConfirmPickup}
        title="Mark Item as Picked Up"
        message={`Confirm that you have physically collected donation #DON-${pickupTargetId} from the donor's pickup address.`}
        confirmText="Confirm Pickup"
        loading={markingPickup}
      />
    </DashboardLayout>
  );
};

export default VolunteerDashboard;
