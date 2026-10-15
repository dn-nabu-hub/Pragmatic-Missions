/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Database, Users, Target, Euro } from 'lucide-react';

interface KpiCardsProps {
  totalRecords: number;
  distinctPlayers: number;
  distinctMissions: number;
  totalPrizeEur: number;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  totalRecords,
  distinctPlayers,
  distinctMissions,
  totalPrizeEur,
}) => {
  const cards = [
    {
      label: 'Total Records',
      value: totalRecords.toLocaleString(),
      icon: Database,
    },
    {
      label: 'Players',
      value: distinctPlayers.toLocaleString(),
      icon: Users,
    },
    {
      label: 'Missions',
      value: distinctMissions.toLocaleString(),
      icon: Target,
    },
    {
      label: 'Total Prizes (EUR)',
      value: `€${totalPrizeEur.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: Euro,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-colors"
          >
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                {card.label}
              </p>
              <p className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5 tracking-tight">
                {card.value}
              </p>
            </div>
            <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-[#084968] shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
