'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome to Machine Records</CardTitle>
            <CardDescription className="text-center">
              Please sign in to access the application and manage your records.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full" size="lg">
              <Link href="/api/auth/signin">Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // User is authenticated
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome, {session?.user?.name || "User"}!</CardTitle>
          <CardDescription className="text-center">
            You are signed in. You can now access all features of the application.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full" size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}