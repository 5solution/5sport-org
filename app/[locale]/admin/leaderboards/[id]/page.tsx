import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LeaderboardTable } from '@/components/leaderboards/LeaderboardTable';

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  
  return (
    <div>
      <Link
        href={`/${locale}/admin/leaderboards`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Leaderboards
      </Link>

      <LeaderboardTable leaderboardId={id} locale={locale} />
    </div>
  );
}
