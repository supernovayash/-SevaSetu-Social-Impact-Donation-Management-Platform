import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, Coins, Package, Building2, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { donationApi } from '../../api/donationApi';
import { needApi } from '../../api/needApi';
import { paymentApi } from '../../api/paymentApi';
import { useToast } from '../../context/ToastContext';
import { CATEGORIES } from '../../utils/constants';

const CreateDonation = () => {
  const [searchParams] = useSearchParams();
  const prefilledNeedId = searchParams.get('needId');

  const [donationModel, setDonationModel] = useState(prefilledNeedId ? 'NEED' : 'OPEN'); // NEED or OPEN
  const [donationType, setDonationType] = useState('GOODS'); // GOODS or MONEY

  // Need selection
  const [needs, setNeeds] = useState([]);
  const [selectedNeedId, setSelectedNeedId] = useState(prefilledNeedId || '');
  const [loadingNeeds, setLoadingNeeds] = useState(false);

  // Form fields
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(500);
  const [unit, setUnit] = useState('pieces');
  const [category, setCategory] = useState('CLOTHES');
  const [description, setDescription] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchNeeds = async () => {
      setLoadingNeeds(true);
      try {
        const data = await needApi.getNeeds();
        setNeeds(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch needs:', err);
      } finally {
        setLoadingNeeds(false);
      }
    };
    fetchNeeds();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let payload = {
        type: donationType,
        quantity: donationType === 'GOODS' ? Number(quantity) : undefined,
        amount: donationType === 'MONEY' ? Number(amount) : undefined,
        unit: donationType === 'GOODS' ? unit : undefined,
        pickupAddress: pickupAddress || undefined,
      };

      if (donationModel === 'NEED') {
        if (!selectedNeedId) {
          showToast('Please select a specific need to support.', 'warning');
          setSubmitting(false);
          return;
        }
        payload.needId = Number(selectedNeedId);
      } else {
        payload.needId = null;
        payload.category = category;
        payload.description = description || `Open donation for ${category}`;
      }

      const res = await donationApi.createDonation(payload);
      showToast('Donation pledge created successfully!', 'success');

      // If MONEY donation, open Razorpay Checkout
      if (donationType === 'MONEY' && res.id) {
        try {
          const orderData = await paymentApi.createOrder(res.id);
          if (window.Razorpay) {
            const options = {
              key: orderData.keyId,
              amount: orderData.amount,
              currency: orderData.currency,
              name: 'Seva Setu Impact',
              description: `Donation #${res.id}`,
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
                  navigate('/donor/donations');
                }
              },
              theme: { color: '#059669' },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
          } else {
            navigate('/donor/donations');
          }
        } catch (payErr) {
          showToast('Order creation failed: ' + payErr.message, 'warning');
          navigate('/donor/donations');
        }
      } else {
        navigate('/donor/donations');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create donation pledge.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedNeed = needs.find((n) => String(n.id) === String(selectedNeedId));

  return (
    <DashboardLayout title="Create a Donation" subtitle="Choose between specific verified needs or open community donations">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Model Selection Tabs */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setDonationModel('NEED')}
            className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
              donationModel === 'NEED'
                ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center w-full">
              <span className={`p-2 rounded-xl ${donationModel === 'NEED' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Building2 className="w-5 h-5" />
              </span>
              {donationModel === 'NEED' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </div>
            <div className="mt-3">
              <div className="text-sm font-bold text-slate-900">Donate to Specific Need</div>
              <div className="text-xs text-slate-500 mt-0.5">Fulfill exact requirements posted by verified NGOs</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setDonationModel('OPEN')}
            className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
              donationModel === 'OPEN'
                ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center w-full">
              <span className={`p-2 rounded-xl ${donationModel === 'OPEN' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Package className="w-5 h-5" />
              </span>
              {donationModel === 'OPEN' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </div>
            <div className="mt-3">
              <div className="text-sm font-bold text-slate-900">Make an Open Donation</div>
              <div className="text-xs text-slate-500 mt-0.5">Pledge items/funds and let verified institutions claim them</div>
            </div>
          </button>
        </div>

        {/* Donation Form */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mode selection GOODS / MONEY */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Contribution Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDonationType('GOODS')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition-all ${
                    donationType === 'GOODS'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Physical Goods</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDonationType('MONEY')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition-all ${
                    donationType === 'MONEY'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>Money (Razorpay)</span>
                </button>
              </div>
            </div>

            {/* NEED LINKED SELECTOR */}
            {donationModel === 'NEED' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Select Target Need</label>
                {loadingNeeds ? (
                  <div className="text-xs text-slate-400 p-2">Loading marketplace needs...</div>
                ) : (
                  <select
                    value={selectedNeedId}
                    onChange={(e) => setSelectedNeedId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">-- Choose a Verified Need --</option>
                    {needs.map((n) => (
                      <option key={n.id} value={n.id}>
                        [{n.urgencyLevel}] {n.title} - {n.institutionName} ({n.city})
                      </option>
                    ))}
                  </select>
                )}

                {selectedNeed && (
                  <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-slate-800">{selectedNeed.title}</div>
                    <div className="text-slate-500">{selectedNeed.institutionName} • {selectedNeed.city}</div>
                    <div className="text-emerald-700 font-semibold pt-1">
                      Required: {selectedNeed.quantityRequired} {selectedNeed.unit} | Fulfilled: {selectedNeed.quantityFulfilled || 0} {selectedNeed.unit}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* OPEN DONATION CATEGORY & DESCRIPTION */}
            {donationModel === 'OPEN' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Item Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Donation Description</label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. 20 winter blankets in good condition"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </>
            )}

            {/* QUANTITY / AMOUNT FIELDS */}
            {donationType === 'GOODS' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="pieces / kg / boxes"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
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
              </div>
            )}

            {/* PICKUP ADDRESS FIELD */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pickup Address & Contact Details</label>
              <textarea
                rows={2}
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Enter full pickup address and contact info for volunteer collection..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 transition-all mt-4"
            >
              {submitting ? 'Creating Pledge...' : 'Submit Donation Pledge'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateDonation;
