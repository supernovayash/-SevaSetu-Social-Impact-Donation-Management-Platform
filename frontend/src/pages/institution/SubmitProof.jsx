import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck2, Image, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { logisticsApi } from '../../api/logisticsApi';
import { useToast } from '../../context/ToastContext';

const SubmitProof = () => {
  const [donationId, setDonationId] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!donationId || !description || !imageUrl) {
      showToast('Please fill out all proof fields.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await logisticsApi.submitProof({
        donationId: Number(donationId),
        description,
        imageUrl,
      });
      showToast('Proof of Impact submitted successfully! Status updated to UTILIZED.', 'success');
      navigate('/institution/dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to submit proof of impact.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Submit Proof of Impact" subtitle="Show donors how their contribution was utilized with photos and reports">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Transparency First</div>
            <p>
              Submitting Proof of Impact transitions the donation status from <span className="font-bold uppercase">DELIVERED</span> to <span className="font-bold uppercase text-emerald-700">UTILIZED</span> and displays the proof report to the donor.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Delivered Donation ID</label>
              <input
                type="number"
                required
                value={donationId}
                onChange={(e) => setDonationId(e.target.value)}
                placeholder="e.g. 123"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Utilization Description</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. The donated 40 blankets were distributed among elderly residents at Sunrise Care Home during the winter drive."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Impact Photo URL</label>
              <div className="relative">
                <Image className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or cloud photo URL"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Provide a valid image URL showing the distribution/utilization</div>
            </div>

            {/* Live image preview */}
            {imageUrl && (
              <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-500">Image Preview</div>
                <div className="rounded-xl overflow-hidden max-h-48 border border-slate-200">
                  <img
                    src={imageUrl}
                    alt="Proof preview"
                    className="w-full h-44 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800';
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all mt-4"
            >
              {submitting ? 'Submitting Proof...' : 'Publish Proof of Impact'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubmitProof;
