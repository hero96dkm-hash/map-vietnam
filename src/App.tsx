import React from 'react';
import { Header } from './components/Header';
import { LevelSelector } from './components/LevelSelector';
import { MapVietnam } from './components/MapVietnam';
import { SelectedPanel } from './components/SelectedPanel';
import { ResultModal } from './components/ResultModal';
import { BadgesModal } from './components/BadgesModal';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/30 text-slate-800">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <LevelSelector />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Central Area: Vietnam Map (approx 70% width on Desktop) */}
          <div className="lg:col-span-8 w-full">
            <MapVietnam />
          </div>

          {/* Right Panel: Selected Provinces & Check Button (approx 30% width) */}
          <div className="lg:col-span-4 w-full">
            <SelectedPanel />
          </div>
        </div>
      </main>

      {/* Result Popups (Success celebration or friendly retry modal) */}
      <ResultModal />

      {/* Badges & Achievements Collection Modal */}
      <BadgesModal />
    </div>
  );
};

export default App;
