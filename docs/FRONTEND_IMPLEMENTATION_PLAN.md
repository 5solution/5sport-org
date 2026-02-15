# 5Sport Frontend Implementation Plan

## 📋 Implementation Overview

This document outlines the complete frontend implementation for Athletes, Leaderboards, and Match Management features.

**Test Credentials:**
- Email: `user@example.com`
- Password: `examplepass`

## 🎯 Features to Implement

### 1. Athlete Management
- Athlete directory/list page
- Athlete profile page with stats
- Create athlete profile form
- Search and filter functionality

### 2. Leaderboard System
- Leaderboard list page
- Single leaderboard view with rankings
- Sport-specific leaderboards
- Rank change indicators

### 3. Match Management
- Match schedule page
- Match details and live scoring
- Match status indicators
- Score update interface (for organizers)

### 4. Participant Management
- Event registration form
- Participant list
- Check-in interface (for organizers)
- My registrations page

## 📂 File Structure

```
5sport-fe/
├── app/[locale]/
│   ├── athletes/
│   │   ├── page.tsx                    # Athlete directory
│   │   ├── create/page.tsx             # Create athlete profile
│   │   └── [id]/
│   │       ├── page.tsx               # Athlete profile
│   │       └── stats/page.tsx         # Athlete stats & history
│   │
│   ├── leaderboards/
│   │   ├── page.tsx                    # All leaderboards
│   │   ├── [id]/page.tsx              # Single leaderboard view
│   │   └── [sportType]/page.tsx       # Sport-specific leaderboards
│   │
│   ├── events/[id]/
│   │   ├── register/page.tsx           # Event registration
│   │   ├── participants/page.tsx       # Participant list
│   │   ├── matches/
│   │   │   ├── page.tsx               # Match schedule
│   │   │   └── [matchId]/page.tsx     # Match details
│   │   └── bracket/page.tsx            # Tournament bracket (future)
│   │
│   └── admin/
│       ├── athletes/
│       │   └── page.tsx               # Manage athletes
│       ├── leaderboards/
│       │   ├── page.tsx               # Manage leaderboards
│       │   └── create/page.tsx        # Create leaderboard
│       └── events/[id]/
│           ├── matches/
│           │   ├── page.tsx           # Match management
│           │   └── create/page.tsx    # Create match
│           └── participants/page.tsx   # Participant management
│
├── components/
│   ├── athletes/
│   │   ├── AthleteCard.tsx
│   │   ├── AthleteList.tsx
│   │   ├── AthleteProfile.tsx
│   │   ├── AthleteStats.tsx
│   │   ├── CreateAthleteForm.tsx
│   │   └── SearchAthletes.tsx
│   │
│   ├── leaderboards/
│   │   ├── LeaderboardCard.tsx
│   │   ├── LeaderboardTable.tsx
│   │   ├── LeaderboardList.tsx
│   │   └── RankIndicator.tsx
│   │
│   ├── matches/
│   │   ├── MatchCard.tsx
│   │   ├── MatchSchedule.tsx
│   │   ├── MatchDetails.tsx
│   │   ├── LiveScoreBoard.tsx
│   │   ├── ScoreUpdateForm.tsx
│   │   └── MatchStatusBadge.tsx
│   │
│   └── participants/
│       ├── ParticipantCard.tsx
│       ├── ParticipantList.tsx
│       ├── RegistrationForm.tsx
│       └── CheckInInterface.tsx
│
├── hooks/
│   ├── useAthletes.ts
│   ├── useLeaderboards.ts
│   ├── useMatches.ts
│   └── useParticipants.ts
│
└── locales/
    ├── en/
    │   ├── athletes.ts
    │   ├── leaderboards.ts
    │   ├── matches.ts
    │   └── participants.ts
    └── vi/
        ├── athletes.ts
        ├── leaderboards.ts
        ├── matches.ts
        └── participants.ts
```

## 🔄 Implementation Steps

### Phase 1: Setup & API Generation ✅
1. Generate API client from backend Swagger
2. Verify generated types and hooks
3. Test API connectivity with login

### Phase 2: Component Library (Session 1)
1. Create base components:
   - AthleteCard
   - LeaderboardTable
   - MatchCard
   - ParticipantCard

2. Create form components:
   - CreateAthleteForm
   - RegistrationForm
   - ScoreUpdateForm

3. Create utility components:
   - SearchAthletes
   - RankIndicator
   - MatchStatusBadge

### Phase 3: Athlete Pages (Session 2)
1. Athlete list page with filters
2. Athlete profile page
3. Create athlete form
4. Athlete stats page

### Phase 4: Leaderboard Pages (Session 3)
1. Leaderboard list page
2. Single leaderboard view
3. Sport-specific leaderboards

### Phase 5: Match Pages (Session 4)
1. Match schedule page
2. Match details page
3. Live scoring interface

### Phase 6: Participant Pages (Session 5)
1. Event registration form
2. Participant list
3. Check-in interface

### Phase 7: Admin Pages (Session 6)
1. Athlete management
2. Leaderboard creation
3. Match management
4. Participant management

