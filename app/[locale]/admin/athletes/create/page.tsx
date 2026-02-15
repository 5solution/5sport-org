import { CreateAthleteForm } from '@/components/athletes/CreateAthleteForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function CreateAthletePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <div>
      <Link
        href={`/${locale}/admin/athletes`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Athletes
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Athlete Profile</h1>
        <p className="text-gray-600 mt-1">
          Set up your athlete profile to participate in events
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <CreateAthleteForm locale={locale} />
      </div>
    </div>
  );
}
