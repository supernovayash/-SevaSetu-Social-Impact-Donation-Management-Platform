import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Heart,
  User,
  Building2,
  Truck,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { authApi } from '../api/authApi';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'DONOR';

  const [activeTab, setActiveTab] = useState(initialRole.toUpperCase());
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Donor form state
  const [donorData, setDonorData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  // Institution form state
  const [instData, setInstData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    institutionName: '',
    registrationNumber: '',
    address: '',
    city: '',
    description: '',
  });

  // Volunteer form state
  const [volData, setVolData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    vehicleAvailable: true,
  });

  const handleDonorSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await authApi.registerDonor(donorData);
      showToast('Donor registration successful!', 'success');

      // Auto login if backend returned auth credentials, otherwise redirect to login
      if (res.accessToken) {
        localStorage.setItem('token', res.accessToken);
        localStorage.setItem('userRole', res.role || 'DONOR');
        localStorage.setItem('userInfo', JSON.stringify({ fullName: res.fullName, email: donorData.email, role: res.role }));
        window.location.href = '/donor/dashboard';
      } else {
        await login({ email: donorData.email, password: donorData.password });
        navigate('/donor/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Donor registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInstitutionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      await authApi.registerInstitution(instData);
      setSuccessInfo({
        title: 'Institution Registration Submitted!',
        message:
          'Your institution account has been created. Status: PENDING. Verification by the Seva Setu Super Admin is required before you can publish needs or receive funds.',
        redirectPath: '/login',
      });
      showToast('Institution registered successfully!', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Institution registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await authApi.registerVolunteer(volData);
      showToast('Volunteer registration successful!', 'success');

      if (res.accessToken) {
        localStorage.setItem('token', res.accessToken);
        localStorage.setItem('userRole', res.role || 'VOLUNTEER');
        localStorage.setItem('userInfo', JSON.stringify({ fullName: res.fullName, email: volData.email, role: res.role }));
        window.location.href = '/volunteer/dashboard';
      } else {
        await login({ email: volData.email, password: volData.password });
        navigate('/volunteer/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Volunteer registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successInfo) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl max-w-lg w-full text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">{successInfo.title}</h2>
            <p className="text-xs text-slate-600 leading-relaxed p-4 bg-amber-50 rounded-2xl border border-amber-200">
              {successInfo.message}
            </p>
            <button
              onClick={() => navigate(successInfo.redirectPath)}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800"
            >
              Proceed to Login Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Join Seva Setu</h2>
            <p className="text-xs text-slate-500">
              Select your role to complete registration and start contributing.
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-200/80 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => { setActiveTab('DONOR'); setErrorMsg(''); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'DONOR'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Donor</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('INSTITUTION'); setErrorMsg(''); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'INSTITUTION'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Institution (NGO)</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('VOLUNTEER'); setErrorMsg(''); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'VOLUNTEER'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Volunteer</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8">
            {/* DONOR FORM */}
            {activeTab === 'DONOR' && (
              <form onSubmit={handleDonorSubmit} className="space-y-4">
                <div className="border-b border-slate-100 pb-3 mb-2">
                  <h3 className="text-base font-bold text-slate-900">Donor Registration</h3>
                  <p className="text-xs text-slate-500">Directly support causes with money or goods</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={donorData.fullName}
                    onChange={(e) => setDonorData({ ...donorData, fullName: e.target.value })}
                    placeholder="Yash Singh"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={donorData.email}
                      onChange={(e) => setDonorData({ ...donorData, email: e.target.value })}
                      placeholder="donor@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={donorData.phone}
                      onChange={(e) => setDonorData({ ...donorData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password <span className="text-[10px] text-slate-400 font-normal">(Min 8 chars)</span></label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={donorData.password}
                    onChange={(e) => setDonorData({ ...donorData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all mt-4"
                >
                  {submitting ? 'Creating Donor Account...' : 'Register as Donor'}
                </button>
              </form>
            )}

            {/* INSTITUTION FORM */}
            {activeTab === 'INSTITUTION' && (
              <form onSubmit={handleInstitutionSubmit} className="space-y-4">
                <div className="border-b border-slate-100 pb-3 mb-2">
                  <h3 className="text-base font-bold text-slate-900">Institution / NGO Registration</h3>
                  <p className="text-xs text-amber-700 font-semibold bg-amber-50 p-2 rounded-lg mt-1">
                    Note: Account requires Super Admin approval before publishing needs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admin Full Name</label>
                    <input
                      type="text"
                      required
                      value={instData.fullName}
                      onChange={(e) => setInstData({ ...instData, fullName: e.target.value })}
                      placeholder="Dr. Rajesh Sharma"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Institution Name</label>
                    <input
                      type="text"
                      required
                      value={instData.institutionName}
                      onChange={(e) => setInstData({ ...instData, institutionName: e.target.value })}
                      placeholder="Sunrise Care Foundation"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={instData.email}
                      onChange={(e) => setInstData({ ...instData, email: e.target.value })}
                      placeholder="admin@sunrisecare.org"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={instData.phone}
                      onChange={(e) => setInstData({ ...instData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Registration Reg. No.</label>
                    <input
                      type="text"
                      required
                      value={instData.registrationNumber}
                      onChange={(e) => setInstData({ ...instData, registrationNumber: e.target.value })}
                      placeholder="NGO-12345-2024"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={instData.city}
                      onChange={(e) => setInstData({ ...instData, city: e.target.value })}
                      placeholder="Delhi / Mumbai / Bangalore"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Physical Address</label>
                  <input
                    type="text"
                    required
                    value={instData.address}
                    onChange={(e) => setInstData({ ...instData, address: e.target.value })}
                    placeholder="Plot 42, Sector 12, Rohini"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description & Social Purpose</label>
                  <textarea
                    rows={2}
                    required
                    value={instData.description}
                    onChange={(e) => setInstData({ ...instData, description: e.target.value })}
                    placeholder="Describe your NGO's primary focus areas..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Password <span className="text-[10px] text-slate-400 font-normal">(Min 8 chars)</span></label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={instData.password}
                    onChange={(e) => setInstData({ ...instData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all mt-4"
                >
                  {submitting ? 'Registering Institution...' : 'Submit Institution Application'}
                </button>
              </form>
            )}

            {/* VOLUNTEER FORM */}
            {activeTab === 'VOLUNTEER' && (
              <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                <div className="border-b border-slate-100 pb-3 mb-2">
                  <h3 className="text-base font-bold text-slate-900">Volunteer Registration</h3>
                  <p className="text-xs text-slate-500">Power pickup and delivery logistics</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={volData.fullName}
                    onChange={(e) => setVolData({ ...volData, fullName: e.target.value })}
                    placeholder="Rahul Kumar"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={volData.email}
                      onChange={(e) => setVolData({ ...volData, email: e.target.value })}
                      placeholder="rahul@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={volData.phone}
                      onChange={(e) => setVolData({ ...volData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Operating City</label>
                    <input
                      type="text"
                      required
                      value={volData.city}
                      onChange={(e) => setVolData({ ...volData, city: e.target.value })}
                      placeholder="Ghaziabad / Delhi"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password <span className="text-[10px] text-slate-400 font-normal">(Min 8 chars)</span></label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={volData.password}
                      onChange={(e) => setVolData({ ...volData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Vehicle Available Toggle */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-amber-900">Vehicle Availability</div>
                    <div className="text-[11px] text-amber-700">Do you have a vehicle available for pickups?</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={volData.vehicleAvailable}
                      onChange={(e) => setVolData({ ...volData, vehicleAvailable: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-all mt-4"
                >
                  {submitting ? 'Registering Volunteer...' : 'Register as Volunteer'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
