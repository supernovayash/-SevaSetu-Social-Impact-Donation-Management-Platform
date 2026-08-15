import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShieldCheck,
  Truck,
  Building2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Award,
  Globe,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import NeedCard from '../components/NeedCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { needApi } from '../api/needApi';

const Home = () => {
  const [urgentNeeds, setUrgentNeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrgentNeeds = async () => {
      try {
        const data = await needApi.getNeeds({ urgencyLevel: 'CRITICAL' });
        setUrgentNeeds(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch (err) {
        console.error('Failed to load urgent needs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUrgentNeeds();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_50%)]"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Transparent Social Impact Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Give with purpose. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                See the real impact.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Seva Setu connects compassionate donors directly with verified NGOs and volunteer logistics networks. Track your donations step-by-step from pledge to proof of impact.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/needs"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-base text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all duration-200 shadow-lg shadow-emerald-500/25"
              >
                <span>Explore Urgent Needs</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-base text-white bg-slate-800/80 hover:bg-slate-800 transition-all duration-200 border border-slate-700"
              >
                <span>Join Platform</span>
              </Link>
            </div>

            {/* Quick stats pills */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
              <div>
                <div className="text-2xl font-black text-emerald-400">100%</div>
                <div className="text-xs text-slate-400 font-medium">Verified Institutions</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400">End-to-End</div>
                <div className="text-xs text-slate-400 font-medium">Logistics Tracking</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400">Audited</div>
                <div className="text-xs text-slate-400 font-medium">Proof of Impact</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="relative mx-auto max-w-md lg:max-w-none w-full">
            <div className="bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-3xl p-2 border border-emerald-500/20 backdrop-blur-xl shadow-2xl">
              <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Winter Warmth Drive</div>
                      <div className="text-xs text-slate-400">Sunrise Care Home • Delhi</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                    CRITICAL
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Target: 100 Blankets</span>
                    <span className="text-emerald-400">75% Fulfilled</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[75%]"></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Live Lifecycle Tracking
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Donation Pledged & Verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Picked Up by Volunteer Rahul</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-400 font-semibold animate-pulse">
                      <Truck className="w-4 h-4" />
                      <span>Delivered & Proof of Impact Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Seva Setu Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">How Seva Setu Bridges Impact</h2>
          <p className="text-sm text-slate-500">
            Four seamless roles working together to turn goodwill into verifiable social change.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-xl">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Donors</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Browse urgent category needs or create open donations. Support verified causes with money or goods.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-xl">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Institutions</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Admin-verified NGOs publish exact material needs, claim open donations, and submit photo proof of impact.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold text-xl">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Volunteers</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pick up physical donations from donors and deliver them to institution drop-off points efficiently.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-extrabold text-xl">
              4
            </div>
            <h3 className="text-lg font-bold text-slate-900">Super Admin</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Strictly verifies institution registration certificates before they can publish needs or receive funds.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Urgent Needs */}
      <section className="py-16 bg-slate-100/70 border-t border-b border-slate-200/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">Urgent Attention Needed</div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Critical Community Needs</h2>
            </div>
            <Link
              to="/needs"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>View All Needs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : urgentNeeds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {urgentNeeds.map((need) => (
                <NeedCard key={need.id} need={need} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
              No critical needs active right now. Explore all open needs in the marketplace!
            </div>
          )}
        </div>
      </section>

      {/* CTA Join Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to make a verified impact?
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Whether you are an individual donor, a registered NGO, or a willing volunteer, join Seva Setu today to power transparent social work.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto shrink-0 justify-center">
            <Link
              to="/register/donor"
              className="px-5 py-3 rounded-xl font-bold text-sm text-slate-900 bg-white hover:bg-slate-100 transition-colors text-center shadow-md"
            >
              Become a Donor
            </Link>
            <Link
              to="/register/volunteer"
              className="px-5 py-3 rounded-xl font-bold text-sm text-amber-950 bg-amber-400 hover:bg-amber-300 transition-colors text-center shadow-md"
            >
              Become a Volunteer
            </Link>
            <Link
              to="/register/institution"
              className="px-5 py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 transition-colors text-center border border-emerald-400/30 shadow-md"
            >
              Register Institution
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
