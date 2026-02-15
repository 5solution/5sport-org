# Frontend Integration Guide - 5Sport New Features

## Step 1: Generate API Client from Swagger

After backend is running with the new endpoints:

```bash
cd 5sport-fe

# Start backend first (in another terminal)
cd ../5sport-backend
npm run start:dev

# Generate TypeScript API client from Swagger
pnpm run generate:api
```

This will create/update:
- `lib/api/generated.ts` - Auto-generated API client
- Type-safe functions for all endpoints
- React Query hooks

## Step 2: Verify Generated Types

Check that new types exist in `lib/api/generated.ts`:

```typescript
// Should include:
export interface Athlete { ... }
export interface AthleteStats { ... }
export interface Leaderboard { ... }
export interface LeaderboardEntry { ... }
export interface Match { ... }
export interface MatchScore { ... }
export interface EventParticipant { ... }

// And hooks like:
export const useGetAthletes = ...
export const useCreateAthlete = ...
export const useGetLeaderboards = ...
export const useGetMatches = ...
```

## Step 3: Create Page Structure

Create the following page structure:

```
app/[locale]/
├── athletes/
│   ├── page.tsx                    # Athlete directory/list
│   ├── [id]/
│   │   ├── page.tsx               # Athlete profile page
│   │   └── stats/page.tsx         # Stats & history
│   └── create/page.tsx            # Create athlete profile
│
├── leaderboards/
│   ├── page.tsx                    # All leaderboards
│   ├── [id]/page.tsx              # Single leaderboard
│   └── [sportType]/page.tsx       # Sport-specific
│
├── events/
│   └── [id]/
│       ├── register/page.tsx       # Registration form
│       ├── participants/page.tsx   # Participant list
│       ├── matches/
│       │   ├── page.tsx           # Match schedule
│       │   └── [matchId]/page.tsx # Match details
│       └── bracket/page.tsx        # Tournament bracket
│
└── admin/
    ├── athletes/
    │   ├── page.tsx               # Manage athletes
    │   └── [id]/page.tsx          # Edit athlete
    ├── leaderboards/
    │   ├── page.tsx               # Manage leaderboards
    │   └── create/page.tsx        # Create leaderboard
    └── events/
        └── [id]/
            ├── matches/
            │   ├── page.tsx        # Match management
            │   └── create/page.tsx # Create matches
            └── participants/page.tsx # Check-in, etc.
```

## Step 4: Create Reusable Components

### Athlete Components

**`components/athletes/AthleteCard.tsx`**:
```typescript
import { Athlete } from '@/lib/api/generated';

interface AthleteCardProps {
  athlete: Athlete;
  showStats?: boolean;
  onClick?: () => void;
}

export function AthleteCard({ athlete, showStats, onClick }: AthleteCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-4">
        {athlete.profileImageUrl && (
          <img
            src={athlete.profileImageUrl}
            alt={athlete.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{athlete.name}</h3>
          <p className="text-sm text-gray-600">{athlete.city}</p>
          <div className="flex gap-4 mt-2">
            <span className="text-sm">Rating: {athlete.currentRating}</span>
            {showStats && (
              <>
                <span className="text-sm">Matches: {athlete.totalMatches}</span>
                <span className="text-sm">Win Rate: {athlete.winRate}%</span>
              </>
            )}
          </div>
        </div>
        {athlete.isVerified && (
          <span className="text-blue-500">✓</span>
        )}
      </div>
    </div>
  );
}
```

**`components/athletes/AthleteList.tsx`**:
```typescript
'use client';

import { useState } from 'react';
import { useGetAthletes } from '@/lib/api/generated';
import { AthleteCard } from './AthleteCard';
import { SportType } from '@/lib/api/generated';

export function AthleteList() {
  const [sportType, setSportType] = useState<SportType | undefined>();
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useGetAthletes({
    sportType,
    search,
    page: 1,
    limit: 20,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading athletes</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search athletes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-4 py-2"
        />
        <select
          value={sportType || ''}
          onChange={(e) => setSportType(e.target.value as SportType || undefined)}
          className="border rounded px-4 py-2"
        >
          <option value="">All Sports</option>
          <option value={SportType.PICKLEBALL}>Pickleball</option>
          <option value={SportType.BADMINTON}>Badminton</option>
        </select>
      </div>

      {/* Athletes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data.map((athlete) => (
          <AthleteCard key={athlete.id} athlete={athlete} showStats />
        ))}
      </div>
    </div>
  );
}
```

