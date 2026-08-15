import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await login({ email, password });
      if (res.success) {
        // Backend returns user role - redirect automatically
        switch (res.role) {
          case 'DONOR':
            navigate('/donor/dashboard');
            break;
          case 'INSTITUTION_ADMIN':
            navigate('/institution/dashboard');
            break;
          case 'VOLUNTEER':
            navigate('/volunteer/dashboard');
            break;
          case 'SUPER_ADMIN':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/needs');
        }
      } else {
        setErrorMsg(res.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Server connection failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20 mb-2">
              <Heart className="w-8 h-8 fill-white/20" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-500">
              Enter your credentials to access your Seva Setu account.
            </p>
          </div>

          {isExpired && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Your session expired. Please log in again to continue.</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all duration-200 disabled:opacity-50 mt-2"
              >
                {submitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Log In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Roles are automatically detected upon authentication.</span>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
