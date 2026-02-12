'use client';

import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function AdminNotFound() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">Page not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/admin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
