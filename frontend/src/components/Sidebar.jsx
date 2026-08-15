import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Heart,
  PlusCircle,
  History,
  Building2,
  PackageOpen,
  Truck,
  CheckSquare,
  ShieldCheck,
  Globe,
  FileCheck2,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Sidebar = () => {
  const { role } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'DONOR':
        return [
          { to: '/donor/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/needs', label: 'Browse Needs', icon: Globe },
          { to: '/donor/donate', label: 'Make Donation', icon: PlusCircle },
          { to: '/donor/donations', label: 'My Donations', icon: History },
        ];
      case 'INSTITUTION_ADMIN':
        return [
          { to: '/institution/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/institution/profile', label: 'My Institution', icon: Building2 },
          { to: '/institution/needs/create', label: 'Publish Need', icon: PlusCircle },
          { to: '/institution/needs', label: 'Active Needs', icon: Heart },
          { to: '/institution/open-donations', label: 'Open Donations', icon: PackageOpen },
          { to: '/institution/logistics', label: 'Logistics', icon: Truck },
          { to: '/institution/proof', label: 'Proof of Impact', icon: FileCheck2 },
        ];
      case 'VOLUNTEER':
        return [
          { to: '/volunteer/dashboard', label: 'Pickup Tasks', icon: Truck },
        ];
      case 'SUPER_ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/admin/institutions', label: 'Pending Verification', icon: ShieldCheck },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] shadow-xl">
      <div className="p-4 border-b border-slate-800">
        <div className="text-xs uppercase tracking-wider font-bold text-slate-500">
          Navigation Workspace
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.endsWith('dashboard')}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="text-xs text-slate-500 font-medium text-center">
          Seva Setu Platform &copy; 2026
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
