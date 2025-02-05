'use client';

import { useEffect, useState } from 'react';

export default function SimpleChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-6 text-white">Chargement...</div>;
  }

  return (
    <div className="p-6 bg-white/10 backdrop-blur-lg rounded-xl">
      <h2 className="text-xl font-semibold text-white mb-4">Statistiques</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white">123</h3>
          <p className="text-gray-300">Total Patients</p>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white">45</h3>
          <p className="text-gray-300">Nouveaux ce mois</p>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white">85%</h3>
          <p className="text-gray-300">Taux de guérison</p>
        </div>
      </div>
    </div>
  );
}
