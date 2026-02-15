import Link from 'next/link';
import { Trophy, Calendar, Users } from 'lucide-react';

export default async function LeaderboardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // TODO: Replace with actual API call
  // const { data } = useGetLeaderboards();

  // Mock data
  const leaderboards = [
    {
      id: '1',
      name: 'Overall Pickleball Rankings 2024',
      type: 'OVERALL',
      sportType: 'PICKLEBALL',
      isActive: true,
      entriesCount: 45,
    },
    {
      id: '2',
      name: 'February 2024 Pickleball',
      type: 'MONTHLY',
      sportType: 'PICKLEBALL',
      isActive: true,
      entriesCount: 32,
    },
    {
      id: '3',
      name: 'Overall Badminton Rankings 2024',
      type: 'OVERALL',
      sportType: 'BADMINTON',
      isActive: true,
      entriesCount: 28,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leaderboards</h1>
        <p className="text-gray-600 mt-1">View rankings and compete for the top spot</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaderboards.map((leaderboard) => (
          <Link
            key={leaderboard.id}
            href={`/${locale}/admin/leaderboards/${leaderboard.id}`}
            className="block"
          >
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white">
              <div className="flex items-start justify-between mb-4">
                <Trophy className="w-10 h-10 text-yellow-500" />
                {leaderboard.isActive && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Active
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {leaderboard.name}
              </h3>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{leaderboard.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{leaderboard.entriesCount} athletes</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  <Trophy className="w-3 h-3" />
                  {leaderboard.sportType}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
