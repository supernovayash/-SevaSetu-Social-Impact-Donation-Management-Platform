import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Heart } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import NeedCard from '../../components/NeedCard';
import { GridSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { needApi } from '../../api/needApi';

const ManageNeeds = () => {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNeeds = async () => {
      try {
        const data = await needApi.getNeeds();
        setNeeds(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching active needs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNeeds();
  }, []);

  return (
    <DashboardLayout title="Active Needs" subtitle="View requirements and track donor fulfillment">
      <div className="flex justify-between items-center">
        <div className="text-xs font-bold text-slate-500 uppercase">Published Requirements</div>
        <Link
          to="/institution/needs/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Need</span>
        </Link>
      </div>

      {loading ? (
        <GridSkeleton count={6} />
      ) : needs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {needs.map((need) => (
            <NeedCard key={need.id} need={need} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No Published Needs"
          description="Create your institution's first material or monetary requirement to start receiving donor support."
          actionLink="/institution/needs/create"
          actionText="Publish Need"
        />
      )}
    </DashboardLayout>
  );
};

export default ManageNeeds;
