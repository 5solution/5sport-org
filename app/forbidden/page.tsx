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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-destructive/10 via-background to-destructive/5 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this page. This area is
            restricted to administrators only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Error Code: <span className="font-mono font-medium">403</span>
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
