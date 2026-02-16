'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { TrendingUp, TrendingDown, Medal, Trophy, Target } from 'lucide-react';

interface LeaderboardTableProps {
  leaderboardId: string;
  locale?: string;
}

export function LeaderboardTable({ leaderboardId, locale = 'en' }: LeaderboardTableProps) {
  const t = useTranslations('admin.leaderboards');
  const tCommon = useTranslations('common');

  // TODO: Replace with actual API call
  // const { data, isLoading } = useGetLeaderboardById(leaderboardId);

  // Mock data
  const leaderboard = {
    id: leaderboardId,
    name: 'Overall Pickleball Rankings 2024',
    sportType: 'PICKLEBALL',
    type: 'OVERALL',
    entries: [
      {
        id: '1',
        rank: 1,
        previousRank: 3,
        athlete: { id: 'a1', name: 'John Doe', city: 'HCMC' },
        score: 1500,
        matchesPlayed: 25,
        wins: 20,
        losses: 5,
        winRate: 80,
      },
      {
        id: '2',
        rank: 2,
        previousRank: 1,
        athlete: { id: 'a2', name: 'Jane Smith', city: 'Hanoi' },
        score: 1450,
        matchesPlayed: 22,
        wins: 17,
        losses: 5,
        winRate: 77.27,
      },
      {
        id: '3',
        rank: 3,
        previousRank: 2,
        athlete: { id: 'a3', name: 'Bob Wilson', city: 'Da Nang' },
        score: 1420,
        matchesPlayed: 20,
        wins: 15,
        losses: 5,
        winRate: 75,
      },
    ],
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getRankChange = (rank: number, previousRank: number | null) => {
    if (!previousRank) return null;
    const change = previousRank - rank;
    if (change > 0) {
      return (
        <span className="flex items-center gap-1 text-green-600 text-sm">
          <TrendingUp className="w-4 h-4" />
          +{change}
        </span>
      );
    }
    if (change < 0) {
      return (
        <span className="flex items-center gap-1 text-red-600 text-sm">
          <TrendingDown className="w-4 h-4" />
          {change}
        </span>
      );
    }
    return <span className="text-gray-400 text-sm">-</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8" />
          <h2 className="text-2xl font-bold">{leaderboard.name}</h2>
        </div>
        <div className="flex items-center gap-4 text-blue-100">
          <span>{leaderboard.sportType}</span>
          <span>•</span>
          <span>{leaderboard.type}</span>
          <span>•</span>
          <span>{leaderboard.entries.length} {t('athletes')}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('columns.rank')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('columns.athlete')}
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('columns.score')}
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('columns.matches')}
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('columns.winLoss')}
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('columns.winPercent')}
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('columns.change')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaderboard.entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {getRankIcon(entry.rank)}
                    <span className="text-2xl font-bold text-gray-900">
                      {entry.rank}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/${locale}/athletes/${entry.athlete.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {entry.athlete.name}
                  </Link>
                  <div className="text-sm text-gray-500">{entry.athlete.city}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-lg font-semibold text-gray-900">
                      {entry.score}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-gray-900">
                  {entry.matchesPlayed}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-green-600 font-medium">{entry.wins}</span>
                  <span className="text-gray-400 mx-1">-</span>
                  <span className="text-red-600 font-medium">{entry.losses}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {entry.winRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getRankChange(entry.rank, entry.previousRank)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
