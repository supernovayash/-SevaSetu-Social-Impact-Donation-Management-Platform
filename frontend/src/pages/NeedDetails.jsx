import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Calendar,
  Heart,
  ArrowLeft,
  Coins,
  Package,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import UrgencyBadge from '../components/common/UrgencyBadge';
import ProgressBar from '../components/common/ProgressBar';
import { needApi } from '../api/needApi';
import { donationApi } from '../api/donationApi';
import { paymentApi } from '../api/paymentApi';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

const NeedDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { showToast } = useToast();

  const [need, setNeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick donate modal state
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donationType, setDonationType] = useState('GOODS'); // GOODS or MONEY
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(500);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchNeedDetail = async () => {
      setLoading(true);
      try {
        const data = await needApi.getNeedById(id);
        setNeed(data);
        if (data.category === 'MONEY') {
          setDonationType('MONEY');
        }
      } catch (err) {
        setError(err.message || 'Failed to load need details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchNeedDetail();
  }, [id]);

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(`/needs/${id}`));
      return;
    }
    if (role !== 'DONOR') {
      showToast('Only registered Donors can create donations.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        needId: Number(id),
        type: donationType,
        quantity: donationType === 'GOODS' ? Number(quantity) : undefined,
        amount: donationType === 'MONEY' ? Number(amount) : undefined,
        unit: need?.unit || 'units',
      };

      const donationRes = await donationApi.createDonation(payload);
      showToast('Donation pledged successfully!', 'success');

      // If MONEY donation, initiate Razorpay payment order
      if (donationType === 'MONEY' && donationRes.id) {
        try {
          const orderData = await paymentApi.createOrder(donationRes.id);
          // Open Razorpay Checkout modal if Razorpay script loaded
          if (window.Razorpay) {
            const options = {
              key: orderData.keyId,
              amount: orderData.amount,
              currency: orderData.currency,
              name: 'Seva Setu Impact',
              description: `Donation for Need #${need.id}`,
              order_id: orderData.razorpayOrderId,
              handler: async function (response) {
                try {
                  await paymentApi.verifyPayment({
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  });
                  showToast('Payment verified successfully!', 'success');
                  navigate('/donor/donations');
                } catch (verifyErr) {
                  showToast('Payment verification failed.', 'error');
                }
              },
              theme: { color: '#059669' },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
          } else {
            showToast('Donation pledged! Please complete payment on My Donations page.', 'info');
            navigate('/donor/donations');
          }
        } catch (payErr) {
          showToast('Donation created. Order generation failed: ' + payErr.message, 'warning');
          navigate('/donor/donations');
        }
      } else {
        navigate('/donor/donations');
      }

      setShowDonateModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to create donation.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !need) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto p-8 text-center space-y-4">
          <div className="p-4 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-sm font-semibold">
            {error || 'Need not found.'}
          </div>
          <Link to="/needs" className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Return to Needs Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const quantityRequired = need.quantityRequired || 0;
  const quantityFulfilled = need.quantityFulfilled || 0;
  const remaining = Math.max(0, quantityRequired - quantityFulfilled);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Link
          to="/needs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Top banner strip */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30 uppercase tracking-wider">
                Category: {need.category}
              </span>
              <UrgencyBadge level={need.urgencyLevel} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{need.title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">{need.institutionName || 'Verified NGO'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{need.city}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Published {need.createdAt ? new Date(need.createdAt).toLocaleDateString('en-IN') : 'Recently'}</span>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requirement Description</h3>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{need.description}</p>
            </div>

            {/* Progress Visualization */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fulfillment Progress</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {quantityFulfilled} / {quantityRequired} {need.unit}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500">Remaining Needed</div>
                  <div className="text-xl font-bold text-emerald-700">
                    {remaining} {need.unit}
                  </div>
                </div>
              </div>

              <ProgressBar fulfilled={quantityFulfilled} required={quantityRequired} unit={need.unit} />
            </div>

            {/* Verified Institution Badge Info */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-emerald-950">Super Admin Verified Institution</div>
                <div className="text-emerald-800 leading-relaxed">
                  {need.institutionName} has submitted government registration certificates verified by Seva Setu administrators.
                </div>
              </div>
            </div>

            {/* Donate CTA Button */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">Make an Impact</div>
                <div className="text-sm font-bold text-slate-800">Support this requirement directly</div>
              </div>

              {need.status === 'FULFILLED' ? (
                <div className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl text-sm">
                  Need Fully Fulfilled
                </div>
              ) : (
                <button
                  onClick={() => setShowDonateModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
                >
                  <Heart className="w-5 h-5 fill-white/20" />
                  <span>Donate to this Need</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Donate to Need</h3>
              <button
                onClick={() => setShowDonateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {!isAuthenticated ? (
              <div className="space-y-4 text-center py-4">
                <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">Authentication Required</h4>
                <p className="text-xs text-slate-500">Please log in as a Donor to pledge contributions.</p>
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register/donor"
                    className="flex-1 py-2.5 bg-slate-100 text-slate-800 rounded-xl font-bold text-xs"
                  >
                    Register
                  </Link>
                </div>
              </div>
            ) : role !== 'DONOR' ? (
              <div className="text-center py-4 space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
                <div className="font-bold text-slate-900 text-sm">Donor Account Required</div>
                <div className="text-xs text-slate-500">Your current role ({role}) cannot make donations.</div>
              </div>
            ) : (
              <form onSubmit={handleDonateSubmit} className="space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Donation Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDonationType('GOODS')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        donationType === 'GOODS'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Physical Goods
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonationType('MONEY')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        donationType === 'MONEY'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Financial Contribution
                    </button>
                  </div>
                </div>

                {donationType === 'GOODS' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Quantity ({need.unit})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={remaining || 1000}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="text-[11px] text-slate-400 mt-1">Remaining needed: {remaining} {need.unit}</div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      min={10}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="text-[11px] text-slate-400 mt-1">Processed securely via Razorpay</div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  {submitting ? 'Processing Pledge...' : 'Confirm Donation Pledge'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NeedDetails;
