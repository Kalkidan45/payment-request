import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './components/Dashboard';
import { RequisitionList } from './components/RequisitionList';
import { MonthlyReport } from './components/MonthlyReport';
import { StaffRequestView } from './components/StaffRequestView';
import { NewRequisitionModal } from './components/NewRequisitionModal';
import { RequisitionDetailModal } from './components/RequisitionDetailModal';
import { StaffDirectoryModal } from './components/StaffDirectoryModal';
import { PrintVoucherModal } from './components/PrintVoucherModal';
import { LoginModal } from './components/LoginModal';

const AppContent: React.FC = () => {
  const { activeTab, currentUser, isManagerOrFinance } = useApp();

  // If user is logged out, show the dedicated login screen
  if (!currentUser) {
    return <LoginModal />;
  }

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans antialiased flex flex-col selection:bg-sky-200 selection:text-sky-900">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7">
        {!isManagerOrFinance ? (
          /* Requesters / Staff have access to request page ONLY */
          <StaffRequestView />
        ) : (
          /* Manager and Finance have full access to Dashboard, All Vouchers, and Reports */
          <>
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'requisitions' && <RequisitionList />}
            {activeTab === 'reports' && <MonthlyReport />}
            {activeTab === 'my_requests' && <Dashboard />}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Interactive Modals */}
      <NewRequisitionModal />
      <RequisitionDetailModal />
      <StaffDirectoryModal />
      <PrintVoucherModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
