import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, LogOut, Menu, X, User, ShieldCheck, HeartHandshake, Truck, Building2 } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { isAuthenticated, role, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardPath = () => {
    switch (role) {
      case 'DONOR':
        return '/donor/dashboard';
      case 'INSTITUTION_ADMIN':
        return '/institution/dashboard';
      case 'VOLUNTEER':
        return '/volunteer/dashboard';
      case 'SUPER_ADMIN':
        return '/admin/dashboard';
      default:
        return '/needs';
    }
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'DONOR':
        return { label: 'Donor', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: HeartHandshake };
      case 'INSTITUTION_ADMIN':
        return { label: 'Institution Admin', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Building2 };
      case 'VOLUNTEER':
        return { label: 'Volunteer', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Truck };
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: ShieldCheck };
      default:
        return null;
    }
  };

  const roleInfo = getRoleBadge();
  const RoleIcon = roleInfo?.icon;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Heart className="w-6 h-6 text-white fill-white/20" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight block leading-tight">
                Seva<span className="text-emerald-600">Setu</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 block -mt-1">
                Social Impact Bridge
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-emerald-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </Link>
            <Link
              to="/needs"
              className={`text-sm font-medium transition-colors ${
                isActive('/needs') ? 'text-emerald-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Explore Needs
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
                <Link
                  to={getDashboardPath()}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200 flex items-center gap-1.5"
                >
                  Dashboard
                </Link>

                <div className="flex items-center space-x-2 bg-slate-50 py-1.5 px-3 rounded-full border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    {user?.fullName || 'User'}
                  </div>
                  {roleInfo && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${roleInfo.bg}`}
                    >
                      {RoleIcon && <RoleIcon className="w-3 h-3" />}
                      {roleInfo.label}
                    </span>
                  )}
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated && (
              <Link
                to={getDashboardPath()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                Dashboard
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 border-b border-slate-100"
          >
            Home
          </Link>
          <Link
            to="/needs"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 border-b border-slate-100"
          >
            Explore Needs
          </Link>

          {isAuthenticated ? (
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center font-bold text-slate-700">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{user?.fullName}</div>
                    <div className="text-xs text-slate-500">{role}</div>
                  </div>
                </div>
              </div>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl font-bold bg-emerald-600 text-white"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-rose-600 font-semibold"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          ) : (
            <div className="pt-2 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-xl font-semibold border border-slate-300 text-slate-800"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-xl font-bold text-white bg-emerald-600"
              >
                Register Now
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
