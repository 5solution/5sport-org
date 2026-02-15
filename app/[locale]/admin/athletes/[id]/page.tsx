'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Calendar, Trophy, Target, TrendingUp, Award, Edit } from 'lucide-react';

export default function AthleteProfilePage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const athleteId = params?.id as string;

  // TODO: Replace with actual API call
  // const { data: athlete, isLoading } = useGetAthleteById(athleteId);

  // Mock data
  const athlete = {
    id: athleteId,
    name: 'John Doe',
    sportType: 'PICKLEBALL',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
    phoneNumber: '+84 901 234 567',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    bio: 'Professional pickleball player with 5 years of experience',
    currentRating: 4.5,
    peakRating: 4.8,
    totalMatches: 42,
    wins: 28,
    losses: 14,
    winRate: 66.67,
    totalEvents: 15,
    achievements: ['2024 City Champion', 'Best Newcomer 2023'],
    isVerified: true,
  };

  return (
    <div>
      <Link
        href={`/${locale}/admin/athletes`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Athletes
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-blue-600">
                {athlete.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{athlete.name}</h1>
                  {athlete.isVerified && (
                    <span className="bg-white text-blue-600 px-2 py-1 rounded text-sm font-medium">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-blue-100 mb-2">
                  <Trophy className="w-5 h-5" />
                  <span className="text-lg">{athlete.sportType}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <MapPin className="w-4 h-4" />
                  <span>{athlete.city}, {athlete.country}</span>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50">
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-gray-50 border-b">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-yellow-600 mb-2">
              <Target className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{athlete.currentRating}</div>
            <div className="text-sm text-gray-600">Current Rating</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{athlete.winRate.toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{athlete.totalMatches}</div>
            <div className="text-sm text-gray-600">Matches Played</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{athlete.totalEvents}</div>
            <div className="text-sm text-gray-600">Events</div>
          </div>
        </div>

        {/* Details */}
        <div className="p-8 grid md:grid-cols-2 gap-8">
          {/* Bio */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bio</h2>
            <p className="text-gray-600 leading-relaxed">{athlete.bio}</p>
          </div>

          {/* Details */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Details</h2>
            <dl className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <dt className="text-gray-600 w-24">Phone:</dt>
                <dd className="text-gray-900">{athlete.phoneNumber}</dd>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <dt className="text-gray-600 w-24">Born:</dt>
                <dd className="text-gray-900">
                  {new Date(athlete.dateOfBirth).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-gray-400 mt-1" />
                <dt className="text-gray-600 w-24">Record:</dt>
                <dd className="text-gray-900">{athlete.wins}W - {athlete.losses}L</dd>
              </div>
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-gray-400 mt-1" />
                <dt className="text-gray-600 w-24">Peak:</dt>
                <dd className="text-gray-900">{athlete.peakRating} rating</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Achievements */}
        {athlete.achievements && athlete.achievements.length > 0 && (
          <div className="p-8 border-t">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>
            <div className="flex flex-wrap gap-3">
              {athlete.achievements.map((achievement, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-800 rounded-full text-sm font-medium"
                >
                  <Award className="w-4 h-4" />
                  {achievement}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
