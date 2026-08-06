import React from 'react';
import { LIMSProvider, useLIMS } from './services/limsStore';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { SamplesModule } from './components/SamplesModule';
import { AnalysesModule } from './components/AnalysesModule';
import { LabsModule } from './components/LabsModule';
import { MethodsModule } from './components/MethodsModule';
import { ResultsModule } from './components/PhAnalysisForm';
import { ReportsModule } from './components/ReportsModule';
import { InstrumentsModule } from './components/InstrumentsModule';
import { CalibrationsModule } from './components/CalibrationsModule';
import { ReagentsModule } from './components/ReagentsModule';
import { QualityControlModule } from './components/QualityControlModule';
import { StatisticsModule } from './components/StatisticsModule';
import { UsersModule } from './components/UsersModule';
import { AuditLogModule } from './components/AuditLogModule';
import { SettingsModule } from './components/SettingsModule';
import { LoginModal } from './components/LoginModal';

const MainContent: React.FC = () => {
  const { activeTab } = useLIMS();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'samples':
        return <SamplesModule />;
      case 'analyses':
        return <AnalysesModule />;
      case 'labs':
        return <LabsModule />;
      case 'methods':
        return <MethodsModule />;
      case 'results':
        return <ResultsModule />;
      case 'reports':
        return <ReportsModule />;
      case 'instruments':
        return <InstrumentsModule />;
      case 'calibrations':
        return <CalibrationsModule />;
      case 'reagents':
        return <ReagentsModule />;
      case 'qc':
        return <QualityControlModule />;
      case 'statistics':
        return <StatisticsModule />;
      case 'users':
        return <UsersModule />;
      case 'audit':
        return <AuditLogModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {renderTabContent()}
    </main>
  );
};

const AppLayout: React.FC = () => {
  const { isAuthenticated } = useLIMS();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-teal-600 selection:text-white flex flex-col relative">
      {!isAuthenticated && <LoginModal />}
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <LIMSProvider>
      <AppLayout />
    </LIMSProvider>
  );
}
