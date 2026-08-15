import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { needApi } from '../../api/needApi';
import { institutionApi } from '../../api/institutionApi';
import { useToast } from '../../context/ToastContext';
import { CATEGORIES } from '../../utils/constants';

const CreateNeed = () => {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'FOOD',
    urgencyLevel: 'CRITICAL',
    quantityRequired: 100,
    unit: 'kg',
    city: '',
  });

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const instData = await institutionApi.getMyInstitution();
        setProfile(instData);
        if (instData.city) {
          setFormData((prev) => ({ ...prev, city: instData.city }));
        }
      } catch (err) {
        console.error('Failed to load institution status:', err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const isVerified = profile?.verificationStatus === 'VERIFIED';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      showToast('Only verified institutions can publish needs.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await needApi.createNeed({
        ...formData,
        quantityRequired: Number(formData.quantityRequired),
      });
      showToast('Need requirement published successfully!', 'success');
      navigate('/institution/needs');
    } catch (err) {
      showToast(err.message || 'Failed to publish need.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <DashboardLayout title="Publish New Need" subtitle="Post a material requirement for donor assistance">
        <div className="p-8 text-center text-xs font-semibold text-slate-500">Checking verification status...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Publish New Need" subtitle="Post a material requirement for donor assistance">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Verification Guard Alert if not verified */}
        {!isVerified ? (
          <div className="bg-white rounded-3xl p-8 border border-amber-200 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Verification Required to Publish Needs</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto p-4 bg-amber-50 rounded-2xl border border-amber-200">
              Your institution status is currently{' '}
              <span className="font-bold uppercase text-amber-800">{profile?.verificationStatus || 'PENDING'}</span>.
              The Seva Setu Super Administrator must verify your NGO registration certificates before you can publish community needs.
            </p>
            <div className="pt-2">
              <Link
                to="/institution/profile"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md"
              >
                <span>View Institution Status</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Need Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Winter Blanket Requirement for Senior Citizens"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Urgency Level</label>
                  <select
                    value={formData.urgencyLevel}
                    onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="CRITICAL">CRITICAL (Top Priority)</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantity Required</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.quantityRequired}
                    onChange={(e) => setFormData({ ...formData, quantityRequired: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="kg / pieces / kits / boxes"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City / Location</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Delhi"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description & Urgency Reason</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide background context on why this material is needed..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all mt-4"
              >
                {submitting ? 'Publishing Need...' : 'Publish Need Requirement'}
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreateNeed;
