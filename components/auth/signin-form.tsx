"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";

export default function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const isGoogleEnabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: callbackUrl || "/" });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isGoogleEnabled && (
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>
        )}
        
        {!isGoogleEnabled && (
          <p className="text-center text-sm text-muted-foreground">
            Google sign-in is currently disabled
          </p>
        )}
      </CardContent>
    </Card>
  );
}
