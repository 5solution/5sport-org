'use client';

import Link from 'next/link';
import { ShieldX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-destructive/10 via-background to-destructive/5 p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader className="space-y-4 pb-2">
          <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" />
          </div>
          <CardTitle className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Access Denied</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            You don&apos;t have permission to access this page. This area is
            restricted to administrators only.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Error Code: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">403</code>
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-6 pb-6">
          <Button variant="outline" asChild className="w-full sm:w-auto h-10 sm:h-11">
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild className="w-full sm:w-auto h-10 sm:h-11 font-semibold">
            <Link href="/login">Sign In</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
