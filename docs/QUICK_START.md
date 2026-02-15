# 5Sport Frontend - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Backend running at `http://localhost:3000`
- Node.js installed
- pnpm installed

### Step 1: Install Dependencies (if needed)
```bash
cd /Users/anhnd/Documents/5bib/5sport/5sport-fe
pnpm install
```

### Step 2: Start Backend
```bash
# In another terminal
cd /Users/anhnd/Documents/5bib/5sport/5sport-backend
npm run start:dev
```

Wait for backend to start at `http://localhost:3000`

### Step 3: Generate API Client
```bash
cd /Users/anhnd/Documents/5bib/5sport/5sport-fe
pnpm run generate:api
```

This will:
- Read Swagger from `http://localhost:3000/swagger/json`
- Generate TypeScript types in `lib/schemas/`
- Generate React Query hooks in `lib/services/`

### Step 4: Start Frontend
```bash
pnpm run dev
```

Frontend will be at `http://localhost:3001`

### Step 5: Login and Test
1. Go to `http://localhost:3001/login`
2. Login with:
   - Email: `user@example.com`
   - Password: `examplepass`
3. Navigate to Athletes: `http://localhost:3001/en/athletes`
4. Try creating an athlete profile
5. View leaderboards: `http://localhost:3001/en/leaderboards`

## 📂 New Pages Available

After implementation, these pages are ready:

### Public Pages
- `/en/athletes` - Athlete directory
- `/en/athletes/create` - Create athlete profile
- `/en/athletes/[id]` - Athlete profile
- `/en/leaderboards` - All leaderboards
- `/en/leaderboards/[id]` - Single leaderboard

### Vietnamese
- `/vi/athletes` - Danh sách vận động viên
- `/vi/leaderboards` - Bảng xếp hạng

## 🔧 Updating Components with Real API

After running `pnpm run generate:api`, update the components:

### Example: AthleteList.tsx
**Before:**
```typescript
const [athletes, setAthletes] = useState<any[]>([]);
// TODO: Replace with actual API call
```

**After:**
```typescript
import { useAthletesControllerFindAll } from '@/lib/services/athletes';

const { data, isLoading } = useAthletesControllerFindAll({
  sportType,
  search,
  page: 1,
  limit: 20,
});

const athletes = data?.data || [];
```

### Example: CreateAthleteForm.tsx
**Before:**
```typescript
// TODO: Replace with actual API call
console.log('Creating athlete:', formData);
```

**After:**
```typescript
import { useAthletesControllerCreate } from '@/lib/services/athletes';

const createMutation = useAthletesControllerCreate();

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  await createMutation.mutateAsync({ data: formData });
  router.push(`/${locale}/athletes`);
};
```

## 🎨 What's Implemented

### Athlete Features ✅
- Athlete list with search and filters
- Athlete profile page with stats
- Create athlete form
- Responsive cards
- Sport type badges
- Rating display
- Win/loss records

### Leaderboard Features ✅
- Leaderboard list
- Single leaderboard view with rankings
- Rank change indicators
- Medal icons for top 3
- Win rate badges
- Athlete links

## 🧪 Quick Test

After starting the frontend:

1. **Test Athlete List:**
   ```
   http://localhost:3001/en/athletes
   ```
   - Should see search bar and filters
   - Should see "No athletes found" (until you create some)

2. **Test Create Athlete:**
   ```
   http://localhost:3001/en/athletes/create
   ```
   - Fill the form
   - Click "Create Profile"
   - Should redirect to athletes list

3. **Test Leaderboards:**
   ```
   http://localhost:3001/en/leaderboards
   ```
   - Should see leaderboard cards
   - Click a leaderboard
   - Should see rankings table

## 🐛 Troubleshooting

### "Cannot find module '@/lib/services/athletes'"
**Solution:** Run `pnpm run generate:api` first

### Backend not accessible
**Solution:** Make sure backend is running on port 3000
```bash
cd 5sport-backend
npm run start:dev
```

### 401 Unauthorized errors
**Solution:** Make sure you're logged in. Token is stored in localStorage.

### Swagger not found
**Solution:** Check backend Swagger is available at `http://localhost:3000/api`

## 📝 API Hook Names

After generation, you'll have hooks like:

**Athletes:**
- `useAthletesControllerFindAll()` - List athletes
- `useAthletesControllerFindOne()` - Get one athlete
- `useAthletesControllerCreate()` - Create athlete
- `useAthletesControllerUpdate()` - Update athlete
- `useAthletesControllerRemove()` - Delete athlete

**Leaderboards:**
- `useLeaderboardsControllerFindAll()` - List leaderboards
- `useLeaderboardsControllerFindOne()` - Get leaderboard
- `useLeaderboardsControllerCreate()` - Create leaderboard

**Matches:**
- `useMatchesControllerFindAll()` - List matches
- `useMatchesControllerCreate()` - Create match
- `useMatchesControllerUpdateScore()` - Update score

## 🎯 Next Steps

1. ✅ Generate API client
2. ✅ Update components with real API calls
3. ✅ Test all pages
4. ⏳ Add navigation links to main layout
5. ⏳ Add i18n translations
6. ⏳ Implement match pages (optional)
7. ⏳ Implement participant pages (optional)
8. ⏳ Deploy to production

## 📚 Documentation

- **Implementation Plan:** `/docs/FRONTEND_IMPLEMENTATION_PLAN.md`
- **Complete Guide:** `/docs/IMPLEMENTATION_COMPLETE.md`
- **This Quick Start:** `/docs/QUICK_START.md`

---

**You're all set!** The frontend is ready to connect to the backend API. Just run the commands above and start testing! 🎉
