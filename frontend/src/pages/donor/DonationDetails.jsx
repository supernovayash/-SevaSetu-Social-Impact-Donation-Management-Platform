import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import DonationTimeline from '../../components/DonationTimeline';
import { donationApi } from '../../api/donationApi';

const DonationDetails = () => {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await donationApi.getTimeline(id);
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to fetch donation lifecycle.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTimeline();
  }, [id]);

  return (
    <DashboardLayout title={`Donation #${id}`} subtitle="Audit log and end-to-end lifecycle visualizer">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          to="/donor/donations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Donations</span>
        </Link>

        {loading ? (
          <div className="bg-white rounded-3xl p-8 text-center text-xs font-semibold text-slate-500">
            Loading donation timeline...
          </div>
        ) : error ? (
          <div className="bg-rose-50 text-rose-800 p-4 rounded-2xl text-xs font-bold border border-rose-200">
            {error}
          </div>
        ) : (
          <DonationTimeline events={events} currentStatus={events[events.length - 1]?.status || 'PLEDGED'} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default DonationDetails;
