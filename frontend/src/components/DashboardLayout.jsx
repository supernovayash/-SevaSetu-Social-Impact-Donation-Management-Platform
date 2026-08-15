import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {(title || subtitle) && (
              <div className="pb-4 border-b border-slate-200">
                {title && <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>}
                {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
              </div>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
