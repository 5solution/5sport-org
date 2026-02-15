import Link from 'next/link';
import { AthleteList } from '@/components/athletes/AthleteList';
import { Plus } from 'lucide-react';

export default async function AthletesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Athletes</h1>
          <p className="text-gray-600 mt-1">Browse and search athlete profiles</p>
        </div>
        <Link
          href={`/${locale}/admin/athletes/create`}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Profile
        </Link>
      </div>

      <AthleteList />
    </div>
  );
}
