'use client';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#001524]">
      <Sidebar />
      <div className="ml-[280px]">
        <TopBar />
        <main className="p-6 mt-16">
          {/* Contenu du dashboard */}
        </main>
      </div>
    </div>
  );
}
