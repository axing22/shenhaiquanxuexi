import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignInForm from "@/components/auth/signin-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (session) {
    redirect(params.callbackUrl || "/");
  }

  // 在服务器端检查环境变量
  const isGoogleEnabled = process.env.AUTH_GOOGLE_ENABLED === "true" ||
                          process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignInForm
        callbackUrl={params.callbackUrl}
        isGoogleEnabled={isGoogleEnabled}
      />
    </div>
  );
}