### Leaderboard Components

**`components/leaderboards/LeaderboardTable.tsx`**:
```typescript
'use client';

import { useGetLeaderboardById } from '@/lib/api/generated';
import Link from 'next/link';

interface LeaderboardTableProps {
  leaderboardId: string;
}

export function LeaderboardTable({ leaderboardId }: LeaderboardTableProps) {
  const { data, isLoading } = useGetLeaderboardById(leaderboardId);

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Leaderboard not found</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{data.name}</h2>
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Rank</th>
            <th className="border px-4 py-2">Athlete</th>
            <th className="border px-4 py-2">Score</th>
            <th className="border px-4 py-2">Matches</th>
            <th className="border px-4 py-2">W-L</th>
            <th className="border px-4 py-2">Win %</th>
            <th className="border px-4 py-2">Change</th>
          </tr>
        </thead>
        <tbody>
          {data.entries?.map((entry) => {
            const change = entry.previousRank
              ? entry.previousRank - entry.rank
              : 0;

            return (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2 text-center font-bold">
                  {entry.rank}
                </td>
                <td className="border px-4 py-2">
                  <Link
                    href={`/athletes/${entry.athleteId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {entry.athlete?.name}
                  </Link>
                </td>
                <td className="border px-4 py-2 text-center">
                  {entry.score}
                </td>
                <td className="border px-4 py-2 text-center">
                  {entry.matchesPlayed}
                </td>
                <td className="border px-4 py-2 text-center">
                  {entry.wins}-{entry.losses}
                </td>
                <td className="border px-4 py-2 text-center">
                  {entry.winRate.toFixed(1)}%
                </td>
                <td className="border px-4 py-2 text-center">
                  {change > 0 && (
                    <span className="text-green-600">▲ {change}</span>
                  )}
                  {change < 0 && (
                    <span className="text-red-600">▼ {Math.abs(change)}</span>
                  )}
                  {change === 0 && <span className="text-gray-400">-</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

### Match Components

**`components/matches/MatchCard.tsx`**:
```typescript
import { Match } from '@/lib/api/generated';
import { format } from 'date-fns';

interface MatchCardProps {
  match: Match;
  onScoreUpdate?: (matchId: string) => void;
}

export function MatchCard({ match, onScoreUpdate }: MatchCardProps) {
  const isCompleted = match.status === 'COMPLETED';
  const isInProgress = match.status === 'IN_PROGRESS';

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">{match.name}</h3>
          <p className="text-sm text-gray-600">
            {match.round} • Court {match.courtNumber}
          </p>
          <p className="text-sm text-gray-500">
            {format(new Date(match.scheduledTime), 'PPp')}
          </p>
        </div>
        <div>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              isCompleted
                ? 'bg-green-100 text-green-800'
                : isInProgress
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {match.status}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {/* Team 1 */}
        <div className="flex justify-between items-center">
          <span className={match.winnerTeam === 1 ? 'font-bold' : ''}>
            {match.team1Name || 'Team 1'}
          </span>
          <span className="font-mono text-lg">
            {match.team1Score?.total || 0}
          </span>
        </div>

        {/* Team 2 */}
        <div className="flex justify-between items-center">
          <span className={match.winnerTeam === 2 ? 'font-bold' : ''}>
            {match.team2Name || 'Team 2'}
          </span>
          <span className="font-mono text-lg">
            {match.team2Score?.total || 0}
          </span>
        </div>
      </div>

      {/* Score button for officials */}
      {onScoreUpdate && isInProgress && (
        <button
          onClick={() => onScoreUpdate(match.id)}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Update Score
        </button>
      )}
    </div>
  );
}
```

**`components/matches/LiveScoreBoard.tsx`**:
```typescript
'use client';

import { useState } from 'react';
import { useUpdateMatchScore } from '@/lib/api/generated';

interface LiveScoreBoardProps {
  matchId: string;
  editable?: boolean;
}

export function LiveScoreBoard({ matchId, editable }: LiveScoreBoardProps) {
  const [setNumber, setSetNumber] = useState(1);
  const [team1Points, setTeam1Points] = useState(0);
  const [team2Points, setTeam2Points] = useState(0);

  const updateScore = useUpdateMatchScore();

  const handleSaveSet = async () => {
    const winnerTeam = team1Points > team2Points ? 1 : 2;

    await updateScore.mutateAsync({
      id: matchId,
      data: {
        setNumber,
        team1Points,
        team2Points,
        winnerTeam,
      },
    });

    // Reset for next set
    setSetNumber(setNumber + 1);
    setTeam1Points(0);
    setTeam2Points(0);
  };

  if (!editable) {
    return <div>View-only scoreboard</div>;
  }

  return (
    <div className="border rounded-lg p-6 bg-white">
      <h3 className="text-xl font-bold mb-4">Set {setNumber}</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Team 1 */}
        <div className="text-center">
          <p className="font-semibold mb-2">Team 1</p>
          <div className="text-4xl font-bold mb-2">{team1Points}</div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setTeam1Points(Math.max(0, team1Points - 1))}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              -
            </button>
            <button
              onClick={() => setTeam1Points(team1Points + 1)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              +
            </button>
          </div>
        </div>

        {/* Team 2 */}
        <div className="text-center">
          <p className="font-semibold mb-2">Team 2</p>
          <div className="text-4xl font-bold mb-2">{team2Points}</div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setTeam2Points(Math.max(0, team2Points - 1))}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              -
            </button>
            <button
              onClick={() => setTeam2Points(team2Points + 1)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveSet}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
      >
        Save Set {setNumber}
      </button>
    </div>
  );
}
```

## Step 5: Create Example Pages

### Athletes List Page

**`app/[locale]/athletes/page.tsx`**:
```typescript
import { AthleteList } from '@/components/athletes/AthleteList';

export default function AthletesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Athletes</h1>
        <a
          href="/athletes/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Profile
        </a>
      </div>
      <AthleteList />
    </div>
  );
}
```

### Leaderboard Page

**`app/[locale]/leaderboards/[id]/page.tsx`**:
```typescript
import { LeaderboardTable } from '@/components/leaderboards/LeaderboardTable';

export default function LeaderboardPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <LeaderboardTable leaderboardId={params.id} />
    </div>
  );
}
```

### Match Schedule Page

**`app/[locale]/events/[id]/matches/page.tsx`**:
```typescript
'use client';

import { useGetEventMatches } from '@/lib/api/generated';
import { MatchCard } from '@/components/matches/MatchCard';

export default function MatchesPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useGetEventMatches(params.id);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Match Schedule</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
```

## Step 6: Add i18n Translations

Update `locales/en/index.ts` and `locales/vi/index.ts`:

```typescript
export default {
  athletes: {
    title: 'Athletes',
    createProfile: 'Create Profile',
    searchPlaceholder: 'Search athletes...',
    rating: 'Rating',
    matches: 'Matches',
    winRate: 'Win Rate',
  },
  leaderboards: {
    title: 'Leaderboards',
    rank: 'Rank',
    athlete: 'Athlete',
    score: 'Score',
    change: 'Change',
  },
  matches: {
    title: 'Matches',
    schedule: 'Schedule',
    live: 'Live',
    completed: 'Completed',
    updateScore: 'Update Score',
  },
  // ... more translations
};
```

## Step 7: Testing Checklist

- [ ] Athlete list loads correctly
- [ ] Athlete creation form works
- [ ] Leaderboard displays rankings
- [ ] Match schedule shows correctly
- [ ] Score updates work (for officials)
- [ ] Participant registration works
- [ ] Mobile responsive
- [ ] i18n working for all languages
- [ ] Loading states display
- [ ] Error handling works

## Common Patterns

### Using React Query Hooks

```typescript
// List with pagination
const { data, isLoading, error } = useGetAthletes({
  page: 1,
  limit: 20,
  sportType: 'PICKLEBALL',
});

// Single item
const { data: athlete } = useGetAthleteById(athleteId);

// Mutation
const createAthlete = useCreateAthlete();
await createAthlete.mutateAsync({
  name: 'John Doe',
  sportType: 'PICKLEBALL',
});

// With query invalidation
const queryClient = useQueryClient();
const updateAthlete = useUpdateAthlete();
await updateAthlete.mutateAsync({ id, data });
queryClient.invalidateQueries(['athletes']);
```

### Error Handling

```typescript
const { data, error } = useGetAthletes();

if (error) {
  return (
    <div className="text-red-600">
      Error: {error.message}
    </div>
  );
}
```

## Next Steps

1. ✅ Run `pnpm run generate:api`
2. ✅ Create component library
3. ✅ Build page by page
4. ✅ Add i18n translations
5. ✅ Test thoroughly
6. ✅ Deploy!

## Support

Following `.agents/skills/vercel-react-best-practices` for optimal performance!
