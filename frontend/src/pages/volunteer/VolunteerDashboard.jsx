import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Building2, User, Phone, FileText, CheckCircle2, Navigation, PackageOpen, HandHeart } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { logisticsApi } from '../../api/logisticsApi';
import { useToast } from '../../context/ToastContext';

const VolunteerDashboard = () => {
  const [activeTab, setActiveTab] = useState('ASSIGNED'); // 'ASSIGNED' or 'AVAILABLE'
  const [tasks, setTasks] = useState([]);
  const [availablePickups, setAvailablePickups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [pickupTargetId, setPickupTargetId] = useState(null);
  const [markingPickup, setMarkingPickup] = useState(false);

  const [claimTargetId, setClaimTargetId] = useState(null);
  const [claimingPickup, setClaimingPickup] = useState(false);

  const { showToast } = useToast();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [myAssignments, openPickups] = await Promise.all([
        logisticsApi.getMyAssignments().catch(() => []),
        logisticsApi.getAvailablePickups().catch(() => []),
      ]);
      setTasks(Array.isArray(myAssignments) ? myAssignments : []);
      setAvailablePickups(Array.isArray(openPickups) ? openPickups : []);
    } catch (err) {
      console.error('Failed to load volunteer pickup portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleConfirmPickup = async () => {
    if (!pickupTargetId) return;
    setMarkingPickup(true);

    try {
      await logisticsApi.markPickedUp(pickupTargetId);
      showToast('Donation marked as PICKED UP! Status updated.', 'success');
      setPickupTargetId(null);
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to mark as picked up.', 'error');
    } finally {
      setMarkingPickup(false);
    }
  };

  const handleClaimPickup = async () => {
    if (!claimTargetId) return;
    setClaimingPickup(true);

    try {
      await logisticsApi.claimPickup(claimTargetId);
      showToast('Pickup task accepted and assigned to you!', 'success');
      setClaimTargetId(null);
      setActiveTab('ASSIGNED');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to claim pickup task.', 'error');
    } finally {
      setClaimingPickup(false);
    }
  };

  return (
    <DashboardLayout title="Volunteer Pickup Portal" subtitle="Manage assigned pickup tasks or accept open community pickups">
      {/* Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Collect pledged items from donors and deliver them to institution drop-off locations. You can accept any open pickup in your area.</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('ASSIGNED')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'ASSIGNED'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>My Assigned Tasks ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('AVAILABLE')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'AVAILABLE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <HandHeart className="w-4 h-4" />
          <span>Available Open Pickups ({availablePickups.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-semibold text-slate-500">Loading pickup portal...</div>
      ) : activeTab === 'ASSIGNED' ? (
        /* MY ASSIGNED TASKS */
        tasks.length > 0 ? (
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
            No active pickup tasks currently assigned to you. Check the "Available Open Pickups" tab to accept a new task!
          </div>
        )
      ) : (
        /* AVAILABLE OPEN PICKUPS */
        availablePickups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availablePickups.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase">
                      Open Pickup #DON-{item.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Pledged & Confirmed</span>
                  </div>

                  <div>
                    <div className="text-lg font-extrabold text-slate-900">
                      {item.type === 'MONEY' ? `₹${item.amount?.toLocaleString('en-IN')}` : `${item.quantity} ${item.unit}`} — {item.needTitle || item.description || 'Donation Item'}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-1">
                      Donor: <strong className="text-slate-800">{item.donorName || 'Generous Donor'}</strong>
                      {item.donorPhone && <span className="ml-1 text-slate-400">({item.donorPhone})</span>}
                    </div>
                  </div>

                  {/* Pickup Address Card */}
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>PICKUP ADDRESS:</span>
                    </div>
                    <p className="text-slate-700 font-medium pl-5">
                      {item.pickupAddress || 'Address not provided by donor'}
                    </p>
                  </div>

                  {/* Drop Address Card */}
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                      <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>DESTINATION DROP ADDRESS:</span>
                    </div>
                    <p className="text-slate-700 font-medium pl-5">
                      {item.dropAddress || item.institutionName || 'Target Institution Drop-off Point'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setClaimTargetId(item.id)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <HandHeart className="w-4 h-4" />
                  <span>Accept Pickup Task</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200 text-xs">
            No unassigned open pickups currently available. Check back soon!
          </div>
        )
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

      {/* Claim Pickup Modal */}
      <ConfirmModal
        isOpen={!!claimTargetId}
        onClose={() => setClaimTargetId(null)}
        onConfirm={handleClaimPickup}
        title="Accept Open Pickup Task"
        message={`Confirm that you want to accept donation pickup #DON-${claimTargetId}. This will assign the task to your volunteer account.`}
        confirmText="Accept Pickup Task"
        loading={claimingPickup}
      />
    </DashboardLayout>
  );
};

export default VolunteerDashboard;