### Phase 8: i18n & Polish (Session 7)
1. Add English translations
2. Add Vietnamese translations
3. Mobile responsive testing
4. Error handling
5. Loading states

## 🎨 Design Patterns

### Component Structure
```typescript
// Page Component (Server Component)
export default async function AthletesPage() {
  return (
    <div>
      <h1>Athletes</h1>
      <AthleteList /> {/* Client Component */}
    </div>
  );
}

// Client Component
'use client';
export function AthleteList() {
  const { data, isLoading } = useGetAthletes();
  // ... render logic
}
```

### Hook Pattern
```typescript
// Custom hook wrapping generated hook
export function useAthleteList(filters?: AthleteQueryDto) {
  const { data, isLoading, error } = useGetAthletes(filters);
  
  return {
    athletes: data?.data || [],
    total: data?.meta?.total || 0,
    isLoading,
    error,
  };
}
```

### Form Pattern
```typescript
// Form with validation
export function CreateAthleteForm() {
  const [formData, setFormData] = useState({});
  const createMutation = useCreateAthlete();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## 🔐 Authentication Flow

1. User logs in with credentials
2. JWT token stored in localStorage/cookies
3. Token added to API requests via axios interceptor
4. Protected routes check for token
5. Admin routes check for admin role

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Grid layouts: 1 column (mobile), 2 columns (tablet), 3-4 columns (desktop)
- Touch-friendly buttons and inputs on mobile

## 🎨 UI Components

### Color Scheme
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Gray scale for backgrounds and text

### Typography
- Headings: Font-bold, larger sizes
- Body: Font-normal, readable sizes
- Code/Numbers: Font-mono

### Spacing
- Consistent padding: 4, 8, 12, 16, 24, 32px
- Consistent margins: 4, 8, 16, 24px
- Gap between items: 4, 8, 16px

## 🧪 Testing Checklist

### Athlete Features
- [ ] Can create athlete profile
- [ ] Athlete list loads and displays
- [ ] Search athletes works
- [ ] Filter by sport type works
- [ ] Athlete profile shows stats
- [ ] Can update athlete profile
- [ ] Ownership validation works

### Leaderboard Features
- [ ] Leaderboard list loads
- [ ] Single leaderboard shows rankings
- [ ] Rank changes display correctly
- [ ] Sport filter works
- [ ] Pagination works

### Match Features
- [ ] Match schedule displays
- [ ] Match details show correctly
- [ ] Can start match (organizer)
- [ ] Can update scores (organizer)
- [ ] Can end match (organizer)
- [ ] Match status updates

### Participant Features
- [ ] Can register for event
- [ ] Registration form validates
- [ ] Participant list displays
- [ ] Can check-in (organizer)
- [ ] Can withdraw registration

### General
- [ ] Mobile responsive
- [ ] i18n works (EN/VI)
- [ ] Loading states display
- [ ] Error messages show
- [ ] Protected routes work
- [ ] Role-based access works

## 📊 Performance Optimization

1. **Code Splitting**: Dynamic imports for heavy components
2. **Image Optimization**: Next.js Image component
3. **Lazy Loading**: Pagination for large lists
4. **Caching**: React Query cache configuration
5. **Memoization**: useMemo and useCallback where needed

## 🔧 Configuration

### API Client Setup
```typescript
// lib/api/axios-instance.ts
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### React Query Setup
```typescript
// app/providers.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});
```

## 🌍 i18n Keys

### Athletes
- `athletes.title` - "Athletes"
- `athletes.create` - "Create Profile"
- `athletes.search` - "Search athletes..."
- `athletes.rating` - "Rating"
- `athletes.matches` - "Matches"
- `athletes.winRate` - "Win Rate"

### Leaderboards
- `leaderboards.title` - "Leaderboards"
- `leaderboards.rank` - "Rank"
- `leaderboards.score` - "Score"
- `leaderboards.change` - "Change"

### Matches
- `matches.title` - "Matches"
- `matches.schedule` - "Schedule"
- `matches.live` - "Live"
- `matches.completed` - "Completed"
- `matches.updateScore` - "Update Score"

## 📝 Implementation Notes

1. **Use generated API hooks** from `lib/api/generated.ts`
2. **Follow existing patterns** from event pages
3. **Keep components small** and focused
4. **Use TypeScript strict mode**
5. **Add proper error boundaries**
6. **Handle loading states gracefully**
7. **Show user-friendly error messages**

## 🚀 Deployment Checklist

- [ ] All features tested locally
- [ ] Mobile responsive verified
- [ ] i18n translations complete
- [ ] Error handling tested
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors
- [ ] Environment variables set
- [ ] API endpoints configured
- [ ] Authentication works
- [ ] Deploy to staging
- [ ] Test on staging
- [ ] Deploy to production

## 📚 Resources

- Next.js 14 Docs: https://nextjs.org/docs
- React Query Docs: https://tanstack.com/query/latest
- Tailwind CSS: https://tailwindcss.com/docs
- i18next: https://react.i18next.com/

---

**Implementation Start Date**: February 14, 2026  
**Estimated Completion**: 2-3 days (8-12 hours total)  
**Status**: Ready to implement  
**Test Account**: user@example.com / examplepass
