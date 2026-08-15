import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, RefreshCw, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import NeedCard from '../components/NeedCard';
import { GridSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { needApi } from '../api/needApi';
import { CATEGORIES } from '../utils/constants';

const Needs = () => {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNeeds = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await needApi.getNeeds({
        category: selectedCategory || undefined,
        city: cityFilter || undefined,
        urgencyLevel: selectedUrgency || undefined,
      });
      setNeeds(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading needs:', err);
      setError(err.message || 'Failed to fetch needs marketplace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeeds();
  }, [selectedCategory, selectedUrgency]);

  const handleCitySubmit = (e) => {
    e.preventDefault();
    fetchNeeds();
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedUrgency('');
    setCityFilter('');
    setSearchQuery('');
  };

  // Local title search filter
  const filteredNeeds = needs.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(query) ||
      item.institutionName?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.city?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Public Needs Marketplace</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Support verified community needs</h1>
            <p className="text-xs text-slate-500 mt-1">
              Browse requirements published by verified NGOs across India.
            </p>
          </div>

          <button
            onClick={fetchNeeds}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh List</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, NGO..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Urgency Select */}
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Urgency Levels</option>
              <option value="CRITICAL">Critical Urgency</option>
              <option value="MODERATE">Moderate Urgency</option>
              <option value="LOW">Low Urgency</option>
            </select>

            {/* City Search */}
            <form onSubmit={handleCitySubmit} className="flex gap-1.5">
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Filter by city..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Go
              </button>
            </form>
          </div>

          {(selectedCategory || selectedUrgency || cityFilter || searchQuery) && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span className="font-bold text-slate-700">Active Filters:</span>
              {selectedCategory && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Category: {selectedCategory}
                </span>
              )}
              {selectedUrgency && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  Urgency: {selectedUrgency}
                </span>
              )}
              {cityFilter && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                  City: {cityFilter}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="ml-auto text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <GridSkeleton count={6} />
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-center text-sm font-semibold">
            {error}
          </div>
        ) : filteredNeeds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNeeds.map((need) => (
              <NeedCard key={need.id} need={need} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Active Needs Found"
            description="Try clearing filters or checking back later as verified institutions add new requirements."
            onAction={clearFilters}
            actionText="Reset Filters"
          />
        )}
      </main>
    </div>
  );
};

export default Needs;
