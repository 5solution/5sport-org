'use client';

import Link from 'next/link';
import { User, MapPin, Trophy, Target, TrendingUp } from 'lucide-react';

interface AthleteCardProps {
  athlete: any; // Will be typed when API is generated
  showStats?: boolean;
  locale?: string;
}

export function AthleteCard({ athlete, showStats = false, locale = 'en' }: AthleteCardProps) {
  return (
    <Link href={`/${locale}/athletes/${athlete.id}`}>
      <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {athlete.profileImageUrl ? (
              <img
                src={athlete.profileImageUrl}
                alt={athlete.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {athlete.name}
              </h3>
              {athlete.isVerified && (
                <span className="text-blue-500" title="Verified Athlete">
                  ✓
                </span>
              )}
            </div>

            {athlete.city && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{athlete.city}</span>
              </div>
            )}

            {/* Sport Badge */}
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mb-3">
              <Trophy className="w-3 h-3" />
              {athlete.sportType}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Rating</span>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-gray-900">
                    {athlete.currentRating?.toFixed(1) || '0.0'}
                  </span>
                </div>
              </div>

              {showStats && (
                <>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Matches</span>
                    <span className="font-semibold text-gray-900">
                      {athlete.totalMatches || 0}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">W-L</span>
                    <span className="font-semibold text-gray-900">
                      {athlete.wins || 0}-{athlete.losses || 0}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Win Rate</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-gray-900">
                        {athlete.winRate?.toFixed(0) || '0'}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
